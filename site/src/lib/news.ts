export type NewsItem = {
  id: string;
  date: string;
  title: string;
  summary: string;
};

export const newsItems: NewsItem[] = [
  {
    id: "2026-07-26-bootstrap",
    date: "2026-07-26",
    title: "connectome-fs bootstrap",
    summary:
      "Repo renamed, Tri-Axis/Associative docs ingested as ODT, Rust+SQLite core and cfs CLI shipped with multi-name sort and sharded search stubs.",
  },
  {
    id: "2026-07-26-site",
    date: "2026-07-26",
    title: "Project site + Antora docs",
    summary:
      "SolidStart static site on GitHub Pages with news, theme toggle, and Antora docs published under /docs/.",
  },
];
