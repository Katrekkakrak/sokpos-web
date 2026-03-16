import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const ReceiptHistory: React.FC = () => {
    const { orders, setCurrentView, autoReceiptTelegram, setAutoReceiptTelegram, shopSettings, hasAccessToFeature, userPlan } = useData();
    const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(orders.length > 0 ? orders[0].id : null);
    const [filter, setFilter] = useState('All');
    
    // 💡 State ថ្មីសម្រាប់ត្រួតពិនិត្យការបើកមើលវិក្កយបត្រពេញអេក្រង់លើទូរស័ព្ទ
    const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

    const canAccess = hasAccessToFeature('reports');

    const filteredOrders = orders.filter(o => {
        if (filter === 'All') return true;
        return o.status === filter;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const selectedReceipt = orders.find(o => o.id === selectedReceiptId) || orders[0];

    return (
        // ប្រើ 100dvh ដើម្បីកុំឲ្យ Safari លាក់ប៊ូតុងខាងក្រោម
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white h-[100dvh] overflow-hidden flex flex-col font-display">
            
            {/* ══ MAIN HEADER (លាក់ពេលកំពុងបើកមើលវិក្កយបត្រលើទូរស័ព្ទ) ══ */}
            <header className={`min-h-[64px] flex-wrap items-center justify-between px-4 sm:px-6 py-2 sm:py-0 gap-2 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark shrink-0 ${isMobilePreviewOpen ? 'hidden lg:flex' : 'flex'}`}>
                <div className="flex items-center gap-2 sm:gap-4">
                    <button onClick={() => setCurrentView('dashboard')} className="p-1 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><span className="material-icons-outlined">arrow_back</span></button>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">Receipt History</h2>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-xs sm:text-sm font-khmer text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        <span className="hidden sm:inline">ផ្ញើវិក្កយបត្រ Auto ទៅ Telegram:</span>
                        <span className="sm:hidden font-bold">Auto TG:</span>
                    </span>
                    <button 
                        onClick={() => setAutoReceiptTelegram(!autoReceiptTelegram)}
                        className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none ${autoReceiptTelegram ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                        <span className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${autoReceiptTelegram ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </header>

            <div className="relative flex-1 overflow-hidden">
                <div className={`flex flex-col lg:flex-row flex-1 overflow-hidden h-full ${!canAccess ? 'filter blur-md pointer-events-none select-none opacity-60' : ''}`}>
                
                {/* ══ ផ្ទាំងខាងឆ្វេង: បញ្ជីវិក្កយបត្រ (លាក់លើ Mobile ពេលបើក Preview) ══ */}
                <div className={`w-full lg:w-5/12 xl:w-4/12 shrink-0 flex-col bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark h-full ${isMobilePreviewOpen ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-border-light dark:border-border-dark flex flex-col gap-4 shrink-0">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-icons-outlined text-[20px]">search</span>
                            <input className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/50 text-sm outline-none" placeholder="Search receipt ID..." type="text"/>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="divide-y divide-border-light dark:divide-border-dark">
                            {filteredOrders.map(order => (
                                <div 
                                    key={order.id} 
                                    // 💡 ពេលចុចលើវិក្កយបត្រ វានឹងបើកផ្ទាំង Preview ឲ្យពេញអេក្រង់
                                    onClick={() => { setSelectedReceiptId(order.id); setIsMobilePreviewOpen(true); }}
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

                {/* ══ ផ្ទាំងខាងស្តាំ: រូបរាងវិក្កយបត្រ (លាក់លើ Mobile បើមិនទាន់ចុចមើល) ══ */}
                <div className={`flex-1 flex-col bg-background-light dark:bg-slate-900 relative h-full ${isMobilePreviewOpen ? 'flex' : 'hidden lg:flex'}`}>
                    
                    {/* 💡 Mobile Preview Header សម្រាប់ចុចថយក្រោយ */}
                    <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1a2634] border-b border-slate-200 dark:border-slate-800 shadow-sm shrink-0 z-10">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsMobilePreviewOpen(false)} className="p-2 -ml-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <span className="material-icons-outlined">arrow_back</span>
                            </button>
                            <h2 className="font-bold text-base text-slate-900 dark:text-white font-khmer">វិក្កយបត្រលម្អិត</h2>
                        </div>
                        <button className="w-8 h-8 flex items-center justify-center text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors">
                            <span className="material-icons-outlined text-[18px]">print</span>
                        </button>
                    </div>

                    <div className="absolute inset-0 receipt-pattern opacity-40 pointer-events-none z-0"></div>
                    
                    {selectedReceipt ? (
                        <div className="flex-1 overflow-y-auto no-scrollbar pb-10 flex justify-center items-start pt-6 relative z-10">
                            <div className="thermal-paper bg-white text-black p-6 w-[350px] sm:w-[380px] font-mono text-sm relative mb-10 shadow-xl border border-slate-200 mx-4">
                                <div className="flex flex-col items-center mb-6 text-center">
                                    {shopSettings?.logo ? (
                                        <img src={shopSettings.logo} alt="Shop Logo" className="w-16 h-16 object-contain mb-3 grayscale mx-auto" />
                                    ) : (
                                        <img src="/logo.png" alt="SokBiz Logo" className="w-16 h-16 object-contain mb-3 grayscale mx-auto drop-shadow-sm" />
                                    )}
                                    <h2 className="text-xl font-bold uppercase tracking-tight mb-1">{shopSettings?.name || 'SokBiz Mart'}</h2>
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
                        <div className="flex items-center justify-center h-full text-slate-400 z-10">Select a receipt to view</div>
                    )}
                </div>
            </div>

                {/* ══ Lock Screen (No changes needed here) ══ */}
                {!canAccess && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/10 dark:bg-slate-900/40 backdrop-blur-md">
                        <div className="bg-white/95 dark:bg-slate-800/95 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-slate-200 dark:border-slate-700 animate-in zoom-in duration-300 mx-4">
                            <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <span className="material-icons-outlined text-5xl">lock</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 font-khmer">មុខងារត្រូវបានចាក់សោរ</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-khmer leading-relaxed">
                                🔒 របាយការណ៍ស៊ីជម្រៅ គឺសម្រាប់តែអតិថិជនកញ្ចប់ Standard និង Pro ប៉ុណ្ណោះ។
                            </p>
                            <button 
                                onClick={() => setCurrentView('pricing')}
                                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 font-khmer text-base"
                            >
                                <span className="material-icons-outlined">diamond</span>
                                ដំឡើងកញ្ចប់ (Upgrade)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReceiptHistory;