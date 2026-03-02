import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const ReceiptHistory: React.FC = () => {
    const { orders, setCurrentView, autoReceiptTelegram, setAutoReceiptTelegram, shopSettings } = useData();
    const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(orders.length > 0 ? orders[0].id : null);
    const [filter, setFilter] = useState('All');

    const filteredOrders = orders.filter(o => {
        if (filter === 'All') return true;
        return o.status === filter; // Simplistic filter
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const selectedReceipt = orders.find(o => o.id === selectedReceiptId) || orders[0];

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white h-screen overflow-hidden flex flex-col font-display">
            <header className="h-16 flex items-center justify-between px-6 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView('dashboard')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><span className="material-symbols-outlined">arrow_back</span></button>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Receipt History</h2>
                </div>
                
                {/* Auto-Receipt Telegram Toggle */}
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-khmer text-slate-600 dark:text-slate-300 whitespace-nowrap">ផ្ញើវិក្កយបត្រ Auto ទៅ Telegram:</span>
                    <button 
                        onClick={() => setAutoReceiptTelegram(!autoReceiptTelegram)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${autoReceiptTelegram ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoReceiptTelegram ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: List */}
                <div className="w-full lg:w-5/12 xl:w-4/12 flex flex-col bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark">
                    <div className="p-4 border-b border-border-light dark:border-border-dark flex flex-col gap-4">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">search</span>
                            <input className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Search receipt ID..." type="text"/>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="divide-y divide-border-light dark:divide-border-dark">
                            {filteredOrders.map(order => (
                                <div 
                                    key={order.id} 
                                    onClick={() => setSelectedReceiptId(order.id)}
                                    className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-l-4 transition-colors ${selectedReceiptId === order.id ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-transparent'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900 dark:text-white text-sm">{order.id}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${order.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>{order.status}</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">${order.total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">schedule</span> {new Date(order.date).toLocaleString()}</div>
                                        <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">payments</span> {order.method}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Preview */}
                <div className="flex-1 flex flex-col bg-background-light dark:bg-slate-900 relative">
                    <div className="absolute inset-0 receipt-pattern opacity-40 pointer-events-none"></div>
                    {selectedReceipt ? (
                        <div className="flex-1 overflow-y-auto no-scrollbar pb-10 flex justify-center items-start pt-4 relative z-0">
                            <div className="thermal-paper bg-white text-black p-6 w-[380px] font-mono text-sm relative mb-10 shadow-lg">
                                <div className="flex flex-col items-center mb-6 text-center">
                                    {shopSettings?.logo ? (
                                        <img src={shopSettings.logo} alt="Shop Logo" className="w-16 h-16 object-contain mb-3 grayscale mx-auto" />
                                    ) : (
                                        <div className="w-12 h-12 mb-3 bg-slate-900 rounded-full flex items-center justify-center text-white"><span className="material-symbols-outlined">storefront</span></div>
                                    )}
                                    <h2 className="text-xl font-bold uppercase tracking-tight mb-1">{shopSettings?.name || 'QuickBill Mart'}</h2>
                                    <p className="text-xs text-slate-500">{shopSettings?.address || 'Phnom Penh, Cambodia'}</p>
                                </div>
                                <div className="border-b-2 border-dashed border-slate-300 pb-3 mb-3 text-xs">
                                    <div className="flex justify-between mb-1"><span className="text-slate-500">Receipt No:</span><span className="font-bold">{selectedReceipt.id}</span></div>
                                    <div className="flex justify-between mb-1"><span className="text-slate-500">Date:</span><span>{new Date(selectedReceipt.date).toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Status:</span><span>{selectedReceipt.status}</span></div>
                                </div>
                                <div className="flex flex-col gap-3 mb-4 text-xs">
                                    <div className="flex justify-between font-bold border-b border-slate-200 pb-1 text-slate-400 uppercase text-[10px]">
                                        <span className="w-8">Qty</span><span className="flex-1">Item</span><span className="w-16 text-right">Price</span>
                                    </div>
                                    {selectedReceipt.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start">
                                            <span className="w-8 pt-0.5">{item.quantity}</span>
                                            <div className="flex-1 flex flex-col"><span className="font-bold">{item.name}</span></div>
                                            <span className="w-16 text-right font-medium">${item.price.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t-2 border-dashed border-slate-300 pt-3 text-xs mb-6">
                                    <div className="flex justify-between mt-3 pt-2 border-t border-slate-200 text-lg font-bold"><span>Total</span><span>${selectedReceipt.total.toFixed(2)}</span></div>
                                </div>
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <p className="text-[10px] text-slate-400 uppercase">Thank you!</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">Select a receipt to view</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReceiptHistory;