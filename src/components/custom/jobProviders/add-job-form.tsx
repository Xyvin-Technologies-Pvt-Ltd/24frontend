import { useEffect, useRef, useState } from "react"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Underline,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

interface AddJobFormProps {
  onBack: () => void
  onSave: (jobData: AddJobFormData) => Promise<void> | void
  isEdit?: boolean
  initialData?: Partial<AddJobFormData>
}

interface RichTextEditorProps {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export interface AddJobFormData {
  title: string
  email: string
  jobType: "full-time" | "part-time" | "contract" | "internship" | "temporary" | ""
  workMode: "remote" | "onsite" | "hybrid" | ""
  location: string
  salaryRange: string
  aboutRole: string
  responsibilities: string
  requirements: string
  skills: string[]
  benefits: string
}

const defaultFormData: AddJobFormData = {
  title: "",
  email: "",
  jobType: "",
  workMode: "",
  location: "",
  salaryRange: "",
  aboutRole: "",
  responsibilities: "",
  requirements: "",
  skills: [],
  benefits: "",
}

function RichTextEditor({
  label,
  placeholder,
  value,
  onChange,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!editorRef.current) {
      return
    }

    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const focusEditor = () => {
    editorRef.current?.focus()
  }

  const syncContent = () => {
    onChange(editorRef.current?.innerHTML ?? "")
  }

  const runCommand = (command: string, commandValue?: string) => {
    focusEditor()
    document.execCommand(command, false, commandValue)
    syncContent()
  }

  const handleToolbarAction = (
    event: React.MouseEvent<HTMLButtonElement>,
    command: string,
    commandValue?: string
  ) => {
    event.preventDefault()
    runCommand(command, commandValue)
  }

  const handleAddLink = () => {
    const url = window.prompt("Enter link URL")

    if (!url) {
      return
    }

    runCommand("createLink", url)
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#303030]">{label}</label>
      <div className="overflow-hidden rounded-2xl border border-[#E4ECF7] bg-white">
        <div className="flex items-center gap-1 border-b border-[#E4ECF7] px-3 py-2 text-gray-500">
          <select
            className="mr-2 bg-transparent text-sm outline-none"
            onMouseDown={(event) => event.preventDefault()}
            onChange={(event) => runCommand("formatBlock", event.target.value)}
            defaultValue="P"
          >
            <option value="P">Paragraph</option>
            <option value="H1">Heading 1</option>
            <option value="H2">Heading 2</option>
          </select>
          <div className="mx-1 h-4 w-px bg-gray-300"></div>
          <button type="button" className="rounded p-1 hover:bg-gray-100" onMouseDown={(event) => handleToolbarAction(event, "bold")}><Bold className="h-4 w-4" /></button>
          <button type="button" className="rounded p-1 hover:bg-gray-100" onMouseDown={(event) => handleToolbarAction(event, "italic")}><Italic className="h-4 w-4" /></button>
          <button type="button" className="rounded p-1 hover:bg-gray-100" onMouseDown={(event) => handleToolbarAction(event, "underline")}><Underline className="h-4 w-4" /></button>
          <div className="mx-1 h-4 w-px bg-gray-300"></div>
          <button type="button" className="rounded p-1 hover:bg-gray-100" onMouseDown={(event) => handleToolbarAction(event, "insertUnorderedList")}><List className="h-4 w-4" /></button>
          <button type="button" className="rounded p-1 hover:bg-gray-100" onMouseDown={(event) => handleToolbarAction(event, "insertOrderedList")}><ListOrdered className="h-4 w-4" /></button>
          <div className="mx-1 h-4 w-px bg-gray-300"></div>
          <button type="button" className="rounded p-1 hover:bg-gray-100" onMouseDown={(event) => handleToolbarAction(event, "justifyLeft")}><AlignLeft className="h-4 w-4" /></button>
          <button type="button" className="rounded p-1 hover:bg-gray-100" onMouseDown={(event) => handleToolbarAction(event, "justifyCenter")}><AlignCenter className="h-4 w-4" /></button>
          <button type="button" className="rounded p-1 hover:bg-gray-100" onMouseDown={(event) => handleToolbarAction(event, "justifyRight")}><AlignRight className="h-4 w-4" /></button>
          <button type="button" className="rounded p-1 hover:bg-gray-100" onMouseDown={(event) => handleToolbarAction(event, "justifyFull")}><AlignJustify className="h-4 w-4" /></button>
          <div className="mx-1 h-4 w-px bg-gray-300"></div>
          <button
            type="button"
            className="rounded p-1 hover:bg-gray-100"
            onMouseDown={(event) => {
              event.preventDefault()
              handleAddLink()
            }}
          >
            <Link2 className="h-4 w-4" />
          </button>
        </div>
        <div className="relative">
          {!value && (
            <span className="pointer-events-none absolute left-4 top-4 text-sm text-[#9EAFCC]">
              {placeholder}
            </span>
          )}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={syncContent}
            className="min-h-[120px] w-full p-4 text-sm outline-none"
          />
        </div>
      </div>
    </div>
  )
}

export function AddJobForm({
  onBack,
  onSave,
  isEdit = false,
  initialData,
}: AddJobFormProps) {
  const [formData, setFormData] = useState<AddJobFormData>({
    ...defaultFormData,
    ...initialData,
  })
  const [skillInput, setSkillInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setFormData({
      ...defaultFormData,
      ...initialData,
      skills: initialData?.skills ?? [],
    })
  }, [initialData])

