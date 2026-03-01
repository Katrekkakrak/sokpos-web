import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const ShippingRates: React.FC = () => {
    const { shippingRates, updateShippingRate, setCurrentView } = useData();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempRate, setTempRate] = useState<number>(0);

    const startEdit = (id: string, rate: number) => {
        setEditingId(id);
        setTempRate(rate);
    };

    const saveEdit = (id: string) => {
        updateShippingRate(id, { rate: tempRate });
        setEditingId(null);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white">
            <aside className="flex w-72 flex-col justify-between border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 hidden lg:flex flex-shrink-0 z-20">
                 {/* Sidebar Mock reused for layout consistency or simple back link */}
                 <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-primary mb-4"><span className="material-symbols-outlined">arrow_back</span> Back to Dashboard</button>
                 <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                    <h3 className="font-bold mb-2">Instructions</h3>
                    <p>Configure base shipping rates for each province. These rates will be applied at checkout.</p>
                 </div>
            </aside>

            <main className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 pb-24">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                             <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white font-khmer">ការកំណត់តម្លៃដឹកជញ្ជូនតាមតំបន់</h2>
                             <p className="text-slate-500 dark:text-slate-400 font-khmer text-base">កំណត់តម្លៃនិងរយៈពេលដឹកជញ្ជូនសម្រាប់ ២៥ ខេត្ត-ក្រុង</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                                            <th className="px-6 py-4 min-w-[200px] font-khmer">រាជធានី/ខេត្ត (Province)</th>
                                            <th className="px-6 py-4 w-[200px] font-khmer">តម្លៃដឹកជញ្ជូន ($)</th>
                                            <th className="px-6 py-4 w-[240px] font-khmer">រយៈពេលដឹកជញ្ជូន (Days)</th>
                                            <th className="px-6 py-4 w-[160px] font-khmer text-center">ស្ថានភាព (Status)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {shippingRates.map(rate => (
                                            <tr key={rate.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg p-2 flex items-center justify-center"><span className="material-symbols-outlined text-[20px]">location_city</span></div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-slate-900 dark:text-white text-sm">{rate.province}</span>
                                                            <span className="text-xs text-slate-500 font-khmer">{rate.provinceKh}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingId === rate.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <input autoFocus type="number" className="w-20 px-2 py-1 border rounded" value={tempRate} onChange={e => setTempRate(parseFloat(e.target.value))} />
                                                            <button onClick={() => saveEdit(rate.id)} className="text-green-600"><span className="material-symbols-outlined">check</span></button>
                                                        </div>
                                                    ) : (
                                                        <div onClick={() => startEdit(rate.id, rate.rate)} className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded flex items-center gap-1">
                                                            <span>${rate.rate.toFixed(2)}</span>
                                                            <span className="material-symbols-outlined text-xs text-slate-400 opacity-0 group-hover:opacity-100">edit</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select className="w-full bg-transparent border-none text-sm text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer" defaultValue={rate.duration}>
                                                        <option>Same Day</option>
                                                        <option>1-2 Days</option>
                                                        <option>2-3 Days</option>
                                                        <option>3-5 Days</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <label className="inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" className="sr-only peer" checked={rate.status === 'Active'} onChange={() => updateShippingRate(rate.id, {status: rate.status === 'Active' ? 'Inactive' : 'Active'})} />
                                                        <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                    </label>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ShippingRates;