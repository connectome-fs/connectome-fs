import { Title } from "@solidjs/meta";
import roadmap from "~/lib/roadmap.generated.json";

type Roadmap = {
  title: string;
  description: string;
  html: string;
};

export default function RoadmapPage() {
  const doc = roadmap as Roadmap | null;
  return (
    <>
      <Title>{doc?.title ?? "Roadmap"} — connectome-fs</Title>
      {doc?.description && <p class="page-lede">{doc.description}</p>}
      <article class="adoc roadmap-checks" innerHTML={doc?.html ?? "<p>Roadmap missing. Run content build.</p>"} />
    </>
  );
}
