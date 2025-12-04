'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lawlaw-ocean-teal hover:text-lawlaw-deep-blue mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-green to-leaf-green bg-clip-text text-transparent flex items-center gap-3">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Privacy Policy
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
              At Lawlaw Delights, we are committed to protecting your privacy and ensuring the security of your personal information.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              By using our services, you consent to the practices described in this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

            <div className="space-y-4 text-gray-700 leading-relaxed">
              <div>
                <p className="font-semibold text-gray-900">2.1 Personal Information</p>
                <p className="mt-2">When you create an account or make a purchase, we collect:</p>
                <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Shipping and billing addresses</li>
                  <li>Payment information (processed securely through third-party payment providers)</li>
                  <li>Account credentials (username, password)</li>
                  <li>Profile information (display name, bio, preferences)</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mt-4">2.2 Order and Transaction Information</p>
                <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                  <li>Order history and purchase details</li>
                  <li>Shopping cart contents</li>
                  <li>Saved recipes and favorites</li>
                  <li>Product reviews and ratings</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mt-4">2.3 Automatically Collected Information</p>
                <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages visited, time spent, interactions)</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Location data (with your permission)</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mt-4">2.4 Communications</p>
                <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                  <li>Messages sent through our chat system</li>
                  <li>Customer support inquiries</li>
                  <li>Feedback and survey responses</li>
                  <li>Email correspondence</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li><strong>Order Processing:</strong> To process and fulfill your orders, manage payments, and provide shipping updates</li>
                <li><strong>Account Management:</strong> To create and maintain your account, authenticate users, and provide customer support</li>
                <li><strong>Communication:</strong> To send order confirmations, shipping notifications, and respond to inquiries</li>
                <li><strong>Personalization:</strong> To customize your experience, recommend products, and remember your preferences</li>
                <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security incidents</li>
                <li><strong>Analytics:</strong> To understand usage patterns, improve our services, and develop new features</li>
                <li><strong>Marketing:</strong> To send promotional emails and notifications (with your consent)</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our terms</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>We may share your information with:</p>

              <div>
                <p className="font-semibold text-gray-900">4.1 Service Providers</p>
                <p className="mt-2">Third-party vendors who help us operate our platform, including:</p>
                <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                  <li>Payment processors</li>
                  <li>Shipping and logistics partners</li>
                  <li>Cloud hosting services</li>
                  <li>Email service providers</li>
                  <li>Analytics providers</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mt-4">4.2 Sellers</p>
                <p className="mt-2">When you make a purchase, we share necessary information with sellers to fulfill your order.</p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mt-4">4.3 Legal Requirements</p>
                <p className="mt-2">We may disclose information when required by law, court order, or government request.</p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mt-4">4.4 Business Transfers</p>
                <p className="mt-2">In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-blue-900 font-semibold">Important Note:</p>
                <p className="text-blue-800 mt-2">We do not sell your personal information to third parties for marketing purposes.</p>
              </div>
            </div>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies and Tracking Technologies</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Remember your preferences and settings</li>
                <li>Keep you logged in</li>
                <li>Analyze site traffic and usage patterns</li>
                <li>Personalize content and advertisements</li>
              </ul>
              <p className="mt-4">You can control cookies through your browser settings. Note that disabling cookies may affect functionality.</p>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>We implement industry-standard security measures to protect your information:</p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Secure password hashing</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Monitoring for suspicious activity</li>
              </ul>
              <p className="mt-4">However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.</p>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>We retain your personal information for as long as necessary to:</p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Provide our services and maintain your account</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain business records</li>
              </ul>
              <p className="mt-4">When you delete your account, we will delete or anonymize your personal information within 90 days, except where we are required to retain it for legal purposes.</p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Privacy Rights</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>You have the following rights regarding your personal information:</p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-green flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Access:</p>
                    <p>Request a copy of your personal information</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-green flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Correction:</p>
                    <p>Update or correct inaccurate information</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-green flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Deletion:</p>
                    <p>Request deletion of your personal information</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-green flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Opt-Out:</p>
                    <p>Unsubscribe from marketing communications</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-green flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Portability:</p>
                    <p>Receive your data in a portable format</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-green flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Object:</p>
                    <p>Object to certain processing of your information</p>
                  </div>
                </div>
              </div>

              <p className="mt-4">To exercise these rights, please contact us at <a href="mailto:privacy@lawlawdelights.com" className="text-lawlaw-ocean-teal hover:text-lawlaw-deep-blue">privacy@lawlawdelights.com</a></p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>
              <p className="mt-3">If you believe we have collected information from a child under 13, please contact us immediately so we can delete the information.</p>
            </div>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Third-Party Links</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties.</p>
              <p className="mt-3">We encourage you to review the privacy policies of any third-party sites you visit.</p>
            </div>
          </section>

          {/* International Data Transfers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Data Transfers</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those of your country.</p>
              <p className="mt-3">We take appropriate safeguards to ensure your information receives adequate protection in accordance with this Privacy Policy.</p>
            </div>
          </section>

          {/* California Privacy Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. California Privacy Rights (CCPA)</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):</p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Right to know what personal information is collected, used, shared, or sold</li>
                <li>Right to delete personal information</li>
                <li>Right to opt-out of the sale of personal information</li>
                <li>Right to non-discrimination for exercising your rights</li>
              </ul>
              <p className="mt-4">To exercise these rights, contact us at <a href="mailto:privacy@lawlawdelights.com" className="text-lawlaw-ocean-teal hover:text-lawlaw-deep-blue">privacy@lawlawdelights.com</a></p>
            </div>
          </section>

          {/* GDPR Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. European Privacy Rights (GDPR)</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>If you are in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR):</p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Right to access your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
              </ul>
            </div>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to This Privacy Policy</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by:</p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Posting the updated policy on our website</li>
                <li>Updating the "Last Updated" date</li>
                <li>Sending you an email notification (for significant changes)</li>
              </ul>
              <p className="mt-4">Your continued use of our services after changes become effective constitutes acceptance of the updated policy.</p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Us</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
              <div className="bg-gradient-to-r from-primary-green/10 to-leaf-green/10 p-4 rounded-lg border border-primary-green/20 mt-3">
                <p className="font-semibold text-gray-900">Privacy Team - Lawlaw Delights</p>
                <p className="mt-2">Email: <a href="mailto:privacy@lawlawdelights.com" className="text-lawlaw-ocean-teal hover:text-lawlaw-deep-blue">privacy@lawlawdelights.com</a></p>
                <p className="mt-1">Phone: +1 (555) 123-4567</p>
                <p className="mt-1">Address: 123 Delicacy Street, Food City, FC 12345</p>
                <p className="mt-2 text-sm text-gray-600">We will respond to your inquiry within 30 days.</p>
              </div>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="border-t pt-6">
            <div className="bg-gradient-to-r from-primary-green/5 to-leaf-green/5 p-6 rounded-xl border border-primary-green/20">
              <p className="text-gray-700 leading-relaxed">
                By using Lawlaw Delights, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your information as described herein.
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
            href="/terms"
            className="text-lawlaw-ocean-teal hover:text-lawlaw-deep-blue font-medium transition-colors"
          >
            Read our Terms and Conditions
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
