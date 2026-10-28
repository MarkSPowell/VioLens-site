---
layout: page
howto: true
order: 1.5
title: How to capture and debug HTTP/2 traffic
seo_title: "How to Capture and Debug HTTP/2 Traffic · VioLens"
description: Use HTTP/2 in VioLens, a free debugging proxy, to see browsers' HTTP/2 requests as they really are, and send your own requests over HTTP/2.
summary: "Check which HTTP version each request used, and send your own requests over HTTP/2."
---

# How to capture and debug HTTP/2 traffic

<p class="lede">Most sites use HTTP/2 now, but Fiddler Classic only ever spoke HTTP/1.1, so browsers fell back to HTTP/1.1 while you were debugging. VioLens keeps HTTP/2 end to end, so you see requests the way the browser and the server really exchange them.</p>

HTTP/2 is on by default in the latest version. [Download it here]({{ '/download/' | relative_url }}). (In VioLens 0.3 it was a preview, off by default. If you turned it off then, it stays off until you turn it back on.)

## 1. Check HTTP/2 is on

1. Check **Tools > Connections** to show the Connections settings.
2. Make sure **Use HTTP/2 with browsers** is checked. Uncheck it if you'd rather every request went over HTTP/1.1, as in Fiddler Classic.

A change applies to new connections straight away, even while VioLens is capturing, and VioLens remembers it for next time. Connections a browser already has open stay as they were, so if you don't see HTTP/2 straight away, restart the browser.

## 2. See which version each request used

Start capturing and browse. The **Version** column in the session list shows the HTTP version the browser used with VioLens, followed by the one VioLens used with the server when they differ:

- `HTTP/2`: HTTP/2 all the way.
- `HTTP/2 → HTTP/1.1`: the browser used HTTP/2, but the site only offered HTTP/1.1.
- `HTTP/1.1`: the browser used HTTP/1.1, as it does for plain `http://` sites.

If the column is hidden, right-click any column header and check **Version**.

Each HTTP/2 request is its own session, even though they share one connection, and it goes through the AutoResponder, breakpoints, FiddlerScript and extensions just like an HTTP/1.1 one. Trailers, such as gRPC's `grpc-status`, are passed on in both directions.

## 3. Send your own HTTP/2 requests

In the **Composer**, write `HTTP/2` as the version on the first line of an `https://` request:

```
GET https://www.example.com/ HTTP/2
Accept: text/html
```

Click **Execute**, and it goes to the server over HTTP/2. Replaying an HTTP/2 session (select it and press **R**) uses HTTP/2 too. Both need **Use HTTP/2 with browsers** on (it is unless you turned it off); without it, the request goes over HTTP/1.1, and the Composer tells you.

## 4. Save and share

**File > Save SAZ** saves HTTP/2 sessions with the version `HTTP/2.0`, and **File > Export HAR** with `http/2.0`, as Chrome does. Both read back as HTTP/2.

## What it doesn't do yet

- HTTP/2 is used for HTTPS only. Plain `http://` traffic stays on HTTP/1.1.
- WebSockets stay on HTTP/1.1 connections. Browsers arrange that themselves, and the [WebSocket tab]({{ '/how-to/inspect-websocket-messages/' | relative_url }}) works as before.
- HTTP/3 (QUIC) isn't supported. Browsers don't send HTTP/3 through a proxy anyway, so they use HTTP/2 instead.
- It has had real-world use on Windows only so far. If a site behaves differently through VioLens, turn HTTP/2 off to check, and please [open an issue]({{ site.repository_url }}/issues) with what you saw.

<div class="related" markdown="1">
**Related:** [Edit and replay requests]({{ '/how-to/edit-and-replay-http-requests/' | relative_url }}) · [Capture HTTPS on a Mac]({{ '/how-to/capture-https-traffic-on-mac/' | relative_url }}) · [Switching from Fiddler Classic]({{ '/fiddler-classic-alternative/' | relative_url }})
</div>
