# Recipes

Ready-to-run workflows, filterable by role, live at **[dembrandt.com/recipes](https://www.dembrandt.com/recipes)**: competitor benchmarking, WCAG audits, CI/CD drift detection, Figma token push, agentic design system builds.

The basics:

**Quick brand scan**
```bash
dembrandt dembrandt.com
```

**Compare two sites**
```bash
dembrandt dembrandt.com --save-output
dembrandt braintree.com --save-output
# Compare output/dembrandt.com and output/braintree.com side by side
```

**Multi-page audit**: get a fuller picture across the whole site
```bash
dembrandt dembrandt.com --crawl 10 --sitemap --save-output
```

**Spot-check a value**: verify a specific token fast
```bash
dembrandt dembrandt.com --json-only | grep -i "border-radius"
```

**Export for Tailwind**: get spacing and color values into your config
```bash
dembrandt dembrandt.com --dtcg --save-output
# Use the .tokens.json with Style Dictionary to generate tailwind.config.js
```

**Export for Tokens Studio / Figma**
```bash
dembrandt dembrandt.com --dtcg --save-output
# Import the .tokens.json directly into Tokens Studio
```

**Generate DESIGN.md for your AI agent**
```bash
dembrandt dembrandt.com --design-md
# Point your agent at the output DESIGN.md
```

**Accessibility audit**: check contrast on any live URL
```bash
dembrandt dembrandt.com --wcag
```

**Regression baseline**: snapshot now, catch drift later
```bash
dembrandt myapp.com --save-output --dtcg
# Store output as baseline, re-run after deploys and diff
```

**CI / headless environments**
```bash
dembrandt myapp.com --no-sandbox --save-output
```

See also: [usage.md](usage.md) for the full flag reference, [ci.md](ci.md) for the drift gate.
