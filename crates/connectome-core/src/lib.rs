//! connectome-core: GUID-addressed connectome graph store.

pub mod hierarchy;
pub mod model;
pub mod query;
pub mod search;
pub mod sort;
pub mod store;

pub use hierarchy::{materialize, HierarchyNode};
pub use model::*;
pub use query::{run_query, Query};
pub use search::{MetadataShard, RagShardStub, SearchShard};
pub use sort::{sort_key_for, SortAxis};
pub use store::{Store, StoreError};
