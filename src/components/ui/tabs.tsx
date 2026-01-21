import React from "react";
import { cn } from "../../lib/utils";

type TabsProps = {
  items: Array<{ id: string; label: string }>;
  active: string;
  onChange: (id: string) => void;
};

export const Tabs = ({ items, active, onChange }: TabsProps) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item) => (
      <button
        key={item.id}
        type="button"
        onClick={() => onChange(item.id)}
        className={cn(
          "rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]",
          active === item.id
            ? "bg-accent-500 text-white shadow-glow"
            : "bg-white/5 text-slate-200 hover:bg-white/10"
        )}
      >
        {item.label}
      </button>
    ))}
  </div>
);
