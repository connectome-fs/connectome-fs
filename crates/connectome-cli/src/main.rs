use anyhow::{bail, Context, Result};
use clap::{Parser, Subcommand, ValueEnum};
use connectome_core::{
    materialize, run_query, AssocType, ContextPath, MetadataShard, NameRole, NameToken, Node,
    NodeKind, Query, SearchShard, SearchShardTag, SortAxis, Store,
};
use std::path::{Path, PathBuf};

#[derive(Parser)]
#[command(name = "cfs", about = "connectome-fs CLI — hierarchy as view, graph as truth")]
struct Cli {
    /// Path to the connectome SQLite database
    #[arg(long, global = true, default_value = "connectome.db")]
    db: PathBuf,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Create an empty connectome database
    Init,
    /// Add a node
    Add {
        #[arg(long, value_enum, default_value = "file")]
        kind: KindArg,
        /// Initial display name
        #[arg(long)]
        name: Option<String>,
        #[arg(long, value_enum, default_value = "user-authored")]
        shard: ShardArg,
        #[arg(long)]
        actor: Option<String>,
        #[arg(long)]
        role: Option<String>,
        #[arg(long)]
        creator: Option<String>,
        #[arg(long)]
        category: Option<String>,
        #[arg(long)]
        description: Option<String>,
        /// Also mark as category (dual citizenship)
        #[arg(long)]
        as_category: bool,
        /// Also mark as group (dual citizenship)
        #[arg(long)]
        as_group: bool,
    },
    /// Add or list name tokens for a node
    Name {
        node_id: String,
        #[arg(long)]
        list: bool,
        #[arg(long, value_enum)]
        role: Option<NameRoleArg>,
        #[arg(long)]
        value: Option<String>,
        #[arg(long, default_value_t = 0)]
        ordinal: i32,
    },
    /// Create an association between nodes
    Link {
        from: String,
        to: String,
        #[arg(long, value_enum, default_value = "member-of")]
        kind: AssocArg,
        #[arg(long)]
        global: bool,
    },
    /// List children (hierarchy view) sorted by a name-token axis
    Ls {
        #[arg(long)]
        parent: Option<String>,
        #[arg(long, value_enum, default_value = "display")]
        sort: SortArg,
        #[arg(long)]
        actor: Option<String>,
        #[arg(long)]
        role: Option<String>,
        #[arg(long)]
        category: Option<String>,
        #[arg(long, default_value_t = 1)]
        depth: usize,
    },
    /// Non-hierarchical query
    Query {
        expression: String,
    },
    /// Sharded search (default shard: user-authored)
    Search {
        text: String,
        #[arg(long, value_enum, default_value = "user")]
        shard: SearchShardArg,
    },
    /// Load the vendor-filename multi-name demo
    Demo,
}

#[derive(Clone, ValueEnum)]
enum KindArg {
    File,
    Category,
    Group,
    Role,
    Context,
}

impl From<KindArg> for NodeKind {
    fn from(k: KindArg) -> Self {
        match k {
            KindArg::File => NodeKind::File,
            KindArg::Category => NodeKind::Category,
            KindArg::Group => NodeKind::Group,
            KindArg::Role => NodeKind::Role,
            KindArg::Context => NodeKind::Context,
        }
    }
}

#[derive(Clone, ValueEnum)]
enum ShardArg {
    #[value(name = "user-authored")]
    UserAuthored,
    System,
    #[value(name = "app-support")]
    AppSupport,
}

impl From<ShardArg> for SearchShardTag {
    fn from(s: ShardArg) -> Self {
        match s {
            ShardArg::UserAuthored => SearchShardTag::UserAuthored,
            ShardArg::System => SearchShardTag::System,
            ShardArg::AppSupport => SearchShardTag::AppSupport,
        }
    }
}

#[derive(Clone, ValueEnum)]
enum NameRoleArg {
    Display,
    Basename,
    Version,
    Type,
    Alias,
    Publisher,
}

impl From<NameRoleArg> for NameRole {
    fn from(r: NameRoleArg) -> Self {
        match r {
            NameRoleArg::Display => NameRole::Display,
            NameRoleArg::Basename => NameRole::Basename,
            NameRoleArg::Version => NameRole::Version,
            NameRoleArg::Type => NameRole::Type,
            NameRoleArg::Alias => NameRole::Alias,
            NameRoleArg::Publisher => NameRole::Publisher,
        }
    }
}

#[derive(Clone, ValueEnum)]
enum AssocArg {
    #[value(name = "member-of")]
    MemberOf,
    #[value(name = "parent-of")]
    ParentOf,
    #[value(name = "related-to")]
    RelatedTo,
    #[value(name = "generated-from")]
    GeneratedFrom,
    #[value(name = "depends-on")]
    DependsOn,
}

