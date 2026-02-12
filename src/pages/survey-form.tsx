import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { surveyService } from '@/services/surveyService'
import type { Survey, SurveyQuestion, MultilingualField } from '@/types/survey'

/**
 * Survey Form Page - Handles both authenticated and public survey submissions
 * 
 * API Endpoints Used:
 * - GET /survey/mobile/:id - Fetch survey details (works for both authenticated and public)
 * - POST /survey/mobile/submit/:id - Submit survey for authenticated users (includes user_id)
 * - POST /public/survey/submit/:id - Submit survey for public/guest users (user_id is null)
 * 
 * The form automatically detects authentication status and uses the appropriate submission endpoint.
 */

type Language = 'en' | 'ml'

export default function SurveyFormPage() {
  const { id } = useParams<{ id: string }>()
  const [language, setLanguage] = useState<Language>('en')
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated by checking for token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    setIsAuthenticated(!!token)
    
    if (id) {
      fetchSurvey()
    }
  }, [id])

  const fetchSurvey = async () => {
    try {
      setLoading(true)
      setError(null)
      // Use mobile endpoint to fetch survey (works for both authenticated and public)
      const response = await surveyService.getSurveyById(id!)
      setSurvey(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load survey')
    } finally {
      setLoading(false)
    }
  }

  const getText = (field: MultilingualField | string): string => {
    if (typeof field === 'string') return field
    return field[language] || field.en
  }

  const handleInputChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const validateForm = (): boolean => {
    if (!survey) return false

    for (const question of survey.questions) {
      if (question.is_required && !answers[question._id!]) {
        alert(`Please answer: ${getText(question.question_text)}`)
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setSubmitting(true)
      
      const formattedAnswers = survey!.questions.map(q => ({
        question_id: q._id!,
        answer: answers[q._id!] || ''
      }))

      // Use appropriate endpoint based on authentication status
      if (isAuthenticated) {
        await surveyService.submitResponse(id!, { answers: formattedAnswers })
      } else {
        await surveyService.submitPublicResponse(id!, { answers: formattedAnswers })
      }

      // Clear the form fields
      setAnswers({})
      
      // Show success message
      alert(language === 'en' ? 'Survey submitted successfully!' : 'സർവേ വിജയകരമായി സമർപ്പിച്ചു!')
      
      // Scroll to top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit survey')
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = (question: SurveyQuestion) => {
    const questionId = question._id!

    switch (question.answer_type) {
      case 'text':
        return (
          <input
            type="text"
            value={answers[questionId] || ''}
            onChange={(e) => handleInputChange(questionId, e.target.value)}
            placeholder={language === 'en' ? 'Enter your answer' : 'നിങ്ങളുടെ ഉത്തരം നൽകുക'}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={question.is_required}
          />
        )

      case 'textarea':
        return (
          <textarea
            value={answers[questionId] || ''}
            onChange={(e) => handleInputChange(questionId, e.target.value)}
            placeholder={language === 'en' ? 'Enter your answer' : 'നിങ്ങളുടെ ഉത്തരം നൽകുക'}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            required={question.is_required}
          />
        )

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => {
              const optionText = getText(option)
              return (
                <label
                  key={index}
                  className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name={questionId}
                    value={optionText}
                    checked={answers[questionId] === optionText}
                    onChange={(e) => handleInputChange(questionId, e.target.value)}
                    className="w-5 h-5 text-blue-600"
                    required={question.is_required}
                  />
                  <span className="text-gray-700">{optionText}</span>
                </label>
              )
            })}
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language === 'en' ? 'Loading survey...' : 'സർവേ ലോഡ് ചെയ്യുന്നു...'}
          </p>
        </div>
      </div>
    )
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {language === 'en' ? 'Survey Not Found' : 'സർവേ കണ്ടെത്തിയില്ല'}
          </h2>
          <p className="text-gray-600">
            {error || (language === 'en' ? 'The survey you are looking for does not exist.' : 'നിങ്ങൾ തിരയുന്ന സർവേ നിലവിലില്ല.')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo and Language Toggle */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <img 
            src="/24_connect_logo.png" 
            alt="24 Connect Logo" 
            className="h-10 md:h-12 object-contain"
          />
          
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(prev => prev === 'en' ? 'ml' : 'en')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span>{language === 'en' ? 'മലയാളം' : 'English'}</span>
          </button>
        </div>
      </header>

      {/* Survey Form */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Banner Image */}
          {survey.banner_image && (
            <div className="w-full h-48 md:h-64 overflow-hidden">
              <img 
                src={survey.banner_image} 
                alt="Survey Banner" 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Survey Content */}
          <div className="p-6 md:p-8">
            {/* Title and Description */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                {getText(survey.survey_name)}
              </h1>
              {survey.description && (
                <p className="text-gray-600 text-sm md:text-base">
                  {getText(survey.description)}
                </p>
              )}
            </div>

            {/* Questions Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {survey.questions
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((question, index) => (
                  <div key={question._id} className="space-y-3">
                    <label className="block">
                      <span className="text-gray-800 font-medium text-sm md:text-base">
                        {index + 1}. {getText(question.question_text)}
                        {question.is_required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </span>
                    </label>
                    {renderQuestion(question)}
                  </div>
                ))}

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-black text-white rounded-lg font-medium text-base md:text-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting 
                    ? (language === 'en' ? 'Submitting...' : 'സമർപ്പിക്കുന്നു...') 
                    : (language === 'en' ? 'Submit' : 'സമർപ്പിക്കുക')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>© 2024 24 Connect. {language === 'en' ? 'All rights reserved.' : 'എല്ലാ അവകാശങ്ങളും സംരക്ഷിതം.'}</p>
      </footer>
    </div>
  )
}
