'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Review {
 id: string;
 rating: number;
 content: string;
 sellerReply?: string | null;
 sellerReplyAt?: string | null;
 createdAt: string;
 user: {
 id: string;
 name: string | null;
 profilePicture: string | null;
 };
}

interface ReviewListProps {
 itemId: string;
 itemType: 'product' | 'recipe';
 currentUserId?: string;
 productOwnerId?: string; // Add product owner ID to check if current user is seller
 onEditReview?: (review: Review) => void;
}

export default function ReviewList({ itemId, itemType, currentUserId, productOwnerId, onEditReview }: ReviewListProps) {
 const [reviews, setReviews] = useState<Review[]>([]);
 const [loading, setLoading] = useState(true);
 const [stats, setStats] = useState({
 average: 0,
 total: 0,
 distribution: [0, 0, 0, 0, 0] // 1-5 stars
 });
 const [replyingTo, setReplyingTo] = useState<string | null>(null);
 const [replyText, setReplyText] = useState('');

 useEffect(() => {
 fetchReviews();
 }, [itemId]);

 const fetchReviews = async () => {
 try {
 const endpoint = itemType === 'product'
 ? `/api/products/${itemId}/reviews`
 : `/api/recipes/${itemId}/reviews`;

 const res = await fetch(endpoint);
 if (res.ok) {
 const data = await res.json();
 setReviews(data);
 calculateStats(data);
 }
 } catch (error) {
 console.error('Error fetching reviews:', error);
 } finally {
 setLoading(false);
 }
 };

 const calculateStats = (reviewData: Review[]) => {
 const total = reviewData.length;
 const distribution = [0, 0, 0, 0, 0];

 if (total === 0) {
 setStats({ average: 0, total: 0, distribution });
 return;
 }

 let sum = 0;
 reviewData.forEach((review) => {
 sum += review.rating;
 distribution[review.rating - 1]++;
 });

 const average = sum / total;
 setStats({ average, total, distribution });
 };

 const handleSellerReply = async (reviewId: string) => {
 if (!replyText.trim()) {
 toast.error('Please enter a reply');
 return;
 }

 try {
 const response = await fetch(`/api/products/${itemId}/reviews/${reviewId}/reply`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ reply: replyText }),
 });

 if (!response.ok) {
 const error = await response.json();
 throw new Error(error.error || 'Failed to post reply');
 }

 toast.success('Reply posted successfully!');
 setReplyingTo(null);
 setReplyText('');
 fetchReviews(); // Refresh reviews
 } catch (error: any) {
 toast.error(error.message || 'Failed to post reply');
 }
 };

 const handleDeleteReply = async (reviewId: string) => {
 if (!confirm('Are you sure you want to delete this reply?')) return;

 try {
 const response = await fetch(`/api/products/${itemId}/reviews/${reviewId}/reply`, {
 method: 'DELETE',
 });

 if (!response.ok) {
 throw new Error('Failed to delete reply');
 }

 toast.success('Reply deleted successfully!');
 fetchReviews(); // Refresh reviews
 } catch (error: any) {
 toast.error(error.message || 'Failed to delete reply');
 }
 };

 const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
 const sizeClasses = {
 sm: 'w-4 h-4',
 md: 'w-5 h-5',
 lg: 'w-6 h-6'
 };

 return (
 <div className="flex gap-1">
 {[1, 2, 3, 4, 5].map((star) => (
 <svg
 key={star}
 className={`${sizeClasses[size]} ${
 star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
 }`}
 fill={star <= rating ? 'currentColor' : 'none'}
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
 />
 </svg>
 ))}
 </div>
 );
 };

 if (loading) {
 return (
 <div className="space-y-3 sm:space-y-4">
 {[1, 2, 3].map((i) => (
 <div key={i} className="bg-gray-50 rounded-lg p-3 sm:p-4 animate-pulse">
 <div className="flex gap-3 sm:gap-4">
 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full"></div>
 <div className="flex-1 space-y-2">
 <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/4"></div>
 <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
 <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
 </div>
 </div>
 </div>
 ))}
 </div>
 );
 }

 return (
 <div className="space-y-4 sm:space-y-6">
 {/* Rating Summary */}
 {stats.total > 0 && (
 <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-yellow-200">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
 {/* Overall Rating */}
 <div className="text-center">
 <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">
 {stats.average.toFixed(1)}
 </div>
 <div className="flex justify-center mb-1 sm:mb-2">
 {renderStars(Math.round(stats.average), 'lg')}
 </div>
 <p className="text-xs sm:text-sm text-gray-600">
 Based on {stats.total} {stats.total === 1 ? 'review' : 'reviews'}
 </p>
 </div>

 {/* Rating Distribution */}
 <div className="space-y-1.5 sm:space-y-2">
 {[5, 4, 3, 2, 1].map((star) => {
 const count = stats.distribution[star - 1];
 const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
 return (
 <div key={star} className="flex items-center gap-2">
 <span className="text-xs sm:text-sm font-medium text-gray-700 w-6 sm:w-8">
 {star}★
 </span>
 <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2">
 <div
 className="bg-yellow-400 h-1.5 sm:h-2 rounded-full transition-all"
 style={{ width: `${percentage}%` }}
 ></div>
 </div>
 <span className="text-xs sm:text-sm text-gray-600 w-8 sm:w-12">
 {count}
 </span>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 )}

 {/* Reviews List */}
 <div className="space-y-3 sm:space-y-4">
 <h3 className="text-base sm:text-lg font-semibold text-gray-900">
 Customer Reviews ({stats.total})
 </h3>

 {reviews.length === 0 ? (
 <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
 <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
 </svg>
 <p className="text-sm sm:text-base text-gray-500">No reviews yet</p>
 <p className="text-xs sm:text-sm text-gray-400 mt-1">Be the first to review!</p>
 </div>
 ) : (
 reviews.map((review, index) => (
 <motion.div
 key={review.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05 }}
 className="bg-gray-50 rounded-lg p-3 sm:p-4 lg:p-6 border border-gray-200"
 >
 <div className="flex gap-3 sm:gap-4">
 {/* User Avatar */}
 <div className="flex-shrink-0">
 {review.user.profilePicture ? (
 <img
 src={review.user.profilePicture}
 alt={review.user.name || 'User'}
 className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
 />
 ) : (
 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-green to-leaf-green rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold">
 {review.user.name?.charAt(0).toUpperCase() || 'U'}
 </div>
 )}
 </div>

 {/* Review Content */}
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
 <div className="flex-1 min-w-0">
 <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
 {review.user.name || 'Anonymous User'}
 </h4>
 <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
 {renderStars(review.rating, 'sm')}
 <span className="text-[10px] sm:text-xs text-gray-500">
 {new Date(review.createdAt).toLocaleDateString()}
 </span>
 </div>
 </div>

 {currentUserId === review.user.id && (
 <button
 onClick={() => onEditReview?.(review)}
 className="text-xs sm:text-sm text-primary-green hover:text-leaf-green font-medium flex items-center gap-1 flex-shrink-0"
 >
 <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
 </svg>
 <span className="hidden sm:inline">Edit</span>
 </button>
 )}
 </div>

 <p className="text-xs sm:text-sm lg:text-base text-gray-700 whitespace-pre-wrap break-words">
 {review.content}
 </p>

 {/* Seller Reply Section */}
 {review.sellerReply && (
 <div className="mt-3 sm:mt-4 bg-primary-green/5 border-l-4 border-primary-green rounded-r-lg p-3 sm:p-4">
 <div className="flex items-start justify-between gap-2 mb-2">
 <div className="flex items-center gap-2">
 <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
 </svg>
 <span className="text-xs sm:text-sm font-semibold text-primary-green">
 Seller Response
 </span>
 </div>
 {currentUserId === productOwnerId && (
 <button
 onClick={() => handleDeleteReply(review.id)}
 className="text-xs text-red-600 hover:text-red-700"
 >
 Delete
 </button>
 )}
 </div>
 <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap break-words">
 {review.sellerReply}
 </p>
 {review.sellerReplyAt && (
 <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
 {new Date(review.sellerReplyAt).toLocaleDateString()}
 </p>
 )}
 </div>
 )}

 {/* Reply Button/Form for Seller */}
 {currentUserId === productOwnerId && !review.sellerReply && (
 <div className="mt-3 sm:mt-4">
 {replyingTo === review.id ? (
 <div className="space-y-2">
 <textarea
 value={replyText}
 onChange={(e) => setReplyText(e.target.value)}
 placeholder="Write your response..."
 className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-green focus:border-transparent"
 rows={3}
 />
 <div className="flex gap-2">
 <button
 onClick={() => handleSellerReply(review.id)}
 className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-green text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-leaf-green transition-colors"
 >
 Post Reply
 </button>
 <button
 onClick={() => {
 setReplyingTo(null);
 setReplyText('');
 }}
 className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-300 transition-colors"
 >
 Cancel
 </button>
 </div>
 </div>
 ) : (
 <button
 onClick={() => setReplyingTo(review.id)}
 className="text-xs sm:text-sm text-primary-green hover:text-leaf-green font-medium flex items-center gap-1"
 >
 <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
 </svg>
 Reply to review
 </button>
 )}
 </div>
 )}
 </div>
 </div>
 </motion.div>
 ))
 )}
 </div>
 </div>
 );
}
