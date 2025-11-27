'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AddToCartModalProps {
 isOpen: boolean;
 onClose: () => void;
 productName: string;
 productImage: string;
 quantity: number;
}

export default function AddToCartModal({
 isOpen,
 onClose,
 productName,
 productImage,
 quantity
}: AddToCartModalProps) {
 const router = useRouter();

 const handleViewCart = () => {
 router.push('/cart');
 onClose();
 };

 const handleContinueShopping = () => {
 onClose();
 };

 return (
 <AnimatePresence>
 {isOpen && (
 <>
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
 />

 {/* Modal */}
 <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
 <motion.div
 initial={{ opacity: 0, scale: 0.9, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.9, y: 20 }}
 transition={{ type: "spring", duration: 0.5 }}
 className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden pointer-events-auto"
 >
 {/* Header */}
 <div className="bg-gradient-to-r from-primary-green to-banana-leaf p-6 relative">
 <button
 onClick={onClose}
 className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1 transition-colors"
 >
 <XMarkIcon className="w-6 h-6" />
 </button>

 <div className="flex items-center gap-3">
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: 0.2, type: "spring" }}
 className="bg-white/20 backdrop-blur-sm rounded-full p-3"
 >
 <CheckCircleIcon className="w-8 h-8 text-white" />
 </motion.div>
 <div>
 <h3 className="text-2xl font-bold text-white">Success!</h3>
 <p className="text-green-100 text-sm">Added to your cart</p>
 </div>
 </div>
 </div>

 {/* Content */}
 <div className="p-6">
 {/* Product Info */}
 <div className="flex gap-4 bg-gray-50 rounded-xl p-4 mb-6">
 <img
 src={productImage || '/placeholder.png'}
 alt={productName}
 className="w-20 h-20 object-cover rounded-lg"
 />
 <div className="flex-1">
 <h4 className="font-semibold text-gray-900 line-clamp-2">
 {productName}
 </h4>
 <p className="text-sm text-gray-600 mt-1">
 Quantity: <span className="font-medium">{quantity}</span>
 </p>
 </div>
 </div>

 {/* Action Buttons */}
 <div className="space-y-3">
 <button
 onClick={handleViewCart}
 className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary-green to-banana-leaf hover:from-leaf-green hover:to-soft-green text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
 >
 <ShoppingCartIcon className="w-5 h-5" />
 View Cart
 </button>

 <button
 onClick={handleContinueShopping}
 className="w-full px-6 py-3.5 rounded-xl border-2 border-gray-300 hover:border-primary-green text-gray-700 font-semibold hover:bg-gray-50 transition-all"
 >
 Continue Shopping
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 </>
 )}
 </AnimatePresence>
 );
}
