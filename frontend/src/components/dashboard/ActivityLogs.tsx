import Card from "../ui/Card";

const logs = [
  { type: "approved", name: "Ana Marie Reyes", time: "2 mins ago" },
  { type: "approved", name: "Ana Marie Reyes", time: "30 mins ago" },
  { type: "rejected", name: "Ana Marie Reyes", time: "2 mins ago" },
  { type: "approved", name: "Ana Marie Reyes", time: "2 mins ago" },
];

export default function ActivityLogs() {
  return (
    <Card>
      <h3 className="font-bold text-sm mb-3">Recent Activity Logs</h3>

      <div className="flex flex-col">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3 relative">

            {/* TIMELINE LINE */}
            {i < logs.length - 1 && (
              <div className="absolute left-[13px] top-[26px] bottom-[-8px] w-[2px] bg-gradient-to-b from-[#C9973A] to-[#e8d08a]" />
            )}

            {/* DOT */}
            <div className="relative z-10 shrink-0">
              {log.type === "approved" ? (
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-[#C9973A] to-[#e8d08a]">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8l3.5 3.5L13 5"
                      stroke="white"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#6B0F2B] flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 4l8 8M12 4l-8 8"
                      stroke="white"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* TEXT */}
            <div className="pb-4">
              <p className="text-xs leading-snug">
                <span className="font-bold capitalize">{log.type}</span>{" "}
                {log.name}
              </p>
              <p className="text-xs text-gray-500">{log.time}</p>
            </div>

          </div>
        ))}
      </div>
    </Card>
  );
}