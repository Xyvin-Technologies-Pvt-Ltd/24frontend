import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { MultilingualInput } from "@/components/ui/multilingual-input"
import { TopBar } from "@/components/custom/top-bar"
import { useCreateSurvey } from "@/hooks/useSurveys"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/toast"
import { Plus, Upload, Loader2, X, CheckCircle } from "lucide-react"
import { uploadService } from "@/services/uploadService"
import type { CreateSurveyData, SurveyQuestion, MultilingualField } from "@/types/survey"

interface AddSurveyFormProps {
  onBack: () => void
  onSave?: (data: any) => void
}

export function AddSurveyForm({ onBack, onSave }: AddSurveyFormProps) {
  const { toasts, removeToast, success, error: showError } = useToast()
  const createSurveyMutation = useCreateSurvey()

  const [formData, setFormData] = useState({
    survey_name: { en: "", ml: "" } as MultilingualField,
    description: { en: "", ml: "" } as MultilingualField,
    banner_image: "",
    bannerImageUploading: false,
    status: "active" as "active" | "closed"
  })

  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    {
      question_text: { en: "", ml: "" } as MultilingualField,
      answer_type: "text" as const,
      options: [],
      is_required: false,
      order: 0
    }
  ])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBannerUpload = async (file: File | null) => {
    if (!file) return

    try {
      setFormData(prev => ({ ...prev, bannerImageUploading: true }))
      const response = await uploadService.uploadFile(file, 'surveys')
      setFormData(prev => ({
        ...prev,
        banner_image: response.data.url,
        bannerImageUploading: false
      }))
    } catch (error) {
      console.error('Banner upload failed:', error)
      showError('Failed to upload banner image')
      setFormData(prev => ({ ...prev, bannerImageUploading: false }))
    }
  }

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    }
    
    // If changing to multiple_choice, initialize with 3 default options
    if (field === 'answer_type' && value === 'multiple_choice') {
      updatedQuestions[index].options = [
        { en: "", ml: "" },
        { en: "", ml: "" },
        { en: "", ml: "" }
      ]
    }
    // If changing away from multiple_choice, clear options
    else if (field === 'answer_type' && value !== 'multiple_choice') {
      updatedQuestions[index].options = []
    }
    
    setQuestions(updatedQuestions)
  }

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: { en: "", ml: "" } as MultilingualField,
        answer_type: "text",
        options: [],
        is_required: false,
        order: questions.length
      }
    ])
  }

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      const updatedQuestions = questions.filter((_, i) => i !== index)
      setQuestions(updatedQuestions)
    }
  }

  const handleAddOption = (questionIndex: number) => {
    const updatedQuestions = [...questions]
    const currentOptions = updatedQuestions[questionIndex].options || []
    updatedQuestions[questionIndex].options = [...currentOptions, { en: "", ml: "" }]
    setQuestions(updatedQuestions)
  }

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions]
    const currentOptions = updatedQuestions[questionIndex].options || []
    // Only allow removal if there are more than 1 option
    if (currentOptions.length > 1) {
      updatedQuestions[questionIndex].options = currentOptions.filter((_, i) => i !== optionIndex)
      setQuestions(updatedQuestions)
    }
  }

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: MultilingualField) => {
    const updatedQuestions = [...questions]
    const currentOptions = updatedQuestions[questionIndex].options || []
    currentOptions[optionIndex] = value
    updatedQuestions[questionIndex].options = currentOptions
    setQuestions(updatedQuestions)
  }

  const handleSubmit = async (status: "active" | "closed") => {
    try {
      // Validation
      if (!formData.survey_name.en) {
        showError('Please enter survey name in English')
        return
      }

      if (!formData.description.en) {
        showError('Please enter description in English')
        return
      }

      if (!formData.banner_image) {
        showError('Please upload a banner image')
        return
      }

      // Validate questions
      const hasValidQuestions = questions.every(q => {
        const questionText = typeof q.question_text === 'object' ? q.question_text.en : q.question_text
        if (!questionText) return false
        
        if (q.answer_type === 'multiple_choice') {
          return q.options && q.options.length > 0 && q.options.every(opt => {
            const optText = typeof opt === 'object' ? opt.en : opt
            return optText !== ''
          })
        }
        
        return true
      })

      if (!hasValidQuestions) {
        showError('Please complete all questions with valid data')
        return
      }

      const surveyData: CreateSurveyData = {
        survey_name: formData.survey_name,
        description: formData.description,
        banner_image: formData.banner_image,
        status,
        questions: questions.map((q, index) => ({
          ...q,
          order: index
        }))
      }

      await createSurveyMutation.mutateAsync(surveyData)
      success('Survey created successfully')
      
      if (onSave) {
        onSave(surveyData)
      }
    } catch (error: any) {
      showError(error.message || 'Failed to create survey')
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <TopBar />
      
      {/* Main Content */}
      <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-8">
          <button
            onClick={onBack}
            className="hover:text-gray-900"
          >
            Content Management
          </button>
          <span className="mx-2">›</span>
          <span>Survey</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Add Survey</span>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-8 width-full">
          <div className="space-y-6">
            {/* Survey Name */}
            <div>
              <MultilingualInput
                label="Survey Name"
                value={formData.survey_name}
                onChange={(value) => handleInputChange('survey_name', value)}
                placeholder={{ en: "Enter survey name in English", ml: "Enter survey name in Malayalam" }}
                required
              />
            </div>

            {/* Description */}
            <div>
              <MultilingualInput
                label="Description"
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                placeholder={{ en: "Add a brief overview of the survey in English...", ml: "Add a brief overview of the survey in Malayalam..." }}
                type="textarea"
              />
            </div>

            {/* Upload Survey Banner Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Survey Banner Image *
              </label>
              <p className="text-xs text-gray-500 mb-3">Image (JPG/PNG) - Recommended size: 16:9</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {formData.bannerImageUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                    <p className="text-sm text-gray-500">Uploading...</p>
                  </div>
                ) : formData.banner_image ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                    <p className="text-sm text-green-600 mb-2">Image uploaded successfully</p>
                    <img
                      src={formData.banner_image}
                      alt="Banner preview"
                      className="max-w-xs max-h-32 object-cover rounded mb-2"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, banner_image: "" }))}
                      className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">Upload file</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleBannerUpload(e.target.files?.[0] || null)}
                      className="hidden"
                      id="banner-upload"
                    />
                    <label
                      htmlFor="banner-upload"
                      className="cursor-pointer text-blue-500 hover:text-blue-600"
                    >
                      Choose file
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Questions Section - Multiple Cards */}
            {questions.map((question, questionIndex) => (
              <div key={questionIndex} className="bg-gray-50 rounded-lg p-6 space-y-4">
                {/* Question Header with Remove Button */}
                <div className="flex justify-between items-start">
                  <label className="block text-sm font-medium text-gray-700">
                    Question {questionIndex + 1}
                  </label>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(questionIndex)}
                      className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>

                <MultilingualInput
                  label=""
                  placeholder={{ en: "Enter question in English", ml: "Enter question in Malayalam" }}
                  value={question.question_text as MultilingualField}
                  onChange={(value) => handleQuestionChange(questionIndex, 'question_text', value)}
                  type="textarea"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer type
                  </label>
                  <Select
                    value={question.answer_type}
                    onChange={(e) => handleQuestionChange(questionIndex, 'answer_type', e.target.value)}
                    className="w-full border-gray-300 rounded-lg"
                  >
                    <option value="">Select</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="textarea">Text Area</option>
                    <option value="text">Text Field</option>
                  </Select>
                </div>

                {/* Options for Multiple Choice */}
                {question.answer_type === 'multiple_choice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Options
                    </label>
                    <div className="space-y-3">
                      {(question.options || []).map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-start gap-2">
                          <div className="flex-1">
                            <MultilingualInput
                              label=""
                              placeholder={{ en: `Enter option ${optionIndex + 1}`, ml: `Enter option ${optionIndex + 1} (Mal)` }}
                              value={option as MultilingualField}
                              onChange={(value) => handleOptionChange(questionIndex, optionIndex, value)}
                            />
                          </div>
                          {(question.options?.length || 0) > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                              className="p-2 hover:bg-red-50 text-red-600 mt-1"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-start mt-4">
                      <Button
                        onClick={() => handleAddOption(questionIndex)}
                        className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 p-0"
                        variant="ghost"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                )}

                {/* Preview for Text Area */}
                {question.answer_type === 'textarea' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <textarea
                      disabled
                      placeholder="User will enter their answer here..."
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg resize-none text-gray-500"
                    />
                  </div>
                )}

                {/* Preview for Text Field */}
                {question.answer_type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <Input
                      disabled
                      placeholder="User will enter their answer here..."
                      className="w-full bg-gray-50 border-gray-200 text-gray-500"
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Add New Question Button */}
            <div className="flex justify-start">
              <Button
                onClick={handleAddQuestion}
                className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 p-0"
                variant="ghost"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                variant="outline"
                onClick={onBack}
                disabled={createSurveyMutation.isPending}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSubmit('active')}
                disabled={createSurveyMutation.isPending}
                className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-full"
              >
                {createSurveyMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
