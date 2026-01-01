import { useState } from 'react'
import { AppLayout } from './components/custom/app-layout'
import { LoginPage } from './pages/auth/login'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return <AppLayout />
}

export default App