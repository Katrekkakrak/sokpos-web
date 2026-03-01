import React, { useState } from 'react';
import { useData, PurchaseOrder, PurchaseOrderItem } from '../context/DataContext';

const CreatePO: React.FC = () => {
    const { suppliers, products, createPO, setCurrentView } = useData();
    const [supplierId, setSupplierId] = useState('');
    const [refNo, setRefNo] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [warehouse, setWarehouse] = useState('Main Warehouse');
    const [items, setItems] = useState<PurchaseOrderItem[]>([]);
    
    // Item adding state
    const [selectedProductId, setSelectedProductId] = useState('');
    const [qty, setQty] = useState(1);
    const [cost, setCost] = useState(0);

    const handleAddItem = () => {
        if (selectedProductId && qty > 0) {
            const product = products.find(p => p.id === parseInt(selectedProductId));
            if (product) {
                const newItem: PurchaseOrderItem = {
                    productId: product.id,
                    productName: product.name,
                    quantity: qty,
                    unit: 'Unit',
                    unitCost: cost > 0 ? cost : (product.cost || 0),
                    total: qty * (cost > 0 ? cost : (product.cost || 0)),
                    sku: product.sku || ''
                };
                setItems([...items, newItem]);
                // Reset inputs
                setSelectedProductId('');
                setQty(1);
                setCost(0);
            }
        }
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (supplierId && items.length > 0) {
            const supplier = suppliers.find(s => s.id === supplierId);
            createPO({
                supplierId,
                supplierName: supplier?.name,
                date: new Date(date),
                items,
                totalAmount: items.reduce((acc, i) => acc + i.total, 0),
                warehouse,
                refNo
            });
        } else {
            alert("Please select a supplier and add at least one item.");
        }
    };

    const grandTotal = items.reduce((acc, i) => acc + i.total, 0);

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen">
            <header className="bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-slate-700 sticky top-0 z-20">
                <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setCurrentView('purchase-orders')} className="hover:bg-slate-100 p-1 rounded-full"><span className="material-symbols-outlined">arrow_back</span></button>
                        <h1 className="text-xl font-bold tracking-tight">Create Purchase Order</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">JS</div>
                    </div>
                </div>
            </header>
            <main className="max-w-[1200px] mx-auto p-6 pb-24">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-khmer">បង្កើតការកុម្ម៉ង់ទិញ</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill in the details below to create a PO.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">PO-NEW</span>
                        <span className="text-sm text-slate-500">Date: <span className="font-medium text-slate-900 dark:text-white">{new Date().toLocaleDateString()}</span></span>
                    </div>
                </div>

                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-5 flex items-center gap-2 font-khmer">
                        <span className="material-symbols-outlined text-primary">storefront</span>
                        ព័ត៌មានអ្នកផ្គត់ផ្គង់
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2 font-khmer">
                                ជ្រើសរើសអ្នកផ្គត់ផ្គង់ <span className="text-red-500">*</span>
                            </label>
                            <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 dark:bg-slate-800 dark:ring-slate-600 dark:text-white">
                                <option value="">សូមជ្រើសរើស...</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2 font-khmer">
                                កាលបរិច្ឆេទរំពឹងទុក <span className="text-red-500">*</span>
                            </label>
                            <input value={date} onChange={e => setDate(e.target.value)} type="date" className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 dark:bg-slate-800 dark:ring-slate-600 dark:text-white" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2 font-khmer">ឃ្លាំងទទួលទំនិញ</label>
                            <select value={warehouse} onChange={e => setWarehouse(e.target.value)} className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 dark:bg-slate-800 dark:ring-slate-600 dark:text-white">
                                <option value="Main Warehouse">ឃ្លាំងធំ (Main Warehouse)</option>
                                <option value="Branch 1">សាខា ទី១</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2 font-khmer">លេខយោង (Reference No.)</label>
                            <input value={refNo} onChange={e => setRefNo(e.target.value)} type="text" className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 dark:bg-slate-800 dark:ring-slate-600 dark:text-white" placeholder="Optional" />
                        </div>
                    </div>
                </div>

                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden mb-6 flex flex-col">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 font-khmer">
                            <span className="material-symbols-outlined text-primary">shopping_cart</span>
                            បញ្ជីទំនិញ
                        </h3>
                        <button onClick={() => document.getElementById('item-adder')?.classList.toggle('hidden')} className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/20 hover:bg-primary/5 transition-colors">
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            បន្ថែមទំនិញថ្មី
                        </button>
                    </div>
                    
                    {/* Item Adder */}
                    <div id="item-adder" className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 hidden">
                        <div className="flex gap-4 items-end flex-wrap">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-medium mb-1">Product</label>
                                <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="w-full rounded border-slate-300 text-sm">
                                    <option value="">Select Product</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="w-24">
                                <label className="block text-xs font-medium mb-1">Qty</label>
                                <input type="number" value={qty} onChange={e => setQty(parseInt(e.target.value))} className="w-full rounded border-slate-300 text-sm" />
                            </div>
                            <div className="w-32">
                                <label className="block text-xs font-medium mb-1">Cost ($)</label>
                                <input type="number" value={cost} onChange={e => setCost(parseFloat(e.target.value))} className="w-full rounded border-slate-300 text-sm" placeholder="Auto" />
                            </div>
                            <button onClick={handleAddItem} className="bg-primary text-white px-4 py-2 rounded text-sm font-bold">Add</button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">#</th>
                                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-khmer">ឈ្មោះទំនិញ</th> 
                                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-khmer">បរិមាណ</th> 
                                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-khmer">ឯកតា</th> 
                                    <th className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-khmer">តម្លៃឯកតា ($)</th> 
                                    <th className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-khmer">សរុប ($)</th> 
                                    <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-4 text-sm text-gray-500 text-center">{idx + 1}</td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                            <div className="flex flex-col"><span className="font-medium">{item.productName}</span><span className="text-xs text-gray-500">{item.sku}</span></div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{item.quantity}</td>
                                        <td className="px-4 py-4 text-sm"><span className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">{item.unit}</span></td>
                                        <td className="px-4 py-4 text-sm text-right">{item.unitCost.toFixed(2)}</td>
                                        <td className="px-4 py-4 text-sm text-right font-medium">{item.total.toFixed(2)}</td>
                                        <td className="px-4 py-4 text-center">
                                            <button onClick={() => handleRemoveItem(idx)} className="text-gray-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined">delete</span></button>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr><td colSpan={7} className="text-center py-8 text-gray-500">No items added yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 h-full">
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2 font-khmer">
                                កំណត់សម្គាល់ (Notes)
                            </label>
                            <textarea className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-slate-800 dark:ring-slate-600 dark:text-white" placeholder="បន្ថែមព័ត៌មានផ្សេងៗនៅទីនេះ..." rows={4}></textarea>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 font-khmer">សរុបប្រាក់</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-khmer">សរុបរង (Subtotal):</span>
                                    <span className="font-medium text-gray-900 dark:text-white">${grandTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 items-center">
                                    <span className="font-khmer">បញ្ចុះតម្លៃ (Discount):</span>
                                    <div className="flex items-center w-24">
                                        <input className="block w-full rounded-md border-0 py-0.5 px-2 text-right text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-xs sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-600" type="text" value="0"/>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 items-center">
                                    <span className="font-khmer">ពន្ធ (Tax 10%):</span>
                                    <span className="font-medium text-gray-900 dark:text-white">${(grandTotal * 0.1).toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-base font-bold text-gray-900 dark:text-white font-khmer">សរុបរួម (Grand Total):</span>
                                        <span className="text-2xl font-bold text-primary">${(grandTotal * 1.1).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex flex-col gap-3">
                                <button onClick={handleSave} className="w-full flex justify-center items-center gap-2 rounded-md bg-primary px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all hover:shadow-md font-khmer">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    បញ្ជាក់ការកុម្ម៉ង់
                                </button>
                                <button onClick={() => setCurrentView('purchase-orders')} className="w-full flex justify-center items-center gap-2 rounded-md bg-white px-3 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-slate-800 dark:text-white dark:ring-slate-600 dark:hover:bg-slate-700 transition-colors font-khmer">
                                    <span className="material-symbols-outlined">save</span>
                                    រក្សាទុកជាព្រាង
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreatePO;