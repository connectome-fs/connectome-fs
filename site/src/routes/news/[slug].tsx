import { Title } from "@solidjs/meta";
import { A, useParams } from "@solidjs/router";
import { Show, createMemo } from "solid-js";
import news from "~/lib/news.generated.json";

type Post = {
  slug: string;
  title: string;
  description: string;
  revdate: string;
  html: string;
};

export default function NewsPost() {
  const params = useParams();
  const post = createMemo(() => (news as Post[]).find((p) => p.slug === params.slug));

  return (
    <Show
      when={post()}
      fallback={
        <>
          <Title>Not found</Title>
          <p>
            Missing news post. <A href="/news">Back to news</A>
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
            <A href="/news">← News</A>
          </p>
        </>
      )}
    </Show>
  );
}
