"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, LayoutDashboard, BarChart3, UploadCloud } from "lucide-react";
import { LogoutButton } from "./logout-button";
import { ToastProvider } from "@/components/toast";
import { ConfirmProvider } from "@/components/confirm-dialog";
import { ActivityProvider } from "@/components/activity-bar";
import { ConnectionIndicator } from "@/components/connection-indicator";
import { RealtimeProvider } from "@/lib/realtime-context";
import { UploadProvider } from "@/lib/upload-context";
import { UploadStatusBadge } from "@/components/upload-status-badge";
import { t } from "@/lib/strings";

export function Shell({ children, email }: { children: React.ReactNode; email: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: t.navDashboard, icon: LayoutDashboard },
    { href: "/dashboard/summary", label: t.navSummary, icon: BarChart3 },
    { href: "/dashboard/upload", label: t.navUpload, icon: UploadCloud },
  ];

  const Sidebar = (
    <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col h-screen">
      <div className="p-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl brand-mark flex items-center justify-center font-bold">
            Ç
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{t.appShort}</div>
            <div className="text-xs text-muted truncate">{t.appName}</div>
          </div>
        </Link>
      </div>
      <nav className="p-3 space-y-0.5 flex-1">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={
                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors " +
                (active
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-muted hover:text-fg hover:bg-surface2")
              }
            >
              {active && (
                <span className="absolute start-0 inset-y-1.5 w-1 rounded-full bg-accent" />
              )}
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border space-y-2">
        <UploadStatusBadge />
        <ConnectionIndicator />
        {email && <div className="text-xs text-muted truncate px-2" dir="ltr">{email}</div>}
        <LogoutButton />
      </div>
    </aside>
  );

  return (
    <ActivityProvider>
      <ToastProvider>
      <ConfirmProvider>
        <RealtimeProvider>
        <UploadProvider>
        <div className="min-h-screen flex">
          {/* Desktop sidebar */}
          <div className="hidden md:block sticky top-0 self-start">{Sidebar}</div>

          {/* Mobile drawer */}
          {open && (
            <div className="md:hidden fixed inset-0 z-40">
              <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
              <div className="absolute inset-y-0 left-0">{Sidebar}</div>
            </div>
          )}

          {/* Main */}
          <main className="flex-1 min-w-0">
            {/* Mobile top bar */}
            <div className="md:hidden sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  onClick={() => setOpen(true)}
                  className="btn btn-ghost p-2"
                  aria-label="menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg brand-mark flex items-center justify-center font-bold text-sm">Ç</div>
                  <div className="text-sm font-semibold">{t.appShort}</div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-5 md:p-8">{children}</div>
          </main>
        </div>
        </UploadProvider>
        </RealtimeProvider>
      </ConfirmProvider>
      </ToastProvider>
    </ActivityProvider>
  );
}
