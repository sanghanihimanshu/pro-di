// src/integrations.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GlobalDIContainer } from "./di-container.js";
// Symbol for consistent property access
const CONTAINER_KEY = Symbol("di-container");
/**
 * Express middleware for request-scoped DI container
 */
export function expressRequestScopeMiddleware(req, _, next) {
    req[CONTAINER_KEY] = GlobalDIContainer.createScope();
    next();
}
/**
 * Hono middleware for request-scoped DI container
 */
export function honoRequestScopeMiddleware(c, next) {
    return __awaiter(this, void 0, void 0, function* () {
        c.set(CONTAINER_KEY.toString(), GlobalDIContainer.createScope());
        yield next();
    });
}
/**
 * Get dependency from Express request scope
 */
export function getFromRequest(req, token) {
    return (req[CONTAINER_KEY] || GlobalDIContainer).get(token);
}
/**
 * Get dependency from Hono context
 */
export function getFromHono(c, token) {
    return (c.get(CONTAINER_KEY) || GlobalDIContainer).get(token);
}
