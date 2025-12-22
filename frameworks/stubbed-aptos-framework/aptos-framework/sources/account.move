module aptos_framework::account {
    use std::signer;

    public fun create_account(_addr: address) { abort 0 }
    public fun exists_at(_addr: address): bool { false }

    public fun signer_address(s: &signer): address {
        signer::address_of(s)
    }
}
