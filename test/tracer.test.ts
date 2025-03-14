import test, { describe } from "node:test";
import { DiTracer } from "@/telemetry/tracer";
import { expect } from "vitest";

describe("DiTracer", () => {
  const tracer = new DiTracer();
  test("should execute traceMethod with synchronous function", () => {
    const result = tracer.traceMethod("test.sync", () => 42, { test: "sync" });
    expect(result).toBe(42);
  });

  test("should execute traceMethod with asynchronous function", async () => {
    const result = await tracer.traceMethod("test.async", async () => {
      return "async result";
    }, { test: "async" });
    expect(result).toBe("async result");
  });

  test("should set error status when function throws", () => {
    expect(() =>
      tracer.traceMethod("test.error", () => {
        throw new Error("fail");
      })
    ).toThrow("fail");
  });

  test("should handle promise rejection properly", async () => {
    await expect(tracer.traceMethod("test.promiseError", async () => {
      throw new Error("async fail");
    })).rejects.toThrow("async fail");
  });
});
