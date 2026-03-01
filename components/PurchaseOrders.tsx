import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const PurchaseOrders: React.FC = () => {
    const { purchaseOrders, setCurrentView } = useData();
    const [filterStatus, setFilterStatus] = useState('All');
    const [search, setSearch] = useState('');

    const filteredPOs = purchaseOrders.filter(po => {
        const matchesStatus = filterStatus === 'All' || po.status === filterStatus;
        const matchesSearch = po.id.toLowerCase().includes(search.toLowerCase()) || po.supplierName.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-200 antialiased min-h-screen flex flex-col">
            <header className="flex items-center justify-between whitespace-nowrap py-3 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView('dashboard')} className="hover:text-primary"><span className="material-symbols-outlined">arrow_back</span></button>
                    <h1 className="text-lg font-bold">Purchase Orders</h1>
                </div>
                <div className="flex gap-4">
                    <button className="text-slate-500 hover:text-slate-700"><span className="material-symbols-outlined">notifications</span></button>
                </div>
            </header>

            <main className="flex-1 px-4 md:px-10 lg:px-40 py-8 flex justify-center">
                <div className="w-full max-w-[1200px] flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap justify-between items-end gap-4">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-slate-900 dark:text-white text-3xl font-bold font-khmer">បញ្ជីការកុម្ម៉ង់ទិញ (Purchase Orders)</h1>
                                <p className="text-slate-500 dark:text-slate-400">Manage your stock procurement and supplier orders efficiently.</p>
                            </div>
                            <button onClick={() => setCurrentView('create-po')} className="flex items-center justify-center gap-2 h-11 px-6 bg-primary hover:bg-blue-600 text-white rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95 group">
                                <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add</span>
                                <span className="font-bold font-khmer text-sm md:text-base">បង្កើតការកុម្ម៉ង់ទិញ (Create PO)</span>
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="border-b border-slate-200 dark:border-slate-700">
                            <div className="flex px-6 overflow-x-auto no-scrollbar">
                                {['All', 'Pending', 'Received', 'Cancelled'].map(status => (
                                    <button 
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`relative flex items-center gap-2 py-4 px-2 mr-6 font-bold text-sm whitespace-nowrap font-khmer border-b-[3px] transition-colors
                                            ${filterStatus === status 
                                                ? 'text-primary border-primary' 
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border-transparent hover:border-slate-300'
                                            }`}
                                    >
                                        <span>{status === 'All' ? 'ទាំងអស់ (All)' : status}</span>
                                        {status === 'All' && <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{purchaseOrders.length}</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                            <div className="relative flex-1 md:max-w-xs group w-full">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">search</span>
                                </span>
                                <input 
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-khmer" 
                                    placeholder="ស្វែងរកតាមលេខ PO ឬ អ្នកផ្គត់ផ្គង់..." 
                                    type="text"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-y border-slate-200 dark:border-slate-700">
                                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-khmer w-[140px]">លេខ PO (PO #)</th>
                                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-khmer">អ្នកផ្គត់ផ្គង់ (Supplier)</th>
                                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-khmer">កាលបរិច្ឆេទ (Date)</th>
                                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-khmer text-right">សរុបប្រាក់ (Total)</th>
                                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-khmer text-center">ស្ថានភាព (Status)</th>
                                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right w-[100px]"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {filteredPOs.map(po => (
                                        <tr key={po.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="py-4 px-6 whitespace-nowrap"><a className="text-primary hover:underline font-bold text-sm" href="#">{po.id}</a></td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">{po.supplierName.substring(0, 2).toUpperCase()}</div>
                                                    <div><p className="text-sm font-medium text-slate-900 dark:text-white">{po.supplierName}</p></div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{new Date(po.date).toLocaleDateString()}</td>
                                            <td className="py-4 px-6 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-white text-right">${po.totalAmount.toLocaleString()}</td>
                                            <td className="py-4 px-6 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-khmer border
                                                    ${po.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                                                      po.status === 'Received' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                                                      'bg-rose-100 text-rose-700 border-rose-200'}
                                                `}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${po.status === 'Pending' ? 'bg-amber-500' : po.status === 'Received' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                    {po.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap text-right">
                                                <button className="text-slate-400 hover:text-primary transition-colors p-1"><span className="material-symbols-outlined text-[20px]">more_vert</span></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PurchaseOrders;