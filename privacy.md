---
layout: page
title: Privacy policy
description: VioLens and violens.dev don't collect, store or share any personal data. No telemetry, no accounts, no analytics and no cookies.
---

# Privacy policy

<p class="lede">The short version: VioLens doesn't collect any data about you, and neither does this website. Nothing you capture with VioLens is sent to me or anyone else.</p>

This policy covers the VioLens app (for Windows and macOS), the `Violens.ProxyCore` and `Violens.ProxyHost.Client` libraries, and this website, violens.dev. VioLens is an independent open source project, and "I" here means its maintainer.

Last updated: October 27, 2026.

## The VioLens app

VioLens doesn't collect, send or keep any information about you or how you use it.

- **No telemetry, analytics or crash reporting.** The app doesn't report usage, errors or anything else to me or to any other service.
- **No accounts and no sign-up.** You don't need to give anyone your name or email address to download or use it.
- **One update check, which you can turn off.** At start-up VioLens asks GitHub's public releases list whether a newer version is out. That request sends nothing about you or your traffic, only what any web request does (your IP address, and the VioLens version in the User-Agent). Turn it off by unchecking **Help > Check for Updates at Start-up**. VioLens never downloads or installs anything itself; you download new versions yourself.
- **Diagnostic info only goes where you paste it.** **Help > Copy Diagnostic Info** copies details for a bug report to your clipboard. It leaves out your computer's name, and nothing is sent unless you paste it somewhere yourself.
- **Captured traffic stays on your computer.** The requests and responses VioLens shows are kept in memory while it runs. They're only written to disk when you save them yourself, for example with **File > Save SAZ** or **Export HAR**, and only to the place you choose. They're never uploaded anywhere.
- **The root certificate is created on your computer.** The certificate and private key VioLens uses to decrypt HTTPS are generated on your machine and stay there. You can remove them at any time with **Tools > Remove Root Certificate**.
- **Settings stay on your computer.** Your preferences and AutoResponder rules are saved in a local file (`preferences.json`). A proxy sign-in password you type in is kept only while VioLens is running and is never saved.

### The network connections VioLens makes

VioLens is a proxy, so it makes network connections on your behalf:

- It forwards the requests your browsers, apps and devices send through it to the servers they were meant for, directly or through the upstream proxy you've set.
- If your computer uses an automatic proxy configuration (PAC) script, VioLens downloads that script from the address your computer is set to use, just as a browser would.
- Unless you've turned it off, it checks GitHub for a newer release at start-up, or when you choose **Help > Check for Updates** (see above).

It makes no other connections.

### Scripts and extensions you add

VioLens can run FiddlerScript files and extensions that you choose to load. They run with the same access as VioLens itself, so they can see your traffic and could send data elsewhere. The optional extensions that come with the installers don't send data anywhere. For anything else, check what a script or extension does before you load it.

## This website

violens.dev doesn't use cookies, analytics, advertising or tracking of any kind, and it doesn't load anything from other websites. The fonts, images and video are all served from this site.

The site is hosted on [GitHub Pages](https://pages.github.com/). Like any web host, GitHub may record technical information, such as your IP address, when your browser requests a page, for security and to keep the service running. I can't see or access those records. [GitHub's privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) explains how GitHub handles them.

## Downloads, GitHub and Discord

Downloads come from the project's [releases page on GitHub]({{ site.releases_url }}). If you open an issue, start a discussion or join the [Discord server]({{ site.discord_url }}), what you post is public (or visible to the server's members) and handled under GitHub's or Discord's own privacy policies. I only see what you choose to post there.

## Children

VioLens and this website don't knowingly collect information from anyone, including children, because they don't collect information at all.

## Changes to this policy

If this policy ever changes, the new version will be posted on this page with a new date. The page's full history is public in the [website's repository on GitHub](https://github.com/MarkSPowell/VioLens-site).

## Contact

Questions about privacy? Email **security@violens.dev** or [open an issue]({{ site.repository_url }}/issues) on GitHub.