impl From<AssocArg> for AssocType {
    fn from(a: AssocArg) -> Self {
        match a {
            AssocArg::MemberOf => AssocType::MemberOf,
            AssocArg::ParentOf => AssocType::ParentOf,
            AssocArg::RelatedTo => AssocType::RelatedTo,
            AssocArg::GeneratedFrom => AssocType::GeneratedFrom,
            AssocArg::DependsOn => AssocType::DependsOn,
        }
    }
}

#[derive(Clone, ValueEnum)]
enum SortArg {
    Display,
    Basename,
    Version,
    Type,
    Publisher,
}

impl From<SortArg> for SortAxis {
    fn from(s: SortArg) -> Self {
        match s {
            SortArg::Display => SortAxis::Display,
            SortArg::Basename => SortAxis::Basename,
            SortArg::Version => SortAxis::Version,
            SortArg::Type => SortAxis::Type,
            SortArg::Publisher => SortAxis::Publisher,
        }
    }
}

#[derive(Clone, ValueEnum)]
enum SearchShardArg {
    User,
    System,
    App,
    All,
}

fn open_db(path: &Path) -> Result<Store> {
    Store::open(path).with_context(|| format!("opening {}", path.display()))
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::Init => {
            let _ = open_db(&cli.db)?;
            println!("initialized {}", cli.db.display());
        }
        Commands::Add {
            kind,
            name,
            shard,
            actor,
            role,
            creator,
            category,
            description,
            as_category,
            as_group,
        } => {
            let store = open_db(&cli.db)?;
            let mut node = Node::new(kind.into());
            node.shard = shard.into();
            node.actor = actor;
            node.role = role;
            node.creator = creator;
            node.category = category;
            node.description = description;
            if as_category {
                node.is_category = true;
            }
            if as_group {
                node.is_group = true;
            }
            store.insert_node(&node)?;
            if let Some(n) = name {
                store.add_name_token(
                    node.id,
                    &NameToken {
                        role: NameRole::Display,
                        value: n.clone(),
                        ordinal: 0,
                    },
                )?;
                println!("{}  {}", node.id, n);
            } else {
                println!("{}", node.id);
            }
        }
        Commands::Name {
            node_id,
            list,
            role,
            value,
            ordinal,
        } => {
            let store = open_db(&cli.db)?;
            let id = Store::parse_id(&node_id)?;
            if list || (role.is_none() && value.is_none()) {
                for t in store.list_name_tokens(id)? {
                    println!("{}\t{}\t{}", t.ordinal, t.role.as_str(), t.value);
                }
            } else {
                let role_arg = role.ok_or_else(|| anyhow::anyhow!("--role required when adding"))?;
                let value = value.ok_or_else(|| anyhow::anyhow!("--value required when adding"))?;
                let name_role: NameRole = role_arg.into();
                store.add_name_token(
                    id,
                    &NameToken {
                        role: name_role,
                        value: value.clone(),
                        ordinal,
                    },
                )?;
                println!("added {}={value}", name_role.as_str());
            }
        }
        Commands::Link {
            from,
            to,
            kind,
            global,
        } => {
            let store = open_db(&cli.db)?;
            let from_id = Store::parse_id(&from)?;
            let to_id = Store::parse_id(&to)?;
            let link_id = store.link(from_id, to_id, kind.into(), !global)?;
            println!("association #{link_id}");
        }
        Commands::Ls {
            parent,
            sort,
            actor,
            role,
            category,
            depth,
        } => {
            let store = open_db(&cli.db)?;
            let parent_id = parent.as_deref().map(Store::parse_id).transpose()?;
            let ctx = ContextPath {
                actor,
                role,
                category,
                ..ContextPath::default()
            };
            let tree = materialize(&store, parent_id, sort.into(), &ctx, depth.max(1))?;
            print_tree(&tree, 0);
        }
        Commands::Query { expression } => {
            let store = open_db(&cli.db)?;
            let q = Query::parse(&expression)?;
            for (node, names) in run_query(&store, &q)? {
                let display = names
                    .iter()
                    .find(|t| t.role == NameRole::Display)
                    .map(|t| t.value.as_str())
                    .unwrap_or("(unnamed)");
                println!(
                    "{}\t{}\t{}\t{}",
                    node.id,
                    node.kind.as_str(),
                    node.shard.as_str(),
                    display
                );
            }
        }
        Commands::Search { text, shard } => {
            let store = open_db(&cli.db)?;
            let tag = match shard {
                SearchShardArg::User => Some(SearchShardTag::UserAuthored),
                SearchShardArg::System => Some(SearchShardTag::System),
                SearchShardArg::App => Some(SearchShardTag::AppSupport),
                SearchShardArg::All => None,
            };
            let backend = MetadataShard { tag };
            for node in backend.search(&store, &text)? {
                let names = store.list_name_tokens(node.id)?;
                let display = names
                    .iter()
                    .find(|t| t.role == NameRole::Display)
                    .map(|t| t.value.as_str())
                    .unwrap_or("(unnamed)");
                println!(
                    "{}\t{}\t{}\t{}",
                    node.id,
                    node.kind.as_str(),
                    node.shard.as_str(),
                    display
                );
            }
        }
        Commands::Demo => {
            run_demo(&cli.db)?;
        }
    }
    Ok(())
}

