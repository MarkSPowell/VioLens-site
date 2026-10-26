---
layout: page
howto: true
order: 1
title: How to capture and decrypt HTTPS traffic on a Mac
seo_title: "How to Capture and Decrypt HTTPS Traffic on a Mac · VioLens"
description: See the HTTPS requests your browsers and apps make on macOS, decrypted, with a free debugging proxy. A Fiddler-style tool for the Mac.
---

# How to capture and decrypt HTTPS traffic on a Mac

<p class="lede">Fiddler Classic only ever ran on Windows. VioLens is a free, open source debugging proxy that runs on Apple silicon Macs, so you can see every request your browsers and apps make, decrypted, and change them if you need to.</p>

You'll need a Mac with Apple silicon (M1 or newer) and macOS 11 or later.

## 1. Install VioLens

[Download the disk image]({{ '/download/' | relative_url }}), open it and drag VioLens into Applications.

VioLens isn't notarized by Apple yet, so the first time you open it macOS blocks it. Open **System Settings > Privacy & Security**, scroll to Security and click **Open Anyway**. You only need to do this once. The [Download page]({{ '/download/' | relative_url }}#opening-it-on-a-mac-the-first-time) has the details.

## 2. Start capturing

Click **Start**. VioLens sets itself as your Mac's proxy while it runs, so traffic from Safari, Chrome, Edge and most other apps goes through it.

## 3. Trust the root certificate

To decrypt HTTPS, VioLens needs a root certificate your Mac trusts. The first time you click Start, VioLens explains this and asks before it adds a certificate called `DO_NOT_TRUST_ViolensRoot` to your login keychain. macOS may ask for your password.

The certificate is created on your Mac and only used there. Nothing VioLens captures leaves your Mac unless you save or send it yourself.

## 4. Browse, and read the traffic

Load a page or use an app, and each request appears in the session list. Click one to see its request and response: headers, the decoded body, JSON pretty-printed, cookies, images and a hex view. The **Timing** tab shows where the time went: DNS, connecting, the TLS handshake and waiting for the server.

Type in the filter box to narrow the list, for example `host:api.example.com` or `status:4xx`.

## 5. Stop when you're done

Click **Stop**. VioLens puts your Mac's proxy settings back the way they were. To remove the certificate as well, choose **Tools > Remove Root Certificate**.

## If you don't see some traffic

- **An app ignores the system proxy.** Some apps, and most command-line tools, don't use macOS's proxy setting. Point them at VioLens yourself, using the port shown in the status bar. For example, `curl` takes `-x http://127.0.0.1:PORT`.
- **An app rejects the certificate.** Some apps only trust certain certificates (certificate pinning), so their HTTPS can't be decrypted by any proxy.
- **Your company network uses a proxy.** VioLens goes through it automatically, PAC scripts included. See [Connections]({{ '/guide/' | relative_url }}#connections-upstream-proxy-and-other-devices) in the User Guide.

<div class="related" markdown="1">
**Related:** [See iPhone and Android traffic]({{ '/how-to/debug-iphone-android-traffic/' | relative_url }}) · [Edit and replay requests]({{ '/how-to/edit-and-replay-http-requests/' | relative_url }}) · [Switching from Fiddler Classic]({{ '/fiddler-classic-alternative/' | relative_url }})
</div>
