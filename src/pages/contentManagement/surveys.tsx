import { useState, useMemo } from "react"
import { Routes, Route, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TopBar } from "@/components/custom/top-bar"
import { AddSurveyForm } from "@/components/custom/contentManagment/add-survey-form"
import { EditSurveyForm } from "@/components/custom/contentManagment/edit-survey-form"
import { SurveyViewPage } from "@/pages/contentManagement/survey-view"
import { ToastContainer } from "@/components/ui/toast"
import { useSurveys, useDeleteSurvey } from "@/hooks/useSurveys"
import { useToast } from "@/hooks/useToast"
import {
  Search,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Loader2,
  Edit,
  Trash2
} from "lucide-react"

// Helper function to handle localized strings
const getLocalizedText = (text: any): string => {
  if (typeof text === 'string') {
    return text
  }
  if (typeof text === 'object' && text !== null) {
    return text.en || text.ml || Object.values(text)[0] || 'N/A'
  }
  return text || 'N/A'
}

// Main surveys list component
function SurveysList() {
  const navigate = useNavigate()
  const { toasts, removeToast, error: showError, success: showSuccess } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("survey-list")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: ""
  })

  // TanStack Query for fetching surveys
  const queryParams = useMemo(() => ({
    page_no: currentPage,
    limit: rowsPerPage,
    search: searchTerm || undefined,
    status: filters.status || undefined,
  }), [currentPage, rowsPerPage, searchTerm, filters.status])

  const { data: surveysResponse, isLoading, error } = useSurveys(queryParams)
  const deleteSurveyMutation = useDeleteSurvey()

  const surveys = surveysResponse?.data || []
  const totalCount = surveysResponse?.total_count || 0

  const handleAddSurvey = () => {
    navigate('/surveys/add')
  }

  const handleViewSurvey = (id: string) => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      showError('Your session has expired. Please refresh the page to log in again.')
      return
    }
    navigate(`/surveys/view/${id}`)
  }

  const handleEditSurvey = (id: string) => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      showError('Your session has expired. Please refresh the page to log in again.')
      return
    }
    navigate(`/surveys/edit/${id}`)
  }

  const handleDeleteSurvey = async (id: string) => {
    try {
      await deleteSurveyMutation.mutateAsync(id)
      showSuccess('Survey deleted successfully')
      setDeleteConfirmId(null)
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Failed to delete survey')
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const resetFilters = () => {
    setFilters({
      status: ""
    })
    setCurrentPage(1)
  }

  const applyFilters = () => {
    setIsFilterOpen(false)
    setCurrentPage(1)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-600 hover:bg-green-200 text-xs px-3 py-1 rounded-full">Active</Badge>
      case "closed":
        return <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs px-3 py-1 rounded-full">Closed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const filteredSurveys = surveys.filter(survey => {
    const surveyName = getLocalizedText(survey.survey_name)
    const matchesSearch = surveyName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const totalPages = Math.ceil(totalCount / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage

  // Calculate stats
  const totalSurveysCreated = totalCount
  const activeSurveys = surveys.filter(s => s.status === 'active').length
  const totalResponses = surveys.reduce((sum, s) => sum + (s.responses_count || 0), 0)
  const responsesToday = 60 // This would come from API

  return (
    <div className="flex flex-col h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <TopBar />

      {/* Main content with top padding to account for fixed header */}
      <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
        {/* Breadcrumb and Add Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <span>Content Management</span>
            <span className="mx-2">›</span>
            <span className="text-gray-900">Surveys</span>
          </div>
          <Button
            className="bg-black rounded-full hover:bg-gray-800 text-white"
            onClick={handleAddSurvey}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Surveys
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-transparent border-b border-gray-200 rounded-none p-0 h-auto">
            <button
              onClick={() => setActiveTab("survey-list")}
              className={`px-0 py-3 mr-8 border-b-2 rounded-none bg-transparent ${
                activeTab === "survey-list"
                  ? "border-[#4EAEFF] text-[#4EAEFF]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Survey List
            </button>
          </div>

          {/* Survey List Tab Content */}
          {activeTab === "survey-list" && (
            <div className="mt-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-6 mb-6">
                <div className="bg-[#E6F1FD] rounded-2xl p-6 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Total Surveys Created</p>
                  <p className="text-3xl font-semibold text-gray-900">{totalSurveysCreated}</p>
                </div>
                <div className="bg-[#EDEEFC] rounded-2xl p-6 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Active Surveys</p>
                  <p className="text-3xl font-semibold text-gray-900">{activeSurveys}</p>
                </div>
                <div className="bg-[#E6F1FD] rounded-2xl p-6 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Total Responses</p>
                  <p className="text-3xl font-semibold text-gray-900">{totalResponses}</p>
                </div>
                <div className="bg-[#EDEEFC] rounded-2xl p-6 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Responses Today</p>
                  <p className="text-3xl font-semibold text-gray-900">{responsesToday}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200">
                {/* Search Bar */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-end">
                    <div className="relative w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search Surveys"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-[#B3B3B3] focus:border-[#B3B3B3] rounded-full"
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="ml-4 border-[#B3B3B3] hover:border-[#B3B3B3] rounded-lg"
                      onClick={() => setIsFilterOpen(true)}
                    >
                      <SlidersHorizontal className="w-4 h-4 text-[#B3B3B3]" />
                    </Button>
                  </div>
                </div>

                {/* Surveys Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white">
                      <tr>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Survey Name</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Created</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Time</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Created By</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Status</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Responses</th>
                        <th className="text-left py-4 px-3 font-medium text-gray-600 text-sm whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center">
                            <div className="flex items-center justify-center">
                              <Loader2 className="w-6 h-6 animate-spin mr-2" />
                              Loading surveys...
                            </div>
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-red-600">
                            Error loading surveys. Please try again.
                          </td>
                        </tr>
                      ) : filteredSurveys.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-500">
                            No surveys found.
                          </td>
                        </tr>
                      ) : (
                        filteredSurveys.map((survey, index) => (
                          <tr
                            key={survey._id}
                            className={`border-b border-gray-100 hover:bg-gray-50 ${
                              index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                            }`}
                          >
                            <td className="py-4 px-3">
                              <div className="text-gray-900 text-sm truncate max-w-[200px]" title={getLocalizedText(survey.survey_name)}>
                                {getLocalizedText(survey.survey_name)}
                              </div>
                            </td>
                            <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                              {formatDate(survey.createdAt)}
                            </td>
                            <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                              {formatTime(survey.createdAt)}
                            </td>
                            <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                              {survey.created_by?.name || 'N/A'}
                            </td>
                            <td className="py-4 px-3 whitespace-nowrap">
                              {getStatusBadge(survey.status)}
                            </td>
                            <td className="py-4 px-3 text-gray-600 text-sm whitespace-nowrap">
                              {survey.responses_count || 0}
                            </td>
                            <td className="py-4 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-8 w-8"
                                  onClick={() => handleViewSurvey(survey._id)}
                                >
                                  <Eye className="w-4 h-4 text-gray-400" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-8 w-8"
                                  onClick={() => handleEditSurvey(survey._id)}
                                >
                                  <Edit className="w-4 h-4 text-gray-400" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-8 w-8"
                                  onClick={() => setDeleteConfirmId(survey._id)}
                                  disabled={deleteSurveyMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Rows per page:</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => setRowsPerPage(Number(e.target.value))}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalCount)} of {totalCount}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-1 h-8 w-8"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1 h-8 w-8"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Survey</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this survey? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleteSurveyMutation.isPending}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteSurvey(deleteConfirmId)}
                disabled={deleteSurveyMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full"
              >
                {deleteSurveyMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-80 h-full shadow-lg rounded-l-2xl flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Sort by</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status === ""}
                        onChange={(e) => handleFilterChange("status", e.target.checked ? "" : filters.status)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">All</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status === "active"}
                        onChange={(e) => handleFilterChange("status", e.target.checked ? "active" : "")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status === "closed"}
                        onChange={(e) => handleFilterChange("status", e.target.checked ? "closed" : "")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Closed</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full"
                >
                  Reset
                </Button>
                <Button
                  onClick={applyFilters}
                  className="flex-1 bg-black hover:bg-gray-800 text-white rounded-full"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Placeholder components for routing
function AddSurveyPage() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/surveys')
  }

  const handleSave = (surveyData: any) => {
    console.log("New survey data:", surveyData)
    navigate('/surveys')
  }

  return <AddSurveyForm onBack={handleBack} onSave={handleSave} />
}

function EditSurveyPage() {
  const navigate = useNavigate()
  const { surveyId } = useParams<{ surveyId: string }>()

  const handleBack = () => {
    navigate('/surveys')
  }

  const handleSave = (surveyData: any) => {
    console.log("Updated survey data:", surveyData)
    navigate('/surveys')
  }

  if (!surveyId) {
    return (
      <div className="flex flex-col h-screen">
        <TopBar />
        <div className="flex-1 pt-[100px] p-8 bg-gray-50">
          <Button onClick={() => navigate('/surveys')}>Back to Surveys</Button>
          <h1 className="text-2xl mt-4">Survey ID not found</h1>
        </div>
      </div>
    )
  }

  return <EditSurveyForm surveyId={surveyId} onBack={handleBack} onSave={handleSave} />
}

function ViewSurveyPage() {
  return <SurveyViewPage />
}

// Main SurveysPage component with routing
export function SurveysPage() {
  return (
    <Routes>
      <Route path="/" element={<SurveysList />} />
      <Route path="/add" element={<AddSurveyPage />} />
      <Route path="/edit/:surveyId" element={<EditSurveyPage />} />
      <Route path="/view/:surveyId" element={<ViewSurveyPage />} />
    </Routes>
  )
}
