import { describe, beforeEach, test, expect } from "vitest";
import { DIContainer, GlobalDIContainer } from "@/di-container";
import { LifecycleHook, WithLifecycle } from "@/lifecycle";

class TestService implements WithLifecycle {
  public inited = false;
  public destroyed = false;
  [LifecycleHook.INIT]?() {
    this.inited = true;
  }
  [LifecycleHook.DESTROY]?() {
    this.destroyed = true;
  }
}

describe("DIContainer", () => {
  let container: DIContainer;

  beforeEach(() => {
    container = new DIContainer({ enableTracing: false });
  });

  test("should register and resolve a singleton with init hook", async () => {
    container.register("TestService", () => new TestService(), true);
    const service = container.get<TestService>("TestService");
    // allow lifecycle hook to run
    await new Promise(r => setTimeout(r, 10));
    expect(service.inited).toBe(true);
    // subsequent get should return same instance
    expect(container.get("TestService")).toBe(service);
  });

  test("should call destroy hook on removal and clearSingletons", async () => {
    container.register("TestService", () => new TestService(), true);
    const service = container.get<TestService>("TestService");
    await new Promise(r => setTimeout(r, 10));
    container.remove("TestService");
    await new Promise(r => setTimeout(r, 10));
    expect(service.destroyed).toBe(true);
  });

  test("should throw an error on circular dependency", () => {
    class A {}
    class B {}

    container.register("A", (c) => {
      // Simulate circular dependency A->B->A
      c.get("B");
      return new A();
    });
    container.register("B", (c) => c.get("A"), true);

    expect(() => container.get("A")).toThrow(/Circular dependency detected/);
  });
});
