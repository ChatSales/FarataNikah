"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  CheckCircle2,
  XCircle,
  Crown,
  Rocket,
  PartyPopper,
  Heart,
  Bell,
} from "lucide-react";
import { markNotificationReadAction } from "@/actions/notifications";
import type { NotificationItem } from "@/actions/notifications";
import type { NotificationType } from "@/lib/supabase/types";

type Category = "visits" | "requests" | "messages" | "profile" | "premium";

const CATEGORY_BY_TYPE: Record<NotificationType, Category> = {
  contact_request_received: "requests",
  contact_request_accepted: "requests",
  profile_approved: "profile",
  profile_rejected: "profile",
  premium_activated: "premium",
  boost_reminder: "premium",
  completion_reward: "profile",
  winback_reminder: "profile",
};

const TABS: { key: "all" | Category; label: string }[] = [
  { key: "all", label: "Tout" },
  { key: "visits", label: "Visites" },
  { key: "requests", label: "Demandes" },
  { key: "messages", label: "Messages" },
  { key: "profile", label: "Profil" },
  { key: "premium", label: "Premium" },
];

const ICON_BY_TYPE: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  contact_request_received: UserPlus,
  contact_request_accepted: CheckCircle2,
  profile_approved: CheckCircle2,
  profile_rejected: XCircle,
  premium_activated: Crown,
  boost_reminder: Rocket,
  completion_reward: PartyPopper,
  winback_reminder: Heart,
};

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffDays = Math.floor(diffH / 24);
  return `${diffDays}j`;
}

function dateGroupLabel(isoDate: string): string {
  const date = new Date(isoDate);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return "AUJOURD'HUI";
  if (sameDay(date, yesterday)) return "HIER";
  return date
    .toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    .toUpperCase();
}

export function NotificationsView({ notifications }: { notifications: NotificationItem[] }) {
  const [items, setItems] = useState(notifications);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [, startTransition] = useTransition();
  const router = useRouter();

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    for (const tabDef of TABS) {
      if (tabDef.key === "all") continue;
      c[tabDef.key] = items.filter((n) => CATEGORY_BY_TYPE[n.type] === tabDef.key).length;
    }
    return c;
  }, [items]);

  const filtered = useMemo(
    () => (tab === "all" ? items : items.filter((n) => CATEGORY_BY_TYPE[n.type] === tab)),
    [items, tab]
  );

  const groups = useMemo(() => {
    const map = new Map<string, NotificationItem[]>();
    for (const n of filtered) {
      const label = dateGroupLabel(n.created_at);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(n);
    }
    return Array.from(map.entries());
  }, [filtered]);

  function handleClick(notification: NotificationItem) {
    if (!notification.is_read) {
      setItems((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
      startTransition(() => {
        markNotificationReadAction(notification.id);
      });
    }
    if (notification.link) router.push(notification.link);
  }

  return (
    <div className="mt-5">
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              tab === t.key
                ? "bg-primary-600 text-cream-50"
                : "bg-primary-100 text-primary-900/70 hover:bg-primary-100/70"
            }`}
          >
            {t.label}
            {counts[t.key] > 0 && ` (${counts[t.key]})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-2 text-center text-primary-900/50">
          <Bell className="h-8 w-8" />
          <p className="text-sm">Aucune notification ici pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {groups.map(([label, group]) => (
            <div key={label}>
              <h2 className="mb-2 text-xs font-semibold tracking-wide text-primary-900/40">
                {label}
              </h2>
              <div className="space-y-2">
                {group.map((n) => {
                  const Icon = ICON_BY_TYPE[n.type];
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleClick(n)}
                      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        n.is_read
                          ? "border-primary-100 bg-cream-50"
                          : "border-primary-200 bg-primary-50"
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-primary-900">
                            {n.title}
                          </span>
                          <span className="shrink-0 text-[11px] text-primary-900/45">
                            {formatRelativeTime(n.created_at)}
                          </span>
                        </span>
                        {n.body && (
                          <span className="mt-0.5 block truncate text-xs text-primary-900/60">
                            {n.body}
                          </span>
                        )}
                      </span>
                      {!n.is_read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-primary-900/40">
        {items.length} notification{items.length > 1 ? "s" : ""} au total
      </p>
    </div>
  );
}
