'use client';

import { MapPin, Phone, Edit, Trash2 } from 'lucide-react';

export interface Address {
  id: string;
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

interface AddressCardProps {
  address: Address;
  onEdit?: (address: Address) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  onSelect?: (address: Address) => void;
  selectable?: boolean;
  selected?: boolean;
  showActions?: boolean;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  onSelect,
  selectable = false,
  selected = false,
  showActions = true
}: AddressCardProps) {
  const fullAddress = `${address.streetAddress}, ${address.barangay}, ${address.city}, ${address.province}, ${address.region} ${address.postalCode}`;

  const handleCardClick = () => {
    if (selectable && onSelect) {
      onSelect(address);
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        selectable ? 'cursor-pointer hover:border-orange-500' : ''
      } ${
        selected ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      }`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg dark:text-white">{address.fullName}</h3>
            {address.isDefault && (
              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded">
                Default
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
            <Phone size={14} />
            <span>{address.phoneNumber}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && !selectable && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(address);
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                title="Edit"
              >
                <Edit size={18} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this address?')) {
                    onDelete(address.id);
                  }
                }}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 mb-3">
        <MapPin size={16} className="text-gray-400 mt-1 flex-shrink-0" />
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {fullAddress}
          {address.landmark && (
            <span className="block text-gray-500 dark:text-gray-400 mt-1">
              Landmark: {address.landmark}
            </span>
          )}
        </p>
      </div>

      {/* Set as Default Button */}
      {showActions && !address.isDefault && onSetDefault && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSetDefault(address.id);
          }}
          className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 font-medium"
        >
          Set as Default
        </button>
      )}

      {/* Selected Indicator */}
      {selected && selectable && (
        <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
          <p className="text-sm text-orange-600 dark:text-orange-500 font-medium">
            ✓ Selected
          </p>
        </div>
      )}
    </div>
  );
}
