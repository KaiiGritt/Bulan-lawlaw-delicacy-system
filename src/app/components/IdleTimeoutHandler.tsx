'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';

interface IdleTimeoutHandlerProps {
  timeoutMinutes?: number; // Default: 30 minutes
  warningMinutes?: number; // Warning before logout (default: 2 minutes)
}

export default function IdleTimeoutHandler({
  timeoutMinutes = 30,
  warningMinutes = 2
}: IdleTimeoutHandlerProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(warningMinutes * 60);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const TIMEOUT_MS = timeoutMinutes * 60 * 1000;
  const WARNING_MS = warningMinutes * 60 * 1000;

  const resetTimer = () => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    // Set warning timer
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(warningMinutes * 60);

      // Start countdown
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, TIMEOUT_MS - WARNING_MS);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, TIMEOUT_MS);
  };

  const handleLogout = async () => {
    // Clear all timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    setShowWarning(false);

    // Sign out and redirect
    await signOut({ redirect: false });
    router.push('/login?timeout=true');
  };

  const handleStayLoggedIn = () => {
    resetTimer();
  };

  useEffect(() => {
    // Only track if user is logged in
    if (status !== 'authenticated') return;

    // Activity events to track
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Throttle function to prevent too many resets
    let isThrottled = false;
    const throttleDelay = 1000; // 1 second

    const handleActivity = () => {
      if (!isThrottled) {
        isThrottled = true;
        resetTimer();
        setTimeout(() => {
          isThrottled = false;
        }, throttleDelay);
      }
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [status]);

  // Don't render anything if not logged in
  if (status !== 'authenticated') return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <Modal
      isOpen={showWarning}
      onClose={handleStayLoggedIn}
      title="Session Timeout Warning"
      size="md"
      showCloseButton={false}
    >
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            Your session is about to expire
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            You've been inactive for a while. You'll be logged out automatically in:
          </p>
        </div>

        <div className="bg-gray-100 rounded-lg p-4">
          <div className="text-3xl sm:text-4xl font-bold text-primary-green font-mono">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            minutes remaining
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={handleStayLoggedIn}
            className="flex-1 bg-primary-green text-white px-6 py-3 rounded-lg hover:bg-leaf-green transition-colors font-semibold text-sm sm:text-base shadow-md"
          >
            Stay Logged In
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm sm:text-base"
          >
            Logout Now
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Click anywhere or perform any action to stay logged in
        </p>
      </div>
    </Modal>
  );
}
