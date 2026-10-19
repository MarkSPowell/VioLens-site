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
| `about.md` | Background, relationship to Fiddler, licence, contributing |

The look is in `assets/site.css`; the header and footer are in
`_layouts/default.html`.

## Updating the User Guide

Don't edit `guide.md` by hand. Edit `docs/User Guide.md` in the VioLens
repository, then, from this folder:

```
./update-guide.ps1
```

It expects the VioLens repository next to this one (pass `-Source` to point
elsewhere), copies the guide in, adds the contents list, and points links to
other files at GitHub. Commit and push `guide.md`.

## Turning on GitHub Pages

1. Settings > Pages > Build and deployment: **Deploy from a branch**,
   branch `main`, folder `/ (root)`.
2. Custom domain: `violens.dev` (the `CNAME` file), with **Enforce HTTPS**
   on. The DNS is in Route 53: an A record for `violens.dev` with GitHub
   Pages' four addresses (185.199.108.153 to 185.199.111.153), and a CNAME
   for `www` pointing to `markspowell.github.io`.

The pages only work once GitHub has built them: opening `index.html`
straight from the folder shows the page without its links and styles.
