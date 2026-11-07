import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AssistantMessage } from "./AssistantMessage";

describe("AssistantMessage retry", () => {
    it("offers retry on a failed turn and calls back when clicked", () => {
        const onRetry = vi.fn();
        render(
            <AssistantMessage
                isError
                errorMessage="The response could not be completed. Please try again."
                onRetry={onRetry}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: /retry/i }));
        expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("does not offer retry on a successful turn", () => {
        render(
            <AssistantMessage
                events={[{ type: "content", text: "All good." }]}
                onRetry={vi.fn()}
            />,
        );

        expect(
            screen.queryByRole("button", { name: /retry/i }),
        ).not.toBeInTheDocument();
    });

    it("hides retry while a response is still streaming", () => {
        render(
            <AssistantMessage
                isError
                errorMessage="Something went wrong."
                isStreaming
                onRetry={vi.fn()}
            />,
        );

        expect(
            screen.queryByRole("button", { name: /retry/i }),
        ).not.toBeInTheDocument();
    });

    it("disables retry while another response is loading", () => {
        const onRetry = vi.fn();
        render(
            <AssistantMessage
                isError
                errorMessage="Something went wrong."
                onRetry={onRetry}
                retryDisabled
            />,
        );

        const button = screen.getByRole("button", { name: /retry/i });
        expect(button).toBeDisabled();
        fireEvent.click(button);
        expect(onRetry).not.toHaveBeenCalled();
    });
});
