import React from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

export const World = () => (
  <div className="space-y-6">
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-accent-500/30 via-transparent to-accent-400/30" />
      <div className="relative z-10 space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          OpenWorld
        </p>
        <h1 className="text-3xl font-semibold">Nebria World</h1>
        <p className="max-w-2xl text-sm text-slate-200">
          Cinematic landing page with roadmap, waitlist, and developer updates.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Join waitlist</Button>
          <Button variant="secondary">View roadmap</Button>
        </div>
      </div>
    </Card>
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <h3 className="text-lg font-semibold">Roadmap</h3>
        <p className="mt-2 text-sm text-slate-300">
          Zones are independent platforms with shared identity, wallet, and moderation.
        </p>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold">Dev updates</h3>
        <p className="mt-2 text-sm text-slate-300">
          Weekly progress logs, released chronological.
        </p>
      </Card>
    </div>
  </div>
);
