import React from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

export const YouWatch = ({ id }: { id: string }) => (
  <div className="space-y-6">
    <Card>
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
        You-Zone Watch
      </p>
      <h1 className="mt-2 text-2xl font-semibold">Stream {id}</h1>
      <p className="mt-2 text-sm text-slate-300">
        Live playback, synchronized chat, and chronological comments.
      </p>
      <div className="mt-4 flex gap-3">
        <Button variant="primary">Join room</Button>
        <Button variant="secondary">Save to playlist</Button>
      </div>
    </Card>
    <Card>
      <h3 className="text-lg font-semibold">Comments</h3>
      <p className="mt-2 text-sm text-slate-300">
        Comments appear newest-first with no ranking or suppression.
      </p>
    </Card>
  </div>
);

export const YouChannel = ({ handle }: { handle: string }) => (
  <div className="space-y-6">
    <Card>
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
        Channel
      </p>
      <h1 className="mt-2 text-2xl font-semibold">@{handle}</h1>
      <p className="mt-2 text-sm text-slate-300">
        Creator profile, uploads, and community updates.
      </p>
      <div className="mt-4 flex gap-3">
        <Button variant="primary">Subscribe</Button>
        <Button variant="secondary">Tip with $FREEDOM</Button>
      </div>
    </Card>
    <Card>
      <h3 className="text-lg font-semibold">Recent uploads</h3>
      <p className="mt-2 text-sm text-slate-300">
        Latest uploads ordered by publish time.
      </p>
    </Card>
  </div>
);

export const YouUpload = () => (
  <Card>
    <h1 className="text-2xl font-semibold">Upload to You-Zone</h1>
    <p className="mt-2 text-sm text-slate-300">
      Drag, drop, and schedule with creator studio workflows.
    </p>
    <div className="mt-4 flex gap-3">
      <Button variant="primary">Start upload</Button>
      <Button variant="secondary">Open creator hub</Button>
    </div>
  </Card>
);

export const YouCreator = () => (
  <div className="grid gap-4 lg:grid-cols-2">
    <Card>
      <h3 className="text-lg font-semibold">Studio Dashboard</h3>
      <p className="mt-2 text-sm text-slate-300">
        Track watch time, subscribers, and revenue shares.
      </p>
    </Card>
    <Card>
      <h3 className="text-lg font-semibold">Moderation</h3>
      <p className="mt-2 text-sm text-slate-300">
        Manage channel safety, comments, and appeals.
      </p>
    </Card>
  </div>
);
