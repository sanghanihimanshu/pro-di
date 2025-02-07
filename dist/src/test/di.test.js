var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
// test/di.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import { Factory, Inject, Service } from "../decorators.js";
import { GlobalDIContainer } from "../di-container.js";
/**
 * Test Suite: Basic DIContainer Functionality
 */
describe('DIContainer Basic Functionality', () => {
    beforeEach(() => {
        GlobalDIContainer.reset();
    });
    it('should register and resolve a singleton', () => {
        const token = Symbol('singletonTest');
        GlobalDIContainer.register(token, () => ({ value: Math.random() }), true);
        const instance1 = GlobalDIContainer.get(token);
        const instance2 = GlobalDIContainer.get(token);
        expect(instance1).toEqual(instance2);
    });
    it('should register and resolve a factory', () => {
        const token = Symbol('factoryTest');
        GlobalDIContainer.register(token, () => ({ value: Math.random() }), false);
        const instance1 = GlobalDIContainer.get(token);
        const instance2 = GlobalDIContainer.get(token);
        expect(instance1).not.toEqual(instance2);
    });
    it('should remove a definition', () => {
        const token = Symbol('removeTest');
        GlobalDIContainer.register(token, () => ({ value: 42 }), true);
        const instance = GlobalDIContainer.get(token);
        expect(instance.value).toBe(42);
        GlobalDIContainer.remove(token);
        expect(() => {
            if (!GlobalDIContainer.get(token))
                throw new Error('Dependency not found');
        }).toThrowError('Dependency not found');
    });
    it('should clear singletons and return a new instance', () => {
        const token = Symbol('clearSingletonTest');
        let counter = 0;
        GlobalDIContainer.register(token, () => ({ value: ++counter }), true);
        const instance1 = GlobalDIContainer.get(token);
        GlobalDIContainer.clearSingletons();
        const instance2 = GlobalDIContainer.get(token);
        expect(instance1).not.toEqual(instance2);
        expect(instance2.value).toBe(2);
    });
});
/**
 * Test Suite: ScopedDIContainer (Request-based DI)
 */
describe('ScopedDIContainer', () => {
    beforeEach(() => {
        GlobalDIContainer.reset();
    });
    it('should resolve dependency from parent if not defined in scope', () => {
        const token = Symbol('scopeParentTest');
        GlobalDIContainer.register(token, () => ({ value: 'global' }), true);
        const scope = GlobalDIContainer.createScope();
        const instance = scope.get(token);
        expect(instance.value).toBe('global');
    });
    it('should override dependency in scope without affecting global container', () => {
        const token = Symbol('scopeOverrideTest');
        GlobalDIContainer.register(token, () => ({ value: 'global' }), true);
        const scope = GlobalDIContainer.createScope();
        scope.register(token, () => ({ value: 'scoped' }), true, 5);
        const scopedInstance = scope.get(token);
        expect(scopedInstance.value).toBe('scoped');
        const globalInstance = GlobalDIContainer.get(token);
        expect(globalInstance.value).toBe('global');
    });
});
/**
 * Test Suite: Decorator-based Injection
 */
describe("decorators", () => {
    beforeEach(() => {
        GlobalDIContainer.reset();
    });
    it('should inject a dependency using @Inject', () => {
        const token = Symbol('injectTest');
        class Dependency {
            constructor() {
                this.value = 100;
            }
        }
        GlobalDIContainer.register(token, () => new Dependency(), true, 5);
        class Consumer {
        }
        __decorate([
            Inject(token),
            __metadata("design:type", Dependency)
        ], Consumer.prototype, "dep", void 0);
        const consumer = new Consumer();
        expect(consumer.dep).toBeDefined();
        expect(consumer.dep.value).toBe(100);
    });
    it("should register a service using @Service and resolve constructor dependency", () => {
        const token = Symbol("serviceTest");
        class Dependency {
            constructor() {
                this.value = 200;
            }
        }
        GlobalDIContainer.register(Dependency, () => new Dependency(), true);
        let TestService = class TestService {
            constructor(dep) {
                this.dep = dep;
            }
            getValue() {
                return this.dep.value;
            }
        };
        TestService = __decorate([
            Service({ token: token }),
            __metadata("design:paramtypes", [Dependency])
        ], TestService);
        const instance = GlobalDIContainer.get(token);
        expect(instance.getValue()).toBe(200);
    });
    it("should register a factory using @Factory to get a new instance on each get()", () => {
        const token = Symbol("factoryServiceTest");
        class Dependency {
            constructor() {
                this.value = 300;
            }
        }
        GlobalDIContainer.register(Dependency, () => new Dependency(), true);
        let TestFactory = class TestFactory {
            constructor(dep) {
                this.dep = dep;
            }
            getValue() {
                return this.dep.value;
            }
        };
        TestFactory = __decorate([
            Factory({ token, priority: 5 }),
            __metadata("design:paramtypes", [Dependency])
        ], TestFactory);
        const instance1 = GlobalDIContainer.get(token);
        const instance2 = GlobalDIContainer.get(token);
        expect(instance1).not.toBe(instance2);
        expect(instance1.getValue()).toBe(300);
    });
});
