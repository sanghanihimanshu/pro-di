import "reflect-metadata";
/**
 * @Inject decorator injects a dependency from the global container.
 * @param token - The dependency token.
 */
export declare function Inject(token: any): PropertyDecorator;
/**
 * @OptionalInject decorator attempts to inject a dependency.
 * If not found, it returns undefined.
 * @param token - The dependency token.
 */
export declare function OptionalInject(token: any): PropertyDecorator;
export interface ServiceOptions {
    token: any;
    singleton?: boolean;
    priority?: number;
}
/**
 * @Service decorator registers the decorated class as a singleton (by default) with the global container.
 * Constructor dependencies are automatically resolved via reflect-metadata.
 * @param options - Options including token, singleton flag, and priority.
 */
export declare function Service(options: ServiceOptions): ClassDecorator;
/**
 * @Factory decorator registers the decorated class as a factory (non-singleton) with the global container.
 * Constructor dependencies are automatically resolved.
 * @param options - Options including token and priority.
 */
export declare function Factory(options: ServiceOptions): ClassDecorator;
