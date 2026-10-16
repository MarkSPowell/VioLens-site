# clearinet-site

The website for [CLeARINET](https://github.com/MarkSPowell/CLeARINET), the
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

Don't edit `guide.md` by hand. Edit `docs/User Guide.md` in the CLeARINET
repository, then, from this folder:

```
./update-guide.ps1
```

It expects the CLeARINET repository next to this one (pass `-Source` to point
elsewhere), copies the guide in, adds the contents list, and points links to
other files at GitHub. Commit and push `guide.md`.

## Turning on GitHub Pages

1. Settings > Pages > Build and deployment: **Deploy from a branch**,
   branch `main`, folder `/ (root)`.
2. Once the domain is bought: Settings > Pages > Custom domain, enter it,
   and tick **Enforce HTTPS** when it's offered. (GitHub adds a `CNAME`
   file to the repository.)
