---
layout: page
howto: true
order: 7
title: How to get a capture from a customer (a FiddlerCap alternative)
seo_title: "How to Get a Capture from a Customer: FiddlerCap Alternative"
description: Send VioLens Capture to a customer or colleague so they can record a problem as a SAZ file with one click, no setup, the way FiddlerCap worked.
summary: "Send someone VioLens Capture, a one-window app, and they can record the problem for you as a SAZ file."
---

# How to get a capture from a customer

<p class="lede">When a problem only happens on someone else's computer, you need their traffic, not yours. VioLens Capture is a separate app with one window and nothing to set up, so anyone can record a capture and send it to you. If you used Fiddler's FiddlerCap, it works the same way.</p>

## 1. Send them VioLens Capture

On the [latest release]({{ site.releases_url }}/latest), download `VioLensCapture-version-win-x64.exe` and send it to them, or send them the link. It's a single file that runs without installing anything.

VioLens Capture is packaged for Windows only for now.

## 2. What they do

1. Run the file you sent.
2. Click **Start Capture**. With **Include secure (HTTPS) websites** checked, which it is by default, VioLens Capture adds its certificate, and Windows may ask them to confirm. That's what lets the capture show what was sent to HTTPS sites. If they uncheck it, nothing is trusted, and the capture only shows which secure sites were visited.
3. Do whatever shows the problem in their browser.
4. Click **Stop Capture**. Their proxy setting goes back to how it was.
5. Click **Save Capture…** and send you the `.saz` file.

When they close the window, VioLens Capture removes the certificate it added (unless they unchecked that).

## 3. Open it

In VioLens, choose **File > Open SAZ** and pick the file. The sessions appear as if you'd captured them yourself, with their timings.

## Things worth telling them

- **A capture can contain passwords and cookies.** VioLens Capture reminds them of this. Ask them to sign out of anything they don't need first, and only send the file to you.
- **It only records.** No breakpoints, rules, scripts or extensions run, so it can't change their traffic.
- **Don't run it alongside VioLens.** If they also have VioLens, they share a certificate and settings, so close one before starting the other.

<div class="related" markdown="1">
**Related:** [Open SAZ files, and convert them to HAR]({{ '/how-to/open-saz-files/' | relative_url }}) · [User Guide: VioLens Capture]({{ '/guide/' | relative_url }}#violens-capture-a-capture-from-someone-else) · [Switching from Fiddler Classic]({{ '/fiddler-classic-alternative/' | relative_url }})
</div>
