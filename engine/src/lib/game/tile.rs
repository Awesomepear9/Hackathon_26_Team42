use crate::{
    AbsoluteDirection::{self},
    CROSSING_ALL, CROSSING_DOWN, CROSSING_LEFT, CROSSING_RIGHT, CROSSING_UP, DOWN_LEFT, DOWN_RIGHT,
    HORIZONTAL_LINE, TileType, UP_LEFT, UP_RIGHT, VERTICAL_LINE,
};

#[derive(PartialEq, Clone, Copy)]
pub struct DirectedValue<T> {
    pub direction: AbsoluteDirection,
    pub value: T,
}

#[derive(Copy, Clone, PartialEq)]
pub struct Tile {
    pub edges: [DirectedValue<bool>; 4],
}

pub const EMPTY_TILE: Tile = Tile {
    edges: [
        DirectedValue {
            direction: AbsoluteDirection::North,
            value: false,
        },
        DirectedValue {
            direction: AbsoluteDirection::South,
            value: false,
        },
        DirectedValue {
            direction: AbsoluteDirection::West,
            value: false,
        },
        DirectedValue {
            direction: AbsoluteDirection::East,
            value: false,
        },
    ],
};

impl Tile {
    pub fn get_edge(&self, direction: AbsoluteDirection) -> &DirectedValue<bool> {
        let edge = match direction {
            AbsoluteDirection::North => &self.edges[0],
            AbsoluteDirection::South => &self.edges[1],
            AbsoluteDirection::West => &self.edges[2],
            AbsoluteDirection::East => &self.edges[3],
            AbsoluteDirection::None => unreachable!("cannot get edge None"),
        };

        assert_eq!(direction, edge.direction);

        edge
    }

    pub fn to_tile_type(self) -> TileType {
        let north = self.get_edge(AbsoluteDirection::North).value;
        let south = self.get_edge(AbsoluteDirection::South).value;
        let west = self.get_edge(AbsoluteDirection::West).value;
        let east = self.get_edge(AbsoluteDirection::East).value;

        if !north && !south && !west && !east {
            TileType::Grass
        } else {
            TileType::Road {
                north,
                south,
                west,
                east,
            }
        }
    }

    pub fn to_char(self) -> char {
        match self {
            EMPTY_TILE => ' ',
            Self {
                edges:
                    [
                        DirectedValue {
                            direction: AbsoluteDirection::North,
                            value: _,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::South,
                            value: _,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::West,
                            value: false,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::East,
                            value: false,
                        },
                    ],
            } => VERTICAL_LINE,
            Self {
                edges:
                    [
                        DirectedValue {
                            direction: AbsoluteDirection::North,
                            value: false,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::South,
                            value: false,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::West,
                            value: _,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::East,
                            value: _,
                        },
                    ],
            } => HORIZONTAL_LINE,
            Self {
                edges:
                    [
                        DirectedValue {
                            direction: AbsoluteDirection::North,
                            value: true,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::South,
                            value: false,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::West,
                            value: true,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::East,
                            value: false,
                        },
                    ],
            } => UP_LEFT,
            Self {
                edges:
                    [
                        DirectedValue {
                            direction: AbsoluteDirection::North,
                            value: true,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::South,
                            value: false,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::West,
                            value: false,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::East,
                            value: true,
                        },
                    ],
            } => UP_RIGHT,
            Self {
                edges:
                    [
                        DirectedValue {
                            direction: AbsoluteDirection::North,
                            value: false,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::South,
                            value: true,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::West,
                            value: true,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::East,
                            value: false,
                        },
                    ],
            } => DOWN_LEFT,
            Self {
                edges:
                    [
                        DirectedValue {
                            direction: AbsoluteDirection::North,
                            value: false,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::South,
                            value: true,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::West,
                            value: false,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::East,
                            value: true,
                        },
                    ],
            } => DOWN_RIGHT,
            Self {
                edges:
                    [
                        DirectedValue {
                            direction: AbsoluteDirection::North,
                            value: true,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::South,
                            value: true,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::West,
                            value: true,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::East,
                            value: false,
                        },
                    ],
            } => CROSSING_LEFT,
            Self {
                edges:
                    [
                        DirectedValue {
                            direction: AbsoluteDirection::North,
                            value: true,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::South,
                            value: true,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::West,
                            value: false,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::East,
                            value: true,
                        },
                    ],
            } => CROSSING_RIGHT,
            Self {
                edges:
                    [
                        DirectedValue {
                            direction: AbsoluteDirection::North,
                            value: true,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::South,
                            value: false,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::West,
                            value: true,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::East,
                            value: true,
                        },
                    ],
            } => CROSSING_UP,
            Self {
                edges:
                    [
                        DirectedValue {
                            direction: AbsoluteDirection::North,
                            value: false,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::South,
                            value: true,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::West,
                            value: true,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::East,
                            value: true,
                        },
                    ],
            } => CROSSING_DOWN,
            Self {
                edges:
                    [
                        DirectedValue {
                            direction: AbsoluteDirection::North,
                            value: true,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::South,
                            value: true,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::West,
                            value: true,
                        },
                        DirectedValue {
                            direction: AbsoluteDirection::East,
                            value: true,
                        },
                    ],
            } => CROSSING_ALL,
            _ => unreachable!("invalid tile specification"),
        }
    }
}
