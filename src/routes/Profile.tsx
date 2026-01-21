import React from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

export const Profile = ({ username }: { username: string }) => (
  <div className="space-y-6">
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-accent-500/40 via-transparent to-accent-400/20" />
      <div className="relative z-10 flex flex-wrap items-center gap-6">
        <div className="h-24 w-24 rounded-full border border-white/20 bg-accent-400" />
        <div>
          <h1 className="text-2xl font-semibold">@{username}</h1>
          <p className="mt-2 text-sm text-slate-300">
            Bio with clickable links: https://nebria.world/u/{username}
          </p>
          <p className="mt-2 text-sm text-slate-400">Balance: 100 $FREEDOM</p>
        </div>
        <div className="ml-auto flex gap-3">
          <Button variant="primary">Follow</Button>
          <Button variant="secondary">Tip</Button>
        </div>
      </div>
    </Card>
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <h3 className="text-lg font-semibold">Follower graph</h3>
        <p className="mt-2 text-sm text-slate-300">Transparent counts only.</p>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold">Zone activity</h3>
        <p className="mt-2 text-sm text-slate-300">Chronological posts per zone.</p>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold">Wallet ledger</h3>
        <p className="mt-2 text-sm text-slate-300">Immutable transfer history.</p>
      </Card>
    </div>
  </div>
);
