
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { sendLowStockAlert, sendReceiptAlert } from '../utils/telegramAlert';
import { auth, db, app } from '../src/config/firebase';
import { initializeApp as initApp, deleteApp as delApp } from 'firebase/app';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, deleteDoc, onSnapshot, updateDoc, addDoc } from 'firebase/firestore';

// --- Types ---

export interface Branch {
  id: string;
  name: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'chat' | 'note' | 'system' | 'order';
  title: string;
  description: string;
  timestamp: Date | string;
  metadata?: any;
}

export interface NoteCategory {
  id: string;
  label: string;
  color: string;
}

export interface InterestedProduct {
    id: number;
    name: string;
    qty: number;
    price: number;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  mapLink?: string;
  profileLink?: string; // Social media profile link (Facebook, Telegram, etc.)
  avatar: string;
  source?: string;
  status: string | string[];
  tags?: string[];
  notes?: string;
  joinedDate?: string;
  walletBalance: number;
  totalDebt: number;
  totalSpent: number;
  activities: Activity[];
  customData?: Record<string, any>;
  interestedProducts?: InterestedProduct[]; // New field
}

export interface ContactStage {
  id: string;
  name: string;
  colorClass: string;
  iconName: string;
  isDefault?: boolean;
}

export interface CustomerInfo {
    name: string;
    phone: string;
    address: string;
    avatar: string;
    type?: string;
}

export interface ProductVariant {
    id: string;
    name: string;
    sku: string;
    stock: number;
    price: number;
}

export interface ProductUnit {
    unitId: string;
    name: string;           // e.g., "Case", "Pack", "Can", "Cup"
    multiplier: number;     // e.g., 24 (if 1 Case = 24 Cans). Always 1 for the base unit.
    price: number;          // Selling price for this specific unit
    barcode?: string;       // Optional barcode for this specific unit
}

export interface ProductBatch {
    batchId: string;
    quantity: number;       // Stock available in this specific batch (in base units)
    expiryDate: string;     // e.g., "2026-04-01" (YYYY-MM-DD format)
}

export interface Product {
    id: number;
    name: string;
    nameKh?: string;
    category: string;
    price: number;          // Keep for backward compatibility
    cost?: number;
    stock: number;          // Total inventory count in BASE units
    image: string;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    sku?: string;
    barcode?: string;       // Product-level barcode for fallback scanning
    variants?: ProductVariant[];
    description?: string;
    // --- NEW UOM FIELDS ---
    baseUnit: string;       // The smallest unit tracked in inventory (e.g., "Can", "Piece", "Cup")
    units: ProductUnit[];   // Array of available packaging sizes/units
    // --- NEW BATCH MANAGEMENT (FEFO) ---
    batches?: ProductBatch[]; // Array of batch records with expiry dates for FEFO deduction
}

export interface CartItem extends Product {
    quantity: number;
    unitId?: string;          // e.g., "u1" for Case unit
    selectedUnit?: string;    // e.g., "Case", "Pack", "Can"
    multiplier?: number;      // e.g., 24 for Case (1 Case = 24 Cans)
    selectedUnitPrice?: number; // Price for this specific unit
}

export interface Order {
    id: string;
    customer: CustomerInfo | null; // Can be null for walk-in
    date: Date | string;
    status: 'Paid' | 'Pending' | 'Cancelled' | 'Refunded' | 'Completed' | 'New' | 'Packing' | 'Shipping' | 'Draft';
    total: number;
    subtotal: number;
    tax: number;
    discount: number;
    shippingFee: number;
    items: CartItem[];
    method?: string; // Payment method
    branchId?: string;
    amountPaid: number;
    debtAmount: number;
}

export interface DriverInfo {
    name: string;
    avatar: string;
    eta: string;
}

export interface ShippingDetails {
    courier: string;
    trackingNumber: string;
    fee: number;
    zone?: string; // New: Shipping Zone
}

export interface OnlineOrder extends Order {
    paymentStatus: 'Paid' | 'COD' | 'Pending' | 'Verified' | 'Settled';
    elapsedTime?: string;
    driver?: DriverInfo;
    shippingDetails?: ShippingDetails;
    customer: CustomerInfo; // Online orders must have customer info
    paymentMethod?: string;
    shippingCarrier?: string; 
    source?: string; // Order Source (Facebook, Telegram, etc.)
    transactionId?: string; // Bank Transaction ID
    deliveryDate?: string; // New: Scheduled Delivery Date
    bankSlipImage?: string | null; // Bank Slip Image URL or base64
    branchId?: string;
}

export interface Staff {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Cashier' | 'Packer';
    password?: string; // Changed from pin to password (optional because not stored in DB)
    status: 'Active' | 'Inactive';
    avatar: string;
    tenantId?: string; 
    isStaff?: boolean;
}

export interface Tenant {
    id: string;
    name: string;
    subName: string;
    owner: string;
    email: string;
    phone: string;
    plan: 'Trial' | 'Pro' | 'Enterprise';
    status: 'Active' | 'Suspended';
    joinedDate: string;
    expiryDate: string;
    logo: string;
    mrr: number; // Monthly Recurring Revenue
}

export interface Discount {
    id: string;
    name: string;
    type: 'Percentage' | 'Fixed Amount';
    value: number;
    startDate: string;
    endDate: string;
}

export interface PurchaseOrderItem {
    productId: number;
    productName: string;
    quantity: number;
    unit: string;
    unitCost: number;
    total: number;
    sku: string;
}

export interface PurchaseOrder {
    id: string;
    supplierId: string;
    supplierName: string;
    date: Date | string;
    status: 'Draft' | 'Sent' | 'Pending' | 'Received' | 'Cancelled';
    totalAmount: number;
    items: PurchaseOrderItem[];
    warehouse: string;
    refNo?: string;
    autoGenerated?: boolean;  // Flag for auto-generated POs
    triggerProductId?: number; // Product ID that triggered the auto-generation
    triggerThreshold?: number; // Stock threshold that triggered this PO
}

export interface LoyaltySettings {
    enabled: boolean;
    earnSpend: number;
    earnPoints: number;
    redeemPoints: number;
    redeemValue: number;
}

export interface CustomerTier {
    id: string;
    name: string;
    minSpend: number;
    discount: number;
    color: string;
    badgeIcon: string;
}

export interface Voucher {
    id: string;
    code: string;
    type: 'Percentage' | 'Fixed Amount';
    value: number;
    limit: number;
    used: number;
    expiryDate: string;
    status: 'Active' | 'Expired';
}

export interface Permission {
    id: string;
    name: string;
    nameKh: string;
    group: 'POS' | 'Inventory' | 'Reports' | 'Settings';
    enabled: boolean;
}

export interface Role {
    id: string;
    name: string;
    nameKh: string;
    isSystem: boolean;
    permissions: Permission[];
}

export interface CustomFieldDef {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select';
    options?: string[];
}

export interface Supplier {
    id: string;
    name: string;
    phone: string;
    email: string;
    category: string;
    outstandingDebt: number;
    logo?: string;
}

export interface Courier {
    id: string;
    name: string;
    phone: string;
    baseRate: number;
    logo: string;
    status: 'Active' | 'Inactive';
}

export interface ShippingRate {
    id: string;
    province: string;
    provinceKh: string;
    rate: number;
    duration: string;
    status: 'Active' | 'Inactive';
}

export interface ShippingZone {
    id: string;
    name: string;
    price: number;
}

export interface AuditLogItem {
    id: string;
    date: Date;
    staffId: string;
    staffName: string;
    actionType: 'Login' | 'Create' | 'Update' | 'Delete' | 'All';
    description: string;
    device: string;
    ip: string;
    isCritical?: boolean;
}

export interface Session {
    id: string;
    device: string;
    location: string;
    ip: string;
    lastActive: string;
    isCurrent: boolean;
}

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'info' | 'warning' | 'success' | 'alert';
    read: boolean;
    dateCategory: 'Today' | 'Yesterday' | 'Earlier';
}

export interface FeedbackItem {
    id: string;
    customerName: string;
    avatar: string;
    date: string;
    rating: number;
    comment: string;
    status: 'Pending' | 'Responded';
}

export interface HoldOrder {
    id: string;
    customerName: string;
    date: Date;
    items: CartItem[];
    total: number;
}

export interface User {
    name: string;
    role: string;
    avatar: string;
    tenantId?: string;
    isStaff?: boolean;
}

export interface ShopSettings {
    name: string;
    phone: string;
    email: string;
    address: string;
    logo: string;
    timezone: string;
    currency: string;
    taxRate: number;
    telegramToken?: string;
    telegramChatId?: string;
}

export interface StockAdjustment {
    id: number;
    productId: number;
    productName: string;
    oldStock: number;
    newStock: number;
    difference: number;      // newStock - oldStock (positive = added, negative = removed)
    date: string;            // ISO timestamp
    employee: string;        // Who performed the adjustment
    reason?: string;         // Optional: reason for adjustment (e.g., "Physical Count Mobile App")
}

