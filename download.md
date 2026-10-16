---
layout: page
title: Download
description: Download CLeARINET for Windows or macOS, or build it from source.
---

# Download CLeARINET

<p class="lede">CLeARINET is in preview: it works, and it's getting better with every release. Every release, with its notes, is on GitHub.</p>

<div class="downloads">
  <section class="download">
    <h2>Windows</h2>
    <p>64-bit Windows 10 or 11. One installer, with everything it needs built in.</p>
    <ul>
      <li>Installs just for you, or for everyone on the computer.</li>
      <li>Code-signed, so Windows can check it hasn't been changed.</li>
      <li>Optional extensions are offered as checkboxes during setup.</li>
    </ul>
    <a class="button primary" href="{{ site.releases_url }}/latest">Get the Windows installer</a>
    <p>Download <code>CLeARINET-Setup-<em>version</em>.exe</code> from the latest release.</p>
  </section>

  <section class="download">
    <h2>macOS</h2>
    <p>macOS 11 or later on Apple silicon (M1 and newer). A disk image to drag into Applications.</p>
    <ul>
      <li>Still being tested on real Macs. Please report anything that doesn't work.</li>
      <li>Not yet notarized by Apple: the first time, allow it in System Settings &gt; Privacy &amp; Security.</li>
      <li>Optional extensions are in the disk image's Optional Extensions folder.</li>
    </ul>
    <a class="button primary" href="{{ site.releases_url }}/latest">Get the macOS disk image</a>
    <p>Download <code>CLeARINET-<em>version</em>-macos-arm64.dmg</code> from the latest release.</p>
  </section>
</div>

## The first time you run it

1. Click **Start** to begin capturing.
2. CLeARINET asks you to trust a new root certificate, named `DO_NOT_TRUST_ClearinetRoot`. It's made on your computer, just for your computer, and it's what lets CLeARINET read HTTPS traffic. On Windows this is Windows' own prompt; on macOS, CLeARINET asks first and then adds it to your login keychain.
3. Browse, and the requests appear in the session list. Click **Stop** when you're done, and your proxy settings go back to how they were.

Nothing CLeARINET captures leaves your computer unless you save or send it yourself. The [User Guide]({{ '/guide/' | relative_url }}) covers the rest.

## Build it from source

You'll need the [.NET 10 SDK](https://dotnet.microsoft.com/download). Then:

```
git clone {{ site.repository_url }}.git
cd CLeARINET
dotnet build CLeARINET.sln
dotnet test CLeARINET.sln
dotnet run --project apps/Clearinet.DesktopUi
```

## Release notes and older versions

Every version, with what changed, is on the [Releases page]({{ site.releases_url }}). Found a problem? [Open an issue]({{ site.repository_url }}/issues).
