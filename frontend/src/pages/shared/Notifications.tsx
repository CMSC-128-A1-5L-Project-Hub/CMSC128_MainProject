import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/axios";

// ── Design tokens ─────────────────────────
const CLR = {
  dark:   "#3D0718",
  mid:    "#6B0F2B",
  accent: "#8C1535",
  gold:   "#C9973A",
  goldLt: "#E8C37A",
  goldDk: "#a07825",
} as const;

// ── Types ─────────────────────────────
type ReadStatus = "read" | "unread";
type NotificationType = "fee_due" | "application_status" | "system" | "other";

interface Notification {
  id: number;
  userId: number;
  notificationContent: string;
  readStatus: ReadStatus;
  notificationType: NotificationType;
  notificationTimestamp: string;
}


// ── Inline Icons ───────────────────────────────────────────────────────────
const IconBell = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const IconCheckDouble = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12.5l3 3 5-6m-9-3.5L4.5 9.5 2 7m16 2.5l-5 6-3-3" />
  </svg>
);

// ── Helper: Map Notification Types to UI ───────────────────────────────────
const getNotificationMeta = (type: NotificationType, isUnread: boolean) => {
  // If read, we wash out the colors. If unread, they get their specific colors.
  const baseColors = {
    fee_due: { title: "Payment Reminder", bg: isUnread ? "bg-amber-100" : "bg-gray-100", text: isUnread ? "text-amber-700" : "text-gray-500" },
    application_status: { title: "Application Update", bg: isUnread ? "bg-sky-100" : "bg-gray-100", text: isUnread ? "text-sky-700" : "text-gray-500" },
    system: { title: "System Alert", bg: isUnread ? `bg-[#6B0F2B] text-white` : "bg-gray-100 text-gray-500", text: "" },
    other: { title: "Notification", bg: isUnread ? "bg-gray-200" : "bg-gray-50", text: isUnread ? "text-gray-800" : "text-gray-400" },
  };
  return baseColors[type] || baseColors.other;
};

// ── API Functions ──────────────────────────────────────────────────────────
const fetchNotifications = async (): Promise<Notification[]> => {
  const { data } = await api.get("/notifications");
  return data;
};

const updateNotificationStatus = async ({ id, readStatus }: { id: number; readStatus: ReadStatus }) => {
  const { data } = await api.patch(`/notifications/${id}`, { readStatus });
  return data;
};

// ── Main Page Component ────────────────────────────────────────────────────
export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const mutation = useMutation({
    mutationFn: updateNotificationStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleToggleStatus = (id: number, currentStatus: ReadStatus) => {
    const newStatus = currentStatus === "read" ? "unread" : "read";
    mutation.mutate({ id, readStatus: newStatus });
  };

  return (
    <div className="min-h-screen bg-[#F6F2F4] font-sans flex flex-col items-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-3xl">
        
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 rounded-full" style={{ background: CLR.mid }} />
            <h1 className="font-serif italic text-2xl lg:text-3xl font-bold text-gray-900">
              Notifications
            </h1>
          </div>
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${CLR.mid} 0%, ${CLR.accent} 100%)` }}
          >
            <IconBell />
          </div>
        </header>

        <main className="bg-white rounded-[30px] shadow-[0_10px_24px_rgba(61,7,24,0.06)] p-6 sm:p-8">
          {isLoading && (
            <p className="text-gray-400 font-medium text-center py-10 animate-pulse">
              Loading notifications...
            </p>
          )}

          {isError && (
            <p className="text-red-500 font-medium text-center py-10">
              Failed to load notifications. Please try again later.
            </p>
          )}

          {!isLoading && !isError && notifications.length === 0 && (
            <div className="text-center py-16">
              <IconBell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-lg">You're all caught up!</p>
              <p className="text-gray-400 text-sm mt-1">No new notifications at the moment.</p>
            </div>
          )}

          <div className="space-y-4">
            {notifications.map((notif) => {
              const isUnread = notif.readStatus === "unread";
              const meta = getNotificationMeta(notif.notificationType, isUnread);

              return (
                <div 
                  key={notif.id}
                  className={`relative flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                    isUnread 
                      ? "bg-[#F7F1F3] border-[#EFE3E8] shadow-sm" 
                      : "bg-white border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  {isUnread && (
                    <div 
                      className="absolute top-6 left-3 w-2 h-2 rounded-full shadow-sm" 
                      style={{ background: CLR.gold }} 
                    />
                  )}

                  {/* Icon Container dynamically colored based on type */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-2 ${meta.bg} ${meta.text}`}>
                    <IconBell className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex sm:items-center flex-col sm:flex-row sm:justify-between gap-1 mb-1.5">
                      <p className={`text-[15px] truncate pr-4 ${isUnread ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                        {meta.title}
                      </p>
                      <p className="text-xs font-medium text-gray-400 whitespace-nowrap">
                        {new Date(notif.notificationTimestamp).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </div>
                    
                    <p className={`text-sm leading-relaxed ${isUnread ? "text-gray-700" : "text-gray-500"}`}>
                      {notif.notificationContent}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(notif.id, notif.readStatus)}
                    disabled={mutation.isPending}
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors border ${
                      isUnread 
                        ? "bg-white border-gray-200 text-gray-400 hover:text-green-600 hover:border-green-200 hover:bg-green-50" 
                        : "bg-gray-50 border-transparent text-gray-300 hover:text-gray-600 hover:bg-gray-100"
                    }`}
                    title={isUnread ? "Mark as read" : "Mark as unread"}
                  >
                    <IconCheckDouble />
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}