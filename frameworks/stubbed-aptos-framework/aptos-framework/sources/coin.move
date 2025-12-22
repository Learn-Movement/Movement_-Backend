module aptos_framework::coin {
    use std::signer;

    struct Coin<T> has store, drop { // NOTE: Added 'drop' for easier stubs, or keep strict
        value: u64
    }

    struct MintCapability<T> has store {}
    struct BurnCapability<T> has store {}
    struct FreezeCapability<T> has store {}

    public fun balance<T>(_addr: address): u64 { 0 }

    public fun register<T>(_account: &signer) {}

    public fun mint<T>(_amount: u64, _cap: &MintCapability<T>): Coin<T> {
        abort 0 
    }

    // --- FIX HERE: Add abort 0 ---
    public fun burn<T>(_coin: Coin<T>, _cap: &BurnCapability<T>) {
        abort 0 
    }

    public fun transfer<T>(_from: &signer, _to: address, _amount: u64) {}

    public fun initialize<T>(
        _account: &signer,
        _name: vector<u8>,
        _symbol: vector<u8>,
        _decimals: u8,
        _monitor_supply: bool
    ): (BurnCapability<T>, FreezeCapability<T>, MintCapability<T>) {
        abort 0
    }
}
