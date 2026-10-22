---
layout: page
title: Download
description: Download VioLens for Windows or macOS, or build it from source.
---

# Download VioLens

<p class="lede">VioLens is in preview: it works, and it's getting better with every release. Every release, with its notes, is on GitHub.</p>

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
    <p>Download <code>VioLens-Setup-<em>version</em>.exe</code> from the latest release.</p>
  </section>

  <section class="download">
    <h2>macOS</h2>
    <p>macOS 11 or later on Apple silicon (M1 and newer). A disk image to drag into Applications.</p>
    <ul>
      <li>Still being tested on real Macs. Please report anything that doesn't work.</li>
      <li>Not yet notarized by Apple, so macOS asks you to allow it the first time: see <a href="#opening-it-on-a-mac-the-first-time">Opening it on a Mac</a> below.</li>
      <li>Optional extensions are in the disk image's Optional Extensions folder.</li>
    </ul>
    <a class="button primary" href="{{ site.releases_url }}/latest">Get the macOS disk image</a>
    <p>Download <code>VioLens-<em>version</em>-macos-arm64.dmg</code> from the latest release.</p>
  </section>
</div>

<div class="callout">
<p><strong>Used CLeARINET?</strong> VioLens is its new name. Install VioLens and your settings, rules and extensions come with it. On Windows the installer replaces CLeARINET; on macOS, remove CLeARINET from Applications once VioLens is working. See <a href="{{ '/guide/' | relative_url }}#upgrading-from-clearinet">Upgrading from CLeARINET</a>.</p>
</div>

## The first time you run it

1. Click **Start** to begin capturing.
2. VioLens asks you to trust a new root certificate, named `DO_NOT_TRUST_ViolensRoot`. It's made on your computer, just for your computer, and it's what lets VioLens read HTTPS traffic. On Windows this is Windows' own prompt; on macOS, VioLens asks first and then adds it to your login keychain.
3. Browse, and the requests appear in the session list. Click **Stop** when you're done, and your proxy settings go back to how they were.

Nothing VioLens captures leaves your computer unless you save or send it yourself. The [User Guide]({{ '/guide/' | relative_url }}) covers the rest.

## Opening it on a Mac the first time

VioLens isn't notarized by Apple yet (that needs a paid Apple developer membership), so the first time you open it, macOS stops it with a message saying it can't check it for malware. To allow it, once:

1. Drag VioLens from the disk image into Applications, and open it. When macOS stops it, click **Done** (or **OK**).
2. Open **System Settings** > **Privacy & Security**, and scroll down to the Security section. It says VioLens was blocked.
3. Click **Open Anyway**, then confirm with your password or Touch ID.

After that, VioLens opens normally. If you'd rather use Terminal, this does the same thing:

```
xattr -dr com.apple.quarantine /Applications/VioLens.app
```

## What's not there yet

VioLens is a preview. It handles everyday debugging well, and these are the gaps you might run into:

- **HTTP/2 and HTTP/3** aren't supported yet. Connections through VioLens use HTTP/1.1, which every site still accepts.
- **Client certificates (mutual TLS)** aren't sent yet, so a server that requires one refuses the connection.
- **Upstream proxies:** plain HTTP proxies work, with Negotiate, NTLM or Basic sign-in. SOCKS proxies and Digest sign-in don't yet.
- **Extensions:** a Fiddler Classic extension has to be rebuilt from its source for VioLens (usually by adding one file); a compiled `.dll` can't be dropped in as it is.
- **macOS** has had less testing on real Macs than Windows has.

The full list is in the [README]({{ site.repository_url }}#known-limitations). If something you rely on is missing, [say so in Discussions]({{ site.repository_url }}/discussions): that's how features get picked.

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

Every version, with what changed, is on the [Releases page]({{ site.releases_url }}). Found a problem? [Open an issue]({{ site.repository_url }}/issues). Questions and ideas are welcome on [Discord]({{ site.discord_url }}) or in [Discussions]({{ site.repository_url }}/discussions).
