import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { For } from "solid-js";
import news from "~/lib/news.generated.json";

type Post = {
  slug: string;
  title: string;
  description: string;
  revdate: string;
};

export default function Home() {
  const latest = (news as Post[]).slice(0, 3);

  return (
    <>
      <Title>connectome-fs</Title>
      <section class="section" style={{ "border-top": "none", "padding-top": "0.25rem" }}>
        <h2>Latest signal</h2>
        <p class="lead">News built from AsciiDoc under <code>site/content/news/</code>.</p>
        <ul class="news-list">
          <For each={latest}>
            {(item) => (
              <li>
                <time datetime={item.revdate}>{item.revdate}</time>
                <h3>
                  <A href={`/news/${item.slug}`}>{item.title}</A>
                </h3>
                <p>{item.description}</p>
              </li>
            )}
          </For>
        </ul>
      </section>

      <section class="section">
        <h2>Why a substrate org</h2>
        <p class="lead">
          File-manager plugins, projection layers, drivers, and demos will outgrow any single
          product catalog. Partner orgs keep practitioner, HCI, and shell lanes; this org owns the
          graph filesystem itself.
        </p>
        <div class="cta-row" style={{ display: "flex", gap: "0.75rem", "flex-wrap": "wrap" }}>
          <A class="btn btn-primary" href="/roadmap">
            See the roadmap
          </A>
          <A class="btn btn-ghost" href="/blog">
            Design notes
          </A>
        </div>
      </section>
    </>
  );
}
