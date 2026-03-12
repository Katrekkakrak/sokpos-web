import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import Storefront from './src/pages/Storefront';
import TrackOrder from './src/pages/TrackOrder';
import Login from './components/Login';
import OrderHistory from './src/pages/OrderHistory';
import SetupShop from './src/pages/SetupShop';
import MainLayout from './components/MainLayout';
import Dashboard from './components/Dashboard';
import StaffDashboard from './components/StaffDashboard';
import PosTerminal from './components/PosTerminal';
import PaymentModal from './components/PaymentModal';
import OnlineOrdersBoard from './components/OnlineOrdersBoard';
import OrderDetail from './components/OrderDetail';
import CreateOrderModal from './components/CreateOrderModal';
import ShippingSetupModal from './components/ShippingSetupModal';
import ShippingLabelPreview from './components/ShippingLabelPreview';
import CrmDirectory from './components/CrmDirectory';
import AddLeadModal from './components/AddLeadModal';
import CustomerProfile from './components/CustomerProfile';
import DepositModal from './components/DepositModal';
import InventoryList from './components/InventoryList';
import ProductForm from './components/ProductForm';
import StockAdjustment from './components/StockAdjustment';
import BarcodeGenerator from './components/BarcodeGenerator';
import ShopSettings from './components/ShopSettings';
import HardwareSetup from './components/HardwareSetup';
import StaffManagement from './components/StaffManagement';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import TenantList from './components/TenantList';
// Batch 7+ imports
import SplitBillModal from './components/SplitBillModal';
import HoldOrdersList from './components/HoldOrdersList';
import ReceiptHistory from './components/ReceiptHistory';
import DiscountTaxSetup from './components/DiscountTaxSetup';
import RefundReturn from './components/RefundReturn';
import SupplierList from './components/SupplierList';
import PurchaseOrdersManagement from './components/PurchaseOrdersManagement';
import CreatePO from './components/CreatePO';
import PredictiveAnalytics from './components/PredictiveAnalytics';
import StockTransfer from './components/StockTransfer';
import StockAudit from './components/StockAudit';
import LoyaltySetup from './components/LoyaltySetup';
import CustomerTiers from './components/CustomerTiers';
import BroadcastCenter from './components/BroadcastCenter';
import VoucherList from './components/VoucherList';
import FeedbackList from './components/FeedbackList';
import CourierList from './components/CourierList';
import CODSettlement from './components/CODSettlement';
import AbandonedOrders from './components/AbandonedOrders';
import ShippingRates from './components/ShippingRates';
import OrderTracking from './components/OrderTracking';
// Batch 11 & 12 imports
import AuditLog from './components/AuditLog';
import RolePermissions from './components/RolePermissions';
import SubscriptionBilling from './components/SubscriptionBilling';
import SecuritySettings from './components/SecuritySettings';
import ForgotPassword from './components/ForgotPassword';
import ShopOnboarding from './components/ShopOnboarding';
import AccountSuspended from './components/AccountSuspended';
import NotificationCenter from './components/NotificationCenter';
import NotFound404 from './components/NotFound404';
import SokAcademy from './src/components/SokAcademy';
import ExpenseManager from './components/ExpenseManager';
import Omnichannel from './components/Omnichannel';
import SokAssistant from './components/SokAssistant';
import PricingPage from './components/PricingPage';
import SokNotes from './components/SokNotes';


/**
 * POSApp Component
 * Main POS application logic wrapped with DataProvider
 * This is shown ONLY when accessing the POS at the root path
 */
const POSApp: React.FC = () => {
  return (
    <DataProvider>
      <POSAppContent />
    </DataProvider>
  );
};

/**
 * POSAppContent Component
 * Core POS application UI and routing logic
 * Requires DataProvider context to be available
 */
