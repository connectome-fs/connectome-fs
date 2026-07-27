//! Multi-name sort axes.

use crate::model::{NameRole, NameToken};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SortAxis {
    Display,
    Basename,
    Version,
    Type,
    Publisher,
}

impl SortAxis {
    pub fn parse(s: &str) -> Option<Self> {
        match s.to_ascii_lowercase().as_str() {
            "display" => Some(Self::Display),
            "basename" => Some(Self::Basename),
            "version" => Some(Self::Version),
            "type" => Some(Self::Type),
            "publisher" => Some(Self::Publisher),
            _ => None,
        }
    }

    pub fn as_str(self) -> &'static str {
        match self {
            Self::Display => "display",
            Self::Basename => "basename",
            Self::Version => "version",
            Self::Type => "type",
            Self::Publisher => "publisher",
        }
    }

    fn role(self) -> NameRole {
        match self {
            Self::Display => NameRole::Display,
            Self::Basename => NameRole::Basename,
            Self::Version => NameRole::Version,
            Self::Type => NameRole::Type,
            Self::Publisher => NameRole::Publisher,
        }
    }
}

pub fn sort_key_for(names: &[NameToken], axis: SortAxis) -> String {
    let role = axis.role();
    names
        .iter()
        .filter(|t| t.role == role)
        .min_by_key(|t| t.ordinal)
        .map(|t| t.value.clone())
        .or_else(|| {
            names
                .iter()
                .find(|t| t.role == NameRole::Display)
                .map(|t| t.value.clone())
        })
        .unwrap_or_default()
}
