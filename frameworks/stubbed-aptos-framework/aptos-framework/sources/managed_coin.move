module aptos_framework::managed_coin {
    use aptos_framework::coin;

    public fun initialize<T>(
        _name: vector<u8>,
        _symbol: vector<u8>,
        _decimals: u8,
        _monitor_supply: bool
    ) {}
} 