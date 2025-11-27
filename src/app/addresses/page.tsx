'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, MapPin } from 'lucide-react';
import AddressCard, { Address } from '../components/AddressCard';
import AddressForm, { AddressFormData } from '../components/AddressForm';

export default function AddressesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchAddresses();
    }
  }, [status, router]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/addresses');
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAddress = async (addressData: AddressFormData) => {
    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressData)
      });

      if (response.ok) {
        await fetchAddresses();
        setIsFormOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create address');
      }
    } catch (error) {
      console.error('Error creating address:', error);
      alert('Failed to create address');
    }
  };

  const handleUpdateAddress = async (addressData: AddressFormData) => {
    if (!editingAddress) return;

    try {
      const response = await fetch(`/api/addresses/${editingAddress.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressData)
      });

      if (response.ok) {
        await fetchAddresses();
        setEditingAddress(null);
        setIsFormOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Failed to update address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchAddresses();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/addresses/${id}/set-default`, {
        method: 'POST'
      });

      if (response.ok) {
        await fetchAddresses();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to set default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Failed to set default address');
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
              <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-lg w-40"></div>
            </div>
          </div>

          {/* Address Cards Skeleton */}
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg flex-1"></div>
                  <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg flex-1"></div>
                  <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg w-9"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <MapPin className="text-orange-500" />
              My Addresses
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your delivery addresses
            </p>
          </div>
          <button
            onClick={() => {
              setEditingAddress(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            <Plus size={20} />
            Add New Address
          </button>
        </div>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
            <MapPin size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2 dark:text-white">No addresses yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add your first delivery address to get started
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Add Address
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={handleEdit}
                onDelete={handleDeleteAddress}
                onSetDefault={handleSetDefault}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      <AddressForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingAddress ? handleUpdateAddress : handleCreateAddress}
        initialData={editingAddress}
        mode={editingAddress ? 'edit' : 'create'}
      />
    </div>
  );
}
