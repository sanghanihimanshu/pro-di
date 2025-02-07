/**
 * A provider is a function that receives a DIContainer and returns an instance.
 */
export type Provider<T> = (container: DIContainer) => T;
/**
 * A Definition describes a dependency binding.
 */
export interface Definition<T> {
    token: any;
    provider: Provider<T>;
    singleton: boolean;
    priority: number;
}
/**
 * DIContainer is the core dependency injection container.
 * It holds dependency definitions and caches singleton instances.
 */
export declare class DIContainer {
    protected definitions: Map<any, Definition<any>[]>;
    protected singletons: Map<any, any>;
    /**
     * Registers a dependency definition.
     * @param token - The key identifying the dependency.
     * @param provider - A factory function that returns an instance.
     * @param singleton - If true, the instance is cached (default: false).
     * @param priority - Priority for duplicate tokens (default: 0).
     */
    register<T>(token: any, provider: Provider<T>, singleton?: boolean, priority?: number): void;
    /**
     * Resolves an instance for the given token.
     * If multiple definitions exist for the same token, the one with highest priority is used.
     * @param token - The dependency token.
     * @returns The resolved instance.
     * @throws if no provider is found.
     */
    get<T>(token: any): T;
    /**
     * Removes all definitions and cached instances for the given token.
     * @param token - The dependency token.
     */
    remove(token: any): void;
    /**
     * Clears the cache of singleton instances.
     */
    clearSingletons(): void;
    /**
     * Resets the container by clearing all definitions and caches.
     */
    reset(): void;
    /**
     * Creates a new scoped container whose parent is this container.
     * This is useful for request-based injection.
     * @returns A new ScopedDIContainer.
     */
    createScope(): DIContainer;
}
/**
 * ScopedDIContainer is a child container that inherits definitions from a parent container.
 */
export declare class ScopedDIContainer extends DIContainer {
    private parent;
    constructor(parent: DIContainer);
    /**
     * Overrides get to first check the scoped container, then delegate to the parent.
     * @param token - The dependency token.
     */
    get<T>(token: any): T;
    /**
     * Helper method to resolve a dependency from the parent container.
     * @param token - The dependency token.
     * @returns The resolved instance.
     */
    getFromParent<T>(token: any): T;
}
export declare const GlobalDIContainer: DIContainer;
