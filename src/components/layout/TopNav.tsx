import React from "react";
import { Bell, Plus, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const TopNav = () => (
  <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-white/10 bg-nebula-900/80 px-6 py-4 backdrop-blur-xl">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-400" />
      <div>
        <p className="text-lg font-semibold text-white">Nebria</p>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Universe OS</p>
      </div>
    </div>
    <div className="hidden flex-1 items-center gap-3 lg:flex">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-10"
          placeholder="Search zones, creators, posts, links..."
        />
      </div>
    </div>
    <div className="ml-auto flex items-center gap-3">
      <Button variant="primary">
        <Plus className="h-4 w-4" />
        Create
      </Button>
      <button className="relative rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10">
        <Bell className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-accent-300" />
      </button>
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-1">
        <div className="h-8 w-8 rounded-full bg-accent-400" />
        <div>
          <p className="text-sm font-semibold">Nova Skye</p>
          <p className="text-xs text-slate-400">@nova</p>
        </div>
      </div>
    </div>
  </header>
);
