import React, { useState } from 'react';
import { useCustomerStore } from '../stores/useCustomerStore';
import { useOrderStore } from '../stores/useOrderStore';
import { useToastStore } from '../stores/useToastStore';
import { Customer } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Sheet } from '../components/ui/Sheet';
import { SearchInput } from '../components/ui/SearchInput';
import { formatCurrency, formatDateTime, formatPhone } from '../utils/format';
import { sound } from '../utils/audio';
import { 
  Users, 
  UserPlus, 
  Award, 
  ShoppingBag, 
  Calendar, 
  Coffee, 
  Phone, 
  Mail,
  ChevronRight,
  Plus
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { customers, selectedCustomer, setSelectedCustomer, addCustomer, updateCustomer } = useCustomerStore();
  const { orders } = useOrderStore();
  const { showToast } = useToastStore();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.replace(/\D/g, '').includes(search.replace(/\D/g, ''))
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const created = addCustomer({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      notes: notes.trim() || undefined
    });

    sound.playSuccess();
    showToast({ type: 'success', title: 'Customer Created', message: created.name });
    setIsAddModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  const customerOrders = selectedCustomer
    ? orders.filter((o) => o.customer?.id === selectedCustomer.id || o.customer?.phone === selectedCustomer.phone)
    : [];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Customer Directory & CRM
          </h2>
          <p className="text-xs text-[#6E6E73] dark:text-[#98989D]">
            Manage loyalty points, order preferences and visit history
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-64">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search phone or name..."
            />
          </div>

          <Button
            variant="primary"
            size="md"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="flex-1 bg-[#FFFFFF] dark:bg-[#1C1C1E] rounded-[20px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-black/[0.02] dark:bg-white/[0.03] border-b border-black/[0.06] dark:border-white/[0.08] text-[#6E6E73] dark:text-[#98989D] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Customer Name</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Loyalty Points</th>
                <th className="py-3.5 px-4">Total Visits</th>
                <th className="py-3.5 px-4">Lifetime Spent</th>
                <th className="py-3.5 px-4">Favorite Drink</th>
                <th className="py-3.5 px-4">Last Visit</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {filteredCustomers.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedCustomer(c);
                  }}
                  className="h-16 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <td className="py-3 px-5 font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {c.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#6E6E73] dark:text-[#98989D]">
                    {formatPhone(c.phone)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#8B6F5A]/15 text-[#684F3D] dark:text-[#D4BBA5] font-bold text-xs">
                      <Award className="w-3 h-3" />
                      {c.loyaltyPoints} pts
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {c.totalOrders} orders
                  </td>
                  <td className="py-3 px-4 font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {formatCurrency(c.totalSpent)}
                  </td>
                  <td className="py-3 px-4 text-[#6E6E73] dark:text-[#98989D]">
                    {c.favoriteProduct || '—'}
                  </td>
                  <td className="py-3 px-4 text-[#6E6E73] dark:text-[#98989D]">
                    {formatDateTime(c.lastVisit)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <ChevronRight className="w-4 h-4 inline-block text-[#6E6E73] opacity-60" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Sheet */}
      <Sheet
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name}
        subtitle={selectedCustomer ? formatPhone(selectedCustomer.phone) : ''}
        width="md"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Loyalty & Summary Stats */}
            <div className="p-4 rounded-[16px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B6F5A] dark:text-[#D4BBA5]">
                  Loyalty Points Balance
                </span>
                <span className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {selectedCustomer.loyaltyPoints} pts
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] text-xs">
                <div>
                  <span className="text-[#6E6E73] dark:text-[#98989D]">Total Spent:</span>
                  <p className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {formatCurrency(selectedCustomer.totalSpent)}
                  </p>
                </div>
                <div>
                  <span className="text-[#6E6E73] dark:text-[#98989D]">Total Visits:</span>
                  <p className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {selectedCustomer.totalOrders} visits
                  </p>
                </div>
              </div>

              {selectedCustomer.notes && (
                <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] text-xs">
                  <span className="text-[#6E6E73] dark:text-[#98989D]">Customer Notes / Preference:</span>
                  <p className="italic text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5">
                    {selectedCustomer.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Past Orders by this customer */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">
                Order History ({customerOrders.length})
              </h4>
              <div className="space-y-2">
                {customerOrders.length === 0 ? (
                  <p className="text-xs text-[#6E6E73] py-4 text-center">
                    No orders linked to this customer yet
                  </p>
                ) : (
                  customerOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 rounded-[12px] bg-black/[0.02] dark:bg-white/[0.03] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {ord.orderNumber} · {formatDateTime(ord.createdAt)}
                        </p>
                        <p className="text-[11px] text-[#6E6E73] dark:text-[#98989D]">
                          {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                        </p>
                      </div>
                      <span className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {formatCurrency(ord.total)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Sheet>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Customer"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <Input
            label="Customer Full Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Siriporn Thongchai"
            required
          />

          <Input
            label="Mobile Phone Number *"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0812345678"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="siriporn@example.com"
          />

          <Input
            label="Beverage Preferences / Dietary Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Prefers Oat Milk, No Sugar"
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Create Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
