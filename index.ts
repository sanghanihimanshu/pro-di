export { Binder } from "@/binder";
export { Factory, Inject, OptionalInject, Service } from "@/decorators";
// src/index.ts
import "./test/testprop"
export { GlobalDIContainer } from "@/di-container";
export { defineModule } from "@/module";
export {
  expressRequestScopeMiddleware,
  honoRequestScopeMiddleware,
  getFromRequest,
  getFromHono,
} from "@/integrations";
