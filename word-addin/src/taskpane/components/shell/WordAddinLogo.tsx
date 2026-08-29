import React from "react";
import { ZaneIcon } from "../../../shared/chat/zane-icon";
import { cn } from "../../../shared/lib/utils";

interface WordAddinLogoProps {
  size?: "md" | "lg";
  className?: string;
}

/** zane logo lockup shared by branded Word add-in surfaces. */
export function WordAddinLogo({
  size = "md",
  className,
}: WordAddinLogoProps): React.ReactElement {
  const large = size === "lg";
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <ZaneIcon size={large ? 30 : 22} />
      <span
        className={cn(
          "font-serif font-light text-foreground",
          large ? "text-4xl" : "text-2xl"
        )}
      >
        zane
      </span>
    </div>
  );
}
