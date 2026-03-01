import React, { useState } from 'react';
import { useData, Order, CartItem } from '../context/DataContext';

const RefundReturn: React.FC = () => {
    const { orders, processRefund, setCurrentView } = useData();
    const [searchTerm, setSearchTerm] = useState('INV-2023-0892');
    const [foundOrder, setFoundOrder] = useState<Order | null>(null);
    const [returnItems, setReturnItems] = useState<{ [id: number]: number }>({}); // itemId -> qty

    // Initial load for demo
    React.useEffect(() => {
        handleSearch();
    }, []);

    const handleSearch = () => {
        const order = orders.find(o => o.id.toLowerCase().includes(searchTerm.toLowerCase()));
        if (order) {
            setFoundOrder(order);
            // Reset selections
            setReturnItems({});
        } else {
            setFoundOrder(null);
        }
    };

    const toggleItem = (item: CartItem) => {
        setReturnItems(prev => {
            const next = { ...prev };
            if (next[item.id]) {
                delete next[item.id];
            } else {
                next[item.id] = 1;
            }
            return next;
        });
    };

    const updateReturnQty = (itemId: number, delta: number, max: number) => {
        setReturnItems(prev => {
            const current = prev[itemId] || 0;
            const nextVal = Math.min(Math.max(0, current + delta), max);
            if (nextVal === 0) {
                const next = { ...prev };
                delete next[itemId];
                return next;
            }
            return { ...prev, [itemId]: nextVal };
        });
    };

    // Calculate totals
    let totalRefund = 0;
    if (foundOrder) {
        foundOrder.items.forEach(item => {
            const qty = returnItems[item.id] || 0;
            totalRefund += qty * item.price;
        });
    }

    const handleSubmitRefund = () => {
        if (foundOrder && totalRefund > 0) {
            const itemsToRefund = Object.entries(returnItems).map(([id, qty]) => ({ id: parseInt(id), qty }));
            processRefund(foundOrder.id, itemsToRefund, totalRefund);
            alert(`Refund of $${totalRefund.toFixed(2)} processed successfully.`);
            setFoundOrder(null);
            setSearchTerm('');
            setReturnItems({});
        }
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark font-display">
            {/* Top Navigation */}
            <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark px-6 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView('dashboard')} className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20">
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">QuickBill KH</h1>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Refund & Return</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 overflow-y-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Refund & Return (សងប្រាក់ & ត្រឡប់ទំនិញ)</h2>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">Process customer returns and refunds efficiently.</p>
                    </div>
                </div>

                {/* Search */}
                <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="receipt-search">
                                Receipt ID (លេខវិក្កយបត្រ)
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 material-symbols-outlined">search</span>
                                <input 
                                    className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 pl-10 pr-12 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-primary sm:text-sm shadow-sm transition-all" 
                                    id="receipt-search" 
                                    placeholder="Scan or enter Receipt ID" 
                                    type="text" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                        </div>
                        <button onClick={handleSearch} className="h-[46px] px-6 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                            <span>Search</span>
                        </button>
                    </div>

                    {foundOrder && (
                        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"><span className="material-symbols-outlined">calendar_today</span></div>
                                <div><p className="text-xs text-slate-500 uppercase font-semibold">Date</p><p className="text-sm font-medium text-slate-900 dark:text-white">{new Date(foundOrder.date).toLocaleString()}</p></div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg"><span className="material-symbols-outlined">person</span></div>
                                <div><p className="text-xs text-slate-500 uppercase font-semibold">Customer</p><p className="text-sm font-medium text-slate-900 dark:text-white">{foundOrder.customer?.name || 'Walk-in'}</p></div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg"><span className="material-symbols-outlined">payments</span></div>
                                <div><p className="text-xs text-slate-500 uppercase font-semibold">Original Total</p><p className="text-sm font-medium text-slate-900 dark:text-white">${foundOrder.total.toFixed(2)}</p></div>
                            </div>
                        </div>
                    )}
                </section>

                {foundOrder && (
                    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
                        {/* Left: Items List */}
                        <section className="flex-1 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Purchased Items</h3>
                                <span className="text-xs font-medium text-slate-500 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded">{foundOrder.items.length} Items Found</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
                                        <tr>
                                            <th className="px-6 py-3 w-12 text-center">Select</th>
                                            <th className="px-6 py-3">Item Details</th>
                                            <th className="px-6 py-3 text-center">Qty Bought</th>
                                            <th className="px-6 py-3 text-center">Return Qty</th>
                                            <th className="px-6 py-3 text-right">Unit Price</th>
                                            <th className="px-6 py-3 text-right">Refund Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                                        {foundOrder.items.map(item => {
                                            const returnQty = returnItems[item.id] || 0;
                                            const isSelected = returnQty > 0;
                                            return (
                                                <tr key={item.id} className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isSelected ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                                                    <td className="px-6 py-4 text-center">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isSelected}
                                                            onChange={() => toggleItem(item)}
                                                            className="rounded border-slate-300 text-primary focus:ring-primary h-5 w-5 cursor-pointer" 
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden">
                                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                                                                <p className="text-xs text-slate-500">{item.sku}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">{item.quantity}</td>
                                                    <td className="px-6 py-4">
                                                        <div className={`flex items-center justify-center gap-2 ${!isSelected ? 'opacity-50 pointer-events-none' : ''}`}>
                                                            <button onClick={() => updateReturnQty(item.id, -1, item.quantity)} className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><span className="material-symbols-outlined text-sm">remove</span></button>
                                                            <span className="w-8 text-center font-semibold text-slate-900 dark:text-white">{returnQty}</span>
                                                            <button onClick={() => updateReturnQty(item.id, 1, item.quantity)} className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-primary bg-primary/10 hover:bg-primary/20 transition-colors"><span className="material-symbols-outlined text-sm">add</span></button>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">${item.price.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-white">${(returnQty * item.price).toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Right: Action Panel */}
                        <section className="lg:w-96 flex flex-col gap-6">
                            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Return Options</h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Reason</label>
                                        <div className="relative">
                                            <select className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-primary sm:text-sm py-2.5">
                                                <option>Customer Changed Mind (អតិថិជនផ្លាស់ប្តូរចិត្ត)</option>
                                                <option>Damaged Item (ទំនិញខូច)</option>
                                                <option>Wrong Item Sent (ផ្ញើទំនិញខុស)</option>
                                                <option>Expired (ផុតកំណត់)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                        <div><p className="text-sm font-medium text-slate-900 dark:text-white">Return to Stock</p><p className="text-xs text-slate-500">បញ្ចូលស្តុកវិញ</p></div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input defaultChecked className="sr-only peer" type="checkbox"/>
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-4 mt-auto">
                                <div className="space-y-3 pb-4 border-b border-slate-200 dark:border-slate-700">
                                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400"><span>Subtotal</span><span>${totalRefund.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400"><span>Tax Refund</span><span>$0.00</span></div>
                                    <div className="flex justify-between items-center pt-2"><span className="text-base font-bold text-slate-900 dark:text-white">Total Refund</span><span className="text-2xl font-bold text-danger">${totalRefund.toFixed(2)}</span></div>
                                </div>
                                <button onClick={handleSubmitRefund} disabled={totalRefund === 0} className="w-full bg-danger hover:bg-danger-hover text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-danger/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
                                    <span className="material-symbols-outlined group-hover:animate-pulse">payments</span>
                                    <span>Refund Payment (សងប្រាក់វិញ)</span>
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
};

export default RefundReturn;