import Card from "@/components/ui/Card"

type SystemSettingsProps = {
  academicYear: string
  semester: string
  isLoading: boolean
  isError: boolean
  isUpdating: boolean
  onAcademicYearChange: (value: string) => void
  onSemesterChange: (value: string) => void
  onUpdate: () => void
}

export default function SystemSettings({
  academicYear,
  semester,
  isLoading,
  isError,
  isUpdating,
  onAcademicYearChange,
  onSemesterChange,
  onUpdate,
}: SystemSettingsProps) {
  return (
    <Card className="shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#2A0410]">
          System Settings
        </h2>
        <p className="text-xs text-gray-500">
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

          <button
            onClick={onUpdate}
            disabled={isUpdating}
            className="w-full sm:w-auto text-sm px-5 py-2 rounded-xl bg-[#6B0F2B] text-white hover:bg-[#2A0410] disabled:opacity-60"
          >
            {isUpdating ? "Updating..." : "Update Settings"}
          </button>
        </div>
      )}
    </Card>
  )
}