import React, { useState } from 'react';
import { useStaffStore } from '../stores/useStaffStore';
import { useToastStore } from '../stores/useToastStore';
import { Staff, StaffRole } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { formatPhone, cn } from '../utils/format';
import { sound } from '../utils/audio';
import { 
  UserCheck, 
  UserPlus, 
  KeyRound, 
  ShieldCheck, 
  Edit2, 
  Trash2, 
  Lock,
  LogOut
} from 'lucide-react';

export const StaffPage: React.FC = () => {
  const { staffList, currentStaff, addStaff, updateStaff, deleteStaff, setCurrentStaff, lockScreen } = useStaffStore();
  const { showToast } = useToastStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [role, setRole] = useState<StaffRole>('CASHIER');
  const [pin, setPin] = useState('0000');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleOpenAdd = () => {
    sound.playClick();
    setEditingStaff(null);
    setName('');
    setRole('CASHIER');
    setPin('1234');
    setEmail('');
    setPhone('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: Staff) => {
    sound.playClick();
    setEditingStaff(s);
    setName(s.name);
    setRole(s.role);
    setPin(s.pin);
    setEmail(s.email);
    setPhone(s.phone);
    setIsAddModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || pin.length !== 4) {
      showToast({ type: 'error', title: 'Invalid PIN', message: 'PIN must be exactly 4 digits' });
      return;
    }

    if (editingStaff) {
      updateStaff(editingStaff.id, {
        name,
        role,
        pin,
        email: email || `${name.toLowerCase()}@northline.cafe`,
        phone: phone || '0812345678'
      });
      sound.playSuccess();
      showToast({ type: 'success', title: 'Staff Updated', message: name });
    } else {
      addStaff({
        name,
        role,
        pin,
        email: email || `${name.toLowerCase()}@northline.cafe`,
        phone: phone || '0812345678',
        active: true
      });
      sound.playSuccess();
      showToast({ type: 'success', title: 'Staff Created', message: name });
    }

    setIsAddModalOpen(false);
  };

  const getRoleBadge = (role: StaffRole) => {
    switch (role) {
      case 'OWNER':
        return <Badge variant="coffee">Owner</Badge>;
      case 'MANAGER':
        return <Badge variant="blue">Manager</Badge>;
      case 'CASHIER':
        return <Badge variant="success">Cashier</Badge>;
      case 'BARISTA':
        return <Badge variant="warning">Barista</Badge>;
      default:
        return <Badge variant="neutral">{role}</Badge>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 lg:p-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Staff & Access Control
          </h2>
          <p className="text-xs text-[#6E6E73] dark:text-[#98989D]">
            Manage staff roles, 4-digit Cashier PINs, and shift permissions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Lock className="w-4 h-4" />}
            onClick={() => {
              sound.playClick();
              lockScreen();
            }}
          >
            Lock Screen
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="flex-1 bg-[#FFFFFF] dark:bg-[#1C1C1E] rounded-[20px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-black/[0.02] dark:bg-white/[0.03] border-b border-black/[0.06] dark:border-white/[0.08] text-[#6E6E73] dark:text-[#98989D] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Staff Member</th>
                <th className="py-3.5 px-4">Role & Access</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">PIN Code</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {staffList.map((staff) => {
                const isCurrent = currentStaff.id === staff.id;
                return (
                  <tr
                    key={staff.id}
                    className={cn(
                      'h-16 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors',
                      isCurrent && 'bg-[#8B6F5A]/5 dark:bg-[#8B6F5A]/10'
                    )}
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        {staff.avatar ? (
                          <img
                            src={staff.avatar}
                            alt={staff.name}
                            className="w-10 h-10 rounded-full object-cover border border-black/10 dark:border-white/10"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#8B6F5A]/20 text-[#8B6F5A] font-bold text-sm flex items-center justify-center">
                            {staff.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                              {staff.name}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded bg-[#34C759]/20 text-[#34C759] text-[9px] font-bold">
                                Current Active
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#6E6E73] dark:text-[#98989D]">
                            ID: {staff.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getRoleBadge(staff.role)}
                    </td>
                    <td className="py-3.5 px-4 text-[#6E6E73] dark:text-[#98989D]">
                      {staff.email}
                    </td>
                    <td className="py-3.5 px-4 text-[#6E6E73] dark:text-[#98989D] font-mono">
                      {formatPhone(staff.phone)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-1 rounded bg-black/[0.04] dark:bg-white/[0.08] font-mono font-bold text-xs tracking-widest text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {staff.pin}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#34C759]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {!isCurrent && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            sound.playSuccess();
                            setCurrentStaff(staff);
                            showToast({ type: 'success', title: 'Active User Switched', message: staff.name });
                          }}
                        >
                          Switch
                        </Button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(staff)}
                        className="p-1.5 rounded-[8px] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {staffList.length > 1 && !isCurrent && (
                        <button
                          type="button"
                          onClick={() => {
                            deleteStaff(staff.id);
                            showToast({ type: 'warning', title: 'Staff Removed', message: staff.name });
                          }}
                          className="p-1.5 rounded-[8px] hover:bg-black/[0.04] text-[#FF3B30]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingStaff ? `Edit ${editingStaff.name}` : 'Add New Staff Member'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveStaff} className="space-y-4">
          <Input
            label="Staff Full Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tyson S."
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select<StaffRole>
              label="Staff Role"
              value={role}
              onChange={setRole}
              options={[
                { value: 'CASHIER', label: 'Cashier', description: 'POS & Order checkout' },
                { value: 'BARISTA', label: 'Barista', description: 'KDS Kitchen & Brewing' },
                { value: 'MANAGER', label: 'Manager', description: 'Operations & Stock control' },
                { value: 'OWNER', label: 'Owner', description: 'Full administrator access' }
              ]}
            />

            <Input
              label="4-Digit PIN Code *"
              type="text"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="1234"
              required
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@northline.cafe"
          />

          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0812345678"
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
              Save Staff Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
