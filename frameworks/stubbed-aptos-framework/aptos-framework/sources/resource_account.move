 module aptos_framework::resource_account {
    use std::signer;

    public fun create_resource_account(
        _source: &signer,
        _seed: vector<u8>
    ): signer {
        abort 0
    }
}
