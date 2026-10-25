use rand::{SeedableRng, rngs::SmallRng};

use crate::{MAP_SIZE, board::Board, driver_error::DriverError, input::{AbsoluteDirection, Input, RelativeDirection::{self, Backwards}}};


#[derive(Debug, Clone)]
pub struct GameState {
    rng: SmallRng, // chosen by fair dice roll. guaranteed to be random.
    round: i32,
    player_x: usize,
    player_y: usize,
    player_direction: AbsoluteDirection,
    score: i32,
}

impl GameState {
    pub fn new() -> Self {
        GameState {
            rng: SeedableRng::seed_from_u64(4),
            player_x: MAP_SIZE / 2,
            player_y: MAP_SIZE / 2,
            player_direction: AbsoluteDirection::None,
            score: 0,
            round: 0
        }
    }

    pub fn update(board: &Board, mut state: Self, input: Input) -> Self { 
        let (x, y) = input.drive_direction().coords(state.player_x, state.player_y);
        
        let blink_absolute_direction = state.player_direction().turn(*input.blink_direction());
        println!("blink_direction: {:?}", blink_absolute_direction);

        //if you dont blink in the right direction, get an error
        //more work necessary 
        //if blink_absolute_direction!= input.drive_direction().turn(RelativeDirection::Backwards) {
        //    state.score -= 1;
        //    println!("you forgot to blink");
        //}

        Self {
            //the player always comes from the opposite direction of where they went
            player_direction: input
                .drive_direction()
                .clone()
                .turn(RelativeDirection::Backwards),
            player_x: x,
            player_y: y,
            score: state.score,
            round: state.round + 1,
            rng: state.rng
        }
    }
}

impl GameState {
    pub fn player_direction(&self) -> &AbsoluteDirection {
        &self.player_direction
    }

    pub fn rng_mut(&mut self) -> &mut SmallRng {
        &mut self.rng
    }
}
