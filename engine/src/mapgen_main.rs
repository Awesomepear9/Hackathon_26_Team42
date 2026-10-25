use std::process::ExitCode;
use game::{AbsoluteDirection, Position, Map};

use rand::{SeedableRng, rngs::SmallRng};

fn main() -> anyhow::Result<ExitCode> {
    let mut rng = SmallRng::seed_from_u64(4); // chosen by fair dice roll. guaranteed to be random.

    let mut map = Map::from_seed(&mut rng);

    map.print();

    Ok(ExitCode::SUCCESS)
}
