import React, { useState } from 'react';
import { useStaffStore } from './stores/useStaffStore';
import { AppLayout } from './components/layout/AppLayout';
import { NavItem } from './components/layout/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { POSPage } from './pages/POSPage';
import { KitchenPage } from './pages/KitchenPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { CustomersPage } from './pages/CustomersPage';
import { StaffPage } from './pages/StaffPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const { isAuthenticated } = useStaffStore();
  const [activeTab, setActiveTab] = useState<NavItem>('pos');

  // If not authenticated or screen is locked, render Apple-style Login / Lock Screen
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'pos':
        return <POSPage />;
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
      {renderActivePage()}
    </AppLayout>
  );
};

export default App;
