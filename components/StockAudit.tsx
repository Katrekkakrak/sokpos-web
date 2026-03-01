import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const StockAudit: React.FC = () => {
    const { products, performStockAudit, setCurrentView } = useData();
    const [auditCounts, setAuditCounts] = useState<Record<number, number>>({});
    const [searchTerm, setSearchTerm] = useState('');

    const handleCountChange = (id: number, value: string) => {
        const num = parseInt(value);
        if (!isNaN(num)) {
            setAuditCounts(prev => ({ ...prev, [id]: num }));
        }
    };

    const handleConfirm = () => {
        const updates = Object.entries(auditCounts).map(([id, qty]) => ({
            productId: parseInt(id),
            actualStock: qty
        }));
        if (updates.length > 0) {
            performStockAudit(updates);
        } else {
            alert("No changes made.");
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background-light text-slate-900 dark:bg-background-dark dark:text-white font-display">
            <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span onClick={() => setCurrentView('inventory-list')} className="hover:text-primary cursor-pointer font-khmer">បញ្ជីសារពើភណ្ឌ</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="font-medium text-slate-900 dark:text-white font-khmer">ការផ្ទៀងផ្ទាត់ស្តុក</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto bg-background-light p-6 dark:bg-background-dark custom-scrollbar">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-khmer">ការផ្ទៀងផ្ទាត់ស្តុក (Stock Audit)</h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ផ្ទៀងផ្ទាត់ចំនួនស្តុកក្នុងប្រព័ន្ធជាមួយនឹងស្តុកជាក់ស្តែង ដើម្បីធានាភាពត្រឹមត្រូវនៃទិន្នន័យ។</p>
                        </div>
                    </div>

                    <div className="mb-4 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:flex-row md:items-center">
                        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary dark:border-slate-600 dark:bg-slate-900">
                            <span className="material-symbols-outlined text-slate-400">search</span>
                            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 dark:text-white placeholder:text-slate-400 font-khmer" placeholder="ស្វែងរកតាមឈ្មោះ ឬ លេខកូដទំនិញ..." type="text"/>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold font-khmer">ទំនិញ (Product)</th>
                                        <th className="px-6 py-4 font-semibold text-center font-khmer">ស្តុកក្នុងប្រព័ន្ធ (System)</th>
                                        <th className="px-6 py-4 font-semibold text-center w-40 font-khmer">ស្តុកជាក់ស្តែង (Physical)</th>
                                        <th className="px-6 py-4 font-semibold text-center font-khmer">គម្លាត (Variance)</th>
                                        <th className="px-6 py-4 font-semibold text-right font-khmer">ស្ថានភាព (Status)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {filteredProducts.map(product => {
                                        const actual = auditCounts[product.id] ?? product.stock;
                                        const variance = (actual || 0) - (product.stock || 0);
                                        return (
                                            <tr key={product.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-100 dark:border-slate-700">
                                                            <img alt={product.name} className="h-full w-full object-cover" src={product.image} />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">SKU: {product.sku}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                                        {product.stock}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input 
                                                        className="w-full rounded-lg border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-900 dark:text-white" 
                                                        type="number" 
                                                        value={auditCounts[product.id] ?? ''} 
                                                        placeholder={product.stock?.toString()}
                                                        onChange={(e) => handleCountChange(product.id, e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`font-bold ${variance < 0 ? 'text-rose-600' : variance > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                        {variance > 0 ? '+' : ''}{variance}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {variance !== 0 ? (
                                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${variance < 0 ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                                                            {variance < 0 ? 'បាត់បង់' : 'លើស'}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">
                                                            ត្រឹមត្រូវ
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            <div className="border-t border-slate-200 bg-white px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex flex-col md:flex-row md:items-center md:gap-6">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-khmer">
                            បានកែសម្រួល: <span className="font-semibold text-slate-900 dark:text-white">{Object.keys(auditCounts).length} មុខទំនិញ</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setCurrentView('inventory-list')} className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 font-khmer">
                            បោះបង់ (Cancel)
                        </button>
                        <button onClick={handleConfirm} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/30 transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 font-khmer">
                            <span className="material-symbols-outlined text-[20px]">save_as</span>
                            កែតម្រូវស្តុក (Adjust Inventory)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockAudit;