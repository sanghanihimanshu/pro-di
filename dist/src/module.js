// src/module.ts
import { Binder } from "./binder.js";
import { GlobalDIContainer } from "./di-container.js";
/**
 * defineModule registers a set of dependency bindings with the global container.
 * @param builder - A function that receives a Binder for registering bindings.
 */
export function defineModule(builder) {
    const binder = new Binder(GlobalDIContainer);
    builder(binder);
}
