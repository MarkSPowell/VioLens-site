---
layout: page
title: About
seo_title: About VioLens, an Open Source Fiddler Classic Alternative
description: Why I built VioLens after Fiddler Classic became non-commercial only, how it relates to Fiddler, and how to get involved.
---

# About VioLens

<p class="lede">VioLens is a free, open source HTTP(S) debugging proxy for Windows and Mac. I work in tech during the day and build VioLens in my spare time. Anyone can use it, for anything.</p>

## Why I started it

I've used Fiddler for more than 15 years, mostly to troubleshoot problems at work and to debug web apps and APIs. Whenever something didn't behave, it was the first thing I opened.

In 2026 Progress Software changed Fiddler Classic's license to allow non-commercial use only. That meant I couldn't keep using it the way I always had, and neither could a lot of other people. Fiddler Classic hadn't had a major update in years anyway, and it only ever ran on Windows. So I started building a replacement: free for personal and commercial use under the MIT license, built in the open, and running on both Windows and macOS.

Building it has been humbling. Fiddler had far more features than I'd ever touched in all those years, and recreating them meant finally learning what they all do.

## The name

Until version 0.2, VioLens was called CLeARINET. I kept the musical theme (say it out loud and you'll hear violins), and the lens is the point of the tool: seeing inside the traffic your browsers and apps send. Your settings carry over from CLeARINET automatically. The [User Guide]({{ '/guide/' | relative_url }}#upgrading-from-clearinet) explains what changes.

## What I'm aiming for

If you know Fiddler Classic, VioLens should feel familiar. I've tried to make its files, scripts, extensions and keyboard shortcuts work as closely to Fiddler's as I can. But a lot has changed since 2016 (HTTP/2, Brotli, WebSockets everywhere, stricter cookie rules), so it handles those too. Most new features came out of my own debugging: the DevTools-style timing and the built-in Compare both started that way. And the proxy engine is a separate library, so other people can build their own tools on it.

## VioLens and Fiddler

VioLens is an independent project. It isn't affiliated with, endorsed by or sponsored by Progress Software Corporation or Telerik. Fiddler, Fiddler Classic, Fiddler Everywhere, FiddlerCore and Telerik are trademarks of Progress Software Corporation. I use those names only to say what VioLens is compatible with, and VioLens never presents itself, or anything it ships, as Fiddler.

It's written from scratch. I work from public documentation, behavior anyone can observe (such as the structure of the `.saz` files Fiddler saves) and my own design decisions. It contains no Fiddler code and is never built from decompiled or leaked source. The [contributing guide]({{ site.repository_url }}/blob/main/CONTRIBUTING.md) sets out this clean-room rule in full.

Eric Lawrence's public writing about Fiddler, including [Fiddler in 2026](https://textslashplain.com/2026/08/05/fiddler-in-2026/), has been a big help. VioLens also builds on some of his published open source work under its own licenses, such as the NetLog importer that the installers offer as an optional extension.

## Getting involved

- Try it, and [tell me what breaks]({{ site.repository_url }}/issues). Bug reports from real networks are the most useful thing right now.
- Come and talk about it on [Discord]({{ site.discord_url }}): questions, ideas, or how you're using VioLens.
- Contribute code, tests or documentation. The [contributing guide]({{ site.repository_url }}/blob/main/CONTRIBUTING.md) and [code of conduct]({{ site.repository_url }}/blob/main/CODE_OF_CONDUCT.md) are the place to start.
- If you relied on a Fiddler Classic extension, help port it. The [User Guide]({{ '/guide/' | relative_url }}#extensions) explains how extensions work in VioLens.

## License

VioLens is released under the [MIT license]({{ site.repository_url }}/blob/main/LICENSE). The optional extensions that come with the installers are separate works by their authors, under their own licenses.
