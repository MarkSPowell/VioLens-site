---
layout: page
title: Download
seo_title: "Download VioLens: Free HTTPS Debugger for Windows, Mac, Linux"
description: Download VioLens, a free and open source HTTPS debugging proxy, for Windows 10 and 11, Apple silicon Macs or 64-bit Linux. Or build it from source.
---

# Download VioLens

<p class="lede">VioLens is still a preview, but it's usable for everyday debugging. Downloads come from the releases page on GitHub, along with notes on what changed.</p>

<div class="downloads">
  <section class="download">
    <h2>Windows</h2>
    <p>64-bit Windows 10 or 11. One installer with everything included, so there's nothing else to install first.</p>
    <ul>
      <li>Installs just for you, or for everyone on the computer.</li>
      <li>It's code-signed, so Windows can check it hasn't been tampered with. Windows may still warn you about it for now. <a href="#if-windows-says-it-protected-your-pc">Here's why</a>.</li>
      <li>Setup offers the optional extensions as checkboxes.</li>
    </ul>
    <a class="button primary" href="{{ site.releases_url }}/latest">Get the Windows installer</a>
    <p>Download <code>VioLens-Setup-<em>version</em>.exe</code> from the latest release.</p>
  </section>

  <section class="download">
    <h2>macOS</h2>
    <p>macOS 11 or later on Apple silicon (M1 and newer). Open the disk image and drag VioLens into Applications.</p>
    <ul>
      <li>The Mac version is newer than the Windows one, so please report anything that doesn't work.</li>
      <li>It's signed with an Apple Developer ID and notarized by Apple, so it opens like any other app.</li>
      <li>The optional extensions are in the disk image's Optional Extensions folder.</li>
    </ul>
    <a class="button primary" href="{{ site.releases_url }}/latest">Get the macOS disk image</a>
    <p>Download <code>VioLens-<em>version</em>-macos-arm64.dmg</code> from the latest release.</p>
  </section>

  <section class="download">
    <h2>Linux</h2>
    <p>64-bit (x86-64) Linux. VioLens sets the system proxy for you on GNOME, KDE Plasma and desktops built on them.</p>
    <ul>
      <li>An AppImage: make it executable and run it. Or a <code>.tar.gz</code> to unpack anywhere.</li>
      <li>Install <code>certutil</code> first (<code>libnss3-tools</code> on Debian and Ubuntu, <code>nss-tools</code> on Fedora). <a href="{{ '/how-to/capture-https-traffic-on-linux/' | relative_url }}">Setup steps</a>.</li>
      <li>Linux support is the newest, so please report anything that doesn't work.</li>
    </ul>
    <a class="button primary" href="{{ site.releases_url }}/latest">Get the Linux packages</a>
    <p>Download <code>VioLens-<em>version</em>-x86_64.AppImage</code> or <code>VioLens-<em>version</em>-linux-x64.tar.gz</code> from the latest release.</p>
  </section>
</div>

<div class="callout">
<p><strong>Used CLeARINET?</strong> VioLens is its new name. Install VioLens and your settings, rules and extensions come across. On Windows the installer replaces CLeARINET. On a Mac, drag CLeARINET out of Applications once VioLens is working. <a href="{{ '/guide/' | relative_url }}#upgrading-from-clearinet">More about upgrading</a>.</p>
</div>

<div class="callout">
<p><strong>Need a capture from someone else?</strong> VioLens Capture is a one-window app for a customer or colleague to record a problem and send you a SAZ file. On Windows it's a single <code>VioLensCapture-<em>version</em>-win-x64.exe</code> on the same release page, and it runs without installing. <a href="{{ '/how-to/get-a-capture-from-a-customer/' | relative_url }}">How it works</a>.</p>
</div>

## The first time you run it

