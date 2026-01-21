import React from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export const ZoneHeader = ({
  title,
  description,
  accent
}: {
  title: string;
  description: string;
  accent: string;
}) => (
  <Card className="relative overflow-hidden">
    <div
      className="absolute right-0 top-0 h-32 w-32 rounded-full opacity-40 blur-2xl"
      style={{ backgroundColor: accent }}
    />
    <div className="relative z-10 flex flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Zone Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-slate-300">{description}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary">Quick compose</Button>
        <Button variant="secondary">View analytics</Button>
        <Button variant="ghost">Open moderation</Button>
      </div>
    </div>
  </Card>
);