interface DataContextType {
    user: any | null;
    authLoading: boolean;
    login: (email: string, pass: string) => Promise<{success: boolean, message?: string}>;
    registerShop: (email: string, pass: string, shopName: string) => Promise<{success: boolean, message?: string}>;
    logout: () => Promise<void>;
    
    // Branch System
    branches: Branch[];
    currentBranch: string;
    setCurrentBranch: (branchId: string) => void;
    
    currentView: string;
    setCurrentView: (view: string) => void;
    
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    
    // Modals
    isPaymentModalOpen: boolean;
    setIsPaymentModalOpen: (isOpen: boolean) => void;
    isCreateOrderModalOpen: boolean;
    setIsCreateOrderModalOpen: (isOpen: boolean) => void;
    isShippingSetupModalOpen: boolean;
    setIsShippingSetupModalOpen: (isOpen: boolean) => void;
    isAddLeadModalOpen: boolean;
    setIsAddLeadModalOpen: (isOpen: boolean) => void;
    isDepositModalOpen: boolean;
    setIsDepositModalOpen: (isOpen: boolean) => void;
    isSplitBillModalOpen: boolean;
    setIsSplitBillModalOpen: (isOpen: boolean) => void;
    isHoldOrdersOpen: boolean;
    setIsHoldOrdersOpen: (isOpen: boolean) => void;
    isVariantModalOpen: boolean;
    setIsVariantModalOpen: (isOpen: boolean) => void;
    // New: Shipping Label Modal
    isShippingLabelModalOpen: boolean;
    setIsShippingLabelModalOpen: (isOpen: boolean) => void;

    // Subscription
    subscription: { status: string; plan: string; expiryDate: Date };
    renewSubscription: (plan: string) => void;

    // POS & Orders
    products: Product[];
    categories: string[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => void; // Updated signature
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, delta: number) => void;
    clearCart: () => void;
    cartTotal: number;
    taxAmount: number;
    finalTotal: number;
    createOrder: (method: string, amount: number) => Promise<void>;
    
    // POS Context (New)
    posCustomer: Contact | null;
    setPosCustomer: (contact: Contact | null) => void;

    // Online Orders
    onlineOrders: OnlineOrder[];
    selectedOnlineOrder: OnlineOrder | null;
    selectOnlineOrder: (id: string) => void;
    updateOrderStatus: (id: string, status: string) => void;
    // Updated signature for Carrier + Source + TransactionID + Discount + DeliveryDate + Zone + BankSlipImage
    createOnlineOrder: (customer: CustomerInfo, items: CartItem[], shippingFee: number, paymentMethod: string, carrier?: string, source?: string, transactionId?: string, discount?: number, deliveryDate?: string, zone?: string, bankSlipImage?: string | null) => Promise<void>;
    verifyPayment: (id: string, verified: boolean) => void;
    setOrderShipping: (id: string, details: any) => void;
    updateOrderCustomer: (id: string, customer: Partial<CustomerInfo>) => void;
    editingOrder: OnlineOrder | null;
    setEditingOrder: (order: OnlineOrder | null) => void;
    updateOnlineOrder: (id: string, updatedData: any, preventRedirect?: boolean) => Promise<void>;
    deleteOnlineOrder: (id: string) => void;
    holdOrders: HoldOrder[];
    resumeOrder: (id: string) => void;
    removeHoldOrder: (id: string) => void;
    settleCOD: (ids: string[]) => void;
    
    // Draft Online Order (New)
    draftOnlineOrder: { customer: Contact; items: InterestedProduct[] } | null;
    setDraftOnlineOrder: (draft: { customer: Contact; items: InterestedProduct[] } | null) => void;

    // Prefill Order Data (New)
    prefillOrderData: any;
    setPrefillOrderData: (data: any) => void;

    // CRM
    customers: Contact[];
    leads: Contact[];
    selectedContact: Contact | null;
    setSelectedContact: (contact: Contact | null) => void;
    editingContact: Contact | null;
    setEditingContact: (contact: Contact | null) => void;
    addLead: (lead: Partial<Contact>) => void;
    addCustomer: (customer: Partial<Contact>) => Promise<Contact | undefined>;
    updateCustomer: (id: string, data: Partial<Contact>, preventRedirect?: boolean) => Promise<void>;
    deleteCustomer: (id: string) => Promise<void>;
    updateLead: (id: string, data: Partial<Contact>) => void;
    addDeposit: (contactId: string, amount: number, ref: string) => void;
    feedbacks: FeedbackItem[];
    loyaltySettings: LoyaltySettings;
    saveLoyaltySettings: (settings: LoyaltySettings) => void;
    customerTiers: CustomerTier[];
    addCustomerTier: (tier: Partial<CustomerTier>) => void;
    noteCategories: NoteCategory[];
    setNoteCategories: (categories: NoteCategory[]) => void;
    
    // Contact Stages (Dynamic)
    contactStages: ContactStage[];
    setContactStages: (stages: ContactStage[]) => void;
    
    // Inventory
    setEditingProduct: (product: Product | null) => void;
    editingProduct: Product | null;
    addProduct: (product: Partial<Product>) => Promise<void>;
    updateProduct: (id: number, data: Partial<Product>, preventRedirect?: boolean) => Promise<void>;
    deleteProduct: (id: number | string) => Promise<void>;
    adjustStock: (productId: number, variantId: string | null, qty: number, reason: string) => void;
    performStockAudit: (updates: {productId: number, actualStock: number}[]) => void;
    addStockTransfer: (transfer: any) => void;

    // Mobile Stock Taking API (NEW)
    stockAdjustments: StockAdjustment[];
    syncMobileStockTake: (scannedData: { productId: number | string, countedStock: number }[], employeeName: string, reason?: string) => Promise<{ success: boolean; message: string; adjustments: StockAdjustment[] }>;


    // Staff
    staff: Staff[];
    addStaff: (staff: Partial<Staff>) => Promise<void>;
    currentStaff: Staff | null;
    setCurrentStaff: (staff: Staff | null) => void;
    updateStaff: (id: string, staff: Partial<Staff>) => Promise<void>;
    deleteStaff: (id: string) => Promise<void>;
    updateStaffStatus: (id: string, status: string) => Promise<void>;
    roles: Role[];
    updateRolePermissions: (roleId: string, permissions: Permission[]) => void;

    // Suppliers & Purchasing
    suppliers: Supplier[];
    addSupplier: (supplier: Partial<Supplier>) => void;
    purchaseOrders: PurchaseOrder[];
    createPO: (po: Partial<PurchaseOrder>) => void;

    // Logistics
    couriers: Courier[];
    addCourier: (courier: Partial<Courier>) => void;
    shippingRates: ShippingRate[];
    updateShippingRate: (id: string, data: Partial<ShippingRate>) => void;
    shippingZones: ShippingZone[];
    setShippingZones: (zones: ShippingZone[]) => void;

    // Marketing
    vouchers: Voucher[];
    createVoucher: (voucher: Partial<Voucher>) => void;
    sendBroadcastMessage: (audience: string, channel: string, message: string) => void;

    // System
    shopSettings: ShopSettings;
    updateShopSettings: (settings: ShopSettings) => Promise<void>;
    auditLogs: AuditLogItem[];
    userSecurity: { twoFactorEnabled: boolean };
    toggle2FA: () => void;
    activeSessions: Session[];
    revokeSession: (id: string) => void;
    notifications: NotificationItem[];
    markAllNotificationsRead: () => void;
    completeOnboarding: () => void;
    customFieldsSchema: CustomFieldDef[];
    addCustomFieldDef: (def: Partial<CustomFieldDef>) => void;
    removeCustomFieldDef: (id: string) => void;
    
    // History
    orders: Order[]; // Completed POS orders
    setOrders: (orders: Order[] | ((prev: Order[]) => Order[])) => void;
    deductStockFromOrder: (orderItems: any[]) => void; // Centralized stock deduction
    autoReceiptTelegram: boolean; // Auto-send receipt to Telegram
    setAutoReceiptTelegram: (enabled: boolean) => void;
    processRefund: (orderId: string, items: {id: number, qty: number}[], amount: number) => void;
    
    discounts: Discount[];
    addDiscount: (discount: Partial<Discount>) => void;
    deleteDiscount: (id: string) => void;
    
