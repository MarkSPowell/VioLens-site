# Copies the User Guide from the CLeARINET repository into this site as
# guide.md. Run it after the guide changes (before or after a release):
#
#   ./update-guide.ps1
#
# It expects the CLeARINET repository next to this one; pass -Source to
# point somewhere else. Then commit and push guide.md as usual.
param(
    [string]$Source = (Join-Path $PSScriptRoot '..\CLeARINET\docs\User Guide.md')
)

$ErrorActionPreference = 'Stop'
$text = [IO.File]::ReadAllText((Resolve-Path $Source), [Text.Encoding]::UTF8) -replace "`r`n", "`n"
$lines = $text -split "`n"

# The guide's own title is replaced by the page's.
if ($lines[0] -match '^# ') { $lines = $lines[1..($lines.Length - 1)] }
$body = ($lines -join "`n").Trim("`n")

# Links to other files in the repository go to GitHub.
$body = $body -replace '\]\(\.\./', '](https://github.com/MarkSPowell/CLeARINET/blob/main/'
$body = $body -replace '\]\((?!https?://|#|mailto:)([^)]+)\)', '](https://github.com/MarkSPowell/CLeARINET/blob/main/docs/$1)'

$header = @'
---
layout: page
title: User Guide
description: How to use CLeARINET - capturing, inspecting, breakpoints, AutoResponder, Composer, FiddlerScript, extensions and more.
body_class: guide
---
<!-- Generated from docs/User Guide.md in the CLeARINET repository by update-guide.ps1. Edit the guide there, then run the script again. -->

# User Guide

<details class="toc" markdown="1">
<summary>Contents</summary>

* TOC
{:toc}

</details>

{% raw %}
'@

$out = ($header -replace "`r`n", "`n") + "`n" + $body + "`n{% endraw %}`n"
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'guide.md'), $out, [Text.UTF8Encoding]::new($false))
Write-Host "guide.md updated from $Source"
