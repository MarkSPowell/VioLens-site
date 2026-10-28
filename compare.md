---
layout: page
# Not published until the comparison has been fact-checked. Remove this line
# (and link to /compare/ again from the footer, the home page and the
# Fiddler Classic page) to publish it.
published: false
title: Compare web debuggers
seo_title: "Fiddler Alternatives Compared: Charles, mitmproxy, HTTP Toolkit"
description: An honest comparison of HTTPS debugging proxies for anyone leaving Fiddler Classic, covering price, licence, platforms, HTTP/2 and scripting.
---

# Fiddler Classic alternatives compared

<p class="lede">If you're leaving Fiddler Classic, there are several good HTTPS debugging proxies to choose from. Here's how they compare, including where VioLens is behind. I make VioLens, so I've tried to be fair and stick to things you can check.</p>

<div class="table-wrap compare-table" markdown="1">

| | VioLens | Fiddler Classic | Fiddler Everywhere | Charles | mitmproxy | HTTP Toolkit | Proxyman |
|---|---|---|---|---|---|---|---|
| **Price** | Free | Free for non-commercial use only | Paid yearly subscription per user | $50 per user, one-time (30-day trial) | Free | Free, with a paid Pro subscription | From $89, one-time (limited free trial) |
| **Free for work** | Yes | No | No | No | Yes | Basic features | No |
| **Source** | Open source (MIT) | Closed | Closed | Closed | Open source (MIT) | Open source (AGPL) | Closed |
| **Platforms** | Windows, Mac (Apple silicon) | Windows | Windows, Mac, Linux | Windows, Mac, Linux | Windows, Mac, Linux | Windows, Mac, Linux | Mac, Windows, Linux |
| **Interface** | Desktop app | Desktop app | Desktop app | Desktop app | Terminal, web UI and Python | Desktop app | Desktop app |
| **HTTP/2** | Yes | No | Yes | Yes | Yes, and HTTP/3 | Yes | Yes |
| **Runs FiddlerScript (CustomRules.js)** | Yes | Yes | No | No | No | No | No |
| **Scripting and extending** | FiddlerScript, .NET extensions | FiddlerScript, .NET extensions | C# scripts (beta) | Rewrite and Map tools | Python add-ons | Rules (more in Pro) | JavaScript scripts |
| **Embeddable engine** | Violens.ProxyCore (NuGet, free) | FiddlerCore (sold separately) | No | No | Python library | Open source libraries | No |

</div>

VioLens, Fiddler Classic and Fiddler Everywhere all open the `.saz` files Fiddler saves. Most of the others work with HAR files instead. Prices and features change, so check each tool's own site before you decide. Last checked in October 2026.

## Which one should you pick?

### VioLens

Pick VioLens if you liked how Fiddler Classic worked and want to keep working that way for free, including at work. Your SAZ files, CustomRules.js, AutoResponder rules, QuickExec commands and keyboard habits carry over, and it runs on a Mac too. It's a preview, though. HTTP/2 is still a preview, it doesn't send client certificates yet, and the Mac version has had less use. [Moving from Fiddler Classic]({{ '/fiddler-classic-alternative/' | relative_url }}) explains what carries over.

### Fiddler Everywhere

Progress's paid successor to Fiddler Classic, on Windows, Mac and Linux. It has HTTP/2, team sharing features and commercial support. It's a different app from Fiddler Classic, though, so FiddlerScript and compiled Fiddler Classic extensions don't carry over. It makes sense if your company wants a supported, paid product from the same vendor.

### Charles

A long-standing paid proxy for Windows, Mac and Linux, popular with mobile developers. It's a one-time purchase, with HTTP/2, throttling, Map Local and Rewrite tools. There's no general scripting.

### mitmproxy

Free and open source, and very capable: HTTP/2, HTTP/3, WebSockets and more, scriptable in Python. It runs in a terminal or a web browser rather than as a desktop app. It's a great choice for automation and security testing, and less familiar if you're used to Fiddler's Inspectors.

### HTTP Toolkit

An open source desktop app for Windows, Mac and Linux, with one-click setup for browsers, Android, Docker and more. Inspection and manual rewriting are free. Automated mocking and reusable rules need a Pro subscription.

### Proxyman

A polished paid app, best known on the Mac and now on Windows and Linux too, with iOS apps on its higher plans. It has HTTP/2 and JavaScript scripting. The free trial is limited.

### Other tools people use instead

- **Browser developer tools** (F12) show a browser's own requests, with timing. They can't see other apps' traffic, and they can't hold or change a request mid-flight the way a breakpoint can.
- **Wireshark** captures packets, not HTTP sessions. It's the right tool for network problems below HTTP, but it can't decrypt and edit HTTPS the way a debugging proxy does.
- **Postman** and similar tools send requests you write. They're not proxies, so they don't capture what your browser or app actually sends.

## Try VioLens

It's free, and it doesn't need an account.

<div class="buttons">
  <a class="button primary" href="{{ '/download/' | relative_url }}">Download VioLens</a>
  <a class="button" href="{{ '/how-to/' | relative_url }}">See the how-to guides</a>
</div>

<p class="fine" style="margin-top:32px; font-size:13px; color:var(--muted);">Fiddler, Fiddler Classic, Fiddler Everywhere and FiddlerCore are trademarks of Progress Software Corporation. Charles, mitmproxy, HTTP Toolkit, Proxyman, Wireshark and Postman are the names of their owners' products, used here only to compare them. VioLens isn't affiliated with any of them.</p>
