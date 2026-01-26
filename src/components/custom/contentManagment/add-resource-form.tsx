import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { TopBar } from "@/components/custom/top-bar"
import { Loader2, Plus, Upload, X, CheckCircle } from "lucide-react"
import { useCreateResource, useUpdateResource } from "@/hooks/useResources"
import { uploadService } from "@/services/uploadService"

interface AddResourceFormProps {
  onBack: () => void
  onSave: (resourceData: any) => void
}

interface Attachment {
  id: string
  file?: File | null
  fileUrl?: string
  uploading?: boolean
}
export function AddResourceForm({ onBack, onSave, initialData }: AddResourceFormProps & { initialData?: any }) {
  const [formData, setFormData] = useState({
    contentName: "",
    category: "",
    content: ""
  })
  const [error, setError] = useState<string>("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [videoLinks, setVideoLinks] = useState<string[]>([])
  const [guidelineDescription, setGuidelineDescription] = useState<string>("")
  const [guidelineImages, setGuidelineImages] = useState<Attachment[]>([])

  const createResourceMutation = useCreateResource()
  const updateResourceMutation = useUpdateResource()

  //  Reset form when initialData changes
  useEffect(() => {
    setFormData({
      contentName: initialData?.content_name || "",
      category: initialData?.category || "",
      content: initialData?.content || ""
    })

    setAttachments(
      initialData?.attachments?.map((url: string, i: number) => ({
        id: `${Date.now()}-${i}`,
        fileUrl: url,
        uploading: false
      })) || []
    )

    setVideoLinks(initialData?.video_links || [])
    setGuidelineDescription(initialData?.guideline_description || "")
    setGuidelineImages(
      initialData?.guideline_images?.map((url: string, i: number) => ({
        id: `${Date.now()}-${i}`,
        fileUrl: url,
        uploading: false
      })) || []
    )
  }, [initialData])


  useEffect(() => {
    if (formData.category === "Documents") {
      if (attachments.length === 0) addAttachment()
      setVideoLinks([])
      setGuidelineDescription("")
      setGuidelineImages([])
    }

    if (formData.category === "Video") {
      if (videoLinks.length === 0 && initialData?.video_links?.length) {
        setVideoLinks(initialData.video_links)
      } else if (videoLinks.length === 0) {
        addVideoLink()
      }
      setAttachments([])
      setGuidelineDescription("")
      setGuidelineImages([])
    }

    if (formData.category === "Guidelines") {
      setAttachments([])
      setVideoLinks([])
    }
  }, [formData.category])


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (error) setError("")
  }
  const addAttachment = () => {
    setAttachments(prev => [
      ...prev,
      { id: Date.now().toString(), file: null, fileUrl: undefined, uploading: false }
    ])
  }

  const updateAttachment = async (id: string, file: File | null) => {
    if (!file) return

    try {
      setAttachments(prev =>
        prev.map(a => a.id === id ? { ...a, uploading: true } : a)
      )

      const response = await uploadService.uploadFile(file, "resources")

      setAttachments(prev =>
        prev.map(a =>
          a.id === id
            ? { ...a, file, fileUrl: response.data.url, uploading: false }
            : a
        )
      )
    } catch (err) {
      console.error("Upload failed:", err)
      setAttachments(prev =>
        prev.map(a => a.id === id ? { ...a, uploading: false } : a)
      )
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }
  const getFileNameFromUrl = (url: string) => {
    try {
      return url.split("/").pop() || "Uploaded";
    } catch {
      return "Uploaded";
    }
  };

  const addVideoLink = () => {
    setVideoLinks(prev => [...prev, ""])
  }

  const updateVideoLink = (index: number, value: string) => {
    setVideoLinks(prev => prev.map((v, i) => i === index ? value : v))
  }

  const removeVideoLink = (index: number) => {
    setVideoLinks(prev => prev.filter((_, i) => i !== index))
  }
  const addGuidelineImage = () => {
    setGuidelineImages(prev => [
      ...prev,
      { id: Date.now().toString(), file: null, fileUrl: undefined, uploading: false }
    ])
  }

  const updateGuidelineImage = async (id: string, file: File | null) => {
    if (!file) return

    try {
      setGuidelineImages(prev =>
        prev.map(a => a.id === id ? { ...a, uploading: true } : a)
      )

      const response = await uploadService.uploadFile(file, "resources")

      setGuidelineImages(prev =>
        prev.map(a =>
          a.id === id
            ? { ...a, file, fileUrl: response.data.url, uploading: false }
            : a
        )
      )
    } catch (err) {
      console.error("Guideline image upload failed:", err)
      setGuidelineImages(prev =>
        prev.map(a => a.id === id ? { ...a, uploading: false } : a)
      )
    }
  }

  const removeGuidelineImage = (id: string) => {
    setGuidelineImages(prev => prev.filter(a => a.id !== id))
  }

  const handleSave = async () => {
    try {
      setError("")

      const hasUploading =
        attachments.some(a => a.uploading) || guidelineImages.some(img => img.uploading)

      if (hasUploading) {
        setError("Please wait until all uploads finish")
        return
      }

      if (!formData.contentName.trim() || !formData.category || !formData.content.trim()) {
        setError("Please fill in all required fields")
        return
      }

      if (formData.category === "Documents" && attachments.length === 0) {
        setError("Please upload at least one document")
        return
      }

      if (formData.category === "Video" && videoLinks.filter(v => v.trim()).length === 0) {
        setError("Please add at least one video link")
        return
      }

      if (formData.category === "Guidelines" &&
        !guidelineDescription.trim() && guidelineImages.filter(i => i.fileUrl).length === 0) {
        setError("Please add text or upload at least one image for guidelines")
        return
      }
      const guidelineImageUrls = guidelineImages
        .filter(img => img.fileUrl)
        .map(img => img.fileUrl) as string[];

      // Transform data to match API expectations
      const resourceData = {
        content_name: formData.contentName.trim(),
        category: formData.category,
        content: formData.content.trim(),
        attachments:
          formData.category === "Documents"
            ? attachments.filter(a => a.fileUrl).map(a => a.fileUrl)
            : [],
        video_links:
          formData.category === "Video"
            ? videoLinks.filter(link => link.trim())
            : [],
        guideline_description: formData.category === "Guidelines" ? guidelineDescription.trim() : undefined,
        guideline_images:
          formData.category === "Guidelines" ? guidelineImageUrls : undefined,
      }

      if (initialData?._id) {
        // Update existing resource
        await updateResourceMutation.mutateAsync({ id: initialData._id, resourceData })
        console.log("Resource updated successfully!")
      } else {
        // Create new resource
        await createResourceMutation.mutateAsync(resourceData)

        console.log("Resource created successfully!")
      }
      onSave(resourceData)
    } catch (error: any) {
      console.error('Error saving resource:', error)
      setError(error.message || "Failed to save resource. Please try again.")
    }
  }

  const handleCancel = () => {
    onBack()
  }

  const isLoading =
    createResourceMutation.isPending || updateResourceMutation.isPending

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
          <span>Resources</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900">
            {initialData?._id ? "Edit Resource" : "Add Resource"}
          </span>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-8 w-full">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          <div className="space-y-8">
            {/* Content Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Content Name
              </label>
              <Input
                type="text"
                placeholder="Enter Content name"
                value={formData.contentName}
                onChange={(e) => handleInputChange("contentName", e.target.value)}
                className="w-full border-gray-300 rounded-lg h-12"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Category
              </label>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                placeholder="Select"
                className="w-full border-gray-300 rounded-lg h-12"
              >
                <option value="Documents">Documents</option>
                <option value="Video">Video</option>
                <option value="Guidelines">Guidelines</option>
              </Select>
            </div>
            {/* Upload Section */}
            {formData.category === "Documents" && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Upload Documents
                </label>
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4"
                  >
                    {attachment.uploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
                        <p className="text-sm text-gray-500">Uploading...</p>
                      </div>
                    ) : attachment.fileUrl ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
                        <p className="text-sm text-green-600 mb-2">
                          {attachment.file?.name || getFileNameFromUrl(attachment.fileUrl!)}
                        </p>
                        <a
                          href={attachment.fileUrl}
                          target="_blank"
                          className="text-blue-500 hover:text-blue-600 text-sm mb-2"
                        >
                          View
                        </a>
                        <button
                          type="button"
                          onClick={() => removeAttachment(attachment.id)}
                          className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                        >
                          <X className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-400 mb-2">
                          PDF, DOC, DOCX — Max 10MB
                        </p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          id={`upload-${attachment.id}`}
                          onChange={(e) =>
                            updateAttachment(
                              attachment.id,
                              e.target.files?.[0] || null
                            )
                          }
                        />
                        <label
                          htmlFor={`upload-${attachment.id}`}
                          className="cursor-pointer text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" /> Choose File
                        </label>
                        <button
                          type="button"
                          onClick={() => removeAttachment(attachment.id)}
                          className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1 mt-2"
                        >
                          <X className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={addAttachment}
                  variant="ghost"
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 p-0"
                >
                  <Plus className="w-4 h-4" /> Add Document
                </Button>
              </div>
            )}

            {/* Video Links */}
            {formData.category === "Video" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Video Links</label>

                {videoLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <Input
                      type="url"
                      placeholder="https://youtube.com/..."
                      value={link}
                      onChange={(e) => updateVideoLink(index, e.target.value)}
                      className="flex-1 h-12 rounded-lg"
                    />
                    <button type="button" onClick={() => removeVideoLink(index)} className="text-red-500 hover:text-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <Button type="button" onClick={addVideoLink} variant="ghost" className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 p-0">
                  <Plus className="w-4 h-4" /> Add Link
                </Button>
              </div>
            )}

            {/* === Guidelines Section === */}
            {formData.category === "Guidelines" && (
              <div className="space-y-6">
                {/* Description */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guideline Description
                  </label>
                  <textarea
                    value={guidelineDescription}
                    onChange={(e) => setGuidelineDescription(e.target.value)}
                    placeholder="Write guideline description here..."
                    className="w-full p-4 h-32 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Guideline Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Upload Guideline Images
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    JPG, PNG — Recommended size: 400x400px
                  </p>

                  {guidelineImages.map((img) => (
                    <div
                      key={img.id}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4"
                    >
                      {img.uploading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
                          <p className="text-sm text-gray-500">Uploading...</p>
                        </div>
                      ) : img.fileUrl ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
                          <img
                            src={img.fileUrl}
                            alt="Guideline"
                            className="w-32 h-32 object-cover mb-2 rounded"
                          />
                          <p className="text-sm text-green-600 mb-2">Uploaded</p>
                          <button
                            type="button"
                            onClick={() => removeGuidelineImage(img.id)}
                            className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                          >
                            <X className="w-4 h-4" /> Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-6 h-6 text-gray-400 mb-2" />
                          <p className="text-xs text-gray-400 mb-2">
                            JPG, PNG — Max 10MB
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id={`guideline-${img.id}`}
                            onChange={(e) => updateGuidelineImage(img.id, e.target.files?.[0] || null)}
                          />
                          <label
                            htmlFor={`guideline-${img.id}`}
                            className="cursor-pointer text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" /> Choose File
                          </label>
                          <button
                            type="button"
                            onClick={() => removeGuidelineImage(img.id)}
                            className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1 mt-2"
                          >
                            <X className="w-4 h-4" /> Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    onClick={addGuidelineImage}
                    variant="ghost"
                    className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 p-0"
                  >
                    <Plus className="w-4 h-4" /> Add Image
                  </Button>
                </div>
              </div>
            )}


            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Content
              </label>
              <textarea
                placeholder="Add Content resources"
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-4 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-8">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 rounded-full min-w-[120px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-full min-w-[120px] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}