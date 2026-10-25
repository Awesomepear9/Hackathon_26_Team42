use crate::{AbsoluteDirection, MAP_SIZE};

#[derive(Clone, Copy)]
pub struct Position {
    row: usize,
    col: usize,
}

impl Position {
    pub fn new() -> Self {
        Position {
            row: MAP_SIZE / 2,
            col: MAP_SIZE / 2,
        }
    }

    pub fn row(&self) -> usize {
        self.row
    }

    pub fn col(&self) -> usize {
        self.col
    }

    pub fn move_to(&self, direction: AbsoluteDirection) -> Option<Self> {
        match direction {
            AbsoluteDirection::North => self.up(),
            AbsoluteDirection::South => self.down(),
            AbsoluteDirection::West => self.left(),
            AbsoluteDirection::East => self.right(),
            AbsoluteDirection::None => unreachable!("cannot move to None"),
        }
    }

    pub fn up(&self) -> Option<Self> {
        if self.row == 0 {
            return None;
        }

        Some(Self {
            row: self.row - 1,
            col: self.col,
        })
    }

    pub fn left(&self) -> Option<Self> {
        if self.col == 0 {
            return None;
        }

        Some(Self {
            row: self.row,
            col: self.col - 1,
        })
    }

    pub fn down(&self) -> Option<Self> {
        if self.row == MAP_SIZE - 1 {
            return None;
        }

        Some(Self {
            row: self.row + 1,
            col: self.col,
        })
    }

    pub fn right(&self) -> Option<Self> {
        if self.col == MAP_SIZE - 1 {
            return None;
        }

        Some(Self {
            row: self.row,
            col: self.col + 1,
        })
    }
}