    tenants: Tenant[];
    updateTenantStatus: (id: string, status: 'Active' | 'Suspended') => void;
    renewTenant: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // --- Firebase Authentication State ---
    const [user, setUser] = useState<any | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    
    // --- Firebase Auth Listener with Multi-Tenant Streams (Products, Orders, Customers, OnlineOrders, Settings) ---
    useEffect(() => {
        let productsUnsubscribe: (() => void) | null = null;
        let ordersUnsubscribe: (() => void) | null = null;
        let customersUnsubscribe: (() => void) | null = null;
        let onlineOrdersUnsubscribe: (() => void) | null = null;
        let settingsUnsubscribe: (() => void) | null = null;
        let purchaseOrdersUnsubscribe: (() => void) | null = null;
        let stockAdjustmentsUnsubscribe: (() => void) | null = null;
        let staffUnsubscribe: (() => void) | null = null;

        const authUnsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            // Cleanup previous subscriptions
            if (productsUnsubscribe) {
                productsUnsubscribe();
                productsUnsubscribe = null;
            }
            if (ordersUnsubscribe) {
                ordersUnsubscribe();
                ordersUnsubscribe = null;
            }
            if (customersUnsubscribe) {
                customersUnsubscribe();
                customersUnsubscribe = null;
            }
            if (onlineOrdersUnsubscribe) {
                onlineOrdersUnsubscribe();
                onlineOrdersUnsubscribe = null;
            }
            if (settingsUnsubscribe) {
                settingsUnsubscribe();
                settingsUnsubscribe = null;
            }
            if (purchaseOrdersUnsubscribe) {
                purchaseOrdersUnsubscribe();
                purchaseOrdersUnsubscribe = null;
            }
            if (stockAdjustmentsUnsubscribe) {
                stockAdjustmentsUnsubscribe();
                stockAdjustmentsUnsubscribe = null;
            }
            if (staffUnsubscribe) {
                staffUnsubscribe();
                staffUnsubscribe = null;
            }

            if (currentUser) {
                let resolvedTenantId: string | null = null;

                // 1st Check: User is a Shop Owner
                const shopDoc = await getDoc(doc(db, 'tenants', currentUser.uid));
                if (shopDoc.exists()) {
                    const shopData = shopDoc.data();
                    resolvedTenantId = currentUser.uid;
                    setUser({
                        uid: currentUser.uid,
                        email: currentUser.email,
                        tenantId: resolvedTenantId,
                        isStaff: false,
                        role: 'Super Admin', // Or derive from shopData if available
                        ...shopData
                    });
                    setCurrentView('dashboard');
                } else {
                    // 2nd Check: User is a Staff Member
                    const userLookup = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userLookup.exists()) {
                        const lookupData = userLookup.data();
                        resolvedTenantId = lookupData.tenantId;

                        // Fetch staff details from the tenant's subcollection
                        const staffDoc = await getDoc(doc(db, 'tenants', resolvedTenantId, 'staff', currentUser.uid));
                        if (staffDoc.exists()) {
                            const staffData = staffDoc.data();
                            setUser({
                                uid: currentUser.uid,
                                email: currentUser.email,
                                tenantId: resolvedTenantId,
                                isStaff: true,
                                ...staffData // This includes role, name, etc.
                            });
                            setCurrentView('dashboard');
                        } else {
                            // Staff record doesn't exist, handle error (e.g., logout)
                            console.error("Staff member authenticated but no details found in tenant's staff list.");
                            setUser(null);
                            setCurrentView('login');
                        }
                    } else {
                        // Else: New user, redirect to setup
                        setUser({ uid: currentUser.uid, email: currentUser.email });
                        setCurrentView('setupShop');
                    }
                }

                if (resolvedTenantId) {
                    // Set up real-time listener for tenant's products
                    productsUnsubscribe = onSnapshot(
                        collection(db, 'tenants', resolvedTenantId, 'products'),
                        (snapshot) => {
                            const productsData = snapshot.docs.map(doc => ({
                                id: parseInt(doc.id) || doc.id,
                                ...doc.data()
                            })) as Product[];
                            setProducts(productsData);
                            console.log(`✅ Products synced from Firestore: ${productsData.length} items`);
                        },
                        (error) => {
                            console.error('❌ Error syncing products:', error);
                        }
                    );

                    // Set up real-time listener for tenant's orders
                    ordersUnsubscribe = onSnapshot(
                        collection(db, 'tenants', resolvedTenantId, 'orders'),
                        (snapshot) => {
                            const ordersData = snapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            })) as Order[];
                            setOrders(ordersData);
                            console.log(`✅ Orders synced from Firestore: ${ordersData.length} items`);
                        },
                        (error) => {
                            console.error('❌ Error syncing orders:', error);
                        }
                    );

