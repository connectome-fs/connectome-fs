import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { For } from "solid-js";
import blog from "~/lib/blog.generated.json";

type Post = {
  slug: string;
  title: string;
  description: string;
  revdate: string;
};

export default function BlogIndex() {
  return (
    <>
      <Title>Blog — connectome-fs</Title>
      <h1 style={{ "font-family": "var(--font-display)", "letter-spacing": "-0.03em" }}>Blog</h1>
      <p class="page-lede">Inner notes on design and substrate philosophy (AsciiDoc CMS).</p>
      <ul class="post-list">
        <For each={blog as Post[]}>
          {(item) => (
            <li>
              <time datetime={item.revdate}>{item.revdate}</time>
              <h3>
                <A href={`/blog/${item.slug}`}>{item.title}</A>
              </h3>
              <p>{item.description}</p>
            </li>
          )}
        </For>
      </ul>
    </>
  );
}
