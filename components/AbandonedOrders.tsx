import React from 'react';
import { useData } from '../context/DataContext';

const AbandonedOrders: React.FC = () => {
    const { onlineOrders, setCurrentView } = useData();

    // Filter logic: Draft or explicitly marked Abandoned. 
    // Since our mock might not have many, we can also show 'New' orders older than X time as a simulation, 
    // but we added a 'Draft' status in context update.
    const abandoned = onlineOrders.filter(o => o.status === 'Draft');

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col antialiased">
            <header className="w-full bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView('dashboard')} className="size-9 bg-primary/10 rounded-lg text-primary flex items-center justify-center"><span className="material-symbols-outlined">arrow_back</span></button>
                    <div><h1 className="text-lg font-bold">SokBiz KH</h1><p className="text-xs text-slate-500">Abandoned Recovery</p></div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1 font-khmer">ការបញ្ជាទិញដែលបោះបង់ចោល</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-base">Abandoned Order Recovery & Management</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase font-khmer">អតិថិជន (Customer)</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase font-khmer">ទំនិញ (Items)</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase font-khmer">សរុប (Total)</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase font-khmer">សកម្មភាពចុងក្រោយ (Active)</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase font-khmer">សកម្មភាព (Actions)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-surface-dark">
                                {abandoned.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">No abandoned orders found.</td></tr>
                                ) : (
                                    abandoned.map(order => (
                                        <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-500">{order.customer.avatar.substring(0,2)}</div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{order.customer.name}</div>
                                                        <div className="text-xs text-slate-500">{order.customer.phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm text-slate-900 dark:text-white font-medium">{order.items[0]?.name} {order.items.length > 1 ? `+${order.items.length - 1} more` : ''}</span>
                                                    <span className="text-xs text-slate-500">{order.items.length} Items in cart</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">${order.total.toFixed(2)}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                                                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                                                    <span>{order.elapsedTime}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20">
                                                    <span className="material-symbols-outlined text-[18px]">chat</span>
                                                    <span>Remind</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AbandonedOrders;