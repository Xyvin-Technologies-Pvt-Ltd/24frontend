import  { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
// import { cn } from '@/lib/utils'

interface LoginPageProps {
  onLoginSuccess?: () => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async () => {
    if (!emailOrPhone.trim()) return
    
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    setShowPasswordModal(true)
  }

  const handleVerifyPassword = async () => {
    if (!password.trim()) return

    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    
    // On success, call the login success callback
    onLoginSuccess?.()
  }

  const handleForgotPassword = () => {
    // Reset password and close modal
    setPassword('')
    setShowPasswordModal(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Login to your account
            </h1>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Email / Phone Number
              </label>
              <Input
                id="emailOrPhone"
                type="text"
                placeholder="Enter email / Phone Number"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full"
              />
            </div>

            <Button
              onClick={handleContinue}
              disabled={!emailOrPhone.trim() || isLoading}
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              {isLoading ? 'Loading...' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>

      {/* Password Verification Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        className="max-w-sm"
      >
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Enter Password
          </h2>

          <div className="mb-4">
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Please enter your password to continue
          </p>

          <Button
            onClick={handleVerifyPassword}
            disabled={!password.trim() || isLoading}
            className="w-full bg-black hover:bg-gray-800 text-white mb-4"
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-500">
              Forgot your password?{' '}
            </span>
            <button
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset Password
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}