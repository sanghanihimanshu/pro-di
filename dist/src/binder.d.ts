import type { DIContainer, Provider } from "./di-container.js";
/**
 * Binder provides a fluent API to register dependency bindings.
 */
export declare class Binder {
    private container;
    constructor(container: DIContainer);
    /**
     * Registers a singleton binding.
     * @param token - The token for the dependency.
     * @param provider - A function that returns an instance.
     * @param priority - The priority for duplicate tokens (default: 0).
     */
    bindSingleton<T>(token: any, provider: Provider<T>, priority?: number): void;
    /**
     * Registers a factory binding.
     * @param token - The token for the dependency.
     * @param provider - A function that returns an instance.
     * @param priority - The priority for duplicate tokens (default: 0).
     */
    bindFactory<T>(token: any, provider: Provider<T>, priority?: number): void;
}
