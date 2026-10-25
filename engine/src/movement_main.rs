use std::io::{self, BufRead};
use game::{Board, GameState, Input, Map};
use rand::{SeedableRng, rngs::SmallRng};

fn main() {
    println!("Start");

    let mut state = GameState::new();
    let board = Board::new(Map::from_seed(state.rng_mut()));
    let stdin = io::stdin();
    
    println!("{:?}", state);
    
    loop {
        let input_string = stdin.lock().lines().next().unwrap().unwrap();
        if input_string == "exit" { break; }
    

        board.map().print();

        let player_input = Input::parse(&input_string);
        
        if player_input.is_none() {
            println!("Please enter valid input");
            continue;
        }
        
        let input = player_input.unwrap();

        if *state.player_direction() == *input.drive_direction() {
            println!("you can not move backwards");
            continue;
        }

        state = GameState::update(&board, state, input);
        println!("{:?}", state);
    }

    println!("game over");
    println!("final State: {:?}", state);
}
