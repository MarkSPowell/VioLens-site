---
layout: post
title: "Why your mobile app's traffic doesn't show up in your proxy"
description: Proxy set, certificate installed, and still nothing from your app? How to tell which setting is wrong from what VioLens shows you.
seo_title: "Why Your Mobile App's Traffic Doesn't Show Up in Your Proxy · VioLens"
---

You’re troubleshooting an application on your phone. You know there’s something wrong with how it’s calling the back end API, but you’re not entirely sure what it could be. Maybe you’ve already followed the [guide on how to debug Android or iPhone traffic](https://violens.dev/how-to/debug-iphone-android-traffic/), maybe not. But it’s not working and you need it to.

Let’s look at the common errors and what they might tell us about the application or set up. There are two or three major things that have to happen, depending on how you count them.

First, the traffic has to be routed to the proxy that VioLens runs. Seeing no traffic at all likely means this part isn’t set up correctly. Verify that in VioLens, you’ve checked **Tools > Connections** and turned on **Allow remote computers to connect**. Click **Stop**, then **Start**, if it wasn’t. Second, your firewall software may prompt to allow VioLens. If so, allow it on private networks.

Third, make sure the phone is using a proxy, and the proxy is pointing to the IP address and port specified in VioLens.

If you're not seeing any traffic, it’s almost certainly one of these settings.

If you’re seeing traffic, but it’s full of `CONNECT` tunnels failing, that’s a problem with the TLS handshake. There are two failure modes. If all or almost all connections fail, it’s likely that the phone doesn’t trust VioLens’s certificate. Following the instructions linked above to add the VioLens certificate, or similar steps for other products, should allow you to intercept traffic from things like browsers.

Some applications will maintain their own list of allowed certificates instead of allowing the phone to do so. This is commonly called certificate pinning. The symptom you’d see here is that you can see some traffic (usually browsers) but not for a specific application. Instead, you’d see `CONNECT` tunnels failing just for that application.

The same behavior for a slightly different reason is particularly common in recent Android apps. Ever since Android 7 (API 24), apps no longer trust user-added CAs by default, again leaving you at the point where you can see browser traffic in VioLens, but get `CONNECT` tunnels failing for applications. This is the default behavior, so unless the author has chosen to trust user-added certificates, you’ll see this in the application.

That’s fine for an application you’re writing and debugging. You’re the author, and you can choose whether to trust added certificates by adding a certificates src to your `res/xml/network_security_config.xml` as below, and don’t worry, this only works in debug builds, so your release build will be unaffected. You’ll need to ensure that `AndroidManifest.xml` points to it as well (`android:networkSecurityConfig="@xml/network_security_config"` on the `<application>` element, if it’s not there already).

```xml
<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <debug-overrides>
        <trust-anchors>
            <certificates src="user" />
        </trust-anchors>
    </debug-overrides>
</network-security-config>
```

It’s more difficult to do this on an app you don’t control: the author of the app hasn’t specifically told their app to trust added certificates, and it requires rooted Android devices to override that.

Certificate pinning on iOS can be a bit different. Apps will trust certificates you’ve told iOS to trust, so if it fails, it’s almost certainly explicit certificate pinning. On your own application, you can leave pins out of debug builds so you can debug your own app, but you have some of the same problems for an app someone else has written and decided to use certificate pinning.

This really only matters if you need to see what content is being passed. If all you need to see is what hosts are being contacted, setting **Skip decryption for** in VioLens will make the app start working. You’ll be able to see what servers the application talks to, but not listen into what was actually said. Can be important if the goal is to ensure the right domains are allowlisted on your firewall or proxy, for example.

For most devices, including mobile devices, setting a proxy is a suggestion that the HTTP library may choose to follow, or it may choose to ignore. VioLens and similar products act as proxies to become part of the conversation and be able to do what they need to do, so an HTTP library that chooses to not support a proxy will not work. You see the same behavior for similar reasons with QUIC/HTTP/3 or raw sockets.

Flutter apps commonly display this behavior, for example. Flutter uses Dart’s own HTTP client, and that client ignores the proxy settings. If the Flutter app is one you’re writing, you can fix this in debug builds yourself by setting the proxy explicitly:

```dart
final client = HttpClient()
  ..findProxy = (uri) => 'PROXY 192.168.1.20:8888';
```

Of course, use the proxy address VioLens shows under **Tools > Connections**, which may not be the same.

If you’re using an emulator/simulator, this still works. For an Android Emulator, you have two places to set the proxy: you want the emulated phone's Wi-Fi proxy, not the proxy for the emulator itself. And you’ll likely need to set the proxy to `10.0.2.2`, the default address for the emulator's host. For an iOS Simulator, it’ll use the macOS network settings, which means the easiest way is to just run VioLens (or similar application) on the host macOS itself, which will prompt you to install the VioLens certificate on the macOS device. You’ll also need to install the certificate inside the simulated iOS device, typically by dragging `ViolensRoot.cer` into the simulator and then turning on full trust under **Settings > General > About > Certificate Trust Settings**.

The key to troubleshooting something like this is looking at the symptoms, and thinking about which stage of the communication would fail that way. This lets you target specific settings that could be the issue, while ruling out many more that would result in different symptoms.

- [Download VioLens](https://violens.dev/download/)
- [Repo](https://github.com/MarkSPowell/VioLens)
- [Discord](https://discord.gg/NJfnGnn4PT)
