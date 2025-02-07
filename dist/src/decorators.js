// src/decorators.ts
import "reflect-metadata";
import { GlobalDIContainer } from "./di-container.js";
//
// Property Injection Decorators
//
/**
 * @Inject decorator injects a dependency from the global container.
 * @param token - The dependency token.
 */
export function Inject(token) {
    return (target, propertyKey) => {
        Object.defineProperty(target, propertyKey, {
            get() {
                const instance = GlobalDIContainer.get(token);
                if (!instance) {
                    throw new Error(`Dependency for token "${String(token)}" is not registered.`);
                }
                return instance;
            },
            enumerable: true,
            configurable: true,
        });
    };
}
/**
 * @OptionalInject decorator attempts to inject a dependency.
 * If not found, it returns undefined.
 * @param token - The dependency token.
 */
export function OptionalInject(token) {
    return (target, propertyKey) => {
        Object.defineProperty(target, propertyKey, {
            get() {
                try {
                    return GlobalDIContainer.get(token);
                }
                catch (e) {
                    console.warn(e.message);
                    return undefined;
                }
            },
            enumerable: true,
            configurable: true,
        });
    };
}
/**
 * @Service decorator registers the decorated class as a singleton (by default) with the global container.
 * Constructor dependencies are automatically resolved via reflect-metadata.
 * @param options - Options including token, singleton flag, and priority.
 */
export function Service(options) {
    return function (Target) {
        const singleton = options.singleton !== undefined ? options.singleton : true;
        const priority = options.priority !== undefined ? options.priority : 0;
        const paramTypes = Reflect.getMetadata("design:paramtypes", Target) || [];
        GlobalDIContainer.register(options.token, (container) => {
            const params = paramTypes.map((p) => container.get(p));
            return new Target(...params);
        }, singleton, priority);
    };
}
/**
 * @Factory decorator registers the decorated class as a factory (non-singleton) with the global container.
 * Constructor dependencies are automatically resolved.
 * @param options - Options including token and priority.
 */
export function Factory(options) {
    return function (Target) {
        const priority = options.priority !== undefined ? options.priority : 0;
        const paramTypes = Reflect.getMetadata("design:paramtypes", Target) || [];
        GlobalDIContainer.register(options.token, (container) => {
            const params = paramTypes.map((p) => container.get(p));
            return new Target(...params);
        }, false, priority);
    };
}
