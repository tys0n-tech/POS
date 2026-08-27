import { create } from 'zustand';
import { Staff } from '../types';
import { initialStaff } from '../data/initialData';

interface StaffState {
  staffList: Staff[];
  currentStaff: Staff;
  isAuthenticated: boolean;
  isPinModalOpen: boolean;
  pinTargetStaffId?: string;
  
  // Actions
  setPinModalOpen: (open: boolean, targetStaffId?: string) => void;
  loginWithPin: (staffId: string, pin: string) => { success: boolean; message?: string };
  switchStaffWithPin: (pin: string, targetStaffId?: string) => { success: boolean; message?: string };
  logout: () => void;
  lockScreen: () => void;
  setCurrentStaff: (staff: Staff) => void;
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, staff: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
}

const STORAGE_KEY = 'northline_pos_staff';
const STORAGE_KEY_AUTH = 'northline_pos_auth';

const loadStaff = (): Staff[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return initialStaff;
};

const staffList = loadStaff();

export const useStaffStore = create<StaffState>((set, get) => ({
  staffList,
  currentStaff: staffList[0] || initialStaff[0],
  isAuthenticated: true,
  isPinModalOpen: false,
  pinTargetStaffId: undefined,

  setPinModalOpen: (open, targetStaffId) => set({ isPinModalOpen: open, pinTargetStaffId: targetStaffId }),

  loginWithPin: (staffId, pin) => {
    const staff = get().staffList.find((s) => s.id === staffId);
    if (!staff) {
      return { success: false, message: 'Staff member not found' };
    }
    if (staff.pin === pin) {
      set({ currentStaff: staff, isAuthenticated: true, isPinModalOpen: false, pinTargetStaffId: undefined });
      return { success: true };
    }
    return { success: false, message: 'Incorrect PIN' };
  },

  switchStaffWithPin: (pin, targetId) => {
    const { staffList, pinTargetStaffId } = get();
    const targetStaffId = targetId || pinTargetStaffId;

    if (targetStaffId) {
      const target = staffList.find((s) => s.id === targetStaffId);
      if (target && target.pin === pin) {
        set({ currentStaff: target, isAuthenticated: true, isPinModalOpen: false, pinTargetStaffId: undefined });
        return { success: true };
      }
      return { success: false, message: 'Invalid PIN for selected staff member' };
    }

    const matched = staffList.find((s) => s.pin === pin && s.active);
    if (matched) {
      set({ currentStaff: matched, isAuthenticated: true, isPinModalOpen: false });
      return { success: true };
    }
    return { success: false, message: 'Invalid PIN' };
  },

  logout: () => {
    set({ isAuthenticated: false, isPinModalOpen: false, pinTargetStaffId: undefined });
  },

  lockScreen: () => {
    set({ isAuthenticated: false, pinTargetStaffId: get().currentStaff.id });
  },

  setCurrentStaff: (staff) => set({ currentStaff: staff, isAuthenticated: true }),

  addStaff: (newStaff) => {
    const staff: Staff = { ...newStaff, id: `staff-${Date.now()}` };
    const updated = [...get().staffList, staff];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ staffList: updated });
  },

  updateStaff: (id, updates) => {
    const updated = get().staffList.map((s) => (s.id === id ? { ...s, ...updates } : s));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    const currentStaff = get().currentStaff.id === id ? { ...get().currentStaff, ...updates } : get().currentStaff;
    set({ staffList: updated, currentStaff });
  },

  deleteStaff: (id) => {
    const updated = get().staffList.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ staffList: updated });
  }
}));