                    // Set up real-time listener for tenant's customers
                    customersUnsubscribe = onSnapshot(
                        collection(db, 'tenants', resolvedTenantId, 'customers'),
                        (snapshot) => {
                            const customersData = snapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            })) as Contact[];
                            setCustomers(customersData);
                            console.log(`✅ Customers synced from Firestore: ${customersData.length} items`);
                        },
                        (error) => {
                            console.error('❌ Error syncing customers:', error);
                        }
                    );

                    // Set up real-time listener for tenant's online orders
                    onlineOrdersUnsubscribe = onSnapshot(
                        collection(db, 'tenants', resolvedTenantId, 'onlineOrders'),
                        (snapshot) => {
                            const onlineOrdersData = snapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            })) as OnlineOrder[];
                            setOnlineOrders(onlineOrdersData);
                            console.log(`✅ Online Orders synced from Firestore: ${onlineOrdersData.length} items`);
                        },
                        (error) => {
                            console.error('❌ Error syncing online orders:', error);
                        }
                    );

                    // Set up real-time listener for tenant's settings (single document)
                    settingsUnsubscribe = onSnapshot(
                        doc(db, 'tenants', resolvedTenantId, 'settings', 'shopSettings'),
                        (docSnapshot) => {
                            if (docSnapshot.exists()) {
                                const settingsData = docSnapshot.data() as ShopSettings;
                                setShopSettings(settingsData);
                                console.log(`✅ Shop Settings synced from Firestore`);
                            }
                        },
                        (error) => {
                            console.error('❌ Error syncing shop settings:', error);
                        }
                    );

                    // Set up real-time listener for tenant's purchase orders
                    purchaseOrdersUnsubscribe = onSnapshot(
                        collection(db, 'tenants', resolvedTenantId, 'purchaseOrders'),
                        (snapshot) => {
                            const purchaseOrdersData = snapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            })) as PurchaseOrder[];
                            setPurchaseOrders(purchaseOrdersData);
                            console.log(`✅ Purchase Orders synced from Firestore: ${purchaseOrdersData.length} items`);
                        },
                        (error) => {
                            console.error('❌ Error syncing purchase orders:', error);
                        }
                    );

                    // Set up real-time listener for tenant's stock adjustments
                    stockAdjustmentsUnsubscribe = onSnapshot(
                        collection(db, 'tenants', resolvedTenantId, 'stockAdjustments'),
                        (snapshot) => {
                            const adjustmentsData = snapshot.docs.map(doc => ({
                                id: parseInt(doc.id) || doc.id,
                                ...doc.data()
                            })) as unknown as StockAdjustment[];
                            setStockAdjustments(adjustmentsData);
                            console.log(`✅ Stock Adjustments synced from Firestore: ${adjustmentsData.length} items`);
                        },
                        (error) => {
                            console.error('❌ Error syncing stock adjustments:', error);
                        }
                    );

                    // Set up real-time listener for tenant's staff
                    staffUnsubscribe = onSnapshot(
                        collection(db, 'tenants', resolvedTenantId, 'staff'),
                        (snapshot) => {
                            const staffData = snapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            })) as Staff[];
                            setStaff(staffData);
                            console.log(`✅ Staff synced from Firestore: ${staffData.length} items`);
                        },
                        (error) => {
                            console.error('❌ Error syncing staff:', error);
                        }
                    );
                }
            } else {
                setUser(null);
                setCurrentView('login');
                setProducts([]);
                setOrders([]);
                setCustomers([]);
                setOnlineOrders([]);
                setShopSettings({ name: '', phone: '', email: '', address: '', logo: '', timezone: '', currency: '', taxRate: 0 });
                setPurchaseOrders([]);
                setStockAdjustments([]);
                setStaff([]);
            }
            setAuthLoading(false);
        });

        return () => {
            authUnsubscribe();
            if (productsUnsubscribe) {
                productsUnsubscribe();
            }
            if (ordersUnsubscribe) {
                ordersUnsubscribe();
            }
            if (customersUnsubscribe) {
                customersUnsubscribe();
            }
            if (onlineOrdersUnsubscribe) {
                onlineOrdersUnsubscribe();
            }
            if (settingsUnsubscribe) {
                settingsUnsubscribe();
            }
            if (purchaseOrdersUnsubscribe) {
                purchaseOrdersUnsubscribe();
            }
            if (stockAdjustmentsUnsubscribe) {
                stockAdjustmentsUnsubscribe();
            }
            if (staffUnsubscribe) {
                staffUnsubscribe();
            }
        };
    }, []);
    
    // --- Mock Data Initialization ---
    const [currentView, setCurrentView] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Branch System
    const [branches] = useState<Branch[]>([{id: 'b1', name: 'សាខាទី១ (ភ្នំពេញ)'}, {id: 'b2', name: 'សាខាទី២ (សៀមរាប)'}]);
    const [currentBranch, setCurrentBranch] = useState('b1');
    
    // Modals
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
    const [isShippingSetupModalOpen, setIsShippingSetupModalOpen] = useState(false);
    const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isSplitBillModalOpen, setIsSplitBillModalOpen] = useState(false);
    const [isHoldOrdersOpen, setIsHoldOrdersOpen] = useState(false);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [isShippingLabelModalOpen, setIsShippingLabelModalOpen] = useState(false);

    const [subscription, setSubscription] = useState({ status: 'Active', plan: 'Pro', expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
    const [shopSettings, setShopSettings] = useState<ShopSettings>({
        name: 'QuickBill Shop', phone: '012 345 678', email: 'contact@shop.com', address: 'Phnom Penh', logo: '', timezone: '(GMT+07:00) Phnom Penh', currency: 'USD', taxRate: 0
    });

    // Products will be populated by real-time Firestore listener
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Items');
    const categories = ['All Items', 'Drinks', 'Food', 'Dessert', 'Ice Cream'];

    // Orders will be populated by real-time Firestore listener
    const [orders, setOrders] = useState<Order[]>([]);
    const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>([]);
    const [holdOrders, setHoldOrders] = useState<HoldOrder[]>([]);

    // Telegram Auto-Receipt Settings (Firestore-synced via settings listener)
    const [autoReceiptTelegram, setAutoReceiptTelegram] = useState(false);

    // Mobile Stock Taking - Track Adjustments (Firestore-synced via listener)
    const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);

    // POS & Order Draft State
    const [posCustomer, setPosCustomer] = useState<Contact | null>(null);
    const [draftOnlineOrder, setDraftOnlineOrder] = useState<{ customer: Contact; items: InterestedProduct[] } | null>(null);
    const [prefillOrderData, setPrefillOrderData] = useState<any>(null);

    const [customers, setCustomers] = useState<Contact[]>([]);
    const [leads, setLeads] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [customFieldsSchema, setCustomFieldsSchema] = useState<CustomFieldDef[]>([]);
    const [noteCategories, setNoteCategories] = useState<NoteCategory[]>([
        { id: 'general', label: '📝 ទូទៅ', color: 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:border-slate-600' },
        { id: 'chat', label: '💬 ទំនាក់ទំនង', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:border-blue-800' },
        { id: 'negotiate', label: '💰 តថ្លៃ', color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30 dark:border-yellow-800' },
        { id: 'issue', label: '⚠️ បញ្ហា', color: 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30 dark:border-orange-800' },
        { id: 'interest', label: '⭐ ចំណូលចិត្ត', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30 dark:border-purple-800' },
        { id: 'debt', label: '💸 ជំពាក់', color: 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:border-red-800 font-bold' },
        { id: 'followup', label: '📅 តាមដាន', color: 'bg-teal-50 text-teal-600 hover:bg-teal-100 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30 dark:border-teal-800' }
    ]);

    const [contactStages, setContactStages] = useState<ContactStage[]>([
        { 
  id: 'stage_new', 
  name: 'New Lead', 
  colorClass: 'bg-pink-100 text-pink-800', // ដូរទៅពណ៌ផ្កាឈូក
  iconName: 'Heart', // ដូររូបមនុស្ស ទៅជារូបបេះដូង
  isDefault: true 
},
        { id: 'stage_customer', name: 'Customer', colorClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', iconName: 'CheckCircle', isDefault: true },
        { id: 'stage_vip', name: 'VIP', colorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300', iconName: 'Crown', isDefault: true },
        { id: 'stage_followup', name: 'Follow-up', colorClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300', iconName: 'Clock', isDefault: true },
        { id: 'stage_reserved', name: 'Reserved', colorClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300', iconName: 'Bookmark', isDefault: true }
    ]);

    const [suppliers, setSuppliers] = useState<Supplier[]>([
        { id: 's1', name: 'ABC Supply Co.', phone: '099 888 777', email: 'sales@abc.com', category: 'General', outstandingDebt: 500.00 }
    ]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

    const [staff, setStaff] = useState<Staff[]>([]);
const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
    const [roles, setRoles] = useState<Role[]>([
        { id: 'r1', name: 'Admin', nameKh: 'អ្នកគ្រប់គ្រង', isSystem: true, permissions: [{id: 'p1', name: 'Full Access', nameKh: 'សិទ្ធិពេញលេញ', group: 'Settings', enabled: true}] }
    ]);

    const [tenants, setTenants] = useState<Tenant[]>([
        { id: 't1', name: 'Coffee Shop 1', subName: 'Best Coffee', owner: 'Mr. A', email: 'a@coffee.com', phone: '012333444', plan: 'Pro', status: 'Active', joinedDate: '2023-05-20', expiryDate: '2024-05-20', logo: '', mrr: 30 }
    ]);

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [selectedOnlineOrder, setSelectedOnlineOrder] = useState<OnlineOrder | null>(null);
    const [editingOrder, setEditingOrder] = useState<OnlineOrder | null>(null);
    
    const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings>({ enabled: true, earnSpend: 10, earnPoints: 1, redeemPoints: 100, redeemValue: 1 });
    const [customerTiers, setCustomerTiers] = useState<CustomerTier[]>([
        { id: 'tier1', name: 'Silver', minSpend: 0, discount: 0, color: 'bg-slate-100', badgeIcon: 'stars' },
        { id: 'tier2', name: 'Gold', minSpend: 500, discount: 5, color: 'bg-yellow-100', badgeIcon: 'military_tech' }
    ]);
    const [vouchers, setVouchers] = useState<Voucher[]>([
        { id: 'v1', code: 'WELCOME10', type: 'Percentage', value: 10, limit: 100, used: 12, expiryDate: '2024-12-31', status: 'Active' }
    ]);
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([
        { id: 'f1', customerName: 'Sokha Vann', avatar: '', date: '2023-10-20', rating: 5, comment: 'Great service!', status: 'Pending' }
    ]);
    
    const [couriers, setCouriers] = useState<Courier[]>([
        { id: 'cr1', name: 'J&T Express', phone: '023 999 888', baseRate: 1.50, logo: 'J&T', status: 'Active' },
        { id: 'cr2', name: 'Virak Buntham', phone: '012 333 444', baseRate: 2.00, logo: 'VB', status: 'Active' }
    ]);
    const [shippingRates, setShippingRates] = useState<ShippingRate[]>([
        { id: 'sr1', province: 'Phnom Penh', provinceKh: 'ភ្នំពេញ', rate: 1.00, duration: 'Same Day', status: 'Active' },
        { id: 'sr2', province: 'Siem Reap', provinceKh: 'សៀមរាប', rate: 2.50, duration: '2-3 Days', status: 'Active' }
    ]);
    const [shippingZones, setShippingZones] = useState<ShippingZone[]>([
        { id: 'PP_IN', name: 'ភ្នំពេញ (ក្នុងក្រុង)', price: 1.50 },
        { id: 'PP_OUT', name: 'ភ្នំពេញ (ជាយក្រុង)', price: 2.00 },
        { id: 'PROV', name: 'តាមខេត្ត (Provinces)', price: 2.50 }
    ]);

    const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
        { id: 'log1', date: new Date(), staffId: 'st1', staffName: 'Sokha Dara', actionType: 'Login', description: 'Logged in successfully', device: 'Chrome on Mac', ip: '192.168.1.5' }
    ]);
    
    const [activeSessions, setActiveSessions] = useState<Session[]>([
        { id: 'sess1', device: 'Chrome on Mac', location: 'Phnom Penh', ip: '192.168.1.5', lastActive: 'Just now', isCurrent: true }
    ]);
    const [userSecurity, setUserSecurity] = useState({ twoFactorEnabled: false });
    
    const [notifications, setNotifications] = useState<NotificationItem[]>([
        { id: 'n1', title: 'New Order', message: 'Order #QB-882910 received.', time: '2 min ago', type: 'info', read: false, dateCategory: 'Today' }
    ]);
    
    const [discounts, setDiscounts] = useState<Discount[]>([]);

    // --- Computed ---
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = cartTotal * (shopSettings.taxRate || 0.1); // default 10%
    const finalTotal = cartTotal + taxAmount;

    // --- Real Firebase Authentication Functions ---
    const login = async (email: string, pass: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    };

    const registerShop = async (email: string, pass: string, shopName: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const newUid = userCredential.user.uid;

            // Save the new shop to the 'tenants' collection
            await setDoc(doc(db, 'tenants', newUid), {
                id: newUid,
                name: shopName,
                plan: 'Pro',
                status: 'Active',
                joinedDate: new Date().toISOString()
            });

            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    const addToCart = (product: Product, quantity = 1, unitData?: { unitId: string; selectedUnit: string; multiplier: number; price: number }) => {
        setCart(prev => {
            // Create unique key using product ID and unit ID (if UOM selected)
            const cartKey = unitData ? `${product.id}-${unitData.unitId}` : product.id;
            const existing = prev.find(p => unitData ? `${p.id}-${p.unitId}` === cartKey : p.id === product.id);
            
            const cartItem: CartItem = {
                ...product,
                quantity,
                ...(unitData && {
                    unitId: unitData.unitId,
                    selectedUnit: unitData.selectedUnit,
                    multiplier: unitData.multiplier,
                    selectedUnitPrice: unitData.price
                })
            };

            if (existing) {
                // If item exists with same unit, increase quantity
                if (unitData) {
                    return prev.map(p => 
                        `${p.id}-${p.unitId}` === cartKey 
                            ? { ...p, quantity: p.quantity + quantity } 
                            : p
                    );
                } else {
                    return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + quantity } : p);
                }
            }
            
            return [...prev, cartItem];
        });
    };
    const removeFromCart = (id: number, unitId?: string) => {
        setCart(prev => prev.filter(p => 
            unitId ? `${p.id}-${p.unitId}` !== `${id}-${unitId}` : p.id !== id
        ));
    };
    const updateQuantity = (id: number, delta: number, unitId?: string) => {
        setCart(prev => prev.map(p => {
            if (unitId ? `${p.id}-${p.unitId}` === `${id}-${unitId}` : p.id === id) {
                return { ...p, quantity: Math.max(1, p.quantity + delta) };
            }
            return p;
        }));
    };
    const clearCart = () => setCart([]);

    const createOrder = async (method: string, amount: number) => {
        if (!user) {
            console.error('❌ Cannot create order: User not authenticated');
            return;
        }

        // Calculate debt based on payment method
        const debtAmount = method === 'Debt' ? Math.max(0, finalTotal - amount) : 0;

        // Collect items that need low stock alerts
        const lowStockAlerts: Array<{ name: string; newStock: number; sku?: string }> = [];

        // Create order record
        const newOrderId = `INV-${Date.now()}`;
        const newOrder = sanitizeData({
            id: newOrderId,
            customer: null,
            date: new Date().toISOString(),
            status: 'Paid',
            total: finalTotal,
            subtotal: cartTotal,
            tax: taxAmount,
            discount: 0,
            shippingFee: 0,
            items: [...cart],
            method,
            branchId: currentBranch,
            amountPaid: amount,
            debtAmount
        }, {
            status: 'Paid',
            method,
            branchId: currentBranch
        });

        try {
            // Step 1: Save order to Firestore
            await setDoc(doc(db, 'tenants', user.uid, 'orders', newOrderId), newOrder);
            console.log(`✅ Order saved to Firestore: ${newOrderId}`);

            // Step 2: Update product stock in Firestore for each cart item
            for (const cartItem of cart) {
                const productDocRef = doc(db, 'tenants', user.uid, 'products', cartItem.id.toString());
                const currentProduct = products.find(p => p.id === cartItem.id);

                if (currentProduct) {
                    const newStock = Math.max(0, currentProduct.stock - cartItem.quantity);

                    await updateDoc(productDocRef, { stock: newStock });
                    console.log(`✅ Updated product stock in Firestore: ${cartItem.name} | New stock: ${newStock}`);

                    // Collect low stock alerts
                    if (newStock <= 5) {
                        lowStockAlerts.push({
                            name: currentProduct.name,
                            newStock: newStock,
                            sku: currentProduct.sku
                        });
                    }
                }
            }

            // Step 3: Fire Telegram alerts for low stock items (non-blocking, fire and forget)
            lowStockAlerts.forEach(alert => {
                sendLowStockAlert(alert.name, alert.newStock, alert.sku).catch(e => 
                    console.error('Alert failed silently:', e)
                );
            });

            // Step 4: Update customer's totalDebt if there's a debt and a customer is selected
            if (debtAmount > 0 && posCustomer) {
                setCustomers(prev => prev.map(c => c.id === posCustomer.id ? { ...c, totalDebt: (c.totalDebt || 0) + debtAmount } : c));
            }

            // Step 5: Send auto-receipt if enabled (check state directly)
            if (autoReceiptTelegram) {
                console.log("✅ Auto-Receipt is ON. Triggering Telegram Alert for:", newOrderId);
                sendReceiptAlert(newOrder).catch(e => console.error("❌ Telegram Receipt Error:", e));
            }

            // Step 6: Clear cart and close modal
            setCart([]);
            setIsPaymentModalOpen(false);
            setPosCustomer(null);

            console.log(`✅ Order creation completed successfully: ${newOrderId}`);
        } catch (error) {
            console.error('❌ Error creating order:', error);
        }
    };

    const addLead = (lead: Partial<Contact>) => {
        const newLead = { 
            id: `l-${Date.now()}`, 
            walletBalance: 0, 
            totalDebt: 0, 
            totalSpent: 0, 
            activities: [], 
            status: 'New Lead',
            avatar: lead.name?.substring(0, 2).toUpperCase() || 'U',
            interestedProducts: [],
            ...lead 
        } as Contact;
        setLeads(prev => [newLead, ...prev]);
    };

    const addCustomer = async (customer: Partial<Contact>) => {
        if (!user) {
            console.error('❌ User not authenticated');
            return;
        }

        try {
            const customerId = `c-${Date.now()}`;
            
            const sanitizedCustomer = sanitizeData(customer, {
                id: customerId,
                walletBalance: 0,
                totalDebt: 0,
                totalSpent: 0,
                activities: [],
                status: 'Customer',
                avatar: customer.name?.substring(0, 2).toUpperCase() || 'U',
                joinedDate: new Date().toLocaleDateString(),
                interestedProducts: [],
                address: '',
                email: '',
                phone: '',
                tags: []
            });

            await setDoc(doc(db, 'tenants', user.uid, 'customers', customerId), sanitizedCustomer);
            console.log(`✅ Customer added successfully: ${customerId}`);
            
            return { id: customerId, ...sanitizedCustomer } as Contact;
        } catch (error) {
            console.error('❌ Error adding customer:', error);
            throw error;
        }
    };

    const updateCustomer = async (id: string, data: Partial<Contact>, preventRedirect = false) => {
        if (!user) {
            console.error('❌ User not authenticated');
            return;
        }

        try {
            const sanitizedData = sanitizeData(data, {
                address: '',
                email: '',
                phone: '',
                tags: [],
                interestedProducts: []
            });

            await setDoc(doc(db, 'tenants', user.uid, 'customers', id), sanitizedData, { merge: true });
            console.log(`✅ Customer updated successfully: ${id}`);
        } catch (error) {
            console.error('❌ Error updating customer:', error);
            throw error;
        }
    };

    const deleteCustomer = async (id: string) => {
        if (!user) {
            console.error('❌ User not authenticated');
            return;
        }

        try {
            await deleteDoc(doc(db, 'tenants', user.uid, 'customers', id));
            console.log(`✅ Customer deleted successfully: ${id}`);
        } catch (error) {
            console.error('❌ Error deleting customer:', error);
            throw error;
        }
    };

    const updateLead = (id: string, data: Partial<Contact>) => {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
        // Update selected if matched
        if (selectedContact?.id === id) setSelectedContact(prev => prev ? { ...prev, ...data } : null);
    };

    const createOnlineOrder = async (customer: CustomerInfo, items: CartItem[], shippingFee: number, paymentMethod: string, carrier?: string, source?: string, transactionId?: string, discount?: number, deliveryDate?: string, zone?: string, bankSlipImage?: string | null) => {
        if (!user) {
            console.error('❌ Cannot create online order: User not authenticated');
            return;
        }

        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const appliedDiscount = discount || 0;
        const total = subtotal - appliedDiscount + shippingFee;
        const orderId = `QB-${Date.now()}`;
        
        const newOrder = sanitizeData({
            id: orderId,
            customer,
            date: new Date().toISOString(),
            status: 'New',
            paymentStatus: paymentMethod === 'COD' ? 'COD' : 'Pending',
            total,
            subtotal,
            tax: 0,
            discount: appliedDiscount,
            shippingFee,
            items,
            paymentMethod,
            shippingCarrier: carrier, 
            shippingDetails: carrier ? { courier: carrier, trackingNumber: '', fee: shippingFee, zone } : undefined, 
            elapsedTime: 'Just now',
            source,
            transactionId,
            deliveryDate,
            bankSlipImage,
            branchId: currentBranch,
            amountPaid: total,
            debtAmount: 0
        }, {
            status: 'New',
            paymentStatus: paymentMethod === 'COD' ? 'COD' : 'Pending',
            branchId: currentBranch
        }) as OnlineOrder;

        try {
            await setDoc(doc(db, 'tenants', user.uid, 'onlineOrders', orderId), newOrder);
            console.log(`✅ Online order created successfully: ${orderId}`);
            setIsCreateOrderModalOpen(false);
        } catch (error) {
            console.error('❌ Error creating online order:', error);
        }
    };

    const selectOnlineOrder = (id: string) => {
        const order = onlineOrders.find(o => o.id === id);
        if (order) {
            setSelectedOnlineOrder(order);
            setCurrentView('order-details');
        }
    };

    const updateOrderStatus = (id: string, status: string) => {
        setOnlineOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as any } : o));
        if (selectedOnlineOrder?.id === id) setSelectedOnlineOrder(prev => prev ? { ...prev, status: status as any } : null);
    };

    const verifyPayment = (id: string, verified: boolean) => {
        const newStatus = verified ? 'Verified' : 'Rejected';

        // 1. Update the main list
        setOnlineOrders(prev => prev.map(order => 
            order.id === id ? { ...order, paymentStatus: newStatus } : order
        ));

        // 2. Update the currently selected order so OrderDetail updates instantly
        if (selectedOnlineOrder && selectedOnlineOrder.id === id) {
            setSelectedOnlineOrder({ ...selectedOnlineOrder, paymentStatus: newStatus });
        }
    };

    const setOrderShipping = (id: string, details: any) => {
        setOnlineOrders(prev => prev.map(o => o.id === id ? { ...o, shippingDetails: details, status: 'Shipping', shippingCarrier: details.courier } : o));
        setIsShippingSetupModalOpen(false);
    };

    const updateOrderCustomer = (id: string, customer: Partial<CustomerInfo>) => {
        setOnlineOrders(prev => prev.map(o => o.id === id ? { ...o, customer: { ...o.customer, ...customer } as CustomerInfo } : o));
        if (selectedOnlineOrder?.id === id) {
            setSelectedOnlineOrder(prev => prev ? { ...prev, customer: { ...prev.customer, ...customer } as CustomerInfo } : null);
        }
    };

    const updateOnlineOrder = async (id: string, updatedData: any, preventRedirect = false) => {
        if (!user) {
            console.error('❌ Cannot update online order: User not authenticated');
            return;
        }

        try {
            const sanitizedData = sanitizeData(updatedData, {
                status: 'New',
                paymentStatus: 'Pending'
            });

            await setDoc(doc(db, 'tenants', user.uid, 'onlineOrders', id), sanitizedData, { merge: true });
            console.log(`✅ Online order updated successfully: ${id}`);
            
            setEditingOrder(null);
            if (!preventRedirect) {
                // Navigation logic can be added here if needed
            }
        } catch (error) {
            console.error('❌ Error updating online order:', error);
        }
    };

    const deleteOnlineOrder = (id: string) => {
        setOnlineOrders(prev => prev.filter(o => o.id !== id));
        if (selectedOnlineOrder?.id === id) {
            setSelectedOnlineOrder(null);
        }
    };

    const addCustomFieldDef = (def: Partial<CustomFieldDef>) => {
        setCustomFieldsSchema(prev => [...prev, { id: `field-${Date.now()}`, type: 'text', label: 'New Field', ...def } as CustomFieldDef]);
    };
    const removeCustomFieldDef = (id: string) => {
        setCustomFieldsSchema(prev => prev.filter(f => f.id !== id));
    };

    const addDeposit = (contactId: string, amount: number, ref: string) => {
        // Logic to add deposit transaction
        setIsDepositModalOpen(false);
    };

    // --- Helper Function: Sanitize Data for Firestore ---
    // Replaces undefined values with appropriate defaults (Firestore doesn't accept undefined)
    const sanitizeData = (data: any, fieldDefaults: Record<string, any> = {}): any => {
        const sanitized = { ...data };

        // Apply custom field defaults first
        Object.keys(fieldDefaults).forEach(field => {
            if (sanitized[field] === undefined) {
                sanitized[field] = fieldDefaults[field];
            }
        });

        // Then apply generic defaults
        // Array fields - default to empty array if undefined
        const arrayFields = ['batches', 'variants', 'units', 'items'];
        arrayFields.forEach(field => {
            if (sanitized[field] === undefined) {
                sanitized[field] = [];
            }
        });

        // String fields - default to empty string if undefined
        const stringFields = ['barcode', 'description', 'image', 'nameKh', 'sku', 'method'];
        stringFields.forEach(field => {
            if (sanitized[field] === undefined) {
                sanitized[field] = '';
            }
        });

        // Number fields - default to 0 if undefined
        const numberFields = ['cost', 'tax', 'discount', 'shippingFee', 'debtAmount'];
        numberFields.forEach(field => {
            if (sanitized[field] === undefined) {
                sanitized[field] = 0;
            }
        });

        return sanitized;
    };

    // Specialized sanitizer for products (uses generic sanitizeData)
    const sanitizeProductData = (product: any): any => {
        return sanitizeData(product, {
            baseUnit: 'unit',
            status: 'In Stock',
            category: 'General',
            price: 0,
            stock: 0
        });
    };

    const addProduct = async (product: Partial<Product>) => {
        if (!user) {
            console.error('❌ Cannot add product: User not authenticated');
            return;
        }

        const newProdId = Date.now().toString();
        const newProd = sanitizeProductData({
            id: Date.now(),
            name: 'New Product',
            category: 'General',
            price: 0,
            stock: 0,
            image: '',
            status: 'In Stock',
            baseUnit: 'unit',
            units: [],
            ...product
        });

        try {
            await setDoc(
                doc(db, 'tenants', user.uid, 'products', newProdId),
                newProd
            );
            console.log(`✅ Product added to Firestore: ${newProd.name}`);
            setCurrentView('inventory-list');
        } catch (error) {
            console.error('❌ Error adding product to Firestore:', error);
        }
    };

    const updateProduct = async (id: number, data: Partial<Product>, preventRedirect = false) => {
        if (!user) {
            console.error('❌ Cannot update product: User not authenticated');
            return;
        }

        const sanitizedData = sanitizeProductData(data);

        try {
            await setDoc(
                doc(db, 'tenants', user.uid, 'products', id.toString()),
                sanitizedData,
                { merge: true }
            );
            console.log(`✅ Product updated in Firestore: ID ${id}`);
            if (!preventRedirect) {
                setCurrentView('inventory-list');
            }
        } catch (error) {
            console.error('❌ Error updating product in Firestore:', error);
        }
    };

    const deleteProduct = async (id: number | string) => {
        if (!user) {
            console.error('❌ Cannot delete product: User not authenticated');
            return;
        }

        try {
            await deleteDoc(doc(db, 'tenants', user.uid, 'products', id.toString()));
            console.log(`✅ Product deleted from Firestore: ID ${id}`);
        } catch (error) {
            console.error('❌ Error deleting product from Firestore:', error);
        }
    };

    const adjustStock = (productId: number, variantId: string | null, qty: number, reason: string) => {
        setProducts(prev => prev.map(p => {
            if (p.id === productId) {
                if (variantId && p.variants) {
                    const newVariants = p.variants.map(v => v.id === variantId ? { ...v, stock: Math.max(0, v.stock + qty) } : v);
                    const totalStock = newVariants.reduce((a, b) => a + b.stock, 0);
                    return { ...p, variants: newVariants, stock: totalStock };
                } else {
                    return { ...p, stock: Math.max(0, p.stock + qty) };
                }
            }
            return p;
        }));
    };

    const performStockAudit = (updates: {productId: number, actualStock: number}[]) => {
        setProducts(prev => prev.map(p => {
            const update = updates.find(u => u.productId === p.id);
            if (update) return { ...p, stock: update.actualStock };
            return p;
        }));
    };

    // --- CENTRALIZED STOCK DEDUCTION FUNCTION WITH FEFO ---
    // This ensures no race conditions with receipt creation or other state updates
    // Uses FEFO (First Expired, First Out) methodology for batch-based inventory
    const deductStockFromOrder = (orderItems: any[]) => {
        setProducts((prevProducts: Product[]) => {
            let updatedInventory = [...prevProducts];
            const lowStockAlerts: { name: string; newStock: number; sku?: string; productId: number; product: Product }[] = [];

            // Process each item in the order
            orderItems.forEach((itemToDeduct: any) => {
                // Match safely by productId, id, or name (fallback for mock data)
                const prodIndex = updatedInventory.findIndex(p => 
                    p.id === itemToDeduct.productId || 
                    p.id === itemToDeduct.id || 
                    p.name === itemToDeduct.name
                );

                if (prodIndex !== -1) {
                    const product = updatedInventory[prodIndex];
                    const currentStock = product.stock;
                    const deductQty = Number(itemToDeduct.quantity) || 1;
                    // Apply multiplier: if unit has multiplier, total deduction = qty * multiplier
                    const multiplier = Number(itemToDeduct.multiplier) || 1;
                    const totalDeduction = deductQty * multiplier;

                    let remainingToDeduct = totalDeduction;
                    let newStock = currentStock;

                    // === FEFO DEDUCTION LOGIC ===
                    if (product.batches && product.batches.length > 0) {
                        // Step 1: Sort batches by expiryDate ascending (earliest expiry first - FEFO)
                        const sortedBatches = [...product.batches].sort((a, b) => 
                            new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
                        );

                        // Step 2: Deduct from batches sequentially
                        const updatedBatches = sortedBatches.map(batch => {
                            if (remainingToDeduct <= 0) {
                                // Already deducted enough, return batch unchanged
                                return batch;
                            }

                            if (batch.quantity <= remainingToDeduct) {
                                // Deduct entire batch (or remainder)
                                const deductedFromBatch = batch.quantity;
                                remainingToDeduct -= deductedFromBatch;
                                newStock -= deductedFromBatch;
                                
                                console.log(`✅ FEFO: Batch ${batch.batchId} (Expires: ${batch.expiryDate}) | Deducted: ${deductedFromBatch} | Remaining: ${remainingToDeduct}`);
                                
                                // Return batch with quantity 0 (will be filtered out later)
                                return { ...batch, quantity: 0 };
                            } else {
                                // Partial deduction from this batch
                                const deductedFromBatch = remainingToDeduct;
                                const newBatchQuantity = batch.quantity - deductedFromBatch;
                                remainingToDeduct = 0;
                                newStock -= deductedFromBatch;
                                
                                console.log(`✅ FEFO: Batch ${batch.batchId} (Expires: ${batch.expiryDate}) | Deducted: ${deductedFromBatch} | Remaining in batch: ${newBatchQuantity}`);
                                
                                return { ...batch, quantity: newBatchQuantity };
                            }
                        }).filter(batch => batch.quantity > 0); // Step 3: Clean up empty batches

                        // Update product with deduplicated batches
                        updatedInventory[prodIndex] = {
                            ...product,
                            stock: Math.max(0, newStock),
                            batches: updatedBatches
                        };

                        console.log(`✅ FEFO Deduction Summary: ${product.name} | Qty: ${deductQty} ${itemToDeduct.selectedUnit || 'unit'}s (multiplier: ${multiplier}) = -${totalDeduction} base units | New Stock: ${Math.max(0, newStock)} | Batches: ${updatedBatches.length}`);
                    } else {
                        // Fallback: No batches defined, use simple deduction (legacy mode)
                        newStock = Math.max(0, currentStock - totalDeduction);
                        updatedInventory[prodIndex] = {
                            ...product,
                            stock: newStock
                        };

                        console.log(`⚠️ Legacy deduction (no batches): ${product.name} | Qty: ${deductQty} ${itemToDeduct.selectedUnit || 'unit'}s (multiplier: ${multiplier}) = -${totalDeduction} base units | New Stock: ${newStock}`);
                    }

                    // Queue low stock alert
                    if (newStock <= 5) {
                        lowStockAlerts.push({
                            name: product.name,
                            newStock: newStock,
                            sku: product.sku,
                            productId: product.id,
                            product: updatedInventory[prodIndex]
                        });
                    }
                } else {
                    console.error("❌ Stock deduction match FAILED for item:", itemToDeduct);
                }
            });

            // Trigger Telegram alerts and auto-generate POs for low stock items
            lowStockAlerts.forEach(alert => {
                // Send telegram alert (non-blocking)
                sendLowStockAlert(alert.name, alert.newStock, alert.sku).catch(e =>
                    console.error('Alert failed:', e)
                );

                // Generate auto PO if one doesn't already exist for this product in Draft status
                const existingDraftPO = purchaseOrders.find(po => 
                    po.status === 'Draft' && 
                    po.triggerProductId === alert.productId &&
                    po.autoGenerated === true
                );

                if (!existingDraftPO) {
                    const minimumStock = 10; // Threshold to trigger auto-purchase
                    const suggestedQty = Math.ceil(minimumStock * 2); // Suggest double the minimum
                    const unitCost = alert.product.cost || alert.product.price * 0.5; // Estimate if no cost

                    const newPO: PurchaseOrder = {
                        id: `PO-AUTO-${Date.now()}`,
                        supplierId: 's1', // Default supplier
                        supplierName: 'ABC Supply Co.',
                        date: new Date().toISOString(),
                        status: 'Draft',
                        warehouse: 'Main',
                        items: [
                            {
                                productId: alert.productId,
                                productName: alert.name,
                                quantity: suggestedQty,
                                unit: alert.product.baseUnit || 'unit',
                                unitCost: unitCost,
                                total: suggestedQty * unitCost,
                                sku: alert.sku || ''
                            }
                        ],
                        totalAmount: suggestedQty * unitCost,
                        autoGenerated: true,
                        triggerProductId: alert.productId,
                        triggerThreshold: minimumStock
                    };

                    setPurchaseOrders(prev => [...prev, newPO]);
                    console.log(`📦 Auto-generated Draft PO: ${newPO.id} for ${alert.name} (Qty: ${suggestedQty})`);
                }
            });

            return updatedInventory; // Synchronously return updated state
        });
    };

    const addStockTransfer = (transfer: any) => {
        // Mock logic
        setCurrentView('inventory-list');
    };

    // --- MOBILE STOCK TAKING API ENDPOINT ---
    // Simulates a mobile app or PDA scanner syncing counted stock back to the server
    const syncMobileStockTake = async (
        scannedData: { productId: number | string, countedStock: number }[],
        employeeName: string,
        reason: string = 'Physical Count - Mobile App'
    ): Promise<{ success: boolean; message: string; adjustments: StockAdjustment[] }> => {
        try {
            const adjustmentsMade: StockAdjustment[] = [];

            setProducts((prevProducts: Product[]) => {
                let updatedProducts = [...prevProducts];

                // Process each scanned item
                scannedData.forEach((scannedItem) => {
                    // Find product by ID (flexible matching)
                    const productIndex = updatedProducts.findIndex(p => 
                        p.id === scannedItem.productId || 
                        p.id === parseInt(scannedItem.productId as string)
                    );

                    if (productIndex !== -1) {
                        const product = updatedProducts[productIndex];
                        const oldStock = product.stock;
                        const newStock = Math.max(0, Math.floor(scannedItem.countedStock)); // Ensure non-negative integer
                        const difference = newStock - oldStock;

                        // Only create adjustment if there's a discrepancy
                        if (difference !== 0) {
                            // Create adjustment log
                            const adjustment: StockAdjustment = {
                                id: Date.now() + adjustmentsMade.length, // Unique ID
                                productId: product.id,
                                productName: product.name,
                                oldStock: oldStock,
                                newStock: newStock,
                                difference: difference,
                                date: new Date().toISOString(),
                                employee: employeeName,
                                reason: reason
                            };

                            adjustmentsMade.push(adjustment);

                            // Update product stock
                            updatedProducts[productIndex] = {
                                ...product,
                                stock: newStock
                            };

                            // Log to console
                            const sign = difference > 0 ? '➕' : '➖';
                            console.log(
                                `${sign} Stock Adjustment: ${product.name} | Old: ${oldStock} → New: ${newStock} | Diff: ${difference > 0 ? '+' : ''}${difference} | By: ${employeeName}`
                            );

                            // Queue low stock alert if needed
                            if (newStock <= 5 && newStock > 0) {
                                sendLowStockAlert(product.name, newStock, product.sku).catch(e => 
                                    console.error('Low stock alert failed:', e)
                                );
                            }

                            // Note for FEFO batches: Admin may need to manually redistribute batch quantities
                            if (product.batches && product.batches.length > 0 && difference < 0) {
                                console.warn(
                                    `⚠️ FEFO Note: Product "${product.name}" has batches. Physical count shows lower stock. ` +
                                    `Consider verifying batch quantities manually and removing expired batches if necessary.`
                                );
                            }
                        } else {
                            console.log(`✅ No adjustment needed: ${product.name} (Current: ${oldStock} = Counted: ${newStock})`);
                        }
                    } else {
                        console.error(`❌ Product not found for ID: ${scannedItem.productId}`);
                    }
                });

                return updatedProducts;
            });

            // Add all adjustments to history (persisted to localStorage)
            setStockAdjustments(prev => [...prev, ...adjustmentsMade]);

            // Success response
            const message = `✅ Stock sync completed: ${adjustmentsMade.length} adjustments made by ${employeeName}`;
            console.log(message);
            
            return {
                success: true,
                message: message,
                adjustments: adjustmentsMade
            };
        } catch (error) {
            const errorMessage = `❌ Stock sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
            console.error(errorMessage);
            return {
                success: false,
                message: errorMessage,
                adjustments: []
            };
        }
    };

    const saveLoyaltySettings = (settings: LoyaltySettings) => {
        setLoyaltySettings(settings);
    };

    const addCustomerTier = (tier: Partial<CustomerTier>) => {
        setCustomerTiers(prev => [...prev, { id: `t-${Date.now()}`, name: 'New', minSpend: 0, discount: 0, color: 'bg-gray-100', badgeIcon: 'star', ...tier } as CustomerTier]);
    };

    const createVoucher = (voucher: Partial<Voucher>) => {
        setVouchers(prev => [...prev, { id: `v-${Date.now()}`, code: '', type: 'Percentage', value: 0, limit: 0, used: 0, expiryDate: '', status: 'Active', ...voucher } as Voucher]);
    };

    const sendBroadcastMessage = (audience: string, channel: string, message: string) => {
        alert(`Message sent to ${audience} via ${channel}`);
    };

    const addCourier = (courier: Partial<Courier>) => {
        setCouriers(prev => [...prev, { id: `cr-${Date.now()}`, name: '', phone: '', baseRate: 0, logo: '', status: 'Active', ...courier } as Courier]);
    };

    const updateShippingRate = (id: string, data: Partial<ShippingRate>) => {
        setShippingRates(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    };

    const settleCOD = (ids: string[]) => {
        setOnlineOrders(prev => prev.map(o => ids.includes(o.id) ? { ...o, paymentStatus: 'Settled' as any } : o));
    };

    const addStaff = async (staffData: Partial<Staff>) => {
        // ដូរពី currentUser ទៅ user ឲ្យត្រូវនឹង State របស់ bro
        if (!user || !staffData.email || !staffData.password) {
            alert("សូមបំពេញ Email និង Password ឲ្យបានត្រឹមត្រូវ!");
            return;
        }

        try {
            // ប្រើ initApp ព្រោះខាងលើ bro បាន import ដាក់ឈ្មោះកាត់បែបនេះ
            const secondaryApp = initApp(app.options, `StaffApp-${Date.now()}`);
            const secondaryAuth = getAuth(secondaryApp);

            // 1. បង្កើតគណនីចូលប្រព័ន្ធ (Firebase Auth)
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, staffData.email, staffData.password);
            const newUid = userCredential.user.uid;

            // 2. បិទ Secondary App វិញភ្លាមៗ (ប្រើ delApp)
            await secondaryAuth.signOut();
            await delApp(secondaryApp);

            // 3. រក្សាទុកទិន្នន័យចូល Database (Firestore)
            const staffRef = doc(db, 'tenants', user.uid, 'staff', newUid);
            await setDoc(staffRef, {
                ...staffData,
                id: newUid,
                status: 'Active',
                createdAt: new Date()
            });

            // Add a global lookup document for the staff member
            await setDoc(doc(db, 'users', newUid), { tenantId: user.uid, role: staffData.role, isStaff: true });

            alert("បង្កើតគណនីបុគ្គលិកបានជោគជ័យ! (Success)");

        } catch (error: any) {
            console.error("🔥 Firebase Auth Error:", error);
            alert("បរាជ័យក្នុងការបង្កើតគណនី: " + error.message);
        }
    };

    const updateStaff = async (id: string, data: Partial<Staff>) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, 'tenants', user.uid, 'staff', id), data);
            console.log(`✅ Staff updated: ${id}`);
        } catch (error) {
            console.error('❌ Error updating staff:', error);
        }
    };

    const deleteStaff = async (id: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, 'tenants', user.uid, 'staff', id));
            console.log(`✅ Staff deleted: ${id}`);
        } catch (error) {
            console.error('❌ Error deleting staff:', error);
        }
    };

    const updateStaffStatus = async (id: string, status: string) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, 'tenants', user.uid, 'staff', id), { status });
            console.log(`✅ Staff status updated: ${id} -> ${status}`);
        } catch (error) {
            console.error('❌ Error updating staff status:', error);
        }
    };

    const updateRolePermissions = (roleId: string, permissions: Permission[]) => {
        setRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions } : r));
    };

    const updateShopSettings = async (settings: ShopSettings) => {
        if (!user) {
            console.error('❌ Cannot update shop settings: User not authenticated');
            return;
        }

        try {
            const sanitizedSettings = sanitizeData(settings, {
                name: '',
                phone: '',
                email: '',
                address: '',
                logo: '',
                timezone: '',
                currency: 'USD',
                taxRate: 0,
                telegramToken: '',
                telegramChatId: ''
            });

            await setDoc(doc(db, 'tenants', user.uid, 'settings', 'shopSettings'), sanitizedSettings, { merge: true });
            console.log(`✅ Shop settings updated successfully`);
        } catch (error) {
            console.error('❌ Error updating shop settings:', error);
        }
    };

    const renewSubscription = (plan: string) => {
        setSubscription({ status: 'Active', plan, expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
    };

    const toggle2FA = () => {
        setUserSecurity(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
    };

    const revokeSession = (id: string) => {
        setActiveSessions(prev => prev.filter(s => s.id !== id));
    };

    const markAllNotificationsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const completeOnboarding = () => {
        setCurrentView('dashboard');
    };

    const resumeOrder = (id: string) => {
        // Mock resume
        setHoldOrders(prev => prev.filter(h => h.id !== id));
        setIsHoldOrdersOpen(false);
    };

    const removeHoldOrder = (id: string) => {
        setHoldOrders(prev => prev.filter(h => h.id !== id));
    };

    const addSupplier = (s: Partial<Supplier>) => {
        setSuppliers(prev => [...prev, { id: `s-${Date.now()}`, name: '', phone: '', email: '', category: 'General', outstandingDebt: 0, ...s } as Supplier]);
    };

    const createPO = (po: Partial<PurchaseOrder>) => {
        setPurchaseOrders(prev => [...prev, { id: `PO-${Date.now()}`, supplierId: '', supplierName: '', date: new Date().toISOString(), status: 'Pending', totalAmount: 0, items: [], warehouse: 'Main', ...po } as PurchaseOrder]);
        setCurrentView('purchase-orders');
    };

    const processRefund = (orderId: string, items: any[], amount: number) => {
        // Logic
    };

    const addDiscount = (d: Partial<Discount>) => {
        setDiscounts(prev => [...prev, { id: `d-${Date.now()}`, name: '', type: 'Percentage', value: 0, startDate: '', endDate: '', ...d } as Discount]);
    };

    const deleteDiscount = (id: string) => {
        setDiscounts(prev => prev.filter(d => d.id !== id));
    };

    const updateTenantStatus = (id: string, status: 'Active' | 'Suspended') => {
        setTenants(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    };

    const renewTenant = (id: string) => {
        // Logic
    };

    return (
        <DataContext.Provider value={{
            user, authLoading, login, registerShop, logout, currentView, setCurrentView, isSidebarOpen, setIsSidebarOpen,
            branches, currentBranch, setCurrentBranch,
            isPaymentModalOpen, setIsPaymentModalOpen, isCreateOrderModalOpen, setIsCreateOrderModalOpen,
            isShippingSetupModalOpen, setIsShippingSetupModalOpen, isAddLeadModalOpen, setIsAddLeadModalOpen,
            isDepositModalOpen, setIsDepositModalOpen, isSplitBillModalOpen, setIsSplitBillModalOpen,
            isHoldOrdersOpen, setIsHoldOrdersOpen, isVariantModalOpen, setIsVariantModalOpen, isShippingLabelModalOpen, setIsShippingLabelModalOpen,
            subscription, renewSubscription, products, categories, searchQuery, setSearchQuery,
            selectedCategory, setSelectedCategory, cart, addToCart, removeFromCart, updateQuantity, clearCart,
            cartTotal, taxAmount, finalTotal, createOrder, onlineOrders, selectedOnlineOrder, selectOnlineOrder,
            updateOrderStatus, createOnlineOrder, verifyPayment, setOrderShipping, updateOrderCustomer, editingOrder, setEditingOrder, updateOnlineOrder, deleteOnlineOrder, holdOrders, resumeOrder,
            removeHoldOrder, settleCOD, customers, leads, selectedContact, setSelectedContact, editingContact,
            setEditingContact, addLead, addCustomer, updateCustomer, deleteCustomer, updateLead, addDeposit, feedbacks, loyaltySettings,
            saveLoyaltySettings, customerTiers, addCustomerTier, setEditingProduct, editingProduct, addProduct,
            updateProduct, deleteProduct, adjustStock, performStockAudit, addStockTransfer, staff, addStaff, currentStaff, setCurrentStaff, updateStaff, deleteStaff, updateStaffStatus,
            roles, updateRolePermissions, suppliers, addSupplier, purchaseOrders, createPO, couriers, addCourier,
            shippingRates, updateShippingRate, shippingZones, setShippingZones, vouchers, createVoucher, sendBroadcastMessage, shopSettings,
            updateShopSettings, auditLogs, userSecurity, toggle2FA, activeSessions, revokeSession, notifications,
            markAllNotificationsRead, completeOnboarding, customFieldsSchema, addCustomFieldDef,
            removeCustomFieldDef, orders, setOrders, deductStockFromOrder, autoReceiptTelegram, setAutoReceiptTelegram, processRefund, discounts, addDiscount, deleteDiscount, tenants,
            updateTenantStatus, renewTenant, noteCategories, setNoteCategories, contactStages, setContactStages,
            posCustomer, setPosCustomer, draftOnlineOrder, setDraftOnlineOrder, prefillOrderData, setPrefillOrderData,
            stockAdjustments, syncMobileStockTake
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
