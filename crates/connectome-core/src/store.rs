//! SQLite-backed connectome store.

use crate::model::*;
use crate::sort::{sort_key_for, SortAxis};
use rusqlite::{params, Connection, OptionalExtension};
use std::path::Path;
use thiserror::Error;
use uuid::Uuid;

#[derive(Debug, Error)]
pub enum StoreError {
    #[error("sqlite: {0}")]
    Sqlite(#[from] rusqlite::Error),
    #[error("not found: {0}")]
    NotFound(String),
    #[error("invalid id: {0}")]
    InvalidId(String),
    #[error("{0}")]
    Msg(String),
}

pub type Result<T> = std::result::Result<T, StoreError>;

pub struct Store {
    conn: Connection,
}

impl Store {
    pub fn open(path: impl AsRef<Path>) -> Result<Self> {
        let conn = Connection::open(path)?;
        let store = Self { conn };
        store.migrate()?;
        Ok(store)
    }

    pub fn open_in_memory() -> Result<Self> {
        let conn = Connection::open_in_memory()?;
        let store = Self { conn };
        store.migrate()?;
        Ok(store)
    }

    fn migrate(&self) -> Result<()> {
        self.conn.execute_batch(
            r#"
            PRAGMA foreign_keys = ON;
            CREATE TABLE IF NOT EXISTS nodes (
                id TEXT PRIMARY KEY NOT NULL,
                kind TEXT NOT NULL,
                is_category INTEGER NOT NULL DEFAULT 0,
                is_group INTEGER NOT NULL DEFAULT 0,
                actor TEXT,
                role TEXT,
                creator TEXT,
                category TEXT,
                working_set TEXT,
                shard TEXT NOT NULL DEFAULT 'user-authored',
                description TEXT
            );
            CREATE TABLE IF NOT EXISTS name_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                node_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
                role TEXT NOT NULL,
                value TEXT NOT NULL,
                ordinal INTEGER NOT NULL DEFAULT 0
            );
            CREATE INDEX IF NOT EXISTS idx_name_tokens_node ON name_tokens(node_id);
            CREATE INDEX IF NOT EXISTS idx_name_tokens_role_value ON name_tokens(role, value);
            CREATE TABLE IF NOT EXISTS associations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                from_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
                to_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
                assoc_type TEXT NOT NULL,
                local INTEGER NOT NULL DEFAULT 1
            );
            CREATE INDEX IF NOT EXISTS idx_assoc_from ON associations(from_id);
            CREATE INDEX IF NOT EXISTS idx_assoc_to ON associations(to_id);
            "#,
        )?;
        Ok(())
    }

    pub fn insert_node(&self, node: &Node) -> Result<()> {
        self.conn.execute(
            r#"INSERT INTO nodes
            (id, kind, is_category, is_group, actor, role, creator, category, working_set, shard, description)
            VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)"#,
            params![
                node.id.to_string(),
                node.kind.as_str(),
                node.is_category as i32,
                node.is_group as i32,
                node.actor,
                node.role,
                node.creator,
                node.category,
                node.working_set,
                node.shard.as_str(),
                node.description,
            ],
        )?;
        Ok(())
    }

    pub fn get_node(&self, id: NodeId) -> Result<Node> {
        self.conn
            .query_row(
                r#"SELECT id, kind, is_category, is_group, actor, role, creator, category,
                          working_set, shard, description FROM nodes WHERE id = ?1"#,
                params![id.to_string()],
                |row| Ok(row_to_node(row)?),
            )
            .optional()?
            .ok_or_else(|| StoreError::NotFound(id.to_string()))
    }

    pub fn add_name_token(&self, node_id: NodeId, token: &NameToken) -> Result<()> {
        self.ensure_node(node_id)?;
        self.conn.execute(
            r#"INSERT INTO name_tokens (node_id, role, value, ordinal) VALUES (?1,?2,?3,?4)"#,
            params![
                node_id.to_string(),
                token.role.as_str(),
                token.value,
                token.ordinal
            ],
        )?;
        Ok(())
    }

    pub fn list_name_tokens(&self, node_id: NodeId) -> Result<Vec<NameToken>> {
        let mut stmt = self.conn.prepare(
            r#"SELECT role, value, ordinal FROM name_tokens WHERE node_id = ?1 ORDER BY ordinal, role"#,
        )?;
        let rows = stmt.query_map(params![node_id.to_string()], |row| {
            let role_s: String = row.get(0)?;
            let role = NameRole::parse(&role_s).unwrap_or(NameRole::Alias);
            Ok(NameToken {
                role,
                value: row.get(1)?,
                ordinal: row.get(2)?,
            })
        })?;
        Ok(rows.collect::<std::result::Result<Vec<_>, _>>()?)
    }

    pub fn link(
        &self,
        from: NodeId,
        to: NodeId,
        assoc_type: AssocType,
        local: bool,
    ) -> Result<i64> {
        self.ensure_node(from)?;
        self.ensure_node(to)?;
        self.conn.execute(
            r#"INSERT INTO associations (from_id, to_id, assoc_type, local) VALUES (?1,?2,?3,?4)"#,
            params![from.to_string(), to.to_string(), assoc_type.as_str(), local as i32],
        )?;
        Ok(self.conn.last_insert_rowid())
    }

    pub fn children_of(&self, parent: NodeId) -> Result<Vec<NodeId>> {
        // member-of: child -> parent; parent-of: parent -> child
        let mut ids = Vec::new();
        let mut stmt = self.conn.prepare(
            r#"SELECT from_id FROM associations WHERE to_id = ?1 AND assoc_type = 'member-of'
               UNION
               SELECT to_id FROM associations WHERE from_id = ?1 AND assoc_type = 'parent-of'"#,
        )?;
        let rows = stmt.query_map(params![parent.to_string()], |row| {
            let s: String = row.get(0)?;
            Ok(Uuid::parse_str(&s).map_err(|e| {
                rusqlite::Error::FromSqlConversionFailure(
                    0,
                    rusqlite::types::Type::Text,
                    Box::new(e),
                )
            })?)
        })?;
        for r in rows {
            ids.push(r?);
        }
        Ok(ids)
    }

    pub fn list_under(
        &self,
        parent: Option<NodeId>,
        axis: SortAxis,
        context: &ContextPath,
    ) -> Result<Vec<ListedNode>> {
        let child_ids = match parent {
            Some(p) => self.children_of(p)?,
            None => self.all_node_ids()?,
        };
        let mut listed = Vec::new();
        for id in child_ids {
            let node = self.get_node(id)?;
            if !context.matches(&node) {
                continue;
            }
            let names = self.list_name_tokens(id)?;
            let sort_key = sort_key_for(&names, axis);
            listed.push(ListedNode {
                node,
                names,
                sort_key,
            });
        }
        listed.sort_by(|a, b| {
            a.sort_key
                .to_ascii_lowercase()
                .cmp(&b.sort_key.to_ascii_lowercase())
                .then_with(|| a.node.id.cmp(&b.node.id))
        });
        Ok(listed)
    }

    pub fn all_nodes(&self) -> Result<Vec<Node>> {
        let mut stmt = self.conn.prepare(
            r#"SELECT id, kind, is_category, is_group, actor, role, creator, category,
                      working_set, shard, description FROM nodes"#,
        )?;
        let rows = stmt.query_map([], |row| Ok(row_to_node(row)?))?;
        Ok(rows.collect::<std::result::Result<Vec<_>, _>>()?)
    }

    pub fn associations_for(&self, node_id: NodeId) -> Result<Vec<Association>> {
        let mut stmt = self.conn.prepare(
            r#"SELECT id, from_id, to_id, assoc_type, local FROM associations
               WHERE from_id = ?1 OR to_id = ?1"#,
        )?;
        let rows = stmt.query_map(params![node_id.to_string()], |row| {
            let from_s: String = row.get(1)?;
            let to_s: String = row.get(2)?;
            let type_s: String = row.get(3)?;
            Ok(Association {
                id: row.get(0)?,
                from: Uuid::parse_str(&from_s).unwrap_or_default(),
                to: Uuid::parse_str(&to_s).unwrap_or_default(),
                assoc_type: AssocType::parse(&type_s).unwrap_or(AssocType::RelatedTo),
                local: row.get::<_, i32>(4)? != 0,
            })
        })?;
        Ok(rows.collect::<std::result::Result<Vec<_>, _>>()?)
    }

    fn all_node_ids(&self) -> Result<Vec<NodeId>> {
        let mut stmt = self.conn.prepare("SELECT id FROM nodes")?;
        let rows = stmt.query_map([], |row| {
            let s: String = row.get(0)?;
            Ok(Uuid::parse_str(&s).unwrap_or_default())
        })?;
        Ok(rows.collect::<std::result::Result<Vec<_>, _>>()?)
    }

    fn ensure_node(&self, id: NodeId) -> Result<()> {
        let exists: bool = self.conn.query_row(
            "SELECT EXISTS(SELECT 1 FROM nodes WHERE id = ?1)",
            params![id.to_string()],
            |row| row.get(0),
        )?;
        if exists {
            Ok(())
        } else {
            Err(StoreError::NotFound(id.to_string()))
        }
    }

    pub fn parse_id(s: &str) -> Result<NodeId> {
        Uuid::parse_str(s).map_err(|_| StoreError::InvalidId(s.to_string()))
    }
}

