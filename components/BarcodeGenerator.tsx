import React, { useState } from 'react';
import { useData, Product } from '../context/DataContext';

const BarcodeGenerator: React.FC = () => {
    const { products, setCurrentView } = useData();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVariantId, setSelectedVariantId] = useState<string>('');
    const [quantity, setQuantity] = useState(21);

    const filteredProducts = searchTerm && !selectedProduct 
        ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        setSearchTerm(product.name);
        setSelectedVariantId('');
    };

    const handlePrint = () => {
        window.print();
    };

    const getActiveSku = () => {
        if (!selectedProduct) return '';
        if (selectedVariantId && selectedProduct.variants) {
            return selectedProduct.variants.find(v => v.id === selectedVariantId)?.sku || '';
        }
        return selectedProduct.sku || '';
    };

    const getActivePrice = () => {
        if (!selectedProduct) return 0;
        if (selectedVariantId && selectedProduct.variants) {
            return selectedProduct.variants.find(v => v.id === selectedVariantId)?.price || 0;
        }
        return selectedProduct.price || 0;
    };

    const getActiveName = () => {
        if (!selectedProduct) return '';
        if (selectedVariantId && selectedProduct.variants) {
            const variant = selectedProduct.variants.find(v => v.id === selectedVariantId);
            return `${selectedProduct.name} (${variant?.name})`;
        }
        return selectedProduct.name;
    };

    return (
        <div className="flex flex-1 flex-col lg:flex-row h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            {/* Left Panel: Config */}
            <aside className="w-full lg:w-[380px] xl:w-[420px] flex flex-col bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-700 z-10 no-print overflow-y-auto">
                <div className="px-6 pt-6 pb-2">
                    <div className="flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <button onClick={() => setCurrentView('inventory-list')} className="hover:text-primary">Inventory</button>
                        <span>/</span>
                        <span className="text-slate-900 dark:text-white font-medium">Barcode Generator</span>
                    </div>
                    <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Barcode Generator</h1>
                </div>

                <div className="p-6 space-y-6 flex-1">
                    {/* Search */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Search Product</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input 
                                type="text"
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg leading-5 bg-background-light dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm"
                                placeholder="Scan SKU or type name..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setSelectedProduct(null); }}
                            />
                            {/* Autocomplete */}
                            {filteredProducts.length > 0 && (
                                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {filteredProducts.map(p => (
                                        <div 
                                            key={p.id} 
                                            className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                                            onClick={() => handleProductSelect(p)}
                                        >
                                            <div className="font-medium">{p.name}</div>
                                            <div className="text-xs text-slate-500">{p.sku}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Variant Select */}
                    {selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0 && (
                        <div className="space-y-3">
                            <label className="text-sm font-semibold">Select Variant</label>
                            <div className="grid grid-cols-2 gap-2">
                                {selectedProduct.variants.map(v => (
                                    <button 
                                        key={v.id}
                                        onClick={() => setSelectedVariantId(v.id)}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${selectedVariantId === v.id ? 'border-primary bg-primary/10' : 'border-slate-200 dark:border-slate-600'}`}
                                    >
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-medium">{v.name}</span>
                                        </div>
                                        {selectedVariantId === v.id && <span className="material-symbols-outlined text-primary text-lg">check_circle</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Print Settings */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold">Quantity</label>
                            <div className="flex items-center bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-l-lg"><span className="material-symbols-outlined text-sm">remove</span></button>
                                <input className="w-12 text-center border-none p-0 text-sm font-bold bg-transparent" type="number" value={quantity} readOnly />
                                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-r-lg"><span className="material-symbols-outlined text-sm">add</span></button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 mt-auto">
                        <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-khmer">
                            <span className="material-symbols-outlined">print</span>
                            បោះពុម្ព Barcode
                        </button>
                    </div>
                </div>
            </aside>

            {/* Right Panel: Preview */}
            <main className="flex-1 bg-slate-100 dark:bg-[#0b1116] overflow-y-auto relative p-8 flex justify-center items-start">
                <div className="absolute top-6 left-8 flex items-center gap-2 no-print">
                    <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-xs font-bold text-slate-500 shadow-sm border border-slate-200 dark:border-slate-700">PREVIEW</span>
                </div>

                {/* A4 Paper Simulation */}
                <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl mx-auto p-[10mm] mt-8 mb-8" id="printable-area">
                    <div className="grid grid-cols-3 gap-x-[5mm] gap-y-[4mm] h-full content-start">
                        {Array.from({ length: quantity }).map((_, idx) => (
                            <div key={idx} className="border border-dashed border-slate-300 rounded p-2 flex flex-col items-center justify-between h-[38mm] w-full overflow-hidden text-black">
                                <div className="text-center w-full">
                                    <h3 className="text-[11px] font-bold leading-tight truncate px-1">{getActiveName() || 'Product Name'}</h3>
                                    <p className="text-[10px] text-slate-500 mt-0.5">SKU: {getActiveSku() || 'SKU-000'}</p>
                                </div>
                                <div className="barcode-stripes w-[80%] opacity-90 my-1 bg-repeat-x h-8" style={{backgroundImage: "linear-gradient(to right, #000 5%, transparent 5%, transparent 10%, #000 10%, #000 15%, transparent 15%, transparent 20%, #000 20%, #000 25%, #000 30%, transparent 30%, transparent 35%, #000 35%, #000 40%, transparent 40%, transparent 45%, #000 45%, #000 55%, transparent 55%, transparent 60%, #000 60%, #000 70%, transparent 70%, transparent 75%, #000 75%, #000 85%, transparent 85%, transparent 90%, #000 90%, #000 95%)"}}></div>
                                <div className="w-full flex justify-between items-end px-1">
                                    <span className="text-[9px] font-mono text-slate-400">12345678</span>
                                    <span className="text-sm font-bold">${getActivePrice().toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BarcodeGenerator;