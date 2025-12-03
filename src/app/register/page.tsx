'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface ModalProps {
 isOpen: boolean;
 type: 'success' | 'error';
 title: string;
 message: string;
 email?: string;
 onClose: () => void;
 onAction?: () => void;
 actionText?: string;
}

function Modal({ isOpen, type, title, message, email, onClose, onAction, actionText }: ModalProps) {
 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="absolute inset-0 bg-black/50 backdrop-blur-sm"
 onClick={onClose}
 />

 {/* Modal Content */}
 <motion.div
 initial={{ opacity: 0, scale: 0.9, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.9, y: 20 }}
 className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
 >
 {/* Icon */}
 <div className="flex justify-center mb-6">
 {type === 'success' ? (
 <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
 <EnvelopeIcon className="w-10 h-10 text-white" />
 </div>
 ) : (
 <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg">
 <XCircleIcon className="w-10 h-10 text-white" />
 </div>
 )}
 </div>

 {/* Title */}
 <h2 className={`text-2xl font-bold text-center mb-3 ${type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
 {title}
 </h2>

 {/* Message */}
 <p className="text-gray-600 text-center mb-2">{message}</p>

 {/* Email display */}
 {email && (
 <p className="text-center mb-6">
 <span className="font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{email}</span>
 </p>
 )}

 {/* Info box for success */}
 {type === 'success' && (
 <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
 <div className="flex items-start gap-3">
 <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
 <div className="text-sm text-green-700">
 <p className="font-medium mb-1">What's next?</p>
 <ul className="list-disc list-inside space-y-1 text-green-600">
 <li>Check your email inbox</li>
 <li>Look for spam folder if not found</li>
 <li>Enter the 6-digit code to verify</li>
 </ul>
 </div>
 </div>
 </div>
 )}

 {/* Action Button */}
 <button
 onClick={onAction || onClose}
 className={`w-full py-3.5 px-6 rounded-xl font-semibold shadow-lg transform hover:scale-[1.02] transition-all duration-200 ${
 type === 'success'
 ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
 : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
 }`}
 >
 {actionText || 'Continue'}
 </button>
 </motion.div>
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

 if (score <= 1) return { label: 'Weak', color: 'from-red-500 to-red-600', textColor: 'text-red-600', percent: 20 };
 if (score === 2) return { label: 'Fair', color: 'from-orange-500 to-orange-600', textColor: 'text-orange-600', percent: 40 };
 if (score === 3) return { label: 'Good', color: 'from-yellow-500 to-yellow-600', textColor: 'text-yellow-600', percent: 60 };
 if (score === 4) return { label: 'Strong', color: 'from-green-500 to-green-600', textColor: 'text-green-600', percent: 80 };
 return { label: 'Very Strong', color: 'from-green-600 to-emerald-600', textColor: 'text-green-700', percent: 100 };
}

export default function RegisterPage() {
 const [formData, setFormData] = useState({
 firstName: '',
 lastName: '',
 email: '',
 phoneNumber: '',
 password: '',
 confirmPassword: '',
 agreeToTerms: false,
 });
 const [isLoading, setIsLoading] = useState(false);
 const [modal, setModal] = useState<{
 isOpen: boolean;
 type: 'success' | 'error';
 title: string;
 message: string;
 email?: string;
 redirectTo?: string;
 } | null>(null);
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 const [passwordStrength, setPasswordStrength] = useState(getPasswordStrength(''));
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
 if (password.length < 8) return 'Password must be at least 8 characters long';
 if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
 if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
 if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
 if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character';
 return null;
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();

 const passwordError = validatePassword(formData.password);
 if (passwordError) {
 setModal({
 isOpen: true,
 type: 'error',
 title: 'Invalid Password',
 message: passwordError,
 });
 return;
 }

 if (formData.password !== formData.confirmPassword) {
 setModal({
 isOpen: true,
 type: 'error',
 title: 'Password Mismatch',
 message: 'The passwords you entered do not match. Please try again.',
 });
 return;
 }

 if (!formData.agreeToTerms) {
 setModal({
 isOpen: true,
 type: 'error',
 title: 'Terms Required',
 message: 'Please agree to the terms and conditions to continue.',
 });
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
 phoneNumber: formData.phoneNumber,
 password: formData.password,
 }),
 });

 const data = await response.json();

 if (response.ok) {
 // Show success modal
 setModal({
 isOpen: true,
 type: 'success',
 title: 'Check Your Email!',
 message: 'We\'ve sent a verification code to:',
 email: formData.email,
 redirectTo: data.redirectTo || `/verify-otp?email=${encodeURIComponent(formData.email)}`,
 });
 } else {
 setModal({
 isOpen: true,
 type: 'error',
 title: 'Registration Failed',
 message: data.error || 'Something went wrong. Please try again.',
 });
 }
 } catch {
 setModal({
 isOpen: true,
 type: 'error',
 title: 'Connection Error',
 message: 'Unable to connect to the server. Please check your internet connection and try again.',
 });
 } finally {
 setIsLoading(false);
 }
 };

 const handleModalAction = () => {
 if (modal?.type === 'success' && modal.redirectTo) {
 router.push(modal.redirectTo);
 } else {
 setModal(null);
 }
 };

 const passwordChecks = [
 { label: 'At least 8 characters', test: formData.password.length >= 8 },
 { label: 'One uppercase letter', test: /[A-Z]/.test(formData.password) },
 { label: 'One lowercase letter', test: /[a-z]/.test(formData.password) },
 { label: 'One number', test: /[0-9]/.test(formData.password) },
 { label: 'One special character', test: /[^A-Za-z0-9]/.test(formData.password) },
 ];

 return (
 <div className="min-h-screen bg-gradient-to-br from-accent-cream to-soft-green/20 flex items-center justify-center p-4">
 {/* Modal */}
 <AnimatePresence>
 {modal && (
 <Modal
 isOpen={modal.isOpen}
 type={modal.type}
 title={modal.title}
 message={modal.message}
 email={modal.email}
 onClose={() => setModal(null)}
 onAction={handleModalAction}
 actionText={modal.type === 'success' ? 'Continue to Verification' : 'Try Again'}
 />
 )}
 </AnimatePresence>

 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.3 }}
 className="w-full max-w-5xl"
 >
 <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
 <div className="grid md:grid-cols-2">
 {/* Left Side - Branding */}
 <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-primary-green via-leaf-green to-soft-green text-white">
 <motion.div
 initial={{ x: -20, opacity: 0 }}
 animate={{ x: 0, opacity: 1 }}
 transition={{ delay: 0.2 }}
 >
 <h1 className="text-5xl font-bold mb-6">Welcome to<br />Lawlaw Delights</h1>
 <p className="text-blue-100 text-lg mb-8">
 Discover the finest Filipino delicacies, handcrafted with love and tradition.
 </p>
 <div className="space-y-4">
 {['Premium Quality Products', 'Secure Payments', 'Fast Delivery'].map((feature, index) => (
 <motion.div
 key={feature}
 initial={{ x: -20, opacity: 0 }}
 animate={{ x: 0, opacity: 1 }}
 transition={{ delay: 0.3 + index * 0.1 }}
 className="flex items-center gap-3"
 >
 <CheckCircleIcon className="w-6 h-6 text-green-300" />
 <span>{feature}</span>
 </motion.div>
 ))}
 </div>
 </motion.div>
 </div>

 {/* Right Side - Form */}
 <div className="p-8 md:p-12">
 <div className="mb-8">
 <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
 <p className="text-gray-600">Join us and start your culinary journey</p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-5">
 {/* Name Fields */}
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 First Name
 </label>
 <input
 name="firstName"
 type="text"
 required
 value={formData.firstName}
 onChange={handleChange}
 className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all"
 placeholder="John"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Last Name
 </label>
 <input
 name="lastName"
 type="text"
 required
 value={formData.lastName}
 onChange={handleChange}
 className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all"
 placeholder="Doe"
 />
 </div>
 </div>

 {/* Email */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Email Address
 </label>
 <input
 name="email"
 type="email"
 required
 value={formData.email}
 onChange={handleChange}
 className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
 placeholder="john@example.com"
 />
 </div>

 {/* Phone Number */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Phone Number <span className="text-gray-400 font-normal">(optional)</span>
 </label>
 <input
 name="phoneNumber"
 type="tel"
 value={formData.phoneNumber}
 onChange={handleChange}
 className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all"
 placeholder="09123456789"
 />
 </div>

 {/* Password */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Password
 </label>
 <div className="relative">
 <input
 name="password"
 type={showPassword ? 'text' : 'password'}
 required
 value={formData.password}
 onChange={handleChange}
 className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all"
 placeholder="••••••••"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
 >
 {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
 </button>
 </div>

 {/* Password Strength & Requirements */}
 {formData.password && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 className="mt-3 space-y-3"
 >
 {/* Strength Bar */}
 <div>
 <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: `${passwordStrength.percent}%` }}
 className={`h-full bg-gradient-to-r ${passwordStrength.color}`}
 />
 </div>
 <p className={`text-xs font-semibold mt-1 ${passwordStrength.textColor}`}>
 {passwordStrength.label}
 </p>
 </div>

 {/* Requirements List */}
 <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded-lg p-3">
 {passwordChecks.map((check, index) => (
 <motion.div
 key={index}
 initial={{ opacity: 0, x: -10 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: index * 0.05 }}
 className="flex items-center gap-2"
 >
 {check.test ? (
 <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
 ) : (
 <XCircleIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
 )}
 <span className={`text-xs ${check.test ? 'text-green-600' : 'text-gray-500'}`}>
 {check.label}
 </span>
 </motion.div>
 ))}
 </div>
 </motion.div>
 )}
 </div>

 {/* Confirm Password */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Confirm Password
 </label>
 <div className="relative">
 <input
 name="confirmPassword"
 type={showConfirmPassword ? 'text' : 'password'}
 required
 value={formData.confirmPassword}
 onChange={handleChange}
 className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all"
 placeholder="••••••••"
 />
 <button
 type="button"
 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
 >
 {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
 </button>
 </div>
 </div>

 {/* Terms */}
 <div className="flex items-start gap-3">
 <input
 name="agreeToTerms"
 type="checkbox"
 checked={formData.agreeToTerms}
 onChange={handleChange}
 className="mt-1 w-4 h-4 text-primary-green border-gray-300 rounded focus:ring-primary-green"
 />
 <label className="text-sm text-gray-600">
 I agree to the{' '}
 <Link href="/terms" className="text-warm-orange hover:text-earth-brown font-medium">
 Terms and Conditions
 </Link>{' '}
 and{' '}
 <Link href="/privacy" className="text-warm-orange hover:text-earth-brown font-medium">
 Privacy Policy
 </Link>
 </label>
 </div>

 {/* Submit Button */}
 <button
 type="submit"
 disabled={isLoading}
 className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary-green to-banana-leaf hover:from-leaf-green hover:to-soft-green text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
 >
 {isLoading ? (
 <span className="flex items-center justify-center gap-2">
 <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
 </svg>
 Creating Account...
 </span>
 ) : (
 'Create Account'
 )}
 </button>

 {/* Login Link */}
 <p className="text-center text-sm text-gray-600">
 Already have an account?{' '}
 <Link href="/login" className="text-warm-orange hover:text-earth-brown font-semibold">
 Sign In
 </Link>
 </p>
 </form>
 </div>
 </div>
 </div>
 </motion.div>
 </div>
 );
}
