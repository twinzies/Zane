/**
 * Errors thrown inside a tool executor cross the AI SDK boundary, which
 * normalizes them into `tool-error` stream parts. Rebuilding a plain Error
 * from the message on the way out drops the class, so `instanceof` checks in
 * the caller stop matching — that is how the ask-inputs pause used to surface
 * as "Sorry, something went wrong."
 *
 * Errors marked here are rethrown by the adapter as the original object, so
 * control-flow signals and user-facing messages survive the round trip. The
 * marker is a registered symbol: it stays attached across the boundary and
 * never shows up in JSON or logs.
 */
export const PRESERVE_ERROR_IDENTITY = Symbol.for("zane.preserveErrorIdentity");

/** Mark an error whose class must survive the AI SDK stream boundary. */
export function preserveErrorIdentity<T extends Error>(error: T): T {
    Object.defineProperty(error, PRESERVE_ERROR_IDENTITY, {
        value: true,
        enumerable: false,
        configurable: true,
    });
    return error;
}

export function isPreservedError(error: unknown): error is Error {
    return (
        error instanceof Error &&
        (error as unknown as Record<symbol, unknown>)[
            PRESERVE_ERROR_IDENTITY
        ] === true
    );
}

/**
 * Find a marked error in `error` or its `cause` chain. The AI SDK may wrap a
 * tool executor's throw, so the original can sit one or more levels down.
 * Returns null for anything unmarked, leaving provider and validation errors
 * to the adapter's normal message handling.
 */
export function findPreservedError(
    error: unknown,
    maxDepth = 8,
): Error | null {
    let current: unknown = error;
    for (let depth = 0; depth < maxDepth; depth += 1) {
        if (!(current instanceof Error)) return null;
        if (isPreservedError(current)) return current;
        current = (current as { cause?: unknown }).cause;
    }
    return null;
}
