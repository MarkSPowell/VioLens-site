---
layout: page
title: About
description: Why CLeARINET exists, how it relates to Fiddler Classic, and how to get involved.
---

# About CLeARINET

<p class="lede">CLeARINET is an open source HTTP(S) inspection tool for developers: a successor to Fiddler Classic that anyone can use, for anything, for free.</p>

## Why it exists

For more than twenty years, Fiddler was the tool many developers reached for to see what their browsers and apps were really sending and receiving. Fiddler Classic's major updates mostly ended around 2016, and in 2026 Progress Software changed its licence to allow non-commercial use only.

CLeARINET was started to keep that kind of tool available to everyone: free for personal and commercial use under the MIT licence, built in the open, and running on both Windows and macOS.

## What guides it

- **Familiar to Fiddler users.** As compatible as practical with how Fiddler Classic works: its files, its scripts, its extensions and its habits.
- **Caught up with the web.** HTTP and browsers have changed a lot since 2016, and CLeARINET follows today's standards.
- **Driven by what people need.** New features come from real debugging work, like DevTools-style timing and built-in Compare.
- **Reusable.** The proxy engine is its own library, so other tools and front ends can build on it.

## Relationship to Fiddler

CLeARINET is an independent open source project. It isn't affiliated with, endorsed by or sponsored by Progress Software Corporation or Telerik. Fiddler, Fiddler Classic, Fiddler Everywhere, FiddlerCore and Telerik are trademarks of Progress Software Corporation; CLeARINET uses those names only to describe what it's compatible with, and never presents itself, or anything it ships, as Fiddler.

CLeARINET is built independently, from publicly available documentation, publicly observable behaviour (such as the structure of the `.saz` files the real tool produces) and its own design decisions. It contains no code from Fiddler, and is never built from decompiled or leaked source. The [contributing guide]({{ site.repository_url }}/blob/main/CONTRIBUTING.md) sets out this clean-room policy in full.

CLeARINET is inspired by Eric Lawrence's public writing about Fiddler, including [Fiddler in 2026](https://textslashplain.com/2026/08/05/fiddler-in-2026/). It builds on some of his published open source work under its own licences, such as the NetLog importer that comes with the installers as an optional extension.

## Get involved

- **Try it** and [report what breaks]({{ site.repository_url }}/issues). Bug reports from real networks are the most useful thing right now.
- **Contribute** code, tests or documentation. Start with the [contributing guide]({{ site.repository_url }}/blob/main/CONTRIBUTING.md) and the [code of conduct]({{ site.repository_url }}/blob/main/CODE_OF_CONDUCT.md).
- **Port an extension** you relied on in Fiddler Classic. The [User Guide]({{ '/guide/' | relative_url }}#extensions) explains how extensions work in CLeARINET.

## Licence

CLeARINET is released under the [MIT licence]({{ site.repository_url }}/blob/main/LICENSE). The optional extensions included with the installers are separate works by their authors, under their own licences.
