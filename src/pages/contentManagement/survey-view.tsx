import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TopBar } from "@/components/custom/top-bar"
import { useSurvey, useSurveyResponses, useAllResponsesWithDetails } from "@/hooks/useSurveys"
import { Eye, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { ViewResponseModal } from "@/components/custom/contentManagment/view-response-modal"

export function SurveyViewPage() {
  const { surveyId } = useParams<{ surveyId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"responders" | "answers">("responders")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null)

  const { isLoading: surveyLoading } = useSurvey(surveyId || "")
  const { data: responsesData, isLoading: responsesLoading, error: responsesError } = useSurveyResponses(surveyId || "")
  const { data: detailedResponsesData, isLoading: detailedLoading } = useAllResponsesWithDetails(surveyId || "")

  // Extract responses from the API response structure
  // Backend returns: { status, message, data: [...] }
  const responses = responsesData?.data || []
  const detailedResponses = detailedResponsesData?.data || []

  console.log('Responses Data:', responsesData)
  console.log('Responses Array:', responses)
  console.log('Detailed Responses:', detailedResponses)

  const filteredResponses = responses.filter((response: any) =>
    response.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredResponses.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedResponses = filteredResponses.slice(startIndex, startIndex + rowsPerPage)

  const handleViewResponse = (responseId: string) => {
    setSelectedResponseId(responseId)
  }

  if (surveyLoading) {
    return (
      <div className="flex flex-col h-screen">
        <TopBar />
        <div className="flex-1 pt-[100px] flex items-center justify-center bg-gray-50">
          <div className="flex items-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading survey...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar />

      <div className="flex-1 pt-[100px] p-8 bg-gray-50 overflow-y-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <button
            onClick={() => navigate('/surveys')}
            className="hover:text-gray-900"
          >
            Content Management
          </button>
          <span className="mx-2">›</span>
          <button
            onClick={() => navigate('/surveys')}
            className="hover:text-gray-900"
          >
            Survey
          </button>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Responses</span>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-transparent border-b border-gray-200 rounded-none p-0 h-auto">
            <button
              onClick={() => setActiveTab("responders")}
              className={`px-0 py-3 mr-8 border-b-2 rounded-none bg-transparent ${
                activeTab === "responders"
                  ? "border-[#4EAEFF] text-[#4EAEFF]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Responders List
            </button>
            <button
              onClick={() => setActiveTab("answers")}
              className={`px-0 py-3 mr-8 border-b-2 rounded-none bg-transparent ${
                activeTab === "answers"
                  ? "border-[#4EAEFF] text-[#4EAEFF]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Survey Answers
            </button>
          </div>
        </div>

        {/* Responders List Tab */}
        {activeTab === "responders" && (
          <div className="bg-white rounded-2xl border border-gray-200">
            {/* Search Bar */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-end">
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search Responders"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-[#B3B3B3] focus:border-[#B3B3B3] rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Responders Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Name</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Questions</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Submitted On</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {responsesLoading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center">
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin mr-2" />
                          Loading responses...
                        </div>
                      </td>
                    </tr>
                  ) : responsesError ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-red-600">
                        Error loading responses. Please try again.
                      </td>
                    </tr>
                  ) : !Array.isArray(responses) || responses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        No responses found.
                      </td>
                    </tr>
                  ) : (
                    paginatedResponses.map((response: any, index: number) => {
                      // Debug log for each response
                      console.log('Response item:', response)
                      
                      return (
                        <tr
                          key={response.response_id || index}
                          className={`border-b border-gray-100 hover:bg-gray-50 ${
                            index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                          }`}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {response.image ? (
                                <img
                                  src={response.image}
                                  alt={response.name || 'User'}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-600 text-sm font-medium">
                                    {response.name ? response.name.charAt(0).toUpperCase() : 'A'}
                                  </span>
                                </div>
                              )}
                              <span className="text-gray-900 text-sm">{response.name || 'Anonymous'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap">
                            {response.answered || 0}/{response.total || 0}
                          </td>
                          <td className="py-4 px-6 text-gray-600 text-sm whitespace-nowrap">
                            {response.submitted_on || 'N/A'}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-8 w-8"
                              onClick={() => handleViewResponse(response.response_id)}
                            >
                              <Eye className="w-4 h-4 text-gray-400" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })
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
                  {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredResponses.length)} of {filteredResponses.length}
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
        )}

        {/* Survey Answers Tab */}
        {activeTab === "answers" && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <div className="space-y-8">
              {detailedLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading answers...
                </div>
              ) : responsesError ? (
                <div className="text-center py-12 text-red-600">
                  Error loading answers. Please try again.
                </div>
              ) : !Array.isArray(detailedResponses) || detailedResponses.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No responses yet.
                </div>
              ) : (
                detailedResponses.map((response: any) => {
                  const details = response.fullDetails
                  const answers = details?.answers || []
                  
                  return (
                    <div key={response.response_id} className="bg-gray-50 rounded-lg p-6 space-y-6">
                      {/* Display all question-answer pairs */}
                      {answers.map((answerItem: any, index: number) => (
                        <div key={index}>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            {answerItem.question || `Question ${index + 1}`}
                          </label>
                          <p className="text-sm text-gray-900">
                            {typeof answerItem.answer === 'object' 
                              ? JSON.stringify(answerItem.answer)
                              : answerItem.answer || 'No answer provided'}
                          </p>
                        </div>
                      ))}

                      {/* Submitted By Footer */}
                      <div className="pt-4 border-t border-gray-200">
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Submitted By
                        </label>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {response.image ? (
                              <img
                                src={response.image}
                                alt={response.name || 'User'}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-600 font-medium">
                                  {response.name ? response.name.charAt(0).toUpperCase() : 'A'}
                                </span>
                              </div>
                            )}
                            <p className="text-sm font-medium text-gray-900">{response.name || 'Anonymous'}</p>
                          </div>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span>📅</span>
                            {response.submitted_on || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* View Response Modal */}
      {selectedResponseId && (
        <ViewResponseModal
          responseId={selectedResponseId}
          onClose={() => setSelectedResponseId(null)}
        />
      )}
    </div>
  )
}
