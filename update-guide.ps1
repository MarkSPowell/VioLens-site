# Copies two documents from the VioLens repository into this site:
#
#   docs/User Guide.md         ->  guide.md       (/guide/)
#   docs/Embedding ProxyCore.md ->  developers.md  (/developers/)
#
# Run it after either document changes (before or after a release):
#
#   ./update-guide.ps1
#
# It looks for the VioLens repository next to this one, or next to the
# folder this one is in (under either name, VioLens or CLeARINET); pass
# -Repository to point somewhere else. Then commit and push guide.md and
# developers.md as usual.
param(
    [string]$Repository
)

$ErrorActionPreference = 'Stop'
if (-not $Repository) {
    $candidates = foreach ($up in '..', '..\..') {
        foreach ($name in 'VioLens', 'CLeARINET') { Join-Path $PSScriptRoot "$up\$name" }
    }
    $Repository = $candidates | Where-Object { Test-Path -LiteralPath (Join-Path $_ 'docs\User Guide.md') } | Select-Object -First 1
    if (-not $Repository) { throw "Couldn't find the VioLens repository; pass -Repository." }
}

$repositoryUrl = 'https://github.com/MarkSPowell/VioLens/blob/main'

function Convert-Document {
    param(
        [string]$Source,
        [string]$Target,
        [string]$Title,
        [string]$SeoTitle,
        [string]$Description
    )

    $text = [IO.File]::ReadAllText((Resolve-Path -LiteralPath $Source), [Text.Encoding]::UTF8) -replace "`r`n", "`n"
    $lines = $text -split "`n"

    # The document's own title is replaced by the page's.
    if ($lines[0] -match '^# ') { $lines = $lines[1..($lines.Length - 1)] }

    # A hand-written contents list (lines like "- [Section](#section)") is
    # replaced by the page's own, which sits beside the text on wide screens.
    $lines = $lines | Where-Object { $_ -notmatch '^- \[[^\]]+\]\(#[^)]+\)$' }
    $body = ($lines -join "`n").Trim("`n")

    # Links to other files in the repository go to GitHub.
    $body = $body -replace '\]\(\.\./', "]($repositoryUrl/"
    $body = $body -replace '\]\((?!https?://|#|mailto:)([^)]+)\)', "]($repositoryUrl/docs/`$1)"

    $relative = 'docs/' + (Split-Path -Leaf $Source)
    $header = @"
---
layout: page
title: $Title
seo_title: "$SeoTitle"
description: $Description
body_class: guide
---
<!-- Generated from $relative in the VioLens repository by update-guide.ps1. Edit it there, then run the script again. -->

# $Title

<details class="toc" markdown="1">
<summary>Contents</summary>

* TOC
{:toc}

</details>

{% raw %}
"@

    $out = ($header -replace "`r`n", "`n") + "`n" + $body + "`n{% endraw %}`n"
    [IO.File]::WriteAllText((Join-Path $PSScriptRoot $Target), $out, [Text.UTF8Encoding]::new($false))
    Write-Host "$Target updated from $Source"
}

Convert-Document `
    -Source (Join-Path $Repository 'docs\User Guide.md') `
    -Target 'guide.md' `
    -Title 'User Guide' `
    -SeoTitle 'VioLens User Guide: Capture, Inspect and Replay HTTPS Traffic' `
    -Description 'How to use VioLens, the free HTTPS debugging proxy - capturing, inspecting, breakpoints, AutoResponder, Composer, FiddlerScript, extensions and more.'

Convert-Document `
    -Source (Join-Path $Repository 'docs\Embedding ProxyCore.md') `
    -Target 'developers.md' `
    -Title 'Embedding ProxyCore' `
    -SeoTitle 'Embedding ProxyCore: Build an HTTPS Debugging Proxy in .NET' `
    -Description "Build your own HTTP(S) debugging tool on VioLens's proxy engine, the Violens.ProxyCore NuGet package."
