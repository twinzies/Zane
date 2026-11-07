"use client";

import React from "react";

const DEGREES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

/**
 * One tapered blade, drawn pointing along +x from a rounded inner cap. The
 * caps overlap at the centre, so twelve of them close into a solid core.
 */
const BLADE =
    "M 52,-12 Q 104,-9 154,0 Q 104,9 52,12 A 12,12 0 0 1 52,-12 Z";

/**
 * The blade at twelve o'clock is struck in the accent colour — a marked
 * bearing, like the north point of a compass. `--zane-mark-accent` is
 * declared per target (globals.css for the web, styles.css for the Word
 * add-in) so it can shift for dark surfaces; the literal is the fallback for
 * any context that never sets it.
 */
const ACCENT = "var(--zane-mark-accent, #c2410c)";
const DONE_COLOR = "#16a34a";
const ERROR_COLOR = "#dc2626";

/**
 * The blades inherit `currentColor`, so the mark takes the ink of whatever it
 * sits in and needs no theme subscription of its own — the reason this file
 * no longer watches the document's `dark` class.
 */
export function ZaneIcon({
    spin = false,
    done = false,
    error = false,
    size = 24,
    style,
}: {
    spin?: boolean;
    done?: boolean;
    error?: boolean;
    size?: number;
    style?: React.CSSProperties;
}) {
    // A status overrides the whole mark, accent included, so the state reads
    // at a glance rather than competing with the brand colour.
    const statusColor = error ? ERROR_COLOR : done ? DONE_COLOR : null;
    const inkColor = statusColor ?? "currentColor";
    const accentColor = statusColor ?? ACCENT;

    return (
        <span
            className="shrink-0 inline-block animate-[spin_3s_linear_infinite]"
            style={{
                animationPlayState: spin ? "running" : "paused",
                ...style,
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="92 92 316 316"
                width={size}
                height={size}
                style={{ display: "block" }}
                aria-hidden="true"
                focusable="false"
            >
                {/* -90° puts the first blade at twelve o'clock. */}
                <g transform="translate(250, 250) rotate(-90)">
                    {DEGREES.map((deg, index) => (
                        <path
                            key={deg}
                            d={BLADE}
                            transform={`rotate(${deg})`}
                            fill={index === 0 ? accentColor : inkColor}
                            style={{ transition: "fill 220ms ease" }}
                        />
                    ))}
                </g>
            </svg>
        </span>
    );
}
