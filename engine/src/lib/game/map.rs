use crate::{tile::EMPTY_TILE, *};
use rand::{RngExt, SeedableRng, rngs::SmallRng};

#[derive(Clone, Copy)]
pub struct Map {
    map: [[Tile; MAP_SIZE]; MAP_SIZE],
}

impl Map {
    pub fn new() -> Self {
        Map {
            map: [[EMPTY_TILE; MAP_SIZE]; MAP_SIZE],
        }
    }

    pub fn from_seed(seed: &mut SmallRng) -> Self {
        let mut map = Map::new();
        map.generate(seed, &Position::new(), AbsoluteDirection::None);
        map
    }

    pub fn print(&self) {
        for line in self.map {
            for tile in line {
                print!("{}", tile.to_char());
            }
            println!();
        }
    }

    pub fn get_tile(&self, pos: &Position) -> &Tile {
        &self.map[pos.row()][pos.col()]
    }

    pub fn set_tile(&mut self, pos: &Position, tile: Tile) {
        self.map[pos.row()][pos.col()] = tile;
    }

    pub fn generate(&mut self, rng: &mut SmallRng, pos: &Position, direction: AbsoluteDirection) {
        let mut tile = Tile {
            edges: {
                EMPTY_TILE.edges.map(|mut edge| {
                    edge.value = if edge.direction == direction.opposite() {
                        true
                    } else {
                        if edge.direction == direction {
                            rng.random_range(0..10) < 9
                        } else if direction == AbsoluteDirection::None {
                            rng.random()
                        } else {
                            rng.random_range(0..10) < 2
                        }
                    };
                    edge
                })
            },
        };

        self.set_tile(pos, tile);

        for edge in tile.edges.iter_mut() {
            if edge.value {
                if let Some(new_pos) = pos.move_to(edge.direction) {
                    if *self.get_tile(&new_pos) == EMPTY_TILE {
                        self.generate(rng, &new_pos, edge.direction);
                    } else if !self
                        .get_tile(&new_pos)
                        .get_edge(edge.direction.opposite())
                        .value
                    {
                        edge.value = false;
                    }
                } else {
                    edge.value = false;
                }
            }
        }

        self.set_tile(pos, tile);
    }
}

