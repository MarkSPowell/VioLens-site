---
layout: page
howto: true
order: 2
title: How to see your iPhone or Android phone's HTTPS traffic
seo_title: "How to Capture iPhone and Android HTTPS Traffic · VioLens"
description: Route a phone's traffic through VioLens on your Windows PC or Mac, install its certificate, and inspect the HTTPS requests your mobile apps make.
---

# How to see your iPhone or Android phone's HTTPS traffic

<p class="lede">To debug a mobile app or a mobile website, send the phone's traffic through VioLens on your computer. You'll see each request the phone makes, decrypted, just like your computer's own traffic.</p>

The phone and the computer need to be on the same network.

## 1. Let other devices connect

In VioLens, check **Tools > Connections** and turn on **Allow remote computers to connect**. Then click **Start** (or Stop and Start again, as the setting takes effect on the next Start). Your firewall may ask whether to allow VioLens: allow it on private networks.

The Connections row now shows the address and port to use, such as `192.168.1.20:8888`.

## 2. Point the phone at VioLens

**iPhone or iPad:** open **Settings > Wi-Fi**, tap the **(i)** next to your network, then **Configure Proxy > Manual**. Enter the address as the server and the port, and save.

**Android:** open your Wi-Fi settings, edit the network you're on, and set **Proxy** to **Manual**. Enter the address as the hostname and the port, and save. The exact menus vary from phone to phone.

## 3. Install VioLens's certificate on the phone

With the proxy set, open a browser on the phone and go to `http://violens/`. The page lets you download VioLens's root certificate and explains how to install it.

- **iPhone:** after installing the profile, you also have to turn on full trust for it in **Settings > General > About > Certificate Trust Settings**. Until you do, HTTPS sites fail.
- **Android:** install it as a CA certificate in the security settings. Browsers such as Chrome then trust it. Most apps don't trust certificates you install yourself unless the app's developer allows it, so for your own app, add a debug network security configuration.

## 4. Use the phone

Open the app or site, and its requests appear in VioLens's session list. Everything else works as usual: breakpoints, the AutoResponder, Composer and Replay.

## 5. Clean up

When you've finished, turn the phone's proxy off, remove VioLens's certificate from the phone, and turn off **Allow remote computers to connect**. While that setting is on, anyone on your network can use your proxy.

<div class="related" markdown="1">
**Related:** [Mock an API response]({{ '/how-to/mock-api-responses/' | relative_url }}) · [Capture HTTPS on a Mac]({{ '/how-to/capture-https-traffic-on-mac/' | relative_url }}) · [User Guide: Connections]({{ '/guide/' | relative_url }}#connections-upstream-proxy-and-other-devices)
</div>
