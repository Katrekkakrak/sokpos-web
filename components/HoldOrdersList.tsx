import React from 'react';
import { useData } from '../context/DataContext';

const HoldOrdersList: React.FC = () => {
    const { holdOrders, setIsHoldOrdersOpen, resumeOrder, removeHoldOrder } = useData();

    return (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-40 flex justify-end">
            <div className="w-full max-w-[480px] h-full bg-surface-light dark:bg-surface-dark shadow-2xl slide-in flex flex-col border-l border-slate-200 dark:border-slate-700 animate-slide-in-right">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700/50 bg-surface-light dark:bg-surface-dark z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>pause_circle</span>
                            Hold Orders
                        </h2>
                        <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">ការកុម្ម៉ង់រង់ចាំ (Pending Transactions)</span>
                    </div>
                    <button onClick={() => setIsHoldOrdersOpen(false)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {holdOrders.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No orders on hold.</div>
                    ) : (
                        holdOrders.map(order => (
                            <div key={order.id} className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary font-bold text-sm border border-blue-100 dark:border-blue-800">
                                            {order.customerName.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-slate-900 dark:text-white font-bold text-base leading-tight">{order.customerName}</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{order.id}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400">{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4 pl-1">
                                    <div><span className="text-slate-400 text-xs mb-0.5 block">Items</span><span className="text-slate-700 dark:text-slate-200 font-semibold text-sm">{order.items.length} Items</span></div>
                                    <div><span className="text-slate-400 text-xs mb-0.5 block">Total</span><span className="text-primary dark:text-blue-400 font-bold text-sm">${order.total.toFixed(2)}</span></div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => resumeOrder(order.id)} className="flex-1 bg-success hover:bg-success-hover text-white text-sm font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                        <span className="material-symbols-outlined text-lg">play_arrow</span> Resume
                                    </button>
                                    <button onClick={() => removeHoldOrder(order.id)} className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                                        <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HoldOrdersList;