/** Client Mermaid boot for AsciiDoc listing blocks on the SolidStart site. */
const MERMAID_CDN = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";

function looksLikeMermaid(text: string) {
  return /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|mindmap|timeline|gitGraph)\b/.test(
    text.trim(),
  );
}

function collectTargets(): { block: Element; text: string }[] {
  const nodes: { block: Element; text: string }[] = [];
  document
    .querySelectorAll('code.language-mermaid, code[data-lang="mermaid"]')
    .forEach((code) => {
      const block = code.closest(".listingblock") || code.parentElement;
      if (block) nodes.push({ block, text: code.textContent || "" });
    });
  document.querySelectorAll(".listingblock > .content > pre").forEach((pre) => {
    if (pre.querySelector('code.language-mermaid, code[data-lang="mermaid"]')) return;
    const text = pre.textContent || "";
    if (!looksLikeMermaid(text)) return;
    const block = pre.closest(".listingblock");
    if (block) nodes.push({ block, text });
  });
  return nodes;
}

function loadMermaid(): Promise<{
  initialize: (o: Record<string, unknown>) => void;
  run: (o: { nodes: Element[] }) => Promise<void>;
}> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as { mermaid?: any };
    if (w.mermaid) {
      resolve(w.mermaid);
      return;
    }
    const existing = document.querySelector("script[data-cfs-mermaid]");
    if (existing) {
      existing.addEventListener("load", () => resolve((window as any).mermaid));
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.src = MERMAID_CDN;
    s.async = true;
    s.dataset.cfsMermaid = "1";
    s.onload = () => resolve((window as any).mermaid);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export async function bootMermaid() {
  const targets = collectTargets();
  if (!targets.length) return;
  const mermaid = await loadMermaid();
  const dark = document.documentElement.dataset.theme === "dark";
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: dark ? "dark" : "default",
    flowchart: { htmlLabels: true, curve: "basis" },
  });
  const hosts = targets.map((t, i) => {
    const host = document.createElement("div");
    host.className = "mermaid cfs-mermaid";
    host.dataset.mermaidIndex = String(i);
    host.textContent = t.text.trim();
    t.block.replaceWith(host);
    return host;
  });
  await mermaid.run({ nodes: hosts });
}
