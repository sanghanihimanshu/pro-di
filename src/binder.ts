// src/binder.ts

import type { DIContainer, Provider } from "@/di-container";

/**
 * Binder provides a fluent API to register dependency bindings.
 */
export class Binder {
  constructor(private container: DIContainer) {}

  /**
   * Registers a singleton binding.
   * @param token - The token for the dependency.
   * @param provider - A function that returns an instance.
   * @param priority - The priority for duplicate tokens (default: 0).
   */
  bindSingleton<T>(token: any, provider: Provider<T>, priority = 0): void {
    this.container.register(token, provider, true, priority);
  }

  /**
   * Registers a factory binding.
   * @param token - The token for the dependency.
   * @param provider - A function that returns an instance.
   * @param priority - The priority for duplicate tokens (default: 0).
   */
  bindFactory<T>(token: any, provider: Provider<T>, priority = 0): void {
    this.container.register(token, provider, false, priority);
  }
}
