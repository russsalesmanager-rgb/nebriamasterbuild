import React from "react";
import { Feed } from "../components/Feed";
import { ZoneHeader } from "../components/ZoneHeader";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

export const Home = () => (
  <div className="space-y-6">
    <ZoneHeader
      title="Home Zone"
      description="Combined chronological feed across every zone with ads every fourth post."
      accent="#7c5cff"
    />
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Global Compose
          </p>
          <p className="mt-2 text-sm text-slate-200">
            Share to every zone instantly. Links stay clickable everywhere.
          </p>
        </div>
        <Button variant="primary">Launch composer</Button>
      </div>
    </Card>
    <Feed />
  </div>
);