  const handleFieldChange = (
    field: keyof AddJobFormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault()
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, skillInput.trim()],
        }))
      }
      setSkillInput("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await onSave(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto mb-8 w-full max-w-[800px] rounded-2xl bg-white p-8">
      <h2 className="mb-6 text-[22px] font-medium text-[#161616]">
        {isEdit ? "Edit Job" : "Add New Job"}
      </h2>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#303030]">Job Title</label>
          <Input
            placeholder="Enter Job Title (eg: UI/UX Designer)"
            value={formData.title}
            onChange={(event) => handleFieldChange("title", event.target.value)}
            className="h-12 rounded-2xl border-[#E4ECF7] px-4 text-sm placeholder:text-[#9EAFCC]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#303030]">Email Address</label>
          <Input
            type="email"
            placeholder="Enter mail address"
            value={formData.email}
            onChange={(event) => handleFieldChange("email", event.target.value)}
            className="h-12 rounded-2xl border-[#E4ECF7] px-4 text-sm placeholder:text-[#9EAFCC]"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#303030]">Job Type</label>
            <Select
              value={formData.jobType}
              onChange={(event) => handleFieldChange("jobType", event.target.value)}
              className="h-12 rounded-2xl border-[#E4ECF7] px-4 text-sm text-[#718EBF]"
            >
              <option value="">Select Job Type</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="temporary">Temporary</option>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#303030]">Work Mode</label>
            <Select
              value={formData.workMode}
              onChange={(event) => handleFieldChange("workMode", event.target.value)}
              className="h-12 rounded-2xl border-[#E4ECF7] px-4 text-sm text-[#718EBF]"
            >
              <option value="">Select Work Mode</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#303030]">Location</label>
          <Input
            placeholder="Enter Location (eg: Kochi, Kerala)"
            value={formData.location}
            onChange={(event) => handleFieldChange("location", event.target.value)}
            className="h-12 rounded-2xl border-[#E4ECF7] px-4 text-sm placeholder:text-[#9EAFCC]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#303030]">Salary Range</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
              INR
            </div>
            <Select
              value={formData.salaryRange}
              onChange={(event) => handleFieldChange("salaryRange", event.target.value)}
              className="h-12 rounded-2xl border-[#E4ECF7] bg-white pl-14 pr-4 text-sm text-[#718EBF]"
            >
              <option value="">eg: 25000 - 40000</option>
              <option value="10000-25000">10000 - 25000</option>
              <option value="25000-40000">25000 - 40000</option>
              <option value="40000-60000">40000 - 60000</option>
            </Select>
          </div>
        </div>

        <RichTextEditor
          label="About the role"
          placeholder="Write a description.."
          value={formData.aboutRole}
          onChange={(value) => handleFieldChange("aboutRole", value)}
        />
        <RichTextEditor
          label="Responsibilities"
          placeholder="Write a description.."
          value={formData.responsibilities}
          onChange={(value) => handleFieldChange("responsibilities", value)}
        />
        <RichTextEditor
          label="Requirements"
          placeholder="Write a description.."
          value={formData.requirements}
          onChange={(value) => handleFieldChange("requirements", value)}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-[#303030]">Skills</label>
          <div className="flex min-h-[48px] flex-wrap items-center gap-2 rounded-2xl border border-[#E4ECF7] bg-white px-4 py-2">
            {formData.skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1 rounded-full border border-[#D5E4FF] bg-[#F0F5FF] px-3 py-1 text-sm text-[#718EBF]"
              >
                {skill}
                <button type="button" onClick={() => removeSkill(skill)} className="hover:text-blue-800">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder={formData.skills.length === 0 ? "Add skills and press enter" : ""}
              className="min-w-[150px] flex-1 bg-transparent text-sm outline-none placeholder:text-[#9EAFCC]"
              value={skillInput}
              onChange={(event) => setSkillInput(event.target.value)}
              onKeyDown={handleAddSkill}
            />
          </div>
          <p className="mt-2 text-sm text-[#718EBF]">
            Example: Figma, UX research, Empathy mapping, UI Design
          </p>
        </div>

        <RichTextEditor
          label="Benefits"
          placeholder="Write a description.."
          value={formData.benefits}
          onChange={(value) => handleFieldChange("benefits", value)}
        />

        <div className="flex justify-end gap-4 pt-6 pb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="h-12 min-w-[160px] rounded-full border-none bg-[#F1F1F1] text-[#303030] hover:bg-[#E7E7E7]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-12 min-w-[160px] rounded-full bg-[#161616] text-white hover:bg-black"
          >
            {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Job"}
          </Button>
        </div>
      </div>
    </div>
  )
}
