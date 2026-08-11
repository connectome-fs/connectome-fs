import { Title } from "@solidjs/meta";
import { A, useParams } from "@solidjs/router";
import { Show, createMemo, onMount } from "solid-js";
import blog from "~/lib/blog.generated.json";
import { bootMermaid } from "~/lib/mermaid";
import { bootKatex } from "~/lib/katex";

type Post = {
  slug: string;
  title: string;
  description: string;
  revdate: string;
  html: string;
};

export default function BlogPost() {
  const params = useParams();
  const post = createMemo(() => (blog as Post[]).find((p) => p.slug === params.slug));

  onMount(() => {
    bootMermaid().catch((err) => console.warn("[cfs-mermaid]", err));
    bootKatex().catch((err) => console.warn("[cfs-katex]", err));
  });

  return (
    <Show
      when={post()}
      fallback={
        <>
          <Title>Not found</Title>
          <p>
            Missing post. <A href="/blog">Back to blog</A>
          </p>
        </>
      }
    >
      {(p) => (
        <>
          <Title>{p().title} — connectome-fs</Title>
          <p class="page-lede">
            <time datetime={p().revdate}>{p().revdate}</time>
          </p>
          <article class="adoc" innerHTML={p().html} />
          <p style={{ "margin-top": "2rem" }}>
            <A href="/blog">← Blog</A>
          </p>
        </>
      )}
    </Show>
  );
}
