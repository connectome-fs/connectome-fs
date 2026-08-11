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

export default function NewsIndex() {
  return (
    <>
      <Title>News — connectome-fs</Title>
      <h1 style={{ "font-family": "var(--font-display)", "letter-spacing": "-0.03em" }}>News</h1>
      <p class="page-lede">Outward milestones. Long-form craft lives on the blog.</p>
      <ul class="news-list">
        <For each={news as Post[]}>
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
    </>
  );
}
