import React from "react";
import {
  Activity,
  Airplay,
  Bot,
  Calendar,
  CloudSun,
  Coins,
  Compass,
  MessageCircle,
  Phone,
  Pin,
  PlayCircle,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Tv,
  Users,
  Video,
  Wallet
} from "lucide-react";
import { Link, useLocation } from "wouter";

const primaryZones = [
  { href: "/", label: "Home", icon: Compass },
  { href: "/x", label: "X-Zone", icon: Sparkles },
  { href: "/you", label: "You-Zone", icon: Video },
  { href: "/shorts", label: "Shorts", icon: PlayCircle },
  { href: "/live", label: "Live", icon: Airplay },
  { href: "/threads", label: "Threads", icon: Users },
  { href: "/pins", label: "Pins", icon: Pin },
  { href: "/watch", label: "Watch", icon: Tv },
  { href: "/stream", label: "Stream", icon: Activity }
];

const commerceZones = [
  { href: "/sell", label: "Sell", icon: ShoppingBag },
  { href: "/shop", label: "Shop", icon: ShoppingCart },
  { href: "/coins", label: "Coins", icon: Coins }
];

const productivityZones = [
  { href: "/ai", label: "AI", icon: Bot },
  { href: "/mind", label: "Mind", icon: Calendar },
  { href: "/weather", label: "Weather", icon: CloudSun },
  { href: "/tools", label: "Tools", icon: Wallet }
];

const socialZones = [
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/dialer", label: "Dialer", icon: Phone },
  { href: "/velox", label: "Velox", icon: Shield },
  { href: "/nexus", label: "Nexus", icon: Sparkles },
  { href: "/world", label: "World", icon: Compass }
];

export const Sidebar = () => {
  const [location] = useLocation();

  const renderGroup = (title: string, items: typeof primaryZones) => (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
        {title}
      </p>
      <div className="space-y-2">
        {items.map((item) => {
          const isActive = location === item.href || location.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={`flex items-center gap-3 rounded-2xl border border-white/5 px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-white/10 text-white shadow-glow"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                  <Icon className="h-4 w-4" />
                </span>
                {item.label}
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="sticky top-0 h-screen w-full max-w-[280px] overflow-y-auto border-r border-white/10 bg-nebula-900/80 px-5 py-6 backdrop-blur-xl">
      <div className="mb-8 rounded-3xl border border-white/10 bg-nebula-800/70 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Wallet</p>
        <p className="mt-3 text-2xl font-semibold">100 $FREEDOM</p>
        <p className="text-xs text-slate-400">Immutable ledger • 12 transfers</p>
      </div>
      <div className="space-y-6">
        {renderGroup("Core", primaryZones)}
        {renderGroup("Commerce", commerceZones)}
        {renderGroup("Productivity", productivityZones)}
        {renderGroup("Systems", socialZones)}
        <Link href="/settings">
          <a className="flex items-center gap-3 rounded-2xl border border-white/5 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
              <Settings className="h-4 w-4" />
            </span>
            Settings
          </a>
        </Link>
      </div>
    </aside>
  );
};
