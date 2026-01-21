import React from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { RightRail } from "./RightRail";

export const AppShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-nebula-900 text-white">
    <TopNav />
    <div className="mx-auto flex w-full max-w-[1400px] gap-6 px-6 py-6">
      <div className="hidden lg:block lg:w-[280px]">
        <Sidebar />
      </div>
      <main className="flex-1 space-y-6">{children}</main>
      <aside className="hidden xl:block xl:w-[320px]">
        <RightRail />
      </aside>
    </div>
  </div>
);
