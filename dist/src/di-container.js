// src/di-container.ts
/**
 * DIContainer is the core dependency injection container.
 * It holds dependency definitions and caches singleton instances.
 */
export class DIContainer {
    constructor() {
        // Made protected so that child classes (scoped containers) can access them.
        this.definitions = new Map();
        this.singletons = new Map();
    }
    /**
     * Registers a dependency definition.
     * @param token - The key identifying the dependency.
     * @param provider - A factory function that returns an instance.
     * @param singleton - If true, the instance is cached (default: false).
     * @param priority - Priority for duplicate tokens (default: 0).
     */
    register(token, provider, singleton = false, priority = 0) {
        const def = { token, provider, singleton, priority };
        if (!this.definitions.has(token)) {
            this.definitions.set(token, []);
        }
        this.definitions.get(token).push(def);
        // Sort definitions so that highest priority comes first.
        this.definitions.get(token).sort((a, b) => b.priority - a.priority);
    }
    /**
     * Resolves an instance for the given token.
     * If multiple definitions exist for the same token, the one with highest priority is used.
     * @param token - The dependency token.
     * @returns The resolved instance.
     * @throws if no provider is found.
     */
    get(token) {
        // Try to get a definition from the current container.
        const defs = this.definitions.get(token);
        if (defs && defs.length > 0) {
            const selectedDef = defs[0];
            if (selectedDef.singleton) {
                if (!this.singletons.has(token)) {
                    const instance = selectedDef.provider(this);
                    this.singletons.set(token, instance);
                }
                return this.singletons.get(token);
            }
            return selectedDef.provider(this);
        }
        // If not found in the current container and if this container is a scoped container,
        // delegate to parent.
        if (this instanceof ScopedDIContainer) {
            return this.getFromParent(token);
        }
        throw new Error(`Dependency not found`);
    }
    /**
     * Removes all definitions and cached instances for the given token.
     * @param token - The dependency token.
     */
    remove(token) {
        this.definitions.delete(token);
        this.singletons.delete(token);
    }
    /**
     * Clears the cache of singleton instances.
     */
    clearSingletons() {
        this.singletons.clear();
    }
    /**
     * Resets the container by clearing all definitions and caches.
     */
    reset() {
        this.definitions.clear();
        this.singletons.clear();
    }
    /**
     * Creates a new scoped container whose parent is this container.
     * This is useful for request-based injection.
     * @returns A new ScopedDIContainer.
     */
    createScope() {
        return new ScopedDIContainer(this);
    }
}
/**
 * ScopedDIContainer is a child container that inherits definitions from a parent container.
 */
export class ScopedDIContainer extends DIContainer {
    constructor(parent) {
        super();
        this.parent = parent;
    }
    /**
     * Overrides get to first check the scoped container, then delegate to the parent.
     * @param token - The dependency token.
     */
    get(token) {
        const defs = this.definitions.get(token);
        if (defs && defs.length > 0) {
            const selectedDef = defs[0];
            if (selectedDef.singleton) {
                if (!this.singletons.has(token)) {
                    const instance = selectedDef.provider(this);
                    this.singletons.set(token, instance);
                }
                return this.singletons.get(token);
            }
            return selectedDef.provider(this);
        }
        // Delegate to parent container if not found locally.
        return this.getFromParent(token);
    }
    /**
     * Helper method to resolve a dependency from the parent container.
     * @param token - The dependency token.
     * @returns The resolved instance.
     */
    getFromParent(token) {
        return this.parent.get(token);
    }
}
// Create a single global DI container instance.
export const GlobalDIContainer = new DIContainer();