1. Click **Start** to begin capturing.
2. VioLens asks you to trust a root certificate called `DO_NOT_TRUST_ViolensRoot`. It's created on your computer and only used there, and it's what lets VioLens read HTTPS traffic. On Windows you'll see Windows' own prompt. On a Mac, VioLens asks you first, then adds it to your login keychain (macOS may ask for your password). On Linux, VioLens asks first, then adds it to your browsers' certificate databases.
3. Browse as usual and the requests appear in the list. Click **Stop** when you're done, and your proxy settings go back to how they were.

Nothing VioLens captures leaves your computer unless you save or send it yourself. The [User Guide]({{ '/guide/' | relative_url }}) covers everything else.

## If Windows says it protected your PC

Windows SmartScreen may show **Windows protected your PC** when you run the installer. That happens to new downloads Windows hasn't seen many people install yet, even when they're signed. The warning goes away as more people install VioLens.

To check the installer is genuine, right-click it, choose **Properties**, and open the **Digital Signatures** tab: it should be signed by VioLens's publisher. Then run it, click **More info**, and click **Run anyway**.

VioLens doesn't collect any data. The [privacy policy]({{ '/privacy/' | relative_url }}) has the details.

## Opening it on a Mac

The Mac disk image and the app inside it are signed with an Apple Developer ID and notarized by Apple, so macOS checks them and opens VioLens without any extra steps. The first time, macOS may ask you to confirm you want to open an app downloaded from the internet. Click **Open**.

### Builds that aren't signed

Versions from before notarization started, and builds you make yourself from source, aren't notarized. The first time you open one, macOS blocks it and says it can't check it for malware. You only have to allow it once:

1. Open VioLens. When macOS stops it, click **Done** (or **OK**).
2. Open **System Settings** > **Privacy & Security**, and scroll down to the Security section. It says VioLens was blocked.
3. Click **Open Anyway**, then confirm with your password or Touch ID.

From then on it opens normally. If you prefer Terminal, this does the same thing:

```
xattr -dr com.apple.quarantine /Applications/VioLens.app
```

## What's not there yet

These are the gaps you're most likely to run into:

- HTTP/2 is on by default, but has had real-world use on Windows only so far. If a site misbehaves, turn off **Use HTTP/2 with browsers** under **Tools > Connections** to check; [here's more]({{ '/how-to/debug-http2-traffic/' | relative_url }}). HTTP/3 isn't supported.
- Only one client certificate (mutual TLS) at a time, chosen under **Tools > Connections**. Fiddler Classic's `ClientCertificate.cer` file and `https-Client-Certificate` flag aren't supported.
- Captured bodies are kept in memory (up to 64 MB each). For long captures, use the **Keep** drop-down next to Start and Stop to hold only the newest sessions.
- Plain HTTP upstream proxies work, with Negotiate, NTLM or Basic sign-in. SOCKS proxies and Digest sign-in don't yet.
- A Fiddler Classic extension has to be rebuilt from its source (usually by adding one file). You can't drop in a compiled `.dll` as it is.
- Linux is new and hasn't had much real-world use yet. It sets the proxy on GNOME and KDE Plasma only, and command-line tools such as curl need the certificate added to the system by hand ([here's how]({{ '/how-to/capture-https-traffic-on-linux/' | relative_url }}#command-line-tools)).
- The Mac version has had less use than the Windows one.
- VioLens Capture is packaged for Windows only so far.

The full list is in the [README]({{ site.repository_url }}#known-limitations). If something you rely on is missing, [let me know in Discussions]({{ site.repository_url }}/discussions). That's how I decide what to work on next.

## Build it from source

You'll need the [.NET 10 SDK](https://dotnet.microsoft.com/download). Then:

```
git clone {{ site.repository_url }}.git
cd VioLens
dotnet build VioLens.sln
dotnet test VioLens.sln
dotnet run --project apps/Violens.DesktopUi
```

## Release notes and older versions

Every version is on the [Releases page]({{ site.releases_url }}), with notes on what changed. If you find a problem, please [open an issue]({{ site.repository_url }}/issues). For questions and ideas, come and find me on [Discord]({{ site.discord_url }}) or in [Discussions]({{ site.repository_url }}/discussions).
