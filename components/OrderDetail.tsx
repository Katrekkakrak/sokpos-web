import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Package, Facebook, MessageCircle, Music, Send, Instagram, Globe, X } from 'lucide-react';

const OrderDetail: React.FC = () => {
    // 1. Context Extraction (Added setSelectedOnlineOrder, contacts, and customers)
    const { 
        selectedOnlineOrder, 
        setSelectedOnlineOrder, 
        onlineOrders, 
        contacts, 
        customers, 
        setCurrentView, 
        verifyPayment, 
        setIsShippingSetupModalOpen, 
        updateOrderCustomer, 
        setEditingOrder, 
        setIsCreateOrderModalOpen 
    } = useData();
    
    // 2. Always get the freshest order data
    const order = onlineOrders?.find((o: any) => o.id === selectedOnlineOrder?.id) || selectedOnlineOrder;
    console.log("👉 ព័ត៌មាន Order ទាំងមូលគឺ៖", order);
    
    // Flexible data key handling for shipping info
    // ទាញយកទិន្នន័យពីក្រឡុក shippingDetails ឬ shippingCarrier ដែលយើងទើបរកឃើញ
    const displayCourier = order?.shippingDetails?.courier || order?.shippingCarrier || order?.shippingCourier;
    const displayTracking = order?.shippingDetails?.trackingNumber || order?.trackingNumber;
    
    // Decode hidden deposit from transactionId
    let displayDeposit = Number(order?.deposit || 0);
    let displayTxId = order?.transactionId || '';
    
    if (typeof displayTxId === 'string' && displayTxId.includes('[DEP:')) {
        const match = displayTxId.match(/\[DEP:([0-9.]+)\]\s(.*)/);
        if (match) {
            displayDeposit = parseFloat(match[1]);
            displayTxId = match[2]; // The remaining string (e.g., "ABA - 12345")
        }
    }
    
    const [brokenImageIndices, setBrokenImageIndices] = useState<Set<number>>(new Set());
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editName, setEditName] = useState(order?.customer?.name || '');
    const [editPhone, setEditPhone] = useState(order?.customer?.phone || '');
    const [editAddress, setEditAddress] = useState(order?.customer?.address || '');
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    if (!order) return null;

    const handleEditDetailsClick = () => {
        setEditName(order.customer?.name || '');
        setEditPhone(order.customer?.phone || '');
        setEditAddress(order.customer?.address || '');
        setIsEditModalOpen(true);
    };

    const handleSaveDetails = () => {
        updateOrderCustomer(order.id, {
            name: editName,
            phone: editPhone,
            address: editAddress,
        });
        setIsEditModalOpen(false);
    };

    const getSourceIcon = (source: string) => {
        const sourceUpper = source?.toLowerCase() || '';
        switch (sourceUpper) {
            case 'facebook': return <Facebook className="w-4 h-4" />;
            case 'telegram': return <Send className="w-4 h-4" />;
            case 'tiktok': return <Music className="w-4 h-4" />;
            case 'instagram': return <Instagram className="w-4 h-4" />;
            case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
            case 'website':
            case 'web': return <Globe className="w-4 h-4" />;
            default: return <Globe className="w-4 h-4" />;
        }
    };

    const handleImageError = (index: number) => {
        setBrokenImageIndices(prev => new Set(prev).add(index));
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-200">
            {/* Top Navigation Bar */}
            <nav className="h-16 bg-white dark:bg-[#15202b] border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 sticky top-0 z-30 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView('online-orders')} className="p-2 -ml-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
                        <span className="material-icons-round">arrow_back</span>
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <span>Orders</span>
                            <span className="material-icons-round text-[10px]">chevron_right</span>
                            <span>Details</span>
                        </div>
                        <h1 className="font-semibold text-lg leading-tight">Order {order.id}</h1>
                    </div>
                    <span className="ml-4 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${order.paymentStatus === 'Verified' || order.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                        {order.paymentStatus === 'Pending' ? 'Pending Verification (រង់ចាំការត្រួតពិនិត្យ)' : order.paymentStatus}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                     <button 
                        onClick={() => setIsShippingSetupModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <span className="material-icons-round text-sm">local_shipping</span>
                        Set Shipping
                    </button>
                    <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors relative">
                        <span className="material-icons-round">notifications</span>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#15202b]"></span>
                    </button>
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium">Sophea Manager</p>
                            <p className="text-xs text-slate-500">Admin</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">SM</div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto custom-scroll p-6">
                <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Customer & Shipping Info */}
                        <div className="bg-white dark:bg-[#15202b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                                <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <span className="material-icons-round text-primary text-lg">person</span>
                                    Customer Information
                                </h2>
                                {/* RESTORED ORIGINAL EDIT BUTTON */}
                                <button onClick={() => { setEditingOrder(order); setIsCreateOrderModalOpen(true); }} className="text-primary hover:text-primary/80 text-sm font-medium">
                                    Edit Details
                                </button>
                            </div>
                            
                            {(() => {
                                // 1. Use 'customers' array if 'contacts' is undefined
                                const allCustomers = contacts || customers || [];
                                const fullCustomerInfo = allCustomers.find((c: any) => c.phone === order?.customer?.phone);

                                // 2. Check all exact data paths based on the Edit Contact schema
                                const fbLink = fullCustomerInfo?.customData?.['FACEBOOK PROFILE LINK'] 
                                            || fullCustomerInfo?.customData?.socialLink 
                                            || order?.customer?.customData?.['FACEBOOK PROFILE LINK'] 
                                            || order?.customer?.customData?.socialLink;

                                // 3. Priority Map logic
                                const directMapLink = fullCustomerInfo?.mapLink || order?.customer?.mapLink;
                                // Use standard Google Maps Search format for fallback
                                const finalMapUrl = directMapLink ? directMapLink : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order?.customer?.address || '')}`;
                                
                                return (
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Contact Details</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                        <span className="material-icons-round text-sm">badge</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{order.customer?.name}</p>
                                                        <p className="text-xs text-slate-500">Customer ID: {fullCustomerInfo?.id || order.customer?.id || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                        <span className="material-icons-round text-sm">phone</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium font-mono">{order.customer?.phone}</p>
                                                        <p className="text-xs text-slate-500">Mobile</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                        {getSourceIcon(order.source)}
                                                    </div>
                                                    <div>
                                                        {fbLink ? (
                                                            <a 
                                                                href={fbLink.startsWith('http') ? fbLink : `https://${fbLink}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                            >
                                                                {order.source || 'Facebook'}
                                                                <span className="material-icons-round text-[14px]">open_in_new</span>
                                                            </a>
                                                        ) : (
                                                            <p className="text-sm font-medium">{order.source || 'Direct Source'}</p>
                                                        )}
                                                        <p className="text-xs text-slate-500">Order Source</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 font-khmer">អាសយដ្ឋានដឹកជញ្ជូន (Shipping)</h3>
                                                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-100 dark:border-slate-700/50 h-32 overflow-y-auto">
                                                    <div className="flex gap-3">
                                                        <span className="material-icons-round text-primary mt-0.5">place</span>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-khmer">
                                                            {order.customer?.address || 'មិនមានអាសយដ្ឋាន'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* Shipping Badge (Option B) */}
                                                {displayCourier && (
                                                    <div className="mt-3 inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-md border border-indigo-100 dark:border-indigo-800/50">
                                                        <span className="material-icons-round text-[16px]">local_shipping</span>
                                                        <span className="text-xs font-semibold">{displayCourier}</span>
                                                        {displayTracking && (
                                                            <>
                                                                <span className="w-1 h-1 bg-indigo-300 rounded-full mx-1"></span>
                                                                <span className="text-xs font-mono">{displayTracking}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <a 
                                                href={finalMapUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full sm:w-32 h-32 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden relative group cursor-pointer shrink-0 flex items-center justify-center transition-all hover:shadow-lg bg-white dark:bg-slate-800"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-800 dark:to-slate-900"></div>
                                                <div className="relative z-10 flex flex-col items-center">
                                                    <span className={`material-icons-round text-3xl ${directMapLink ? 'text-blue-500' : 'text-slate-400'}`}>
                                                        {directMapLink ? 'location_on' : 'map'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase text-center px-1">
                                                        {directMapLink ? 'Direct Link' : 'Search Map'}
                                                    </span>
                                                </div>
                                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="material-icons-round text-white bg-primary rounded-full p-1 shadow-lg">launch</span>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Order Items */}
                        <div className="bg-white dark:bg-[#15202b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <span className="material-icons-round text-primary text-lg">shopping_cart</span>
                                    Order Items
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-3 font-medium" scope="col">Product</th>
                                            <th className="px-6 py-3 font-medium" scope="col">SKU</th>
                                            <th className="px-6 py-3 font-medium text-center" scope="col">Qty</th>
                                            <th className="px-6 py-3 font-medium text-right" scope="col">Unit Price</th>
                                            <th className="px-6 py-3 font-medium text-right" scope="col">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {order.items && order.items.length > 0 ? (
                                            order.items.map((item: any, idx: number) => (
                                                <tr key={idx} className="bg-white dark:bg-[#15202b] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                                                {brokenImageIndices.has(idx) ? (
                                                                    <Package className="w-6 h-6 text-slate-400" />
                                                                ) : (
                                                                    <img 
                                                                        alt={item.name} 
                                                                        className="w-full h-full object-cover" 
                                                                        src={item.image}
                                                                        onError={() => handleImageError(idx)}
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="font-medium text-slate-900 dark:text-white">
                                                                {item.name}
                                                                <div className="text-xs text-slate-500 font-normal">{item.nameKh}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-slate-500">SKU-{item.id}</td>
                                                    <td className="px-6 py-4 text-center font-medium">{item.quantity}</td>
                                                    <td className="px-6 py-4 text-right">${Number(item.price || 0).toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-right font-medium">${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-16 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-3 border border-dashed border-slate-200 dark:border-slate-700">
                                                            <Package className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                                                        </div>
                                                        <p className="text-sm font-khmer font-medium text-slate-600 dark:text-slate-400">មិនមានទិន្នន័យទំនិញទេ</p>
                                                        <p className="text-xs mt-1">No items found in this order.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Upgraded Summary & Notes Section */}
                            <div className="bg-slate-50 dark:bg-slate-800/20 px-6 py-6 border-t border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row justify-between items-start gap-6">
                                
                                {/* Left Side: Order Notes / Remarks */}
                                <div className="w-full lg:w-1/2 max-w-md">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5 font-khmer">
                                        <span className="material-icons-round text-[16px]">edit_note</span>
                                        កំណត់សម្គាល់ (Order Notes)
                                    </h3>
                                    <div className="bg-white dark:bg-[#15202b] p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 min-h-[100px] shadow-sm flex flex-col justify-center">
                                        {order.notes || order.remark ? (
                                            <p className="leading-relaxed font-khmer italic">
                                                "{order.notes || order.remark}"
                                            </p>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center opacity-50">
                                                <span className="material-icons-round text-2xl mb-1">speaker_notes_off</span>
                                                <span className="font-khmer text-xs">មិនមានការផ្តាំផ្ញើទេ</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Calculation Summary */}
                                <div className="w-full lg:max-w-sm bg-white dark:bg-[#15202b] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 shrink-0">
                                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-slate-900 dark:text-white">${Number(order.subtotal || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                        <span>Discount</span>
                                        <span className="font-medium text-green-600">-${Number(order.discount || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                        <span>Tax (VAT)</span>
                                        <span className="font-medium text-slate-900 dark:text-white">${Number(order.tax || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 pb-3 border-b border-dashed border-slate-200 dark:border-slate-700 font-khmer">
                                        <span>ថ្លៃដឹក (Shipping Fee)</span>
                                        <span className="font-medium text-slate-900 dark:text-white">${Number(order.shippingFee || 0).toFixed(2)}</span>
                                    </div>
                                    
                                    {/* --- NEW DEPOSIT DISPLAY --- */}
                                    {displayDeposit > 0 && (
                                        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 pt-2 font-khmer">
                                            <span>ប្រាក់កក់ (Deposit)</span>
                                            <span className="font-medium text-green-600">-${displayDeposit.toFixed(2)}</span>
                                        </div>
                                    )}

                                    {/* --- UPDATED TOTAL DISPLAY --- */}
                                    <div className={`flex justify-between items-center text-base font-bold text-slate-900 dark:text-white ${displayDeposit > 0 ? 'pt-1' : 'pt-3'}`}>
                                        <span>Grand Total</span>
                                        <span className={displayDeposit > 0 ? "text-slate-500 line-through text-lg" : "text-primary text-2xl"}>
                                            ${Number(order.total || 0).toFixed(2)}
                                        </span>
                                    </div>
                                    
                                    {/* --- AMOUNT TO COLLECT (IF COD + DEPOSIT) --- */}
                                    {order.paymentMethod === 'COD' && displayDeposit > 0 && (
                                        <div className="flex justify-between items-center text-lg font-black text-red-600 dark:text-red-500 pt-2 border-t border-red-100 dark:border-red-900/30 mt-2 font-khmer bg-red-50/50 dark:bg-red-900/10 -mx-5 px-5 pb-2 rounded-b-xl">
                                            <span>ត្រូវប្រមូល (To Collect)</span>
                                            <span className="text-2xl">${(Number(order.total || 0) - displayDeposit).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                                
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-4 relative">
                        <div className="sticky top-24 space-y-4">
                            {/* Detailed Shipping Card (Option A) */}
                            {displayCourier && (
                                <div className="bg-white dark:bg-[#15202b] rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col mb-4">
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-800/10">
                                        <h2 className="font-semibold text-indigo-900 dark:text-indigo-100 font-khmer flex items-center gap-2">
                                            <span className="material-icons-round text-indigo-600 dark:text-indigo-400">flight_takeoff</span>
                                            ព័ត៌មានដឹកជញ្ជូន
                                            <span className="text-xs font-display font-normal text-slate-500 ml-auto pt-1">(Shipping Details)</span>
                                        </h2>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex justify-between items-center border-b border-dashed border-slate-200 dark:border-slate-700 pb-3">
                                            <span className="text-sm text-slate-500 font-khmer">ក្រុមហ៊ុន (Courier)</span>
                                            <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ${displayCourier.includes('J&T') ? 'bg-red-500' : displayCourier.includes('Virak') ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                                {displayCourier}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-500 font-khmer">លេខកូដ (Tracking)</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-800/50">
                                                    {displayTracking || 'N/A'}
                                                </span>
                                                {displayTracking && (
                                                    <button onClick={() => {navigator.clipboard.writeText(displayTracking); alert('Copied to clipboard!');}} className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" title="Copy Tracking Number">
                                                        <span className="material-icons-round text-[18px]">content_copy</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="bg-white dark:bg-[#15202b] rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/40 dark:to-slate-800/10">
                                    <h2 className="font-semibold text-slate-800 dark:text-slate-100 font-khmer flex items-center gap-2">
                                        <span className="material-icons-round text-primary">verified_user</span>
                                        ការផ្ទៀងផ្ទាត់ការទូទាត់
                                        <span className="text-xs font-display font-normal text-slate-500 ml-auto pt-1">(Verification)</span>
                                    </h2>
                                </div>
                                <div className="p-5 space-y-5">
                                    {/* Bank Slip Preview */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Bank Slip Evidence</label>
                                        {order.paymentMethod === 'Transfer' ? (
                                            order.bankSlipImage ? (
                                                <div 
                                                    onClick={() => setIsImageModalOpen(true)}
                                                    className="group relative aspect-[3/5] w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-300 dark:border-slate-600 hover:border-primary/50 transition-colors cursor-pointer"
                                                >
                                                    <img src={order.bankSlipImage} alt="Bank Slip" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                        <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-1.5 rounded shadow-lg text-sm font-medium flex items-center gap-2">
                                                            <span className="material-icons-round text-base">zoom_in</span> View Full Size
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="aspect-[3/5] w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <span className="material-icons-round text-4xl text-slate-400 mx-auto">image_not_supported</span>
                                                        <p className="text-sm text-slate-500 mt-2 font-khmer">រូបភាពមិនបានផ្ទុក (No image uploaded)</p>
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            <div className="aspect-[3/5] w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                                                <div className="text-center">
                                                    <span className="material-icons-round text-4xl text-slate-400 mx-auto">payment</span>
                                                    <p className="text-sm text-slate-500 mt-2 font-khmer">ទូទាត់ពេលដឹក (No bank slip required)</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Payment Metadata */}
                                    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-3 space-y-2 border border-slate-100 dark:border-slate-700">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Method</span>
                                            <span className="font-medium flex items-center gap-1">
                                                <span className={`w-2 h-2 rounded-full ${order.paymentMethod === 'COD' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                                                {order.paymentMethod === 'COD' ? 'ទូទាត់ពេលដឹក (COD)' : 'ផ្ទេរលុយ (Transfer)'}
                                            </span>
                                        </div>
                                        {displayTxId && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Transaction ID</span>
                                                <span className="font-mono text-xs bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">{displayTxId}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Date</span>
                                            <span className="font-medium">{new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    {/* Expected Payment Amount Display */}
                                    {(() => {
                                        const expectedPaymentAmount = (order.paymentMethod === 'COD' && displayDeposit > 0) ? displayDeposit : Number(order.total);
                                        return (
                                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800/50">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                                        {order.paymentMethod === 'COD' && displayDeposit > 0 ? 'Expected Deposit Amount' : 'Expected Total Amount'}
                                                    </span>
                                                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                                                        ${expectedPaymentAmount.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Action Buttons */}
                                    {order.paymentStatus === 'Verified' ? (
                                        <div className="pt-2 p-3 rounded-lg flex items-center justify-center gap-2 font-bold font-khmer bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                                            <span className="material-icons-round">check_circle</span>
                                            បានផ្ទៀងផ្ទាត់រួចរាល់ (Verified)
                                        </div>
                                    ) : order.paymentStatus === 'Rejected' ? (
                                        <div className="pt-2 p-3 rounded-lg flex items-center justify-center gap-2 font-bold font-khmer bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                                            <span className="material-icons-round">cancel</span>
                                            ការទូទាត់ត្រូវបានបដិសេធ (Rejected)
                                        </div>
                                    ) : (
                                        <div className="pt-2 grid grid-cols-2 gap-3">
                                            <button 
                                                onClick={() => {
                                                    const confirmReject = window.confirm('តើអ្នកពិតជាចង់បដិសេធវិក្កយបត្រនេះមែនទេ? (Are you sure you want to reject?)');
                                                    if(confirmReject) {
                                                        verifyPayment(order.id, false);
                                                        if (setSelectedOnlineOrder) setSelectedOnlineOrder({ ...order, paymentStatus: 'Rejected' });
                                                        alert('❌ បានបដិសេធការទូទាត់! (Payment Rejected)');
                                                    }
                                                }} 
                                                className="col-span-1 group flex flex-col items-center justify-center gap-1 p-3 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-all"
                                            >
                                                <span className="material-icons-round group-hover:scale-110 transition-transform">highlight_off</span>
                                                <span className="font-khmer text-sm font-medium">បដិសេធ</span>
                                                <span className="text-[10px] uppercase font-bold tracking-wide opacity-70">Reject</span>
                                            </button>
                                            
                                            <button 
                                                onClick={() => {
                                                    verifyPayment(order.id, true);
                                                    if (setSelectedOnlineOrder) setSelectedOnlineOrder({ ...order, paymentStatus: 'Verified' });
                                                    alert('✅ ផ្ទៀងផ្ទាត់ការទូទាត់ជោគជ័យ! (Payment Verified)');
                                                }} 
                                                className="col-span-1 group flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 transition-all transform active:scale-95"
                                            >
                                                <span className="material-icons-round group-hover:scale-110 transition-transform">check_circle</span>
                                                <span className="font-khmer text-sm font-medium">ផ្ទៀងផ្ទាត់ត្រឹមត្រូវ</span>
                                                <span className="text-[10px] uppercase font-bold tracking-wide opacity-80">Approve</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30 flex gap-3">
                                <span className="material-icons-round text-primary text-xl flex-shrink-0">info</span>
                                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                                    {order.paymentMethod === 'COD' && displayDeposit > 0 
                                        ? `Please verify the exact amount matches the Deposit: $${displayDeposit.toFixed(2)}. Check the date on the slip is within 24 hours.` 
                                        : `Please verify the exact amount matches the Grand Total: $${Number(order.total).toFixed(2)}. Check the date on the slip is within 24 hours.`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Optional Fallback Edit Modal (Used only if CreateOrderModal doesn't cover it) */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Edit Customer Details</h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
                            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                            <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Shipping Address</label>
                            <textarea value={editAddress} onChange={(e) => setEditAddress(e.target.value)} rows={4} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none" />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors font-medium">Cancel</button>
                            <button onClick={handleSaveDetails} className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium shadow-sm">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Full-Size Image Lightbox Modal */}
            {isImageModalOpen && order.bankSlipImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div 
                        className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm transition-opacity cursor-pointer"
                        onClick={() => setIsImageModalOpen(false)}
                    ></div>
                    
                    <div className="relative z-10 max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setIsImageModalOpen(false)}
                            className="absolute -top-12 right-0 md:-right-12 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                        
                        <img 
                            src={order.bankSlipImage} 
                            alt="Bank Slip Full Size" 
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10"
                        />
                        
                        <p className="text-white/60 text-sm mt-4 font-khmer">
                            ចុចកន្លែងទំនេរដើម្បីបិទ (Click anywhere to close)
                        </p>
                    </div>
                </div>
            )}


        </div>
    );
};

export default OrderDetail;