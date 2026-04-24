import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type ReadStatus = "read" | "unread";
type ApiNotificationType = "fee_due" | "application_status" | "system" | "other";
export type NotificationType = "application" | "other" | "system" | "fee_due";

interface ApiNotification {
  id: number;
  userId: number;
  notificationContent: string;
  readStatus: ReadStatus;
  notificationType: ApiNotificationType;
  notificationTimestamp: string;
}

export type Notification = {
    id: number
    type: NotificationType
    message: string
    time: string
    read: boolean
}

interface FetchNotificationsResponse {
  message: string;
  data: ApiNotification[];
}


// ---------- API functions ----------
const fetchNotifications = async (): Promise<ApiNotification[]> => {
  const res = await fetch("/api/notifications");
  if (!res.ok) throw new Error("Failed to fetch notifications");
  const json: FetchNotificationsResponse = await res.json();
  return json.data;
};

const updateNotificationStatus = async ({
  id,
  readStatus,
}: {
  id: number;
  readStatus: ReadStatus;
}) => {
  const res = await fetch(`/api/notifications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ readStatus }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
};

// relative time
function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return `${diffSec} sec ago`;
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hr ago`;
  if (diffDay === 1) return "Yesterday";
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// style mapping
export const TYPE_STYLES: Record<
  NotificationType,
  { label: string; bg: string; text: string }
> = {
  application: { label: "Application", bg: "bg-[#6B0F2B]/10", text: "text-[#6B0F2B]" },
  fee_due: { label: "Fee due", bg: "bg-[#B45309]/10", text: "text-[#B45309]" },
  other: { label: "Other", bg: "bg-[#2563EB]/10", text: "text-[#2563EB]" },
  system: { label: "System", bg: "bg-[#5F5E5A]/10", text: "text-[#5F5E5A]" },
};

// map API type to panel type
const mapNotificationType = (type: ApiNotificationType): NotificationType => {
  if (type === "application_status") return "application";
  if (type === "fee_due") return "fee_due";
  if (type === "system") return "system";
  return "other";
};

// convert API notification to panel notification
const adaptNotification = (api: ApiNotification): Notification => ({
  id: api.id,
  type: mapNotificationType(api.notificationType),
  message: api.notificationContent,
  time: getRelativeTime(api.notificationTimestamp),
  read: api.readStatus === "read",
});

type Tab = "unread" | "all";

type NotificationPanelProps = {
  open: boolean;
  onClose: () => void;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  onUnreadCountChange?: (count: number) => void;   // new
};

export default function NotificationPanel({
  open,
  onClose,
  wrapperRef,
  onUnreadCountChange,
}: NotificationPanelProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("unread");

  // fetch notifications
  const {
    data: apiNotifications = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: open, // only fetch when panel is open
    staleTime: 30000, // 30 seconds
  });

  // transform to panel shape
  const notifications = apiNotifications.map(adaptNotification);
  const unreadCount = notifications.filter((n) => !n.read).length;

    useEffect(() => {
    onUnreadCountChange?.(unreadCount);
    }, [unreadCount, onUnreadCountChange]);

  // mutations
  const markOneReadMutation = useMutation({
    mutationFn: updateNotificationStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unreadIds = apiNotifications
        .filter((n) => n.readStatus === "unread")
        .map((n) => n.id);
      // execute all updates in parallel
      await Promise.all(
        unreadIds.map((id) =>
          updateNotificationStatus({ id, readStatus: "read" })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // handlers
  const handleMarkOneRead = (id: number) => {
    const apiNotif = apiNotifications.find((n) => n.id === id);
    if (apiNotif && apiNotif.readStatus === "unread") {
      markOneReadMutation.mutate({ id, readStatus: "read" });
    }
  };

  const handleMarkAllRead = () => {
    if (unreadCount === 0) return;
    markAllReadMutation.mutate();
  };

  // click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, wrapperRef]);

  // filtering based on active tab
  const shown =
    activeTab === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const tabClass = (tab: Tab) =>
    `text-[12px] font-medium px-3 py-[5px] rounded-t-md border-none cursor-pointer transition-colors
    ${
      activeTab === tab
        ? "bg-[#6B0F2B] text-white"
        : "bg-transparent text-[#9A7A82] hover:text-[#6B0F2B]"
    }`;

  const panelWidth = "w-[300px] lg:w-[340px]";

  // loading and error states inside open panel
  const renderContent = () => {
    if (isLoading) {
      return (
        <li className="px-4 py-7 text-center text-[12px] text-[#9A7A82]">
          Loading notifications...
        </li>
      );
    }
    if (isError) {
      return (
        <li className="px-4 py-7 text-center text-[12px] text-red-500">
          Failed to load.{" "}
          <button onClick={() => refetch()} className="underline">
            Retry
          </button>
        </li>
      );
    }
    if (shown.length === 0) {
      return (
        <li className="px-4 py-7 text-center text-[12px] text-[#9A7A82]">
          No {activeTab === "unread" ? "unread" : ""} notifications
        </li>
      );
    }
    return shown.map((n) => {
      const style = TYPE_STYLES[n.type];
      return (
        <li
          key={n.id}
          onClick={() => handleMarkOneRead(n.id)}
          className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors
            ${
              n.read
                ? "bg-white hover:bg-[#F5EEF0]/50"
                : "bg-[#FDF6F8] hover:bg-[#FAF0F3]"
            }`}
        >
          <div className="mt-1.5 flex-shrink-0 w-2 h-2">
            {!n.read && (
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#C9973A" }}
              />
            )}
          </div>
          <div className="min-w-0">
            <span
              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mb-1 ${style.bg} ${style.text}`}
            >
              {style.label}
            </span>
            <p className="text-[12px] text-[#1A0008] leading-snug">{n.message}</p>
            <p className="text-[11px] text-[#9A7A82] mt-0.5">{n.time}</p>
          </div>
        </li>
      );
    });
  };

  return (
    <div
      className={`
        absolute right-0 top-[calc(100%+10px)] ${panelWidth}
        bg-white rounded-2xl border border-[#6B0F2B]/10 z-50 overflow-hidden
        shadow-xl origin-top-right
        transition-all duration-200 ease-out
        ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#6B0F2B]/8">
        <span className="text-[13px] font-bold text-[#3D0718]">
          Notifications
          {unreadCount > 0 && (
            <span
              className="ml-1.5 text-[11px] font-semibold text-white px-1.5 py-0.5 rounded-full"
              style={{ background: "#6B0F2B" }}
            >
              {unreadCount}
            </span>
          )}
        </span>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
            className="text-[11px] text-[#9E2040] hover:underline disabled:opacity-50"
          >
            {markAllReadMutation.isPending ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-2 border-b border-[#6B0F2B]/8">
        <button className={tabClass("unread")} onClick={() => setActiveTab("unread")}>
          Unread
        </button>
        <button className={tabClass("all")} onClick={() => setActiveTab("all")}>
          All
        </button>
      </div>

      {/* List */}
      <ul className="max-h-[320px] overflow-y-auto divide-y divide-[#6B0F2B]/6">
        {renderContent()}
      </ul>
    </div>
  );
}