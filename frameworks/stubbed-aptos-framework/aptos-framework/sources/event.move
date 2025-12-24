module aptos_framework::event {
    struct EventHandle<T> has store {}

    // --- FIX HERE: Add abort 0 ---
    public fun emit_event<T>(_handle: &mut EventHandle<T>, _event: T) {
        abort 0
    }
}
