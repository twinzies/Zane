import Link from "next/link";
import { ZaneIcon } from "@/app/components/chat/zane-icon";

interface SiteLogoProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    iconClassName?: string;
    animate?: boolean;
    asLink?: boolean;
    href?: string;
    as?: "h1" | "div";
}

export function SiteLogo({
    size = "md",
    className = "",
    iconClassName = "",
    animate = false,
    asLink = false,
    href,
    as: Wrapper = "h1",
}: SiteLogoProps) {
    const landingHref =
        process.env.NODE_ENV === "production"
            ? "https://zaneoss.com"
            : "http://localhost:3000";
    const linkHref = href ?? (asLink ? landingHref : undefined);
    const sizeClasses = {
        sm: "text-2xl",
        md: "text-3xl",
        lg: "text-5xl",
        xl: "text-7xl",
    };

    const iconSizes = {
        sm: 20,
        md: 22,
        lg: 30,
        xl: 48,
    };

    const logo = (
        <Wrapper
            className={`flex items-center gap-2.5 ${sizeClasses[size]} ${
                animate ? "sidebar-fade-in" : ""
            } ${className}`}
        >
            <span
                className={`inline-flex shrink-0 items-center leading-none ${iconClassName}`}
            >
                <ZaneIcon size={iconSizes[size]} />
            </span>
            <span className="font-script font-bold">zane</span>
        </Wrapper>
    );

    if (linkHref) {
        return (
            <Link
                href={linkHref}
                className="cursor-pointer hover:opacity-80 transition-opacity"
            >
                {logo}
            </Link>
        );
    }

    return logo;
}
