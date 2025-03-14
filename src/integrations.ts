import type { MiddlewareHandler } from "hono/types";

import { type Context, Hono } from "hono";

import type { DIContainer } from "./di-container";
import type { DiTracer } from "./telemetry/tracer";

import { GlobalDIContainer } from "./di-container";
import { TRACER_TOKEN } from "./telemetry/tracer";

// Extend Hono context type
declare module "hono" {
  interface ContextVariables {
    container?: DIContainer;
  }
}

// Symbol for consistent property access
export const CONTAINER_KEY = Symbol("di-container");

export interface HonoOptions {
  container?: DIContainer;
  traceRequests?: boolean;
}

/**
 * Creates a Hono app with DI container integration
 */
export function createHonoApp(options: HonoOptions = {}): Hono {
  const app = new Hono();
  const container = options.container || GlobalDIContainer;

  // Register the container middleware
  app.use("*", async (c, next) => {
    c.set(CONTAINER_KEY as never, container.createScope());
    await next();
  });

  // Add tracing if enabled
  if (options.traceRequests) {
    app.use("*", async (c, next) => {
      const container: DIContainer = c.get(CONTAINER_KEY as never) as DIContainer;
      const tracer = container.get<DiTracer>(TRACER_TOKEN);

      return tracer.traceMethod("hono.request", async () => {
        await next();
      }, {
        method: c.req.method,
        path: c.req.path,
        headers: Object.fromEntries(c.req.raw.headers),
      });
    });
  }

  return app;
}

/**
 * Enhanced Hono middleware for request-scoped DI container
 */
export function honoRequestScopeMiddleware(): MiddlewareHandler {
  return async (c: Context, next: () => Promise<void>) => {
    c.set(CONTAINER_KEY as any, GlobalDIContainer.createScope());
    await next();
  };
}

/**
 * Get the request-scoped container from Hono context
 */
export function getContainerFromHono(c: Context): DIContainer {
  const container = c.get(CONTAINER_KEY as any);
  if (!container) {
    throw new Error("DI Container not found in Hono context. Make sure honoRequestScopeMiddleware is registered.");
  }
  return container;
}

/**
 * Get dependency from Hono context
 */
export function getFromHono<T>(c: Context, token: any): T {
  const container = getContainerFromHono(c);
  return container.get<T>(token);
}

/**
 * Register a request-scoped dependency in Hono context
 */
export function registerInHono<T>(
  c: Context,
  token: any,
  provider: (container: DIContainer) => T,
  singleton = false,
  priority = 0,
  tags?: string[],
): void {
  const container = getContainerFromHono(c);
  container.register(token, provider, singleton, priority, tags);
}

/**
 * Provides type-safe dependency injection for Hono routes
 * @param tokens - Tokens to inject
 * @returns A function that injects dependencies into the handler
 */
export function injectDependencies<Tokens extends any[], R>(
  ...tokens: Tokens
) {
  return (handler: (c: Context, ...services: { [K in keyof Tokens]: any }) => R) => {
    return (c: Context): R => {
      const container = getContainerFromHono(c);
      const services = tokens.map(token => container.get(token)) as Tokens;
      return handler(c, ...services);
    };
  };
}
