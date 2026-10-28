---
layout: page
title: How-to guides
seo_title: "HTTPS Debugging How-to Guides · VioLens"
description: Step-by-step guides to debugging web traffic with VioLens, a free HTTPS debugging proxy - on a Mac, on phones, with WebSockets, mocks and SAZ files.
---

# How-to guides

<p class="lede">Short, step-by-step guides to common debugging jobs with VioLens. For everything else, the <a href="{{ '/guide/' | relative_url }}">User Guide</a> covers every feature.</p>

{% assign guides = site.pages | where: "howto", true | sort: "order" %}
<ul class="howto-list">
{%- for g in guides %}
  <li><a href="{{ g.url | relative_url }}">{{ g.title }}</a><p>{{ g.summary | default: g.description }}</p></li>
{%- endfor %}
</ul>
