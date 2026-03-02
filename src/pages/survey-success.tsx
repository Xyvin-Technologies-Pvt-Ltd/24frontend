import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

type Language = 'en' | 'ml'

interface LocationState {
  userName?: string
  surveyName?: string
  surveyNameMl?: string
}

export default function SurveySuccessPage() {
  const location = useLocation()
  const [language, setLanguage] = useState<Language>('en')
  
  // Get data from location state
  const state = location.state as LocationState || {}
  const userName = state.userName || ''
  const surveyName = state.surveyName || 'the survey'
  const surveyNameMl = state.surveyNameMl || 'സർവേ'

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // const handleContinue = () => {
  //   // Navigate back or to home page
  //   window.history.back()
  // }

  const getSurveyName = () => {
    if (language === 'en') {
      return surveyName
    }
    return surveyNameMl || surveyName
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

      {/* Success Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="bg-white rounded-lg  p-8 max-w-md w-full text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
              <svg 
                className="w-16 h-16 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {language === 'en' 
              ? `Congratulations ${userName}!`.trim()
              : `അഭിനന്ദനങ്ങൾ ${userName}!`.trim()
            }
          </h2>
          <p className="text-gray-600 mb-8">
            {language === 'en' 
              ? `Your response to ${getSurveyName()} has been submitted`
              : `${getSurveyName()} എന്നതിലേക്കുള്ള നിങ്ങളുടെ പ്രതികരണം സമർപ്പിച്ചു`
            }
          </p>

          {/* Continue Button */}
          {/* <button
            onClick={handleContinue}
            className="w-full py-4 bg-red-600 text-white rounded-lg font-medium text-lg hover:bg-red-700 transition-colors"
          >
            {language === 'en' ? 'Continue' : 'തുടരുക'}
          </button> */}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>© 2024 24 Connect. {language === 'en' ? 'All rights reserved.' : 'എല്ലാ അവകാശങ്ങളും സംരക്ഷിതം.'}</p>
      </footer>
    </div>
  )
}
