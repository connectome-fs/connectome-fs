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
    <a href="https://connectome-fs.github.io/docs/connectome-fs/"><strong>Explore the docs »</strong></a>
    <br />
    <a href="https://connectome-fs.github.io/">Website</a>
    &middot;
    <a href="https://github.com/connectome-fs/connectome-fs/issues">Report Bug</a>
    &middot;
    <a href="https://github.com/connectome-fs/connectome-fs/issues">Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about">About</a></li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#site--docs">Site + docs</a></li>
    <li><a href="#tutorial-quickstart">Tutorial: quickstart</a></li>
    <li><a href="#explanation-highlights">Explanation (highlights)</a></li>
    <li><a href="#changelog">Changelog</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About

Hierarchy is an entry point into the connectome, not the source of truth. Associations and multi-names carry relationships that trees alone cannot. The org exists so adapters, drivers, demos, and file-manager plugins can accumulate without crowding a personal profile or a developer-tools catalog.

Partner lanes: [DevCentr](https://devcentr.org) &middot; [OpenShellOrg](https://opensh.org/) &middot; [HCI Nerdz](https://hci-nerdz.github.io) &middot; [linx.photos](https://linx.photos) &middot; [InstaLay](https://instalay.linx.photos)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Built With

* **Runtime** — [![Rust][Rust.com]][Rust-url] &middot; [![SQLite][SQLite.com]][SQLite-url]
* **CLI** — [![Clap][Clap.com]][Clap-url]
* **Docs** — [![Antora][Antora.com]][Antora-url] &middot; AsciiDoc
* **Diagrams** — Mermaid (root `pnpm` scripts)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Site + docs

* **Product documentation source** — Antora component under [`docs/`](docs/)
* **Docs hub** — [`connectome-fs/docs`](https://github.com/connectome-fs/docs) → https://connectome-fs.github.io/docs/
* **This component (stable)** — https://connectome-fs.github.io/docs/connectome-fs/
* **Organization website** — [`connectome-fs.github.io`](https://github.com/connectome-fs/connectome-fs.github.io) → https://connectome-fs.github.io/
* **Diagram sources** — Mermaid under `diagrams/`; generated with the root package scripts

```powershell
pnpm install
pnpm diagrams:check
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Tutorial: quickstart

```powershell
cargo build -p connectome-cli
cargo run -p connectome-cli -- --db demo.db demo
cargo run -p connectome-cli -- --db demo.db query "token:basename=pcss"
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Explanation (highlights)

* [Connectome model](docs/modules/explanation/pages/model.adoc)
* [Semantic change units](docs/modules/explanation/pages/semantic-change-units.adoc)
* [Editions](docs/modules/explanation/pages/editions.adoc) &middot; [VCS collapse](docs/modules/explanation/pages/vcs-collapse.adoc)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Changelog

Published timeline: [docs changelog](docs/modules/ROOT/pages/changelog.adoc) (live: https://connectome-fs.github.io/docs/connectome-fs/changelog/). Repo-root [CHANGELOG.adoc](CHANGELOG.adoc) is a pointer.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

See [LICENSE](LICENSE) for the project terms (AGPL-3.0-based with additional requirements). Do not assume MIT.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Ryan Johnson — [@amdphreak](https://twitter.com/amdphreak)

Org: [https://github.com/connectome-fs](https://github.com/connectome-fs)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[Rust.com]: https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white
[Rust-url]: https://www.rust-lang.org/
[SQLite.com]: https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white
[SQLite-url]: https://www.sqlite.org/
[Clap.com]: https://img.shields.io/badge/Clap-000000?style=for-the-badge&logo=rust&logoColor=white
[Clap-url]: https://docs.rs/clap/
[Antora.com]: https://img.shields.io/badge/Antora-4C4C4C?style=for-the-badge&logo=asciidoctor&logoColor=white
[Antora-url]: https://antora.org/
