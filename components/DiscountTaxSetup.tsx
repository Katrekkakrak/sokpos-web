import React, { useState } from 'react';
import { useData, Discount } from '../context/DataContext';

const DiscountTaxSetup: React.FC = () => {
    const { discounts, addDiscount, deleteDiscount, setCurrentView } = useData();
    const [newDiscount, setNewDiscount] = useState<Partial<Discount>>({
        name: '', type: 'Percentage', value: 0, startDate: '', endDate: ''
    });

    const handleAdd = () => {
        if (newDiscount.name && newDiscount.value) {
            addDiscount(newDiscount);
            setNewDiscount({ name: '', type: 'Percentage', value: 0, startDate: '', endDate: '' });
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col overflow-x-hidden font-display">
            <header className="bg-white dark:bg-[#1a2632] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView('dashboard')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><span className="material-symbols-outlined">arrow_back</span></button>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Discount & Tax Management</h1>
                </div>
            </header>
            <main className="flex-1 w-full max-w-[1280px] mx-auto p-6 lg:p-10 space-y-8">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                    {/* Add Discount Form */}
                    <div className="xl:col-span-1 space-y-8">
                        <section className="bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Add Discount</h3>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                                    <input value={newDiscount.name} onChange={e => setNewDiscount({...newDiscount, name: e.target.value})} className="block w-full rounded-lg border-slate-300 dark:border-slate-600 p-2.5 dark:bg-[#131d26] dark:text-white" type="text"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Value</label>
                                    <input value={newDiscount.value} onChange={e => setNewDiscount({...newDiscount, value: parseFloat(e.target.value)})} className="block w-full rounded-lg border-slate-300 dark:border-slate-600 p-2.5 dark:bg-[#131d26] dark:text-white" type="number"/>
                                </div>
                                <button onClick={handleAdd} className="w-full py-3 px-4 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors">Create Promotion</button>
                            </div>
                        </section>
                    </div>
                    {/* List */}
                    <div className="xl:col-span-2">
                        <section className="bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Active Promotions</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold text-slate-500 dark:text-slate-400">Name</th>
                                            <th className="px-6 py-4 text-left font-semibold text-slate-500 dark:text-slate-400">Type</th>
                                            <th className="px-6 py-4 text-left font-semibold text-slate-500 dark:text-slate-400">Value</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {discounts.map(d => (
                                            <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                                <td className="px-6 py-4 text-slate-900 dark:text-white">{d.name}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{d.type}</td>
                                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{d.type === 'Percentage' ? `${d.value}%` : `$${d.value}`}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => deleteDiscount(d.id)} className="text-red-500 hover:text-red-700"><span className="material-symbols-outlined">delete</span></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DiscountTaxSetup;