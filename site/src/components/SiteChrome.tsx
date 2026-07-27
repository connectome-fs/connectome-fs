import { A, useLocation } from "@solidjs/router";
import type { ParentComponent } from "solid-js";
import { useTheme } from "~/lib/theme";

function withBase(path: string): string {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  if (!base || base === "") return path;
  if (path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

const docsHref = withBase("/docs/");

export const SiteChrome: ParentComponent = (props) => {
  const location = useLocation();
  const theme = useTheme();

  // With Router `base`, location.pathname is already stripped of the base prefix.
  const current = (path: string) =>
    location.pathname.replace(/\/$/, "") === path.replace(/\/$/, "") ? "page" : undefined;

  return (
    <div class="wrap">
      <header class="site-header">
        <A href="/" class="brand">
          connectome-fs
        </A>
        <nav class="nav" aria-label="Primary">
          <A href="/" aria-current={current("/")}>
            Home
          </A>
          <A href="/news" aria-current={current("/news")}>
            News
          </A>
          <A href="/about" aria-current={current("/about")}>
            About
          </A>
          <a href={docsHref}>Docs</a>
          <button
            type="button"
            class="theme-toggle"
            onClick={() => theme.toggle()}
            aria-pressed={theme.isOverride()}
            title={
              theme.isOverride()
                ? "Manual override — resets on next system theme change"
                : "Following system theme"
            }
          >
            {theme.theme() === "dark" ? "Light" : "Dark"}
          </button>
        </nav>
      </header>
      <main>{props.children}</main>
      <footer class="site-footer">
        <p>
          Hierarchy is a navigation slice. The connectome is the graph.{" "}
          <a href="https://github.com/AMDphreak/connectome-fs">GitHub</a>
        </p>
      </footer>
    </div>
  );
};
