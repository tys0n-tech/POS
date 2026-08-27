import React, { useState, useEffect } from 'react';
import { Sidebar, NavItem } from './Sidebar';
import { TopBar } from './TopBar';
import { GlobalSearchModal } from './GlobalSearchModal';
import { StaffPinModal } from './StaffPinModal';
import { ShiftDrawerModal } from './ShiftDrawerModal';
import { ToastContainer } from '../ui/ToastContainer';
import { 
  Coffee, 
  ChefHat, 
  ShoppingBag, 
  LayoutDashboard, 
  Boxes 
} from 'lucide-react';
import { cn } from '../../utils/format';

interface AppLayoutProps {
  activeTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  onSelectTab,
  children
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global keyboard shortcuts: "/" or "Cmd/Ctrl + K" for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const pageTitles: Record<NavItem, string> = {
    pos: 'Point of Sale',
    kitchen: 'Kitchen Display System',
    orders: 'Order Management',
    products: 'Product Catalog',
    inventory: 'Inventory & Stock Control',
    customers: 'Customer Directory',
    staff: 'Staff & Access Control',
    dashboard: 'Business Overview',
    reports: 'Analytics & Reports',
    shift: 'Register & Shift',
    settings: 'Store Settings'
  };

  const mobileNavItems: { id: NavItem; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'pos', label: 'POS', icon: Coffee },
    { id: 'kitchen', label: 'KDS', icon: ChefHat },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'inventory', label: 'Stock', icon: Boxes },
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard }
  ];

  return (
    <div className="flex h-full w-full bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0 h-full">
        <Sidebar activeTab={activeTab} onSelectTab={onSelectTab} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <TopBar
          pageTitle={pageTitles[activeTab]}
          onOpenSearch={() => setIsSearchOpen(true)}
          onNavigateTab={(tab) => onSelectTab(tab as NavItem)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden flex items-center justify-around h-16 bg-[#FFFFFF] dark:bg-[#1C1C1E] border-t border-black/[0.06] dark:border-white/[0.08] px-2 shrink-0 select-none z-30">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={cn(
                  'flex flex-col items-center justify-center w-14 h-12 rounded-[12px] transition-all',
                  isActive
                    ? 'text-[#8B6F5A] dark:text-[#D4BBA5] font-semibold'
                    : 'text-[#6E6E73] dark:text-[#98989D]'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modals and Overlays */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateTab={(tab) => onSelectTab(tab as NavItem)}
      />

      <StaffPinModal />
      <ShiftDrawerModal />
      <ToastContainer />
    </div>
  );
};
