import "reflect-metadata";

import { GlobalDIContainer } from "./di-container";
import { LifecycleHook } from "./lifecycle";

// Property Injection Decorators

/**
 * @Inject decorator injects a dependency from the global container.
 * @param token - The dependency token.
 */
export function Inject(token: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
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
export function OptionalInject(token: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    Object.defineProperty(target, propertyKey, {
      get() {
        try {
          return GlobalDIContainer.get(token);
        }
        catch (e: any) {
          console.warn(e.message);
          return undefined;
        }
      },
      enumerable: true,
      configurable: true,
    });
  };
}

// Class Decorators for Automatic Registration

export interface ServiceOptions {
  token: any; // The token to register the class under.
  singleton?: boolean; // Defaults to true.
  priority?: number; // Registration priority (default: 0).
  tags?: string[]; // Optional tags for service categorization
}

/**
 * @Service decorator registers the decorated class as a singleton (by default) with the global container.
 * Constructor dependencies are automatically resolved via reflect-metadata.
 * @param options - Options including token, singleton flag, and priority.
 */
export function Service(options: ServiceOptions): ClassDecorator {
  return function (Target: any) {
    const singleton = options.singleton !== undefined ? options.singleton : true;
    const priority = options.priority !== undefined ? options.priority : 0;
    const paramTypes = Reflect.getMetadata("design:paramtypes", Target) || [];
    GlobalDIContainer.register(
      options.token,
      (container) => {
        const params = paramTypes.map((p: any) => container.get(p));
        return new Target(...params);
      },
      singleton,
      priority,
      options.tags,
    );
  };
}

/**
 * @Factory decorator registers the decorated class as a factory (non-singleton) with the global container.
 * Constructor dependencies are automatically resolved.
 * @param options - Options including token and priority.
 */
export function Factory(options: ServiceOptions): ClassDecorator {
  return function (Target: any) {
    const priority = options.priority !== undefined ? options.priority : 0;
    const paramTypes: any[] = Reflect.getMetadata("design:paramtypes", Target) || [];
    GlobalDIContainer.register(
      options.token,
      (container) => {
        const params = paramTypes.map((p: any) => container.get(p));
        return new Target(...params);
      },
      false,
      priority,
      options.tags,
    );
  };
}

/**
 * Lifecycle hook decorators
 */
export function Init(): MethodDecorator {
  return (target, propertyKey) => {
    if (propertyKey !== LifecycleHook.INIT) {
      const original = target.constructor.prototype[LifecycleHook.INIT];
      target.constructor.prototype[LifecycleHook.INIT] = async function (this: any) {
        if (original)
          await original.call(this);
        await this[propertyKey]();
      };
    }
  };
}

export function Destroy(): MethodDecorator {
  return (target, propertyKey) => {
    if (propertyKey !== LifecycleHook.DESTROY) {
      const original = target.constructor.prototype[LifecycleHook.DESTROY];
      target.constructor.prototype[LifecycleHook.DESTROY] = async function (this: any) {
        if (original)
          await original.call(this);
        await this[propertyKey]();
      };
    }
  };
}
