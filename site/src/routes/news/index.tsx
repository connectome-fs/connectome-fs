import { Title } from "@solidjs/meta";
import { For } from "solid-js";
import { newsItems } from "~/lib/news";

export default function NewsPage() {
  return (
    <>
      <Title>News — connectome-fs</Title>
      <section class="section" style={{ "border-top": "none", "padding-top": "0.5rem" }}>
        <h2>News</h2>
        <p class="lead">Announcements, releases, and design milestones.</p>
        <ul class="news-list">
          <For each={newsItems}>
            {(item) => (
              <li id={item.id}>
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
