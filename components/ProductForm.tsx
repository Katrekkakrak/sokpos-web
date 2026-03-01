import React, { useState, useEffect } from 'react';
import { useData, Product, ProductVariant, ProductUnit, ProductBatch } from '../context/DataContext';
import VariantManagementModal from './VariantManagementModal';

const ProductForm: React.FC = () => {
    const { setCurrentView, addProduct, updateProduct, editingProduct, setIsVariantModalOpen, isVariantModalOpen } = useData();
    
    // Form State - Basic
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [sku, setSku] = useState('');
    const [barcode, setBarcode] = useState('');
    const [price, setPrice] = useState('');
    const [cost, setCost] = useState('');
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState('');
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    
    // Form State - Dynamic UOM
    const [baseUnit, setBaseUnit] = useState('');
    const [units, setUnits] = useState<ProductUnit[]>([]);
    const [newUnit, setNewUnit] = useState<Partial<ProductUnit>>({
        unitId: '',
        name: '',
        multiplier: 1,
        price: 0,
        barcode: ''
    });

    // Form State - Batch Management (FEFO)
    const [batches, setBatches] = useState<ProductBatch[]>([]);
    const [newBatch, setNewBatch] = useState<Partial<ProductBatch>>({
        batchId: '',
        quantity: 0,
        expiryDate: ''
    });
    
    // Initialize form if editing
    useEffect(() => {
        if (editingProduct) {
            setName(editingProduct.name);
            setCategory(editingProduct.category);
            setSku(editingProduct.sku || '');
            setBarcode(editingProduct.barcode || '');
            setPrice(editingProduct.price.toString());
            setCost(editingProduct.cost?.toString() || '');
            setDescription(editingProduct.description || '');
            setStock(editingProduct.stock.toString());
            setVariants(editingProduct.variants || []);
            setBaseUnit(editingProduct.baseUnit || '');
            setUnits(editingProduct.units || []);
            setBatches(editingProduct.batches || []);
        } else {
            // Reset form for new product
            setBarcode('');
            setBaseUnit('');
            setUnits([]);
            setBatches([]);
        }
    }, [editingProduct]);

    // Auto-calculate total stock from batches
    useEffect(() => {
        if (batches.length > 0) {
            const totalStock = batches.reduce((sum, batch) => sum + (Number(batch.quantity) || 0), 0);
            setStock(totalStock.toString());
        }
    }, [batches]);

    const handleSave = () => {
        const productData: Partial<Product> = {
            name,
            category,
            sku,
            barcode,
            price: parseFloat(price) || 0,
            cost: parseFloat(cost) || 0,
            description,
            variants,
            stock: parseFloat(stock) || 0,
            baseUnit: baseUnit || 'unit',
            units: units.length > 0 ? units : [
                {
                    unitId: 'u1',
                    name: baseUnit || 'unit',
                    multiplier: 1,
                    price: parseFloat(price) || 0
                }
            ],
            batches: batches.length > 0 ? batches : undefined
        };

        if (editingProduct) {
            updateProduct(editingProduct.id, productData);
        } else {
            addProduct(productData);
        }
    };

    const handleAddUnit = () => {
        if (!newUnit.name || newUnit.multiplier === undefined || newUnit.price === undefined) {
            alert('ចូលបំពេញទាំងឡាយលម្អិតលម្អិតនៃឯកតា (Fill in all unit details)');
            return;
        }

        const unitToAdd: ProductUnit = {
            unitId: `u${units.length + 1}`,
            name: newUnit.name as string,
            multiplier: parseFloat(newUnit.multiplier.toString()) || 1,
            price: parseFloat(newUnit.price.toString()) || 0,
            barcode: newUnit.barcode || ''
        };

        setUnits([...units, unitToAdd]);
        setNewUnit({
            unitId: '',
            name: '',
            multiplier: 1,
            price: 0,
            barcode: ''
        });
    };

    const handleRemoveUnit = (index: number) => {
        setUnits(units.filter((_, i) => i !== index));
    };

    const handleAddBatch = () => {
        if (!newBatch.quantity || !newBatch.expiryDate) {
            alert('ចូលបំពេញលម្អិតទាំងអស់របស់ផ្នែក (Fill in all batch details)');
            return;
        }

        const batchId = newBatch.batchId?.trim() || `B-${Date.now()}`;
        
        const batchToAdd: ProductBatch = {
            batchId: batchId,
            quantity: parseFloat(newBatch.quantity.toString()) || 0,
            expiryDate: newBatch.expiryDate as string
        };

        setBatches([...batches, batchToAdd]);
        setNewBatch({
            batchId: '',
            quantity: 0,
            expiryDate: ''
        });
    };

    const handleRemoveBatch = (index: number) => {
        setBatches(batches.filter((_, i) => i !== index));
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto">
            {/* Header */}
            <header className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2634]">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-khmer">
                        {editingProduct ? 'កែសម្រួលទំនិញ' : 'បន្ថែមទំនិញថ្មី'}
                    </h2>
                    <nav className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        <button onClick={() => setCurrentView('inventory-list')} className="hover:underline font-khmer">ទំនិញ</button> / <span className="font-khmer">{editingProduct ? 'កែសម្រួល' : 'បន្ថែមទំនិញ'}</span>
                    </nav>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setCurrentView('inventory-list')} className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium font-khmer">
                        បោះបង់
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md font-khmer">
                        រក្សាទុកទំនិញ
                    </button>
                </div>
            </header>

            <div className="p-6 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* General Info */}
                    <section className="bg-white dark:bg-[#1a2634] p-6 rounded-xl border border-slate-200 dark:border-slate-700 custom-shadow">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white font-khmer">
                            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                            ព័ត៌មានទូទៅ
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 font-khmer">ឈ្មោះទំនិញ <span className="text-red-500">*</span></label>
                                <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-primary focus:border-primary" type="text" placeholder="ឧ. អាវយឺតដៃខ្លី" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 font-khmer">ប្រភេទទំនិញ</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-primary focus:border-primary">
                                    <option value="">ជ្រើសរើសប្រភេទ</option>
                                    <option value="Clothing">សម្លៀកបំពាក់</option>
                                    <option value="Electronics">អេឡិចត្រូនិច</option>
                                    <option value="Food">អាហារ និងភេសជ្ជៈ</option>
                                    <option value="Drinks">ភេសជ្ជៈ</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 font-khmer">លេខកូដទំនិញ (SKU)</label>
                                <input value={sku} onChange={e => setSku(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-primary focus:border-primary" type="text" placeholder="ឧ. QB-001" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 font-khmer">លេខកូដរបារ (Barcode)</label>
                                <input value={barcode} onChange={e => setBarcode(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-primary focus:border-primary" type="text" placeholder="ឧ. 5901234123457" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ឯកតាសម្រាប់ការស្កេនលេខកូដរបារ (For barcode scanning)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 font-khmer">ថ្លៃដើម ($)</label>
                                <input value={cost} onChange={e => setCost(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-primary focus:border-primary" type="number" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 font-khmer">តម្លៃលក់ ($)</label>
                                <input value={price} onChange={e => setPrice(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-primary focus:border-primary" type="number" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 font-khmer">ស្តុក (ឯកតាមូលដ្ឋាន) <span className="text-red-500">*</span></label>
                                <input 
                                    value={stock} 
                                    readOnly={batches.length > 0}
                                    onChange={e => batches.length === 0 && setStock(e.target.value)} 
                                    className={`w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-primary focus:border-primary ${batches.length > 0 ? 'bg-slate-100 dark:bg-slate-900 cursor-not-allowed opacity-75' : ''}`}
                                    type="number" 
                                    placeholder="0" 
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {batches.length > 0 
                                        ? '✅ ស្វ័យប្រវត្តិគណនាពីប្រហាក់ប្រហែលក្រោម (Auto-calculated from batches below)'
                                        : 'ចូលបន្ថែមចំនួនសរុបក្នុងឯកតាមូលដ្ឋាន'
                                    }
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 font-khmer">ឯកតាមូលដ្ឋាន (Base Unit) <span className="text-red-500">*</span></label>
                                <input 
                                    value={baseUnit} 
                                    onChange={e => setBaseUnit(e.target.value)} 
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-primary focus:border-primary" 
                                    type="text" 
                                    placeholder="ឧ. Can, Piece, Cup" 
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ឯកតាតូចបំផុតដែលបានតាមដាននៅក្នុងលម្អិត (The smallest unit tracked in inventory)</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 font-khmer">ការពិពណ៌នា</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-primary focus:border-primary" rows={4} placeholder="រៀបរាប់អំពីទំនិញរបស់អ្នក..."></textarea>
                            </div>
                        </div>
                    </section>

                    {/* Variant Section */}
                    <section className="bg-white dark:bg-[#1a2634] p-6 rounded-xl border border-slate-200 dark:border-slate-700 custom-shadow">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white font-khmer">
                                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                ជម្រើសទំនិញ (Variants)
                            </h3>
                            <button onClick={() => setIsVariantModalOpen(true)} className="text-primary font-medium text-sm hover:underline font-khmer">
                                + បន្ថែម/កែសម្រួល
                            </button>
                        </div>
                        
                        {variants.length > 0 ? (
                            <div className="overflow-x-auto border border-slate-200 dark:border-slate-600 rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-200 font-bold uppercase border-b border-slate-200 dark:border-slate-600">
                                        <tr>
                                            <th className="px-4 py-3 font-khmer">ជម្រើស</th>
                                            <th className="px-4 py-3 font-khmer">តម្លៃលក់ ($)</th>
                                            <th className="px-4 py-3 font-khmer">ស្តុក</th>
                                            <th className="px-4 py-3">SKU</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                                        {variants.map(v => (
                                            <tr key={v.id} className="dark:text-white">
                                                <td className="px-4 py-3 font-medium">{v.name}</td>
                                                <td className="px-4 py-3">${v.price}</td>
                                                <td className="px-4 py-3">{v.stock}</td>
                                                <td className="px-4 py-3">{v.sku}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400">
                                គ្មានជម្រើស (No Variants)
                            </div>
                        )}
                    </section>

                    {/* Dynamic Units of Measure Section */}
                    <section className="bg-white dark:bg-[#1a2634] p-6 rounded-xl border border-slate-200 dark:border-slate-700 custom-shadow">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white font-khmer">
                                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                ឯកតារង្វាស់ថាមវន្ត (Dynamic UOM)
                            </h3>
                        </div>

                        {/* Add New Unit Form */}
                        <div className="mb-6 p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-icons text-lg">add_circle</span>
                                បន្ថែមឯកតាថ្មី
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ឈ្មោះឯកតា <span className="text-red-500">*</span></label>
                                    <input 
                                        value={newUnit.name || ''} 
                                        onChange={e => setNewUnit({...newUnit, name: e.target.value})}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        type="text" 
                                        placeholder="ឧ. Case, Pack, Can"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ឯកតាជុំទាក់ទង <span className="text-red-500">*</span></label>
                                    <input 
                                        value={newUnit.multiplier || 1} 
                                        onChange={e => setNewUnit({...newUnit, multiplier: parseFloat(e.target.value) || 1})}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        type="number" 
                                        placeholder="ឧ. 24"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">តើមាន​វិឡ្ឡដ្ឋាននប៉ុន្មាននៅក្នុងបរិមាណនេះ?</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">តម្លៃលក់ ($) <span className="text-red-500">*</span></label>
                                    <input 
                                        value={newUnit.price || 0} 
                                        onChange={e => setNewUnit({...newUnit, price: parseFloat(e.target.value) || 0})}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        type="number" 
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">លេខកូដរបារ (ឯកតា)</label>
                                    <input 
                                        value={newUnit.barcode || ''} 
                                        onChange={e => setNewUnit({...newUnit, barcode: e.target.value})}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        type="text" 
                                        placeholder="ឯកៀប"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={handleAddUnit}
                                className="mt-4 w-full md:w-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center justify-center gap-2"
                            >
                                <span className="material-icons">add</span>
                                បន្ថែមឯកតា
                            </button>
                        </div>

                        {/* Units List */}
                        {units.length > 0 ? (
                            <div className="space-y-3">
                                {units.map((unit, index) => (
                                    <div key={unit.unitId} className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 hover:border-primary transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">ឈ្មោះឯកតា</p>
                                                    <p className="font-bold text-slate-900 dark:text-white mt-1">{unit.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">ឯកតាជុំទាក់ទង</p>
                                                    <p className="font-bold text-slate-900 dark:text-white mt-1">
                                                        1 {unit.name} = {unit.multiplier} base units
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">តម្លៃលក់</p>
                                                    <p className="font-bold text-primary mt-1">${unit.price.toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">លេខកូដរបារ</p>
                                                    <p className="font-semibold text-slate-900 dark:text-white mt-1">{unit.barcode || '-'}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveUnit(index)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors flex-shrink-0"
                                                title="Remove unit"
                                            >
                                                <span className="material-icons">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400">
                                គ្មានឯកតាបានបន្ថែម (No Units Added)
                            </div>
                        )}
                    </section>

                    {/* Batch Management Section (FEFO) */}
                    <section className="bg-white dark:bg-[#1a2634] p-6 rounded-xl border border-slate-200 dark:border-slate-700 custom-shadow">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white font-khmer">
                                <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                                ការគ្រប់គ្រងផ្នែក (Batch Management - FEFO)
                            </h3>
                        </div>

                        {/* Add New Batch Form */}
                        <div className="mb-6 p-4 border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-lg bg-orange-50 dark:bg-orange-900/10">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-icons text-lg">add_circle</span>
                                បន្ថែមផ្នែកថ្មី
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">លេខសម្គាល់ផ្នែក <span className="text-red-500">*</span></label>
                                    <input 
                                        value={newBatch.batchId || ''} 
                                        onChange={e => setNewBatch({...newBatch, batchId: e.target.value})}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        type="text" 
                                        placeholder="ឧ. B-001 (អាចលុបចោលក្នុងការគណនាស្វ័យប្រវត្ត)"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ឬលេខដាច់ដោយឡែកនឹងបង្កើតដោយស្វ័យប្រវត្ត</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">បរិមាណ (ឯកតាមូលដ្ឋាន) <span className="text-red-500">*</span></label>
                                    <input 
                                        value={newBatch.quantity || 0} 
                                        onChange={e => setNewBatch({...newBatch, quantity: parseFloat(e.target.value) || 0})}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        type="number" 
                                        placeholder="0"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">គិតក្នុងឯកតាមូលដ្ឋាន</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">កាលបរិច្ឆេទផុតកំណត់ <span className="text-red-500">*</span></label>
                                    <input 
                                        value={newBatch.expiryDate || ''} 
                                        onChange={e => setNewBatch({...newBatch, expiryDate: e.target.value})}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        type="date"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={handleAddBatch}
                                className="mt-4 w-full md:w-auto px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all font-medium flex items-center justify-center gap-2"
                            >
                                <span className="material-icons">add</span>
                                បន្ថែមផ្នែក
                            </button>
                        </div>

                        {/* Batches List */}
                        {batches.length > 0 ? (
                            <div className="space-y-3">
                                {batches.map((batch, index) => {
                                    const today = new Date();
                                    const expiryDate = new Date(batch.expiryDate);
                                    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                    const isNearExpiry = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                                    const isExpired = daysUntilExpiry <= 0;

                                    return (
                                        <div 
                                            key={`${batch.batchId}-${index}`} 
                                            className={`p-4 border rounded-lg transition-colors ${
                                                isExpired 
                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                                                    : isNearExpiry 
                                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                    : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">លេខសម្គាល់ផ្នែក</p>
                                                        <p className="font-bold text-slate-900 dark:text-white mt-1">{batch.batchId}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">បរិមាណ</p>
                                                        <p className="font-bold text-slate-900 dark:text-white mt-1">{batch.quantity} {baseUnit}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">កាលបរិច្ឆេទផុតកំណត់</p>
                                                        <p className={`font-bold mt-1 ${
                                                            isExpired 
                                                                ? 'text-red-600 dark:text-red-400' 
                                                                : isNearExpiry 
                                                                ? 'text-orange-600 dark:text-orange-400'
                                                                : 'text-slate-900 dark:text-white'
                                                        }`}>
                                                            {batch.expiryDate}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">ថ្ងៃនៅសល់</p>
                                                        <p className={`font-bold mt-1 ${
                                                            isExpired 
                                                                ? 'text-red-600 dark:text-red-400' 
                                                                : isNearExpiry 
                                                                ? 'text-orange-600 dark:text-orange-400'
                                                                : 'text-green-600 dark:text-green-400'
                                                        }`}>
                                                            {isExpired ? '⚠️ Expired' : isNearExpiry ? `⏰ ${daysUntilExpiry} days` : `✅ ${daysUntilExpiry} days`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleRemoveBatch(index)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors flex-shrink-0"
                                                    title="Remove batch"
                                                >
                                                    <span className="material-icons">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        <strong>✅ FEFO Status:</strong> ស្តុកសរុប = {stock} {baseUnit} | ផ្នែក = {batches.length} | គោលលទ្ធិ: ផ្នែកផុតកំណត់ដំបូងលេចឡើងមុនគេ
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-lg text-slate-500 dark:text-slate-400">
                                គ្មានផ្នែកបានបន្ថែម | ក្នុងករណីនេះ ស្តុកសរុបគឺឯករាយដែលបានបញ្ចូល (No Batches Added)
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: Media */}
                <div className="lg:col-span-1 space-y-8">
                    <section className="bg-white dark:bg-[#1a2634] p-6 rounded-xl border border-slate-200 dark:border-slate-700 custom-shadow">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white font-khmer">
                            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                            រូបភាពទំនិញ
                        </h3>
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary transition-colors cursor-pointer bg-slate-50 dark:bg-slate-800">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl">image</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 font-khmer">ចុចទីនេះ ដើម្បីបញ្ចូលរូបភាព</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ឬ អូសរូបភាពមកទីនេះ (JPG, PNG)</p>
                        </div>
                    </section>
                </div>
            </div>

            {/* Variant Modal */}
            {isVariantModalOpen && <VariantManagementModal variants={variants} onSave={setVariants} />}
        </div>
    );
};

export default ProductForm;