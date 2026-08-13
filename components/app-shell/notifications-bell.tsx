"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  fetchAndMarkNotificationsAction,
  type NotificationItem,
} from "@/actions/notifications";

export function NotificationsBell({ initialUnreadCount }: { initialUnreadCount: number }) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [notifications, setNotifications] = useState<NotificationItem[] | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && notifications === null) {
      startTransition(async () => {
        const result = await fetchAndMarkNotificationsAction();
        if ("notifications" in result) {
          setNotifications(result.notifications);
          setUnreadCount(0);
        }
      });
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 text-primary-700 transition hover:bg-primary-50"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-40 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-primary-100 bg-cream-50 shadow-lg">
          <div className="border-b border-primary-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-primary-900">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {pending && notifications === null ? (
              <p className="px-4 py-6 text-center text-sm text-primary-900/50">Chargement...</p>
            ) : !notifications || notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-primary-900/50">
                Aucune notification pour l&apos;instant.
              </p>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li key={n.id} className="border-b border-primary-50 last:border-0">
                    <Link
                      href={n.link ?? "/app/discover"}
                      onClick={() => setOpen(false)}
                      className={`block px-4 py-3 text-sm transition hover:bg-primary-50 ${
                        !n.is_read ? "bg-primary-50/60" : ""
                      }`}
                    >
                      <p className="font-medium text-primary-900">{n.title}</p>
                      {n.body && (
                        <p className="mt-0.5 text-xs text-primary-900/60">{n.body}</p>
                      )}
                      <p className="mt-1 text-[10px] text-primary-900/40">
                        {new Date(n.created_at).toLocaleString("fr-FR")}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
