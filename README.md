<a id="readme-top"></a>
<div align="center">
  <a href="https://github.com/connectome-fs/connectome-fs/graphs/contributors"><img src="https://img.shields.io/github/contributors/connectome-fs/connectome-fs.svg?style=for-the-badge" alt="Contributors"></a>
  <a href="https://github.com/connectome-fs/connectome-fs/network/members"><img src="https://img.shields.io/github/forks/connectome-fs/connectome-fs.svg?style=for-the-badge" alt="Forks"></a>
  <a href="https://github.com/connectome-fs/connectome-fs/stargazers"><img src="https://img.shields.io/github/stars/connectome-fs/connectome-fs.svg?style=for-the-badge" alt="Stargazers"></a>
  <a href="https://github.com/connectome-fs/connectome-fs/issues"><img src="https://img.shields.io/github/issues/connectome-fs/connectome-fs.svg?style=for-the-badge" alt="Issues"></a>
  <a href="https://github.com/connectome-fs/connectome-fs/blob/main/LICENSE"><img src="https://img.shields.io/github/license/connectome-fs/connectome-fs.svg?style=for-the-badge" alt="License"></a>

  <h1>connectome-fs</h1>
  <p>Graph-native filesystem substrate: GUID-addressed nodes, multi-name tokens, hierarchy as a navigation view, typed associations, editions, and sharded search.</p>
  <p>
    <a href="https://connectome-fs.github.io/connectome-fs/"><strong>Explore the site »</strong></a>
    <br />
    <a href="https://connectome-fs.github.io/connectome-fs/docs/">Docs</a>
    ·
    <a href="https://github.com/connectome-fs/connectome-fs/issues">Report Bug</a>
    ·
    <a href="https://github.com/connectome-fs/connectome-fs/issues">Request Feature</a>
  </p>
</div>

## About

Hierarchy is an entry point into the connectome, not the source of truth. Associations and multi-names carry relationships that trees alone cannot. The org exists so adapters, drivers, demos, and file-manager plugins can accumulate without crowding a personal profile or a developer-tools catalog.

Partner lanes: [DevCentr](https://devcentr.org) · [OpenShellOrg](https://openshellorg.github.io/) · [HCI Nerdz](https://hci-nerdz.github.io) · [linx.photos](https://linx.photos) · [InstaLay](https://instalay.linx.photos)

## Site + docs

* **Marketing site** — SolidStart static under `site/` (**Signal Field** design — see `DESIGN.md`)
* **News / blog / roadmap** — AsciiDoc under `site/content/` → `pnpm run content:build`
* **Docs** — Antora + Valentus theme → `site/public/docs/` (served at `/docs/`)
* **Pages** — `.github/workflows/pages.yml` → https://connectome-fs.github.io/connectome-fs/

```powershell
# Manual
npm install -g @antora/cli @antora/site-generator @antora/lunr-extension
antora antora-playbook.yml

# Site
cd site
pnpm install
pnpm build   # BASE_PATH=/connectome-fs/ in CI
```

## Tutorial: quickstart

```powershell
cargo build -p connectome-cli
cargo run -p connectome-cli -- --db demo.db demo
cargo run -p connectome-cli -- --db demo.db query "token:basename=pcss"
```

## Explanation (highlights)

* [Connectome model](docs/modules/explanation/pages/model.adoc)
* [Semantic change units](docs/modules/explanation/pages/semantic-change-units.adoc)
* [Editions](docs/modules/explanation/pages/editions.adoc) · [VCS collapse](docs/modules/explanation/pages/vcs-collapse.adoc)

## Changelog

See [CHANGELOG.adoc](CHANGELOG.adoc) and [changelog-details/](changelog-details/).

## License

MIT — see `LICENSE`.

## Contact

Ryan Johnson — [@amdphreak](https://twitter.com/amdphreak)

Org: [https://github.com/connectome-fs](https://github.com/connectome-fs)
