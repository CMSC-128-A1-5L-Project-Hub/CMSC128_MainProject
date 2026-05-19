import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Card from "@/components/ui/Card"
import Modal from "@/components/Modal"
import Button from "@/components/Button"
import { api } from "../../../api/axios"

type SystemSettingsProps = {
  academicYear: string
  semester: string
  autoVerifyUsers: boolean
  isLoading: boolean
  isError: boolean
  isUpdating: boolean
  onAcademicYearChange: (value: string) => void
  onSemesterChange: (value: string) => void
  onAutoVerifyChange: (value: boolean) => void
  onUpdate: () => void
  onToast?: (t: {
    type: "success" | "error" | "info" | "warning" | "loading"
    title: string
    message?: string
  }) => void
}

export default function SystemSettings({
  academicYear,
  semester,
  autoVerifyUsers,
  isLoading,
  isError,
  isUpdating,
  onAcademicYearChange,
  onSemesterChange,
  onAutoVerifyChange,
  onUpdate,
  onToast,
}: SystemSettingsProps) {
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const startCycleMutation = useMutation({
    mutationFn: async () => (await api.post("/admin/form5-renewals/start-cycle")).data,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-form5-renewals"] })
      onToast?.({
        type: "success",
        title: "Renewal Cycle Started",
        message: `${data?.count ?? 0} active students must re-submit their Form 5.`,
      })
    },
    onError: (err: any) => {
      onToast?.({
        type: "error",
        title: "Could Not Start Cycle",
        message: err?.response?.data?.message || "An error occurred.",
      })
    },
  })

  return (
    <Card className="shadow-sm">
      <div className="mb-4">
        <h2 className="text-[16px] font-bold text-[#2A0410]">
          System Settings
        </h2>
        <p className="text-[13px] italic">
          Update the current academic year and semester.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : isError ? (
        <p className="text-sm text-red-500">Error loading settings.</p>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2A0410] mb-1">
              Academic Year
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => onAcademicYearChange(e.target.value)}
              className="w-full border border-[#F2D9DF] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9973A]"
              placeholder="2025-2026"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2A0410] mb-1">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => onSemesterChange(e.target.value)}
              className="w-full border border-[#F2D9DF] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9973A]"
            >
              <option value="">Select semester</option>
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
              <option value="Midyear">Midyear</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[#2A0410]">
                Auto-Verify New Users
              </p>
              <p className="text-xs text-gray-500">
                Instantly approves students and landlords on setup. For testing only.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onAutoVerifyChange(!autoVerifyUsers)}
              className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                autoVerifyUsers ? "bg-[#6B0F2B]" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                  autoVerifyUsers ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-[#F2D9DF] pt-3">
            <div>
              <p className="text-sm font-medium text-[#2A0410]">
                Form 5 Renewal Cycle
              </p>
              <p className="text-xs text-gray-500">
                Resets every currently-assigned student so they must re-upload their Form 5.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={startCycleMutation.isPending}
              className="text-xs px-4 py-2 rounded-xl bg-[#6B0F2B] text-white hover:bg-[#2A0410] disabled:opacity-60 whitespace-nowrap"
            >
              {startCycleMutation.isPending ? "Starting..." : "Start New Cycle"}
            </button>
          </div>

          <button
            onClick={onUpdate}
            disabled={isUpdating}
            className="w-full sm:w-auto text-sm px-5 py-2 rounded-xl bg-[#6B0F2B] text-white hover:bg-[#2A0410] disabled:opacity-60"
          >
            {isUpdating ? "Updating..." : "Update Settings"}
          </button>
        </div>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Start New Renewal Cycle"
        eyebrow="CONFIRM ACTION"
        maxWidth={480}
      >
        <div className="flex flex-col gap-4 py-2">
          <p className="text-sm text-gray-700">
            This will mark every currently-assigned student as needing to re-submit their Form 5.
            Existing verified renewals from the previous cycle will be reset.
          </p>
          <p className="text-sm text-gray-700">Continue?</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="reddishPink"
              disabled={startCycleMutation.isPending}
              onClick={async () => {
                await startCycleMutation.mutateAsync()
                setConfirmOpen(false)
              }}
            >
              {startCycleMutation.isPending ? "Starting..." : "Start Cycle"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  )
}