import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { prepareThemedMermaidSvg } from "@dev-centr/mermaid-svg-css-vars";

const check = process.argv.includes("--check");
const siteRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(siteRoot, "..");
const githubActionsPuppeteerArgs =
  process.platform === "linux" && process.env.GITHUB_ACTIONS === "true"
    ? [
        "-p",
        join(siteRoot, "scripts/puppeteer-github-actions.json"),
      ]
    : [];
const diagrams = [
  {
    stem: "diagrams/labels-versus-wires/labels-versus-wires",
    consumers: [
      "docs/modules/explanation/images/navigating-by-content/labels-versus-wires",
      "site/public/media/labels-versus-wires",
    ],
  },
  {
    stem: "diagrams/pathogenesis-and-composition/identity-lenses",
    consumers: [
      "docs/modules/explanation/images/pathogenesis-and-composition/identity-lenses",
    ],
  },
];

function run(args) {
  const windows = process.platform === "win32";
  const command = windows ? process.env.ComSpec ?? "cmd.exe" : "pnpm";
  const commandArgs = windows
    ? ["/d", "/c", ["pnpm", ...args].map(quoteWindows).join(" ")]
    : args;
  const result = spawnSync(command, commandArgs, {
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function quoteWindows(value) {
  return /[\s&()]/.test(value) ? `"${value.replaceAll('"', '\\"')}"` : value;
}

function decodeText(value) {
  return value
    .replace(/<br\s*\/?>/gi, " / ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

function normalizeSvg(svg) {
  return svg
    .replace(
      /<foreignObject\b[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<\/foreignObject>/g,
      (_, label) =>
        `<text class="nodeLabel" text-anchor="middle" dominant-baseline="central"><tspan>${decodeText(label)}</tspan></text>`,
    )
    .replace('role="graphics-document document"', 'role="img"')
    .replace(/\saria-roledescription="[^"]*"/, "");
}

function verify(path, mode) {
  const svg = readFileSync(join(repoRoot, path), "utf8");
  const required = [
    /<svg\b/,
    /<title\b/,
    /<desc\b/,
    /role="img"/,
    /viewBox="/,
    /preserveAspectRatio="/,
  ];
  if (required.some((pattern) => !pattern.test(svg))) {
    throw new Error(`${path} misses required SVG metadata`);
  }
  if (
    /<(?:foreignObject|script|image|iframe|object|embed)\b/i.test(svg) ||
    /\son[a-z]+\s*=/i.test(svg) ||
    /(?:href|src)\s*=\s*["'](?!#)/i.test(svg) ||
    /url\(\s*["']?(?:https?:|data:|javascript:)/i.test(svg)
  ) {
    throw new Error(`${path} contains an active or external resource`);
  }
  if (/var\(\s*--[^,)]+\)/.test(svg)) {
    throw new Error(`${path} contains a variable without a fallback`);
  }
  if (mode === "adaptive" && !/prefers-color-scheme:dark/.test(svg)) {
    throw new Error(`${path} has no adaptive dark preset`);
  }
  if (mode === "host" && !/var\(--themed-svg-/.test(svg)) {
    throw new Error(`${path} has no semantic host variables`);
  }
  if (
    mode === "fixed" &&
    (/var\(--themed-svg-/.test(svg) || /prefers-color-scheme/.test(svg))
  ) {
    throw new Error(`${path} is not a resolved fixed-color SVG`);
  }
}

for (const { stem, consumers } of diagrams) {
  const rawPath = `${stem}.raw.svg`;
  run([
    "exec",
    "mmdc",
    ...githubActionsPuppeteerArgs,
    "-i",
    join(repoRoot, `${stem}.mmd`),
    "-o",
    join(repoRoot, rawPath),
    "-b",
    "transparent",
    "-c",
    join(siteRoot, "scripts/mermaid-diagram-config.json"),
  ]);

  const normalized = normalizeSvg(
    readFileSync(join(repoRoot, rawPath), "utf8"),
  );
  if (normalized.includes("<foreignObject")) {
    throw new Error(`${rawPath} still contains foreignObject`);
  }
  writeFileSync(join(repoRoot, rawPath), normalized);

  run([
    "exec",
    "mermaid-svg-css-vars",
    "--manifest",
    join(repoRoot, `${stem}.theme.json`),
    "--dual-output",
    ...(check ? ["--check"] : []),
    join(repoRoot, rawPath),
  ]);
  const manifest = JSON.parse(
    readFileSync(join(repoRoot, `${stem}.theme.json`), "utf8"),
  );
  const fixed = prepareThemedMermaidSvg(normalized, manifest, {
    mode: "fixed",
    preset: manifest.defaultPreset,
  });
  const fixedErrors = fixed.diagnostics.filter(
    ({ severity }) => severity === "error",
  );
  if (!fixed.svg || fixedErrors.length > 0) {
    throw new Error(
      `${stem}.fixed.svg generation failed: ${fixedErrors.map(({ message }) => message).join("; ")}`,
    );
  }
  const fixedPath = join(repoRoot, `${stem}.fixed.svg`);
  if (check) {
    if (!existsSync(fixedPath) || readFileSync(fixedPath, "utf8") !== fixed.svg) {
      throw new Error(`stale: ${stem}.fixed.svg`);
    }
  } else {
    writeFileSync(fixedPath, fixed.svg);
  }
  verify(`${stem}.svg`, "adaptive");
  verify(`${stem}.host.svg`, "host");
  verify(`${stem}.fixed.svg`, "fixed");

  for (const consumer of consumers) {
    for (const suffix of [".svg", ".host.svg"]) {
      const source = join(repoRoot, `${stem}${suffix}`);
      const destination = join(repoRoot, `${consumer}${suffix}`);
      if (check) {
        if (
          !existsSync(destination) ||
          readFileSync(source, "utf8") !== readFileSync(destination, "utf8")
        ) {
          throw new Error(`stale: ${consumer}${suffix}`);
        }
      } else {
        mkdirSync(dirname(destination), { recursive: true });
        copyFileSync(source, destination);
      }
    }
  }
}
