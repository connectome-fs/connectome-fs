//! Simple space-separated query language.

use crate::model::*;
use crate::store::{Result, Store, StoreError};

#[derive(Debug, Clone, Default)]
pub struct Query {
    pub kind: Option<NodeKind>,
    pub shard: Option<SearchShardTag>,
    /// When true, ignore shard filter (explicit `shard:all`).
    pub shard_all: bool,
    pub actor: Option<String>,
    pub role: Option<String>,
    pub creator: Option<String>,
    pub category: Option<String>,
    pub token_role: Option<NameRole>,
    pub token_value: Option<String>,
    pub link: Option<AssocType>,
    pub text: Option<String>,
}

impl Query {
    pub fn parse(input: &str) -> Result<Self> {
        let mut q = Query::default();
        for part in input.split_whitespace() {
            let Some((key, value)) = part.split_once(':') else {
                return Err(StoreError::Msg(format!(
                    "expected key:value filter, got `{part}`"
                )));
            };
            match key.to_ascii_lowercase().as_str() {
                "kind" => {
                    q.kind = Some(
                        NodeKind::parse(value)
                            .ok_or_else(|| StoreError::Msg(format!("bad kind `{value}`")))?,
                    );
                }
                "shard" => {
                    if value.eq_ignore_ascii_case("all") {
                        q.shard_all = true;
                    } else {
                        q.shard = Some(SearchShardTag::parse(value).ok_or_else(|| {
                            StoreError::Msg(format!("bad shard `{value}`"))
                        })?);
                    }
                }
                "actor" => q.actor = Some(value.to_string()),
                "role" => q.role = Some(value.to_string()),
                "creator" => q.creator = Some(value.to_string()),
                "category" => q.category = Some(value.to_string()),
                "token" => {
                    let (r, v) = value.split_once('=').ok_or_else(|| {
                        StoreError::Msg("token filter needs role=value".into())
                    })?;
                    q.token_role = Some(
                        NameRole::parse(r)
                            .ok_or_else(|| StoreError::Msg(format!("bad token role `{r}`")))?,
                    );
                    q.token_value = Some(v.to_string());
                }
                "link" => {
                    q.link = Some(
                        AssocType::parse(value)
                            .ok_or_else(|| StoreError::Msg(format!("bad link `{value}`")))?,
                    );
                }
                "text" => q.text = Some(value.to_string()),
                other => {
                    return Err(StoreError::Msg(format!("unknown filter `{other}`")));
                }
            }
        }
        Ok(q)
    }
}

pub fn run_query(store: &Store, query: &Query) -> Result<Vec<(Node, Vec<NameToken>)>> {
    let mut out = Vec::new();
    for node in store.all_nodes()? {
        if let Some(k) = query.kind {
            if node.kind != k {
                continue;
            }
        }
        if !query.shard_all {
            let want = query.shard.unwrap_or(SearchShardTag::UserAuthored);
            if node.shard != want {
                continue;
            }
        }
        if let Some(ref a) = query.actor {
            if !node.actor.as_ref().is_some_and(|v| v.eq_ignore_ascii_case(a)) {
                continue;
            }
        }
        if let Some(ref r) = query.role {
            if !node.role.as_ref().is_some_and(|v| v.eq_ignore_ascii_case(r)) {
                continue;
            }
        }
        if let Some(ref c) = query.creator {
            if !node
                .creator
                .as_ref()
                .is_some_and(|v| v.eq_ignore_ascii_case(c))
            {
                continue;
            }
        }
        if let Some(ref cat) = query.category {
            if !node
                .category
                .as_ref()
                .is_some_and(|v| v.eq_ignore_ascii_case(cat))
            {
                continue;
            }
        }
        let names = store.list_name_tokens(node.id)?;
        if let (Some(role), Some(ref val)) = (query.token_role, &query.token_value) {
            if !names
                .iter()
                .any(|t| t.role == role && t.value.eq_ignore_ascii_case(val))
            {
                continue;
            }
        }
        if let Some(ref text) = query.text {
            let lower = text.to_ascii_lowercase();
            if !names
                .iter()
                .any(|t| t.value.to_ascii_lowercase().contains(&lower))
            {
                continue;
            }
        }
        if let Some(link) = query.link {
            let assocs = store.associations_for(node.id)?;
            if !assocs.iter().any(|a| a.assoc_type == link) {
                continue;
            }
        }
        out.push((node, names));
    }
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::store::Store;

    #[test]
    fn query_by_basename_and_default_shard() {
        let store = Store::open_in_memory().unwrap();
        let mut user = Node::new(NodeKind::File);
        user.shard = SearchShardTag::UserAuthored;
        let mut sys = Node::new(NodeKind::File);
        sys.shard = SearchShardTag::System;
        store.insert_node(&user).unwrap();
        store.insert_node(&sys).unwrap();
        store
            .add_name_token(
                user.id,
                &NameToken {
                    role: NameRole::Basename,
                    value: "pcss".into(),
                    ordinal: 0,
                },
            )
            .unwrap();
        store
            .add_name_token(
                sys.id,
                &NameToken {
                    role: NameRole::Basename,
                    value: "pcss".into(),
                    ordinal: 0,
                },
            )
            .unwrap();
        let q = Query::parse("token:basename=pcss").unwrap();
        let hits = run_query(&store, &q).unwrap();
        assert_eq!(hits.len(), 1);
        assert_eq!(hits[0].0.id, user.id);
    }
}
