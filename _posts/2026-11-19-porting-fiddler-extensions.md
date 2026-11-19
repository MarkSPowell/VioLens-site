---
layout: post
title: "Building a clean-room, Fiddler-compatible extension API in .NET"
description: How VioLens ports Fiddler Classic extensions without pretending to be Fiddler.
seo_title: "A Clean-Room, Fiddler-Compatible Extension API in .NET · VioLens"
---

When I decided to build a Fiddler-compatible, multiplatform replacement from the ground up using clean-room style tactics, I quickly came to realize that the hardest part would be supporting the old but still very valuable extensions. But I’m getting ahead of myself.

If you’re not familiar with Fiddler, it was one of the first tools used for debugging web sites and REST APIs, and some of us still consider it the best, although there are some very strong alternatives. However, Fiddler Classic is no longer free-to-use for commercial purposes. That’s a big deal for me. I’ve been using Fiddler for well over 15 years. Let’s not discuss how much over, because I don’t want to feel old. 

When the license change happened, the original author of Fiddler (Eric Lawrence) wrote a [blog post](https://textslashplain.com/2026/08/05/fiddler-in-2026/) saying he was disappointed in this decision, and suggesting that someone should rewrite it from the ground up. I decided to try and become the change I wanted to see in the world, and gave it a shot: VioLens is the result. It’s a free-to-use, open source (MIT) HTTP/S Debugger that runs on Windows, macOS, and Linux. The name carries forth the musical instrument concept (violins) and adds a Dad joke (Lens, for inspecting). There’s a reason I’m not a stand-up comic. 

Which leads me to the problem of supporting these extensions. I’m a single person working as a hobby, so I’m not able to do the full-on clean room process of having one team examine the original source code, write a spec, and having another team implement that spec. I can’t read the source code at all, partly because then it wouldn’t be a clean reimplementation in any sense of the term, but also because I don’t have access. Instead, I used publicly available documentation, including the metadata tables (assembly references, type and member references) of existing extensions as well as the [fiddler-docs](https://github.com/telerik/fiddler-docs) repo, [fiddlerbook.com](https://fiddlerbook.com/), and [Progress Telerik’s FiddlerCore API reference](https://www.telerik.com/fiddler/fiddlercore/documentation/api).

My `IFiddlerExtension` is different from `Fiddler.IFiddlerExtension`, even if it has identical members, because a type isn’t only defined by its name, but also the assembly that defines it. That means an already compiled extension wouldn’t link to it.

I examined five DLLs. All reference an assembly named `Fiddler` with no public key token, so technically I could use a stand-in assembly. They all targeted Fiddler versions 2.1.0.5 to 2.4.2.5 and .NET Framework 2.0, meaning these are old binaries. And they all reference `frmViewer`, Fiddler's own undocumented WinForms main window, which presents its own challenges. 

A custom `AssemblyLoadContext` with a `Resolving` handler could hand old DLLs an in-memory shim assembly named `Fiddler`. Because their references are unsigned, nothing cryptographic stops this. However, two other things did. First and most importantly was the possible trademark risk if I pretend to be Fiddler Classic. I’m probably overthinking that part, but part of being a single person hobbyist means a key tenet of my design philosophy is “Don’t get sued”. This isn’t anything new or related to the current owners of Fiddler Classic in any way. I’ve always wanted to avoid lawsuits. From a technical perspective, I wanted VioLens to be multiplatform, and `frmViewer` would be difficult to faithfully fake under Avalonia.

Instead, I built a Fiddler-shaped layer in the main application, so many existing extensions could be ported with trivial changes, presuming you either own the source of the extension, or the licensing is permissive enough to permit this. For many, it’s three changes: deleting `using Fiddler;` from every file, adding `PortGlobalUsings.cs`, and adding a new SDK-style project targeting .NET 10. 

Here’s an example from Eric Lawrence’s [FiddlerImportNetlog](https://github.com/ericlaw1979/FiddlerImportNetlog) (BSD-3):

```csharp
using System;
using System.Collections.Generic;
using Fiddler;              // deleted by the port, in each of the three files that have it
using System.IO.Compression;

namespace FiddlerImportNetlog
{
    [ProfferFormat("NetLog JSON", "Chromium's JSON-based event log format (v1.3.7). ...", ".json;.gz")]
    public class NetLogFormatImport : ISessionImporter
    {
        public Session[] ImportSessions(string sFormat, Dictionary<string, object> dictOptions,
            EventHandler<Fiddler.ProgressCallbackEventArgs> evtProgressNotifications)
            // …
```

And I added `PortGlobalUsings.cs`, which contains 

```csharp
global using Violens.CompatShim;
global using Fiddler = Violens.CompatShim;
```

The alias is why `Fiddler.ProgressCallbackEventArgs` still compiles without the `using`. 

Some extensions were more involved. The CSP Rule Collector had its own UI, so I needed to [fork](https://github.com/MarkSPowell/CSP-VioLens-Extension) that and rebuild the UI. Eric Lawrence’s Privacy Scanner sample from Telerik’s Fiddler docs validated that extensions could add menus, columns, and row colors, again by dropping the using and removing some `System.Windows.Forms` prefixes. I added some steps in my CI to rebuild and test all three ported extensions each time on all three platforms, because knowing when I accidentally break things is important, and I’d rather find out myself than wait for someone to tell me. 

Some extensions did really cool things, but I wasn’t confident in the license. I love the idea of flagging bloated images delivered by web pages. I live in a rural area, and didn’t have broadband until about a year ago, so an efficient website is important to me. I couldn’t find any license for the ImageBloat extension, and without a license, I didn’t want to even risk looking for the source. However, the concept itself isn’t complicated, and I was able to build the functionality directly into VioLens. 

If you used to use Fiddler Classic, and especially if you maintain or use extensions, I’d love for you to give VioLens a try. If you maintain an extension, try the suggested methods to port it over and let me know if it works. If you use an extension and aren’t sure of the license, let me know what functionality it brings, and I’ll look at adding it. 

- [Downloads](https://violens.dev/download/)
- [Repo](https://github.com/MarkSPowell/VioLens)
- [Discord](https://discord.gg/NJfnGnn4PT)
