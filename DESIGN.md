# Design — Signal Field

connectome-fs marketing surfaces use **Signal Field**: a large empty first field, then a thin signal strip of navigation and meaning.

## Principles

1. **Field before chrome.** The first viewport is mostly brand patterning and one wordmark. Nav lives *under* the field, not competing inside it.
2. **Graph as atmosphere, not dashboard.** Nodes and edges are texture in the banner — never a control panel of cards or stats.
3. **Pink-dominant neuronal mark** on cool mineral fields. Fog paper / ink slate / pink synapse primary / teal secondary. Avoid cream–terracotta stacks and purple gradients.
4. **Light mode sheath.** Content sits in a translucent column with slanted side masks (`| / | content | / |`) so the lattice does not compete with copy.
5. **Motion as sync.** Theme cross-fade (~900ms), banner lattice drift, CTA rise — presence, not noise.
6. **AsciiDoc is the CMS.** News, blog, and roadmap build from `.adoc` under `site/content/`.

## Tokens

| Token | Light | Dark |
| --- | --- | --- |
| Field | `#e9eef2` | `#0b1116` |
| Ink | `#142029` | `#e6eef2` |
| Muted | `#4d5d6a` | `#9aadb8` |
| Synapse (pink, dominant) | `#d4568c` | `#f078a8` |
| Signal (teal, secondary) | `#0c6b6e` | `#3ec9c4` |
| Copper (tertiary) | `#b86a3d` | `#e09a62` |

Brand mark: a brain silhouette composed of neurons (pink-dominant, teal accents). `favicon.svg` is a simplified 9-node version for low-res.

## Type

* Display: **Syne** (geometric, slightly odd)
* Body: **Source Sans 3**
* Mono: **IBM Plex Mono**
