/** KaTeX auto-render for AsciiDoc stem / $…$ on the SolidStart site. */
const KATEX_VER = "0.16.22";
const CSS = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VER}/dist/katex.min.css`;
const KATEX_JS = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VER}/dist/katex.min.js`;
const AUTO_JS = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VER}/dist/contrib/auto-render.min.js`;

function loadCss(href: string) {
  if (document.querySelector(`link[data-cfs-katex="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.cfsKatex = href;
  document.head.appendChild(link);
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-cfs-katex="${src}"]`);
    if (existing) {
      if ((existing as HTMLElement).dataset.loaded === "1") resolve();
      else {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", reject);
      }
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.defer = true;
    s.dataset.cfsKatex = src;
    s.onload = () => {
      s.dataset.loaded = "1";
      resolve();
    };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export async function bootKatex() {
  loadCss(CSS);
  await loadScript(KATEX_JS);
  await loadScript(AUTO_JS);
  const render = (window as unknown as { renderMathInElement?: Function })
    .renderMathInElement;
  if (typeof render !== "function") return;
  render(document.body, {
    delimiters: [
      { left: "\\[", right: "\\]", display: true },
      { left: "$$", right: "$$", display: true },
      { left: "\\(", right: "\\)", display: false },
      { left: "$", right: "$", display: false },
    ],
    throwOnError: false,
    strict: "ignore",
  });
}
