import { A, useLocation } from "@solidjs/router";
import type { ParentComponent } from "solid-js";
import { ThemeToggle } from "~/components/ThemeToggle";
import { SignalField } from "~/components/SignalField";

/** Sibling ecosystem (same set as DevCentr / nonprofit Related OSS — not FoodTruckNerdz). */
const PARTNERS = [
  { href: "https://devcentr.org", label: "DevCentr" },
  { href: "https://openshellorg.github.io/", label: "OpenShellOrg" },
  { href: "https://hci-nerdz.github.io", label: "HCI Nerdz" },
  { href: "https://linx.photos", label: "linx.photos" },
  { href: "https://instalay.linx.photos", label: "InstaLay" },
] as const;

const VISION =
  "Store and find files the way your brain does. Make connections, don't memorize paths.";

function withBase(path: string): string {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  if (!base) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SiteChrome: ParentComponent = (props) => {
  const location = useLocation();
  const current = (path: string) =>
    location.pathname.replace(/\/$/, "") === path.replace(/\/$/, "") ? "page" : undefined;
  const isHome = () => {
    const p = location.pathname.replace(/\/$/, "") || "/";
    return p === "/" || p === "";
  };

  return (
    <>
      {isHome() ? (
        <SignalField />
      ) : (
        <SignalField
          showCta={false}
          lede="Graph-native filesystem substrate — news, notes, and docs."
        />
      )}
      <div class="site-navband">
        <div class="site-navband__inner">
          <A href="/" class="nav-mark" aria-current={current("/")}>
            <img
              class="nav-mark__logo"
              src={withBase("/brand/logo.svg")}
              width={28}
              height={28}
              alt=""
              decoding="async"
            />
            connectome-fs
          </A>
          <nav class="nav" aria-label="Primary">
            <A href="/news" aria-current={current("/news")}>
              News
            </A>
            <A href="/blog" aria-current={current("/blog")}>
              Blog
            </A>
            <A href="/roadmap" aria-current={current("/roadmap")}>
              Roadmap
            </A>
            <A href="/about" aria-current={current("/about")}>
              About
            </A>
            <a href={withBase("/docs/")}>Docs</a>
            <a href="https://github.com/connectome-fs/connectome-fs">GitHub</a>
            <ThemeToggle />
          </nav>
        </div>
      </div>
      <div class="page-sheath">
        <main class="page wrap">{props.children}</main>
      </div>
      <footer class="site-footer">
        <div class="site-footer__inner">
          <p class="site-footer__vision">{VISION}</p>
          <p class="site-footer__tech">
            Hierarchy is a navigation slice. The connectome is the graph.{" "}
            <a href="https://github.com/connectome-fs/connectome-fs">Source</a>
            {" · "}
            <a href={withBase("/feeds/news.xml")}>RSS</a>
          </p>
          <div class="partners">
            <span class="partners__label">Partners</span>
            {PARTNERS.map((p) => (
              <a href={p.href} rel="noopener noreferrer">
                {p.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
};
