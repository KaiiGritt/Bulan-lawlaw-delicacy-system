'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-cream to-soft-green/20 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-green hover:text-leaf-green mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-green to-leaf-green bg-clip-text text-transparent flex items-center gap-3">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Terms and Conditions
          </h1>
          <p className="text-gray-600 mt-2">Last Updated: December 1, 2025</p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-soft-green/20 space-y-8"
        >
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Lawlaw Delights. These Terms and Conditions govern your use of our website and services.
              By accessing or using our platform, you agree to be bound by these terms. If you do not agree with
              any part of these terms, please do not use our services.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Accounts</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p className="font-semibold text-gray-900">2.1 Account Registration</p>
              <p>You must create an account to access certain features. You agree to provide accurate, current, and complete information during registration.</p>

              <p className="font-semibold text-gray-900 mt-4">2.2 Account Security</p>
              <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>

              <p className="font-semibold text-gray-900 mt-4">2.3 Account Types</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Buyer Accounts:</strong> For customers purchasing products</li>
                <li><strong>Seller Accounts:</strong> For vendors selling delicacy products</li>
              </ul>
            </div>
          </section>

          {/* Product Listings */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Product Listings and Sales</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p className="font-semibold text-gray-900">3.1 Product Information</p>
              <p>We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant that product descriptions or other content is accurate, complete, or error-free.</p>

              <p className="font-semibold text-gray-900 mt-4">3.2 Pricing</p>
              <p>All prices are displayed in USD and are subject to change without notice. We reserve the right to correct pricing errors.</p>

              <p className="font-semibold text-gray-900 mt-4">3.3 Orders</p>
              <p>Placing an order constitutes an offer to purchase. We reserve the right to accept or decline any order for any reason.</p>
            </div>
          </section>

          {/* Seller Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Seller Responsibilities</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>Sellers using our platform agree to:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Provide accurate product information and images</li>
                <li>Comply with all applicable food safety regulations</li>
                <li>Process orders promptly and provide tracking information</li>
                <li>Handle customer inquiries and complaints professionally</li>
                <li>Maintain appropriate licenses and permits for food products</li>
                <li>Not sell prohibited, counterfeit, or illegal items</li>
              </ul>
            </div>
          </section>

          {/* Payment Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment Terms</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p className="font-semibold text-gray-900">5.1 Payment Methods</p>
              <p>We accept various payment methods including credit cards, debit cards, and cash on delivery where available.</p>

              <p className="font-semibold text-gray-900 mt-4">5.2 Payment Processing</p>
              <p>Payment is required at the time of order placement unless otherwise specified. Your payment information is processed securely.</p>

              <p className="font-semibold text-gray-900 mt-4">5.3 Refunds</p>
              <p>Refunds are subject to our refund policy and may take 5-10 business days to process.</p>
            </div>
          </section>

          {/* Shipping and Delivery */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Shipping and Delivery</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p className="font-semibold text-gray-900">6.1 Delivery Times</p>
              <p>Estimated delivery times are provided at checkout but are not guaranteed. Delays may occur due to circumstances beyond our control.</p>

              <p className="font-semibold text-gray-900 mt-4">6.2 Shipping Costs</p>
              <p>Shipping costs are calculated based on order weight, destination, and selected shipping method.</p>

              <p className="font-semibold text-gray-900 mt-4">6.3 Risk of Loss</p>
              <p>Risk of loss and title for products pass to you upon delivery to the carrier.</p>
            </div>
          </section>

          {/* Cancellations and Returns */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cancellations and Returns</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p className="font-semibold text-gray-900">7.1 Order Cancellation</p>
              <p>You may cancel orders that are in "pending" or "processing" status. Once shipped, orders cannot be cancelled.</p>

              <p className="font-semibold text-gray-900 mt-4">7.2 Returns</p>
              <p>Due to the nature of food products, returns are only accepted for damaged, defective, or incorrect items. Contact us within 48 hours of delivery for return requests.</p>
            </div>
          </section>

          {/* User Conduct */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. User Conduct</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Post false, misleading, or fraudulent content</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Interfere with the platform's operation or security</li>
                <li>Use automated systems to access the platform</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Intellectual Property</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>All content on Lawlaw Delights, including text, graphics, logos, images, and software, is the property of Lawlaw Delights or its licensors and is protected by copyright and trademark laws.</p>
              <p className="mt-3">You may not reproduce, distribute, modify, or create derivative works without our express written permission.</p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>To the maximum extent permitted by law, Lawlaw Delights shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.</p>
              <p className="mt-3">Our total liability shall not exceed the amount you paid for the specific product or service giving rise to the claim.</p>
            </div>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Disclaimers</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>Our services are provided "as is" and "as available" without warranties of any kind, either express or implied.</p>
              <p className="mt-3">We do not guarantee that our services will be uninterrupted, secure, or error-free.</p>
            </div>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Indemnification</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>You agree to indemnify and hold harmless Lawlaw Delights and its affiliates from any claims, damages, losses, liabilities, and expenses arising from your use of our services or violation of these terms.</p>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Dispute Resolution</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p className="font-semibold text-gray-900">13.1 Communication</p>
              <p>We encourage you to contact us first to resolve any disputes informally.</p>

              <p className="font-semibold text-gray-900 mt-4">13.2 Arbitration</p>
              <p>Any disputes that cannot be resolved informally shall be resolved through binding arbitration in accordance with applicable arbitration rules.</p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to Terms</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of our services constitutes acceptance of the modified terms.</p>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Termination</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>We reserve the right to suspend or terminate your account at any time for violation of these terms or for any other reason at our discretion.</p>
              <p className="mt-3">You may terminate your account by contacting customer support.</p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Governing Law</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Lawlaw Delights operates, without regard to conflict of law principles.</p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Contact Information</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>If you have any questions about these Terms and Conditions, please contact us:</p>
              <div className="bg-gradient-to-r from-primary-green/10 to-leaf-green/10 p-4 rounded-lg border border-primary-green/20 mt-3">
                <p className="font-semibold text-gray-900">Lawlaw Delights</p>
                <p className="mt-2">Email: <a href="mailto:support@lawlawdelights.com" className="text-primary-green hover:text-leaf-green">support@lawlawdelights.com</a></p>
                <p className="mt-1">Phone: +1 (555) 123-4567</p>
                <p className="mt-1">Address: 123 Delicacy Street, Food City, FC 12345</p>
              </div>
            </div>
          </section>

          {/* Acceptance */}
          <section className="border-t pt-6">
            <div className="bg-gradient-to-r from-primary-green/5 to-leaf-green/5 p-6 rounded-xl border border-primary-green/20">
              <p className="text-gray-700 leading-relaxed">
                By using Lawlaw Delights, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </section>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center"
        >
          <Link
            href="/privacy"
            className="text-primary-green hover:text-leaf-green font-medium transition-colors"
          >
            Read our Privacy Policy
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
