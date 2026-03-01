import React, { useState } from 'react';
import { useData, ProductVariant } from '../context/DataContext';

interface Props {
    variants: ProductVariant[];
    onSave: (variants: ProductVariant[]) => void;
}

const VariantManagementModal: React.FC<Props> = ({ variants: initialVariants, onSave }) => {
    const { setIsVariantModalOpen } = useData();
    const [localVariants, setLocalVariants] = useState<ProductVariant[]>(initialVariants);

    // Helper to generate a new variant line
    const addVariant = () => {
        const newId = `v-${Date.now()}`;
        setLocalVariants([...localVariants, { id: newId, name: '', sku: '', stock: 0, price: 0 }]);
    };

    const removeVariant = (id: string) => {
        setLocalVariants(localVariants.filter(v => v.id !== id));
    };

    const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
        setLocalVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const handleSave = () => {
        onSave(localVariants);
        setIsVariantModalOpen(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsVariantModalOpen(false)}></div>
            <div className="bg-white dark:bg-[#1a2634] w-full max-w-[860px] max-h-[90vh] flex flex-col rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200 z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-khmer">
                            <span className="material-symbols-outlined text-primary">tune</span>
                            ការគ្រប់គ្រងវ៉ារ្យ៉ង់ (Variant Management)
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Add options like Size, Color, etc.</p>
                    </div>
                    <button onClick={() => setIsVariantModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-khmer">បញ្ជីជម្រើសបច្ចុប្បន្ន</p>
                        <button onClick={addVariant} className="text-primary font-medium text-sm flex items-center gap-1 hover:underline font-khmer">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            បន្ថែមជម្រើសថ្មី
                        </button>
                    </div>

                    <div className="space-y-3">
                        {localVariants.length === 0 && (
                            <div className="text-center py-8 text-slate-400 dark:text-slate-500 italic">No variants added yet. Click "បន្ថែមជម្រើសថ្មី" to start.</div>
                        )}
                        {localVariants.map((v, idx) => (
                            <div key={v.id} className="flex flex-col md:flex-row gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 font-khmer">ឈ្មោះ (Name)</label>
                                    <input 
                                        type="text" 
                                        value={v.name} 
                                        onChange={(e) => updateVariant(v.id, 'name', e.target.value)}
                                        className="w-full rounded border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm py-1.5"
                                        placeholder="e.g. Red - S"
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 font-khmer">ស្តុក</label>
                                    <input 
                                        type="number" 
                                        value={v.stock} 
                                        onChange={(e) => updateVariant(v.id, 'stock', parseInt(e.target.value) || 0)}
                                        className="w-full rounded border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm py-1.5"
                                    />
                                </div>
                                <div className="w-28">
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 font-khmer">តម្លៃ ($)</label>
                                    <input 
                                        type="number" 
                                        value={v.price} 
                                        onChange={(e) => updateVariant(v.id, 'price', parseFloat(e.target.value) || 0)}
                                        className="w-full rounded border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm py-1.5"
                                    />
                                </div>
                                <div className="w-32">
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">SKU</label>
                                    <input 
                                        type="text" 
                                        value={v.sku} 
                                        onChange={(e) => updateVariant(v.id, 'sku', e.target.value)}
                                        className="w-full rounded border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm py-1.5 uppercase"
                                    />
                                </div>
                                <div className="flex items-end pb-1">
                                    <button onClick={() => removeVariant(v.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-b-xl gap-3">
                    <button onClick={() => setIsVariantModalOpen(false)} className="px-5 py-2.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-white text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all font-khmer">
                        បោះបង់ (Cancel)
                    </button>
                    <button onClick={handleSave} className="px-5 py-2.5 rounded-md bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-hover transition-all flex items-center gap-2 font-khmer">
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        រក្សាទុក (Save)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VariantManagementModal;