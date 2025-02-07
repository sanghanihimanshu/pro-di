// src/integrations.ts

import type { NextFunction, Request, Response } from "express";
import type { Context } from "hono";

import type { DIContainer } from "./di-container";

import { GlobalDIContainer } from "./di-container";

// Symbol for consistent property access
const CONTAINER_KEY = Symbol("di-container");

type RequestWithContainer = Request & {
  [CONTAINER_KEY]: DIContainer;
};

/**
 * Express middleware for request-scoped DI container
 */
export function expressRequestScopeMiddleware(req: Request, _: Response, next: NextFunction): void {
  (req as RequestWithContainer)[CONTAINER_KEY] = GlobalDIContainer.createScope();
  next();
}

/**
 * Hono middleware for request-scoped DI container
 */
export async function honoRequestScopeMiddleware(c: Context, next: () => Promise<void>): Promise<void> {
  c.set(CONTAINER_KEY.toString(), GlobalDIContainer.createScope());
  await next();
}

/**
 * Get dependency from Express request scope
 */
export function getFromRequest<T>(req: Request, token: symbol | string): T {
  return ((req as RequestWithContainer)[CONTAINER_KEY] || GlobalDIContainer).get<T>(token);
}

/**
 * Get dependency from Hono context
 */
export function getFromHono<T>(c: Context & { set: (key: symbol | string, value: any) => void; get: (key: symbol | string) => DIContainer }, token: symbol | string): T {
  return (c.get(CONTAINER_KEY) || GlobalDIContainer).get<T>(token);
}
