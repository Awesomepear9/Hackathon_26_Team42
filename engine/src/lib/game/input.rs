#[derive(Debug, Default, Clone, Copy, Eq, PartialEq)]
pub enum RelativeDirection{
    Left,
    Right,
    #[default] Straight,
    Backwards
}

#[derive(Debug, Default, Clone, Copy, Eq, PartialEq)]
pub enum AbsoluteDirection{
    East,
    West,
    North,
    South,
    #[default] None
}

impl AbsoluteDirection {
    pub fn turn(&self, dir: RelativeDirection) -> Self {
        match (self, dir) {
            (Self::None, _) => Self::None,
            
            (a, RelativeDirection::Straight) => a.clone(),
            
            (Self::East, RelativeDirection::Left) => Self::North,
            (Self::South, RelativeDirection::Left) => Self::East,
            (Self::West, RelativeDirection::Left) => Self::South,
            (Self::North, RelativeDirection::Left) => Self::West,

            (Self::East, RelativeDirection::Right) => Self::South,
            (Self::South, RelativeDirection::Right) => Self::West,
            (Self::West, RelativeDirection::Right) => Self::North,
            (Self::North, RelativeDirection::Right) => Self::East,

            (Self::East, RelativeDirection::Backwards) => Self::West,
            (Self::South, RelativeDirection::Backwards) => Self::North,
            (Self::West, RelativeDirection::Backwards) => Self::East,
            (Self::North, RelativeDirection::Backwards) => Self::South
        }
    }

    pub fn opposite(self) -> Self {
        self.turn(RelativeDirection::Backwards)
    }

    pub fn coords(&self, x: usize, y: usize) -> (usize, usize) {
        match self {
            Self::None => (x,y),
            Self::West => (x-1, y),
            Self::East => (x+1, y),
            Self::North => (x, y-1),
            Self::South => (x, y+1)
        }
    } 
}

#[derive(Debug, Clone, Copy, Default)]
pub struct Input{
    blink_direction: RelativeDirection,
    drive_direction: AbsoluteDirection,
}

impl Input {
    pub fn new() -> Self {
        Self::default()
    }
    pub fn parse(text: &str) -> Option<Self> {
        let mut parts = text.split_whitespace();
        let drive = match parts.next().unwrap() {
            "east" => AbsoluteDirection::East,
            "west" => AbsoluteDirection::West,
            "north" => AbsoluteDirection::North,
            "south" => AbsoluteDirection::South,
            "wait" => AbsoluteDirection::None,
            _ => return None
        };

        let blink_direction = match parts.next() {
            None => RelativeDirection:: Straight,
            Some("left") => RelativeDirection::Left,
            Some("right") => RelativeDirection:: Right,
            _       => return None 
        };
        Some(Input{ blink_direction: blink_direction, drive_direction: drive})
    }
}

impl Input {
    pub fn drive_direction(&self) -> &AbsoluteDirection {
        &self.drive_direction
    }

    pub fn blink_direction(&self) -> &RelativeDirection {
        &self.blink_direction
    }
}
