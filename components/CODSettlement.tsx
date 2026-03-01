import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const CODSettlement: React.FC = () => {
    const { onlineOrders, couriers, settleCOD, setCurrentView } = useData();
    const [selectedCourier, setSelectedCourier] = useState('');
    const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

    // Filter logic: Only Orders with COD and Not yet Settled
    const filteredOrders = onlineOrders.filter(o => {
        const isCOD = o.paymentStatus === 'COD' || o.paymentStatus === 'Pending'; // Assuming Pending implies unpaid COD in this view context or 'COD' status specifically
        // Correcting based on type: paymentStatus 'COD' means it's a COD order type, typically 'Pending' verification or 'Settled'. 
        // Let's assume we want orders where paymentStatus is 'COD' (meaning unpaid/unsettled) or 'Pending'.
        // For simplicity in this demo, let's look for 'COD' payment status.
        const isUnsettled = o.paymentStatus !== 'Settled';
        const matchesCourier = selectedCourier ? o.shippingDetails?.courier === selectedCourier : true;
        return isCOD && isUnsettled && matchesCourier;
    });

    const totalPendingAmount = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const selectedTotal = filteredOrders
        .filter(o => selectedOrderIds.has(o.id))
        .reduce((sum, o) => sum + o.total, 0);

    const toggleSelectAll = () => {
        if (selectedOrderIds.size === filteredOrders.length) {
            setSelectedOrderIds(new Set());
        } else {
            setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
        }
    };

    const toggleSelectOne = (id: string) => {
        const newSet = new Set(selectedOrderIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedOrderIds(newSet);
    };

    const handleSettle = () => {
        settleCOD(Array.from(selectedOrderIds));
        setSelectedOrderIds(new Set());
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white h-screen flex flex-col antialiased overflow-hidden">
            {/* Header */}
            <header className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark px-6 py-4 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <button onClick={() => setCurrentView('dashboard')} className="hover:text-primary">Dashboard</button>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    <span className="font-medium text-slate-900 dark:text-white">COD Reconciliation</span>
                </div>
                <div className="flex justify-between items-end flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 font-khmer">ការទូទាត់ COD (COD Settlement)</h1>
                        <p className="text-slate-500 text-sm">Reconcile cash on delivery payments from couriers.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-sm min-w-[280px]">
                        <div className="bg-amber-50 dark:bg-amber-900/30 p-2.5 rounded-lg text-amber-600 dark:text-amber-400">
                            <span className="material-symbols-outlined">pending_actions</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">Pending Settlement</span>
                            <span className="text-xl font-bold text-slate-900 dark:text-white font-display tabular-nums">${totalPendingAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <div className="flex-shrink-0 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-grow max-w-md min-w-[200px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">search</span>
                        <input className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm" placeholder="Search Order ID or Tracking..." />
                    </div>
                    <div className="relative min-w-[160px]">
                        <select 
                            value={selectedCourier} 
                            onChange={(e) => setSelectedCourier(e.target.value)}
                            className="w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm appearance-none cursor-pointer"
                        >
                            <option value="">All Couriers</option>
                            {couriers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px] pointer-events-none">expand_more</span>
                    </div>
                    <div className="ml-auto flex gap-2">
                        <button className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium rounded hover:bg-slate-200">Pending</button>
                        <button className="px-3 py-1 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium rounded">Settled</button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto custom-scrollbar bg-white dark:bg-surface-dark relative">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="py-3 px-4 w-12 border-b border-slate-200 dark:border-slate-700">
                                <input 
                                    type="checkbox" 
                                    checked={selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 cursor-pointer" 
                                />
                            </th>
                            <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Order ID</th>
                            <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Tracking No.</th>
                            <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Customer</th>
                            <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Courier</th>
                            <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 text-right">COD Amount</th>
                            <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                        {filteredOrders.map(order => (
                            <tr key={order.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedOrderIds.has(order.id) ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                                <td className="py-3 px-4">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedOrderIds.has(order.id)}
                                        onChange={() => toggleSelectOne(order.id)}
                                        className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 cursor-pointer" 
                                    />
                                </td>
                                <td className="py-3 px-4 font-medium text-primary cursor-pointer hover:underline">{order.id}</td>
                                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{order.shippingDetails?.trackingNumber || 'N/A'}</td>
                                <td className="py-3 px-4 text-slate-900 dark:text-white">
                                    <div className="flex flex-col">
                                        <span>{order.customer.name}</span>
                                        <span className="text-xs text-slate-400">{order.customer.phone}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs">
                                        <span className={`w-1.5 h-1.5 rounded-full ${order.shippingDetails?.courier.includes('J&T') ? 'bg-red-500' : 'bg-blue-500'}`}></span> 
                                        {order.shippingDetails?.courier}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-slate-900 dark:text-white font-medium text-right tabular-nums">${order.total.toFixed(2)}</td>
                                <td className="py-3 px-4 text-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">Pending</span>
                                </td>
                            </tr>
                        ))}
                        {filteredOrders.length === 0 && (
                            <tr><td colSpan={7} className="text-center py-10 text-slate-500">No pending COD orders found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Floating Action Bar */}
            {selectedOrderIds.size > 0 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 shadow-lg animate-fade-in-up">
                    <div className="flex items-center gap-4 bg-slate-900 text-white pl-4 pr-1.5 py-1.5 rounded-full border border-slate-700 shadow-2xl">
                        <div className="flex items-center gap-2 pr-4 border-r border-slate-700">
                            <span className="bg-primary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">{selectedOrderIds.size}</span>
                            <span className="text-sm font-medium">Selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-xs">Total: <span className="text-white font-medium">${selectedTotal.toFixed(2)}</span></span>
                            <button onClick={handleSettle} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-full text-sm font-medium transition-colors ml-2 shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                <span className="font-khmer">Mark as Settled (សម្គាល់ថាទូទាត់រួច)</span>
                            </button>
                            <button onClick={() => setSelectedOrderIds(new Set())} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CODSettlement;