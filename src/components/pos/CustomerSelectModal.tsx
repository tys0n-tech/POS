import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useCustomerStore } from '../../stores/useCustomerStore';
import { useToastStore } from '../../stores/useToastStore';
import { Customer } from '../../types';
import { formatPhone } from '../../utils/format';
import { Search, UserPlus, Check, User } from 'lucide-react';
import { sound } from '../../utils/audio';

export interface CustomerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer | null) => void;
}

export const CustomerSelectModal: React.FC<CustomerSelectModalProps> = ({
  isOpen,
  onClose,
  selectedCustomer,
  onSelect
}) => {
  const { customers, addCustomer } = useCustomerStore();
  const { showToast } = useToastStore();

  const [query, setQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.phone.replace(/\D/g, '').includes(query.replace(/\D/g, ''))
  );

  const handleSelectCustomer = (customer: Customer | null) => {
    sound.playClick();
    onSelect(customer);
    onClose();
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const created = addCustomer({
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || undefined
    });

    sound.playSuccess();
    showToast({ type: 'success', title: 'Customer Registered', message: created.name });
    onSelect(created);
    setIsAddingNew(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customer & Loyalty"
      subtitle="Select or register customer to earn points"
      maxWidth="md"
    >
      {!isAddingNew ? (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#6E6E73] dark:text-[#98989D]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by phone number or name..."
                className="w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-[12px] pl-10 pr-4 py-2.5 text-sm text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#6E6E73]/50 focus:outline-none focus:ring-2 focus:ring-[#8B6F5A]/20"
              />
            </div>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => setIsAddingNew(true)}
            >
              New
            </Button>
          </div>

          {/* Walk-in Option */}
          <button
            type="button"
            onClick={() => handleSelectCustomer(null)}
            className={`w-full flex items-center justify-between p-3 rounded-[12px] border transition-all text-left ${
              !selectedCustomer
                ? 'bg-[#8B6F5A]/10 border-[#8B6F5A] ring-1 ring-[#8B6F5A]'
                : 'bg-black/[0.02] dark:bg-white/[0.04] border-black/5 dark:border-white/10 hover:bg-black/[0.04]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[#6E6E73] dark:text-[#98989D]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Walk-in Customer (General)
                </p>
                <p className="text-[10px] text-[#6E6E73] dark:text-[#98989D]">
                  No loyalty account attached
                </p>
              </div>
            </div>
            {!selectedCustomer && <Check className="w-4 h-4 text-[#8B6F5A]" />}
          </button>

          {/* Customer List */}
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {filtered.map((c) => {
              const isSelected = selectedCustomer?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCustomer(c)}
                  className={`w-full flex items-center justify-between p-3 rounded-[12px] border transition-all text-left ${
                    isSelected
                      ? 'bg-[#8B6F5A]/10 border-[#8B6F5A] ring-1 ring-[#8B6F5A]'
                      : 'bg-black/[0.02] dark:bg-white/[0.04] border-black/5 dark:border-white/10 hover:bg-black/[0.04]'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {c.name}
                    </p>
                    <p className="text-[10px] text-[#6E6E73] dark:text-[#98989D]">
                      {formatPhone(c.phone)} · {c.loyaltyPoints} points ({c.totalOrders} visits)
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#8B6F5A]" />}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <Input
            label="Customer Name *"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Somchai Prasert"
            required
          />
          <Input
            label="Phone Number *"
            type="tel"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="e.g. 0812345678"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="e.g. somchai@example.com"
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setIsAddingNew(false)}
            >
              Back
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Customer
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
