import { A, useLocation } from "@solidjs/router";
import type { ParentComponent } from "solid-js";
import { ThemeToggle } from "~/components/ThemeToggle";

export const SiteChrome: ParentComponent = (props) => {
  const location = useLocation();

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
          <A href="/docs" aria-current={current("/docs")}>
            Docs
          </A>
          <ThemeToggle />
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
