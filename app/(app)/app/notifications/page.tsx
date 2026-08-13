import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Bell, CheckCheck } from "lucide-react";
import { getNotificationsAction, markAllNotificationsReadAction } from "@/actions/notifications";
import { NotificationsView } from "@/components/notifications/notifications-view";

export default async function NotificationsPage() {
  const result = await getNotificationsAction();
  if ("error" in result) redirect("/app/home");

  const { notifications } = result;
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Link
          href="/app/home"
          aria-label="Retour"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary-200 text-primary-700 transition hover:bg-primary-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Bell className="h-5 w-5 shrink-0 text-primary-700" />
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-primary-900">Notifications</h1>
            <p className="text-xs text-primary-900/55">
              {unreadCount === 0
                ? "Tout est lu"
                : unreadCount === 1
                  ? "1 non lue"
                  : `${unreadCount} non lues`}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <form action={markAllNotificationsReadAction}>
            <button
              type="submit"
              aria-label="Tout marquer comme lu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary-200 text-primary-700 transition hover:bg-primary-50"
            >
              <CheckCheck className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>

      <NotificationsView notifications={notifications} />
    </div>
  );
}
