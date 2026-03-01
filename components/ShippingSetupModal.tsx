import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const ShippingSetupModal: React.FC = () => {
    // 1. បន្ថែម setSelectedOnlineOrder ដើម្បីបង្ខំឱ្យ UI Update ភ្លាមៗ
    const { setIsShippingSetupModalOpen, selectedOnlineOrder, setSelectedOnlineOrder, setOrderShipping } = useData();
    const [courier, setCourier] = useState(selectedOnlineOrder?.shippingCourier || 'J&T Express');
    const [tracking, setTracking] = useState(selectedOnlineOrder?.trackingNumber || '');
    const [fee, setFee] = useState(selectedOnlineOrder?.shippingFee?.toString() || '1.00');

    if (!selectedOnlineOrder) return null;

    const handleSubmit = () => {
        // ១. បញ្ជូនទិន្នន័យទៅឃ្លាំងធំ (Context)
        setOrderShipping(selectedOnlineOrder.id, {
            courier,
            trackingNumber: tracking,
            fee: parseFloat(fee || '0')
        });

        // ២. បង្ខំឱ្យ UI ផ្លាស់ប្តូរភ្លាមៗ (ដូរ Status ទៅជា Shipping និងទាញទិន្នន័យមកបង្ហាញ)
        if (setSelectedOnlineOrder) {
            setSelectedOnlineOrder({
                ...selectedOnlineOrder,
                shippingCourier: courier,
                trackingNumber: tracking,
                shippingFee: parseFloat(fee || '0'),
                status: 'Shipping' // Auto-move ទៅជួរ "កំពុងដឹក"
            });
        }

        // ៣. បិទផ្ទាំង Modal នេះ
        setIsShippingSetupModalOpen(false);
        
        // លោត Alert ប្រាប់ថាជោគជ័យ
        // alert('✅ រៀបចំការដឹកជញ្ជូនរួចរាល់!');
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity z-50 flex items-center justify-center p-4">
            <div className="relative z-50 w-full max-w-lg bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-700">
                {/* Header Section */}
                <header className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 bg-white dark:bg-surface-dark">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-icons-round text-primary text-2xl">local_shipping</span>
                            Shipping Setup
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-khmer">ការកំណត់ការដឹកជញ្ជូន</p>
                    </div>
                    <button onClick={() => setIsShippingSetupModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <span className="material-icons-round text-2xl">close</span>
                    </button>
                </header>

                {/* Order Context Banner */}
                <div className="bg-primary/5 px-6 py-3 border-b border-primary/10 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border border-primary/10">
                        <span className="material-icons-round text-lg">receipt</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Order Context</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{selectedOnlineOrder.id} • <span className="text-slate-500 font-normal">{selectedOnlineOrder.customer?.name}</span></span>
                    </div>
                    <div className="ml-auto">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                            {selectedOnlineOrder.status}
                        </span>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-6 bg-white dark:bg-[#15202b]">
                    {/* Courier Selection (Fixed Dropdown) */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Select Courier <span className="text-slate-400 font-khmer font-normal mx-1">|</span> <span className="font-khmer text-slate-500 dark:text-slate-400">ជ្រើសរើសក្រុមហ៊ុនដឹកជញ្ជូន</span>
                        </label>
                        <div className="relative group">
                            <select 
                                value={courier} 
                                onChange={(e) => setCourier(e.target.value)} 
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg py-3 px-4 shadow-sm transition-all focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none font-medium"
                            >
                                <option value="J&T Express">J&T Express</option>
                                <option value="Virak Buntham">វីរៈប៊ុនថាំ (VET Express)</option>
                                <option value="Capitol Tour">កាពីតូល (Capitol Tour)</option>
                                <option value="VET Logistics">VET Logistics</option>
                                <option value="Grab Express">Grab Express</option>
                                <option value="In-house Rider">ដឹកផ្ទាល់ខ្លួន (In-house Rider)</option>
                            </select>
                            <span className="material-icons-round text-slate-400 absolute right-3 top-3.5 pointer-events-none">expand_more</span>
                        </div>
                    </div>

                    {/* Two Column Grid for Tracking & Fee */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Tracking Number */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Tracking Number <span className="text-slate-400 font-khmer font-normal mx-1">|</span> <span className="font-khmer text-slate-500 dark:text-slate-400">លេខ Tracking</span>
                            </label>
                            <div className="relative rounded-lg shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                                    <span className="material-icons-round text-slate-400 text-lg">qr_code_scanner</span>
                                </div>
                                <input 
                                    className="block w-full rounded-lg border-slate-200 dark:border-slate-600 pl-10 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-colors sm:text-sm font-mono" 
                                    placeholder="ឧ. JNT-8829102" 
                                    type="text"
                                    value={tracking}
                                    onChange={(e) => setTracking(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Shipping Fee */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Shipping Fee <span className="text-slate-400 font-khmer font-normal mx-1">|</span> <span className="font-khmer text-slate-500 dark:text-slate-400">តម្លៃដឹកជញ្ជូន</span>
                            </label>
                            <div className="relative rounded-lg shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                                    <span className="text-slate-500 sm:text-sm font-bold">$</span>
                                </div>
                                <input 
                                    className="block w-full rounded-lg border-slate-200 dark:border-slate-600 pl-8 pr-12 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-colors sm:text-sm text-right font-medium" 
                                    placeholder="0.00" 
                                    type="number"
                                    value={fee}
                                    onChange={(e) => setFee(e.target.value)}
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <span className="text-slate-400 sm:text-xs font-bold">USD</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Courier Chips */}
                    <div className="pt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Suggested Couriers</span>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setCourier('J&T Express')} className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm">
                                <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div> J&T
                            </button>
                            <button onClick={() => setCourier('Virak Buntham')} className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div> Virak Buntham
                            </button>
                            <button onClick={() => setCourier('Grab Express')} className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm">
                                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div> Grab Express
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-end gap-3">
                    <button onClick={() => setIsShippingSetupModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all focus:outline-none" type="button">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="group relative px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium shadow-md shadow-primary/20 transition-all focus:outline-none overflow-hidden" type="button">
                        <span className="relative z-10 flex items-center gap-2">
                            <span className="material-icons-round text-[18px]">check_circle</span>
                            Confirm Shipping
                            <span className="font-khmer font-normal opacity-90 border-l border-white/20 pl-2 ml-1 text-xs py-0.5">បញ្ជាក់ការដឹក</span>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShippingSetupModal;