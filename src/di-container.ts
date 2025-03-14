import type { ConfigOptions } from "@/config";

import { CONFIG_TOKEN, ConfigManager } from "@/config";
import { DiTracer, TRACER_TOKEN } from "@/telemetry/tracer";

import { LifecycleHook, runLifecycleHook } from "./lifecycle";

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
  tags?: string[]; // Tags for categorizing services
}

/**
 * DIContainer is the core dependency injection container.
 * It holds dependency definitions and caches singleton instances.
 */
export class DIContainer {
  // Made protected so that child classes (scoped containers) can access them.
  protected definitions = new Map<any, Definition<any>[]>();
  protected singletons = new Map<any, any>();
  protected parent?: DIContainer;
  protected tracer: DiTracer;
  private initializingTokens = new Set<any>(); // For circular dependency detection

  constructor(options?: { parent?: DIContainer; enableTracing?: boolean }) {
    this.parent = options?.parent;
    this.tracer = new DiTracer();

    // Register the tracer itself as a service
    if (options?.enableTracing !== false) {
      this.register(TRACER_TOKEN, () => this.tracer, true);
    }
  }

  /**
   * Registers a dependency definition.
   * @param token - The key identifying the dependency.
   * @param provider - A factory function that returns an instance.
   * @param singleton - If true, the instance is cached (default: false).
   * @param priority - Priority for duplicate tokens (default: 0).
   * @param tags - Optional tags for service categorization
   */
  register<T>(
    token: any,
    provider: Provider<T>,
    singleton = false,
    priority = 0,
    tags?: string[],
  ): void {
    return this.tracer.traceMethod("di.register", () => {
      const def: Definition<T> = { token, provider, singleton, priority, tags };
      if (!this.definitions.has(token)) {
        this.definitions.set(token, []);
      }
      this.definitions.get(token)!.push(def);
      // Sort definitions so that highest priority comes first.
      this.definitions.get(token)!.sort((a, b) => b.priority - a.priority);
    }, { token: String(token), singleton, priority });
  }

  /**
   * Resolves an instance for the given token.
   * If multiple definitions exist for the same token, the one with highest priority is used.
   * @param token - The dependency token.
   * @returns The resolved instance.
   * @throws if no provider is found or circular dependency is detected.
   */
  get<T>(token: any): T {
    return this.tracer.traceMethod("di.get", () => {
      // Check for circular dependencies
      if (this.initializingTokens.has(token)) {
        const tokensInCycle = Array.from(this.initializingTokens).map(String).join(" -> ");
        throw new Error(`Circular dependency detected: ${tokensInCycle} -> ${String(token)}`);
      }

      try {
        this.initializingTokens.add(token);
        const defs = this.definitions.get(token);

        if (defs && defs.length > 0) {
          const selectedDef = defs[0];
          if (selectedDef.singleton) {
            if (!this.singletons.has(token)) {
              const instance = selectedDef.provider(this);
              this.singletons.set(token, instance);
              // Run initialization hook if available
              if (instance && typeof instance === "object") {
                runLifecycleHook(instance, LifecycleHook.INIT);
              }
            }
            return this.singletons.get(token);
          }
          const instance = selectedDef.provider(this);

          // Run initialization hook for non-singleton instances
          if (instance && typeof instance === "object") {
            runLifecycleHook(instance, LifecycleHook.INIT);
          }

          return instance;
        }

        // If not found in the current container and if this has a parent,
        // delegate to parent.
        if (this.parent) {
          return this.getFromParent(token);
        }
        throw new Error(`Dependency not found for token "${String(token)}"`);
      }
      finally {
        this.initializingTokens.delete(token);
      }
    }, { token: String(token) });
  }

  /**
   * Registers a configuration manager
   * @param config - Configuration options
   */
  registerConfig(config: ConfigOptions): void {
    this.register(CONFIG_TOKEN, () => new ConfigManager(config), true);
  }

  /**
   * Get configuration manager
   */
  getConfig(): ConfigManager {
    return this.get<ConfigManager>(CONFIG_TOKEN);
  }

  /**
   * Helper method to resolve a dependency from the parent container.
   * @param token - The dependency token.
   * @returns The resolved instance.
   */
  getFromParent<T>(token: any): T {
    if (!this.parent) {
      throw new Error(`No parent container available to resolve token "${String(token)}"`);
    }
    return this.parent.get(token);
  }

  /**
   * Find registered services by tag
   * @param tag - The tag to search for
   * @returns Array of resolved instances
   */
  getByTag<T = any>(tag: string): T[] {
    return this.tracer.traceMethod("di.getByTag", () => {
      const results: T[] = [];

      for (const [token, defs] of this.definitions.entries()) {
        for (const def of defs) {
          if (def.tags?.includes(tag)) {
            try {
              results.push(this.get<T>(token));
              break; // Only get the highest priority definition for each token
            }
            catch (e: any) {
              // Ignore errors when resolving instances
              console.warn(e.message);
            }
          }
        }
      }

      return results;
    }, { tag });
  }

  /**
   * Removes all definitions and cached instances for the given token.
   * @param token - The dependency token.
   */
  remove(token: any): void {
    return this.tracer.traceMethod("di.remove", () => {
      // Run destroy lifecycle hook if instance exists and is a singleton
      if (this.singletons.has(token)) {
        const instance = this.singletons.get(token);
        if (instance && typeof instance === "object") {
          runLifecycleHook(instance, LifecycleHook.DESTROY);
        }
      }

      this.definitions.delete(token);
      this.singletons.delete(token);
    }, { token: String(token) });
  }

  /**
   * Clears the cache of singleton instances.
   */
  async clearSingletons(): Promise<void> {
    return this.tracer.traceMethod("di.clearSingletons", async () => {
      // Run destroy hooks for all singletons
      for (const [_token, instance] of this.singletons.entries()) {
        if (instance && typeof instance === "object") {
          await runLifecycleHook(instance, LifecycleHook.DESTROY);
        }
      }
      this.singletons.clear();
    });
  }

  /**
   * Resets the container by clearing all definitions and caches.
   */
  async reset(): Promise<void> {
    return this.tracer.traceMethod("di.reset", async () => {
      await this.clearSingletons();
      this.definitions.clear();
    });
  }

  /**
   * Creates a new scoped container whose parent is this container.
   * This is useful for request-based injection.
   * @param options - Options for the scoped container
   * @returns A new ScopedDIContainer.
   */
  createScope(options?: { enableTracing?: boolean }): DIContainer {
    return this.tracer.traceMethod("di.createScope", () => {
      return new DIContainer({
        parent: this,
        enableTracing: options?.enableTracing,
      });
    });
  }
}

// Create a single global DI container instance.
export const GlobalDIContainer = new DIContainer();
