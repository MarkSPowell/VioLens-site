---
layout: page
howto: true
order: 1.2
title: How to capture and decrypt HTTPS traffic on Linux
seo_title: "How to Capture and Decrypt HTTPS Traffic on Linux · VioLens"
description: See the HTTPS requests your browsers and apps make on Linux, decrypted, with VioLens, a free Fiddler-style debugging proxy for GNOME and KDE Plasma.
summary: "Install VioLens on Linux, trust its certificate in your browsers, and see what they send."
---

# How to capture and decrypt HTTPS traffic on Linux

<p class="lede">Fiddler Classic never ran on Linux. VioLens does, with the same session list, inspectors, breakpoints and AutoResponder as on Windows and Mac. Here's how to set it up.</p>

You'll need 64-bit (x86-64) Linux. VioLens sets the system proxy for you on GNOME, KDE Plasma and desktops built on them, such as Cinnamon and Budgie. Linux support is new, so if something doesn't work, please [open an issue]({{ site.repository_url }}/issues).

## 1. Install certutil

VioLens uses `certutil` to add its certificate to your browsers. Install it before the first Start:

- **Debian and Ubuntu:** `sudo apt install libnss3-tools`
- **Fedora:** `sudo dnf install nss-tools`
- **Arch:** `sudo pacman -S nss`

## 2. Install VioLens

[Download]({{ '/download/' | relative_url }}) one of the two packages from the latest release:

- **AppImage:** make it executable with `chmod +x VioLens-*.AppImage`, then run it.
- **`.tar.gz`:** unpack it anywhere and run `./violens`. To add VioLens to your applications menu, run `./install-desktop-entry.sh` once.

## 3. Start capturing, and trust the certificate

Click **Start**. The first time, VioLens explains that it needs to trust a certificate called `DO_NOT_TRUST_ViolensRoot`, and asks before adding it. The certificate is created on your computer and trusted for your account only. VioLens adds it to:

- the certificate database Chrome, Chromium, Edge and Brave read,
- every Firefox profile, including the snap's and the Flatpak's.

Restart Firefox if it was open. VioLens also sets itself as the proxy in your desktop's settings, which Chrome follows, and Firefox too unless you've changed its proxy setting.

## 4. Browse, and read the traffic

Load a page, and each request appears in the session list. Click one to see its headers and body, or open the **Timing** tab to see where the time went. Type in the filter box to narrow the list, for example `host:api.example.com`.

## 5. Stop when you're done

Click **Stop**, and VioLens puts your proxy settings back. If VioLens crashes, it puts them back the next time it starts. To remove the certificate from your browsers, choose **Tools > Remove Root Certificate**.

## Command-line tools

curl, wget, Python and most other command-line tools don't read the desktop's proxy setting, and don't use your browsers' certificates. Point them at VioLens yourself, using the address shown in VioLens's status bar:

```bash
export https_proxy=http://127.0.0.1:PORT http_proxy=http://127.0.0.1:PORT
```

To make them trust VioLens's certificate, it has to go in the system's certificate store, which needs root access. While VioLens is capturing, open `http://violens/` in a browser, download `ViolensRoot.cer`, then on Debian or Ubuntu:

```bash
openssl x509 -inform der -in ViolensRoot.cer -out violens-root.crt
sudo cp violens-root.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates
```

On Fedora, copy `violens-root.crt` to `/etc/pki/ca-trust/source/anchors/` and run `sudo update-ca-trust` instead. When you've finished, delete the file from that folder and run the same update command again.

## If you don't see some traffic

- **Your desktop isn't GNOME or KDE Plasma.** VioLens can't set the proxy for you. Set your browser's proxy to the address VioLens shows.
- **An app rejects the certificate.** Some apps only trust their own server's certificate (certificate pinning). List their hosts under **Skip decryption for** in **Tools > Connections**, and VioLens passes their traffic through without decrypting it.
- **Your company network uses a proxy.** If you started VioLens with `http_proxy` or `https_proxy` set, it sends traffic on through that proxy. See [Connections]({{ '/guide/' | relative_url }}#connections-upstream-proxy-and-other-devices) in the User Guide.

<div class="related" markdown="1">
**Related:** [User Guide: Linux]({{ '/guide/' | relative_url }}#linux) · [Capture HTTPS on a Mac]({{ '/how-to/capture-https-traffic-on-mac/' | relative_url }}) · [Switching from Fiddler Classic]({{ '/fiddler-classic-alternative/' | relative_url }})
</div>
