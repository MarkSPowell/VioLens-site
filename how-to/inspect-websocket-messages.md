---
layout: page
howto: true
order: 5
title: How to inspect WebSocket messages
seo_title: "How to Inspect WebSocket Messages from Any App · VioLens"
description: See every WebSocket message an app or browser sends and receives, decompressed and live, with VioLens, a free HTTPS debugging proxy.
summary: "Watch every message a WebSocket sends and receives, as it happens."
---

# How to inspect WebSocket messages

<p class="lede">Chat apps, live dashboards and development servers keep a WebSocket open and send messages over it. Browser developer tools can show a browser's WebSockets, but VioLens shows them for any app that goes through it, decompressed and as they arrive.</p>

## 1. Capture the connection

Start VioLens, then open the app or page. A WebSocket connection shows in the session list as the request that opened it, with status **101**. To find it quickly, type `status:101` in the filter box.

## 2. Open the WebSocket tab

Select the session and open the **WebSocket** tab. Each message has a row:

- **↑** is a message the client sent, and **↓** one it received.
- Each row shows when it was sent, its type (text, binary, close, ping or pong), its size and the start of its data.
- Select a row to see the whole message. JSON is indented, and binary data is shown as hex.

The list keeps growing while the connection is open. Check **Hide pings and pongs** to hide keep-alive messages.

## 3. Search and save

**Find** (**Ctrl+F**) searches text messages too. To keep the messages, use **File > Export HAR**: WebSocket messages are saved in HAR files, but not in SAZ files yet.

Compressed messages (permessage-deflate) are decompressed for you, and messages sent in several pieces are put back together.

<div class="related" markdown="1">
**Related:** [Capture HTTPS on a Mac]({{ '/how-to/capture-https-traffic-on-mac/' | relative_url }}) · [User Guide: WebSocket messages]({{ '/guide/' | relative_url }}#websocket-messages)
</div>
