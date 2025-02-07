// src/module.ts

import { Binder } from "./binder";
import { GlobalDIContainer } from "./di-container";

/**
 * defineModule registers a set of dependency bindings with the global container.
 * @param builder - A function that receives a Binder for registering bindings.
 */
export function defineModule(builder: (bind: Binder) => void): void {
  const binder = new Binder(GlobalDIContainer);
  builder(binder);
}
