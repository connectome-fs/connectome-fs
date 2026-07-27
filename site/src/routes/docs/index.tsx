import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";

function withBase(path: string): string {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  if (!base) return path;
  if (path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Antora static output lives under /manual/ so this Solid route can own /docs. */
const manualHref = withBase("/manual/");

export default function DocsGatePage() {
  return (
    <>
      <Title>Docs — connectome-fs</Title>
      <section class="docs-gate">
        <p class="eyebrow">Documentation</p>
        <h1>Find your way into the connectome</h1>
        <p class="lead">
          The docs are the written model behind connectome-fs: how hierarchy is only a navigation
          slice, how multi-names and associations work, and how to use the <span class="mono">cfs</span>{" "}
          CLI. They are authored in AsciiDoc and published with Antora.
        </p>
        <div class="cta-row">
          <a class="btn btn-primary" href={manualHref}>
            Open the docs
          </a>
          <A class="btn btn-ghost" href="/">
            Back to home
          </A>
        </div>
      </section>

      <section class="section">
        <h2>What you will find</h2>
        <p class="lead">A short map before you dive in.</p>
        <ul class="docs-map">
          <li>
            <strong>Tutorial</strong>
            <span>Vendor download names and the multi-name demo.</span>
          </li>
          <li>
            <strong>How-to</strong>
            <span>Attach name tokens, filter by context, run queries.</span>
          </li>
          <li>
            <strong>Explanation</strong>
            <span>Model, bindings, SolidStart + Antora architecture.</span>
          </li>
          <li>
            <strong>Reference</strong>
            <span>Query grammar and CLI surface.</span>
          </li>
        </ul>
      </section>

      <section class="section">
        <h2>Quick start</h2>
        <p class="lead">From a clone of the repo:</p>
        <pre class="code-block"><code>{`cargo run -p connectome-cli -- --db demo.db demo
cargo run -p connectome-cli -- --db demo.db query "token:basename=pcss"`}</code></pre>
        <p class="muted-note">
          Prefer reading first? Jump straight into the Antora site — start at the index, then follow
          the left nav.
        </p>
      </section>
    </>
  );
}