const POSAppContent = () => {
  const {
      user, currentView,
      setCurrentView,
      isPaymentModalOpen, isCreateOrderModalOpen, isShippingSetupModalOpen,
      isAddLeadModalOpen, isDepositModalOpen,
      isSplitBillModalOpen, isHoldOrdersOpen,
      isShippingLabelModalOpen,
      subscription
  } = useData();
  const location = useLocation();

  // Sync URL path with the internal `currentView` state
  useEffect(() => {
    if (location.pathname.startsWith('/academy') && currentView !== 'sok-academy') {
      setCurrentView('sok-academy');
    }
    if (location.pathname.startsWith('/expense') && currentView !== 'expense-manager') {
      setCurrentView('expense-manager');
    }
    if (location.pathname.startsWith('/omnichannel') && currentView !== 'omnichannel') {
      setCurrentView('omnichannel');
    }
    if (location.pathname.startsWith('/assistant') && currentView !== 'assistant') {
      setCurrentView('assistant');
    }
    // This pattern can be expanded for other routes in the future.
  }, [location.pathname, currentView, setCurrentView]);

  // 1. Check for Public/Unauthenticated Routes (Full Screen)
  if (currentView === 'shop-onboarding') return <ShopOnboarding />;
  if (currentView === 'forgot-password') return <ForgotPassword />;
  if (currentView === 'order-tracking') return <OrderTracking />; 
  if (currentView === 'setupShop') return <SetupShop />;

  // 2. Authentication Check
  if (!user) {
    return <Login />;
  }

  // 3. Subscription Status Check
  if (user.role !== 'Super Admin' && (subscription.status === 'Suspended' || subscription.status === 'Expired')) {
      return <AccountSuspended />;
  }

  // 4. Specialized Full Screen Views (Bypass MainLayout)
  // These views typically have their own layout structure or print views
  if (currentView === 'barcode-generator') return <BarcodeGenerator />;
  if (currentView === 'super-admin-dashboard') return <SuperAdminDashboard />;
  if (currentView === 'tenant-list') return <TenantList />;
  if (currentView === 'not-found') return <NotFound404 />;

  return (
    <>
        <MainLayout>
            {/* Core Views */}
            {currentView === 'dashboard' && (
              ['online_sales', 'online_sales_lead'].includes(user?.role || '') 
                ? <StaffDashboard /> 
                : <Dashboard />
            )}
            {currentView === 'pos' && <PosTerminal />}
            {currentView === 'online-orders' && <OnlineOrdersBoard />}
            {currentView === 'order-details' && <OrderDetail />}
            {currentView === 'crm-directory' && <CrmDirectory />}
            {currentView === 'customer-profile' && <CustomerProfile />}
            
            {/* Inventory Routes */}
            {currentView === 'inventory-list' && <InventoryList />}
            {currentView === 'product-form' && <ProductForm />}
            {currentView === 'stock-adjustment' && <StockAdjustment />}

            {/* Settings Routes */}
            {currentView === 'shop-settings' && <ShopSettings />}
            {currentView === 'hardware-setup' && <HardwareSetup />}
            {currentView === 'staff-management' && <StaffManagement />}
            {currentView === 'discount-tax' && <DiscountTaxSetup />}
            {currentView === 'refund-return' && <RefundReturn />}
            {currentView === 'subscription-billing' && <SubscriptionBilling />}

            {/* Logistics & Suppliers */}
            {currentView === 'supplier-list' && <SupplierList />}
            {currentView === 'purchase-orders' && <PurchaseOrdersManagement />}
            {currentView === 'create-po' && <CreatePO />}
            {currentView === 'courier-list' && <CourierList />}
            {currentView === 'shipping-rates' && <ShippingRates />}
            {currentView === 'cod-settlement' && <CODSettlement />}
            {currentView === 'abandoned-orders' && <AbandonedOrders />}

            {/* Marketing & Loyalty */}
            {currentView === 'loyalty-setup' && <LoyaltySetup />}
            {currentView === 'customer-tiers' && <CustomerTiers />}
            {currentView === 'broadcast-center' && <BroadcastCenter />}
            {currentView === 'voucher-list' && <VoucherList />}
            {currentView === 'feedback-list' && <FeedbackList />}
            
            {/* Logs & Other */}
            {currentView === 'audit-log' && <AuditLog />}
            {currentView === 'receipt-history' && <ReceiptHistory />}
            {currentView === 'stock-transfer' && <StockTransfer />}
            {currentView === 'stock-audit' && <StockAudit />}
            {currentView === 'predictive-analytics' && <PredictiveAnalytics />}
            {currentView === 'role-permissions' && <RolePermissions />}
            {currentView === 'security-settings' && <SecuritySettings />}
            {currentView === 'notification-center' && <NotificationCenter />}
            {currentView === 'account-suspended' && <AccountSuspended />}
            {currentView === 'sok-academy' && <SokAcademy />}
            {currentView === 'expense-manager' && <ExpenseManager />}
            {currentView === 'omnichannel' && <Omnichannel />}
            {currentView === 'assistant' && <SokAssistant />}
            {currentView === 'pricing' && <PricingPage />}
            {currentView === 'sok-notes' && <SokNotes />}
        </MainLayout>

        {/* Global Modals (Siblings to Layout) */}
        {isPaymentModalOpen && <PaymentModal />}
        {isCreateOrderModalOpen && <CreateOrderModal />}
        {isShippingSetupModalOpen && <ShippingSetupModal />}
        {isAddLeadModalOpen && <AddLeadModal />}
        {isDepositModalOpen && <DepositModal />}
        {isSplitBillModalOpen && <SplitBillModal />}
        {isHoldOrdersOpen && <HoldOrdersList />}
        {isShippingLabelModalOpen && <ShippingLabelPreview />}
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Storefront Route - No authentication required */}
          <Route path="/store/:shopId" element={<Storefront />} />
          <Route path="/store/:shopId/track" element={<TrackOrder />} />
          <Route path="/store/:shopId/history" element={<OrderHistory />} />
          <Route path="/setup-shop" element={<SetupShop />} />

          {/* Route for Academy, which will render inside the main POSApp layout */}
          <Route path="/academy" element={<POSApp />} />

          {/* Route for Expense Manager, which will render inside the main POSApp layout */}
          <Route path="/expense" element={<POSApp />} />

          {/* Private POS Application Routes - Requires authentication via DataProvider */}
          <Route path="/*" element={<POSApp />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
