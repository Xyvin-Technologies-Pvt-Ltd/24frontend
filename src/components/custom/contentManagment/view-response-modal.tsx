import { X, Loader2, Calendar } from "lucide-react"
import { useSingleResponse } from "@/hooks/useSurveys"

interface ViewResponseModalProps {
  responseId: string
  onClose: () => void
}

export function ViewResponseModal({ responseId, onClose }: ViewResponseModalProps) {
  const { data: responseData, isLoading } = useSingleResponse(responseId)

  const response = responseData?.data

  // Helper to get answer value
  const getAnswerValue = (answer: any): string => {
    if (typeof answer === 'string') return answer
    if (typeof answer === 'object' && answer !== null) {
      // Handle multilingual answers
      if (answer.en) return answer.en
      if (answer.ml) return answer.ml
      return JSON.stringify(answer)
    }
    return String(answer || 'No answer provided')
  }

  // Helper to get question label
  const getQuestionLabel = (question: any): string => {
    if (typeof question === 'string') return question
    if (typeof question === 'object' && question !== null) {
      if (question.en) return question.en
      if (question.ml) return question.ml
    }
    return 'Question'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">View responses</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading response...
            </div>
          ) : !response ? (
            <div className="text-center py-12 text-gray-500">
              Response not found
            </div>
          ) : (
            <div className="border-2 border-blue-400 rounded-lg p-8">
              <div className="space-y-8">
                {/* Display all answers */}
                {response.answers?.map((answerItem: any, index: number) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {getQuestionLabel(answerItem.question)}
                    </label>
                    <div className="text-base text-gray-900">
                      {getAnswerValue(answerItem.answer)}
                    </div>
                  </div>
                ))}

                {/* Submitted By */}
                <div className="pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Submitted By
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {response.submitted_by?.charAt(0)?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{response.submitted_by || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {response.submitted_on 
                          ? new Date(response.submitted_on).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
