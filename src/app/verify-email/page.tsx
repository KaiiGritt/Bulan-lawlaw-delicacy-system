'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const token = searchParams.get('token');
 const [verifying, setVerifying] = useState(true);
 const [verified, setVerified] = useState(false);
 const [error, setError] = useState('');

 useEffect(() => {
 if (!token) {
 setError('Invalid verification link');
 setVerifying(false);
 return;
 }

 const verifyEmail = async () => {
 try {
 const res = await fetch('/api/auth/verify-email', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ token }),
 });

 const data = await res.json();

 if (res.ok) {
 setVerified(true);
 toast.success('Email verified successfully!');
 } else {
 setError(data.error || 'Verification failed');
 }
 } catch (err) {
 setError('Network error. Please try again.');
 } finally {
 setVerifying(false);
 }
 };

 verifyEmail();
 }, [token]);

 if (verifying) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-green-50">
 <div className="text-center space-y-4">
 <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-green"></div>
 <p className="text-gray-600">Verifying your email...</p>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
 <div className="max-w-md w-full space-y-8">
 <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
 {verified ? (
 <>
 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
 </svg>
 </div>
 <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
 <p className="text-gray-600 mb-6">
 Your email has been successfully verified. You can now log in to your account.
 </p>
 <Link
 href="/login"
 className="w-full bg-primary-green text-white py-3 px-4 rounded-lg hover:bg-leaf-green transition-colors inline-block"
 >
 Go to Login
 </Link>
 </>
 ) : (
 <>
 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </div>
 <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
 <p className="text-gray-600 mb-6">
 {error || 'The verification link is invalid or has expired.'}
 </p>
 <div className="space-y-3">
 <Link
 href="/register"
 className="w-full bg-primary-green text-white py-3 px-4 rounded-lg hover:bg-leaf-green transition-colors inline-block"
 >
 Register Again
 </Link>
 <Link
 href="/login"
 className="w-full bg-gray-200 text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors inline-block"
 >
 Back to Login
 </Link>
 </div>
 </>
 )}
 </div>
 </div>
 </div>
 );
}
