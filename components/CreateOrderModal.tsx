
import React, { useState, useEffect, useRef } from 'react';
import { useData, CartItem, Product, CustomerInfo } from '../context/DataContext';
import { CreditCard, Search, X, Plus, Minus, Trash2, User, MapPin, Package, Check, Save, Truck, Edit2, Upload, MessageCircle, Facebook, Video, Store, Percent, DollarSign, Calendar, Map } from 'lucide-react';
import AddLeadModal from './AddLeadModal';

const CreateOrderModal: React.FC = () => {
    const { setIsCreateOrderModalOpen, products, createOnlineOrder, customers, leads, draftOnlineOrder, setDraftOnlineOrder, shippingZones, editingOrder, setEditingOrder, updateOnlineOrder, prefillOrderData, setPrefillOrderData, user, isTaxEnabled, taxRate } = useData();
    
    // --- Local State ---
    // Customer Logic
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerInfo | null>(null);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [orderSource, setOrderSource] = useState('Facebook');
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [tempAddress, setTempAddress] = useState('');

    // Variant & UOM Selection State
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [selectedVariantProduct, setSelectedVariantProduct] = useState<any>(null);
    const [selectedProductForUnit, setSelectedProductForUnit] = useState<any>(null);

    // New Customer Quick Add State
    const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);

    // Product/Cart Logic (Local to this modal)
    const [productSearch, setProductSearch] = useState('');
    const [items, setItems] = useState<CartItem[]>([]);
    const [showProductDropdown, setShowProductDropdown] = useState(false);

    // Payment & Shipping Logic
    const [shippingFee, setShippingFee] = useState('1.00');
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Transfer'>('COD');
    const [paymentBank, setPaymentBank] = useState('ABA');
    const [selectedCarrier, setSelectedCarrier] = useState('J&T Express');
    const [showCarrierDropdown, setShowCarrierDropdown] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [bankSlipImage, setBankSlipImage] = useState<string | null>(null);
    
    // Smart Features State
    const [deliveryDate, setDeliveryDate] = useState('');
    const [selectedZone, setSelectedZone] = useState('');

    // Discount Logic
    const [discountValue, setDiscountValue] = useState('');
    const [discountType, setDiscountType] = useState<'Fixed' | 'Percentage'>('Fixed');

    // Deposit Logic
    const [depositAmount, setDepositAmount] = useState('');

    // Order Notes
    const [notes, setNotes] = useState('');

    // Refs for click outside
    const customerRef = useRef<HTMLDivElement>(null);
    const productRef = useRef<HTMLDivElement>(null);
    const carrierRef = useRef<HTMLDivElement>(null);

    // Permission Check for Discount
    const canApplyDiscount = ['Admin', 'Super Admin', 'online_sales_lead'].includes(user?.role || '');

    // --- Constants ---
    const CARRIERS = [
        { name: 'J&T Express', color: 'bg-red-500', icon: 'J&T', short: 'J&T' },
        { name: 'Virak Buntham', color: 'bg-blue-600', icon: 'VB', short: 'VET' },
        { name: 'Grab Express', color: 'bg-green-500', icon: 'GR', short: 'Grab' },
        { name: 'CE Express', color: 'bg-orange-500', icon: 'CE', short: 'CE' },
        { name: 'Capitol', color: 'bg-purple-600', icon: 'CP', short: 'Capitol' },
        { name: 'Other', color: 'bg-gray-500', icon: 'OT', short: 'Other' },
    ];

    const SOURCES = [
        { name: 'Facebook', icon: <Facebook size={16} className="text-blue-600" /> },
        { name: 'Telegram', icon: <MessageCircle size={16} className="text-sky-500" /> },
        { name: 'TikTok', icon: <Video size={16} className="text-black dark:text-white" /> },
        { name: 'Walk-in', icon: <Store size={16} className="text-purple-500" /> },
    ];

    // --- Initialization from Editing Order or Draft Context ---
    useEffect(() => {
        if (editingOrder) {
            // Pre-fill from existing order for EDIT mode
            if (editingOrder.customer) {
                const custInfo = {
                    name: editingOrder.customer.name,
                    phone: editingOrder.customer.phone,
                    address: editingOrder.customer.address || '',
                    avatar: editingOrder.customer.avatar || 'U',
                    type: editingOrder.customer.type || 'Normal'
                };
                setSelectedCustomer(custInfo);
                setTempAddress(custInfo.address);
            }
            if (editingOrder.source) setOrderSource(editingOrder.source);
            if (editingOrder.items) setItems([...editingOrder.items]);
            setShippingFee((editingOrder.shippingFee || 0).toString());
            setPaymentMethod(editingOrder.paymentMethod as 'COD' | 'Transfer' || 'COD');
            setPaymentBank(editingOrder.paymentBank || 'ABA');
            setSelectedCarrier(editingOrder.shippingCarrier || 'J&T Express');
            setTransactionId(editingOrder.transactionId || '');
            setBankSlipImage(editingOrder.bankSlipImage || null);
            setDeliveryDate(editingOrder.deliveryDate || '');
            setSelectedZone(editingOrder.shippingDetails?.zone || '');
            setDiscountValue((editingOrder.discount || 0).toString());
            setDepositAmount((editingOrder.deposit || 0).toString());
            setNotes(editingOrder.notes || editingOrder.remark || '');
        } else if (draftOnlineOrder) {
            // Pre-fill from draft for CREATE mode
            if (draftOnlineOrder.customer) {
                const c = draftOnlineOrder.customer;
                const custInfo = {
                    name: c.name,
                    phone: c.phone,
                    address: c.address || '',
                    avatar: c.avatar || 'U',
                    type: typeof c.status === 'string' ? c.status : (Array.isArray(c.status) ? c.status[0] : 'Normal')
                };
                setSelectedCustomer(custInfo);
                setTempAddress(custInfo.address);
                if (c.source) setOrderSource(c.source);
            }

            if (draftOnlineOrder.items && draftOnlineOrder.items.length > 0) {
                const newItems: CartItem[] = [];
                draftOnlineOrder.items.forEach(draftItem => {
                    const product = products.find(p => p.id === draftItem.id);
                    if (product) {
                        newItems.push({
                            ...product,
                            quantity: draftItem.qty
                        });
                    }
                });
                setItems(newItems);
            }

            setDraftOnlineOrder(null);
        } else if (prefillOrderData) {
            // PREFILL logic for new order from CRM
            if (prefillOrderData.customer) {
                const c = prefillOrderData.customer;
                const custInfo = {
                    name: c.name,
                    phone: c.phone,
                    address: c.address || '',
                    avatar: c.avatar || 'U',
                    type: typeof c.status === 'string' ? c.status : (Array.isArray(c.status) ? c.status[0] : 'Normal')
                };
                setSelectedCustomer(custInfo);
                setTempAddress(custInfo.address);
            }

            if (prefillOrderData.items && prefillOrderData.items.length > 0) {
                const newItems: CartItem[] = [];
                prefillOrderData.items.forEach((prefillItem: any) => {
                    // ✅ AI ផ្ញើ CartItem ពេញ (price, unitId, variantId) → ប្រើផ្ទាល់
                    if (prefillItem.price !== undefined && prefillItem.quantity !== undefined) {
                        newItems.push(prefillItem as CartItem);
                    } else {
                        // fallback: rebuild ពី product id (CRM path)
                        const product = products.find(p => p.id === prefillItem.id);
                        if (product) {
                            newItems.push({
                                ...product,
                                quantity: prefillItem.qty ?? 1
                            });
                        }
                    }
                });
                setItems(newItems);
            }
            // ✅ AI zone prefill
            if (prefillOrderData.zone) {
                setSelectedZone(prefillOrderData.zone);
            }
            // ✅ AI source prefill
            if (prefillOrderData.source) {
                setOrderSource(prefillOrderData.source);
            }
        } else if (!editingOrder) {
            // Reset to defaults when no editing order and no draft
            setSelectedCustomer(null);
            setCustomerSearch('');
            setOrderSource('Facebook');
            setTempAddress('');
            setItems([]);
            setProductSearch('');
            setShippingFee('1.00');
            setPaymentMethod('COD');
            setSelectedCarrier('J&T Express');
            setTransactionId('');
            setBankSlipImage(null);
            setDeliveryDate('');
            setSelectedZone('');
            setDiscountValue('');
            setDiscountType('Fixed');
            setDepositAmount('');
            setNotes('');
            setPaymentBank('ABA');
        }
    }, [editingOrder, draftOnlineOrder, prefillOrderData, products, setDraftOnlineOrder, setPrefillOrderData]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (customerRef.current && !customerRef.current.contains(event.target as Node)) {
                setShowCustomerDropdown(false);
            }
            if (productRef.current && !productRef.current.contains(event.target as Node)) {
                setShowProductDropdown(false);
            }
            if (carrierRef.current && !carrierRef.current.contains(event.target as Node)) {
                setShowCarrierDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // --- Search Filters ---

    // Filter Logic (Case-Insensitive Search) - Searches BOTH Customers and Leads
    const allContacts = [...customers, ...leads].filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i);
    const filteredCustomers = allContacts.filter(c => {
        const query = customerSearch.toLowerCase().trim();
        if (!query) return false;
        const name = (c.name || '').toLowerCase();
        const phone = (c.phone || '').toLowerCase();
        return name.includes(query) || phone.includes(query);
    });

    // NEW: Get the 5 most recently added contacts (assuming newer contacts are appended to the array)
    const recentContacts = [...allContacts].reverse().slice(0, 10);

    // Product Search Filter
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
        (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
    );

    // --- Handlers ---

    // Customer Selection
    const selectCustomer = (c: any) => {
        const custInfo = {
            name: c.name,
            phone: c.phone,
            address: c.address || '',
            avatar: c.avatar || 'U',
            type: typeof c.status === 'string' ? c.status : (Array.isArray(c.status) ? c.status[0] : 'Normal')
        };
        setSelectedCustomer(custInfo);
        setTempAddress(custInfo.address);
        if (c.source) setOrderSource(c.source);
        setCustomerSearch(''); 
        setShowCustomerDropdown(false); 

        // Auto-add interested products with preserved quantities
        try {
            const interestedProducts = c.interestedProducts || [];
            
            if (interestedProducts && interestedProducts.length > 0) {
                const newItems: CartItem[] = [];
                interestedProducts.forEach((interestedItem: any) => {
                    const product = products.find(p => p.id === interestedItem.id);
                    if (product) {
                        newItems.push({
                            ...product,
                            quantity: interestedItem.qty || 1
                        });
                    }
                });
                if (newItems.length > 0) {
                    setItems(newItems);
                }
            }
        } catch (error) {
            console.error("Error auto-adding interested products to cart:", error);
        }
    };

    const clearCustomer = () => {
        setSelectedCustomer(null);
        setCustomerSearch('');
    };

    // Quick Add Customer Handler
    const handleCustomerAdded = (newContact: any) => {
        const custInfo = {
            name: newContact.name,
            phone: newContact.phone,
            address: newContact.address || '',
            avatar: newContact.avatar || newContact.name.substring(0, 2).toUpperCase(),
            type: typeof newContact.status === 'string' ? newContact.status : (Array.isArray(newContact.status) ? newContact.status[0] : 'Normal')
        };
        setSelectedCustomer(custInfo);
        setTempAddress(custInfo.address);
        setShowNewCustomerModal(false);
    };

    const saveAddressEdit = () => {
        if (selectedCustomer) {
            setSelectedCustomer({ ...selectedCustomer, address: tempAddress });
            setIsEditingAddress(false);
        }
    };

    // --- Product & Cart Handlers ---

    // Helper to add item to local cart (replaces direct setItems in addToCart)
    const addItemToCart = (product: any, quantity = 1, unitData?: any) => {
        setItems(prev => {
            const variantId = product.variantId;
            const unitId = unitData?.unitId;

            const existingIndex = prev.findIndex(item => 
                item.id === product.id && 
                item.variantId === variantId && 
                item.unitId === unitId
            );

            if (existingIndex > -1) {
                const updatedItems = [...prev];
                updatedItems[existingIndex].quantity += quantity;
                return updatedItems;
            } else {
                const cartItem: CartItem = {
                    ...product,
                    quantity,
                    variantId,
                    ...(unitData && {
                        unitId: unitData.unitId,
                        selectedUnit: unitData.selectedUnit,
                        multiplier: unitData.multiplier,
                        selectedUnitPrice: unitData.price
                    })
                };
                return [...prev, cartItem];
            }
        });
    };

    // Helper function to determine if a product is out of stock
    const isProductOutOfStock = (product: any): boolean => {
        if (product.variants && product.variants.length > 0) {
            return product.variants.every((v: any) => (v.stock || 0) <= 0);
        }
        return (product.stock || 0) <= 0 && product.status !== 'In Stock';
    };

    const addToCart = (product: Product) => {
        // Prevent adding if out of stock
        if (isProductOutOfStock(product)) {
            return;
        }

        // If product has variants, show variant selection modal
        if (product.variants && product.variants.length > 0) {
            setSelectedVariantProduct(product);
            setShowVariantModal(true);
            setProductSearch('');
            setShowProductDropdown(false);
            return;
        }

        // If product has multiple units, show unit selection modal
        if (product.units && product.units.length > 1) {
            setSelectedProductForUnit(product);
            setShowUnitModal(true);
            setProductSearch('');
            setShowProductDropdown(false);
            return;
        } else if (product.units && product.units.length === 1) {
            // Single unit - add directly with unit data
            const unit = product.units[0];
            addItemToCart({ ...product, price: unit.price }, 1, {
                unitId: unit.unitId,
                selectedUnit: unit.name,
                multiplier: unit.multiplier,
                price: unit.price
            });
            setProductSearch('');
            setShowProductDropdown(false);
            return;
        }

        // No units/variants - add directly
        addItemToCart(product);
        setProductSearch('');
        setShowProductDropdown(false);
    };

    const handleVariantSelect = (variant: any) => {
        if (selectedVariantProduct) {
            const cartItem = {
                ...selectedVariantProduct,
                variantId: variant.id,
                name: `${selectedVariantProduct.name} (${variant.name})`,
                nameKh: `${selectedVariantProduct.nameKh || selectedVariantProduct.name} (${variant.name})`,
                price: variant.price,
                sku: variant.sku,
                stock: variant.stock,
                units: [],
                variants: [],
            };
            addItemToCart(cartItem);
        }
        setShowVariantModal(false);
        setSelectedVariantProduct(null);
    };

    const handleUnitSelected = (unit: any) => {
        if (selectedProductForUnit) {
            addItemToCart({ ...selectedProductForUnit, price: unit.price }, 1, {
                unitId: unit.unitId,
                selectedUnit: unit.name,
                multiplier: unit.multiplier,
                price: unit.price
            });
        }
        setShowUnitModal(false);
        setSelectedProductForUnit(null);
    };

    const updateQty = (id: number, delta: number) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        }));
    };

    const removeItem = (id: number) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const handleProductSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (filteredProducts.length > 0) {
                // Select first available product
                const firstAvailable = filteredProducts.find(p => (p.stock || 0) > 0 || p.status === 'In Stock');
                if (firstAvailable) {
                    addToCart(firstAvailable);
                }
            }
        }
    };

    const selectCarrier = (carrierName: string) => {
        setSelectedCarrier(carrierName);
        setShowCarrierDropdown(false);
    };

    // Handle Zone Change
    const handleZoneChange = (zoneId: string) => {
        setSelectedZone(zoneId);
        const zone = shippingZones.find(z => z.id === zoneId);
        if (zone) {
            setShippingFee(zone.price.toFixed(2));
        }
    };

    // Calculation
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    const calculateDiscountAmount = () => {
        const val = parseFloat(discountValue) || 0;
        if (discountType === 'Percentage') {
            return (subtotal * val) / 100;
        }
        return val;
    };

    const discountAmount = calculateDiscountAmount();
    const taxableAmount = subtotal - (discountAmount || 0);
    const modalTaxAmount = isTaxEnabled ? taxableAmount * (taxRate / 100) : 0;
    const total = Math.max(0, taxableAmount + modalTaxAmount + (parseFloat(shippingFee) || 0));

    // Submit
    const handleSubmit = () => {
        if (items.length === 0) {
            alert("Please add at least one product to the order.");
            return;
        }

        // Validation for Transfer or Deposit
        const hasDeposit = paymentMethod === 'COD' && parseFloat(depositAmount) > 0;
        if ((paymentMethod === 'Transfer' || hasDeposit) && !transactionId && !bankSlipImage) {
            alert("សូមបញ្ចូលលេខប្រតិបত្តិការ (Transaction ID) ឬ បញ្ចូលរូបភាពវិក្កយបត្របៃតង (Bank Slip) ជាមុនសិន!");
            return;
        }

        const customer = selectedCustomer || { 
            name: 'General Customer', 
            phone: 'N/A', 
            address: 'Walk-in', 
            avatar: 'GC', 
            type: 'Normal' 
        };

        const actualDiscountAmount = discountType === 'Percentage' 
            ? (Number(subtotal) * (Number(discountValue) || 0)) / 100 
            : Number(discountValue) || 0;

        const taxableAmountSubmit = Number(subtotal) - actualDiscountAmount;
        const taxAmountSubmit = isTaxEnabled ? taxableAmountSubmit * (taxRate / 100) : 0;
        const finalTotal = Math.max(0, taxableAmountSubmit + taxAmountSubmit + Number(parseFloat(shippingFee) || 0));
        const finalDeposit = paymentMethod === 'COD' ? (parseFloat(depositAmount) || 0) : 0;
        
        // Encode deposit into transactionId to bypass context schema limitations
        let finalTransactionId = transactionId || '';
        if (paymentMethod === 'Transfer') {
            finalTransactionId = `${paymentBank} - ${transactionId}`;
        } else if (paymentMethod === 'COD' && finalDeposit > 0) {
            finalTransactionId = `[DEP:${finalDeposit.toFixed(2)}] ${paymentBank} - ${transactionId}`;
        }
        
        // Smart fallback: Inject deposit info into notes so packer immediately sees it on the board
        const safeNotes = finalDeposit > 0 ? `[កក់មុន (Deposit): $${finalDeposit.toFixed(2)} តាម ${paymentBank}]\n${notes}` : notes;

        if (editingOrder) {
            updateOnlineOrder(editingOrder.id, {
                customer,
                items,
                shippingFee: parseFloat(shippingFee) || 0,
                paymentMethod,
                paymentBank,
                shippingCarrier: selectedCarrier,
                source: orderSource,
                transactionId: finalTransactionId,
                discount: actualDiscountAmount,
                tax: taxAmountSubmit,
                total: finalTotal,
                deposit: finalDeposit,
                deliveryDate,
                shippingDetails: selectedZone ? { ...editingOrder.shippingDetails, zone: selectedZone } : editingOrder.shippingDetails,
                bankSlipImage,
                notes: safeNotes
            });
        } else {
            createOnlineOrder(
                customer,
                items,
                parseFloat(shippingFee) || 0,
                paymentMethod,
                selectedCarrier,
                orderSource,
                finalTransactionId,
                actualDiscountAmount,
                deliveryDate,
                selectedZone,
                bankSlipImage,
                safeNotes,
                finalDeposit,
                taxAmountSubmit
            );
        }

        setIsCreateOrderModalOpen(false);
        setEditingOrder(null);
        setPrefillOrderData(null);
    };

    const selectedCarrierObj = CARRIERS.find(c => c.name === selectedCarrier) || CARRIERS[0];

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity flex items-center justify-center p-0 md:p-4 font-display">
            <div className="relative w-full h-full max-h-[100dvh] rounded-none m-0 flex flex-col bg-surface-light dark:bg-surface-dark shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-fade-in-up md:h-auto md:max-h-[90vh] md:rounded-xl md:max-w-5xl">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-surface-dark shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-khmer">{editingOrder ? 'កែប្រែការកុម្ម៉ង់' : 'បង្កើតការកុម្ម៉ង់ថ្មី'}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{editingOrder ? 'Edit Order' : 'Create New Online Order'}</p>
                    </div>
                    <button onClick={() => { setIsCreateOrderModalOpen(false); setEditingOrder(null); setPrefillOrderData(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 min-h-0 overflow-hidden md:flex-row">
                    
                    {/* Left: Form Area */}
                    <div className="h-[40vh] flex-shrink-0 overflow-y-auto custom-scrollbar p-6 bg-slate-50 dark:bg-[#0f172a] md:h-auto md:w-1/2 md:flex-1">
                        <div className="space-y-6 max-w-3xl mx-auto">
                            
                            {/* 1. Customer Section */}
                            <section className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative z-20">
                                <div className="flex flex-col gap-3 w-full md:flex-row md:items-center md:justify-between">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2 font-khmer">
                                        <User size={18} />
                                        ព័ត៌មានអតិថិជន (Customer)
                                    </h3>
                                    <div className="flex justify-end gap-2 w-full md:w-auto">
                                        {/* Source Dropdown */}
                                        <div className="relative">
                                            <select 
                                                value={orderSource}
                                                onChange={(e) => setOrderSource(e.target.value)}
                                                className="pl-8 pr-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                                            >
                                                {SOURCES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                            </select>
                                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                {SOURCES.find(s => s.name === orderSource)?.icon}
                                            </div>
                                        </div>

                                        {!selectedCustomer && (
                                            <button 
                                                onClick={() => setShowNewCustomerModal(true)}
                                                className="text-xs text-white bg-primary hover:bg-primary-hover px-3 py-1.5 rounded-lg font-medium font-khmer flex items-center gap-1 shadow-sm transition-all"
                                            >
                                                <Plus size={14} /> បន្ថែមថ្មី
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {selectedCustomer ? (
                                    <div className="flex flex-col gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-200 font-bold text-lg overflow-hidden shadow-sm">
                                                    {selectedCustomer.avatar && selectedCustomer.avatar.length > 2 ? (
                                                        <img src={selectedCustomer.avatar} alt={selectedCustomer.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        selectedCustomer.avatar || selectedCustomer.name.slice(0,1)
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white font-khmer text-lg">{selectedCustomer.name}</h4>
                                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                        <span className="font-mono">{selectedCustomer.phone}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                        <span className="text-xs px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-800/50">{selectedCustomer.type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={clearCustomer} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                                                <X size={18} />
                                            </button>
                                        </div>
                                        
                                        {/* Address Section with Edit */}
                                        <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800/50">
                                            {isEditingAddress ? (
                                                <div className="flex gap-2">
                                                    <textarea 
                                                        value={tempAddress}
                                                        onChange={(e) => setTempAddress(e.target.value)}
                                                        className="flex-1 text-sm p-2 rounded border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                                        rows={2}
                                                    />
                                                    <div className="flex flex-col gap-1">
                                                        <button onClick={saveAddressEdit} className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"><Check size={14} /></button>
                                                        <button onClick={() => setIsEditingAddress(false)} className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"><X size={14} /></button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-start justify-between group">
                                                    <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                        <MapPin size={16} className="mt-0.5 text-blue-500 shrink-0" />
                                                        <span className="leading-relaxed">{selectedCustomer.address || "No address provided"}</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => setIsEditingAddress(true)}
                                                        className="opacity-0 group-hover:opacity-100 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 p-1 rounded transition-all"
                                                        title="Edit Address"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative" ref={customerRef}>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                <Search size={18} />
                                            </span>
                                            <input 
                                                className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm font-khmer shadow-sm" 
                                                placeholder="ស្វែងរកឈ្មោះ ឬ លេខទូរស័ព្ទ..." 
                                                type="text"
                                                value={customerSearch}
                                                onChange={(e) => {
                                                    setCustomerSearch(e.target.value);
                                                    setShowCustomerDropdown(true);
                                                }}
                                                onFocus={() => setShowCustomerDropdown(true)}
                                            />
                                        </div>
                                        
                                        {/* Customer Dropdown */}
                                        {showCustomerDropdown && (
                                            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                                                {!customerSearch ? (
                                                    /* --- RECENT CONTACTS VIEW (EMPTY SEARCH) --- */
                                                    <>
                                                        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-10 backdrop-blur-sm">
                                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-khmer flex items-center gap-1.5">
                                                                <span className="material-icons-round text-[14px]">history</span> អតិថិជនទើបបន្ថែមថ្មីៗ
                                                            </span>
                                                        </div>
                                                        {recentContacts.length > 0 ? (
                                                            recentContacts.map((c, idx) => (
                                                                <div key={`recent-${idx}`} onClick={() => selectCustomer(c)} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                                                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden shrink-0">
                                                                        {c.avatar && c.avatar.length > 2 ? (
                                                                            <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            c.name.slice(0, 1)
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 font-khmer">{c.name}</p>
                                                                        <p className="text-xs text-slate-500">{c.phone}</p>
                                                                    </div>
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded border ${c.status === 'VIP' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-slate-100 text-slate-500 border-slate-200'} dark:bg-opacity-20`}>
                                                                        {Array.isArray(c.status) ? c.status[0] : c.status}
                                                                    </span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="p-4 text-center text-sm text-slate-500 font-khmer">មិនទាន់មានទិន្នន័យ</div>
                                                        )}
                                                    </>
                                                ) : (
                                                    /* --- SEARCH RESULTS VIEW --- */
                                                    filteredCustomers.length > 0 ? (
                                                        filteredCustomers.map((c, idx) => (
                                                            <div key={`search-${idx}`} onClick={() => selectCustomer(c)} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                                                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden shrink-0">
                                                                    {c.avatar && c.avatar.length > 2 ? (
                                                                        <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        c.name.slice(0, 1)
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 font-khmer">{c.name}</p>
                                                                    <p className="text-xs text-slate-500">{c.phone}</p>
                                                                </div>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded border ${c.status === 'VIP' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-slate-100 text-slate-500 border-slate-200'} dark:bg-opacity-20`}>
                                                                    {Array.isArray(c.status) ? c.status[0] : c.status}
                                                                </span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-6 text-center">
                                                            <p className="text-sm text-slate-500 font-khmer mb-3">
                                                                រកមិនឃើញអតិថិជន "{customerSearch}" ទេ
                                                            </p>
                                                            <button 
                                                                onClick={() => {
                                                                    setShowNewCustomerModal(true);
                                                                    setShowCustomerDropdown(false);
                                                                }}
                                                                className="text-white bg-primary hover:bg-primary-hover px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto font-khmer shadow-sm"
                                                            >
                                                                <Plus size={16} />
                                                                បង្កើតអតិថិជនថ្មី
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>

                            {/* 2. Product Selection (Updated) */}
                            <section className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[400px] flex flex-col z-10 relative">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2 font-khmer">
                                        <Package size={18} />
                                        បញ្ជីទំនិញ (Products)
                                    </h3>
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">{items.length} items added</span>
                                </div>

                                {/* Rich Autocomplete Search */}
                                <div className="relative mb-6" ref={productRef}>
                                    <div className="relative group">
                                        <input 
                                            className="block w-full pl-10 pr-12 py-3.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm font-khmer shadow-inner transition-all" 
                                            placeholder="ស្វែងរកទំនិញ (Scan barcode or type name)..." 
                                            type="text" 
                                            value={productSearch}
                                            onChange={(e) => {
                                                setProductSearch(e.target.value);
                                                setShowProductDropdown(true);
                                            }}
                                            onKeyDown={handleProductSearchKeyDown}
                                            onFocus={() => setShowProductDropdown(true)}
                                        />
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                            <Search size={20} />
                                        </span>
                                        {/* Scanner Icon Visual */}
                                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                            <span className="material-icons-outlined text-xl">qr_code_scanner</span>
                                        </span>
                                    </div>

                                    {/* Product Dropdown (Rich UI with Stock Visibility) */}
                                    {showProductDropdown && (() => {
                                        const displayProducts = productSearch ? filteredProducts : products;
                                        return (
                                        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                                            {displayProducts.length > 0 ? (
                                                displayProducts.map(p => {
                                                    const stock = p.stock || 0;
                                                    const isOutOfStock = stock <= 0 && p.status !== 'In Stock';
                                                    
                                                    return (
                                                        <div 
                                                            key={p.id} 
                                                            onClick={() => !isOutOfStock && addToCart(p)}
                                                            className={`px-4 py-3 flex items-center gap-4 border-b border-slate-100 dark:border-slate-700 last:border-0 group transition-colors ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900' : 'hover:bg-blue-50/50 dark:hover:bg-slate-700 cursor-pointer'}`}
                                                        >
                                                            {/* Thumbnail */}
                                                            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-600">
                                                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                                            </div>
                                                            
                                                            {/* Details */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start">
                                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 font-khmer truncate pr-2">
                                                                        {p.nameKh}
                                                                        {/* Enhanced Stock Visual */}
                                                                        {!isOutOfStock && (
                                                                            <span className="ml-2 text-xs font-normal text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded border border-green-100 dark:border-green-800/50">
                                                                                [{stock} in stock]
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                    <p className="text-sm font-bold text-primary">${p.price.toFixed(2)}</p>
                                                                </div>
                                                                <div className="flex justify-between items-center mt-0.5">
                                                                    <p className="text-xs text-slate-500 truncate w-3/4">{p.name} • SKU: {p.sku}</p>
                                                                    {isOutOfStock ? (
                                                                        <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-900/50">Out of Stock</span>
                                                                    ) : null}
                                                                </div>
                                                            </div>

                                                            {/* Add Icon */}
                                                            {!isOutOfStock && (
                                                                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                                                    <Plus size={18} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : productSearch ? (
                                                <div className="p-8 text-center flex flex-col items-center justify-center text-slate-500">
                                                    <Package size={32} className="mb-2 opacity-50" strokeWidth={1.5} />
                                                    <p className="text-sm font-khmer">រកមិនឃើញទំនិញ "{productSearch}"</p>
                                                </div>
                                            ) : null}
                                        </div>
                                        );
                                    })()}
                                </div>

                                {/* Quick Pick / Popular Products */}
                                <div className="mb-4 animate-in fade-in">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-khmer flex items-center gap-1">
                                            <span className="material-icons-round text-[14px] text-yellow-500">bolt</span> ទំនិញរហ័ស (Quick Pick)
                                        </h4>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 snap-x">
                                        {products.slice(0, 10).map(p => {
                                            const stock = p.stock || 0;
                                            const isOutOfStock = stock <= 0 && p.status !== 'In Stock';
                                            return (
                                                <div 
                                                    key={`quick-${p.id}`}
                                                    onClick={() => !isOutOfStock && addToCart(p)}
                                                    className={`shrink-0 w-20 rounded-xl border snap-start ${isOutOfStock ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800' : 'cursor-pointer border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all'} overflow-hidden flex flex-col group`}
                                                    title={p.nameKh || p.name}
                                                >
                                                    <div className="h-16 bg-slate-100 dark:bg-slate-700 w-full relative overflow-hidden">
                                                        {p.image ? (
                                                            <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400"><Package size={20} /></div>
                                                        )}
                                                        {isOutOfStock && (
                                                            <div className="absolute inset-0 bg-white/70 dark:bg-black/60 flex items-center justify-center text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider font-khmer">អស់ស្តុក</div>
                                                        )}
                                                    </div>
                                                    <div className="p-1.5 text-center bg-white dark:bg-slate-800 flex flex-col justify-between flex-1">
                                                        <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate font-khmer leading-tight mb-1">{p.nameKh || p.name}</p>
                                                        <p className="text-[11px] text-primary font-black leading-none">${p.price.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Cart Items List */}
                                <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[350px] custom-scrollbar bg-slate-50/50 dark:bg-slate-900/30 rounded-xl p-2 border border-dashed border-slate-200 dark:border-slate-700">
                                    {items.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                                <Package size={32} strokeWidth={1.5} className="opacity-50" />
                                            </div>
                                            <p className="text-sm font-khmer font-medium">មិនទាន់មានទំនិញ</p>
                                            <p className="text-xs">No items in cart</p>
                                        </div>
                                    ) : (
                                        items.map(item => (
                                            <div key={item.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm group hover:border-primary/30 transition-all">
                                                {/* Image */}
                                                <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 dark:border-slate-600 flex-shrink-0 relative">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/5"></div>
                                                </div>
                                                
                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate font-khmer">{item.nameKh}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 rounded">{item.sku || 'N/A'}</span>
                                                        <p className="text-xs font-bold text-primary">${item.price.toFixed(2)}</p>
                                                    </div>
                                                </div>

                                                {/* Qty Controls */}
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1 h-9">
                                                        <button 
                                                            onClick={() => updateQty(item.id, -1)}
                                                            className="w-7 h-full flex items-center justify-center text-slate-500 hover:bg-white dark:hover:bg-slate-600 hover:text-red-500 rounded-md transition-all shadow-sm"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-bold text-slate-800 dark:text-slate-200 select-none">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => updateQty(item.id, 1)}
                                                            className="w-7 h-full flex items-center justify-center text-slate-500 hover:bg-white dark:hover:bg-slate-600 hover:text-blue-500 rounded-md transition-all shadow-sm"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    
                                                    {/* Total Price */}
                                                    <div className="text-right w-16 hidden sm:block">
                                                        <span className="font-bold text-slate-900 dark:text-white block">${(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>

                                                    {/* Remove */}
                                                    <button 
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Right: Payment & Summary */}
                    <div className="flex flex-col flex-1 min-h-0 relative bg-white dark:bg-surface-dark border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 md:w-1/2 shadow-xl z-10">
                        <div className="p-6 flex-1 overflow-y-auto pb-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2 font-khmer mb-6">
                                <CreditCard size={18} />
                                ការទូទាត់ (Payment)
                            </h3>

                            {/* Shipping Carrier Dropdown */}
                            <div className="mb-4 space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Shipping Via (ដឹកជញ្ជូនតាម)</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1" ref={carrierRef}>
                                        <button 
                                            type="button"
                                            onClick={() => setShowCarrierDropdown(!showCarrierDropdown)}
                                            className="w-full flex items-center justify-between border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className={`w-6 h-6 shrink-0 rounded flex items-center justify-center text-[10px] font-bold text-white ${selectedCarrierObj.color}`}>
                                                    {selectedCarrierObj.icon}
                                                </span>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedCarrierObj.name}</span>
                                            </div>
                                            <span className="material-icons-outlined text-slate-400">expand_more</span>
                                        </button>

                                        {/* Dropdown Options */}
                                        {showCarrierDropdown && (
                                            <div className="absolute z-30 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                {CARRIERS.map((carrier) => (
                                                    <div 
                                                        key={carrier.name} 
                                                        onClick={() => selectCarrier(carrier.name)}
                                                        className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 last:border-0"
                                                    >
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${carrier.color}`}>
                                                            {carrier.icon}
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{carrier.name}</span>
                                                        {selectedCarrier === carrier.name && (
                                                            <span className="ml-auto text-primary material-icons-round text-sm">check</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Scheduled Delivery Picker */}
                                    <div className="relative w-[130px]">
                                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                                            <Calendar size={16} />
                                        </div>
                                        <input 
                                            type="datetime-local"
                                            value={deliveryDate}
                                            onChange={(e) => setDeliveryDate(e.target.value)}
                                            className="w-full h-full pl-9 pr-1 py-3 text-xs border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                            title="Schedule Delivery"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="mb-6 space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Method</label>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                    <button 
                                        onClick={() => setPaymentMethod('COD')}
                                        className={`py-2.5 text-xs font-bold rounded-lg transition-all ${paymentMethod === 'COD' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                    >
                                        COD (ទូទាត់ពេលដឹក)
                                    </button>
                                    <button 
                                        onClick={() => setPaymentMethod('Transfer')}
                                        className={`py-2.5 text-xs font-bold rounded-lg transition-all ${paymentMethod === 'Transfer' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                    >
                                        Transfer (វេរលុយ)
                                    </button>
                                </div>

                                {/* Deposit Input for COD */}
                                {paymentMethod === 'COD' && (
                                    <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-lg animate-in fade-in slide-in-from-top-2">
                                        <label className="flex items-center gap-2 text-sm font-khmer text-slate-700 dark:text-slate-300 mb-2 cursor-pointer w-max">
                                            <input 
                                                type="checkbox" 
                                                checked={parseFloat(depositAmount) > 0} 
                                                onChange={(e) => setDepositAmount(e.target.checked ? '1.00' : '')} 
                                                className="rounded text-primary focus:ring-primary w-4 h-4 border-slate-300" 
                                            />
                                            មានប្រាក់កក់មុនទេ? (Deposit)
                                        </label>
                                        {parseFloat(depositAmount) > 0 && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="relative w-32">
                                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold">$</span>
                                                    <input 
                                                        type="number" 
                                                        value={depositAmount} 
                                                        onChange={(e) => setDepositAmount(e.target.value)} 
                                                        className="w-full pl-7 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-1 focus:ring-primary outline-none font-bold" 
                                                        placeholder="0.00" 
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-500">វេរចូល (To):</span>
                                                <select
                                                    value={paymentBank}
                                                    onChange={(e) => setPaymentBank(e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:ring-1 focus:ring-primary outline-none text-sm font-medium"
                                                >
                                                    <option value="ABA">ABA Bank</option>
                                                    <option value="ACLEDA">ACLEDA Bank</option>
                                                    <option value="Wing">Wing Bank</option>
                                                    <option value="Bakong">Bakong (KHQR)</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Conditional Payment Evidence */}
                            {(paymentMethod === 'Transfer' || (paymentMethod === 'COD' && parseFloat(depositAmount) > 0)) && (
                                <div className="mb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
                                    {/* Bank Selection Dropdown */}
                                    <div className="mb-4 mt-2">
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-khmer">
                                            បង់លុយតាមរយៈ (Paid By)
                                        </label>
                                        <div className="relative group">
                                            <select
                                                value={paymentBank}
                                                onChange={(e) => setPaymentBank(e.target.value)}
                                                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-sm font-medium appearance-none shadow-sm cursor-pointer"
                                            >
                                                <option value="ABA">ABA Bank</option>
                                                <option value="ACLEDA">ACLEDA Bank</option>
                                                <option value="Wing">Wing Bank</option>
                                                <option value="Bakong">Bakong (KHQR)</option>
                                                <option value="Canadia">Canadia Bank</option>
                                                <option value="Sathapana">Sathapana Bank</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                                <span className="material-icons-round text-[18px]">account_balance</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Upload Box */}
                                    <div className="relative group">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const previewUrl = URL.createObjectURL(file);
                                                    setBankSlipImage(previewUrl);
                                                }
                                            }}
                                        />
                                        {bankSlipImage ? (
                                            <div className="relative h-32 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50">
                                                <img src={bankSlipImage} alt="Bank Slip" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setBankSlipImage(null)}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all active:scale-95"
                                                    title="Remove Image"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/50 group-hover:border-primary group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10 transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 mb-2">
                                                    <Upload size={16} />
                                                </div>
                                                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Upload Bank Slip</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">Click or drag image here</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Transaction ID */}
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <span className="text-xs font-bold">ID</span>
                                        </div>
                                        <input 
                                            className="block w-full pl-8 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary text-xs" 
                                            placeholder="Enter Transaction ID..."
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Order Notes - Moved above summary for better visual flow */}
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-khmer">
                                    កំណត់សម្គាល់ (Order Notes)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    placeholder="វាយបញ្ចូលការផ្តាំផ្ញើរបស់ភ្ញៀវទីនេះ..."
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-khmer resize-none shadow-sm"
                                />
                            </div>

                            {/* Summary Section - Redesigned with Gray Container & Aligned Inputs */}
                            <div className="space-y-3 py-4 border-t border-slate-100 dark:border-slate-800 mt-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl px-4 mb-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-700/50">
                                
                                {/* Subtotal */}
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600 dark:text-slate-400 font-khmer">សរុបរង (Subtotal)</span>
                                    <span className="font-bold text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
                                </div>
                                
                                {/* Discount Field */}
                                {canApplyDiscount && (
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-slate-600 dark:text-slate-400 font-khmer">បញ្ចុះតម្លៃ (Discount)</span>
                                        {discountAmount > 0 && (
                                            <span className="text-[10px] text-green-600 font-medium">
                                                -{discountType === 'Fixed' ? '$' : ''}{discountValue}{discountType === 'Percentage' ? '%' : ''} (${discountAmount.toFixed(2)})
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all shadow-sm">
                                        <input 
                                            type="number" 
                                            value={discountValue}
                                            onChange={(e) => setDiscountValue(e.target.value)}
                                            className="w-16 pl-2 pr-1 py-1 text-right text-sm bg-transparent outline-none text-slate-900 dark:text-white font-medium"
                                            placeholder="0"
                                        />
                                        <button 
                                            onClick={() => setDiscountType(discountType === 'Fixed' ? 'Percentage' : 'Fixed')}
                                            className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-colors ${discountType === 'Fixed' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}
                                            title="Toggle Discount Type"
                                        >
                                            {discountType === 'Fixed' ? <DollarSign size={12} /> : <Percent size={12} />}
                                        </button>
                                    </div>
                                </div>
                                )}

                                {/* Delivery Zone & Fee */}
                                <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600 dark:text-slate-400 font-khmer flex items-center gap-1.5">
                                            <Map size={14} className="text-slate-400" /> តំបន់ (Zone)
                                        </span>
                                        <select 
                                            value={selectedZone}
                                            onChange={(e) => handleZoneChange(e.target.value)}
                                            className="w-32 text-xs py-1.5 px-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-primary outline-none cursor-pointer shadow-sm font-khmer"
                                        >
                                            <option value="">កំណត់ផ្ទាល់ (Manual)</option>
                                            {shippingZones.map(z => (
                                                <option key={z.id} value={z.id}>{z.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600 dark:text-slate-400 font-khmer">ថ្លៃដឹក (Delivery Fee)</span>
                                        <div className="relative w-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all shadow-sm flex items-center overflow-hidden">
                                            <div className="pl-2.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">$</div>
                                            <input 
                                                className="block w-full pl-1 pr-2.5 py-1.5 bg-transparent text-slate-900 dark:text-white font-bold text-sm text-right outline-none" 
                                                type="number"
                                                value={shippingFee}
                                                onChange={(e) => {
                                                    setShippingFee(e.target.value);
                                                    if(selectedZone) setSelectedZone(''); // Clear zone if manually changed
                                                }}
                                                onFocus={(e) => e.target.select()}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {isTaxEnabled && (
                                    <div className="flex justify-between items-center text-sm mt-2">
                                        <span className="text-gray-500 dark:text-gray-400 font-khmer">
                                            ពន្ធ (Tax {taxRate}%)
                                        </span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">
                                            ${modalTaxAmount.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Total & Button */}
                        <div className="sticky bottom-0 w-full bg-white dark:bg-slate-800/50 p-4 border-t border-slate-200 dark:border-slate-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
                            <div className="flex justify-between items-end mb-4">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Grand Total</span>
                                    <span className="text-xs text-slate-400 font-khmer">សរុបទាំងអស់</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-3xl font-black text-primary">${total.toFixed(2)}</span>
                                    <span className="text-xs text-slate-500 font-medium">≈ {(total * 4100).toLocaleString()} ៛</span>
                                </div>
                            </div>

                            {paymentMethod === 'COD' && parseFloat(depositAmount) > 0 && (
                                    <div className="flex justify-between items-center mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-red-600 dark:text-red-400 font-khmer">ប្រាក់ត្រូវប្រមូលពីភ្ញៀវ</span>
                                            <span className="text-xs text-red-500 opacity-80">Amount to Collect (COD)</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-xl font-black text-red-600 dark:text-red-400">${Math.max(0, total - parseFloat(depositAmount)).toFixed(2)}</span>
                                            <span className="text-xs text-red-500 font-medium font-khmer">បានកក់: ${parseFloat(depositAmount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            
                            <button 
                                onClick={handleSubmit}
                                className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                            >
                                <Check size={20} className="group-hover:scale-110 transition-transform" />
                                <span className="font-khmer text-base">{editingOrder ? 'រក្សាទុកការកែប្រែ' : 'បង្កើតវិក្កយបត្រ'} ({editingOrder ? 'Save Changes' : 'Create Order'})</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Add Customer Modal Overlay - REUSED COMPONENT */}
            <AddLeadModal 
                isOpen={showNewCustomerModal}
                onClose={() => setShowNewCustomerModal(false)}
                onSuccess={handleCustomerAdded}
            />

            {/* Variant Selection Modal */}
            {showVariantModal && selectedVariantProduct && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70]">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-96 max-w-[90vw] animate-in scale-in duration-200 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white font-khmer">Select Variant</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{selectedVariantProduct.nameKh}</p>
                            </div>
                            <button onClick={() => setShowVariantModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {selectedVariantProduct.variants?.map((variant: any) => {
                                const isVariantOutOfStock = (variant.stock || 0) <= 0;
                                return (
                                    <button
                                        key={variant.id}
                                        onClick={() => !isVariantOutOfStock && handleVariantSelect(variant)}
                                        disabled={isVariantOutOfStock}
                                        className={`w-full p-4 text-left border rounded-lg transition-all group ${isVariantOutOfStock ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 opacity-50 cursor-not-allowed' : 'border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10'}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-semibold text-slate-900 dark:text-white">{variant.name}</h4>
                                                <p className={`text-xs mt-1 ${isVariantOutOfStock ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>Stock: {variant.stock || 0}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary group-hover:scale-110 transition-transform">${variant.price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Unit Selection Modal */}
            {showUnitModal && selectedProductForUnit && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70]">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-96 max-w-[90vw] animate-in scale-in duration-200 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white font-khmer">Select Unit</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{selectedProductForUnit.nameKh}</p>
                            </div>
                            <button onClick={() => setShowUnitModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {selectedProductForUnit.units?.map((unit: any) => (
                                <button key={unit.unitId} onClick={() => handleUnitSelected(unit)} className="w-full p-4 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">{unit.name}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{unit.multiplier > 1 ? `1 ${unit.name} = ${unit.multiplier} base units` : 'Base unit'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary group-hover:scale-110 transition-transform">${unit.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateOrderModal;
