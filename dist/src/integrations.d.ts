import type { NextFunction, Request, Response } from "express";
import type { Context } from "hono";
import type { DIContainer } from "./di-container.js";
/**
 * Express middleware for request-scoped DI container
 */
export declare function expressRequestScopeMiddleware(req: Request, _: Response, next: NextFunction): void;
/**
 * Hono middleware for request-scoped DI container
 */
export declare function honoRequestScopeMiddleware(c: Context, next: () => Promise<void>): Promise<void>;
/**
 * Get dependency from Express request scope
 */
export declare function getFromRequest<T>(req: Request, token: symbol | string): T;
/**
 * Get dependency from Hono context
 */
export declare function getFromHono<T>(c: Context & {
    set: (key: symbol | string, value: any) => void;
    get: (key: symbol | string) => DIContainer;
}, token: symbol | string): T;
