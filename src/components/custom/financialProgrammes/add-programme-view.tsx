import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TopBar } from "../top-bar"

interface AddProgrammeViewProps {
  onBack: () => void
  onSave?: (data: { programme: string; goal: string }) => void
}

export function AddProgrammeView({ onBack, onSave }: AddProgrammeViewProps) {
  const [formData, setFormData] = useState({
    programme: "",
    goal: "",
  })

  const handleSave = () => {
    onSave?.(formData)
    onBack()
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar />

      <div className="flex-1 overflow-y-auto bg-gray-50 p-8 pt-[80px]">
        <div className="mb-6 flex items-center text-sm text-gray-600">
          <span>Financial Programmes</span>
          <span className="mx-2">{">"}</span>
          <span className="font-medium text-gray-900">Add Programmes</span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="grid gap-4 border-b border-gray-100 p-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Programme</label>
              <Input
                value={formData.programme}
                onChange={(e) => setFormData((prev) => ({ ...prev, programme: e.target.value }))}
                placeholder="Enter programme"
                className="h-11 rounded-2xl border-[#D9E4F2] text-[#6B89B3] placeholder:text-[#88A3C6]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Goal</label>
              <Input
                value={formData.goal}
                onChange={(e) => setFormData((prev) => ({ ...prev, goal: e.target.value }))}
                placeholder="Enter goal"
                className="h-11 rounded-2xl border-[#D9E4F2] text-[#6B89B3] placeholder:text-[#88A3C6]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onBack}
              className="h-11 min-w-40 rounded-full bg-gray-100 text-gray-900 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="h-11 min-w-40 rounded-full bg-black text-white hover:bg-gray-800"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