fn print_tree(nodes: &[connectome_core::HierarchyNode], indent: usize) {
    for n in nodes {
        let pad = "  ".repeat(indent);
        let display = n
            .listed
            .names
            .iter()
            .find(|t| t.role == NameRole::Display)
            .map(|t| t.value.as_str())
            .unwrap_or("(unnamed)");
        println!(
            "{pad}{}\t{}\t[{}]\t{}",
            n.listed.node.id,
            n.listed.node.kind.as_str(),
            n.listed.sort_key,
            display
        );
        print_tree(&n.children, indent + 1);
    }
}

fn run_demo(db: &Path) -> Result<()> {
    if db.exists() {
        bail!(
            "refusing to overwrite existing {}; pass a fresh --db path",
            db.display()
        );
    }
    let store = open_db(db)?;

    let mut downloads = Node::new(NodeKind::Category);
    downloads.category = Some("Downloads".into());
    downloads.actor = Some("user".into());
    downloads.role = Some("user".into());
    store.insert_node(&downloads)?;
    store.add_name_token(
        downloads.id,
        &NameToken {
            role: NameRole::Display,
            value: "Downloads".into(),
            ordinal: 0,
        },
    )?;

    // Old vendor drop: same basename, unversioned display name (pcss.zip / pcss (1).zip problem)
    let mut old = Node::new(NodeKind::File);
    old.category = Some("Downloads".into());
    old.actor = Some("user".into());
    old.creator = Some("vendor".into());
    old.shard = SearchShardTag::UserAuthored;
    store.insert_node(&old)?;
    for (role, value, ordinal) in [
        (NameRole::Basename, "pcss", 0),
        (NameRole::Version, "1.0.0", 1),
        (NameRole::Type, "zip", 2),
        (NameRole::Display, "pcss.zip", 3),
        (NameRole::Alias, "pcss (1).zip", 4),
    ] {
        store.add_name_token(
            old.id,
            &NameToken {
                role,
                value: value.into(),
                ordinal,
            },
        )?;
    }

    let mut newv = Node::new(NodeKind::File);
    newv.category = Some("Downloads".into());
    newv.actor = Some("user".into());
    newv.creator = Some("vendor".into());
    newv.shard = SearchShardTag::UserAuthored;
    store.insert_node(&newv)?;
    for (role, value, ordinal) in [
        (NameRole::Basename, "pcss", 0),
        (NameRole::Version, "1.2.3", 1),
        (NameRole::Type, "zip", 2),
        (NameRole::Display, "pcss-1.2.3.zip", 3),
    ] {
        store.add_name_token(
            newv.id,
            &NameToken {
                role,
                value: value.into(),
                ordinal,
            },
        )?;
    }

    // System noise that default search should hide
    let mut sys = Node::new(NodeKind::File);
    sys.shard = SearchShardTag::System;
    store.insert_node(&sys)?;
    store.add_name_token(
        sys.id,
        &NameToken {
            role: NameRole::Display,
            value: "pcss-driver.sys".into(),
            ordinal: 0,
        },
    )?;
    store.add_name_token(
        sys.id,
        &NameToken {
            role: NameRole::Basename,
            value: "pcss".into(),
            ordinal: 1,
        },
    )?;

    store.link(old.id, downloads.id, AssocType::MemberOf, true)?;
    store.link(newv.id, downloads.id, AssocType::MemberOf, true)?;

    println!("demo database: {}", db.display());
    println!("downloads category: {}", downloads.id);
    println!("old copy:             {}  (pcss.zip / alias pcss (1).zip)", old.id);
    println!("new copy:             {}  (pcss-1.2.3.zip)", newv.id);
    println!("system noise:         {}", sys.id);
    println!();
    println!("Try:");
    println!("  cfs --db {} ls --parent {} --sort version", db.display(), downloads.id);
    println!("  cfs --db {} query \"token:basename=pcss\"", db.display());
    println!("  cfs --db {} search pcss --shard user", db.display());
    println!("  cfs --db {} search pcss --shard all", db.display());
    Ok(())
}
