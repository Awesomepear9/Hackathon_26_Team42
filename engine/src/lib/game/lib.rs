mod board;
mod driver_error;
mod gamestate;
mod input;

mod map;
mod position;
mod tile;

pub use crate::map::Map;
pub use crate::position::Position;
pub use crate::tile::Tile;

pub use crate::board::Board;
pub use crate::gamestate::GameState;
pub use crate::input::AbsoluteDirection;
pub use crate::input::Input;

const DOWN_RIGHT: char = '┌';
const DOWN_LEFT: char = '┐';
const UP_RIGHT: char = '└';
const UP_LEFT: char = '┘';
const CROSSING_RIGHT: char = '├';
const CROSSING_LEFT: char = '┤';
const CROSSING_DOWN: char = '┬';
const CROSSING_UP: char = '┴';
const CROSSING_ALL: char = '┼';
const HORIZONTAL_LINE: char = '─';
const VERTICAL_LINE: char = '│';

pub enum TileType {
    Road {
        north: bool,
        south: bool,
        west: bool,
        east: bool,
    },
    Grass,
}

const MAP_SIZE: usize = 19;
