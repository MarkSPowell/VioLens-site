---
layout: page
howto: true
order: 6
title: How to open Fiddler SAZ files, and convert them to HAR
seo_title: "How to Open SAZ Files and Convert SAZ to HAR · VioLens"
description: Open a .saz Fiddler session archive without Fiddler, on Windows or a Mac, and save it as a HAR file for browser developer tools and support teams.
summary: "Open a .saz file without Fiddler, on Windows or a Mac, and save it as HAR."
---

# How to open Fiddler SAZ files, and convert them to HAR

<p class="lede">A <code>.saz</code> file is a Fiddler Session Archive: a zip of captured requests and responses. Someone may have sent you one to look at, or you may have years of them saved. VioLens opens them for free on Windows and on a Mac, and can save them as HAR.</p>

## Open a SAZ file

1. [Download VioLens]({{ '/download/' | relative_url }}) and open it.
2. Choose **File > Open SAZ** and pick the file.

The sessions appear in the list as if they'd just been captured. Click one to see its headers and body, use **Find** (**Ctrl+F**) to search inside them, or select two and press **Ctrl+W** to compare them.

## Convert SAZ to HAR

HAR (HTTP Archive) is the format browsers' developer tools and many support teams use.

1. Open the `.saz` file as above.
2. To leave some sessions out, select them and press **Delete**.
3. Choose **File > Export HAR** and save the file.

Bodies are saved decompressed, as text where they're text, and the timings are included.

## Convert HAR to SAZ

It works the other way too. Choose **File > Import HAR** to load a `.har` file, such as one exported from Chrome or Edge, then **File > Save SAZ**.

## Before you share a capture

Captures often contain cookies, sign-in tokens and personal data. Remove sessions you don't need before sending a SAZ or HAR file to anyone, and be wary of files from people you don't know.

<div class="related" markdown="1">
**Related:** [Switching from Fiddler Classic]({{ '/fiddler-classic-alternative/' | relative_url }}) · [User Guide: Saving and loading]({{ '/guide/' | relative_url }}#saving-and-loading-captured-sessions)
</div>
