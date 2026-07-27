import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { For } from "solid-js";
import { newsItems } from "~/lib/news";

export default function Home() {
  const latest = newsItems.slice(0, 2);

  return (
    <>
      <Title>connectome-fs</Title>
      <section class="hero">
        <h1>connectome-fs</h1>
        <p>
          A GUID-addressed filesystem connectome: multi-name tokens, hierarchy as an entry view,
          typed associations, and sharded search — with a Rust core and room for D tooling on top.
        </p>
        <div class="cta-row">
          <A class="btn btn-primary" href="/docs">
            Read the docs
          </A>
          <a class="btn btn-ghost" href="https://github.com/AMDphreak/connectome-fs">
            View on GitHub
          </a>
        </div>
      </section>

      <section class="section">
        <h2>Latest</h2>
        <p class="lead">Project news and milestones.</p>
        <ul class="news-list">
          <For each={latest}>
            {(item) => (
              <li>
                <time datetime={item.date}>{item.date}</time>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </li>
            )}
          </For>
        </ul>
      </section>
    </>
  );
}
