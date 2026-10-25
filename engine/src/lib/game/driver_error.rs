
#[derive(Default, Clone, Copy, Debug)]
pub enum DriverError {
    DidNotBlink,
    WaitedNeedlessly,
    #[default] None
}
