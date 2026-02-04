/**
 * Helper function to extract English text from multilingual fields
 * For admin panel tables, we only display English text
 */
export const getLocalizedText = (text: any): string => {
  if (typeof text === 'string') {
    return text
  }
  if (typeof text === 'object' && text !== null) {
    // For admin panel, prioritize English text
    return text.en || text.ml || Object.values(text)[0] || 'N/A'
  }
  return text || 'N/A'
}

/**
 * Helper function to create empty multilingual field
 */
export const createEmptyMultilingualField = () => ({
  en: "",
  ml: ""
})

/**
 * Helper function to safely get multilingual text for view components
 * Returns both languages for language toggle functionality
 */
export const getMultilingualText = (text: any): { en: string; ml: string } => {
  if (!text) return { en: 'N/A', ml: 'N/A' }
  
  if (typeof text === 'string') {
    return { en: text, ml: text }
  }
  
  if (typeof text === 'object' && text !== null) {
    return {
      en: text.en || 'N/A',
      ml: text.ml || 'N/A'
    }
  }
  
  return { en: 'N/A', ml: 'N/A' }
}