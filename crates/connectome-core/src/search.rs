//! Sharded search scaffolding (metadata filter now; RAG later).

use crate::model::{Node, SearchShardTag};
use crate::query::{run_query, Query};
use crate::store::{Result, Store};

/// Backend hook for future embedding/RAG shards.
pub trait SearchShard {
    fn tag(&self) -> Option<SearchShardTag>;
    fn search(&self, store: &Store, text: &str) -> Result<Vec<Node>>;
}

/// Default metadata shard: filter by `SearchShardTag` then substring-match names.
pub struct MetadataShard {
    pub tag: Option<SearchShardTag>,
}

impl SearchShard for MetadataShard {
    fn tag(&self) -> Option<SearchShardTag> {
        self.tag
    }

    fn search(&self, store: &Store, text: &str) -> Result<Vec<Node>> {
        let mut q = Query {
            text: Some(text.to_string()),
            ..Query::default()
        };
        match self.tag {
            None => q.shard_all = true,
            Some(t) => q.shard = Some(t),
        }
        Ok(run_query(store, &q)?.into_iter().map(|(n, _)| n).collect())
    }
}

/// Placeholder for a future embedding-backed RAG shard.
pub struct RagShardStub {
    pub tag: SearchShardTag,
}

impl SearchShard for RagShardStub {
    fn tag(&self) -> Option<SearchShardTag> {
        Some(self.tag)
    }

    fn search(&self, store: &Store, text: &str) -> Result<Vec<Node>> {
        // v0: fall back to metadata search within the shard.
        MetadataShard { tag: Some(self.tag) }.search(store, text)
    }
}
