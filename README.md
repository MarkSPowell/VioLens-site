# VioLens website

The website for [VioLens](https://github.com/MarkSPowell/VioLens), the
open source HTTP(S) inspection tool.

GitHub Pages builds it with Jekyll, so there's nothing to install or run:
push to `main` and the site updates within a minute or two.

## Pages

| File | Page |
|---|---|
| `index.html` | Home |
| `download.md` | Download (links to the latest GitHub release) |
| `guide.md` | User Guide, generated from the app's `docs/User Guide.md` |
| `developers.md` | Embedding ProxyCore, generated from the app's `docs/Embedding ProxyCore.md` |
| `about.md` | Background, relationship to Fiddler, license, contributing |
| `fiddler-classic-alternative.md` | For people leaving Fiddler Classic: the license change, what carries over, how to switch, FAQ |
| `compare.md` | VioLens compared with other web debuggers. Not published yet (`published: false`) until it's fact-checked |
| `how-to/` | Short how-to guides; a page with `howto: true` and an `order` is listed on `/how-to/` automatically |
| `privacy.md` | Privacy policy (linked from the footer, the Download page and Microsoft submissions). Update it if the app or site ever starts sending data anywhere |
| `robots.txt` | Points search engines at `/sitemap.xml`, which jekyll-sitemap generates |

Search titles and link previews: each page can set `seo_title` (the title
in search results; keep it under about 60 characters) and `description`
(the snippet; under about 155). `jekyll-seo-tag` adds the canonical link,
Open Graph and Twitter tags, using `assets/social-card.png` as the preview
image unless a page sets `image`. The FAQ on the Fiddler page comes from
its front matter, via `_includes/faq.html`, which also writes the FAQ's
structured data.

The look is in `assets/site.css`, and the fonts are served from `assets/fonts` rather than Google Fonts, so the site makes no third-party requests; the header and footer are in
`_layouts/default.html`.

## Updating the User Guide and the developer guide

Don't edit `guide.md` or `developers.md` by hand. Edit `docs/User Guide.md`
or `docs/Embedding ProxyCore.md` in the VioLens repository, then, from this
folder:

```
./update-guide.ps1
```

It finds the VioLens repository next to this one, or next to the folder
this one is in (pass `-Repository` to point elsewhere), copies both
documents in, adds their contents lists, and points links to other files at
GitHub. Commit and push `guide.md` and `developers.md`.

## Turning on GitHub Pages

1. Settings > Pages > Build and deployment: **Deploy from a branch**,
   branch `main`, folder `/ (root)`.
2. Custom domain: `violens.dev` (the `CNAME` file), with **Enforce HTTPS**
   on. The DNS is in Route 53: an A record for `violens.dev` with GitHub
   Pages' four addresses (185.199.108.153 to 185.199.111.153), and a CNAME
   for `www` pointing to `markspowell.github.io`.

The pages only work once GitHub has built them: opening `index.html`
straight from the folder shows the page without its links and styles.
