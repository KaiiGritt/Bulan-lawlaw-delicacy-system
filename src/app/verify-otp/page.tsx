'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OTPInput from '../components/OTPInput';
import CountdownTimer from '../components/CountdownTimer';
import OTPSuccessModal from '../components/OTPSuccessModal';

export default function VerifyOTPPage() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const email = searchParams.get('email');

 const [otp, setOtp] = useState('');
 const [error, setError] = useState('');
 const [isVerifying, setIsVerifying] = useState(false);
 const [isResending, setIsResending] = useState(false);
 const [showSuccess, setShowSuccess] = useState(false);
 const [otpInputKey, setOtpInputKey] = useState(0);

 useEffect(() => {
 // Redirect if no email or already verified
 if (!email) {
 router.push('/login');
 return;
 }

 // Check if already verified
 const isVerified = localStorage.getItem(`otp_verified_${email}`);
 if (isVerified === 'true') {
 router.push('/');
 }
 }, [email, router]);

 const handleOTPComplete = async (otpCode: string) => {
 setError('');
 setIsVerifying(true);

 try {
 const response = await fetch('/api/auth/otp/verify', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email, code: otpCode }),
 });

 const data = await response.json();

 if (!response.ok) {
 setError(data.error || 'Invalid OTP. Please try again.');
 setOtpInputKey((prev) => prev + 1); // Reset OTP input
 return;
 }

 // Store verification status
 localStorage.setItem(`otp_verified_${email}`, 'true');
 sessionStorage.setItem('otp_verified', 'true');

 // Show success modal
 setShowSuccess(true);
 } catch (err) {
 setError('Failed to verify OTP. Please try again.');
 setOtpInputKey((prev) => prev + 1); // Reset OTP input
 } finally {
 setIsVerifying(false);
 }
 };

 const handleResendOTP = async () => {
 setError('');
 setIsResending(true);
 setOtpInputKey((prev) => prev + 1); // Reset OTP input

 try {
 const response = await fetch('/api/auth/otp/send', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email }),
 });

 const data = await response.json();

 if (!response.ok) {
 setError(data.error || 'Failed to resend OTP');
 return;
 }

 // Show success message briefly
 setError('');
 } catch (err) {
 setError('Failed to resend OTP. Please try again.');
 } finally {
 setIsResending(false);
 }
 };

 const handleSuccessModalContinue = () => {
 setShowSuccess(false);
 // After successful OTP verification, redirect to login
 router.push('/login');
 };

 if (!email) {
 return null;
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
 <div className="w-full max-w-md">
 {/* Card */}
 <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
 {/* Icon */}
 <div className="flex justify-center mb-6">
 <div className="w-20 h-20 bg-gradient-to-br from-leaf-green-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
 <svg
 className="w-10 h-10 text-white"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
 />
 </svg>
 </div>
 </div>

 {/* Title */}
 <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
 Verify Your Email
 </h1>

 <p className="text-center text-gray-600 mb-8">
 We've sent a verification code to
 <br />
 <span className="font-semibold text-gray-900">{email}</span>
 </p>

 {/* OTP Input */}
 <div className="mb-6">
 <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
 Enter 6-digit code
 </label>
 <OTPInput key={otpInputKey} length={6} onComplete={handleOTPComplete} error={error} />
 </div>

 {/* Loading State */}
 {isVerifying && (
 <div className="flex items-center justify-center gap-2 mb-6 text-blue-600">
 <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
 <circle
 className="opacity-25"
 cx="12"
 cy="12"
 r="10"
 stroke="currentColor"
 strokeWidth="4"
 />
 <path
 className="opacity-75"
 fill="currentColor"
 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
 />
 </svg>
 <span className="text-sm font-medium">Verifying...</span>
 </div>
 )}

 {/* Timer */}
 <div className="mb-6">
 <CountdownTimer initialSeconds={60} onResend={handleResendOTP} isResending={isResending} />
 </div>

 {/* Help Text */}
 <div className="text-center">
 <p className="text-sm text-gray-600">
 Didn't receive the code? Check your spam folder or click resend.
 </p>
 </div>

 {/* Back to Login */}
 <div className="mt-6 text-center">
 <button
 onClick={() => router.push('/login')}
 className="text-sm text-blue-600 hover:underline font-medium"
 >
 ← Back to Login
 </button>
 </div>
 </div>

 {/* Security Notice */}
 <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
 <div className="flex gap-3">
 <svg
 className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
 />
 </svg>
 <div>
 <h3 className="text-sm font-semibold text-yellow-800 mb-1">
 Security Notice
 </h3>
 <p className="text-xs text-yellow-700">
 Never share your OTP code with anyone. Our team will never ask for your verification code.
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Success Modal */}
 <OTPSuccessModal isOpen={showSuccess} onContinue={handleSuccessModalContinue} />
 </div>
 );
}
