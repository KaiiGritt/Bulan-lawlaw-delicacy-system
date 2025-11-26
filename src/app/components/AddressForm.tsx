'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (address: AddressFormData) => Promise<void>;
  initialData?: AddressFormData | null;
  mode?: 'create' | 'edit';
}

export interface AddressFormData {
  id?: string;
  fullName: string;
  phoneNumber: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  streetAddress: string;
  postalCode: string;
  landmark?: string;
  isDefault: boolean;
}

interface Region {
  id: string;
  name: string;
}

interface Province {
  id: string;
  name: string;
}

interface City {
  id: string;
  name: string;
  postalCode: string;
}

export default function AddressForm({ isOpen, onClose, onSubmit, initialData, mode = 'create' }: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    fullName: '',
    phoneNumber: '',
    region: '',
    province: '',
    city: '',
    barangay: '',
    streetAddress: '',
    postalCode: '',
    landmark: '',
    isDefault: false
  });

  const [regions, setRegions] = useState<Region[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [barangays, setBarangays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load initial data when in edit mode
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      // Load cascading dropdowns for edit mode
      loadProvincesForRegion(initialData.region);
      loadCitiesForProvince(initialData.region, initialData.province);
      loadBarangaysForCity(initialData.region, initialData.province, initialData.city);
    }
  }, [initialData]);

  // Fetch regions on mount
  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const response = await fetch('/api/philippines-addresses?type=regions');
      const data = await response.json();
      setRegions(data);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const loadProvincesForRegion = async (regionId: string) => {
    try {
      const response = await fetch(`/api/philippines-addresses?type=provinces&regionId=${regionId}`);
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const loadCitiesForProvince = async (regionId: string, provinceId: string) => {
    try {
      const response = await fetch(`/api/philippines-addresses?type=cities&regionId=${regionId}&provinceId=${provinceId}`);
      const data = await response.json();
      setCities(data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const loadBarangaysForCity = async (regionId: string, provinceId: string, cityId: string) => {
    try {
      const response = await fetch(`/api/philippines-addresses?type=barangays&regionId=${regionId}&provinceId=${provinceId}&cityId=${cityId}`);
      const data = await response.json();
      setBarangays(data.barangays);
      // Auto-fill postal code
      if (data.postalCode) {
        setFormData(prev => ({ ...prev, postalCode: data.postalCode }));
      }
    } catch (error) {
      console.error('Error fetching barangays:', error);
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value;
    const regionName = regions.find(r => r.id === regionId)?.name || '';

    setFormData(prev => ({
      ...prev,
      region: regionName,
      province: '',
      city: '',
      barangay: '',
      postalCode: ''
    }));

    setProvinces([]);
    setCities([]);
    setBarangays([]);

    if (regionId) {
      loadProvincesForRegion(regionId);
    }
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value;
    const provinceName = provinces.find(p => p.id === provinceId)?.name || '';
    const regionId = regions.find(r => r.name === formData.region)?.id || '';

    setFormData(prev => ({
      ...prev,
      province: provinceName,
      city: '',
      barangay: '',
      postalCode: ''
    }));

    setCities([]);
    setBarangays([]);

    if (provinceId && regionId) {
      loadCitiesForProvince(regionId, provinceId);
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    const cityData = cities.find(c => c.id === cityId);
    const cityName = cityData?.name || '';
    const regionId = regions.find(r => r.name === formData.region)?.id || '';
    const provinceId = provinces.find(p => p.name === formData.province)?.id || '';

    setFormData(prev => ({
      ...prev,
      city: cityName,
      barangay: '',
      postalCode: cityData?.postalCode || ''
    }));

    setBarangays([]);

    if (cityId && regionId && provinceId) {
      loadBarangaysForCity(regionId, provinceId, cityId);
    }
  };

  const handleBarangayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      barangay: e.target.value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else {
      const phoneRegex = /^(09|\+639)\d{9}$/;
      if (!phoneRegex.test(formData.phoneNumber.replace(/\s|-/g, ''))) {
        newErrors.phoneNumber = 'Invalid phone number format (09XXXXXXXXX or +639XXXXXXXXX)';
      }
    }
    if (!formData.region) newErrors.region = 'Region is required';
    if (!formData.province) newErrors.province = 'Province is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.barangay) newErrors.barangay = 'Barangay is required';
    if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!formData.postalCode) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{4}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Invalid postal code (must be 4 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        fullName: '',
        phoneNumber: '',
        region: '',
        province: '',
        city: '',
        barangay: '',
        streetAddress: '',
        postalCode: '',
        landmark: '',
        isDefault: false
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold dark:text-white">
            {mode === 'edit' ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Juan Dela Cruz"
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="09171234567"
            />
            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Region <span className="text-red-500">*</span>
            </label>
            <select
              value={regions.find(r => r.name === formData.region)?.id || ''}
              onChange={handleRegionChange}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.region ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
            {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
          </div>

          {/* Province */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Province <span className="text-red-500">*</span>
            </label>
            <select
              value={provinces.find(p => p.name === formData.province)?.id || ''}
              onChange={handleProvinceChange}
              disabled={!formData.region}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.province ? 'border-red-500' : 'border-gray-300'
              } disabled:bg-gray-100 dark:disabled:bg-gray-600`}
            >
              <option value="">Select Province</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>
            {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              City / Municipality <span className="text-red-500">*</span>
            </label>
            <select
              value={cities.find(c => c.name === formData.city)?.id || ''}
              onChange={handleCityChange}
              disabled={!formData.province}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              } disabled:bg-gray-100 dark:disabled:bg-gray-600`}
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>

          {/* Barangay */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Barangay <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.barangay}
              onChange={handleBarangayChange}
              disabled={!formData.city}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.barangay ? 'border-red-500' : 'border-gray-300'
              } disabled:bg-gray-100 dark:disabled:bg-gray-600`}
            >
              <option value="">Select Barangay</option>
              {barangays.map((barangay) => (
                <option key={barangay} value={barangay}>
                  {barangay}
                </option>
              ))}
            </select>
            {errors.barangay && <p className="text-red-500 text-sm mt-1">{errors.barangay}</p>}
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Street / House / Unit Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.streetAddress}
              onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.streetAddress ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="House No., Street Name, Building"
            />
            {errors.streetAddress && <p className="text-red-500 text-sm mt-1">{errors.streetAddress}</p>}
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.postalCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1234"
              maxLength={4}
            />
            {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
          </div>

          {/* Landmark (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Landmark (Optional)
            </label>
            <input
              type="text"
              value={formData.landmark || ''}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Near shopping mall, church, etc."
            />
          </div>

          {/* Set as Default */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="isDefault" className="ml-2 text-sm dark:text-gray-200">
              Set as default address
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
