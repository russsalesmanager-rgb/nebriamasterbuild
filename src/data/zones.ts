export type Zone = {
  key: string;
  name: string;
  description: string;
  accent: string;
  routes: string[];
};

export const zoneRoutes = [
  "",
  "feed",
  "explore",
  "trending",
  "search",
  "create",
  "settings",
  "analytics",
  "moderation"
];

export const zones: Zone[] = [
  {
    key: "x",
    name: "X-Zone",
    description: "Chronological micro-posts, threads, and signal hubs.",
    accent: "#31d4ff",
    routes: zoneRoutes
  },
  {
    key: "you",
    name: "You-Zone",
    description: "Creator studio, channels, and watch pages.",
    accent: "#ff5c7a",
    routes: zoneRoutes
  },
  {
    key: "shorts",
    name: "Shorts",
    description: "Vertical video discovery with sound libraries.",
    accent: "#7c5cff",
    routes: zoneRoutes
  },
  {
    key: "live",
    name: "Live",
    description: "Streaming schedules, chat, and replay controls.",
    accent: "#41ffb3",
    routes: zoneRoutes
  },
  {
    key: "threads",
    name: "Threads",
    description: "Communities, nested replies, and moderation queues.",
    accent: "#ffd66b",
    routes: zoneRoutes
  },
  {
    key: "pins",
    name: "Pins",
    description: "Boards, pins, and masonry discovery grids.",
    accent: "#ff9f68",
    routes: zoneRoutes
  },
  {
    key: "watch",
    name: "Watch",
    description: "Watch parties, synchronized playback, and live chat.",
    accent: "#7c5cff",
    routes: zoneRoutes
  },
  {
    key: "stream",
    name: "Stream",
    description: "Sports schedules, team hubs, and game rooms.",
    accent: "#31d4ff",
    routes: zoneRoutes
  },
  {
    key: "sell",
    name: "Sell",
    description: "Listings, inventory, and seller analytics.",
    accent: "#41ffb3",
    routes: zoneRoutes
  },
  {
    key: "shop",
    name: "Shop",
    description: "Marketplace browse, cart, and orders.",
    accent: "#7c5cff",
    routes: zoneRoutes
  },
  {
    key: "ai",
    name: "AI",
    description: "AI chat, prompt sharing, and moderation assistance.",
    accent: "#31d4ff",
    routes: zoneRoutes
  },
  {
    key: "mind",
    name: "Mind",
    description: "Notes, tasks, calendar, and focus mode.",
    accent: "#41ffb3",
    routes: zoneRoutes
  },
  {
    key: "weather",
    name: "Weather",
    description: "Forecast dashboards and alert settings.",
    accent: "#ffd66b",
    routes: zoneRoutes
  },
  {
    key: "tools",
    name: "Tools",
    description: "QR, URL shortener, and utility labs.",
    accent: "#ff5c7a",
    routes: zoneRoutes
  },
  {
    key: "chat",
    name: "Chat",
    description: "DMs, group rooms, and attachment workflows.",
    accent: "#7c5cff",
    routes: zoneRoutes
  },
  {
    key: "dialer",
    name: "Dialer",
    description: "Dialpad, contacts, and call logs.",
    accent: "#31d4ff",
    routes: zoneRoutes
  },
  {
    key: "coins",
    name: "Coins",
    description: "Wallet, ledger, and $FREEDOM transfers.",
    accent: "#41ffb3",
    routes: zoneRoutes
  },
  {
    key: "velox",
    name: "Velox",
    description: "Integrations, webhooks, and partner tools.",
    accent: "#7c5cff",
    routes: zoneRoutes
  },
  {
    key: "nexus",
    name: "Nexus",
    description: "Cross-platform connections and sync controls.",
    accent: "#ff5c7a",
    routes: zoneRoutes
  },
  {
    key: "world",
    name: "World",
    description: "OpenWorld cinematic landing and waitlist.",
    accent: "#ffd66b",
    routes: zoneRoutes
  }
];
