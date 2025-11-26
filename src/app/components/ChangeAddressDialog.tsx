'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import AddressCard, { Address } from './AddressCard';

interface ChangeAddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (address: Address) => void;
  currentAddressId?: string;
  onAddNewAddress: () => void;
}

export default function ChangeAddressDialog({
  isOpen,
  onClose,
  onSelectAddress,
  currentAddressId,
  onAddNewAddress
}: ChangeAddressDialogProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(currentAddressId);

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
      setSelectedId(currentAddressId);
    }
  }, [isOpen, currentAddressId]);

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

  const handleSelectAddress = (address: Address) => {
    setSelectedId(address.id);
  };

  const handleConfirm = () => {
    const selectedAddress = addresses.find(addr => addr.id === selectedId);
    if (selectedAddress) {
      onSelectAddress(selectedAddress);
      onClose();
    }
  };

  const handleAddNew = () => {
    onClose();
    onAddNewAddress();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold dark:text-white">Select Delivery Address</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Add New Address Button */}
        <div className="p-4 border-b dark:border-gray-700">
          <button
            onClick={handleAddNew}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-500 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
          >
            <Plus size={20} />
            <span className="font-medium">Add New Address</span>
          </button>
        </div>

        {/* Addresses List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No saved addresses</p>
              <button
                onClick={handleAddNew}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onSelect={handleSelectAddress}
                  selectable={true}
                  selected={selectedId === address.id}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t dark:border-gray-700 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedId}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            Confirm Address
          </button>
        </div>
      </div>
    </div>
  );
}
