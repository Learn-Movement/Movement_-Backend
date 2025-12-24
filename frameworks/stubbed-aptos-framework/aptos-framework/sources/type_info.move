module aptos_framework::type_info {
    struct TypeInfo has copy, drop, store {}

    public fun type_of<T>(): TypeInfo {
        TypeInfo {}
    }
} 