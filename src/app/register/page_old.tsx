'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface ToastProps {
 message: string;
 type: 'success' | 'error';
 onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
 useEffect(() => {
 const timer = setTimeout(onClose, 4000);
 return () => clearTimeout(timer);
 }, [onClose]);

 return (
 <div
 className={`fixed top-5 right-5 z-50 px-4 py-3 rounded shadow-lg text-white ${
 type === 'success' ? 'bg-green-500' : 'bg-red-500'
 } flex items-center justify-between min-w-[250px]`}
 >
 <span>{message}</span>
 <button onClick={onClose} className="ml-2 font-bold hover:text-gray-200">×</button>
 </div>
 );
}

function getPasswordStrength(password: string) {
 let score = 0;
 if (password.length >= 8) score++;
 if (/[A-Z]/.test(password)) score++;
 if (/[a-z]/.test(password)) score++;
 if (/[0-9]/.test(password)) score++;
 if (/[^A-Za-z0-9]/.test(password)) score++;

 if (score <= 1) return { label: 'Weak', color: 'bg-red-500', percent: 20 };
 if (score === 2) return { label: 'Fair', color: 'bg-orange-500', percent: 40 };
 if (score === 3) return { label: 'Good', color: 'bg-yellow-400', percent: 60 };
 if (score === 4) return { label: 'Strong', color: 'bg-green-400', percent: 80 };
 return { label: 'Very Strong', color: 'bg-green-600', percent: 100 };
}

