import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ZaneIcon } from "./zane-icon";

function blades(container: HTMLElement) {
    return Array.from(container.querySelectorAll("path"));
}

function fills(container: HTMLElement) {
    return blades(container).map((p) => p.getAttribute("fill"));
}

describe("ZaneIcon", () => {
    it("draws twelve blades", () => {
        const { container } = render(<ZaneIcon />);

        expect(blades(container)).toHaveLength(12);
    });

    /**
     * The mark inherits the surrounding ink instead of subscribing to the
     * document theme, which is what lets it render correctly in the Word
     * add-in and anywhere the `dark` class never reaches.
     */
    it("inherits currentColor for the ink blades", () => {
        const { container } = render(<ZaneIcon />);
        const inkFills = fills(container).slice(1);

        expect(inkFills).toHaveLength(11);
        expect(new Set(inkFills)).toEqual(new Set(["currentColor"]));
    });

    it("strikes the twelve o'clock blade in the accent colour", () => {
        const { container } = render(<ZaneIcon />);

        expect(fills(container)[0]).toBe("var(--zane-mark-accent, #c2410c)");
        // The group is rotated so the accent blade points up.
        expect(
            container.querySelector("g")?.getAttribute("transform"),
        ).toContain("rotate(-90)");
    });

    it("overrides every blade, accent included, for the error state", () => {
        const { container } = render(<ZaneIcon error />);

        expect(new Set(fills(container))).toEqual(new Set(["#dc2626"]));
    });

    it("overrides every blade for the done state", () => {
        const { container } = render(<ZaneIcon done />);

        expect(new Set(fills(container))).toEqual(new Set(["#16a34a"]));
    });

    it("runs the spin animation only while spinning", () => {
        const { container: idle } = render(<ZaneIcon />);
        const { container: spinning } = render(<ZaneIcon spin />);

        expect(
            (idle.firstChild as HTMLElement).style.animationPlayState,
        ).toBe("paused");
        expect(
            (spinning.firstChild as HTMLElement).style.animationPlayState,
        ).toBe("running");
    });
});
