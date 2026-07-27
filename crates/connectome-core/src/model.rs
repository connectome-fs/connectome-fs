//! Core types for the connectome filesystem model.

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Stable machine identity for a node.
pub type NodeId = Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum NodeKind {
    File,
    Category,
    Group,
    Role,
    Context,
}

impl NodeKind {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::File => "file",
            Self::Category => "category",
            Self::Group => "group",
            Self::Role => "role",
            Self::Context => "context",
        }
    }

    pub fn parse(s: &str) -> Option<Self> {
        match s.to_ascii_lowercase().as_str() {
            "file" => Some(Self::File),
            "category" => Some(Self::Category),
            "group" => Some(Self::Group),
            "role" => Some(Self::Role),
            "context" => Some(Self::Context),
            _ => None,
        }
    }
}

/// Role of a name token for sorting / search axes.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum NameRole {
    Display,
    Basename,
    Version,
    Type,
    Alias,
    Publisher,
}

impl NameRole {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Display => "display",
            Self::Basename => "basename",
            Self::Version => "version",
            Self::Type => "type",
            Self::Alias => "alias",
            Self::Publisher => "publisher",
        }
    }

    pub fn parse(s: &str) -> Option<Self> {
        match s.to_ascii_lowercase().as_str() {
            "display" => Some(Self::Display),
            "basename" => Some(Self::Basename),
            "version" => Some(Self::Version),
            "type" => Some(Self::Type),
            "alias" => Some(Self::Alias),
            "publisher" => Some(Self::Publisher),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct NameToken {
    pub role: NameRole,
    pub value: String,
    /// Lower sort priority number sorts first within the same role.
    pub ordinal: i32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum AssocType {
    MemberOf,
    ParentOf,
    RelatedTo,
    GeneratedFrom,
    DependsOn,
}

impl AssocType {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::MemberOf => "member-of",
            Self::ParentOf => "parent-of",
            Self::RelatedTo => "related-to",
            Self::GeneratedFrom => "generated-from",
            Self::DependsOn => "depends-on",
        }
    }

    pub fn parse(s: &str) -> Option<Self> {
        match s.to_ascii_lowercase().as_str() {
            "member-of" | "memberof" => Some(Self::MemberOf),
            "parent-of" | "parentof" => Some(Self::ParentOf),
            "related-to" | "relatedto" => Some(Self::RelatedTo),
            "generated-from" | "generatedfrom" => Some(Self::GeneratedFrom),
            "depends-on" | "dependson" => Some(Self::DependsOn),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Association {
    pub id: i64,
    pub from: NodeId,
    pub to: NodeId,
    pub assoc_type: AssocType,
    pub local: bool,
}

/// Mental-branch shard for search filtering.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum SearchShardTag {
    UserAuthored,
    System,
    AppSupport,
}

impl SearchShardTag {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::UserAuthored => "user-authored",
            Self::System => "system",
            Self::AppSupport => "app-support",
        }
    }

    pub fn parse(s: &str) -> Option<Self> {
        match s.to_ascii_lowercase().as_str() {
            "user" | "user-authored" => Some(Self::UserAuthored),
            "system" => Some(Self::System),
            "app" | "app-support" => Some(Self::AppSupport),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Node {
    pub id: NodeId,
    pub kind: NodeKind,
    /// Dual citizenship: also treat as category when true.
    pub is_category: bool,
    /// Dual citizenship: also treat as group when true.
    pub is_group: bool,
    pub actor: Option<String>,
    pub role: Option<String>,
    pub creator: Option<String>,
    pub category: Option<String>,
    pub working_set: Option<String>,
    pub shard: SearchShardTag,
    pub description: Option<String>,
}

impl Node {
    pub fn new(kind: NodeKind) -> Self {
        let (is_category, is_group) = match kind {
            NodeKind::Category => (true, false),
            NodeKind::Group => (false, true),
            _ => (false, false),
        };
        Self {
            id: Uuid::new_v4(),
            kind,
            is_category,
            is_group,
            actor: None,
            role: None,
            creator: None,
            category: None,
            working_set: None,
            shard: SearchShardTag::UserAuthored,
            description: None,
        }
    }
}

/// Context bar filters (Actor | Role | Creator | Category | Working set).
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct ContextPath {
    pub actor: Option<String>,
    pub role: Option<String>,
    pub creator: Option<String>,
    pub category: Option<String>,
    pub working_set: Option<String>,
}

impl ContextPath {
    pub fn matches(&self, node: &Node) -> bool {
        fn eq_opt(filter: &Option<String>, value: &Option<String>) -> bool {
            match filter {
                None => true,
                Some(f) => value.as_ref().is_some_and(|v| v.eq_ignore_ascii_case(f)),
            }
        }
        eq_opt(&self.actor, &node.actor)
            && eq_opt(&self.role, &node.role)
            && eq_opt(&self.creator, &node.creator)
            && eq_opt(&self.category, &node.category)
            && eq_opt(&self.working_set, &node.working_set)
    }
}

#[derive(Debug, Clone)]
pub struct ListedNode {
    pub node: Node,
    pub names: Vec<NameToken>,
    pub sort_key: String,
}