fn row_to_node(row: &rusqlite::Row<'_>) -> rusqlite::Result<Node> {
    let id_s: String = row.get(0)?;
    let kind_s: String = row.get(1)?;
    let shard_s: String = row.get(9)?;
    Ok(Node {
        id: Uuid::parse_str(&id_s).unwrap_or_default(),
        kind: NodeKind::parse(&kind_s).unwrap_or(NodeKind::File),
        is_category: row.get::<_, i32>(2)? != 0,
        is_group: row.get::<_, i32>(3)? != 0,
        actor: row.get(4)?,
        role: row.get(5)?,
        creator: row.get(6)?,
        category: row.get(7)?,
        working_set: row.get(8)?,
        shard: SearchShardTag::parse(&shard_s).unwrap_or(SearchShardTag::UserAuthored),
        description: row.get(10)?,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn multi_name_sort_keeps_both_versions() {
        let store = Store::open_in_memory().unwrap();
        let mut a = Node::new(NodeKind::File);
        a.shard = SearchShardTag::UserAuthored;
        let mut b = Node::new(NodeKind::File);
        b.shard = SearchShardTag::UserAuthored;
        store.insert_node(&a).unwrap();
        store.insert_node(&b).unwrap();
        store
            .add_name_token(
                a.id,
                &NameToken {
                    role: NameRole::Basename,
                    value: "pcss".into(),
                    ordinal: 0,
                },
            )
            .unwrap();
        store
            .add_name_token(
                a.id,
                &NameToken {
                    role: NameRole::Version,
                    value: "1.0.0".into(),
                    ordinal: 1,
                },
            )
            .unwrap();
        store
            .add_name_token(
                a.id,
                &NameToken {
                    role: NameRole::Display,
                    value: "pcss.zip".into(),
                    ordinal: 2,
                },
            )
            .unwrap();
        store
            .add_name_token(
                b.id,
                &NameToken {
                    role: NameRole::Basename,
                    value: "pcss".into(),
                    ordinal: 0,
                },
            )
            .unwrap();
        store
            .add_name_token(
                b.id,
                &NameToken {
                    role: NameRole::Version,
                    value: "1.2.3".into(),
                    ordinal: 1,
                },
            )
            .unwrap();
        store
            .add_name_token(
                b.id,
                &NameToken {
                    role: NameRole::Display,
                    value: "pcss-1.2.3.zip".into(),
                    ordinal: 2,
                },
            )
            .unwrap();

        let by_version = store
            .list_under(None, SortAxis::Version, &ContextPath::default())
            .unwrap();
        assert_eq!(by_version.len(), 2);
        assert_eq!(by_version[0].sort_key, "1.0.0");
        assert_eq!(by_version[1].sort_key, "1.2.3");

        let by_base = store
            .list_under(None, SortAxis::Basename, &ContextPath::default())
            .unwrap();
        assert_eq!(by_base[0].sort_key, "pcss");
        assert_eq!(by_base[1].sort_key, "pcss");
    }
}
