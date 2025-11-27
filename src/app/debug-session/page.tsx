'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function DebugSessionPage() {
 const { data: session, status } = useSession();
 const [cookies, setCookies] = useState<string>('');
 const [localStorage, setLocalStorage] = useState<Record<string, string>>({});

 useEffect(() => {
 if (typeof window !== 'undefined') {
 setCookies(document.cookie);

 const storage: Record<string, string> = {};
 for (let i = 0; i < window.localStorage.length; i++) {
 const key = window.localStorage.key(i);
 if (key) {
 storage[key] = window.localStorage.getItem(key) || '';
 }
 }
 setLocalStorage(storage);
 }
 }, []);

 return (
 <div className="min-h-screen bg-gray-100 p-8">
 <div className="max-w-4xl mx-auto">
 <h1 className="text-3xl font-bold mb-6 text-gray-900">Session Debug Info</h1>

 <div className="bg-white rounded-lg p-6 mb-4 shadow">
 <h2 className="text-xl font-semibold mb-4 text-gray-900">Session Status</h2>
 <div className="space-y-2">
 <p><strong>Status:</strong> <span className={`px-2 py-1 rounded ${
 status === 'authenticated' ? 'bg-green-100 text-green-800' :
 status === 'unauthenticated' ? 'bg-red-100 text-red-800' :
 'bg-yellow-100 text-yellow-800'
 }`}>{status}</span></p>
 <p><strong>Has Session:</strong> {session ? '✅ Yes' : '❌ No'}</p>
 {session && (
 <>
 <p><strong>User:</strong> {session.user?.email}</p>
 <p><strong>Name:</strong> {session.user?.name}</p>
 <p><strong>Role:</strong> {(session.user as any)?.role}</p>
 </>
 )}
 </div>
 </div>

 <div className="bg-white rounded-lg p-6 mb-4 shadow">
 <h2 className="text-xl font-semibold mb-4 text-gray-900">Cookies</h2>
 <div className="bg-gray-100 p-4 rounded overflow-auto">
 <pre className="text-sm text-gray-800 whitespace-pre-wrap break-all">
 {cookies || 'No cookies found'}
 </pre>
 </div>
 </div>

 <div className="bg-white rounded-lg p-6 mb-4 shadow">
 <h2 className="text-xl font-semibold mb-4 text-gray-900">LocalStorage</h2>
 <div className="bg-gray-100 p-4 rounded overflow-auto">
 <pre className="text-sm text-gray-800">
 {Object.keys(localStorage).length > 0
 ? JSON.stringify(localStorage, null, 2)
 : 'No localStorage items found'}
 </pre>
 </div>
 </div>

 <div className="bg-white rounded-lg p-6 shadow">
 <h2 className="text-xl font-semibold mb-4 text-gray-900">Actions</h2>
 <div className="space-x-4">
 <a
 href="/logout"
 className="inline-block bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
 >
 Force Logout
 </a>
 <button
 onClick={() => window.location.reload()}
 className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
 >
 Refresh Page
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}