export default function RegisterPage() {
 const [formData, setFormData] = useState({
 firstName: '',
 lastName: '',
 email: '',
 password: '',
 confirmPassword: '',
 agreeToTerms: false,
 });
 const [isLoading, setIsLoading] = useState(false);
 const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
 const [showPassword, setShowPassword] = useState(false);
 const [passwordStrength, setPasswordStrength] = useState(getPasswordStrength(''));
 const [otpSent, setOtpSent] = useState(false);
 const [otpCode, setOtpCode] = useState('');
 const router = useRouter();

 useEffect(() => {
 setPasswordStrength(getPasswordStrength(formData.password));
 }, [formData.password]);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const { name, value, type, checked } = e.target;
 setFormData(prev => ({
 ...prev,
 [name]: type === 'checkbox' ? checked : value,
 }));
 };

 const validatePassword = (password: string): string | null => {
 if (password.length < 8) {
 return 'Password must be at least 8 characters long';
 }
 if (!/[A-Z]/.test(password)) {
 return 'Password must contain at least one uppercase letter';
 }
 if (!/[a-z]/.test(password)) {
 return 'Password must contain at least one lowercase letter';
 }
 if (!/[0-9]/.test(password)) {
 return 'Password must contain at least one number';
 }
 if (!/[^A-Za-z0-9]/.test(password)) {
 return 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)';
 }
 return null;
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();

 // Validate password strength
 const passwordError = validatePassword(formData.password);
 if (passwordError) {
 setToast({ message: passwordError, type: 'error' });
 return;
 }

 if (formData.password !== formData.confirmPassword) {
 setToast({ message: 'Passwords do not match', type: 'error' });
 return;
 }
 if (!formData.agreeToTerms) {
 setToast({ message: 'Please agree to the terms and conditions', type: 'error' });
 return;
 }

 setIsLoading(true);

 try {
 const response = await fetch('/api/auth/register', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 firstName: formData.firstName,
 lastName: formData.lastName,
 email: formData.email,
 password: formData.password,
 }),
 });

 const data = await response.json();

 if (response.ok) {
 // Registration successful, OTP sent, redirect to OTP verification
 setToast({ message: 'Registration successful! Please check your email for OTP.', type: 'success' });

 // Redirect to OTP verification page
 setTimeout(() => {
 if (data.redirectTo) {
 router.push(data.redirectTo);
 } else {
 router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
 }
 }, 1500);
 } else {
 setToast({ message: data.error || 'Registration failed', type: 'error' });
 }
 } catch {
 setToast({ message: 'An error occurred. Please try again.', type: 'error' });
 } finally {
 setIsLoading(false);
 }
 };

 const handleSendOtp = async () => {
 try {
 const res = await fetch('/api/auth/send-otp', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email: formData.email, firstName: formData.firstName }),
 });
 if (res.ok) {
 setToast({ message: 'OTP sent to your email!', type: 'success' });
 setOtpSent(true);
 } else {
 const data = await res.json();
 setToast({ message: data.error || 'Failed to send OTP', type: 'error' });
 }
 } catch {
 setToast({ message: 'Error sending OTP', type: 'error' });
 }
 };

 const handleVerifyOtp = async () => {
 if (!otpCode) {
 setToast({ message: 'Please enter the OTP', type: 'error' });
 return;
 }
 try {
 const res = await fetch('/api/auth/verify-otp', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email: formData.email, otp: otpCode }),
 });
 if (res.ok) {
 setToast({ message: 'Email verified! Redirecting to login...', type: 'success' });
 setTimeout(() => router.push('/login'), 2000);
 } else {
 const data = await res.json();
 setToast({ message: data.error || 'Invalid OTP', type: 'error' });
 }
 } catch {
 setToast({ message: 'Error verifying OTP', type: 'error' });
 }
 };

 return (
 <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
 <div className="max-w-md w-full space-y-8">
 <div className="text-center fade-in-up">
 <div className="mx-auto h-20 w-20 bg-gradient-to-r from-primary-green to-banana-leaf rounded-2xl flex items-center justify-center mb-6 shadow-lg">
 <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
 </svg>
 </div>
 <h2 className="text-4xl font-bold text-primary-green mb-3">Join Lawlaw Delights</h2>
 <p className="text-gray-600 mb-4">Create your account to start your culinary journey</p>
 </div>

 <form className="space-y-6" onSubmit={handleSubmit}>
 {!otpSent && (
 <>
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <input name="firstName" type="text" placeholder="First Name" required value={formData.firstName} onChange={handleChange} className="appearance-none w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green" />
 <input name="lastName" type="text" placeholder="Last Name" required value={formData.lastName} onChange={handleChange} className="appearance-none w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green" />
 </div>
 <input name="email" type="email" placeholder="Email Address" required value={formData.email} onChange={handleChange} className="appearance-none w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green" />

 <div className="relative">
 <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" required value={formData.password} onChange={handleChange} className="appearance-none w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green" />
 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-700">
 {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
 </button>
 {formData.password && (
 <div className="mt-3 space-y-2">
 {/* Password Strength Bar */}
 <div>
 <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
 <div className={`${passwordStrength.color} h-2 rounded-full transition-all duration-300`} style={{ width: `${passwordStrength.percent}%` }}></div>
 </div>
 <p className={`text-sm font-medium mt-1 ${passwordStrength.color.replace('bg-', 'text-')}`}>{passwordStrength.label}</p>
 </div>

 {/* Password Requirements Checklist */}
 <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
 <p className="text-xs font-semibold text-gray-700 mb-2">Password must contain:</p>

 <div className={`flex items-center gap-2 text-xs ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
 <span className="flex-shrink-0">
 {formData.password.length >= 8 ? '✓' : '○'}
 </span>
 <span>At least 8 characters</span>
 </div>

 <div className={`flex items-center gap-2 text-xs ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
 <span className="flex-shrink-0">
 {/[A-Z]/.test(formData.password) ? '✓' : '○'}
 </span>
 <span>One uppercase letter (A-Z)</span>
 </div>

 <div className={`flex items-center gap-2 text-xs ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
 <span className="flex-shrink-0">
 {/[a-z]/.test(formData.password) ? '✓' : '○'}
 </span>
 <span>One lowercase letter (a-z)</span>
 </div>

 <div className={`flex items-center gap-2 text-xs ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
 <span className="flex-shrink-0">
 {/[0-9]/.test(formData.password) ? '✓' : '○'}
 </span>
 <span>One number (0-9)</span>
 </div>

 <div className={`flex items-center gap-2 text-xs ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
 <span className="flex-shrink-0">
 {/[^A-Za-z0-9]/.test(formData.password) ? '✓' : '○'}
 </span>
 <span>One special character (!@#$%^&*)</span>
 </div>
 </div>
 </div>
 )}
 </div>

 <div className="relative">
 <input name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Confirm Password" required value={formData.confirmPassword} onChange={handleChange} className="appearance-none w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green" />
 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-700">
 {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
 </button>
 </div>
 </div>

 <div className="flex items-start">
 <input name="agreeToTerms" type="checkbox" checked={formData.agreeToTerms} onChange={handleChange} className="h-4 w-4 text-primary-green border-gray-300 rounded mt-1" />
 <label className="ml-3 block text-sm text-gray-700">
 I agree to the{' '}
 <a href="#" className="text-primary-green hover:text-leaf-green font-medium">Terms and Conditions</a> and{' '}
 <a href="#" className="text-primary-green hover:text-leaf-green font-medium">Privacy Policy</a>
 </label>
 </div>

 <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-primary-green to-banana-leaf hover:from-leaf-green hover:to-primary-green disabled:opacity-50 transition-all duration-300 shadow-lg">
 {isLoading ? 'Creating Account...' : 'Create Account'}
 </button>
 </>
 )}

 {otpSent && (
 <>
 <input type="text" placeholder="Enter OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="w-full px-4 py-4 border rounded-xl mt-2" />
 <button type="button" onClick={handleVerifyOtp} className="w-full py-4 mt-2 bg-gradient-to-r from-primary-green to-banana-leaf text-white rounded-xl shadow-lg">Verify OTP</button>
 </>
 )}

 {!otpSent && (
 <p className="text-center text-sm text-gray-600">
 Already have an account? <Link href="/login" className="font-semibold text-primary-green hover:text-leaf-green">Sign in here</Link>
 </p>
 )}
 </form>

 {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
 </div>
 </div>
 );
}
