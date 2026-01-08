import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AppLayout } from './components/custom/app-layout'
import { LoginPage } from './pages/auth/login'
import { queryClient } from './lib/queryClient'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App