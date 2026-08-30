import Link from "next/link";
import { PillButton } from "@/app/components/ui/pill-button";
import { SiteLogo } from "@/app/components/site-logo";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-app-background flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <SiteLogo size="md" as="div" className="justify-center mb-6" />
                <h1 className="text-3xl font-serif font-light text-foreground mb-3">
                    Page not found
                </h1>
                <p className="text-[0.9375rem] text-muted-foreground leading-relaxed mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or may
                    have been moved.
                </p>

                <PillButton asChild tone="black" size="normal">
                    <Link href="/">Go home</Link>
                </PillButton>
            </div>
        </div>
    );
}
