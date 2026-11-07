"use client";

import Link from "next/link";
import { useEffect } from "react";
import { PillButton } from "@/app/components/ui/pill-button";
import { SiteLogo } from "@/app/components/site-logo";

export default function Error({
    error,
}: {
    error: Error & { digest?: string };
}) {
    useEffect(() => {
        console.error("App error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-app-background flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <SiteLogo size="md" as="div" className="justify-center mb-6" />
                <h1 className="text-3xl font-serif font-light text-foreground mb-3">
                    Something went wrong
                </h1>
                <p className="text-[0.9375rem] text-muted-foreground leading-relaxed mb-8">
                    We encountered an unexpected error. This has been logged and
                    our team will look into it.
                </p>

                <PillButton asChild tone="black" size="normal">
                    <Link href="/">Home</Link>
                </PillButton>
            </div>
        </div>
    );
}
