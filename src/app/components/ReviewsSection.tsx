'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { motion } from 'framer-motion';

interface ReviewsSectionProps {
 itemId: string;
 itemType: 'product' | 'recipe';
 itemName: string;
 productOwnerId?: string; // For seller reply functionality
}

interface Review {
 id: string;
 rating: number;
 content: string;
 createdAt: string;
 user: {
 id: string;
 name: string | null;
 profilePicture: string | null;
 };
}

export default function ReviewsSection({ itemId, itemType, itemName, productOwnerId }: ReviewsSectionProps) {
 const { data: session } = useSession();
 const [showReviewForm, setShowReviewForm] = useState(false);
 const [userReview, setUserReview] = useState<Review | null>(null);
 const [refreshKey, setRefreshKey] = useState(0);

 useEffect(() => {
 if (session) {
 fetchUserReview();
 }
 }, [session, itemId, refreshKey]);

 const fetchUserReview = async () => {
 try {
 const endpoint = itemType === 'product'
 ? `/api/products/${itemId}/reviews`
 : `/api/recipes/${itemId}/reviews`;

 const res = await fetch(endpoint);
 if (res.ok) {
 const reviews = await res.json();
 const myReview = reviews.find((r: Review) => r.user.id === session?.user?.id);
 setUserReview(myReview || null);
 }
 } catch (error) {
 console.error('Error fetching user review:', error);
 }
 };

 const handleReviewSuccess = () => {
 setRefreshKey(prev => prev + 1);
 setShowReviewForm(false);
 };

 const handleEditReview = (review: Review) => {
 setUserReview(review);
 setShowReviewForm(true);
 };

 return (
 <div className="space-y-4 sm:space-y-6 lg:space-y-8">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 >
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
 <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
 <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
 <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
 </svg>
 Reviews & Ratings
 </h2>

 {session && !showReviewForm && (
 <button
 onClick={() => setShowReviewForm(true)}
 className="w-full sm:w-auto bg-gradient-to-r from-primary-green to-banana-leaf hover:from-leaf-green hover:to-soft-green text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
 >
 <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
 </svg>
 <span className="hidden sm:inline">{userReview ? 'Edit Your Review' : 'Write a Review'}</span>
 <span className="sm:hidden">{userReview ? 'Edit Review' : 'Write Review'}</span>
 </button>
 )}
 </div>

 {/* Review Form */}
 {showReviewForm && (
 <div className="mb-4 sm:mb-6">
 <ReviewForm
 itemId={itemId}
 itemType={itemType}
 existingReview={userReview ? {
 rating: userReview.rating,
 content: userReview.content
 } : undefined}
 onSubmitSuccess={handleReviewSuccess}
 />
 <button
 onClick={() => setShowReviewForm(false)}
 className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 hover:text-gray-800"
 >
 Cancel
 </button>
 </div>
 )}

 {/* Reviews List */}
 <ReviewList
 key={refreshKey}
 itemId={itemId}
 itemType={itemType}
 currentUserId={session?.user?.id}
 productOwnerId={productOwnerId}
 onEditReview={handleEditReview}
 />
 </motion.div>
 </div>
 );
}
