import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { MultilingualInput } from "@/components/ui/multilingual-input"
import { TopBar } from "@/components/custom/top-bar"
import { useCreateEvent } from "@/hooks/useEvents"
import { uploadService } from "@/services/uploadService"
import { useAllUsers } from "@/hooks/useUsers"
import type { CreateEventData, MultilingualField } from "@/types/event"
import { Plus, Upload, Loader2, X, CheckCircle, ChevronDown } from "lucide-react"

interface Speaker {
  id: string
  name: string
  designation: string
  image?: File | null
  imageUrl?: string
  imageUploading?: boolean
}

interface Coordinator {
  id: string
  userId: string
  name: string
  designation: string
  imageUrl?: string
}

interface Attachment {
  id: string
  file?: File | null
  fileUrl?: string
  uploading?: boolean
}

interface Choice {
  id: string
  label: string
  answer: MultilingualField
}

interface Question {
  id: string
  question: MultilingualField
  choices: Choice[]
  correctAnswerIndex: number | null
}

interface AddEventFormProps {
  onBack: () => void
  onSave: (eventData: any) => void
}

export function AddEventForm({ onBack, onSave }: AddEventFormProps) {
  const [formData, setFormData] = useState({
    eventType: "",
    eventName: { en: "", ml: "" } as MultilingualField,
    organisedBy: "",
    bannerImage: null as File | null,
    bannerImageUrl: "",
    bannerImageUploading: false,
    description: { en: "", ml: "" } as MultilingualField,
    startDate: "",
    endDate: "",
    displayFrom: "",
    displayUntil: "",
    locationLink: "",
    isAssessmentIncluded: false
  })

  // Initialize with one default item for each section
  const [attachments, setAttachments] = useState<Attachment[]>([
    { id: "1", file: null, fileUrl: "", uploading: false }
  ])
  const [speakers, setSpeakers] = useState<Speaker[]>([
    { id: "1", name: "", designation: "", image: null, imageUrl: "", imageUploading: false }
  ])
  const [coordinators, setCoordinators] = useState<Coordinator[]>([
    { id: "1", userId: "", name: "", designation: "", imageUrl: "" }
  ])

  // Assessment-related state
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      question: { en: "", ml: "" },
      choices: [
        { id: "1", label: "Choice A", answer: { en: "", ml: "" } },
        { id: "2", label: "Choice B", answer: { en: "", ml: "" } },
        { id: "3", label: "Choice C", answer: { en: "", ml: "" } },
        { id: "4", label: "Choice D", answer: { en: "", ml: "" } }
      ],
      correctAnswerIndex: null
    }
  ])
  const [certificateTemplate, setCertificateTemplate] = useState<{
    file: File | null
    fileUrl: string
    uploading: boolean
  }>({
    file: null,
    fileUrl: "",
    uploading: false
  })

  // Assessment settings
  const [assessmentSettings, setAssessmentSettings] = useState({
    passingScore: 3,
    durationMinutes: 5
  })

  const createEventMutation = useCreateEvent()
  const { data: usersData } = useAllUsers()
  const users = usersData?.data?.filter(u => u.status === 'active') || []

  const handleInputChange = (field: string, value: string | boolean | File | null | MultilingualField) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBannerUpload = async (file: File | null) => {
    if (!file) return

    try {
      setFormData(prev => ({ ...prev, bannerImageUploading: true }))
      const response = await uploadService.uploadFile(file, 'events')
      setFormData(prev => ({
        ...prev,
        bannerImage: file,
        bannerImageUrl: response.data.url,
        bannerImageUploading: false
      }))
    } catch (error) {
      console.error('Banner upload failed:', error)
      setFormData(prev => ({ ...prev, bannerImageUploading: false }))
    }
  }

  const handleFileUpload = (field: string, file: File | null) => {
    if (field === 'bannerImage') {
      handleBannerUpload(file)
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: file
      }))
    }
  }

  const addAttachment = () => {
    const newAttachment: Attachment = {
      id: Date.now().toString(),
      file: null,
      fileUrl: "",
      uploading: false
    }
    setAttachments(prev => [...prev, newAttachment])
  }

  const updateAttachment = async (id: string, file: File | null) => {
    if (!file) return

    try {
      setAttachments(prev => prev.map(attachment =>
        attachment.id === id ? { ...attachment, uploading: true } : attachment
      ))

      const response = await uploadService.uploadFile(file, 'events/attachments')

      setAttachments(prev => prev.map(attachment =>
        attachment.id === id ? {
          ...attachment,
          file,
          fileUrl: response.data.url,
          uploading: false
        } : attachment
      ))
    } catch (error) {
      console.error('Attachment upload failed:', error)
      setAttachments(prev => prev.map(attachment =>
        attachment.id === id ? { ...attachment, uploading: false } : attachment
      ))
    }
  }

  const addSpeaker = () => {
    const newSpeaker: Speaker = {
      id: Date.now().toString(),
      name: "",
      designation: "",
      image: null,
      imageUrl: "",
      imageUploading: false
    }
    setSpeakers(prev => [...prev, newSpeaker])
  }

  const updateSpeaker = async (id: string, field: keyof Speaker, value: string | File | null) => {
    if (field === 'image' && value instanceof File) {
      try {
        setSpeakers(prev => prev.map(speaker =>
          speaker.id === id ? { ...speaker, imageUploading: true } : speaker
        ))

        const response = await uploadService.uploadFile(value, 'events/speakers')

        setSpeakers(prev => prev.map(speaker =>
          speaker.id === id ? {
            ...speaker,
            image: value,
            imageUrl: response.data.url,
            imageUploading: false
          } : speaker
        ))
      } catch (error) {
        console.error('Speaker image upload failed:', error)
        setSpeakers(prev => prev.map(speaker =>
          speaker.id === id ? { ...speaker, imageUploading: false } : speaker
        ))
      }
    } else {
      setSpeakers(prev => prev.map(speaker =>
        speaker.id === id ? { ...speaker, [field]: value } : speaker
      ))
    }
  }

  const addCoordinator = () => {
    const newCoordinator: Coordinator = {
      id: Date.now().toString(),
      userId: "",
      name: "",
      designation: "",
      imageUrl: ""
    }
    setCoordinators(prev => [...prev, newCoordinator])
  }

  const updateCoordinator = (id: string, userId: string) => {
    const selectedUser = users.find(u => u._id === userId)
    if (!selectedUser) return

    setCoordinators(prev => prev.map(coordinator =>
      coordinator.id === id ? {
        ...coordinator,
        userId,
        name: selectedUser.name,
        designation: selectedUser.profession || selectedUser.admin_role?.role_name || "Coordinator",
        imageUrl: selectedUser.image
      } : coordinator
    ))
  }

  // Assessment functions
  // Assessment functions
  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: { en: "", ml: "" },
      choices: [
        { id: `${Date.now()}-1`, label: "Choice A", answer: { en: "", ml: "" } },
        { id: `${Date.now()}-2`, label: "Choice B", answer: { en: "", ml: "" } },
        { id: `${Date.now()}-3`, label: "Choice C", answer: { en: "", ml: "" } },
        { id: `${Date.now()}-4`, label: "Choice D", answer: { en: "", ml: "" } }
      ],
      correctAnswerIndex: null
    }
    setQuestions(prev => [...prev, newQuestion])
  }

  const updateQuestion = (questionId: string, value: MultilingualField) => {
    setQuestions(prev => prev.map(q =>
      q.id === questionId ? { ...q, question: value } : q
    ))
  }

  const updateChoice = (questionId: string, choiceId: string, value: MultilingualField) => {
    setQuestions(prev => prev.map(q =>
      q.id === questionId ? {
        ...q,
        choices: q.choices.map(c =>
          c.id === choiceId ? { ...c, answer: value } : c
        )
      } : q
    ))
  }

  const setCorrectAnswer = (questionId: string, choiceIndex: number) => {
    setQuestions(prev => prev.map(q =>
      q.id === questionId ? { ...q, correctAnswerIndex: choiceIndex } : q
    ))
  }

  const addChoice = (questionId: string) => {
    const choiceLabels = ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const currentCount = q.choices.length
        const nextLabel = currentCount < 4
          ? String.fromCharCode(65 + currentCount) // A-D
          : choiceLabels[currentCount - 4] // E onwards

        return {
          ...q,
          choices: [
            ...q.choices,
            {
              id: `${Date.now()}-${currentCount}`,
              label: `Choice ${nextLabel}`,
              answer: { en: "", ml: "" }
            }
          ]
        }
      }
      return q
    }))
  }

  const removeQuestion = (questionId: string) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter(q => q.id !== questionId))
    }
  }

  const handleCertificateUpload = async (file: File | null) => {
    if (!file) return

    try {
      setCertificateTemplate(prev => ({ ...prev, uploading: true }))
      const response = await uploadService.uploadFile(file, 'events/certificates')
      setCertificateTemplate({
        file,
        fileUrl: response.data.url,
        uploading: false
      })
    } catch (error) {
      console.error('Certificate upload failed:', error)
      setCertificateTemplate(prev => ({ ...prev, uploading: false }))
    }
  }

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.eventName.en || !formData.organisedBy || !formData.eventType) {
        alert('Please fill in all required fields (Event Name, Organised by, Event Type)')
        return
      }

      if (!formData.bannerImageUrl) {
        alert('Please upload a banner image')
        return
      }

      if (!formData.startDate || !formData.endDate) {
        alert('Please select start and end dates')
        return
      }

      if (!formData.displayFrom || !formData.displayUntil) {
        alert('Please select display visibility dates')
        return
      }

      // Validate assessment if included
      if (formData.isAssessmentIncluded) {
        const hasEmptyQuestion = questions.some(q => !q.question.en.trim())
        if (hasEmptyQuestion) {
          alert('Please fill in all question fields (English)')
          return
        }

        const hasEmptyChoices = questions.some(q =>
          q.choices.some(c => !c.answer.en.trim())
        )
        if (hasEmptyChoices) {
          alert('Please fill in all choice answers (English)')
          return
        }

        const hasUnsetCorrectAnswers = questions.some(q =>
          q.correctAnswerIndex === null || q.correctAnswerIndex < 0
        )
        if (hasUnsetCorrectAnswers) {
          alert('Please select the correct answer for each question')
          return
        }

        if (!certificateTemplate.fileUrl) {
          alert('Please upload a certificate template')
          return
        }

        // Validate passing score doesn't exceed number of questions
        if (assessmentSettings.passingScore > questions.length) {
          alert(`Passing score cannot exceed number of questions (${questions.length})`)
          return
        }
      }

      // Transform form data to match API structure
      const eventData: CreateEventData = {
        event_name: formData.eventName,
        description: formData.description,
        type: formData.eventType as 'Online' | 'Offline',
        organiser_name: formData.organisedBy,
        banner_image: formData.bannerImageUrl,
        event_start_date: formData.startDate,
        event_end_date: formData.endDate,
        poster_visibility_start_date: formData.displayFrom,
        poster_visibility_end_date: formData.displayUntil,
        link: formData.eventType === 'Online' ? formData.locationLink : undefined,
        venue: formData.eventType === 'Offline' ? formData.locationLink : undefined,
        speakers: speakers.filter(s => s.name && s.designation).map(s => ({
          name: s.name,
          designation: s.designation,
          image: s.imageUrl || undefined
        })),
        coordinators: coordinators.filter(c => c.name && c.designation).map(c => ({
          name: c.name,
          designation: c.designation,
          image: c.imageUrl || undefined
        })),
        attachments: attachments.filter(a => a.fileUrl).map(a => a.fileUrl!),
        status: 'upcomming',
        is_assessment_included: formData.isAssessmentIncluded,
        // Add assessment data if included - explicitly construct without any potential extra fields
        ...(formData.isAssessmentIncluded && {
          assessment: {
            questions: questions.map(q => ({
              question: q.question,
              options: q.choices.map(c => ({ text: c.answer })),
              correct_index: q.correctAnswerIndex !== null ? q.correctAnswerIndex : 0
            })),
            certificate_template: certificateTemplate.fileUrl,
            passing_score: assessmentSettings.passingScore,
            duration_minutes: assessmentSettings.durationMinutes
          }
        })
      };

      // Remove any unwanted fields that might cause validation errors
      const cleanEventData = removeUnwantedFields(eventData, ['created_by']);

      await createEventMutation.mutateAsync(cleanEventData)
      onSave(cleanEventData)
    } catch (error) {
      console.error('Failed to create event:', error)
      alert('Failed to create event. Please try again.')
    }
  }

  const handleCancel = () => {
    onBack()
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar />

      {/* Main content with top padding to account for fixed header */}
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
          <span>Events</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Add Event</span>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-8 width-full">
          <div className="space-y-6">
            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </label>
              <Select
                value={formData.eventType}
                onChange={(e) => handleInputChange("eventType", e.target.value)}
                placeholder="Select"
                className="w-full border-gray-300 rounded-lg"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </Select>
            </div>

            {/* Event Name and Organised by Row */}
            <div className="grid grid-cols-1 gap-6">
              <MultilingualInput
                label="Event Name"
                value={formData.eventName}
                onChange={(value) => handleInputChange("eventName", value)}
                placeholder={{ en: "Enter event name in English", ml: "Enter event name in Malayalam" }}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organised by *
                </label>
                <Input
                  placeholder="Enter organiser name"
                  value={formData.organisedBy}
                  onChange={(e) => handleInputChange("organisedBy", e.target.value)}
                  className="w-full border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Upload Event Banner Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Event Banner Image *
              </label>
              <p className="text-xs text-gray-500 mb-3">Image (JPG/PNG) - Recommended size: 1200x600px</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {formData.bannerImageUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                    <p className="text-sm text-gray-500">Uploading...</p>
                  </div>
                ) : formData.bannerImageUrl ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                    <p className="text-sm text-green-600 mb-2">Image uploaded successfully</p>
                    <img
                      src={formData.bannerImageUrl}
                      alt="Banner preview"
                      className="max-w-xs max-h-32 object-cover rounded mb-2"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, bannerImageUrl: "", bannerImage: null }))}
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
                      onChange={(e) => handleFileUpload("bannerImage", e.target.files?.[0] || null)}
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

            {/* Description */}
            <div>
              <MultilingualInput
                label="Description"
                value={formData.description}
                onChange={(value) => handleInputChange("description", value)}
                placeholder={{ en: "Add a brief overview of the event in English...", ml: "Add a brief overview of the event in Malayalam..." }}
                type="textarea"
              />
            </div>

            {/* Start Date and End Date Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className="w-full border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="w-full border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Display From and Display Until Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display From *
                </label>
                <Input
                  type="date"
                  value={formData.displayFrom}
                  onChange={(e) => handleInputChange("displayFrom", e.target.value)}
                  className="w-full border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Until *
                </label>
                <Input
                  type="date"
                  value={formData.displayUntil}
                  onChange={(e) => handleInputChange("displayUntil", e.target.value)}
                  className="w-full border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Location/Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.eventType === 'Online' ? 'Meeting Link' : 'Venue/Location'}
              </label>
              <textarea
                placeholder={formData.eventType === 'Online' ? 'Enter meeting link' : 'Enter venue address'}
                value={formData.locationLink}
                onChange={(e) => handleInputChange("locationLink", e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none"
              />
            </div>

            {/* Upload Attachment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Attachment
              </label>
              <p className="text-xs text-gray-500 mb-3">Image (JPG/PNG) - Recommended size: 1200x600px</p>

              {attachments.map((attachment) => (
                <div key={attachment.id} className="mb-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {attachment.uploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                        <p className="text-sm text-gray-500">Uploading...</p>
                      </div>
                    ) : attachment.fileUrl ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                        <p className="text-sm text-green-600 mb-2">File uploaded successfully</p>
                        <p className="text-xs text-gray-500 mb-2">{attachment.file?.name}</p>
                        <button
                          type="button"
                          onClick={() => setAttachments(prev => prev.map(a =>
                            a.id === attachment.id ? { ...a, file: null, fileUrl: "" } : a
                          ))}
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
                          onChange={(e) => updateAttachment(attachment.id, e.target.files?.[0] || null)}
                          className="hidden"
                          id={`attachment-upload-${attachment.id}`}
                        />
                        <label
                          htmlFor={`attachment-upload-${attachment.id}`}
                          className="cursor-pointer text-blue-500 hover:text-blue-600"
                        >
                          Choose file
                        </label>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Button for Attachments */}
              <div className="flex justify-start mb-6">
                <Button
                  type="button"
                  onClick={addAttachment}
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 p-0"
                  variant="ghost"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
            </div>

            {/* Speakers Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Speakers</h3>

              {speakers.map((speaker) => (
                <div key={speaker.id} className="mb-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Name</label>
                      <Input
                        placeholder="Enter Name"
                        value={speaker.name}
                        onChange={(e) => updateSpeaker(speaker.id, "name", e.target.value)}
                        className="w-full border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Designation</label>
                      <Input
                        placeholder="Enter Designation"
                        value={speaker.designation}
                        onChange={(e) => updateSpeaker(speaker.id, "designation", e.target.value)}
                        className="w-full border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-2">Upload Image</label>
                    <p className="text-xs text-gray-500 mb-3">Image (JPG/PNG) - Recommended size: 400x400px</p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {speaker.imageUploading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-2" />
                          <p className="text-sm text-gray-500">Uploading...</p>
                        </div>
                      ) : speaker.imageUrl ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
                          <p className="text-sm text-green-600 mb-2">Image uploaded</p>
                          <img
                            src={speaker.imageUrl}
                            alt="Speaker preview"
                            className="w-16 h-16 object-cover rounded-full mb-2"
                          />
                          <button
                            type="button"
                            onClick={() => setSpeakers(prev => prev.map(s =>
                              s.id === speaker.id ? { ...s, image: null, imageUrl: "" } : s
                            ))}
                            className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Upload Image</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => updateSpeaker(speaker.id, "image", e.target.files?.[0] || null)}
                            className="hidden"
                            id={`speaker-image-${speaker.id}`}
                          />
                          <label
                            htmlFor={`speaker-image-${speaker.id}`}
                            className="cursor-pointer text-blue-500 hover:text-blue-600"
                          >
                            Choose file
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Button for Speakers */}
              <div className="flex justify-start mb-6">
                <Button
                  type="button"
                  onClick={addSpeaker}
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 p-0"
                  variant="ghost"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
            </div>

            {/* Coordinators Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Coordinators</h3>

              <div className="space-y-4 mb-6">
                {coordinators.filter(c => c.userId).map((coordinator) => (
                  <div key={coordinator.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    {coordinator.imageUrl ? (
                      <img
                        src={coordinator.imageUrl}
                        alt={coordinator.name}
                        className="w-12 h-12 object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 font-medium">
                          {coordinator.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{coordinator.name}</p>
                      <p className="text-xs text-gray-500">{coordinator.designation}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCoordinators(prev => prev.filter(c => c.id !== coordinator.id))}
                      className="ml-auto text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {coordinators.filter(c => !c.userId).map((coordinator) => (
                <div key={coordinator.id} className="mb-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="relative">
                      <label className="block text-sm text-gray-600 mb-2 font-medium">Select Coordinator</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            const currentOpen = (window as any).openDropdownId === coordinator.id;
                            (window as any).openDropdownId = currentOpen ? null : coordinator.id;
                            setCoordinators([...coordinators]); // Force re-render
                          }}
                          className="w-full h-12 px-4 flex items-center justify-between border border-gray-300 rounded-2xl shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all text-sm"
                        >
                          <span className="text-gray-400">Select</span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>

                        {(window as any).openDropdownId === coordinator.id && (
                          <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                            {users.length > 0 ? (
                              users.map((user) => (
                                <button
                                  key={user._id}
                                  type="button"
                                  onClick={() => {
                                    updateCoordinator(coordinator.id, user._id);
                                    (window as any).openDropdownId = null;
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex flex-col border-b border-gray-50 last:border-0 transition-colors"
                                >
                                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                                  <span className="text-xs text-gray-500">{user.email}</span>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-gray-500 italic">No active users found</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Button for Coordinators */}
              {coordinators.every(c => c.userId) && (
                <div className="flex justify-start mb-6">
                  <Button
                    type="button"
                    onClick={addCoordinator}
                    className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 p-0 transition-all hover:gap-2"
                    variant="ghost"
                  >
                    <Plus className="w-4 h-4" />
                    Add Coordinator
                  </Button>
                </div>
              )}
            </div>

            {/* Is Assessment Included */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="assessment"
                checked={formData.isAssessmentIncluded}
                onChange={(e) => handleInputChange("isAssessmentIncluded", e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="assessment" className="text-sm text-gray-700">
                Is Assessment Included
              </label>
            </div>

            {/* Assessment Fields - Conditionally Rendered */}
            {formData.isAssessmentIncluded && (
              <div className="space-y-6 border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900">Assessment Questions</h3>

                {questions.map((question, questionIndex) => (
                  <div key={question.id} className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <label className="block text-sm font-medium text-gray-700">
                        Question {questionIndex + 1}
                      </label>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(question.id)}
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
                      value={question.question}
                      onChange={(value) => updateQuestion(question.id, value)}
                      type="textarea"
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Choices
                      </label>

                      <div className="grid grid-cols-2 gap-4">
                        {question.choices.map((choice, choiceIndex) => (
                          <div key={choice.id}>
                            <div className="flex items-center gap-2 mb-2">
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                checked={question.correctAnswerIndex === choiceIndex}
                                onChange={() => setCorrectAnswer(question.id, choiceIndex)}
                                className="w-4 h-4 text-blue-600"
                              />
                              <label className="text-sm text-gray-600">
                                {choice.label}
                              </label>
                            </div>
                            <MultilingualInput
                              label=""
                              placeholder={{ en: "Enter answer", ml: "Enter answer (Mal)" }}
                              value={choice.answer}
                              onChange={(value) => updateChoice(question.id, choice.id, value)}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-start mt-4">
                        <Button
                          type="button"
                          onClick={() => addChoice(question.id)}
                          className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 p-0"
                          variant="ghost"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-start">
                  <Button
                    type="button"
                    onClick={addQuestion}
                    className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 p-0"
                    variant="ghost"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </Button>
                </div>

                {/* Assessment Settings */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passing Score
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={assessmentSettings.passingScore}
                      onChange={(e) => setAssessmentSettings(prev => ({
                        ...prev,
                        passingScore: parseInt(e.target.value) || 3
                      }))}
                      className="w-full border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum correct answers to pass</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={assessmentSettings.durationMinutes}
                      onChange={(e) => setAssessmentSettings(prev => ({
                        ...prev,
                        durationMinutes: parseInt(e.target.value) || 5
                      }))}
                      className="w-full border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Time limit for the assessment</p>
                  </div>
                </div>

                {/* Certificate Template Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Certificate Template *
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Image (JPG/PNG) - Recommended size: 1200x600px
                  </p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {certificateTemplate.uploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                        <p className="text-sm text-gray-500">Uploading...</p>
                      </div>
                    ) : certificateTemplate.fileUrl ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                        <p className="text-sm text-green-600 mb-2">Certificate uploaded successfully</p>
                        <p className="text-xs text-gray-500 mb-2">{certificateTemplate.file?.name}</p>
                        <button
                          type="button"
                          onClick={() => setCertificateTemplate({ file: null, fileUrl: "", uploading: false })}
                          className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-center mb-2">
                          <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 mb-2">Upload file</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCertificateUpload(e.target.files?.[0] || null)}
                          className="hidden"
                          id="certificate-upload"
                        />
                        <label
                          htmlFor="certificate-upload"
                          className="cursor-pointer text-blue-500 hover:text-blue-600"
                        >
                          Choose file
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={createEventMutation.isPending}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={createEventMutation.isPending}
                className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-full"
              >
                {createEventMutation.isPending ? (
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

// Helper function to remove unwanted fields recursively
function removeUnwantedFields(obj: any, unwantedKeys: string[]): any {
  if (Array.isArray(obj)) {
    return obj.map(item => removeUnwantedFields(item, unwantedKeys));
  } else if (obj !== null && typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (!unwantedKeys.includes(key)) {
        cleaned[key] = removeUnwantedFields(value, unwantedKeys);
      }
    }
    return cleaned;
  }
  return obj;
}
