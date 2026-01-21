import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { BadgeCheck, TrendingUp } from "lucide-react";

export const RightRail = () => (
  <div className="sticky top-24 space-y-4">
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Trending Signals
          </p>
          <h3 className="mt-2 text-lg font-semibold">Metrics Only</h3>
        </div>
        <TrendingUp className="h-5 w-5 text-accent-400" />
      </div>
      <div className="mt-4 space-y-3 text-sm text-slate-300">
        <div className="flex items-center justify-between">
          <span>#NebriaLaunch</span>
          <span>98k views</span>
        </div>
        <div className="flex items-center justify-between">
          <span>#ChronologicalOnly</span>
          <span>76k views</span>
        </div>
        <div className="flex items-center justify-between">
          <span>#FreedomToken</span>
          <span>61k views</span>
        </div>
      </div>
    </Card>
    <Card className="bg-gradient-to-br from-nebula-800/90 to-nebula-700/90">
      <div className="flex items-center gap-3">
        <BadgeCheck className="h-5 w-5 text-accent-300" />
        <div>
          <p className="text-sm font-semibold">Verified Creators</p>
          <p className="text-xs text-slate-400">Transparent moderation</p>
        </div>
      </div>
      <Button className="mt-4 w-full" variant="secondary">
        Review applications
      </Button>
    </Card>
  </div>
);
