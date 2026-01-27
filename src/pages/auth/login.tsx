import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useAdminLogin } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useNavigate } from 'react-router-dom'

interface LoginPageProps {
  onLoginSuccess?: () => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const { success, error, info } = useToast()
  const navigate = useNavigate()

  const { mutate: adminLogin, isPending } = useAdminLogin()

  const handleContinue = () => {
    setPasswordError('')
    setShowPasswordModal(true)
  }

  const handleVerifyPassword = () => {
    setPasswordError('')
    adminLogin(
      { email: emailOrPhone, password },
      {
        onSuccess: (response) => {
          localStorage.setItem('authToken', response.data.token)
          localStorage.setItem('authUser', JSON.stringify(response.data.user))
          success('Success', response.message || 'Login successful')
          setShowPasswordModal(false)
          setPassword('')
          setEmailOrPhone('')
          onLoginSuccess?.()
          navigate('/dashboard')
        },
        onError: (err: any) => {
          const errorMessage = err?.response?.data?.message || err?.message || 'Invalid email or password'
          setPasswordError(errorMessage)
          error('Error', errorMessage)
        },
      }
    )
  }

  const handleForgotPassword = () => {
    setPassword('')
    setPasswordError('')
    setShowPasswordModal(false)

    info('Reset Password', 'Password reset functionality will be implemented soon')
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') action()
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
                onKeyPress={(e) => handleKeyPress(e, handleContinue)}
                className="w-full"
              />
            </div>

            <Button
              onClick={handleContinue}
              disabled={!emailOrPhone.trim()}
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>

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
              onKeyPress={(e) => handleKeyPress(e, handleVerifyPassword)}
              className="w-full"
              autoFocus
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-2">
                {passwordError}
              </p>
            )}
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Please enter your password to continue
          </p>

          <Button
            onClick={handleVerifyPassword}
            disabled={!password.trim() || isPending}
            className="w-full bg-black hover:bg-gray-800 text-white mb-4"
          >
            {isPending ? 'Verifying...' : 'Verify'}
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