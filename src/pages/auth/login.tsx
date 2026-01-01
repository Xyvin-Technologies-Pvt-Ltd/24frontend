import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/utils'

interface LoginPageProps {
  onLoginSuccess?: () => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otpValues, setOtpValues] = useState(['', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)

  const handleGetOtp = async () => {
    if (!emailOrPhone.trim()) return
    
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    setShowOtpModal(true)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit
    
    const newOtpValues = [...otpValues]
    newOtpValues[index] = value
    setOtpValues(newOtpValues)

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerifyOtp = async () => {
    const otp = otpValues.join('')
    if (otp.length !== 4) return

    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    
    // On success, call the login success callback
    onLoginSuccess?.()
  }

  const handleResendOtp = () => {
    // Reset OTP values and simulate resend
    setOtpValues(['', '', '', ''])
    // Focus first input
    setTimeout(() => {
      document.getElementById('otp-0')?.focus()
    }, 100)
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
              onClick={handleGetOtp}
              disabled={!emailOrPhone.trim() || isLoading}
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              {isLoading ? 'Sending...' : 'Get OTP'}
            </Button>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        className="max-w-sm"
      >
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            OTP Verification
          </h2>

          <div className="flex justify-center gap-3 mb-4">
            {otpValues.map((value, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={value}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className={cn(
                  "w-12 h-12 text-center text-lg font-medium border rounded-md",
                  "focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent",
                  "bg-gray-50 border-gray-300"
                )}
              />
            ))}
          </div>

          <p className="text-sm text-gray-500 mb-6">
            An OTP Has Been Sent!
          </p>

          <Button
            onClick={handleVerifyOtp}
            disabled={otpValues.join('').length !== 4 || isLoading}
            className="w-full bg-black hover:bg-gray-800 text-white mb-4"
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-500">
              Didn't Receive The OTP?{' '}
            </span>
            <button
              onClick={handleResendOtp}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Resend
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}