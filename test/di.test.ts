// test/di.test.ts
import { beforeEach, describe, expect, it } from "vitest";

import { Factory, Inject, Service } from "@/decorators";
import { GlobalDIContainer } from "@/di-container";

/**
 * Test Suite: Basic DIContainer Functionality
 */
describe("dIContainer Basic Functionality", () => {
  beforeEach(async () => {
    await GlobalDIContainer.reset();
  });

  it("should register and resolve a singleton", () => {
    const token = Symbol("singletonTest");
    GlobalDIContainer.register(token, () => ({ value: Math.random() }), true);
    const instance1 = GlobalDIContainer.get(token);
    const instance2 = GlobalDIContainer.get(token);
    expect(instance1).toEqual(instance2);
  });

  it("should register and resolve a factory", () => {
    const token = Symbol("factoryTest");
    GlobalDIContainer.register(token, () => ({ value: Math.random() }), false);
    const instance1 = GlobalDIContainer.get(token);
    const instance2 = GlobalDIContainer.get(token);
    expect(instance1).not.toEqual(instance2);
  });

  it("should remove a definition", () => {
    const token = Symbol("removeTest");
    GlobalDIContainer.register(token, () => ({ value: 42 }), true);
    const instance = GlobalDIContainer.get<{ value: number }>(token);
    expect(instance.value).toBe(42);

    GlobalDIContainer.remove(token);

    expect(() => {
      if (!GlobalDIContainer.get(token))
        throw new Error("Dependency not found");
    }).toThrowError("Dependency not found");
  });

  it("should clear singletons and return a new instance", async () => {
    const token = Symbol("clearSingletonTest");
    let counter = 0;
    GlobalDIContainer.register(token, () => ({ value: ++counter }), true);
    const instance1 = GlobalDIContainer.get<{ value: number }>(token);
    console.log("instance1", instance1);
    await GlobalDIContainer.clearSingletons();
    const instance2 = GlobalDIContainer.get<{ value: number }>(token);
    console.log("instance1", instance2);
    expect(instance1).not.toEqual(instance2);
    expect(instance2.value).toBe(2);
  });

  describe("GlobalDIContainer.clearSingletons", () => {
    it("should clear singletons and return a new instance", async () => {
      const token = Symbol("clearSingletonTest");
      let counter = 0;
      GlobalDIContainer.register(token, () => ({ value: ++counter }), true);
  
      const instance1 = GlobalDIContainer.get<{ value: number }>(token);
      await GlobalDIContainer.clearSingletons();
      const instance2 = GlobalDIContainer.get<{ value: number }>(token);
  
      expect(instance1).not.toEqual(instance2);
      expect(instance2.value).toBe(2);
    });
  });
});

/**
 * Test Suite: ScopedDIContainer (Request-based DI)
 */
describe("scopedDIContainer", () => {
  beforeEach(async () => {
    await GlobalDIContainer.reset();
  });

  it("should resolve dependency from parent if not defined in scope", () => {
    const token = Symbol("scopeParentTest");
    GlobalDIContainer.register(token, () => ({ value: "global" }), true);
    const scope = GlobalDIContainer.createScope();
    const instance = scope.get<{ value: string }>(token);
    expect(instance.value).toBe("global");
  });

  it("should override dependency in scope without affecting global container", () => {
    const token = Symbol("scopeOverrideTest");
    GlobalDIContainer.register(token, () => ({ value: "global" }), true);
    const scope = GlobalDIContainer.createScope();
    scope.register(token, () => ({ value: "scoped" }), true, 5);
    const scopedInstance = scope.get<{ value: string }>(token);
    expect(scopedInstance.value).toBe("scoped");
    const globalInstance = GlobalDIContainer.get<{ value: string }>(token);
    expect(globalInstance.value).toBe("global");
  });
});

/**
 * Test Suite: Decorator-based Injection
 */
describe("decorators", () => {
  beforeEach(async () => {
    await GlobalDIContainer.reset();
  });

  it("should inject a dependency using @Inject", () => {
    const token = Symbol("injectTest");

    class Dependency {
      value = 100;
    }

    GlobalDIContainer.register(token, () => new Dependency(), true, 5);

    class Consumer {
      @Inject(token)
      public dep!: Dependency;
    }

    const consumer = new Consumer();
    expect(consumer.dep).toBeDefined();
    expect(consumer.dep.value).toBe(100);
  });

  // it("should register a service using @Service and resolve constructor dependency", () => {
  //   const token = Symbol("serviceTest");
  //   class Dependency {
  //     value = 200;
  //   }

  //   GlobalDIContainer.register(Dependency, () => new Dependency(), true);

  //   @Service({ token })
  //   class TestService {
  //     constructor(private dep: Dependency) {}
  //     getValue() {
  //       return this.dep.value;
  //     }
  //   }

  //   const instance = GlobalDIContainer.get<TestService>(token);
  //   expect(instance.getValue()).toBe(200);
  // });

  // it("should register a factory using @Factory to get a new instance on each get()", () => {
  //   const token = Symbol("factoryServiceTest");

  //   class Dependency {
  //     value = 300;
  //   }

  //   GlobalDIContainer.register(Dependency, () => new Dependency(), true);

  //   @Factory({ token, priority: 5 })
  //   class TestFactory {
  //     constructor(private dep: Dependency) {}
  //     getValue() {
  //       return this.dep.value;
  //     }
  //   }

  //   const instance1 = GlobalDIContainer.get<TestFactory>(token);
  //   const instance2 = GlobalDIContainer.get<TestFactory>(token);

  //   expect(instance1).not.toBe(instance2);
  //   expect(instance1.getValue()).toBe(300);
  // });
});
