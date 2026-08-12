# Agent notes — connectome-fs

Project facts for agents. Workstation/env facts live only in `$CODE_ROOT/MEMORIES.md` (never recreate a per-repo `MEMORIES.md`).

## Identity

- Org + repo: `connectome-fs/connectome-fs` (transferred AMDphreak → dev-centr → connectome-fs)
- Public site: https://connectome-fs.github.io/connectome-fs/
- Docs: Antora Valentus at `/docs/` (`antora-playbook.yml` → `site/public/docs/`)
- Partners (not owners): DevCentr, OpenShellOrg, HCI Nerdz, linx.photos, InstaLay

## Stack

- Rust workspace, SQLite (`rusqlite` bundled), CLI binary `cfs` (`connectome-cli`)
- Bindings: Rust core + C ABI; D first wrapper — `docs/modules/explanation/pages/bindings.adoc`
- Site: SolidStart **Signal Field** (`DESIGN.md`); news/blog/roadmap from AsciiDoc under `site/content/`
- `.gitignore` is allow-list (`*` then `!` includes). Do **not** allow-list `MEMORIES.md`.

## Related HCI claim

- Path strings are navigation, not identity — docs `explanation/navigating-by-content.adoc`; HCI Nerdz *Navigating by content*
