import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAds, fetchFeed, FeedItem, AdItem } from "../data/feeds";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Link2 } from "lucide-react";

const insertAds = (items: FeedItem[], ads: AdItem[]) => {
  const output: Array<FeedItem | AdItem> = [];
  const adCycle = ads.length > 0 ? ads : [];
  let adIndex = 0;
  items.forEach((item, index) => {
    output.push(item);
    if ((index + 1) % 4 === 0 && adCycle.length > 0) {
      output.push(adCycle[adIndex % adCycle.length]);
      adIndex += 1;
    }
  });
  return output;
};

const isAd = (item: FeedItem | AdItem): item is AdItem =>
  (item as AdItem).cta !== undefined;

export const Feed = ({ zoneKey }: { zoneKey?: string }) => {
  const { data: feed = [] } = useQuery({
    queryKey: ["feed", zoneKey ?? "global"],
    queryFn: () => fetchFeed(zoneKey)
  });
  const { data: ads = [] } = useQuery({
    queryKey: ["ads"],
    queryFn: fetchAds
  });

  const timeline = insertAds(feed, ads);

  return (
    <div className="space-y-4">
      {timeline.map((item) =>
        isAd(item) ? (
          <Card key={item.id} className="border-accent-400/40 bg-nebula-800/80">
            <p className="text-xs uppercase tracking-[0.3em] text-accent-300">
              Sponsored
            </p>
            <h3 className="mt-3 text-lg font-semibold">{item.headline}</h3>
            <p className="mt-2 text-sm text-slate-300">{item.body}</p>
            <Button
              className="mt-4"
              variant="primary"
              onClick={() => window.open(item.link, "_blank")}
            >
              {item.cta}
            </Button>
          </Card>
        ) : (
          <Card key={item.id} className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">{item.owner}</span>
              <span>{new Date(item.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm text-slate-200">{item.content}</p>
            {item.link ? (
              <a
                className="inline-flex items-center gap-2 text-xs text-accent-300 hover:text-accent-400"
                href={item.link}
                target="_blank"
                rel="noreferrer"
              >
                <Link2 className="h-4 w-4" />
                {item.link}
              </a>
            ) : null}
            <div className="flex flex-wrap gap-4 text-xs text-slate-400">
              <span>{item.metrics.views.toLocaleString()} views</span>
              <span>{item.metrics.likes.toLocaleString()} likes</span>
              <span>{item.metrics.comments.toLocaleString()} comments</span>
            </div>
          </Card>
        )
      )}
    </div>
  );
};
