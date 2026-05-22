/**
 * Design token lint rules over a Dembrandt native extract.
 *
 * Pure and dependency-free. `runLint(result, config)` returns
 * `{ findings, errors, warnings, pass }`. Severity "error" should drive a
 * non-zero exit code (the CI gate); "warn" does not fail the build.
 *
 * Absolute rules only, no baseline needed. The "duplicate" rules are the
 * rock-solid ones: near-identical tokens are objective redundancy, not taste,
 * so they almost never false-positive.
 */

const DEFAULTS = {
  // rock-solid (redundancy)
  colorDupDeltaE: 2.0, // below the ~2.3 human just-noticeable-difference
  spacingDupPx: 1.0,
  fontSizeDupPx: 1.0,
  maxFamilies: 4,
  // softer heuristics
  minFontPx: 12,
  maxColors: 24,
  spacingBase: 4,
};

function num(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

/* ----------------------------- color math ----------------------------- */

function parseColor(input) {
  if (typeof input !== "string") return null;
  const s = input.trim();
  let h = s.replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(h)) h = h.split("").map((c) => c + c).join("");
  if (/^[0-9a-fA-F]{8}$/.test(h)) h = h.slice(0, 6);
  if (/^[0-9a-fA-F]{6}$/.test(h)) {
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  return null;
}

function rgbToLab([r, g, b]) {
  const lin = (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const R = lin(r);
  const G = lin(g);
  const B = lin(b);
  const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(X);
  const fy = f(Y);
  const fz = f(Z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function deltaE(a, b) {
  const ra = parseColor(a);
  const rb = parseColor(b);
  if (!ra || !rb) return null;
  const [l1, a1, b1] = rgbToLab(ra);
  const [l2, a2, b2] = rgbToLab(rb);
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}

const GENERIC_FAMILIES = new Set([
  "system-ui", "ui-sans-serif", "ui-serif", "ui-monospace", "ui-rounded",
  "sans-serif", "serif", "monospace", "cursive", "fantasy", "emoji", "math",
  "-apple-system", "blinkmacsystemfont", "inherit", "initial",
]);

function normFamily(f) {
  return (f ?? "").split(",")[0].trim().replace(/^["']|["']$/g, "").toLowerCase();
}

/* ------------------------------- rules -------------------------------- */

export function runLint(result, config = {}) {
  const cfg = { ...DEFAULTS, ...(config.thresholds || {}) };
  const rules = config.rules || {};
  const findings = [];
  // Per-rule severity override from config: "off" | "warn" | "error".
  const add = (rule, defSeverity, message, detail) => {
    const severity = rules[rule] || defSeverity;
    if (severity === "off") return;
    findings.push({ rule, severity, message, detail });
  };

  // ---- rock-solid: redundancy ----

  // color-duplicates: visually indistinguishable colors (ΔE below JND).
  const hexes = (result?.colors?.palette ?? [])
    .map((c) => c.normalized || c.color)
    .filter(Boolean);
  const colorDups = [];
  for (let i = 0; i < hexes.length; i++) {
    for (let j = i + 1; j < hexes.length; j++) {
      const d = deltaE(hexes[i], hexes[j]);
      if (d !== null && d <= cfg.colorDupDeltaE) colorDups.push(`${hexes[i]} ≈ ${hexes[j]} (ΔE ${d.toFixed(1)})`);
    }
  }
  if (colorDups.length) {
    add("color-duplicates", "warn", `${colorDups.length} near-identical color pair(s) (ΔE ≤ ${cfg.colorDupDeltaE})`, colorDups.slice(0, 6));
  }

  // spacing-duplicates: values within a px of each other (e.g. 15 vs 16).
  const spacing = [...new Set((result?.spacing?.commonValues ?? []).map((s) => num(s.px)).filter((v) => v !== null))].sort((a, b) => a - b);
  const spacingDups = [];
  for (let i = 1; i < spacing.length; i++) {
    const d = spacing[i] - spacing[i - 1];
    if (d > 0 && d <= cfg.spacingDupPx) spacingDups.push(`${spacing[i - 1]}px ≈ ${spacing[i]}px`);
  }
  if (spacingDups.length) {
    add("spacing-duplicates", "warn", `${spacingDups.length} near-duplicate spacing value(s) (≤ ${cfg.spacingDupPx}px apart)`, spacingDups.slice(0, 6));
  }

  // type-size-duplicates: near-identical font sizes.
  const sizes = [...new Set((result?.typography?.styles ?? []).map((s) => num(s.size)).filter((v) => v !== null))].sort((a, b) => a - b);
  const sizeDups = [];
  for (let i = 1; i < sizes.length; i++) {
    const d = sizes[i] - sizes[i - 1];
    if (d > 0 && d <= cfg.fontSizeDupPx) sizeDups.push(`${sizes[i - 1]}px ≈ ${sizes[i]}px`);
  }
  if (sizeDups.length) {
    add("type-size-duplicates", "warn", `${sizeDups.length} near-duplicate font size(s) (≤ ${cfg.fontSizeDupPx}px apart)`, sizeDups.slice(0, 6));
  }

  // type-families: too many distinct typefaces.
  const families = new Set(
    (result?.typography?.styles ?? []).map((s) => normFamily(s.family)).filter((f) => f && !GENERIC_FAMILIES.has(f))
  );
  if (families.size > cfg.maxFamilies) {
    add("type-families", "warn", `${families.size} font families (max ${cfg.maxFamilies})`, [...families].slice(0, 8));
  }

  // ---- softer heuristics (taste-dependent) ----

  // color-contrast: from --wcag data. Below 3:1 fails even large-text AA.
  const wcag = Array.isArray(result?.wcag) ? result.wcag : [];
  const hardFails = wcag.filter((p) => p && p.aa === false && p.aaLarge === false);
  const softFails = wcag.filter((p) => p && p.aa === false && p.aaLarge === true);
  if (hardFails.length) {
    add("color-contrast", "warn", `${hardFails.length} color pair(s) below 3:1 (fail even large-text AA)`, hardFails.slice(0, 6).map((p) => `${p.fg} on ${p.bg} → ${Number(p.ratio).toFixed(2)}:1`));
  }
  if (softFails.length) {
    add("color-contrast", "warn", `${softFails.length} color pair(s) below 4.5:1 (fail normal-text AA)`, softFails.slice(0, 6).map((p) => `${p.fg} on ${p.bg} → ${Number(p.ratio).toFixed(2)}:1`));
  }

  // type-min-size: very small text.
  const small = (result?.typography?.styles ?? []).filter((s) => {
    const px = num(s.size);
    return px !== null && px < cfg.minFontPx;
  });
  if (small.length) {
    add("type-min-size", "warn", `${small.length} text style(s) below ${cfg.minFontPx}px`, small.slice(0, 6).map((s) => `${s.context || "text"} ${s.size}`));
  }

  // color-count: oversized palette.
  const paletteLen = (result?.colors?.palette ?? []).length;
  if (paletteLen > cfg.maxColors) {
    add("color-count", "warn", `${paletteLen} palette colors (max ${cfg.maxColors})`);
  }

  // spacing-grid: values off the base grid.
  const offGrid = (result?.spacing?.commonValues ?? []).filter((s) => {
    const px = num(s.px);
    return px !== null && px % cfg.spacingBase !== 0;
  });
  if (offGrid.length) {
    add("spacing-grid", "warn", `${offGrid.length} spacing value(s) off the ${cfg.spacingBase}px grid`, offGrid.slice(0, 6).map((s) => s.px));
  }

  const errors = findings.filter((f) => f.severity === "error").length;
  const warnings = findings.filter((f) => f.severity === "warn").length;
  return { findings, errors, warnings, pass: errors === 0 };
}
