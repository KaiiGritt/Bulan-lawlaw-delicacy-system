'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OTPSuccessModalProps {
  isOpen: boolean;
  onContinue: () => void;
}

export default function OTPSuccessModal({ isOpen, onContinue }: OTPSuccessModalProps) {
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowCheck(true), 300);
    } else {
      setShowCheck(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onContinue}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8
                border border-gray-200 dark:border-gray-700"
            >
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {/* Animated circles */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600
                      flex items-center justify-center shadow-lg"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                      className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center"
                    >
                      {/* Check icon with draw animation */}
                      {showCheck && (
                        <motion.svg
                          className="w-12 h-12 text-green-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      )}
                    </motion.div>
                  </motion.div>

                  {/* Confetti particles */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        x: Math.cos((i * Math.PI) / 4) * 60,
                        y: Math.sin((i * Math.PI) / 4) * 60,
                      }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className={`absolute w-2 h-2 rounded-full ${
                        i % 2 === 0 ? 'bg-yellow-400' : 'bg-green-400'
                      }`}
                      style={{
                        left: '50%',
                        top: '50%',
                        marginLeft: -4,
                        marginTop: -4,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-3"
              >
                Verification Successful!
              </motion.h2>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center text-gray-600 dark:text-gray-400 mb-8"
              >
                Your account has been successfully verified. You can now access all features.
              </motion.p>

              {/* Continue Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={onContinue}
                className="w-full py-3.5 px-6 text-white font-semibold bg-gradient-to-r from-green-500 to-green-600
                  hover:from-green-600 hover:to-green-700 rounded-xl shadow-lg hover:shadow-xl
                  transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2
                  focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Continue
              </motion.button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
