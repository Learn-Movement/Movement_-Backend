module aptos_framework::transfer {
    use std::signer;

    public fun transfer(
        _from: &signer,
        _to: address,
        _amount: u64
    ) {}
}