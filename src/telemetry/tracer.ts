import type { Span, Tracer } from "@opentelemetry/api";

import { SpanKind, SpanStatusCode, trace } from "@opentelemetry/api";

export const TRACER_TOKEN = Symbol("PRO_DI_TRACER");

/**
 * DiTracer provides OpenTelemetry tracing capabilities for the DI container.
 */
export class DiTracer {
  private tracer: Tracer;

  constructor() {
    this.tracer = trace.getTracer("pro-di");
  }

  /**
   * Creates a span for a DI operation.
   */
  startSpan(name: string, options?: { kind?: SpanKind; attributes?: Record<string, any> }): Span {
    return this.tracer.startSpan(name, {
      kind: options?.kind || SpanKind.INTERNAL,
      attributes: options?.attributes,
    });
  }

  /**
   * Wraps a function with a span.
   */
  traceMethod<T>(name: string, fn: () => T, attributes?: Record<string, any>): T {
    const span = this.startSpan(name, { attributes });
    try {
      const result = fn();
      span.setStatus({ code: SpanStatusCode.OK });
      if (result instanceof Promise) {
        return result
          .then((value) => {
            span.end();
            return value;
          })
          .catch((error) => {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error.message,
            });
            span.recordException(error);
            span.end();
            throw error;
          }) as unknown as T;
      }
      span.end();
      return result;
    }
    catch (error: any) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.recordException(error);
      span.end();
      throw error;
    }
  }
}
