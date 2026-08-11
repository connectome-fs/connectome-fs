import { A } from "@solidjs/router";
import type { Component } from "solid-js";

const LAY =
  "Store and find files the way your brain does. Make connections, don't memorize paths.";
const TECH =
  "A GUID-addressed filesystem connectome: multi-name tokens, hierarchy as an entry view, typed associations, and sharded search — with user tooling written in performant D.";

function withBase(path: string): string {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  if (!base) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Large top banner: brand patterning + wordmark. Nav lives under this field. */
export const SignalField: Component<{
  lede?: string;
  layLede?: string;
  showCta?: boolean;
  showLogo?: boolean;
}> = (props) => {
  const lay = () => props.layLede ?? LAY;
  const tech = () => props.lede ?? TECH;
  const showCta = () => props.showCta !== false;
  const showLogo = () => props.showLogo !== false;

  return (
    <section class="signal-field" aria-label="Brand field">
      <svg class="signal-field__pattern" viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g class="drift" fill="none" stroke="currentColor" stroke-width="1.1">
          <path d="M80 120 L220 80 L360 160 L520 90 L680 170 L840 70 L1020 150 L1140 100" />
          <path d="M60 280 L200 320 L340 250 L500 340 L660 260 L820 350 L980 270 L1160 330" />
          <path d="M100 480 L260 430 L420 510 L600 420 L780 500 L960 410 L1120 490" />
          <path d="M220 80 L200 320 L260 430" />
          <path d="M520 90 L500 340 L600 420" />
          <path d="M840 70 L820 350 L960 410" />
        </g>
        <g class="drift" fill="currentColor">
          <circle cx="220" cy="80" r="4.5" />
          <circle cx="520" cy="90" r="4.5" />
          <circle cx="840" cy="70" r="4.5" />
          <circle cx="200" cy="320" r="4" />
          <circle cx="500" cy="340" r="4" />
          <circle cx="600" cy="420" r="5" />
          <circle cx="960" cy="410" r="4" />
        </g>
      </svg>
      <div class="signal-field__sheath">
        <div class="signal-field__copy">
          {showLogo() && (
            <img
              class="signal-field__logo"
              src={withBase("/brand/logo.svg")}
              width={88}
              height={88}
              alt=""
              decoding="async"
            />
          )}
          <h1 class="signal-field__brand">connectome-fs</h1>
          <p class="signal-field__lay">{lay()}</p>
          <p class="signal-field__lede">{tech()}</p>
          {showCta() && (
            <div class="signal-field__cta">
              <a class="btn btn-primary" href={withBase("/docs/")}>
                Read the docs
              </a>
              <A class="btn btn-ghost" href="/roadmap">
                Roadmap
              </A>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
