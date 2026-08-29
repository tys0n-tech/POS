import React, { useState, useEffect } from 'react';
import { useStaffStore } from './stores/useStaffStore';
import { useOrderStore } from './stores/useOrderStore';
import { AppLayout } from './components/layout/AppLayout';
import { NavItem } from './components/layout/Sidebar';
import { hasPermission, getDefaultTabForRole } from './utils/rbac';
import { LoginPage } from './pages/LoginPage';
import { POSPage } from './pages/POSPage';
import { TablesPage } from './pages/TablesPage';
import { KitchenPage } from './pages/KitchenPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { CustomersPage } from './pages/CustomersPage';
import { StaffPage } from './pages/StaffPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const STORAGE_KEY_TAB = 'northline_pos_active_tab';

const getInitialTab = (): NavItem => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TAB);
    if (saved) return saved as NavItem;
  } catch (e) {
    console.error(e);
  }
  return 'pos';
};

export const App: React.FC = () => {
  const { currentStaff, isAuthenticated } = useStaffStore();
  const { initializeRealtime } = useOrderStore();
  const [activeTab, setActiveTabState] = useState<NavItem>(getInitialTab);

  const setActiveTab = (tab: NavItem) => {
    localStorage.setItem(STORAGE_KEY_TAB, tab);
    setActiveTabState(tab);
  };

  // Supabase Realtime Channel Subscription for live Orders
  useEffect(() => {
    const unsubscribe = initializeRealtime();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [initializeRealtime]);

  // Ensure user is on a permitted tab
  useEffect(() => {
    if (isAuthenticated && currentStaff) {
      if (!hasPermission(currentStaff.role, activeTab)) {
        setActiveTab(getDefaultTabForRole(currentStaff.role));
      }
    }
  }, [currentStaff, activeTab, isAuthenticated]);

  // If not authenticated or screen is locked, render Apple-style Login / Lock Screen
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'pos':
        return <POSPage />;
      case 'tables':
        return <TablesPage />;
      case 'kitchen':
        return <KitchenPage />;
      case 'orders':
        return <OrdersPage />;
      case 'products':
        return <ProductsPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'customers':
        return <CustomersPage />;
      case 'staff':
        return <StaffPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <POSPage />;
    }
  };

  return (
    <AppLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {renderActivePage()}
      </div>
    </AppLayout>
  );
};

export default App;
