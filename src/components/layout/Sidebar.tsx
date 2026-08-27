import React from 'react';
import { 
  Coffee, 
  ShoppingBag, 
  LayoutDashboard, 
  Package, 
  Boxes, 
  Users, 
  BarChart3, 
  Settings, 
  ChefHat, 
  CircleDollarSign,
  Lock,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { useStaffStore } from '../../stores/useStaffStore';
import { useShiftStore } from '../../stores/useShiftStore';
import { useTranslation } from '../../hooks/useTranslation';
import { cn } from '../../utils/format';
import { sound } from '../../utils/audio';

export type NavItem = 
  | 'pos' 
  | 'kitchen' 
  | 'orders' 
  | 'products' 
  | 'inventory' 
  | 'customers' 
  | 'staff'
  | 'dashboard' 
  | 'reports' 
  | 'shift' 
  | 'settings';

interface SidebarProps {
  activeTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { currentStaff, setPinModalOpen, lockScreen } = useStaffStore();
  const { currentShift, setShiftDrawerOpen } = useShiftStore();
  const { t } = useTranslation();

  const handleNavClick = (tab: NavItem) => {
    sound.playClick();
    if (tab === 'shift') {
      setShiftDrawerOpen(true);
    } else {
      onSelectTab(tab);
    }
  };

  const navGroups = [
    {
      label: t('nav.operations'),
      items: [
        { id: 'pos' as NavItem, label: t('nav.posTerminal'), icon: Coffee },
        { id: 'kitchen' as NavItem, label: t('nav.kitchenBar'), icon: ChefHat },
        { id: 'orders' as NavItem, label: t('nav.orders'), icon: ShoppingBag }
      ]
    },
    {
      label: t('nav.management'),
      items: [
        { id: 'products' as NavItem, label: t('nav.products'), icon: Package },
        { id: 'inventory' as NavItem, label: t('nav.inventory'), icon: Boxes },
        { id: 'customers' as NavItem, label: t('nav.customers'), icon: Users },
        { id: 'staff' as NavItem, label: t('nav.staffPins'), icon: ShieldCheck }
      ]
    },
    {
      label: t('nav.insights'),
      items: [
        { id: 'dashboard' as NavItem, label: t('nav.overview'), icon: LayoutDashboard },
        { id: 'reports' as NavItem, label: t('nav.reports'), icon: BarChart3 }
      ]
    },
    {
      label: t('nav.system'),
      items: [
        { 
          id: 'shift' as NavItem, 
          label: t('nav.registerShift'), 
          icon: CircleDollarSign,
          badge: currentShift?.status === 'OPEN' ? t('status.open') : t('status.closed')
        },
        { id: 'settings' as NavItem, label: t('nav.settings'), icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#FFFFFF] dark:bg-[#1C1C1E] border-r border-black/[0.06] dark:border-white/[0.08] flex flex-col h-full select-none transition-colors">
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-[#8B6F5A] flex items-center justify-center text-white shadow-sm font-semibold">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-base tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Café POS
            </h1>
            <p className="text-[11px] text-[#6E6E73] dark:text-[#98989D] font-normal tracking-wide">
              Northline Café
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#6E6E73]/70 dark:text-[#98989D]/70 mb-1">
              {group.label}
            </h3>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-xs font-medium transition-all duration-200 active:scale-[0.98]',
                    isActive
                      ? 'bg-black/[0.06] dark:bg-white/[0.12] text-[#1D1D1F] dark:text-[#FFFFFF] font-semibold'
                      : 'text-[#6E6E73] dark:text-[#98989D] hover:bg-black/[0.03] dark:hover:bg-white/[0.06] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn('w-4 h-4', isActive ? 'text-[#8B6F5A] dark:text-[#D4BBA5]' : 'opacity-70')} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-[6px] font-semibold',
                        item.badge === 'Open'
                          ? 'bg-[#34C759]/15 text-[#248A3D] dark:bg-[#34C759]/20 dark:text-[#30D158]'
                          : 'bg-black/5 text-[#6E6E73] dark:bg-white/10 dark:text-[#98989D]'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Staff Account Footer */}
      <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.08]">
        <div className="p-2.5 rounded-[14px] bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {currentStaff.avatar ? (
              <img
                src={currentStaff.avatar}
                alt={currentStaff.name}
                className="w-8 h-8 rounded-full object-cover border border-black/10 dark:border-white/15"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#8B6F5A]/20 text-[#8B6F5A] font-semibold text-xs flex items-center justify-center">
                {currentStaff.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate leading-none">
                {currentStaff.name}
              </p>
              <span className="inline-block text-[10px] text-[#6E6E73] dark:text-[#98989D] uppercase tracking-wider mt-1">
                {currentStaff.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPinModalOpen(true)}
              title="Switch staff account (PIN)"
              className="w-7 h-7 rounded-[8px] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <UserCheck className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                lockScreen();
              }}
              title="Lock Screen / Logout"
              className="w-7 h-7 rounded-[8px] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] text-[#6E6E73] dark:text-[#98989D] hover:text-[#FF3B30] flex items-center justify-center transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
