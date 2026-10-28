---
layout: page
howto: true
order: 4
title: How to mock an API response without changing the server
seo_title: "How to Mock API Responses with a Proxy · VioLens"
description: Answer requests with a local file, an error, a redirect or a delay using VioLens's AutoResponder, so you can test your app without touching the server.
summary: "Answer requests with a file, an error, a redirect or a delay, without touching the server."
---

# How to mock an API response without changing the server

<p class="lede">The AutoResponder answers matching requests itself, so they never reach the server. Use it to test how your app handles an error, a slow response or data the server doesn't send yet. The rules work the same way as Fiddler Classic's.</p>

## 1. Capture the real response

Start VioLens and use the app until the request you want to mock shows up in the session list. Copy its response body into a file, such as `orders.json`, and change it however you like.

## 2. Add a rule

1. Check **Tools > AutoResponder** to show the rules.
2. Click **Add Rule**.
3. In **Match**, enter text from the URL, such as `/api/orders`. You can also use `EXACT:` for the full URL, `regex:` for a regular expression, `NOT:` to match everything else, or `METHOD:POST`.
4. In **Action**, enter the path of your file, such as `C:\mocks\orders.json` or `/Users/you/mocks/orders.json`.
5. Check the box at the start of the row to turn the rule on.

The next time your app requests that URL, it gets your file.

## Other things a rule can do

| Action | What happens |
|---|---|
| `https://other.example.com/...` | Serves another URL's response instead |
| `*redir:https://...` | Sends a redirect |
| `*delay:3000` | Waits 3 seconds before carrying on, to test a slow server |
| `*header:Name=Value` | Adds or changes a header |
| `*drop` | Closes the connection without a response |
| `*reset` | Resets the connection |
| `*bpu` | Pauses the request at a breakpoint so you can edit it |

Rules are checked in order and the first match wins, so use **Move Up** and **Move Down** when two rules could match. VioLens remembers your rules, but the AutoResponder always starts switched off, so a forgotten rule can't catch you out.

<div class="related" markdown="1">
**Related:** [Edit and replay requests]({{ '/how-to/edit-and-replay-http-requests/' | relative_url }}) · [User Guide: AutoResponder]({{ '/guide/' | relative_url }}#autoresponder) · [Switching from Fiddler Classic]({{ '/fiddler-classic-alternative/' | relative_url }})
</div>
