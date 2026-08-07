<a id="readme-top"></a>
<div align="center">
  <a href="https://github.com/AMDphreak/connectome-fs/graphs/contributors"><img src="https://img.shields.io/github/contributors/AMDphreak/connectome-fs.svg?style=for-the-badge" alt="Contributors"></a>
  <a href="https://github.com/AMDphreak/connectome-fs/network/members"><img src="https://img.shields.io/github/forks/AMDphreak/connectome-fs.svg?style=for-the-badge" alt="Forks"></a>
  <a href="https://github.com/AMDphreak/connectome-fs/stargazers"><img src="https://img.shields.io/github/stars/AMDphreak/connectome-fs.svg?style=for-the-badge" alt="Stargazers"></a>
  <a href="https://github.com/AMDphreak/connectome-fs/issues"><img src="https://img.shields.io/github/issues/AMDphreak/connectome-fs.svg?style=for-the-badge" alt="Issues"></a>
  <a href="https://github.com/AMDphreak/connectome-fs/blob/main/LICENSE"><img src="https://img.shields.io/github/license/AMDphreak/connectome-fs.svg?style=for-the-badge" alt="License"></a>

  <h1>connectome-fs</h1>
  <p>Modern graph-based flat filesystem prototype: GUID-addressed nodes, multi-name tokens, hierarchy as a navigation view, typed associations, context filters, and sharded search.</p>
  <p>
    <a href="https://amdphreak.github.io/connectome-fs/"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/AMDphreak/connectome-fs/issues">Report Bug</a>
    &middot;
    <a href="https://github.com/AMDphreak/connectome-fs/issues">Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#changelog">Changelog</a></li>
    <li><a href="#tutorial-quickstart">Tutorial: quickstart</a></li>
    <li><a href="#how-to">How-to</a></li>
    <li><a href="#explanation">Explanation</a></li>
    <li><a href="#reference">Reference</a></li>
    <li><a href="#out-of-scope-v0">Out of scope (v0)</a></li>
    <li><a href="#website">Website</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About The Project

Modern graph-based flat filesystem: GUID-addressed nodes, multi-name tokens, hierarchy as a navigation view, typed associations, context filters, and sharded search.

Hierarchy is an entry point into the connectome, not the source of truth. Associations and multi-names carry relationships that trees alone cannot.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* **Core** — [![Rust][Rust.org]][Rust-url]
  * [![SQLite][SQLite.org]][SQLite-url]
* **Site** — [![SolidStart][SolidStart.dev]][SolidStart-url]
* **Manual** — [![Antora][Antora.org]][Antora-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Changelog

See [CHANGELOG.adoc](CHANGELOG.adoc) and [changelog-details/](changelog-details/).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Tutorial: quickstart

```powershell
cargo build -p connectome-cli
cargo run -p connectome-cli -- --db demo.db demo
cargo run -p connectome-cli -- --db demo.db query "token:basename=pcss"
cargo run -p connectome-cli -- --db demo.db search pcss --shard user
```

`cfs demo` seeds the vendor-filename problem: same basename `pcss`, versions `1.0.0` and `1.2.3`, plus system noise that default search hides.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## How-to

### Multi-names

```powershell
cfs --db connectome.db add --kind file --name pcss.zip
# note the printed GUID, then:
cfs --db connectome.db name <guid> --role basename --value pcss
cfs --db connectome.db name <guid> --role version --value 1.2.3
cfs --db connectome.db ls --sort version
```

### Contexts and hierarchy

```powershell
cfs --db connectome.db add --kind category --name Downloads --category Downloads --actor user
cfs --db connectome.db link <file-guid> <downloads-guid> --kind member-of
cfs --db connectome.db ls --parent <downloads-guid> --sort basename --actor user
```

### Queries and shards

See [query grammar](docs/modules/reference/pages/query.adoc). Default search shard is user-authored.

```powershell
cfs --db connectome.db query "shard:user-authored token:basename=pcss"
cfs --db connectome.db search pcss --shard all
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Explanation

* [Connectome model](docs/modules/explanation/pages/model.adoc)
* [Source Google Docs map](docs/modules/explanation/pages/sources.adoc)
* [Language bindings and access targets](docs/modules/explanation/pages/bindings.adoc)
* [SolidStart + Antora](docs/modules/explanation/pages/site-architecture.adoc)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Reference

* CLI: `cfs init|add|name|link|ls|query|search|demo`
* [Query grammar](docs/modules/reference/pages/query.adoc)
* Library crate: `connectome-core` (SQLite store, sort axes, `SearchShard` trait)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Out of scope (v0)

Kernel mount (WinFsp/FUSE), DHT/IPFS mesh, content-block dedup, embedding RAG backends (stubbed via `RagShardStub`).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Website

Marketing/news site is SolidStart under `site/` (static). The `/docs` route is an onboarding gate; Antora publishes under `/manual/` from AsciiDoc in `docs/modules/`. CI: `.github/workflows/pages.yml` → GitHub Pages at `https://amdphreak.github.io/connectome-fs/`.

```powershell
# from repo root
antora antora-playbook.yml
cd site
pnpm install
pnpm build
```

Enable *Settings → Pages → Source: GitHub Actions* once on the repo.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

Contributions are welcome. Open an issue to discuss larger changes before submitting a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Top contributors

<a href="https://github.com/AMDphreak/connectome-fs/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=AMDphreak/connectome-fs" alt="contributors" />
</a>

For per-person profile links, prefer [all-contributors](https://allcontributors.org/).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

MIT — see `LICENSE`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Ryan Johnson — [@amdphreak](https://twitter.com/amdphreak)

Project Link: [https://github.com/AMDphreak/connectome-fs](https://github.com/AMDphreak/connectome-fs)

Site: [https://amdphreak.github.io/connectome-fs/](https://amdphreak.github.io/connectome-fs/)

Blog: [https://ryanjohnson.dev](https://ryanjohnson.dev)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[Rust.org]: https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white
[Rust-url]: https://www.rust-lang.org/
[SQLite.org]: https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white
[SQLite-url]: https://sqlite.org/
[SolidStart.dev]: https://img.shields.io/badge/SolidStart-2C4F7C?style=for-the-badge&logo=solid&logoColor=white
[SolidStart-url]: https://start.solidjs.com/
[Antora.org]: https://img.shields.io/badge/Antora-4A4A55?style=for-the-badge&logo=asciidoctor&logoColor=white
[Antora-url]: https://antora.org/
