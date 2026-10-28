---
layout: page
title: A free Fiddler Classic alternative
seo_title: "Free Fiddler Classic Alternative for Windows and Mac · VioLens"
description: Fiddler Classic is now non-commercial only. VioLens is a free, open source alternative for Windows and Mac that opens SAZ files and runs CustomRules.js.
faq:
  - q: Can I still use Fiddler Classic at work?
    a: |
      Progress has changed Fiddler Classic's licence to allow non-commercial use only. It set September 17, 2026 as the deadline for commercial users to move to Fiddler Everywhere or stop using Fiddler Classic for work. [Progress's FAQ](https://www.telerik.com/fiddler/fiddler-classic/commercial-use) explains what it counts as commercial use. I'm not a lawyer, so check with whoever handles software licences where you work.
  - q: Is VioLens free for commercial use?
    a: |
      Yes. VioLens is released under the MIT licence, so you can use it for anything, at work or at home. There's no account, no subscription and no paid tier.
  - q: Will my .saz files open in VioLens?
    a: |
      Yes. **File > Open SAZ** opens the sessions in a `.saz` file saved by Fiddler Classic, and **File > Save SAZ** writes them. VioLens also imports and exports HAR files. WebSocket messages are saved in HAR files but not in SAZ files yet.
  - q: Does my CustomRules.js work in VioLens?
    a: |
      VioLens loads FiddlerScript files like `CustomRules.js`, with `OnBeforeRequest`, `OnBeforeResponse`, Rules menu options, context-menu actions, extra columns and QuickExec commands. Load yours from **Tools > FiddlerScript**. If something in your script doesn't work, please [open an issue](https://github.com/MarkSPowell/VioLens/issues).
  - q: Is there a Fiddler Classic for Mac?
    a: |
      No. Fiddler Classic only runs on Windows. VioLens runs on both Windows and Apple silicon Macs (macOS 11 or later), with the same features on each.
  - q: Can I keep using my Fiddler extensions?
    a: |
      Usually, if you have the extension's source. It can be rebuilt for VioLens with small changes, often just removing its `using Fiddler;` lines, and then it runs on Windows and Mac. A compiled Fiddler `.dll` can't be dropped in as it is. Extensions that rely on old Windows Forms controls can run in VioLens's separate Legacy Extension Host on Windows.
  - q: What doesn't VioLens do yet?
    a: |
      It can't use SOCKS upstream proxies or Digest proxy sign-in, and it sends only one client certificate (mutual TLS) at a time, without support for Fiddler's `ClientCertificate.cer` file. The Mac version has had less use than the Windows one. The [Download page](/download/#whats-not-there-yet) lists the gaps.
  - q: Is VioLens made by Progress or Telerik?
    a: |
      No. VioLens is an independent open source project, written from scratch. It isn't affiliated with or endorsed by Progress Software or Telerik.
---

# A free, open source Fiddler Classic alternative

<p class="lede">Fiddler Classic is now for non-commercial use only. VioLens is an open source debugging proxy for Windows and Mac that works the way Fiddler Classic does: it opens your SAZ files, runs your CustomRules.js, and takes the same AutoResponder rules and QuickExec commands. It's free and MIT licensed, so you can use it at work.</p>

<div class="buttons">
  <a class="button primary" href="{{ '/download/' | relative_url }}">Download VioLens</a>
  <a class="button" href="#moving-from-fiddler-classic-to-violens">How to switch</a>
</div>

## What changed with Fiddler Classic

On August 3, 2026, Progress Software announced that Fiddler Classic's licence would allow non-commercial use only. Commercial users had until September 17, 2026 to move to Fiddler Everywhere, Progress's paid, subscription-based tool, or to stop using Fiddler Classic for work. Progress doesn't sell a commercial licence for Fiddler Classic itself. The details are on [Progress's commercial use page](https://www.telerik.com/fiddler/fiddler-classic/commercial-use).

If you use Fiddler at work, you have a few options:

- **Move to Fiddler Everywhere.** It's Progress's supported product, with a yearly subscription per user. It works differently from Fiddler Classic: it has its own C# scripting (in beta) rather than FiddlerScript.
- **Use another debugging proxy**, such as Charles, mitmproxy, HTTP Toolkit or Proxyman.
- **Use VioLens**, if you want to keep working the way you did in Fiddler Classic, with your files and scripts, for free.

## Why VioLens feels like Fiddler Classic

I used Fiddler for more than 15 years, and I built VioLens to replace it in my own work. Most of what you used in Fiddler Classic has a direct equivalent:

| In Fiddler Classic | In VioLens |
|---|---|
| Session list and Inspectors | The session list, with Headers, Raw, JSON, WebForms, ImageView, Hex and Cookies views |
| `.saz` archives | **File > Open SAZ** and **Save SAZ**, plus HAR import and export |
| FiddlerScript (`CustomRules.js`) | **Tools > FiddlerScript**: `OnBeforeRequest`, `OnBeforeResponse`, the Rules menu, context actions and columns |
| AutoResponder | The same match syntax (`EXACT:`, `regex:`, `NOT:`, `METHOD:`) and actions (`*redir:`, `*delay:`, `*drop`, `*reset`, `*bpu` and more) |
| Breakpoints | Break on Requests, Break on Responses, and narrower conditions by URL, method or status |
| QuickExec | The same box (**Alt+Q**) and commands: `?text`, `@host`, `=404`, `bpu`, `bpafter`, `go`, `cls`, `select`, `tail` |
| Composer and Reissue | Composer, including binary bodies as hex or from a file, and Replay (press **R**) |
| TextWizard | TextWizard (**Ctrl+E**), now with JWT, SAML and Unix time conversions |
| Find Sessions | Find (**Ctrl+F**), searching decompressed bodies |
| Compare (with WinDiff) | A built-in, side-by-side Compare (**Ctrl+W**) |
| Timeline and Statistics | A DevTools-style waterfall, a Timing tab and Statistics |
| Allow remote computers to connect | The same setting, with the certificate at `http://violens/` |
| Gateway and upstream proxies | Upstream proxies, PAC scripts, and Negotiate, NTLM or Basic sign-in |
| Extensions | .NET extensions, ported from their source |
| FiddlerCore | [`Violens.ProxyCore`]({{ '/developers/' | relative_url }}), on NuGet |

It also does a few things Fiddler Classic never did. It runs on a Mac, captures HTTP/2, shows live WebSocket messages, decompresses Brotli and zstd, and warns about cookies today's browsers will refuse.

## Moving from Fiddler Classic to VioLens

1. **Close Fiddler Classic.** Only one tool can be the system proxy at a time.
2. **[Download VioLens]({{ '/download/' | relative_url }})** and install it.
3. **Click Start, and trust the root certificate.** VioLens creates its own certificate, `DO_NOT_TRUST_ViolensRoot`, on your computer. That's what lets it decrypt HTTPS. Your browser traffic then shows up in the session list.
4. **Open your saved sessions.** Use **File > Open SAZ** for any `.saz` files you kept.
5. **Load your FiddlerScript.** Fiddler Classic keeps it at `Documents\Fiddler2\Scripts\CustomRules.js`. In VioLens, check **Tools > FiddlerScript**, click **Browse**, pick the file and click **Load**. The status line shows which handlers it found, or the error if something doesn't load.
6. **Add your AutoResponder rules.** Check **Tools > AutoResponder** and add your rules. The match and action syntax is the same as Fiddler's.
7. **Set up phones and other devices again.** Turn on **Allow remote computers to connect** in **Tools > Connections**. Then, on the device, open `http://violens/` to install VioLens's certificate. [How to debug iPhone and Android traffic]({{ '/how-to/debug-iphone-android-traffic/' | relative_url }}) walks through it.
8. **Port the extensions you rely on.** The [User Guide]({{ '/guide/' | relative_url }}#extensions) explains how. Three ported extensions come with the installers: Eric Lawrence's NetLog importer, the CSP Rule Collector and the Privacy Scanner.

When you're done, you can remove Fiddler's root certificate from your computer if you no longer use Fiddler Classic.

## Questions

{% include faq.html %}

<div class="callout">
<p>Missing something you relied on in Fiddler Classic? <a href="{{ site.repository_url }}/discussions">Tell me in Discussions</a> or on <a href="{{ site.discord_url }}">Discord</a>. That's how I decide what to build next.</p>
</div>
