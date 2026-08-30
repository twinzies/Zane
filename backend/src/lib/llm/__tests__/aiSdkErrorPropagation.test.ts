import { describe, it, expect } from "vitest";
import { streamPartError } from "../aiSdk";
import {
    preserveErrorIdentity,
    findPreservedError,
    isPreservedError,
    PRESERVE_ERROR_IDENTITY,
} from "../../preservedError";
import { UserFacingError } from "../../userFacingError";

/**
 * Regression cover for a deliberate ask-inputs pause surfacing to users as
 * "Sorry, something went wrong."
 *
 * A tool executor's throw travels back through the AI SDK as a `tool-error`
 * stream part. The adapter used to rebuild it as a plain Error, so the
 * caller's `instanceof AssistantStreamAskInputsPause` check no longer matched
 * and the pause was handled as a stream failure. `streamPartError` must return
 * the original object for marked errors, and behave as before for the rest.
 */
class TestPause extends Error {
    constructor() {
        super("Waiting for user input.");
        this.name = "TestPause";
        preserveErrorIdentity(this);
    }
}

describe("streamPartError", () => {
    it("returns the original object for a marked error", () => {
        const pause = new TestPause();
        const result = streamPartError(pause, "Moonshot");

        // Identity, not just the message, is what callers branch on.
        expect(result).toBe(pause);
        expect(result).toBeInstanceOf(TestPause);
    });

    it("unwraps a marked error the SDK wrapped in a cause chain", () => {
        const pause = new TestPause();
        const wrapped = new Error("Tool execution failed", { cause: pause });

        expect(streamPartError(wrapped, "Moonshot")).toBe(pause);
    });

    it("preserves UserFacingError so its message is not downgraded", () => {
        const original = new UserFacingError("Connect Google Drive first.");
        const result = streamPartError(original, "Moonshot");

        expect(result).toBeInstanceOf(UserFacingError);
        expect(result.message).toBe("Connect Google Drive first.");
    });

    it("keeps the provider message for an unmarked error", () => {
        const result = streamPartError(new Error("rate limited"), "Moonshot");

        expect(result).toBeInstanceOf(Error);
        expect(result.message).toBe("rate limited");
        expect(isPreservedError(result)).toBe(false);
    });

    it("labels a non-error stream failure", () => {
        expect(streamPartError(undefined, "Moonshot").message).toBe(
            "Moonshot stream failed.",
        );
        expect(streamPartError("upstream exploded", "Moonshot").message).toBe(
            "upstream exploded",
        );
    });
});

describe("findPreservedError", () => {
    it("returns null for unmarked errors and non-errors", () => {
        expect(findPreservedError(new Error("plain"))).toBeNull();
        expect(findPreservedError("a string")).toBeNull();
        expect(findPreservedError(undefined)).toBeNull();
    });

    it("finds a marked error nested several levels deep", () => {
        const pause = new TestPause();
        const nested = new Error("outer", {
            cause: new Error("middle", { cause: pause }),
        });

        expect(findPreservedError(nested)).toBe(pause);
    });

    it("stops walking a self-referential cause chain", () => {
        const looping = new Error("loop") as Error & { cause?: unknown };
        looping.cause = looping;

        expect(findPreservedError(looping)).toBeNull();
    });

    it("attaches the marker without making it enumerable state", () => {
        const pause = new TestPause();
        const descriptor = Object.getOwnPropertyDescriptor(
            pause,
            PRESERVE_ERROR_IDENTITY,
        );

        expect(descriptor?.value).toBe(true);
        expect(descriptor?.enumerable).toBe(false);
        // Spreading and logging must not carry the marker along.
        expect(
            Object.getOwnPropertySymbols({ ...pause }),
        ).not.toContain(PRESERVE_ERROR_IDENTITY);
    });
});
