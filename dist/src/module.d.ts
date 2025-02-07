import { Binder } from "./binder.js";
/**
 * defineModule registers a set of dependency bindings with the global container.
 * @param builder - A function that receives a Binder for registering bindings.
 */
export declare function defineModule(builder: (bind: Binder) => void): void;
