/**
 * Build news + blog + roadmap catalogs from AsciiDoc under site/content/.
 */
import { load } from "@asciidoctor/core";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = join(root, "content");
const outDir = join(root, "src", "lib");
const feedDir = join(root, "public", "feeds");
const siteUrl = "https://connectome-fs.github.io/connectome-fs";

function escapeXml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripTags(html) {
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function parseCollection(kind) {
  const dir = join(contentRoot, kind);
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".adoc"))
    .sort()
    .reverse();

  const posts = [];
  for (const file of files) {
    const path = join(dir, file);
    const source = readFileSync(path, "utf8");
    const doc = await load(source, {
      safe: "safe",
      attributes: { showtitle: true, stem: "latexmath" },
    });
    const slug = file.replace(/\.adoc$/i, "");
    const title = doc.getTitle() || slug;
    const html = await doc.convert();
    const description =
      doc.getAttribute("description") || stripTags(html).slice(0, 220);
    const revdate = doc.getAttribute("revdate") || slug.slice(0, 10);
    const keywords = String(doc.getAttribute("keywords") || kind)
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    posts.push({ slug, title, description, revdate, keywords, html, kind });
  }
  return posts;
}

function writeFeeds(news) {
  mkdirSync(feedDir, { recursive: true });
  const items = news
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${siteUrl}/news/${p.slug}</link>
      <guid isPermaLink="true">${siteUrl}/news/${p.slug}</guid>
      <pubDate>${new Date(p.revdate).toUTCString()}</pubDate>
      <description>${escapeXml(p.description)}</description>
    </item>`,
    )
    .join("\n");
  writeFileSync(
    join(feedDir, "news.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>connectome-fs News</title>
    <link>${siteUrl}/news</link>
    <description>Project news for the connectome-fs substrate</description>
${items}
  </channel>
</rss>
`,
  );
  writeFileSync(
    join(feedDir, "atom.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>connectome-fs News</title>
  <link href="${siteUrl}/news"/>
  <updated>${new Date().toISOString()}</updated>
  <id>${siteUrl}/news</id>
${news
  .map(
    (p) => `  <entry>
    <title>${escapeXml(p.title)}</title>
    <link href="${siteUrl}/news/${p.slug}" rel="alternate"/>
    <id>${siteUrl}/news/${p.slug}</id>
    <updated>${new Date(p.revdate).toISOString()}</updated>
    <summary>${escapeXml(p.description)}</summary>
  </entry>`,
  )
  .join("\n")}
</feed>
`,
  );
}

mkdirSync(outDir, { recursive: true });
const news = await parseCollection("news");
const blog = await parseCollection("blog");
let roadmap = null;
const roadmapPath = join(contentRoot, "roadmap.adoc");
if (existsSync(roadmapPath)) {
  const source = readFileSync(roadmapPath, "utf8");
  const doc = await load(source, { safe: "safe", attributes: { showtitle: true } });
  roadmap = {
    title: doc.getTitle() || "Roadmap",
    description: doc.getAttribute("description") || "",
    html: await doc.convert(),
  };
}

writeFileSync(join(outDir, "news.generated.json"), JSON.stringify(news, null, 2));
writeFileSync(join(outDir, "blog.generated.json"), JSON.stringify(blog, null, 2));
writeFileSync(join(outDir, "roadmap.generated.json"), JSON.stringify(roadmap, null, 2));
writeFeeds(news);
console.log(`Wrote ${news.length} news, ${blog.length} blog, roadmap=${Boolean(roadmap)}`);
