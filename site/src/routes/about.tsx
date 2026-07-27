import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";

export default function AboutPage() {
  return (
    <>
      <Title>About — connectome-fs</Title>
      <section class="section" style={{ "border-top": "none", "padding-top": "0.5rem" }}>
        <h2>About</h2>
        <p class="lead">
          connectome-fs explores a filesystem where hierarchy is only a navigation slice into a richer
          associative graph — inspired by the Tri-Axis / Associative File System design notes.
        </p>
        <p>
          Core store and CLI are Rust today (kernel-adjacent path, FFI-friendly). D is the preferred
          language for interactive tools and GUI-facing utilities via a C ABI. Docs are authored in
          AsciiDoc and published with Antora; this marketing site is SolidStart (static).
        </p>
        <p>
          <A href="/docs">Documentation</A>
          {" · "}
          <a href="https://github.com/AMDphreak/connectome-fs">Source</a>
        </p>
      </section>
    </>
  );
}
