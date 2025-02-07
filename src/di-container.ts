// src/di-container.ts

/**
 * A provider is a function that receives a DIContainer and returns an instance.
 */
export type Provider<T> = (container: DIContainer) => T;

/**
 * A Definition describes a dependency binding.
 */
export interface Definition<T> {
  token: any; // Token can be a symbol, string, or class constructor.
  provider: Provider<T>;
  singleton: boolean;
  priority: number; // Higher numbers mean higher priority.
}

/**
 * DIContainer is the core dependency injection container.
 * It holds dependency definitions and caches singleton instances.
 */
export class DIContainer {
  // Made protected so that child classes (scoped containers) can access them.
  protected definitions = new Map<any, Definition<any>[]>();
  protected singletons = new Map<any, any>();

  /**
   * Registers a dependency definition.
   * @param token - The key identifying the dependency.
   * @param provider - A factory function that returns an instance.
   * @param singleton - If true, the instance is cached (default: false).
   * @param priority - Priority for duplicate tokens (default: 0).
   */
  register<T>(token: any, provider: Provider<T>, singleton = false, priority = 0): void {
    const def: Definition<T> = { token, provider, singleton, priority };
    if (!this.definitions.has(token)) {
      this.definitions.set(token, []);
    }
    this.definitions.get(token)!.push(def);
    // Sort definitions so that highest priority comes first.
    this.definitions.get(token)!.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Resolves an instance for the given token.
   * If multiple definitions exist for the same token, the one with highest priority is used.
   * @param token - The dependency token.
   * @returns The resolved instance.
   * @throws if no provider is found.
   */
  get<T>(token: any): T {
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
      return (this as ScopedDIContainer).getFromParent(token);
    }
    throw new Error(`Dependency not found`);
  }

  /**
   * Removes all definitions and cached instances for the given token.
   * @param token - The dependency token.
   */
  remove(token: any): void {
    this.definitions.delete(token);
    this.singletons.delete(token);
  }

  /**
   * Clears the cache of singleton instances.
   */
  clearSingletons(): void {
    this.singletons.clear();
  }

  /**
   * Resets the container by clearing all definitions and caches.
   */
  reset(): void {
    this.definitions.clear();
    this.singletons.clear();
  }

  /**
   * Creates a new scoped container whose parent is this container.
   * This is useful for request-based injection.
   * @returns A new ScopedDIContainer.
   */
  createScope(): DIContainer {
    return new ScopedDIContainer(this);
  }
}

/**
 * ScopedDIContainer is a child container that inherits definitions from a parent container.
 */
export class ScopedDIContainer extends DIContainer {
  constructor(private parent: DIContainer) {
    super();
  }

  /**
   * Overrides get to first check the scoped container, then delegate to the parent.
   * @param token - The dependency token.
   */
  override get<T>(token: any): T {
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
  getFromParent<T>(token: any): T {
    return this.parent.get(token);
  }
}

// Create a single global DI container instance.
export const GlobalDIContainer = new DIContainer();
