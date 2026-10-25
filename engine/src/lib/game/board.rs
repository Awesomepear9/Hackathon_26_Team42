use crate::map::Map;


#[derive(Copy, Clone)]
pub struct Board {
    map: Map,
}

impl Board {
    pub fn new(map: Map) -> Self {
        Board {
            map: map
        }
    }
}

impl Board {
    pub fn map(&self) -> &Map {
        &self.map
    }
}
