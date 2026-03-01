import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const StockTransfer: React.FC = () => {
    const { products, addStockTransfer, setCurrentView } = useData();
    const [fromLoc, setFromLoc] = useState('Main Warehouse');
    const [toLoc, setToLoc] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedItemId, setSelectedItemId] = useState('');
    const [transferQty, setTransferQty] = useState(1);
    const [items, setItems] = useState<{product: any, qty: number}[]>([]);

    const handleAddItem = () => {
        if (selectedItemId) {
            const product = products.find(p => p.id === parseInt(selectedItemId));
            if (product) {
                setItems([...items, { product, qty: transferQty }]);
                setSelectedItemId('');
                setTransferQty(1);
            }
        }
    };

    const handleConfirm = () => {
        if (toLoc && items.length > 0) {
            addStockTransfer({
                from: fromLoc,
                to: toLoc,
                date,
                items
            });
        } else {
            alert("Please select a destination and add items.");
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-text-primary-light antialiased h-screen flex flex-col">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-border-light bg-surface-light px-6 py-4 sticky top-0 z-20">
                <div className="flex items-center gap-4 text-text-primary-light">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setCurrentView('inventory-list')} className="hover:bg-slate-100 p-1 rounded-full"><span className="material-symbols-outlined">arrow_back</span></button>
                        <span className="material-symbols-outlined text-primary text-3xl">swap_horiz</span>
                        <h2 className="text-lg font-bold leading-tight tracking-tight font-khmer">ការផ្ទេរស្តុក (Stock Transfer)</h2>
                    </div>
                </div>
            </header>

            <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full flex flex-col gap-6 overflow-y-auto">
                <div className="bg-surface-light rounded-xl border border-border-light shadow-sm flex flex-col">
                    <div className="p-6 border-b border-border-light bg-slate-50/50">
                        <div className="flex flex-col md:flex-row gap-6 items-end">
                            <div className="flex-1 w-full space-y-2">
                                <label className="block text-sm font-semibold text-text-primary-light font-khmer">
                                    ទីតាំងដើម <span className="text-text-secondary-light font-normal">(From Location)</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">
                                        <span className="material-symbols-outlined text-[20px]">warehouse</span>
                                    </span>
                                    <select value={fromLoc} onChange={e => setFromLoc(e.target.value)} className="block w-full rounded-lg border-border-light bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-primary shadow-sm">
                                        <option>Main Warehouse</option>
                                        <option>Branch 1</option>
                                    </select>
                                </div>
                            </div>
                            <div className="hidden md:flex pb-2 text-text-secondary-light">
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </div>
                            <div className="flex-1 w-full space-y-2">
                                <label className="block text-sm font-semibold text-text-primary-light font-khmer">
                                    ទីតាំងទទួល <span className="text-text-secondary-light font-normal">(To Location)</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">
                                        <span className="material-symbols-outlined text-[20px]">storefront</span>
                                    </span>
                                    <select value={toLoc} onChange={e => setToLoc(e.target.value)} className="block w-full rounded-lg border-border-light bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-primary shadow-sm">
                                        <option disabled value="">-- ជ្រើសរើសទីតាំង (Select) --</option>
                                        <option>Branch 1</option>
                                        <option>Branch 2</option>
                                        <option>Branch 3</option>
                                    </select>
                                </div>
                            </div>
                            <div className="w-full md:w-48 space-y-2">
                                <label className="block text-sm font-semibold text-text-primary-light font-khmer">
                                    កាលបរិច្ឆេទ <span className="text-text-secondary-light font-normal">(Date)</span>
                                </label>
                                <input value={date} onChange={e => setDate(e.target.value)} className="block w-full rounded-lg border-border-light bg-white py-2.5 px-3 text-sm focus:border-primary focus:ring-primary shadow-sm text-gray-600" type="date" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <h3 className="text-base font-bold text-text-primary-light font-khmer">ទំនិញដែលត្រូវផ្ទេរ (Items to Transfer)</h3>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <select value={selectedItemId} onChange={e => setSelectedItemId(e.target.value)} className="rounded border-slate-300 w-full sm:w-64 text-sm">
                                    <option value="">Select Item</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <input type="number" value={transferQty} onChange={e => setTransferQty(parseInt(e.target.value))} className="w-20 rounded border-slate-300 text-sm" min="1" />
                                <button onClick={handleAddItem} className="bg-primary text-white px-3 py-2 rounded text-sm">Add</button>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-border-light">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-slate-50 text-text-secondary-light font-semibold border-b border-border-light">
                                    <tr>
                                        <th className="px-4 py-3 w-16">#</th>
                                        <th className="px-4 py-3">Item Name</th>
                                        <th className="px-4 py-3 w-32 text-center">Current Stock</th>
                                        <th className="px-4 py-3 w-40">Transfer Qty</th>
                                        <th className="px-4 py-3 w-16 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light bg-white">
                                    {items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden"><img src={item.product.image} className="w-full h-full object-cover"/></div>
                                                    <div><p className="font-medium text-text-primary-light">{item.product.name}</p><p className="text-xs text-text-secondary-light">{item.product.sku}</p></div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{item.product.stock}</span></td>
                                            <td className="px-4 py-3">{item.qty}</td>
                                            <td className="px-4 py-3 text-center"><button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[20px]">delete</span></button></td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">No items selected</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50/50 border-t border-border-light rounded-b-xl flex justify-end gap-3">
                        <button onClick={() => setCurrentView('inventory-list')} className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-text-primary-light font-medium text-sm hover:bg-gray-50 transition-colors font-khmer">
                            បោះបង់ (Cancel)
                        </button>
                        <button onClick={handleConfirm} className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 font-khmer">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            បញ្ជាក់ការផ្ទេរស្តុក (Confirm Transfer)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockTransfer;