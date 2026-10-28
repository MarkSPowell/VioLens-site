---
layout: page
howto: true
order: 3
title: How to edit and replay HTTP requests
seo_title: "How to Edit, Intercept and Replay HTTP Requests · VioLens"
description: Pause a live request with a breakpoint and change it, resend a captured request, or write one from scratch, with VioLens, a free debugging proxy.
summary: "Pause a live request and change it, send a captured one again, or write one from scratch."
---

# How to edit and replay HTTP requests

<p class="lede">VioLens gives you three ways to change what gets sent: pause a live request and edit it, send a captured request again, or write a request yourself. If you've used Fiddler Classic, these are its breakpoints, Reissue and Composer.</p>

All of them work while VioLens is capturing, so click **Start** first.

## Change a request while it's in flight

1. Check **Tools > Also Break On** and enter some text from the URL in **URL contains**. Or type `bpu /api/orders` in the QuickExec box under the session list.
2. Do whatever sends the request. It stops and appears in the **Breakpoints** panel.
3. Select it to see the raw request: the first line, the headers and the body, as text you can edit.
4. Change what you need to, then click **Resume** to send it, or **Abort** to drop the connection.

To change a response before the browser gets it, use **Break on Responses**, or `bpafter text` in QuickExec. Type `go` to let everything that's paused carry on, and `bpu` on its own to stop pausing.

## Send a captured request again

Select a session and press **R**, or choose **Edit > Replay Selected Session**. VioLens sends the same request again, byte for byte, and the result shows up as a new session. It's handy for checking whether a fix worked, or whether a failure happens every time.

## Edit a captured request and send it

Select a session and choose **Edit > Edit in Composer**. The request opens in the **Composer** tab as raw HTTP. Change the URL, the headers or the body, and click **Execute**.

You can also write a request from scratch:

```
POST https://api.example.com/items HTTP/1.1
Content-Type: application/json

{"name": "test"}
```

For bodies that aren't text, such as images or protobuf, set **Body** to **Hex** or **From a file**.

## See what changed

To compare the request that works with the one that doesn't, select both (Ctrl+click, or Cmd+click on a Mac) and press **Ctrl+W**. VioLens shows them side by side, with the differences highlighted.

<div class="related" markdown="1">
**Related:** [Mock an API response]({{ '/how-to/mock-api-responses/' | relative_url }}) · [User Guide: Breakpoints]({{ '/guide/' | relative_url }}#breakpoints) · [User Guide: Composer and Replay]({{ '/guide/' | relative_url }}#composer-and-replay)
</div>
