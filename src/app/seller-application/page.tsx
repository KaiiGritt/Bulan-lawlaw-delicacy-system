'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SellerApplicationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasApplication, setHasApplication] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    description: '',
    contactNumber: '',
    address: '',
    businessLogo: '',
    primaryId: '',
    secondaryId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [primaryIdPreview, setPrimaryIdPreview] = useState('');
  const [secondaryIdPreview, setSecondaryIdPreview] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    checkExistingApplication();
  }, [session, status, router]);

  const checkExistingApplication = async () => {
    try {
      const response = await fetch('/api/seller-application');
      if (response.ok) {
        const data = await response.json();
        setHasApplication(data.hasApplication);
        if (data.hasApplication) {
          setApplication(data.application);
        }
      }
    } catch (error) {
      console.error('Failed to check application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'primaryId' | 'secondaryId') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size should be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;

      if (type === 'logo') {
        setFormData(prev => ({ ...prev, businessLogo: base64String }));
        setLogoPreview(base64String);
      } else if (type === 'primaryId') {
        setFormData(prev => ({ ...prev, primaryId: base64String }));
        setPrimaryIdPreview(base64String);
      } else if (type === 'secondaryId') {
        setFormData(prev => ({ ...prev, secondaryId: base64String }));
        setSecondaryIdPreview(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/seller-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newApplication = await response.json();
        setApplication(newApplication);
        setHasApplication(true);
        setSuccess('Your seller application has been submitted successfully! We will review it within 2-3 business days.');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit application');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-green"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (hasApplication && application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="mx-auto h-20 w-20 bg-gradient-to-r from-primary-green to-banana-leaf rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-primary-green mb-2">Application Submitted</h1>
              <p className="text-gray-600">Your seller application is being reviewed</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{application.businessName}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  application.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : application.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <p><span className="font-medium">Business Type:</span> {application.businessType}</p>
                <p><span className="font-medium">Contact:</span> {application.contactNumber}</p>
                <p><span className="font-medium">Address:</span> {application.address}</p>
                <p><span className="font-medium">Submitted:</span> {new Date(application.submittedAt).toLocaleDateString()}</p>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>What happens next?</strong><br />
                  Our team will review your application within 2-3 business days. You'll receive an email notification once a decision is made.
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/profile"
                className="btn-hover inline-block bg-primary-green text-white px-8 py-4 rounded-xl font-semibold hover:bg-leaf-green transition-colors duration-300"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-primary-green to-banana-leaf rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-primary-green mb-2">Become a Seller</h1>
            <p className="text-gray-600">Join our community of local Lawlaw product sellers</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="businessName" className="block text-sm font-semibold text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                id="businessName"
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all duration-200"
                placeholder="Enter your business name"
              />
            </div>

            <div>
              <label htmlFor="businessType" className="block text-sm font-semibold text-gray-700 mb-2">
                Business Type *
              </label>
              <select
                id="businessType"
                required
                value={formData.businessType}
                onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all duration-200"
              >
                <option value="">Select business type</option>
                <option value="Individual Seller">Individual Seller</option>
                <option value="Small Business">Small Business</option>
                <option value="Farm/Cooperative">Farm/Cooperative</option>
                <option value="Restaurant/Catering">Restaurant/Catering</option>
                <option value="Wholesale Supplier">Wholesale Supplier</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Business Description *
              </label>
              <textarea
                id="description"
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Tell us about your business, what Lawlaw products you offer, and your experience..."
              />
            </div>

            <div>
              <label htmlFor="contactNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Number *
              </label>
              <input
                id="contactNumber"
                type="tel"
                required
                value={formData.contactNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all duration-200"
                placeholder="Enter your contact number"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                Business Address *
              </label>
              <textarea
                id="address"
                required
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Enter your complete business address"
              />
            </div>

            <div>
              <label htmlFor="businessLogo" className="block text-sm font-semibold text-gray-700 mb-2">
                Business Logo (Optional)
              </label>
              <input
                id="businessLogo"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'logo')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all duration-200"
              />
              {logoPreview && (
                <div className="mt-3">
                  <img src={logoPreview} alt="Logo Preview" className="h-24 w-24 object-cover rounded-lg border-2 border-primary-green" />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Upload your business logo (Max 2MB, JPG/PNG)</p>
            </div>

            <div>
              <label htmlFor="primaryId" className="block text-sm font-semibold text-gray-700 mb-2">
                Primary ID Verification *
              </label>
              <input
                id="primaryId"
                type="file"
                accept="image/*"
                required
                onChange={(e) => handleFileUpload(e, 'primaryId')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all duration-200"
              />
              {primaryIdPreview && (
                <div className="mt-3">
                  <img src={primaryIdPreview} alt="Primary ID Preview" className="h-32 w-full object-contain rounded-lg border-2 border-primary-green" />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Upload a valid government-issued ID (Driver's License, Passport, National ID, etc.)</p>
            </div>

            <div>
              <label htmlFor="secondaryId" className="block text-sm font-semibold text-gray-700 mb-2">
                Secondary ID Verification (Optional)
              </label>
              <input
                id="secondaryId"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'secondaryId')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all duration-200"
              />
              {secondaryIdPreview && (
                <div className="mt-3">
                  <img src={secondaryIdPreview} alt="Secondary ID Preview" className="h-32 w-full object-contain rounded-lg border-2 border-primary-green" />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Upload an additional ID for verification (optional but recommended)</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Application Requirements:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Valid government-issued ID (required)</li>
                <li>• Valid business registration or permit</li>
                <li>• Fresh, quality Lawlaw products</li>
                <li>• Reliable delivery or pickup arrangements</li>
                <li>• Commitment to food safety standards</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-300"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="btn-hover bg-primary-green text-white px-6 py-3 rounded-xl font-semibold hover:bg-leaf-green disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
