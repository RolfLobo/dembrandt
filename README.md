# Dembrandt.

[![npm version](https://img.shields.io/npm/v/dembrandt.svg)](https://www.npmjs.com/package/dembrandt)
[![npm downloads](https://img.shields.io/npm/dm/dembrandt.svg)](https://www.npmjs.com/package/dembrandt)
[![license](https://img.shields.io/npm/l/dembrandt.svg)](https://github.com/dembrandt/dembrandt/blob/main/LICENSE)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-me-pink?style=flat&logo=github-sponsors)](https://github.com/sponsors/dembrandt)

Extract a website's design system into design tokens in a few seconds: logo, colors, typography, borders, and more. One command.

![Dembrandt: Any website to design tokens](https://raw.githubusercontent.com/dembrandt/dembrandt/main/docs/images/banner.png)

## Install

```bash
npm install -g dembrandt
dembrandt install-browser        # one-time: fetches the matching Chromium
dembrandt dembrandt.com
```

The browser step is required. dembrandt drives Chromium through `playwright-core`,
which ships no browser binaries, so a fresh install has nothing to launch until you
run it. Skipping it fails with `browser engine not available`.

Or use npx without installing: `npx dembrandt dembrandt.com`. The browser step applies
here too — run `npx dembrandt install-browser` first. Browsers land in a shared
Playwright cache, so either route only needs it once.

Requires Node.js 18+

## What you get

- Colors (semantic, palette, CSS variables, gradients)
- Typography (fonts, sizes, weights, sources, font file URLs)
- Spacing (margin/padding scales)
- Borders (radius, widths, styles, colors)
- Shadows
- Motion (duration scale, easing curves, hover patterns per component type)
- Components (buttons, badges, inputs, links)
- Breakpoints
- Icons & frameworks

Playwright renders the page, dembrandt reads computed styles from the DOM, analyzes color usage and confidence, groups similar typography, detects spacing patterns, and returns design tokens.

## Documentation

- **[Usage](docs/usage.md)** — every flag, multi-page extraction, browser selection, CDP, DTCG, DESIGN.md, Tailwind theme, WCAG, motion, brand guide PDF
- **[Recipes](docs/recipes.md)** — copy-paste workflows, plus the full library at [dembrandt.com/recipes](https://www.dembrandt.com/recipes)
- **[Continuous integration](docs/ci.md)** — GitHub Action, drift gate, exit codes
- **[Flag compatibility](docs/FLAGS.md)** — interactions, ignored combinations, multi-page propagation

## AI Agent Integration (MCP)

Use Dembrandt as a tool in Claude Code, Cursor, Windsurf, or any MCP-compatible client. Ask your agent to "extract the color palette from dembrandt.com" and it calls Dembrandt automatically.

```bash
claude mcp add --transport stdio dembrandt -- npx -y --package dembrandt dembrandt-mcp
```

Or add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "dembrandt": {
      "command": "npx",
      "args": ["-y", "--package", "dembrandt", "dembrandt-mcp"]
    }
  }
}
```

Available tools include `get_design_tokens`, `get_color_palette`, `get_typography`, `get_component_styles`, `get_surfaces`, `get_spacing`, and `get_brand_identity`, plus pure analysis tools (`compute_drift`, `get_findings`, `export_dtcg`, `generate_design_md`, `render_report`) and job-control tools. Extraction tools accept `mobile`, `cookie` (for authenticated pages), and `wcag` options.

Pair with **[dembrandt-skills](https://github.com/dembrandt/dembrandt-skills)** to give your agent UX intelligence on top of extracted tokens — hierarchy, accessibility, interaction states, and a full 6-stage design pipeline orchestrator.

```bash
npx skills add dembrandt/dembrandt-skills
```

## Dembrandt App (Beta)

Load extractions, track token drift, and compare snapshots. **[dembrandt.com/app](https://www.dembrandt.com/app)**

* **Automatic drift tracking from CI.** Generate an API key at [dembrandt.com/app/api-keys](https://www.dembrandt.com/app/api-keys), then pass `--key` to the CLI. Every run uploads a snapshot to your account and scores it against the previous one for that domain. Wire into GitHub Actions or any CI runner and every deploy records itself.
* **Pin a baseline.** Mark any snapshot as your reference. Every subsequent extraction is automatically scored against it.
* **Visual diff.** Color swatches, before/after values, delta scores per category: colors, typography, spacing, radius, shadows.
* **Snapshot timeline.** Proportional timeline per domain — scrub across any date range from days to years.
* **Compare side by side.** Load multiple extractions into one view: two releases, two sites, or two surfaces.
* **Copy tokens.** Paste values straight into Copilot, Claude, or Cursor.
* **No login required for local use.** Data stays in the browser. Sign in with GitHub to enable cloud sync.

## Limitations

- Dark mode requires `--dark-mode` flag (not automatically detected)
- Hover/focus states extracted from CSS (not fully interactive)
- Canvas/WebGL-rendered sites cannot be analyzed (no DOM to read)
- JavaScript-heavy sites require hydration time (8s initial + 4s stabilization)
- Some dynamically-loaded content may be missed
- Default viewport is 1920x1080 (use `--mobile` for 390x844 mobile viewport)

## Intended Use

Dembrandt reads publicly available CSS and computed styles from website DOMs for documentation, learning, and analysis of design systems you own or have permission to analyze.

Only run Dembrandt against sites whose Terms of Service permit automated access, or against your own properties. Do not use extracted material to reproduce third-party brand identities, logos, or trademarks. Respect robots.txt, rate limits, and copyright.

Dembrandt does not host, redistribute, or claim rights to any third-party brand assets.

## Sponsors

The CLI is MIT-licensed and free. Sponsorship funds the enforcement layer: a committed project-level token baseline, `--compare` and the ingest API for CI/CD drift gates, and the App platform (snapshot history, team drift dashboard, alerts to Slack, Linear, and GitHub).

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-me-pink?style=flat&logo=github-sponsors)](https://github.com/sponsors/dembrandt)

<!-- sponsors -->
<!-- Backer ($25+) and Lead sponsor ($500+) logos appear here. -->
<!-- sponsors -->

## Contributing

Bugs, weird sites, pull requests. All welcome.

Open an [Issue](https://github.com/dembrandt/dembrandt/issues) or PR.

@thevangelist

MIT. Do whatever you want with it.
