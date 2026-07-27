import { onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";

type GraphNode = { id: string; x: number; y: number; r: number };
type GraphEdge = { a: string; b: string };

/** Fixed constellation — percentages of the viewport. */
const NODES: GraphNode[] = [
  { id: "n0", x: 8, y: 14, r: 3.2 },
  { id: "n1", x: 22, y: 28, r: 2.4 },
  { id: "n2", x: 38, y: 12, r: 2.8 },
  { id: "n3", x: 52, y: 32, r: 3.6 },
  { id: "n4", x: 68, y: 18, r: 2.2 },
  { id: "n5", x: 84, y: 36, r: 3.0 },
  { id: "n6", x: 14, y: 58, r: 2.6 },
  { id: "n7", x: 30, y: 72, r: 3.4 },
  { id: "n8", x: 48, y: 56, r: 2.0 },
  { id: "n9", x: 62, y: 74, r: 2.8 },
  { id: "n10", x: 78, y: 62, r: 3.2 },
  { id: "n11", x: 92, y: 78, r: 2.4 },
  { id: "n12", x: 42, y: 88, r: 2.2 },
  { id: "n13", x: 6, y: 86, r: 2.0 },
];

const EDGES: GraphEdge[] = [
  { a: "n0", b: "n1" },
  { a: "n0", b: "n2" },
  { a: "n1", b: "n3" },
  { a: "n2", b: "n3" },
  { a: "n2", b: "n4" },
  { a: "n3", b: "n5" },
  { a: "n3", b: "n8" },
  { a: "n4", b: "n5" },
  { a: "n1", b: "n6" },
  { a: "n6", b: "n7" },
  { a: "n7", b: "n8" },
  { a: "n8", b: "n9" },
  { a: "n5", b: "n10" },
  { a: "n9", b: "n10" },
  { a: "n10", b: "n11" },
  { a: "n7", b: "n12" },
  { a: "n9", b: "n12" },
  { a: "n6", b: "n13" },
  { a: "n13", b: "n7" },
];

function nodeById(id: string) {
  return NODES.find((n) => n.id === id)!;
}

/**
 * Decorative connectome behind the page.
 * Nodes stay fixed; soft shadows slide inverse to the pointer.
 */
export function GraphBackdrop() {
  let layer!: HTMLDivElement;

  onMount(() => {
    if (isServer) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const max = 22; // px shadow travel
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    const tick = () => {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      // Inverse: pointer right → shadow left
      layer.style.setProperty("--shadow-x", `${-curX * max}px`);
      layer.style.setProperty("--shadow-y", `${-curY * max}px`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      targetX = (e.clientX / w) * 2 - 1; // -1..1
      targetY = (e.clientY / h) * 2 - 1;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    onCleanup(() => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    });
  });

  return (
    <div class="graph-backdrop" ref={layer} aria-hidden="true">
      <svg class="graph-svg graph-svg-shadows" viewBox="0 0 100 100" preserveAspectRatio="none">
        {NODES.map((n) => (
          <circle class="graph-shadow" cx={n.x} cy={n.y} r={n.r * 1.85} />
        ))}
      </svg>
      <svg class="graph-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <g class="graph-edges">
          {EDGES.map((e) => {
            const a = nodeById(e.a);
            const b = nodeById(e.b);
            return (
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                vector-effect="non-scaling-stroke"
              />
            );
          })}
        </g>
        <g class="graph-nodes">
          {NODES.map((n) => (
            <circle
              class="graph-node"
              cx={n.x}
              cy={n.y}
              r={n.r}
              vector-effect="non-scaling-stroke"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
