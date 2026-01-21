import React from "react";
import { cn } from "../../lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: CardProps) => (
  <div
    className={cn(
      "rounded-2xl border border-white/10 bg-nebula-800/70 p-5 shadow-glass",
      className
    )}
    {...props}
  />
);
