/* VioLens SAZ and HAR viewer: opens a Fiddler .saz or a .har file in the
   browser, and saves either as HAR. Everything happens on the visitor's computer: the file is read
   with the File API, unzipped and decompressed with the browser's own
   DecompressionStream, and nothing is sent anywhere. The parsing follows the
   VioLens app's SazReader and HarWriter (Violens.ProxyCore/Sessions).

   Everything that comes from the file is put on the page with textContent,
   never as HTML, so a captured page or header can't run script here. */
(function () {
  'use strict';

  var MAX_ENTRY_BYTES = 256 * 1024 * 1024;   // one file inside the archive
  var MAX_TOTAL_BYTES = 1024 * 1024 * 1024;  // everything read from one archive
  var MAX_HAR_BYTES = 256 * 1024 * 1024;
  var MAX_TEXT_SHOWN = 2 * 1024 * 1024;
  var MAX_HEX_SHOWN = 64 * 1024;

  // ---------------------------------------------------------------- errors

  function SazError(message) { this.message = message; }
  SazError.prototype = Object.create(Error.prototype);
  SazError.prototype.name = 'SazError';

  // ---------------------------------------------------------- decompression

  var formatSupport = {};
  function supports(format) {
    if (!(format in formatSupport)) {
      try { new DecompressionStream(format); formatSupport[format] = true; }
      catch (e) { formatSupport[format] = false; }
    }
    return formatSupport[format];
  }

  // Decompresses bytes with DecompressionStream, stopping once the output
  // passes limit, so a small zip bomb can't fill the tab's memory.
  async function decompress(bytes, format, limit) {
    var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format));
    var reader = stream.getReader();
    var chunks = [];
    var total = 0;
    for (;;) {
      var step = await reader.read();
      if (step.done) break;
      total += step.value.length;
      if (total > limit) {
        try { await reader.cancel(); } catch (e) { /* already failed */ }
        throw new SazError('it expands to more than ' + Math.round(limit / 1048576) + ' MB');
      }
      chunks.push(step.value);
    }
    return concat(chunks, total);
  }

  function concat(chunks, total) {
    var out = new Uint8Array(total);
    var at = 0;
    for (var i = 0; i < chunks.length; i++) { out.set(chunks[i], at); at += chunks[i].length; }
    return out;
  }

  // ------------------------------------------------------------------- zip

  function u16(view, at) { return view.getUint16(at, true); }
  function u32(view, at) { return view.getUint32(at, true); }
  function u64(view, at) { return u32(view, at) + u32(view, at + 4) * 4294967296; }

  // Reads a zip's central directory. Returns a Map of name -> entry.
  function readZipDirectory(bytes) {
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var end = -1;
    for (var i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
      if (u32(view, i) === 0x06054b50) { end = i; break; }
    }
    if (end < 0) throw new SazError("This isn't a SAZ or HAR file.");

    var count = u16(view, end + 10);
    var dirSize = u32(view, end + 12);
    var dirOffset = u32(view, end + 16);
    if (count === 0xffff || dirSize === 0xffffffff || dirOffset === 0xffffffff) {
      var locator = end - 20;
      if (locator >= 0 && u32(view, locator) === 0x07064b50) {
        var end64 = u64(view, locator + 8);
        if (end64 + 56 <= bytes.length && u32(view, end64) === 0x06064b50) {
          count = u64(view, end64 + 32);
          dirSize = u64(view, end64 + 40);
          dirOffset = u64(view, end64 + 48);
        }
      }
    }
    if (dirOffset + dirSize > bytes.length) throw new SazError('The file is cut short or damaged.');

    var utf8 = new TextDecoder('utf-8');
    var entries = new Map();
    var at = dirOffset;
    for (var n = 0; n < count && at + 46 <= bytes.length; n++) {
      if (u32(view, at) !== 0x02014b50) break;
      var flags = u16(view, at + 8);
      var entry = {
        encrypted: (flags & 1) !== 0,
        method: u16(view, at + 10),
        compressedSize: u32(view, at + 20),
        size: u32(view, at + 24),
        offset: u32(view, at + 42)
      };
      var nameLength = u16(view, at + 28);
      var extraLength = u16(view, at + 30);
      var commentLength = u16(view, at + 32);
      var name = utf8.decode(bytes.subarray(at + 46, at + 46 + nameLength));

      // Zip64 sizes and offset live in extra field 0x0001, in this order, for
      // whichever of them didn't fit in 32 bits.
      var extra = at + 46 + nameLength;
      var extraEnd = extra + extraLength;
      while (extra + 4 <= extraEnd) {
        var id = u16(view, extra);
        var length = u16(view, extra + 2);
        if (id === 0x0001) {
          var field = extra + 4;
          if (entry.size === 0xffffffff) { entry.size = u64(view, field); field += 8; }
          if (entry.compressedSize === 0xffffffff) { entry.compressedSize = u64(view, field); field += 8; }
          if (entry.offset === 0xffffffff) { entry.offset = u64(view, field); }
        }
        extra += 4 + length;
      }

      entries.set(name.replace(/\\/g, '/'), entry);
      at = extraEnd + commentLength;
    }
    return entries;
  }

  async function readZipEntry(bytes, entry, budget) {
    if (entry.encrypted) {
      throw new SazError('This SAZ file is password-protected, and the viewer can\'t open those. Save it again from Fiddler without a password.');
    }
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (entry.offset + 30 > bytes.length || u32(view, entry.offset) !== 0x04034b50) {
      throw new SazError('The file is damaged.');
    }
    var start = entry.offset + 30 + u16(view, entry.offset + 26) + u16(view, entry.offset + 28);
    var data = bytes.subarray(start, start + entry.compressedSize);
    var limit = Math.min(MAX_ENTRY_BYTES, budget.left);
    var out;
    if (entry.method === 0) {
      if (data.length > limit) throw new SazError('too large to open here');
      out = data;
    } else if (entry.method === 8) {
      out = await decompress(data, 'deflate-raw', limit);
    } else {
      throw new SazError('it uses a zip compression method (' + entry.method + ') the viewer can\'t read');
    }
    budget.left -= out.length;
    return out;
  }

  // ------------------------------------------------------------------ HTTP

  var utf8Decoder = new TextDecoder('utf-8');

  function indexOfBytes(bytes, pattern, from) {
    outer:
    for (var i = from || 0; i <= bytes.length - pattern.length; i++) {
      for (var j = 0; j < pattern.length; j++) {
        if (bytes[i + j] !== pattern[j]) continue outer;
      }
      return i;
    }
    return -1;
  }

  function header(headers, name) {
    var lower = name.toLowerCase();
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].name.toLowerCase() === lower) return headers[i].value;
    }
    return null;
  }

  // Splits an HTTP/1.x message as Fiddler saves it into its first line,
  // headers and body. The body is framed by Content-Length or chunked
  // encoding when the headers say so, and otherwise runs to the end.
  function parseMessage(bytes) {
    var split = indexOfBytes(bytes, [13, 10, 13, 10], 0);
    var gap = 4;
    if (split < 0) {
      split = indexOfBytes(bytes, [10, 10], 0);
      gap = 2;
    }
    if (split < 0) { split = bytes.length; gap = 0; }

    var lines = utf8Decoder.decode(bytes.subarray(0, split)).split(/\r?\n/);
    var firstLine = lines.shift() || '';
    var headers = [];
    var pseudo = {};
    lines.forEach(function (line) {
      if (!line) return;
      if ((line[0] === ' ' || line[0] === '\t') && headers.length) {
        headers[headers.length - 1].value += ' ' + line.trim();
        return;
      }
      // HTTP/2 pseudo-headers other tools write as ":authority: example.com".
      if (line[0] === ':') {
        var second = line.indexOf(':', 1);
        if (second > 1) pseudo[line.slice(0, second).trim().toLowerCase()] = line.slice(second + 1).trim();
        return;
      }
      var colon = line.indexOf(':');
      if (colon > 0) headers.push({ name: line.slice(0, colon).trim(), value: line.slice(colon + 1).trim() });
    });

    var rest = bytes.subarray(Math.min(bytes.length, split + gap));
    var body = rest;
    var chunked = false;
    var transfer = header(headers, 'Transfer-Encoding');
    if (transfer && /chunked/i.test(transfer)) {
      var unchunked = dechunk(rest);
      if (unchunked) { body = unchunked; chunked = true; }
    } else {
      var length = parseInt(header(headers, 'Content-Length'), 10);
      if (length >= 0 && length <= rest.length) body = rest.subarray(0, length);
    }
    return { firstLine: firstLine, headers: headers, pseudo: pseudo, body: body, chunked: chunked };
  }

  // Undoes chunked transfer encoding; null if the body isn't chunked after all.
  function dechunk(bytes) {
    var chunks = [];
    var total = 0;
    var at = 0;
    for (;;) {
      var lineEnd = indexOfBytes(bytes, [13, 10], at);
      if (lineEnd < 0) return chunks.length ? concat(chunks, total) : null;
      var sizeText = utf8Decoder.decode(bytes.subarray(at, lineEnd)).split(';')[0].trim();
      if (!/^[0-9a-f]+$/i.test(sizeText)) return null;
      var size = parseInt(sizeText, 16);
      at = lineEnd + 2;
      if (size === 0) return concat(chunks, total);
      if (at + size > bytes.length) return null;
      chunks.push(bytes.subarray(at, at + size));
      total += size;
      at += size + 2;
    }
  }

  // Undoes Content-Encoding. Returns { bytes, note }: bytes is null when the
  // body can't be decoded here, and note says why.
  async function decodeBody(body, headers) {
    var encoding = header(headers, 'Content-Encoding');
    if (!encoding || !body.length) return { bytes: body, note: null };
    var codings = encoding.toLowerCase().split(',').map(function (c) { return c.trim(); }).filter(Boolean).reverse();
    var bytes = body;
    for (var i = 0; i < codings.length; i++) {
      var coding = codings[i];
      try {
        if (coding === 'identity') continue;
        if (coding === 'gzip' || coding === 'x-gzip') bytes = await decompress(bytes, 'gzip', MAX_ENTRY_BYTES);
        else if (coding === 'deflate') {
          try { bytes = await decompress(bytes, 'deflate', MAX_ENTRY_BYTES); }
          catch (e) { bytes = await decompress(bytes, 'deflate-raw', MAX_ENTRY_BYTES); }
        } else if (coding === 'br' && supports('brotli')) bytes = await decompress(bytes, 'brotli', MAX_ENTRY_BYTES);
        else if (coding === 'zstd' && supports('zstd')) bytes = await decompress(bytes, 'zstd', MAX_ENTRY_BYTES);
        else return { bytes: null, note: 'This browser can\'t decompress ' + coding + ', so the body is shown as it was saved.' };
      } catch (e) {
        return { bytes: null, note: 'The ' + coding + ' body couldn\'t be decompressed, so it\'s shown as it was saved.' };
      }
    }
    return { bytes: bytes, note: null };
  }

  function mediaType(contentType) {
    return (contentType || '').split(';')[0].trim().toLowerCase();
  }

  function charset(contentType) {
    var match = /charset\s*=\s*"?([^";\s]+)/i.exec(contentType || '');
    return match ? match[1] : 'utf-8';
  }

  // Same list as the app's HarWriter.IsText.
  function isText(contentType) {
    var type = mediaType(contentType);
    return type.indexOf('text/') === 0 || /\+(json|xml)$/.test(type) ||
      ['application/json', 'application/xml', 'application/javascript', 'application/x-javascript',
        'application/ecmascript', 'application/x-www-form-urlencoded', 'application/graphql',
        'image/svg+xml'].indexOf(type) >= 0;
  }

  function decodeText(bytes, contentType) {
    try { return new TextDecoder(charset(contentType)).decode(bytes); }
    catch (e) { return utf8Decoder.decode(bytes); }
  }

  // ---------------------------------------------------------------- _m.xml

  var xmlEntities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  function unescapeXml(text) {
    return text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, function (all, name) {
      if (name[0] === '#') {
        var code = name[1] === 'x' || name[1] === 'X' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
        try { return String.fromCodePoint(code); } catch (e) { return all; }
      }
      return xmlEntities[name.toLowerCase()];
    });
  }

  function attributes(text) {
    var out = {};
    var re = /([\w:.-]+)\s*=\s*"([^"]*)"/g;
    var match;
    while ((match = re.exec(text))) out[match[1]] = unescapeXml(match[2]);
    return out;
  }

  function readMetadata(text) {
    var timersMatch = /<SessionTimers\b([^>]*)>/.exec(text);
    var timers = timersMatch ? attributes(timersMatch[1]) : {};
    var flags = {};
    var re = /<SessionFlag\b([^>]*)>/g;
    var match;
    while ((match = re.exec(text))) {
      var flag = attributes(match[1]);
      if (flag.N && !(flag.N.toLowerCase() in flags)) flags[flag.N.toLowerCase()] = flag.V || '';
    }
    return { timers: timers, flags: flags };
  }

  // Fiddler writes 7 fractional digits; Date only needs 3. Times before 1971
  // (Fiddler's 0001-01-01 for "never") count as missing.
  function parseTime(text) {
    if (!text) return null;
    var time = Date.parse(text.replace(/(\.\d{3})\d+/, '$1'));
    if (isNaN(time) || new Date(time).getUTCFullYear() < 1971) return null;
    return time;
  }

  // The same mapping as the app's SazReader.TryReadTimers.
  function readTimings(timers) {
    var start = parseTime(timers.ClientBeginRequest);
    var connected = parseTime(timers.ServerConnected);
    var sent = parseTime(timers.ServerGotRequest);
    var firstByte = parseTime(timers.ServerBeginResponse);
    var done = parseTime(timers.ClientDoneResponse) || parseTime(timers.ServerDoneResponse);
    if (start === null || connected === null || sent === null || firstByte === null || done === null || done <= start) {
      return { start: start, timings: null };
    }
    function whole(name) { var v = parseFloat(timers[name]); return isNaN(v) ? 0 : v; }
    var dns = whole('DNSTime'), connect = whole('TCPConnectTime'), ssl = whole('HTTPSHandshakeTime');
    var opened = dns + connect + ssl > 0;
    return {
      start: start,
      timings: {
        blocked: Math.max(0, connected - start - (dns + connect + ssl)),
        dns: opened ? dns : -1,
        connect: opened ? connect : -1,
        ssl: opened && ssl > 0 ? ssl : -1,
        send: Math.max(0, sent - connected),
        wait: Math.max(0, firstByte - sent),
        receive: Math.max(0, done - firstByte)
      }
    };
  }

  // ---------------------------------------------------------------- sessions

  async function readSaz(bytes, onProgress) {
    var entries = readZipDirectory(bytes);
    var numbers = [];
    entries.forEach(function (entry, name) {
      var match = /^raw\/(\d+)_c\.txt$/.exec(name);
      if (match) numbers.push(parseInt(match[1], 10));
    });
    if (!numbers.length) throw new SazError('No sessions found. A SAZ file has a raw/ folder with files like raw/1_c.txt in it.');
    numbers.sort(function (a, b) { return a - b; });

    // Fiddler pads numbers to the same width (01_c.txt ... 99_c.txt), so
    // find each session's files by the exact name its _c.txt used.
    var names = {};
    entries.forEach(function (entry, name) {
      var match = /^raw\/(\d+)_c\.txt$/.exec(name);
      if (match) names[parseInt(match[1], 10)] = match[1];
    });

    var budget = { left: MAX_TOTAL_BYTES };
    var sessions = [];
    var skipped = [];
    for (var i = 0; i < numbers.length; i++) {
      var number = numbers[i];
      var id = names[number];
      try {
        sessions.push(await readSession(bytes, entries, id, number, budget));
      } catch (e) {
        if (e instanceof SazError && /password/.test(e.message)) throw e;
        skipped.push('#' + number + ': ' + (e && e.message ? e.message : e));
        if (budget.left <= 0) {
          skipped.push('The rest weren\'t read: the archive adds up to more than ' + Math.round(MAX_TOTAL_BYTES / 1048576) + ' MB.');
          break;
        }
      }
      if (onProgress && i % 25 === 0) onProgress(i + 1, numbers.length);
    }
    return { sessions: sessions, skipped: skipped };
  }

  async function readSession(bytes, entries, id, number, budget) {
    var requestEntry = entries.get('raw/' + id + '_c.txt');
    var responseEntry = entries.get('raw/' + id + '_s.txt');
    if (!responseEntry) throw new SazError('missing response file (raw/' + id + '_s.txt)');
    var metadataEntry = entries.get('raw/' + id + '_m.xml');
    var webSocketEntry = entries.get('raw/' + id + '_w.txt');

    var request = parseMessage(await readZipEntry(bytes, requestEntry, budget));
    var response = parseMessage(await readZipEntry(bytes, responseEntry, budget));
    var metadata = metadataEntry && metadataEntry.size < 1048576
      ? readMetadata(utf8Decoder.decode(await readZipEntry(bytes, metadataEntry, budget)))
      : { timers: {}, flags: {} };
    var webSocket = webSocketEntry ? await readZipEntry(bytes, webSocketEntry, budget) : null;

    var parts = request.firstLine.split(' ');
    var method = parts[0] || '';
    var target = parts[1] || '';
    var requestVersion = parts.slice(2).join(' ') || 'HTTP/1.1';
    var responseMatch = /^(\S+)\s+(\d{3})\s*(.*)$/.exec(response.firstLine);

    var hostHeader = header(request.headers, 'Host') || request.pseudo[':authority'] || '';
    var scheme = request.pseudo[':scheme'] === 'http' ? 'http' : 'https';
    var url;
    if (method.toUpperCase() === 'CONNECT') {
      url = target;
      hostHeader = hostHeader || target;
    } else if (/^https?:\/\//i.test(target)) {
      url = target;
      scheme = target.slice(0, 5).toLowerCase() === 'https' ? 'https' : 'http';
      if (!hostHeader) hostHeader = target.replace(/^https?:\/\//i, '').split('/')[0];
    } else {
      url = scheme + '://' + (hostHeader || '(unknown host)') + (target || '/');
    }

    var times = readTimings(metadata.timers);
    var requestBody = await decodeBody(request.body, request.headers);
    var responseBody = await decodeBody(response.body, response.headers);

    return {
      number: number,
      method: method,
      url: url,
      host: hostHeader.replace(/:\d+$/, '') || '(unknown host)',
      isConnect: method.toUpperCase() === 'CONNECT',
      request: {
        version: requestVersion,
        headers: request.headers,
        body: request.body,
        decoded: requestBody.bytes,
        note: requestBody.note
      },
      response: {
        version: responseMatch ? responseMatch[1] : 'HTTP/1.1',
        status: responseMatch ? parseInt(responseMatch[2], 10) : 0,
        statusText: responseMatch ? responseMatch[3] : '',
        headers: response.headers,
        body: response.body,
        decoded: responseBody.bytes,
        note: responseBody.note
      },
      startedAt: times.start,
      timings: times.timings,
      flags: metadata.flags,
      webSocket: webSocket
    };
  }

  // -------------------------------------------------------------------- HAR

  function base64(bytes) {
    var text = '';
    for (var i = 0; i < bytes.length; i += 0x8000) {
      text += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(text);
  }

  function harVersion(version) {
    var v = (version || '').toUpperCase();
    if (v === 'HTTP/2' || v === 'HTTP/2.0') return 'HTTP/2.0';
    if (v === 'HTTP/3' || v === 'HTTP/3.0') return 'HTTP/3.0';
    return v || 'HTTP/1.1';
  }

  function unescapeQuery(text) {
    try { return decodeURIComponent(text.replace(/\+/g, ' ')); } catch (e) { return text; }
  }

  function queryString(url) {
    var question = url.indexOf('?');
    if (question < 0) return [];
    var query = url.slice(question + 1).split('#')[0];
    return query.split('&').filter(Boolean).map(function (pair) {
      var equals = pair.indexOf('=');
      return {
        name: unescapeQuery(equals < 0 ? pair : pair.slice(0, equals)),
        value: equals < 0 ? '' : unescapeQuery(pair.slice(equals + 1))
      };
    });
  }

  function requestCookies(headers) {
    var out = [];
    headers.forEach(function (h) {
      if (h.name.toLowerCase() !== 'cookie') return;
      h.value.split(';').map(function (p) { return p.trim(); }).filter(Boolean).forEach(function (pair) {
        var equals = pair.indexOf('=');
        out.push({ name: equals < 0 ? '' : pair.slice(0, equals), value: equals < 0 ? pair : pair.slice(equals + 1) });
      });
    });
    return out;
  }

  function responseCookies(headers) {
    var out = [];
    headers.forEach(function (h) {
      if (h.name.toLowerCase() !== 'set-cookie') return;
      var parts = h.value.split(';').map(function (p) { return p.trim(); });
      var equals = parts[0].indexOf('=');
      var cookie = { name: equals < 0 ? '' : parts[0].slice(0, equals), value: equals < 0 ? parts[0] : parts[0].slice(equals + 1) };
      parts.slice(1).forEach(function (attribute) {
        var eq = attribute.indexOf('=');
        var name = (eq < 0 ? attribute : attribute.slice(0, eq)).toLowerCase();
        var value = eq < 0 ? '' : attribute.slice(eq + 1);
        if (name === 'path' || name === 'domain') cookie[name] = value;
        else if (name === 'expires') {
          // HAR wants ISO 8601, not the date as the header writes it.
          var expires = Date.parse(value);
          if (!isNaN(expires)) cookie.expires = new Date(expires).toISOString();
        }
        else if (name === 'httponly') cookie.httpOnly = true;
        else if (name === 'secure') cookie.secure = true;
      });
      out.push(cookie);
    });
    return out;
  }

  function harTimings(t) {
    if (!t) return { send: 0, wait: 0, receive: 0 };
    return {
      blocked: t.blocked,
      dns: t.dns,
      connect: t.connect < 0 ? -1 : t.connect + Math.max(0, t.ssl),
      ssl: t.ssl,
      send: t.send,
      wait: t.wait,
      receive: t.receive
    };
  }

  function totalTime(t) {
    if (!t) return 0;
    return t.blocked + Math.max(0, t.dns) + Math.max(0, t.connect) + Math.max(0, t.ssl) + t.send + t.wait + t.receive;
  }

  function harEntry(session) {
    var req = session.request;
    var res = session.response;
    var harRequest = {
      method: session.method,
      url: session.url,
      httpVersion: harVersion(req.version),
      cookies: requestCookies(req.headers),
      headers: req.headers.map(function (h) { return { name: h.name, value: h.value }; }),
      queryString: queryString(session.url),
      headersSize: -1,
      bodySize: req.body.length
    };
    if (req.body.length) {
      var requestType = header(req.headers, 'Content-Type') || '';
      var requestBytes = req.decoded || req.body;
      harRequest.postData = isText(requestType)
        ? { mimeType: requestType, text: decodeText(requestBytes, requestType) }
        : { mimeType: requestType, text: base64(requestBytes), encoding: 'base64' };
    }

    var responseType = header(res.headers, 'Content-Type') || '';
    var responseBytes = res.decoded || res.body;
    var content = { size: responseBytes.length, mimeType: responseType };
    if (responseBytes.length !== res.body.length) content.compression = responseBytes.length - res.body.length;
    if (responseBytes.length) {
      if (isText(responseType) && res.decoded) content.text = decodeText(responseBytes, responseType);
      else { content.text = base64(responseBytes); content.encoding = 'base64'; }
    }

    var entry = {
      startedDateTime: new Date(session.startedAt || Date.now()).toISOString(),
      time: totalTime(session.timings),
      request: harRequest,
      response: {
        status: res.status,
        statusText: res.statusText,
        httpVersion: harVersion(res.version),
        cookies: responseCookies(res.headers),
        headers: res.headers.map(function (h) { return { name: h.name, value: h.value }; }),
        content: content,
        redirectURL: header(res.headers, 'Location') || '',
        headersSize: -1,
        bodySize: res.body.length
      },
      cache: {},
      timings: harTimings(session.timings)
    };
    if (session.flags['ui-comments']) entry.comment = session.flags['ui-comments'];
    return entry;
  }

  var SECRET_HEADERS = /^(authorization|proxy-authorization|cookie|set-cookie|x-api-key|x-auth-token|x-csrf-token|x-xsrf-token|x-amz-security-token)$/i;

  // Blanks the values of headers that usually carry credentials, and drops
  // the parsed cookies. URLs and bodies are left as they are.
  function redactEntry(entry) {
    [entry.request, entry.response].forEach(function (message) {
      if (!message || typeof message !== 'object') return;
      message.cookies = [];
      // Raw header text, which some tools add, would repeat what's removed.
      delete message.headersText;
      delete message._headersText;
      (Array.isArray(message.headers) ? message.headers : []).forEach(function (h) {
        if (h && SECRET_HEADERS.test(h.name)) h.value = '[removed]';
      });
    });
    return entry;
  }

  // CONNECT tunnels are left out: they have no URL a HAR reader understands,
  // and browsers don't export them either.
  function buildHar(sessions, options) {
    var entries = sessions.filter(function (s) { return !s.isConnect; }).map(harEntry);
    if (options && options.redact) entries = entries.map(redactEntry);
    return {
      log: {
        version: '1.2',
        creator: { name: 'VioLens SAZ viewer (violens.dev)', version: '1.0' },
        entries: entries
      }
    };
  }

  // ------------------------------------------------------------- reading HAR

  function isObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
  function list(value) { return Array.isArray(value) ? value.filter(isObject) : []; }
  function str(value) { return typeof value === 'string' ? value : ''; }
  function positive(value) { return typeof value === 'number' && value > 0 ? value : 0; }

  function harHeaders(headers) {
    return list(headers).map(function (h) { return { name: String(h.name || ''), value: String(h.value === undefined ? '' : h.value) }; });
  }

  // A HAR body is text: either the body itself, already decompressed, or
  // base64. So Content-Encoding is never applied to it again.
  function harBody(text, encoding, headers, type) {
    var message = { headers: headers, type: type, body: new Uint8Array(0), note: null, utf8: false };
    if (typeof text === 'string') {
      if (str(encoding).toLowerCase() === 'base64') {
        try {
          var binary = atob(text);
          var bytes = new Uint8Array(binary.length);
          for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          message.body = bytes;
        } catch (e) {
          message.body = new TextEncoder().encode(text);
          message.utf8 = true;
          message.note = 'This body is marked as base64 but isn\'t valid, so it\'s shown as saved.';
        }
      } else {
        message.body = new TextEncoder().encode(text);
        message.utf8 = true;
      }
    }
    message.decoded = message.body;
    return message;
  }

  function harSession(entry, number) {
    if (!isObject(entry) || !isObject(entry.request) || !str(entry.request.url)) throw new SazError('it has no request URL');
    var req = entry.request;
    var res = isObject(entry.response) ? entry.response : {};
    var url = req.url;
    var method = str(req.method);
    var requestHeaders = harHeaders(req.headers);
    var responseHeaders = harHeaders(res.headers);
    var host = /^[a-z][a-z0-9+.-]*:\/\/(?:[^\/?#@]*@)?([^\/?#]*)/i.exec(url);

    var post = isObject(req.postData) ? req.postData : {};
    var postText = typeof post.text === 'string' ? post.text : undefined;
    var params = list(post.params);
    var fromParams = false;
    // Some tools list form fields without the body they came from.
    if (!postText && params.length && /x-www-form-urlencoded/i.test(str(post.mimeType))) {
      postText = params.map(function (p) { return encodeURIComponent(String(p.name || '')) + '=' + encodeURIComponent(String(p.value || '')); }).join('&');
      fromParams = true;
    }
    var request = harBody(postText, post.encoding, requestHeaders, header(requestHeaders, 'Content-Type') || str(post.mimeType));
    request.version = str(req.httpVersion) || 'HTTP/1.1';
    if (fromParams) request.note = 'Rebuilt from the form fields in the HAR file, so it may differ from what was sent.';
    request.missing = !request.body.length && (positive(req.bodySize) > 0 || params.length > 0);
    request.size = request.body.length;

    var content = isObject(res.content) ? res.content : {};
    var response = harBody(content.text, content.encoding, responseHeaders, header(responseHeaders, 'Content-Type') || str(content.mimeType));
    response.version = str(res.httpVersion) || 'HTTP/1.1';
    response.status = parseInt(res.status, 10) || 0;
    response.statusText = str(res.statusText);
    response.missing = !response.body.length && positive(content.size) > 0;
    response.size = response.body.length || positive(content.size);

    var started = Date.parse(str(entry.startedDateTime));
    var messages = list(entry._webSocketMessages).map(function (m) {
      return (m.type === 'send' ? '> ' : '< ') + str(m.data);
    });

    return {
      number: number,
      method: method,
      url: url,
      host: (host ? host[1] : header(requestHeaders, 'Host') || '').replace(/:\d+$/, '') || '(unknown host)',
      isConnect: false,
      request: request,
      response: response,
      startedAt: isNaN(started) ? null : started,
      timings: null,
      duration: typeof entry.time === 'number' && entry.time >= 0 ? entry.time : null,
      flags: str(entry.comment) ? { 'ui-comments': entry.comment } : {},
      webSocket: messages.length ? new TextEncoder().encode(messages.join('\n')) : null,
      harEntry: entry
    };
  }

  function readHar(bytes) {
    var parsed;
    try { parsed = JSON.parse(utf8Decoder.decode(bytes)); }
    catch (e) { throw new SazError('This HAR file isn\'t valid JSON. It may be cut short or damaged.'); }
    var log = isObject(parsed) ? parsed.log : null;
    if (!isObject(log) || !Array.isArray(log.entries)) throw new SazError('This isn\'t a HAR file: it has no log.entries list.');
    var sessions = [];
    var skipped = [];
    log.entries.forEach(function (entry, i) {
      try { sessions.push(harSession(entry, i + 1)); }
      catch (e) { skipped.push('#' + (i + 1) + ': ' + (e && e.message ? e.message : e)); }
    });
    return { sessions: sessions, skipped: skipped, log: log };
  }

  // A copy of the opened HAR with only these sessions. Entries are copied
  // whole, so fields this page doesn't use survive.
  function copyHar(log, sessions, options) {
    var out = {};
    Object.keys(log).forEach(function (key) { if (key !== 'entries' && key !== 'pages') out[key] = log[key]; });
    var used = new Set(sessions.map(function (s) { return s.harEntry.pageref; }));
    if (Array.isArray(log.pages)) {
      out.pages = list(log.pages).filter(function (page) { return used.has(page.id); });
    }
    out.entries = sessions.map(function (s) {
      var entry = JSON.parse(JSON.stringify(s.harEntry));
      return options && options.redact ? redactEntry(entry) : entry;
    });
    return { log: out };
  }

  var core = {
    readHar: readHar, copyHar: copyHar, readSaz: readSaz, buildHar: buildHar, parseMessage: parseMessage, dechunk: dechunk,
    readMetadata: readMetadata, readTimings: readTimings, isText: isText, SazError: SazError
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  if (typeof document === 'undefined') return;

  // -------------------------------------------------------------------- UI

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function formatSize(n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(n < 10240 ? 1 : 0) + ' KB';
    return (n / 1048576).toFixed(1) + ' MB';
  }

  function hexDump(bytes) {
    var lines = [];
    var shown = Math.min(bytes.length, MAX_HEX_SHOWN);
    for (var i = 0; i < shown; i += 16) {
      var hex = '';
      var ascii = '';
      for (var j = i; j < i + 16; j++) {
        if (j < shown) {
          hex += (bytes[j] < 16 ? '0' : '') + bytes[j].toString(16) + ' ';
          ascii += bytes[j] >= 32 && bytes[j] < 127 ? String.fromCharCode(bytes[j]) : '.';
        } else hex += '   ';
        if (j === i + 7) hex += ' ';
      }
      lines.push(('0000000' + i.toString(16)).slice(-8) + '  ' + hex + ' ' + ascii);
    }
    return lines.join('\n');
  }

  function statusClass(status) {
    if (status >= 500) return 's5';
    if (status >= 400) return 's4';
    if (status >= 300) return 's3';
    if (status >= 200) return 's2';
    return '';
  }

  var root = document.getElementById('sv');
  if (!root) return;
  var drop = document.getElementById('sv-drop');
  var input = document.getElementById('sv-file');
  var status = document.getElementById('sv-status');
  var results = document.getElementById('sv-results');
  var filter = document.getElementById('sv-filter');
  var count = document.getElementById('sv-count');
  var harButton = document.getElementById('sv-har');
  var tbody = document.getElementById('sv-rows');
  var detail = document.getElementById('sv-detail');

  var redact = document.getElementById('sv-redact');
  var sample = document.getElementById('sv-sample');
  var sortButtons = Array.prototype.slice.call(document.querySelectorAll('.sv-sort'));

  var state = { log: null, sessions: [], shown: [], fileName: 'sessions', selected: null, urls: [], sort: 'number', direction: 1, opening: 0 };

  // Only SAZ files need DecompressionStream; HAR files open without it.
  var canUnzip = typeof DecompressionStream !== 'undefined';
  if (!canUnzip) sample.disabled = true;

  input.addEventListener('change', function () {
    if (input.files && input.files[0]) open(input.files[0]);
    input.value = '';
  });

  ['dragenter', 'dragover'].forEach(function (type) {
    document.addEventListener(type, function (e) {
      if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types, 'Files') >= 0) {
        e.preventDefault();
        drop.classList.add('over');
      }
    });
  });
  ['dragleave', 'drop'].forEach(function (type) {
    document.addEventListener(type, function (e) {
      if (type === 'dragleave' && e.relatedTarget) return;
      drop.classList.remove('over');
    });
  });
  document.addEventListener('drop', function (e) {
    if (!e.dataTransfer || !e.dataTransfer.files.length) return;
    e.preventDefault();
    open(e.dataTransfer.files[0]);
  });

  sample.addEventListener('click', async function () {
    var request = ++state.opening;
    status.textContent = 'Loading the sample\u2026';
    try {
      var response = await fetch(sample.getAttribute('data-src'));
      if (!response.ok) throw new Error('HTTP ' + response.status);
      var blob = await response.blob();
      if (request === state.opening) open(new File([blob], 'sample.saz'));
    } catch (e) {
      if (request === state.opening) status.textContent = 'The sample couldn\'t be loaded. Check your connection and try again.';
    }
  });

  async function open(file) {
    var request = ++state.opening;
    status.textContent = 'Reading ' + file.name + '…';
    results.hidden = true;
    clearDetail();
    try {
      var isHar = await looksLikeHar(file);
      if (isHar && file.size > MAX_HAR_BYTES) throw new SazError('This HAR file is over 256 MB, which is too big to open here.');
      if (!isHar && !canUnzip) throw new SazError('This browser is too old to open SAZ files here. Try a current version of Chrome, Edge, Firefox or Safari.');
      var bytes = new Uint8Array(await file.arrayBuffer());
      var result = isHar ? readHar(bytes) : await readSaz(bytes, function (done, total) {
        if (request !== state.opening) return;
        status.textContent = 'Reading ' + file.name + '… ' + done + ' of ' + total + ' sessions';
      });
      // A file chosen later wins, however long this one took.
      if (request !== state.opening) return;
      state.sessions = result.sessions;
      state.log = result.log || null;
      state.sort = 'number';
      state.direction = 1;
      drop.classList.add('loaded');
      state.fileName = file.name.replace(/\.(saz|har|json)$/i, '') || 'sessions';
      var message = file.name + ': ' + result.sessions.length + ' session' + (result.sessions.length === 1 ? '' : 's') + '.';
      if (result.skipped.length) {
        message += ' ' + result.skipped.length + ' couldn\'t be read (' + result.skipped.slice(0, 3).join('; ') +
          (result.skipped.length > 3 ? '; …' : '') + ').';
      }
      status.textContent = message;
      filter.value = '';
      render();
      results.hidden = false;
    } catch (e) {
      if (request !== state.opening) return;
      drop.classList.remove('loaded');
      status.textContent = e instanceof SazError ? e.message : 'That file couldn\'t be opened: ' + (e && e.message ? e.message : e);
    }
  }

  // Goes by the content, not the name: HAR is a JSON object, SAZ is a zip.
  async function looksLikeHar(file) {
    var start = await file.slice(0, 1024).text();
    return /^\uFEFF?\s*\{/.test(start) || (/\.har$/i.test(file.name) && start.slice(0, 2) !== 'PK');
  }

  filter.addEventListener('input', render);
  redact.addEventListener('change', render);

  sortButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var key = button.getAttribute('data-sort');
      state.direction = state.sort === key ? -state.direction : 1;
      state.sort = key;
      render();
    });
  });

  function sortValue(session, key) {
    if (key === 'status') return session.response.status;
    if (key === 'method') return session.method;
    if (key === 'host') return session.host.toLowerCase();
    if (key === 'url') return session.url.replace(/^https?:\/\/[^/]+/i, '').toLowerCase();
    if (key === 'size') return bodySize(session.response);
    if (key === 'type') return mediaType(contentTypeOf(session.response));
    return session.number;
  }

  // A HAR file can give a body's type and size without including the body.
  function contentTypeOf(message) { return message.type || header(message.headers, 'Content-Type') || ''; }
  function bodySize(message) { return message.size !== undefined ? message.size : (message.decoded || message.body).length; }

  function compareSessions(a, b) {
    var x = sortValue(a, state.sort), y = sortValue(b, state.sort);
    return x < y ? -state.direction : x > y ? state.direction : a.number - b.number;
  }

  function render() {
    var words = filter.value.toLowerCase().split(/\s+/).filter(Boolean);
    state.shown = state.sessions.filter(function (s) {
      if (!words.length) return true;
      var text = [s.number, s.method, s.url, s.response.status, contentTypeOf(s.response)].join(' ').toLowerCase();
      return words.every(function (w) { return text.indexOf(w) >= 0; });
    });
    state.shown.sort(compareSessions);
    sortButtons.forEach(function (button) {
      var th = button.parentNode;
      if (button.getAttribute('data-sort') === state.sort) th.setAttribute('aria-sort', state.direction > 0 ? 'ascending' : 'descending');
      else th.removeAttribute('aria-sort');
    });

    tbody.textContent = '';
    var limit = Math.min(state.shown.length, 5000);
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < limit; i++) fragment.appendChild(row(state.shown[i]));
    tbody.appendChild(fragment);
    if (!state.shown.length) {
      var empty = el('tr', 'empty');
      var cell = el('td', '', state.sessions.length ? 'No sessions match the filter.' : 'No sessions could be read.');
      cell.colSpan = 7;
      empty.appendChild(cell);
      tbody.appendChild(empty);
    }

    var exported = state.shown.filter(function (s) { return !s.isConnect; }).length;
    count.textContent = state.shown.length === state.sessions.length
      ? state.sessions.length + ' sessions'
      : state.shown.length + ' of ' + state.sessions.length + ' sessions';
    if (limit < state.shown.length) count.textContent += ' (the first 5,000 are listed; filter to find the rest)';
    harButton.textContent = (state.log && redact.checked ? 'Download cleaned HAR (' : 'Download HAR (') + exported + ')';
    harButton.disabled = exported === 0;
  }

  function row(session) {
    var tr = el('tr');
    tr.tabIndex = 0;
    if (session.isConnect) tr.className = 'tunnel';
    if (session === state.selected) tr.classList.add('selected');
    var cells = [
      [String(session.number), 'num'],
      [session.response.status ? String(session.response.status) : '-', statusClass(session.response.status)],
      [session.method, ''],
      [session.host, 'host'],
      [session.isConnect ? 'Tunnel to ' + session.url : session.url.replace(/^(https?|wss?):\/\/[^/]+/i, '') || '/', 'url'],
      [formatSize(bodySize(session.response)), 'size'],
      [mediaType(contentTypeOf(session.response)), 'type']
    ];
    cells.forEach(function (c) { tr.appendChild(el('td', c[1], c[0])); });
    tr.addEventListener('click', function () { select(session, tr); });
    tr.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(session, tr); }
      else if (e.key === 'ArrowDown' && tr.nextElementSibling) { e.preventDefault(); tr.nextElementSibling.focus(); select(state.shown[indexOfRow(tr) + 1], tr.nextElementSibling); }
      else if (e.key === 'ArrowUp' && tr.previousElementSibling) { e.preventDefault(); tr.previousElementSibling.focus(); select(state.shown[indexOfRow(tr) - 1], tr.previousElementSibling); }
    });
    return tr;
  }

  function indexOfRow(tr) { return Array.prototype.indexOf.call(tbody.children, tr); }

  function clearDetail() {
    state.urls.forEach(function (u) { URL.revokeObjectURL(u); });
    state.urls = [];
    detail.textContent = '';
    detail.hidden = true;
    state.selected = null;
  }

  function select(session, tr) {
    if (!session) return;
    clearDetail();
    state.selected = session;
    Array.prototype.forEach.call(tbody.querySelectorAll('tr.selected'), function (r) { r.classList.remove('selected'); });
    tr.classList.add('selected');

    var heading = el('h2', 'sv-detail-title');
    heading.appendChild(el('span', 'num', '#' + session.number + ' '));
    heading.appendChild(el('span', '', session.method + ' ' + session.url));
    detail.appendChild(heading);

    var meta = [];
    if (session.startedAt) meta.push(new Date(session.startedAt).toLocaleString());
    if (session.timings) meta.push(Math.round(totalTime(session.timings)) + ' ms');
    else if (typeof session.duration === 'number') meta.push(Math.round(session.duration) + ' ms');
    if (session.flags['x-processinfo']) meta.push('Process: ' + session.flags['x-processinfo']);
    if (session.flags['x-clientip']) meta.push('Client: ' + session.flags['x-clientip']);
    if (meta.length) detail.appendChild(el('p', 'sv-meta', meta.join(' · ')));
    if (session.flags['ui-comments']) detail.appendChild(el('p', 'sv-comment', 'Comment: ' + session.flags['ui-comments']));

    var sides = el('div', 'sv-sides');
    sides.appendChild(side('Request', session.request.version, session.method + ' ' + session.url, session.request));
    var res = session.response;
    sides.appendChild(side('Response', res.version, res.status + ' ' + res.statusText, res));
    detail.appendChild(sides);

    if (session.webSocket) {
      var ws = el('section', 'sv-side');
      ws.appendChild(el('h3', '', 'WebSocket messages'));
      ws.appendChild(el('p', 'sv-note', session.harEntry
        ? 'From the HAR file. > marks a sent message and < a received one.'
        : 'As Fiddler saved them. The VioLens app shows WebSocket messages one by one.'));
      ws.appendChild(el('pre', 'sv-body', utf8Decoder.decode(session.webSocket.subarray(0, MAX_TEXT_SHOWN))));
      detail.appendChild(ws);
    }

    detail.hidden = false;
    if (window.matchMedia('(max-width: 900px)').matches) detail.scrollIntoView({ block: 'start' });
  }

  function side(title, version, firstLine, message) {
    var section = el('section', 'sv-side');
    section.appendChild(el('h3', '', title));
    section.appendChild(el('p', 'sv-first-line', firstLine + ' (' + version + ')'));

    var table = el('table', 'sv-headers');
    message.headers.forEach(function (h) {
      var tr = el('tr');
      tr.appendChild(el('th', '', h.name));
      tr.appendChild(el('td', '', h.value));
      table.appendChild(tr);
    });
    if (message.headers.length) section.appendChild(table);
    else section.appendChild(el('p', 'sv-note', 'No headers.'));

    var bytes = message.decoded || message.body;
    if (!bytes.length) {
      section.appendChild(el('p', 'sv-note', message.missing ? 'The body isn\'t included in this HAR file.' : 'No body.'));
      return section;
    }

    var contentType = contentTypeOf(message);
    var type = mediaType(contentType);
    // Text from a HAR file is already decoded, whatever charset it once had.
    var textType = message.utf8 ? type : contentType;
    var about = formatSize(bytes.length);
    if (message.decoded && message.decoded !== message.body && message.decoded.length !== message.body.length) {
      about += ', ' + formatSize(message.body.length) + ' as sent';
    }
    var summary = el('p', 'sv-note', 'Body: ' + about + (type ? ', ' + type : '') + ' ');
    var save = el('button', 'sv-link', 'Save body');
    save.type = 'button';
    save.setAttribute('aria-label', 'Save ' + title.toLowerCase() + ' body');
    save.addEventListener('click', function () {
      // Always a plain download, so a captured page is never opened as one.
      download(new Blob([bytes], { type: 'application/octet-stream' }),
        state.fileName + '-' + state.selected.number + '-' + title.toLowerCase() + '.' + extension(type, !message.decoded));
    });
    summary.appendChild(save);
    section.appendChild(summary);
    if (message.note) section.appendChild(el('p', 'sv-note warn', message.note));

    if (message.decoded && /^image\/(png|jpeg|gif|webp|avif|bmp|x-icon|vnd\.microsoft\.icon|svg\+xml)$/.test(type)) {
      // An <img> never runs script, even for SVG.
      var url = URL.createObjectURL(new Blob([bytes], { type: type }));
      state.urls.push(url);
      var img = el('img', 'sv-image');
      img.alt = 'Image from the response';
      img.src = url;
      section.appendChild(img);
      return section;
    }

    if (message.decoded && (message.utf8 || isText(contentType) || looksLikeText(bytes))) {
      var text = decodeText(bytes.subarray(0, MAX_TEXT_SHOWN), textType);
      if (/json/.test(type) && bytes.length <= MAX_TEXT_SHOWN) {
        try { text = JSON.stringify(JSON.parse(text), null, 2); } catch (e) { /* show as sent */ }
      }
      section.appendChild(el('pre', 'sv-body', text));
      if (bytes.length > MAX_TEXT_SHOWN) section.appendChild(el('p', 'sv-note', 'Only the first 2 MB is shown. The downloaded HAR has all of it.'));
      return section;
    }

    section.appendChild(el('pre', 'sv-body hex', hexDump(bytes)));
    if (bytes.length > MAX_HEX_SHOWN) section.appendChild(el('p', 'sv-note', 'Only the first 64 KB is shown. The downloaded HAR has all of it.'));
    return section;
  }

  // A body with no Content-Type is shown as text if its start is printable.
  function looksLikeText(bytes) {
    var sample = bytes.subarray(0, 512);
    for (var i = 0; i < sample.length; i++) {
      var b = sample[i];
      if (b === 0 || (b < 32 && b !== 9 && b !== 10 && b !== 13)) return false;
    }
    return true;
  }

  // A fixed list: the file's own names and types don't choose the extension.
  function extension(type, stillEncoded) {
    if (stillEncoded) return 'bin';
    if (/json/.test(type)) return 'json';
    var known = { 'text/html': 'html.txt', 'text/plain': 'txt', 'text/css': 'css', 'text/csv': 'csv',
      'application/xml': 'xml', 'text/xml': 'xml', 'image/png': 'png', 'image/jpeg': 'jpg',
      'image/gif': 'gif', 'image/webp': 'webp', 'application/pdf': 'pdf' };
    return Object.prototype.hasOwnProperty.call(known, type) ? known[type] : 'bin';
  }

  function download(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = el('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
  }

  harButton.addEventListener('click', function () {
    // The HAR keeps capture order, whatever order the table is in.
    var inOrder = state.shown.slice().sort(function (a, b) { return a.number - b.number; });
    var options = { redact: redact.checked };
    var har = state.log ? copyHar(state.log, inOrder, options) : buildHar(inOrder, options);
    // A copy of a HAR gets its own name, so it isn't mistaken for the original.
    var suffix = !state.log ? '' : redact.checked ? '-cleaned' : '-copy';
    download(new Blob([JSON.stringify(har, null, 2)], { type: 'application/json' }), state.fileName + suffix + '.har');
  });

  document.getElementById('sv-another').addEventListener('click', function () { input.click(); });
})();
