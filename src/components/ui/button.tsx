import React from "react";
import { cn } from "../../lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-accent-500 text-white hover:bg-accent-400 shadow-glow border border-white/10",
  secondary:
    "bg-white/10 text-white hover:bg-white/20 border border-white/10",
  ghost: "text-white hover:bg-white/10"
};

export const Button = ({
  className,
  variant = "secondary",
  ...props
}: ButtonProps) => (
  <button
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
      variantStyles[variant],
      className
    )}
    {...props}
  />
);
