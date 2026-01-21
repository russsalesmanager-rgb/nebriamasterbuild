export type FeedItem = {
  id: string;
  zoneKey: string;
  owner: string;
  createdAt: string;
  content: string;
  link?: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
  };
};

export type AdItem = {
  id: string;
  zoneKey: string;
  createdAt: string;
  headline: string;
  body: string;
  cta: string;
  link: string;
};

const baseFeed: FeedItem[] = [
  {
    id: "post-001",
    zoneKey: "x",
    owner: "Nova Santos",
    createdAt: "2025-01-20T18:22:00Z",
    content:
      "Launching the transparent timeline: every post is chronological and link-friendly. Docs at https://nebria.world/policy.",
    link: "https://nebria.world/policy",
    metrics: { views: 12092, likes: 845, comments: 214 }
  },
  {
    id: "post-002",
    zoneKey: "you",
    owner: "Channel Nebria",
    createdAt: "2025-01-20T17:58:00Z",
    content:
      "Creator Studio walkthrough is live. Watch the timeline-first analytics demo: https://nebria.world/you/watch/alpha.",
    link: "https://nebria.world/you/watch/alpha",
    metrics: { views: 18210, likes: 1512, comments: 403 }
  },
  {
    id: "post-003",
    zoneKey: "threads",
    owner: "Skye Moderation",
    createdAt: "2025-01-20T17:44:00Z",
    content:
      "Moderation queue now shows evidence snapshots for every report. Review guidelines at https://nebria.world/trust.",
    link: "https://nebria.world/trust",
    metrics: { views: 9540, likes: 612, comments: 187 }
  },
  {
    id: "post-004",
    zoneKey: "pins",
    owner: "Aurora Finch",
    createdAt: "2025-01-20T17:12:00Z",
    content:
      "Masonry boards look crisp with glassmorphism. New inspiration board: https://nebria.world/pins/aurora.",
    link: "https://nebria.world/pins/aurora",
    metrics: { views: 7741, likes: 533, comments: 129 }
  },
  {
    id: "post-005",
    zoneKey: "live",
    owner: "Pulse Live",
    createdAt: "2025-01-20T16:50:00Z",
    content:
      "Tonight's stream schedule just dropped. Join the watch room at https://nebria.world/live/pulse.",
    link: "https://nebria.world/live/pulse",
    metrics: { views: 14823, likes: 1102, comments: 387 }
  },
  {
    id: "post-006",
    zoneKey: "coins",
    owner: "Nebria Wallet",
    createdAt: "2025-01-20T16:33:00Z",
    content:
      "Every new account starts with 100 $FREEDOM. Transfer logs are immutable and visible in your ledger.",
    metrics: { views: 9902, likes: 945, comments: 241 }
  },
  {
    id: "post-007",
    zoneKey: "shorts",
    owner: "Velo Edit",
    createdAt: "2025-01-20T16:10:00Z",
    content:
      "New sound packs are up. Duet and stitch tools are ready in the studio.",
    metrics: { views: 12044, likes: 833, comments: 198 }
  },
  {
    id: "post-008",
    zoneKey: "shop",
    owner: "Nova Supply",
    createdAt: "2025-01-20T15:42:00Z",
    content:
      "Marketplace inventory synced with sellers. Preview catalog: https://nebria.world/shop/new.",
    link: "https://nebria.world/shop/new",
    metrics: { views: 6221, likes: 401, comments: 76 }
  },
  {
    id: "post-009",
    zoneKey: "ai",
    owner: "Nebria AI",
    createdAt: "2025-01-20T15:08:00Z",
    content:
      "Prompt sharing is live. Submit your best moderation prompt at https://nebria.world/ai/prompts.",
    link: "https://nebria.world/ai/prompts",
    metrics: { views: 13450, likes: 1044, comments: 302 }
  },
  {
    id: "post-010",
    zoneKey: "mind",
    owner: "Focus Lab",
    createdAt: "2025-01-20T14:39:00Z",
    content:
      "Pomodoro rooms now sync with your calendar. Configure at https://nebria.world/mind.",
    link: "https://nebria.world/mind",
    metrics: { views: 4310, likes: 356, comments: 64 }
  }
];

const ads: AdItem[] = [
  {
    id: "ad-001",
    zoneKey: "global",
    createdAt: "2025-01-20T18:00:00Z",
    headline: "Nebria Sovereign Ads",
    body: "All ad revenue stays with the platform owner. Transparent pacing, no ranking impact.",
    cta: "Launch a campaign",
    link: "https://nebria.world/ads"
  },
  {
    id: "ad-002",
    zoneKey: "global",
    createdAt: "2025-01-20T17:00:00Z",
    headline: "Creator Boosts",
    body: "Boost visibility without reordering feeds. Labelled, audited, and always chronological.",
    cta: "View boosts",
    link: "https://nebria.world/boosts"
  }
];

export const fetchFeed = async (zoneKey?: string): Promise<FeedItem[]> => {
  const filtered = zoneKey
    ? baseFeed.filter((item) => item.zoneKey === zoneKey)
    : baseFeed;
  return Promise.resolve(
    [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
};

export const fetchAds = async (): Promise<AdItem[]> => {
  return Promise.resolve(ads);
};
