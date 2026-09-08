import { readFileSync, writeFileSync } from "node:fs"
import { spawnSync } from "node:child_process"

const check = process.argv.includes("--check")
const diagrams = [
  "../docs/modules/explanation/images/navigating-by-content/icon",
  "public/media/navigating-by-content-icon",
]
function run(args) {
  const windows = process.platform === "win32"
  const command = windows ? process.env.ComSpec ?? "cmd.exe" : "pnpm"
  const commandArgs = windows
    ? ["/d", "/c", ["pnpm", ...args].join(" ")]
    : args
  const result = spawnSync(command, commandArgs, { encoding: "utf8", stdio: "inherit" })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

function decodeText(value) {
  return value
    .replace(/<br\s*\/?>/gi, " / ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
}

function normalizeSvg(svg) {
  return svg
    .replace(
      /<foreignObject\b[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<\/foreignObject>/g,
      (_, label) =>
        `<text class="nodeLabel" text-anchor="middle" dominant-baseline="central"><tspan>${decodeText(label)}</tspan></text>`,
    )
    .replace('role="graphics-document document"', 'role="img"')
    .replace(/\saria-roledescription="[^"]*"/, "")
}

function verify(path, mode) {
  const svg = readFileSync(path, "utf8")
  const required = [/<svg\b/, /<title\b/, /<desc\b/, /role="img"/, /viewBox="/, /preserveAspectRatio="/]
  if (required.some((pattern) => !pattern.test(svg))) throw new Error(`${path} misses required SVG metadata`)
  if (/<(?:foreignObject|script|image)\b/i.test(svg) || /(?:href|src)="(?!#)/i.test(svg)) {
    throw new Error(`${path} contains an active or external resource`)
  }
  if (/var\(\s*--[^,)]+\)/.test(svg)) throw new Error(`${path} contains a variable without a fallback`)
  if (mode === "adaptive" && !/prefers-color-scheme:dark/.test(svg)) {
    throw new Error(`${path} has no adaptive dark preset`)
  }
  if (mode === "host" && !/var\(--themed-svg-/.test(svg)) {
    throw new Error(`${path} has no semantic host variables`)
  }
}

for (const stem of diagrams) {
  const rawPath = `${stem}.raw.svg`
  run([
    "exec",
    "mmdc",
    "-i",
    `${stem}.mmd`,
    "-o",
    rawPath,
    "-b",
    "transparent",
    "-c",
    "scripts/mermaid-diagram-config.json",
  ])

  const normalized = normalizeSvg(readFileSync(rawPath, "utf8"))
  if (normalized.includes("<foreignObject")) {
    throw new Error(`${rawPath} still contains foreignObject`)
  }
  writeFileSync(rawPath, normalized)

  run([
    "exec",
    "mermaid-svg-css-vars",
    "--manifest",
    `${stem}.theme.json`,
    "--dual-output",
    ...(check ? ["--check"] : []),
    rawPath,
  ])
  verify(`${stem}.svg`, "adaptive")
  verify(`${stem}.host.svg`, "host")
}
