import { StaffRole } from '../types';
import { NavItem } from '../components/layout/Sidebar';

export const ROLE_PERMISSIONS: Record<StaffRole, NavItem[]> = {
  OWNER: [
    'pos',
    'tables',
    'kitchen',
    'orders',
    'products',
    'inventory',
    'customers',
    'staff',
    'dashboard',
    'reports',
    'shift',
    'settings'
  ],
  MANAGER: [
    'pos',
    'tables',
    'kitchen',
    'orders',
    'products',
    'inventory',
    'customers',
    'staff',
    'dashboard',
    'reports',
    'shift',
    'settings'
  ],
  CASHIER: [
    'pos',
    'tables',
    'orders',
    'customers',
    'shift'
  ],
  BARISTA: [
    'kitchen',
    'orders',
    'inventory',
    'shift'
  ]
};

export const hasPermission = (role: StaffRole, tab: NavItem): boolean => {
  return ROLE_PERMISSIONS[role].includes(tab);
};

export const getDefaultTabForRole = (role: StaffRole): NavItem => {
  return ROLE_PERMISSIONS[role][0] || 'pos';
};
