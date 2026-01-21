import React, { useState } from "react";
import { useLocation } from "wouter";
import { zones } from "../data/zones";
import { ZoneHeader } from "../components/ZoneHeader";
import { Feed } from "../components/Feed";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs } from "../components/ui/tabs";

const sectionCopy: Record<string, string> = {
  feed: "Chronological feed with ads every fourth item.",
  explore: "Browse categories and tags without algorithmic ranking.",
  trending: "Trending metrics only. Items remain chronological.",
  search: "Zone-scoped search with chronological results.",
  create: "Creation tools, uploads, and drafts.",
  settings: "Zone preferences and visibility controls.",
  analytics: "Creator analytics dashboards.",
  moderation: "Moderation queues and audit logs."
};

const zoneTabs = [
  { id: "feed", label: "Feed" },
  { id: "explore", label: "Explore" },
  { id: "trending", label: "Trending" },
  { id: "search", label: "Search" },
  { id: "create", label: "Create" },
  { id: "settings", label: "Settings" },
  { id: "analytics", label: "Analytics" },
  { id: "moderation", label: "Moderation" }
];

export const ZoneSection = ({
  zoneKey,
  section
}: {
  zoneKey: string;
  section: string;
}) => {
  const [location, setLocation] = useLocation();
  const zone = zones.find((item) => item.key === zoneKey);
  const [active, setActive] = useState(section || "feed");

  if (!zone) {
    return (
      <Card>
        <h2 className="text-lg font-semibold">Zone not found</h2>
        <p className="text-sm text-slate-400">{zoneKey}</p>
      </Card>
    );
  }

  const handleTabChange = (tabId: string) => {
    setActive(tabId);
    const base = `/${zoneKey}`;
    const next = tabId === "" || tabId === "feed" ? base : `${base}/${tabId}`;
    if (location !== next) {
      setLocation(next);
    }
  };

  return (
    <div className="space-y-6">
      <ZoneHeader
        title={zone.name}
        description={zone.description}
        accent={zone.accent}
      />
      <Tabs items={zoneTabs} active={active} onChange={handleTabChange} />
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {section || "feed"} toolkit
            </p>
            <p className="mt-2 text-sm text-slate-200">
              {sectionCopy[section] || sectionCopy.feed}
            </p>
          </div>
          <Button variant="secondary">Open {section || "feed"}</Button>
        </div>
      </Card>
      {section === "analytics" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="text-lg font-semibold">Audience Growth</h3>
            <p className="text-sm text-slate-400">Chronological acquisition</p>
            <p className="mt-4 text-2xl font-semibold">+14.2%</p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold">Engagement</h3>
            <p className="text-sm text-slate-400">No ranking influence</p>
            <p className="mt-4 text-2xl font-semibold">3.4M actions</p>
          </Card>
        </div>
      ) : section === "moderation" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h3 className="text-lg font-semibold">Open Reports</h3>
            <p className="mt-2 text-sm text-slate-300">
              42 reports waiting. Evidence snapshots included.
            </p>
            <Button className="mt-4" variant="primary">
              Review queue
            </Button>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold">Legal Escalations</h3>
            <p className="mt-2 text-sm text-slate-300">
              3 escalations flagged for instant removal.
            </p>
            <Button className="mt-4" variant="secondary">
              View audit log
            </Button>
          </Card>
        </div>
      ) : section === "create" ? (
        <Card>
          <h3 className="text-lg font-semibold">Creator Studio</h3>
          <p className="mt-2 text-sm text-slate-300">
            Upload assets, schedule posts, and sync to wallets.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="primary">Start upload</Button>
            <Button variant="secondary">Draft library</Button>
          </div>
        </Card>
      ) : (
        <Feed zoneKey={zone.key === "world" ? undefined : zone.key} />
      )}
    </div>
  );
};
