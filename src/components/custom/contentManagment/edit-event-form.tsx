import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { TopBar } from "@/components/custom/top-bar"
import { useUpdateEvent } from "@/hooks/useEvents"
import { useAssessmentByEvent } from "@/hooks/useAssessments"
import { uploadService } from "@/services/uploadService"
import type { Event, UpdateEventData, Speaker as SpeakerType, Coordinator as CoordinatorType } from "@/types/event"


interface FormSpeaker extends Omit<SpeakerType, 'image'> {
  id: string
  image?: File | null
  imageUrl: string
  imageUploading?: boolean
}

interface FormCoordinator extends Omit<CoordinatorType, 'image'> {
  id: string
  image?: File | null
  imageUrl: string
  imageUploading?: boolean
}

interface Choice {
  id: string
  label: string
  answer: string
}

interface Question {
  id: string
  question: string
  choices: Choice[]
  correctAnswerIndex: number | null
}

import { Plus, Upload, Loader2, X, CheckCircle } from "lucide-react"

interface EditEventFormProps {
  event: Event
  onBack: () => void
  onSave: () => void
}

export function EditEventForm({ event, onBack, onSave }: EditEventFormProps) {
  // For date-only inputs
const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return ""
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ""
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}` // ONLY YYYY-MM-DD
  } catch (error) {
    console.error('Error parsing date:', dateString, error)
    return ""
  }
}

  const [formData, setFormData] = useState({
    eventType: event.type || "",
    eventName: event.event_name || "",
    organisedBy: event.organiser_name || "",
    bannerImage: null as File | null,
    bannerImageUrl: event.banner_image || "",
    bannerImageUploading: false,
    description: event.description || "",
    startDate: formatDateForInput(event.event_start_date)  || "",
    endDate: formatDateForInput(event.event_end_date)  || "",
    displayFrom: formatDateForInput(event.poster_visibility_start_date)  || "",
    displayUntil: formatDateForInput(event.poster_visibility_end_date)  || "",
    locationLink: event.link || event.venue || "",
    status: event.status || "review",
    isAssessmentIncluded: event.is_assessment_included || false
  })

  // Initialize speakers and coordinators from existing event data
  const [speakers, setSpeakers] = useState<FormSpeaker[]>(
    event.speakers?.map((speaker, index) => ({
      id: `speaker-${index}`,
      name: speaker.name,
      designation: speaker.designation,
      image: null,
      imageUrl: speaker.image || "",
      imageUploading: false
    })) || [{ id: "speaker-0", name: "", designation: "", image: null, imageUrl: "", imageUploading: false }]
  )

  const [coordinators, setCoordinators] = useState<FormCoordinator[]>(
    event.coordinators?.map((coordinator, index) => ({
      id: `coordinator-${index}`,
      name: coordinator.name,
      designation: coordinator.designation,
      image: null,
      imageUrl: coordinator.image || "",
      imageUploading: false
    })) || [{ id: "coordinator-0", name: "", designation: "", image: null, imageUrl: "", imageUploading: false }]
  )
  
  // Assessment-related state
  const [questions, setQuestions] = useState<Question[]>([])
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
    passingScore: 1,
    durationMinutes: 1
  })
  
  const updateEventMutation = useUpdateEvent()
  const { data: assessmentData, isLoading: isAssessmentLoading } = useAssessmentByEvent(event._id)

  // Debug: Log event data to see the actual date formats
  useEffect(() => {
    console.log('Event data received:', event)
    console.log('Parsed dates:', {
      startDate: formatDateForInput(event.event_start_date),
      endDate: formatDateForInput(event.event_end_date),
      displayFrom: formatDateForInput(event.poster_visibility_start_date),
      displayUntil: formatDateForInput(event.poster_visibility_end_date)
    })
  }, [event])

  // Initialize assessment data when it's loaded
  useEffect(() => {
    if (assessmentData?.data && event.is_assessment_included) {
      // Transform assessment data to match form structure
      const transformedQuestions: Question[] = assessmentData.data.questions.map((q, index) => ({
        id: `question-${index}`,
        question: q.question,
        choices: q.options.map((option, optionIndex) => ({
          id: `choice-${index}-${optionIndex}`,
          label: `Choice ${String.fromCharCode(65 + optionIndex)}`,
          answer: option.text
        })),
        correctAnswerIndex: (assessmentData.data as any).correct_index || 0
      }))
      
      setQuestions(transformedQuestions)
      setCertificateTemplate(prev => ({
        ...prev,
        fileUrl: assessmentData.data.certificate_template
      }))
      setAssessmentSettings({
        passingScore: assessmentData.data.passing_score || 1,
        durationMinutes: assessmentData.data.duration_minutes || 1
      })
    }
  }, [assessmentData, event.is_assessment_included])

  const handleInputChange = (field: string, value: string | boolean) => {
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

  const addSpeaker = () => {
    const newSpeaker: FormSpeaker = {
      id: `speaker-${Date.now()}`,
      name: "",
      designation: "",
      image: null,
      imageUrl: "",
      imageUploading: false
    }
    setSpeakers(prev => [...prev, newSpeaker])
  }

  const updateSpeaker = async (id: string, field: keyof FormSpeaker, value: string | File | null) => {
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
    const newCoordinator: FormCoordinator = {
      id: `coordinator-${Date.now()}`,
      name: "",
      designation: "",
      image: null,
      imageUrl: "",
      imageUploading: false
    }
    setCoordinators(prev => [...prev, newCoordinator])
  }

  const updateCoordinator = async (id: string, field: keyof FormCoordinator, value: string | File | null) => {
    if (field === 'image' && value instanceof File) {
      try {
        setCoordinators(prev => prev.map(coordinator => 
          coordinator.id === id ? { ...coordinator, imageUploading: true } : coordinator
        ))
        
        const response = await uploadService.uploadFile(value, 'events/coordinators')
        
        setCoordinators(prev => prev.map(coordinator => 
          coordinator.id === id ? { 
            ...coordinator, 
            image: value,
            imageUrl: response.data.url,
            imageUploading: false 
          } : coordinator
        ))
      } catch (error) {
        console.error('Coordinator image upload failed:', error)
        setCoordinators(prev => prev.map(coordinator => 
          coordinator.id === id ? { ...coordinator, imageUploading: false } : coordinator
        ))
      }
    } else {
      setCoordinators(prev => prev.map(coordinator => 
        coordinator.id === id ? { ...coordinator, [field]: value } : coordinator
      ))
    }
  }

  // Assessment functions
  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      choices: [
        { id: `${Date.now()}-1`, label: "Choice A", answer: "" },
        { id: `${Date.now()}-2`, label: "Choice B", answer: "" },
        { id: `${Date.now()}-3`, label: "Choice C", answer: "" },
        { id: `${Date.now()}-4`, label: "Choice D", answer: "" }
      ],
      correctAnswerIndex: null
    }
    setQuestions(prev => [...prev, newQuestion])
  }

  const updateQuestion = (questionId: string, field: keyof Question, value: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ))
  }

  const updateChoice = (questionId: string, choiceId: string, value: string) => {
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
              answer: ""
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
      if (!formData.eventName || !formData.organisedBy || !formData.eventType) {
        alert('Please fill in all required fields (Event Name, Organised by, Event Type)')
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
        const hasEmptyQuestion = questions.some(q => !q.question.trim())
        if (hasEmptyQuestion) {
          alert('Please fill in all question fields')
          return
        }

        const hasEmptyChoices = questions.some(q => 
          q.choices.some(c => !c.answer.trim())
        )
        if (hasEmptyChoices) {
          alert('Please fill in all choice answers')
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

      const eventData: UpdateEventData = {
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
        status: formData.status as any,
        is_assessment_included: formData.isAssessmentIncluded,
        // Add assessment data if included
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
      }

      await updateEventMutation.mutateAsync({
        id: event._id,
        eventData
      })
      onSave()
    } catch (error) {
      console.error('Failed to update event:', error)
      alert('Failed to update event. Please try again.')
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
          <span className="text-gray-900">Edit Event</span>
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
                className="w-full border-gray-300 rounded-lg"
              >
                <option value="">Select</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </Select>
            </div>

            {/* Event Name and Organised by Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name *
                </label>
                <Input
                  placeholder="Enter event name"
                  value={formData.eventName}
                  onChange={(e) => handleInputChange("eventName", e.target.value)}
                  className="w-full border-gray-300 rounded-lg"
                />
              </div>
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
                Upload Event Banner Image
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
              
              {coordinators.map((coordinator) => (
                <div key={coordinator.id} className="mb-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Name</label>
                      <Input
                        placeholder="Enter Name"
                        value={coordinator.name}
                        onChange={(e) => updateCoordinator(coordinator.id, "name", e.target.value)}
                        className="w-full border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Designation</label>
                      <Input
                        placeholder="Enter Designation"
                        value={coordinator.designation}
                        onChange={(e) => updateCoordinator(coordinator.id, "designation", e.target.value)}
                        className="w-full border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-2">Upload Image</label>
                    <p className="text-xs text-gray-500 mb-3">Image (JPG/PNG) - Recommended size: 400x400px</p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {coordinator.imageUploading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-2" />
                          <p className="text-sm text-gray-500">Uploading...</p>
                        </div>
                      ) : coordinator.imageUrl ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
                          <p className="text-sm text-green-600 mb-2">Image uploaded</p>
                          <img 
                            src={coordinator.imageUrl} 
                            alt="Coordinator preview" 
                            className="w-16 h-16 object-cover rounded-full mb-2"
                          />
                          <button
                            type="button"
                            onClick={() => setCoordinators(prev => prev.map(c => 
                              c.id === coordinator.id ? { ...c, image: null, imageUrl: "" } : c
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
                            onChange={(e) => updateCoordinator(coordinator.id, "image", e.target.files?.[0] || null)}
                            className="hidden"
                            id={`coordinator-image-${coordinator.id}`}
                          />
                          <label
                            htmlFor={`coordinator-image-${coordinator.id}`}
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
              
              {/* Add Button for Coordinators */}
              <div className="flex justify-start mb-6">
                <Button
                  type="button"
                  onClick={addCoordinator}
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 p-0"
                  variant="ghost"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                placeholder="Enter event description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full border-gray-300 rounded-lg p-3 h-32 resize-none"
              />
            </div>

            {/* Start and End Date Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
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
                  End Date
                </label>
                <Input
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="w-full border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Display From and Until Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display From
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
                  Display Until
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
                {formData.eventType === 'Online' ? 'Meeting Link' : 'Venue'}
              </label>
              <Input
                placeholder={formData.eventType === 'Online' ? 'Enter meeting link' : 'Enter venue address'}
                value={formData.locationLink}
                onChange={(e) => handleInputChange("locationLink", e.target.value)}
                className="w-full border-gray-300 rounded-lg"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full border-gray-300 rounded-lg"
              >
                <option value="review">Review</option>
                <option value="pending">Pending</option>
                <option value="upcomming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
                <option value="postponed">Postponed</option>
              </Select>
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
                
                {isAssessmentLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  </div>
                ) : (
                  <>
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
                        
                        <textarea
                          placeholder="Enter question"
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none"
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
                                <Input
                                  placeholder="Enter answers"
                                  value={choice.answer}
                                  onChange={(e) => updateChoice(question.id, choice.id, e.target.value)}
                                  className="w-full border-gray-300 rounded-lg"
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
                            passingScore: parseInt(e.target.value) || 1
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
                            durationMinutes: parseInt(e.target.value) || 1
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
                            <p className="text-xs text-gray-500 mb-2">
                              {certificateTemplate.file?.name}
                            </p>
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
                  </>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateEventMutation.isPending}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateEventMutation.isPending}
                className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-full"
              >
                {updateEventMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}