import type { HTMLAttributes } from "react";

import { cn } from "../../libs/utils";

type ContainerProps = HTMLAttributes<HTMLDivElement>;

export function Container({
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        /*
         * Mobile: 16px
         * Tablet: 24px
         * Desktop: 32px
         *
         * Maximum content width: 1280px
         */
        "mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}