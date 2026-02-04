import { Input } from "@/components/ui/input"
import type { MultilingualField } from "@/types/campaign"

interface MultilingualInputProps {
  label: string
  value: MultilingualField
  onChange: (value: MultilingualField) => void
  placeholder?: {
    en: string
    ml: string
  }
  required?: boolean
  error?: string
  type?: "input" | "textarea"
  className?: string
}

export function MultilingualInput({
  label,
  value,
  onChange,
  placeholder = { en: "", ml: "" },
  required = false,
  error,
  type = "input",
  className = ""
}: MultilingualInputProps) {
  const handleChange = (lang: 'en' | 'ml', newValue: string) => {
    onChange({
      ...value,
      [lang]: newValue
    })
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="grid grid-cols-2 gap-4">
        {/* English Input */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            English {required && <span className="text-red-500">*</span>}
          </label>
          {type === "textarea" ? (
            <textarea
              value={value.en}
              onChange={(e) => handleChange('en', e.target.value)}
              placeholder={placeholder.en}
              className="w-full min-h-[100px] rounded-lg border border-gray-300 bg-white text-gray-900 text-sm p-3
                         focus:outline-none focus:ring-0 focus:border-gray-900 hover:border-gray-400
                         resize-vertical"
              rows={4}
            />
          ) : (
            <Input
              value={value.en}
              onChange={(e) => handleChange('en', e.target.value)}
              placeholder={placeholder.en}
              className="w-full h-12 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm px-3
                         focus:outline-none focus:ring-0 focus:border-gray-900 hover:border-gray-400"
            />
          )}
        </div>

        {/* Malayalam Input */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Malayalam {required && <span className="text-red-500">*</span>}
          </label>
          {type === "textarea" ? (
            <textarea
              value={value.ml}
              onChange={(e) => handleChange('ml', e.target.value)}
              placeholder={placeholder.ml}
              className="w-full min-h-[100px] rounded-lg border border-gray-300 bg-white text-gray-900 text-sm p-3
                         focus:outline-none focus:ring-0 focus:border-gray-900 hover:border-gray-400
                         resize-vertical"
              rows={4}
            />
          ) : (
            <Input
              value={value.ml}
              onChange={(e) => handleChange('ml', e.target.value)}
              placeholder={placeholder.ml}
              className="w-full h-12 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm px-3
                         focus:outline-none focus:ring-0 focus:border-gray-900 hover:border-gray-400"
            />
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}