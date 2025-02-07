// src/binder.ts
/**
 * Binder provides a fluent API to register dependency bindings.
 */
export class Binder {
    constructor(container) {
        this.container = container;
    }
    /**
     * Registers a singleton binding.
     * @param token - The token for the dependency.
     * @param provider - A function that returns an instance.
     * @param priority - The priority for duplicate tokens (default: 0).
     */
    bindSingleton(token, provider, priority = 0) {
        this.container.register(token, provider, true, priority);
    }
    /**
     * Registers a factory binding.
     * @param token - The token for the dependency.
     * @param provider - A function that returns an instance.
     * @param priority - The priority for duplicate tokens (default: 0).
     */
    bindFactory(token, provider, priority = 0) {
        this.container.register(token, provider, false, priority);
    }
}
