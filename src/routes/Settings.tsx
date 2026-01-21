import React from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

export const Settings = () => (
  <div className="space-y-6">
    <Card>
      <h1 className="text-2xl font-semibold">Account Settings</h1>
      <p className="mt-2 text-sm text-slate-300">
        Privacy, security, and notification preferences for every zone.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="primary">Update profile</Button>
        <Button variant="secondary">Security review</Button>
      </div>
    </Card>
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <h3 className="text-lg font-semibold">Privacy</h3>
        <p className="mt-2 text-sm text-slate-300">
          Blocks, mutes, and explicit visibility rules.
        </p>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold">Notifications</h3>
        <p className="mt-2 text-sm text-slate-300">
          Likes, follows, comments, mentions, and token transfers.
        </p>
      </Card>
    </div>
  </div>
);
