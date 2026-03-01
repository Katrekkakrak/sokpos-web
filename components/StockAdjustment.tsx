import React, { useState } from 'react';
import { useData, Product } from '../context/DataContext';

const StockAdjustment: React.FC = () => {
    const { products, adjustStock, setCurrentView } = useData();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(0);
    const [operation, setOperation] = useState<'add' | 'subtract'>('add');
    const [reason, setReason] = useState('received');
    const [notes, setNotes] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        setSearchTerm(product.name);
        // Reset variant if product changes
        setSelectedVariant('');
    };

    const handleSave = () => {
        if (selectedProduct) {
            const qty = operation === 'add' ? quantity : -quantity;
            adjustStock(selectedProduct.id, selectedVariant || null, qty, reason);
            // Reset
            setSelectedProduct(null);
            setSearchTerm('');
            setQuantity(0);
            setNotes('');
        }
    };

    const filteredProducts = searchTerm && !selectedProduct 
        ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    return (
        <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto font-display">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#1a2634] border-b border-slate-200 dark:border-slate-700 shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-none font-khmer">ការកែសម្រួលស្តុក</h2>
                        <nav className="flex text-xs text-slate-500 mt-1">
                            <span className="hover:text-primary cursor-pointer" onClick={() => setCurrentView('inventory-list')}>Inventory</span>
                            <span className="mx-1">/</span>
                            <span className="text-slate-900 dark:text-slate-300 font-medium">Adjustments</span>
                        </nav>
                    </div>
                </div>
            </header>

            <div className="flex-1 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-[#1a2634] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {/* Card Header */}
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-khmer">ទម្រង់កែសម្រួលស្តុក (Adjustment Entry)</h3>
                                <p className="text-sm text-slate-500">ប្រើសម្រាប់កែតម្រូវបរិមាណស្តុកដោយដៃសម្រាប់ទំនិញដែលបាត់ ឬខូច</p>
                            </div>
                            <div className="hidden sm:block">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                    Draft #ADJ-NEW
                                </span>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 space-y-8">
                            {/* Product Selection */}
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 font-khmer">
                                    ជ្រើសរើសទំនិញ (Select Product) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400">search</span>
                                    </div>
                                    <input 
                                        type="text"
                                        className="block w-full pl-10 pr-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary focus:border-primary dark:bg-slate-700 dark:text-white shadow-sm sm:text-sm" 
                                        placeholder="ស្វែងរកតាមឈ្មោះ កូដទំនិញ ឬបាកូដ..." 
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setSelectedProduct(null); }}
                                    />
                                    {/* Dropdown Results */}
                                    {filteredProducts.length > 0 && (
                                        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {filteredProducts.map(p => (
                                                <div 
                                                    key={p.id} 
                                                    className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center"
                                                    onClick={() => handleProductSelect(p)}
                                                >
                                                    <div>
                                                        <div className="font-medium text-slate-900 dark:text-white">{p.name}</div>
                                                        <div className="text-xs text-slate-500">{p.sku}</div>
                                                    </div>
                                                    <div className="text-xs text-slate-400">{p.stock} units</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Context */}
                                {selectedProduct && (
                                    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg items-start sm:items-center animate-fade-in">
                                        <div className="h-16 w-16 flex-shrink-0 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden">
                                            <img src={selectedProduct.image} alt={selectedProduct.name} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">{selectedProduct.name}</h4>
                                            <p className="text-sm text-slate-500 truncate">SKU: {selectedProduct.sku} | Price: ${selectedProduct.price}</p>
                                            
                                            {/* Variant Selector if exists */}
                                            {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                                                <div className="mt-2">
                                                    <select 
                                                        className="text-sm border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
                                                        value={selectedVariant}
                                                        onChange={(e) => setSelectedVariant(e.target.value)}
                                                    >
                                                        <option value="">Select Variant</option>
                                                        {selectedProduct.variants.map(v => (
                                                            <option key={v.id} value={v.id}>{v.name} (Stock: {v.stock})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end pl-4 border-l border-blue-200 dark:border-blue-800">
                                            <span className="text-xs text-slate-500 uppercase font-semibold font-khmer">ស្តុកបច្ចុប្បន្ន</span>
                                            <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                                {selectedVariant 
                                                    ? selectedProduct.variants?.find(v => v.id === selectedVariant)?.stock 
                                                    : selectedProduct.stock}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <hr className="border-slate-100 dark:border-slate-700" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 font-khmer">ប្រភេទប្រតិបត្តិការ (Operation)</label>
                                        <div className="flex rounded-lg shadow-sm">
                                            <button 
                                                onClick={() => setOperation('add')}
                                                className={`flex-1 flex items-center justify-center py-2.5 px-4 text-sm font-medium rounded-l-lg border font-khmer transition-colors
                                                    ${operation === 'add' ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-slate-700 text-slate-500 border-slate-300 dark:border-slate-600'}
                                                `}
                                            >
                                                <span className="material-symbols-outlined mr-2 text-lg">add_circle</span>
                                                បន្ថែម (+)
                                            </button>
                                            <button 
                                                onClick={() => setOperation('subtract')}
                                                className={`flex-1 flex items-center justify-center py-2.5 px-4 text-sm font-medium rounded-r-lg border font-khmer transition-colors
                                                    ${operation === 'subtract' ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-slate-700 text-slate-500 border-slate-300 dark:border-slate-600'}
                                                `}
                                            >
                                                <span className="material-symbols-outlined mr-2 text-lg">remove_circle</span>
                                                បន្ថយ (-)
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 font-khmer">បរិមាណកែសម្រួល (Quantity) <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                min="1"
                                                value={quantity}
                                                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                                className="block w-full pl-4 pr-12 py-3 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-primary focus:border-primary dark:bg-slate-700 dark:text-white text-lg font-semibold shadow-sm"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                <span className="text-slate-500 sm:text-sm">Unit</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 font-khmer">មូលហេតុ (Reason) <span className="text-red-500">*</span></label>
                                        <select 
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="block w-full py-3 px-4 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm dark:text-white font-khmer"
                                        >
                                            <option value="received">ទទួលបានទំនិញថ្មី (New Stock Received)</option>
                                            <option value="return">អតិថិជនប្រគល់ត្រឡប់ (Customer Return)</option>
                                            <option value="found">រកឃើញក្នុងស្តុក (Found in Stock)</option>
                                            <option value="correction">កែតម្រូវទិន្នន័យ (Data Correction)</option>
                                            <option value="damaged">ខូចខាត (Damaged)</option>
                                            <option value="lost">បាត់បង់ (Lost)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 font-khmer">កំណត់សម្គាល់ (Notes)</label>
                                        <textarea 
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="block w-full px-4 py-3 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-primary focus:border-primary dark:bg-slate-700 dark:text-white sm:text-sm font-khmer" 
                                            placeholder="សរសេរព័ត៌មានបន្ថែមនៅទីនេះ..." rows={4}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <button onClick={() => setCurrentView('inventory-list')} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-4 py-2 rounded-lg transition-colors font-khmer">
                                បោះបង់ (Cancel)
                            </button>
                            <div className="flex gap-3">
                                <button onClick={handleSave} className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors font-khmer">
                                    <span className="material-symbols-outlined mr-2 text-lg">save</span>
                                    រក្សាទុក (Save Adjustment)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockAdjustment;