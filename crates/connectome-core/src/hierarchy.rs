//! Hierarchy view: tree slice from parent/member associations.

use crate::model::{ListedNode, NodeId};
use crate::sort::SortAxis;
use crate::store::{Result, Store};
use crate::model::ContextPath;

#[derive(Debug, Clone)]
pub struct HierarchyNode {
    pub listed: ListedNode,
    pub children: Vec<HierarchyNode>,
}

/// Materialize a hierarchy slice rooted at `parent` (or all top-level if None).
/// Depth is limited to avoid cycles.
pub fn materialize(
    store: &Store,
    parent: Option<NodeId>,
    axis: SortAxis,
    context: &ContextPath,
    max_depth: usize,
) -> Result<Vec<HierarchyNode>> {
    materialize_inner(store, parent, axis, context, max_depth, 0, &mut Vec::new())
}

fn materialize_inner(
    store: &Store,
    parent: Option<NodeId>,
    axis: SortAxis,
    context: &ContextPath,
    max_depth: usize,
    depth: usize,
    stack: &mut Vec<NodeId>,
) -> Result<Vec<HierarchyNode>> {
    if depth >= max_depth {
        return Ok(Vec::new());
    }
    let listed = store.list_under(parent, axis, context)?;
    let mut out = Vec::new();
    for item in listed {
        if stack.contains(&item.node.id) {
            continue;
        }
        stack.push(item.node.id);
        let children =
            materialize_inner(store, Some(item.node.id), axis, context, max_depth, depth + 1, stack)?;
        stack.pop();
        out.push(HierarchyNode {
            listed: item,
            children,
        });
    }
    Ok(out)
}
