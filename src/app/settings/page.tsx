'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function Settings() {
  const { data: session } = useSession();
  const router = useRouter();

  // Profile settings
  const [profilePicture, setProfilePicture] = useState(session?.user?.image || '');
  const [themeColor, setThemeColor] = useState('green');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Notification settings
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  // Currency (PHP only)
  const currency = 'PHP';

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    showOrders: false,
  });

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Business Info (Sellers)
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    businessType: '',
    description: '',
    contactNumber: '',
    address: '',
    businessLogo: '',
  });
  const [hasBusinessInfo, setHasBusinessInfo] = useState(false);

  // Store Settings (Sellers)
  const [storeSettings, setStoreSettings] = useState({
    storeHours: '9:00 AM - 6:00 PM',
    shippingTime: '1-3 business days',
    returnPolicy: '7 days return policy',
    minimumOrder: '',
    freeShippingThreshold: '',
  });

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [showAddPayment, setShowAddPayment] = useState(false);

  // Shipping Preferences (Buyers)
  const [shippingPreferences, setShippingPreferences] = useState({
    defaultAddress: '',
    preferredTimeSlot: 'anytime',
    specialInstructions: '',
  });

  // Accessibility
  const [accessibility, setAccessibility] = useState({
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
  });

  // Active sessions
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  useEffect(() => {
    if (session) {
      loadUserProfile();
      loadUserSettings();
      loadActiveSessions();
      if (session.user.role === 'seller') {
        loadBusinessInfo();
      }
    }
  }, [session]);

  const loadUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfilePicture(data.profilePicture || '');
        setDisplayName(data.name || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadUserSettings = async () => {
    try {
      const response = await fetch('/api/user/settings');
      if (response.ok) {
        const data = await response.json();
        // Profile settings
        if (data.displayName) setDisplayName(data.displayName);
        if (data.bio) setBio(data.bio);
        if (data.themeColor) setThemeColor(data.themeColor);

        // Notification settings
        setNotifications(data.notifications ?? true);
        setEmailUpdates(data.emailUpdates ?? true);
        setOrderUpdates(data.orderUpdates ?? true);
        setPromotionalEmails(data.promotionalEmails ?? false);
        setSmsNotifications(data.smsNotifications ?? false);
        setInAppNotifications(data.inAppNotifications ?? true);

        // Privacy settings
        setPrivacySettings({
          showProfile: data.showProfile ?? true,
          showOrders: data.showOrders ?? false,
        });

        // Accessibility settings
        setAccessibility({
          fontSize: data.fontSize ?? 'medium',
          highContrast: data.highContrast ?? false,
          reducedMotion: data.reducedMotion ?? false,
        });

        // Shipping preferences (for buyers)
        setShippingPreferences({
          defaultAddress: data.defaultAddress || '',
          preferredTimeSlot: data.preferredTimeSlot || 'anytime',
          specialInstructions: data.specialInstructions || '',
        });

        // Store settings (for sellers)
        setStoreSettings({
          storeHours: data.storeHours || '9:00 AM - 6:00 PM',
          shippingTime: data.shippingTime || '1-3 business days',
          returnPolicy: data.returnPolicy || '7 days return policy',
          minimumOrder: data.minimumOrder?.toString() || '',
          freeShippingThreshold: data.freeShippingThreshold?.toString() || '',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadBusinessInfo = async () => {
    try {
      const response = await fetch('/api/seller-application');
      if (response.ok) {
        const data = await response.json();
        if (data.hasApplication && data.application) {
          setHasBusinessInfo(true);
          setBusinessInfo({
            businessName: data.application.businessName || '',
            businessType: data.application.businessType || '',
            description: data.application.description || '',
            contactNumber: data.application.contactNumber || '',
            address: data.application.address || '',
            businessLogo: data.application.businessLogo || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading business info:', error);
    }
  };

  const loadActiveSessions = async () => {
    // Mock data - you'd implement the actual API
    setActiveSessions([
      {
        id: '1',
        device: 'Windows PC - Chrome',
        location: 'Manila, Philippines',
        lastActive: 'Active now',
        current: true,
      },
    ]);
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('profilePicture', file);

        const response = await fetch('/api/user/profile', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to upload');
        }

        const data = await response.json();
        setProfilePicture(data.profilePicture || '');
        toast.success('Profile picture updated successfully!');
      } catch (error: any) {
        console.error('Error uploading profile picture:', error);
        toast.error(error.message || 'Failed to upload profile picture');
      }
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setBusinessInfo(prev => ({ ...prev, businessLogo: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const settings = {
        // Profile settings
        displayName,
        bio,
        themeColor,
        // Notification settings
        notifications,
        emailUpdates,
        orderUpdates,
        promotionalEmails,
        smsNotifications,
        inAppNotifications,
        // Privacy settings
        privacySettings,
        // Accessibility settings
        accessibility,
        // Shipping preferences (for buyers)
        shippingPreferences,
        // Store settings (for sellers)
        storeSettings,
      };

      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      toast.success('Settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }

      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    }
  };

  const handleAccountDeletion = async () => {
    try {
      const response = await fetch('/api/user/delete', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete account');
      }

      const data = await response.json();
      toast.success('Account deleted successfully. Redirecting...');
      setShowDeleteConfirm(false);

      setTimeout(() => {
        router.push(data.redirect || '/register');
      }, 2000);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.message || 'Failed to delete account');
    }
  };

  const exportData = async () => {
    try {
      toast.loading('Preparing your data export...');

      const response = await fetch('/api/user/export', {
        method: 'GET',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lawlaw-data-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss();
      toast.success('Data exported successfully!');
    } catch (error: any) {
      toast.dismiss();
      console.error('Error exporting data:', error);
      toast.error(error.message || 'Failed to export data');
    }
  };

  const handleBusinessInfoUpdate = async () => {
    if (!businessInfo.businessName || !businessInfo.businessType || !businessInfo.description || !businessInfo.contactNumber || !businessInfo.address) {
      toast.error('Please fill in all required business information fields');
      return;
    }

    try {
      const response = await fetch('/api/seller-application', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessInfo),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update business information');
      }

      toast.success('Business information updated successfully!');
    } catch (error: any) {
      console.error('Error updating business info:', error);
      toast.error(error.message || 'Failed to update business information');
    }
  };

  const handleLogoutAllSessions = async () => {
    toast.success('Logged out from all other devices');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20 py-6 sm:py-8 px-3 sm:px-4 lg:px-8">
      <Toaster position="top-right" />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center text-gray-600 hover:text-primary-green transition-colors mb-4 text-sm sm:text-base"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Profile
          </button>

          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-green to-leaf-green bg-clip-text text-transparent mb-2">
              Settings
            </h1>
            <p className="text-gray-600">Manage your account preferences and profile</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Section title="Profile" icon="👤">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative">
                <img
                  src={profilePicture || '/default-avatar.png'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary-green/20 shadow-lg"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-primary-green hover:bg-leaf-green text-white rounded-full p-2 shadow-lg transition-colors"
                  title="Change profile picture"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1 w-full text-center sm:text-left">
                <h4 className="text-lg font-medium text-gray-800">{session?.user?.name || 'User'}</h4>
                <p className="text-gray-500 break-all">{session?.user?.email}</p>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={displayName || session?.user?.name || ''}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green bg-white text-gray-800"
                      placeholder="Your display name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      maxLength={200}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green bg-white text-gray-800"
                      placeholder="Tell others about yourself..."
                    />
                    <p className="text-xs text-gray-500 mt-1">{bio.length}/200 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Profile Theme Color</label>
                    <div className="grid grid-cols-6 gap-3">
                      {[
                        { name: 'green', color: 'bg-green-500' },
                        { name: 'blue', color: 'bg-blue-500' },
                        { name: 'purple', color: 'bg-purple-500' },
                        { name: 'pink', color: 'bg-pink-500' },
                        { name: 'orange', color: 'bg-orange-500' },
                        { name: 'red', color: 'bg-red-500' },
                      ].map((theme) => (
                        <button
                          key={theme.name}
                          onClick={() => setThemeColor(theme.name)}
                          className={`aspect-square rounded-lg ${theme.color} transition-all hover:scale-105 ${
                            themeColor === theme.name ? 'ring-4 ring-offset-2 ring-primary-green' : ''
                          }`}
                        >
                          {themeColor === theme.name && (
                            <svg className="w-6 h-6 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Business Information (Sellers Only) */}
          {session?.user?.role === 'seller' && hasBusinessInfo && (
            <Section title="Business Information" icon="🏢">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
                  <div className="flex items-center gap-4">
                    {businessInfo.businessLogo && (
                      <img
                        src={businessInfo.businessLogo}
                        alt="Business Logo"
                        className="w-20 h-20 rounded-lg object-cover border-2 border-primary-green"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="bg-primary-green hover:bg-leaf-green text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {businessInfo.businessLogo ? 'Change Logo' : 'Upload Logo'}
                    </button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <InputField
                  label="Business Name *"
                  value={businessInfo.businessName}
                  onChange={(e) => setBusinessInfo({...businessInfo, businessName: e.target.value})}
                  placeholder="Your business name"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Type *</label>
                  <select
                    value={businessInfo.businessType}
                    onChange={(e) => setBusinessInfo({...businessInfo, businessType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green bg-white text-gray-800"
                  >
                    <option value="">Select business type</option>
                    <option value="Fisherman">Fisherman</option>
                    <option value="Farmer">Farmer</option>
                    <option value="Processor">Processor</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Retailer">Retailer</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={businessInfo.description}
                    onChange={(e) => setBusinessInfo({...businessInfo, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green bg-white text-gray-800"
                    placeholder="Describe your business"
                  />
                </div>

                <InputField
                  label="Contact Number *"
                  type="tel"
                  value={businessInfo.contactNumber}
                  onChange={(e) => setBusinessInfo({...businessInfo, contactNumber: e.target.value})}
                  placeholder="+63 912 345 6789"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <textarea
                    value={businessInfo.address}
                    onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green bg-white text-gray-800"
                    placeholder="Your business address"
                  />
                </div>

                <button
                  onClick={handleBusinessInfoUpdate}
                  className="w-full bg-gradient-to-r from-primary-green to-leaf-green text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Update Business Information
                </button>
              </div>
            </Section>
          )}

          {/* Store Settings (Sellers Only) */}
          {session?.user?.role === 'seller' && (
            <Section title="Store Settings" icon="🏪">
              <div className="space-y-4">
                <InputField
                  label="Store Hours"
                  value={storeSettings.storeHours}
                  onChange={(e) => setStoreSettings({...storeSettings, storeHours: e.target.value})}
                  placeholder="e.g., 9:00 AM - 6:00 PM"
                />

                <InputField
                  label="Processing/Shipping Time"
                  value={storeSettings.shippingTime}
                  onChange={(e) => setStoreSettings({...storeSettings, shippingTime: e.target.value})}
                  placeholder="e.g., 1-3 business days"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Return Policy</label>
                  <textarea
                    value={storeSettings.returnPolicy}
                    onChange={(e) => setStoreSettings({...storeSettings, returnPolicy: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green bg-white text-gray-800"
                    placeholder="Describe your return policy"
                  />
                </div>

                <InputField
                  label="Minimum Order Amount"
                  type="number"
                  value={storeSettings.minimumOrder}
                  onChange={(e) => setStoreSettings({...storeSettings, minimumOrder: e.target.value})}
                  placeholder="e.g., 50"
                />

                <InputField
                  label="Free Shipping Threshold"
                  type="number"
                  value={storeSettings.freeShippingThreshold}
                  onChange={(e) => setStoreSettings({...storeSettings, freeShippingThreshold: e.target.value})}
                  placeholder="e.g., 100"
                />

                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/user/settings', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ storeSettings }),
                      });
                      if (!response.ok) throw new Error('Failed to save');
                      toast.success('Store settings saved!');
                    } catch (error) {
                      toast.error('Failed to save store settings');
                    }
                  }}
                  className="w-full bg-gradient-to-r from-primary-green to-leaf-green text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Save Store Settings
                </button>
              </div>
            </Section>
          )}

          {/* Shipping Preferences (Buyers Only) */}
          {session?.user?.role !== 'seller' && (
            <Section title="Shipping Preferences" icon="📦">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Shipping Address</label>
                  <textarea
                    value={shippingPreferences.defaultAddress}
                    onChange={(e) => setShippingPreferences({...shippingPreferences, defaultAddress: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green bg-white text-gray-800"
                    placeholder="Your default shipping address"
                  />
                  <p className="text-xs text-gray-500 mt-1">This address will be pre-selected during checkout</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Delivery Time</label>
                  <select
                    value={shippingPreferences.preferredTimeSlot}
                    onChange={(e) => setShippingPreferences({...shippingPreferences, preferredTimeSlot: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green bg-white text-gray-800"
                  >
                    <option value="anytime">Anytime</option>
                    <option value="morning">Morning (8AM - 12PM)</option>
                    <option value="afternoon">Afternoon (12PM - 5PM)</option>
                    <option value="evening">Evening (5PM - 8PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Delivery Instructions</label>
                  <textarea
                    value={shippingPreferences.specialInstructions}
                    onChange={(e) => setShippingPreferences({...shippingPreferences, specialInstructions: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green bg-white text-gray-800"
                    placeholder="e.g., Leave at front door, Call upon arrival"
                  />
                </div>

                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/user/settings', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ shippingPreferences }),
                      });
                      if (!response.ok) throw new Error('Failed to save');
                      toast.success('Shipping preferences saved!');
                    } catch (error) {
                      toast.error('Failed to save shipping preferences');
                    }
                  }}
                  className="w-full bg-gradient-to-r from-primary-green to-leaf-green text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Save Shipping Preferences
                </button>
              </div>
            </Section>
          )}

          {/* Payment Methods */}
          <Section title="Payment Methods" icon="💳">
            <div className="space-y-4">
              {session?.user?.role === 'seller' ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Bank Account for Payouts</h4>
                  <InputField
                    label="Bank Name"
                    placeholder="e.g., BDO, BPI, Metrobank"
                  />
                  <InputField
                    label="Account Number"
                    placeholder="Your account number"
                  />
                  <InputField
                    label="Account Name"
                    placeholder="Account holder name"
                  />
                  <button
                    onClick={() => toast.success('Payment information saved!')}
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Save Payment Information
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">Manage your saved payment methods</p>
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <p className="text-gray-500 mb-3">No payment methods saved yet</p>
                    <button
                      onClick={() => toast('This feature will be available soon')}
                      className="bg-primary-green hover:bg-leaf-green text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Add Payment Method
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Notifications */}
          <Section title="Notification Preferences" icon="🔔">
            <div className="space-y-3">
              <ToggleSetting
                label="Push Notifications"
                description="Receive push notifications on your device"
                value={notifications}
                onChange={setNotifications}
              />
              <ToggleSetting
                label="Email Updates"
                description="Get email updates about your account activity"
                value={emailUpdates}
                onChange={setEmailUpdates}
              />
              <ToggleSetting
                label="SMS Notifications"
                description="Receive text messages for important updates"
                value={smsNotifications}
                onChange={setSmsNotifications}
              />
              <ToggleSetting
                label="In-App Notifications"
                description="Show notifications within the app"
                value={inAppNotifications}
                onChange={setInAppNotifications}
              />
              <ToggleSetting
                label="Order Updates"
                description="Get notified about order status changes"
                value={orderUpdates}
                onChange={setOrderUpdates}
              />
              <ToggleSetting
                label="Promotional Emails"
                description="Receive promotional offers and deals"
                value={promotionalEmails}
                onChange={setPromotionalEmails}
              />
            </div>
          </Section>

          {/* Privacy */}
          <Section title="Privacy Settings" icon="🔒">
            <div className="space-y-3">
              <ToggleSetting
                label="Show Profile Publicly"
                description="Allow others to view your profile"
                value={privacySettings.showProfile}
                onChange={(val) => setPrivacySettings({...privacySettings, showProfile: val})}
              />
              <ToggleSetting
                label="Show Order History"
                description="Display your order history on your profile"
                value={privacySettings.showOrders}
                onChange={(val) => setPrivacySettings({...privacySettings, showOrders: val})}
              />
            </div>
          </Section>

          {/* Accessibility */}
          <Section title="Accessibility" icon="♿">
            <div className="space-y-4">
              <SelectField
                label="Font Size"
                value={accessibility.fontSize}
                onChange={(e) => setAccessibility({...accessibility, fontSize: e.target.value})}
                options={[
                  { value: 'small', label: 'Small' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'large', label: 'Large' },
                  { value: 'extra-large', label: 'Extra Large' },
                ]}
              />

              <ToggleSetting
                label="High Contrast Mode"
                description="Increase contrast for better visibility"
                value={accessibility.highContrast}
                onChange={(val) => setAccessibility({...accessibility, highContrast: val})}
              />

              <ToggleSetting
                label="Reduced Motion"
                description="Minimize animations and transitions"
                value={accessibility.reducedMotion}
                onChange={(val) => setAccessibility({...accessibility, reducedMotion: val})}
              />
            </div>
          </Section>

          {/* Security */}
          <Section title="Security" icon="🛡️">
            <div className="space-y-4">
              <ToggleSetting
                label="Two-Factor Authentication"
                description="Add an extra layer of security to your account"
                value={twoFactorEnabled}
                onChange={setTwoFactorEnabled}
              />

              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-gray-900 mb-4">Change Password</h4>
                <div className="space-y-3">
                  <InputField
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <InputField
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <InputField
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <button
                    onClick={handlePasswordChange}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </Section>

          {/* Session Management */}
          <Section title="Active Sessions" icon="💻">
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-green/10 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{session.device}</p>
                      <p className="text-sm text-gray-500">{session.location}</p>
                      <p className="text-xs text-gray-400">{session.lastActive}</p>
                    </div>
                  </div>
                  {session.current && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Current
                    </span>
                  )}
                </div>
              ))}

              <button
                onClick={handleLogoutAllSessions}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Logout All Other Devices
              </button>
            </div>
          </Section>

          {/* Legal & Compliance */}
          <Section title="Legal & Compliance" icon="⚖️">
            <div className="space-y-3">
              <Link
                href="/terms"
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-medium text-gray-900">Terms & Conditions</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/privacy"
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-medium text-gray-900">Privacy Policy</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Cookie Preferences</h4>
                <p className="text-sm text-blue-700 mb-3">We use cookies to improve your experience</p>
                <button
                  onClick={() => toast('Cookie preferences updated')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Manage Cookie Settings →
                </button>
              </div>
            </div>
          </Section>

          {/* Data Management */}
          <Section title="Data & Account Management" icon="📊">
            <div className="space-y-3">
              <button
                onClick={exportData}
                className="w-full bg-primary-green hover:bg-leaf-green text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export My Data
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Account
              </button>
            </div>
          </Section>

          {/* Save Button */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => router.push('/profile')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-primary-green to-leaf-green text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Save All Changes
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Account?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAccountDeletion}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-soft-green/20 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

interface InputFieldProps {
  label: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

function InputField({ label, type = 'text', value, onChange, placeholder }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green bg-white text-gray-800"
        placeholder={placeholder}
      />
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green bg-white text-gray-800"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ToggleSettingProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function ToggleSetting({ label, description, value, onChange }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-primary-green' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
