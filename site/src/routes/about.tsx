import { Title } from "@solidjs/meta";

export default function About() {
  return (
    <>
      <Title>About — connectome-fs</Title>
      <h1 style={{ "font-family": "var(--font-display)", "letter-spacing": "-0.03em" }}>About</h1>
      <p class="page-lede">
        connectome-fs is a graph-native filesystem substrate: GUID-addressed nodes, multi-name
        tokens, typed associations, editions, and hierarchy as a projection — not the source of
        truth.
      </p>
      <div class="adoc">
        <p>
          The project lives under the{" "}
          <a href="https://github.com/connectome-fs">connectome-fs</a> GitHub organization so
          systems work (drivers, adapters, file-manager plugins, demos) can accumulate without
          crowding a developer-tools product catalog or a personal profile.
        </p>
        <p>
          Partner orgs keep complementary lanes: Dev-Centr for practitioner orchestration, HCI-Nerdz
          for cognitive/UX implications, OpenShellOrg for shell query and projection standards.
        </p>
        <p>
          Design surfaces follow <strong>Signal Field</strong> — see the blog note and{" "}
          <code>DESIGN.md</code>.
        </p>
      </div>
    </>
  );
}
