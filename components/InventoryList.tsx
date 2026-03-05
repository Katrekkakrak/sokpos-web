import React, { useState } from 'react';
import { useData, Product } from '../context/DataContext';
import { sendLowStockAlert } from '../utils/telegramAlert';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../src/config/firebase';

const InventoryList: React.FC = () => {
    const { products, setCurrentView, setEditingProduct, user } = useData();
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                              p.sku?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = filterCategory === '' || p.category.toLowerCase().includes(filterCategory.toLowerCase());
        const matchesStatus = filterStatus === '' || 
                              (filterStatus === 'instock' && p.status === 'In Stock') ||
                              (filterStatus === 'lowstock' && p.status === 'Low Stock') ||
                              (filterStatus === 'outstock' && p.status === 'Out of Stock');
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setCurrentView('product-form');
    };

    const handleAdd = () => {
        setEditingProduct(null); // Clear for new
        setCurrentView('product-form');
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filteredProducts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredProducts.map(p => p.id as string));
        }
    };

    const handleSelectProduct = (productId: string) => {
        setSelectedIds(prev => 
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleDelete = async (product: Product) => {
        if (!window.confirm('តើអ្នកពិតជាចង់លុបទំនិញនេះមែនទេ? (Are you sure you want to delete this product?)')) {
            return;
        }

        if (!user || !user.uid) {
            alert('Error: User not authenticated. Please log in again.');
            return;
        }

        try {
            await deleteDoc(doc(db, 'tenants', user.uid, 'products', String(product.id)));
            alert(`✅ Product "${product.name}" deleted successfully!`);
        } catch (error: any) {
            console.error('Error deleting product:', error);
            alert(`❌ Failed to delete product "${product.name}": ${error.message}`);
        }
    };

    const handleTestTelegram = async () => {
        const success = await sendLowStockAlert('Iced Latte (Test)', 5, 'DRK-001');
        if (success) {
            alert('✅ សារតេស្តបានបញ្ជូនទៅ Telegram ជោគជ័យ!');
        } else {
            alert('❌ មានបញ្ហាក្នុងការបញ្ជូនសារ សូមឆែកមើល Console!');
        }
    };

    // Calculate dynamic counts for summary cards
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(p => {
        const totalStock = p.variants?.length ? p.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) : (Number(p.stock) || 0);
        
        if (totalStock <= 0) {
            outOfStockCount++;
        } else if (totalStock <= ((p as any).lowStockThreshold || 5)) {
            lowStockCount++;
        }
    });

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
            {/* Mobile Header */}
            <header className="lg:hidden h-16 bg-white dark:bg-[#1a2634] border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <span className="material-icons">menu</span>
                    </button>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">SokBiz KH</span>
                </div>
                <div className="bg-primary/10 p-1.5 rounded-full">
                    <span className="material-icons text-primary text-xl">notifications</span>
                </div>
            </header>

            {/* Main Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-7xl mx-auto flex flex-col gap-6">
                    {/* Breadcrumbs & Header */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <a href="#" onClick={() => setCurrentView('dashboard')} className="hover:text-primary transition-colors font-khmer">ទំព័រដើម (Home)</a>
                            <span className="material-icons text-[16px]">chevron_right</span>
                            <span className="text-slate-800 dark:text-slate-200 font-medium font-khmer">បញ្ជីទំនិញ (Product List)</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-khmer mb-1">បញ្ជីទំនិញ (Product List)</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-khmer">គ្រប់គ្រងស្តុក និងតម្លៃទំនិញទាំងអស់នៅទីនេះ</p>
                            </div>
                            <div className="flex gap-3">
                                <button className="bg-white dark:bg-[#1a2634] border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-sm">
                                    <span className="material-icons text-[20px]">file_download</span>
                                    <span className="font-khmer text-sm font-medium">នាំចេញ (Export)</span>
                                </button>
                                <button onClick={handleTestTelegram} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-sm">
                                    <span className="material-icons text-[20px]">send</span>
                                    <span className="font-khmer text-sm font-medium">Test Telegram</span>
                                </button>
                                {user?.role !== 'online_sales' && (
                                <button onClick={handleAdd} className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-primary/20">
                                    <span className="material-icons text-[20px]">add</span>
                                    <span className="font-khmer text-sm font-medium">បន្ថែមទំនិញ (Add Product)</span>
                                </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">ទំនិញសរុប (Total)</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{products.length}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
                                <span className="material-icons">inventory_2</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">តម្លៃសរុប (Value)</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">${products.reduce((acc, p) => {
                                    if (p.variants && p.variants.length > 0) {
                                        const variantValue = p.variants.reduce((vSum, v) => vSum + ((Number(v.price) || 0) * (Number(v.stock) || 0)), 0);
                                        return acc + variantValue;
                                    }
                                    return acc + ((Number(p.price) || 0) * (Number(p.stock) || 0));
                                }, 0).toLocaleString()}</h3>
                            </div>
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
                                <span className="material-icons">payments</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">ជិតអស់ស្តុក (Low)</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{lowStockCount}</h3>
                            </div>
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600">
                                <span className="material-icons">warning</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">អស់ស្តុក (Out)</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{outOfStockCount}</h3>
                            </div>
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600">
                                <span className="material-icons">block</span>
                            </div>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="bg-white dark:bg-[#1a2634] p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative flex items-center">
                            <span className="material-icons absolute left-3 text-slate-400 pointer-events-none">search</span>
                            <input 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none font-khmer dark:text-white placeholder:text-slate-400" 
                                placeholder="ស្វែងរកទំនិញ (Search product name, SKU)..." 
                                type="text"
                            />
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <div className="relative min-w-[180px] w-full md:w-auto flex items-center">
                                <select 
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full appearance-none pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none font-khmer text-slate-700 dark:text-slate-200 cursor-pointer"
                                >
                                    <option value="">គ្រប់ប្រភេទ (All Categories)</option>
                                    <option value="drinks">ភេសជ្ជៈ (Drinks)</option>
                                    <option value="food">អាហារ (Food)</option>
                                    <option value="electronics">គ្រឿងអេឡិចត្រូនិច (Electronics)</option>
                                    <option value="clothing">សម្លៀកបំពាក់ (Clothing)</option>
                                </select>
                                <span className="material-icons absolute right-3 text-slate-400 pointer-events-none text-xl">keyboard_arrow_down</span>
                            </div>
                            <div className="relative min-w-[180px] w-full md:w-auto flex items-center">
                                <select 
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full appearance-none pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none font-khmer text-slate-700 dark:text-slate-200 cursor-pointer"
                                >
                                    <option value="">គ្រប់ស្ថានភាព (All Status)</option>
                                    <option value="instock">មានស្តុក (In Stock)</option>
                                    <option value="lowstock">ជិតអស់ស្តុក (Low Stock)</option>
                                    <option value="outstock">អស់ស្តុក (Out of Stock)</option>
                                </select>
                                <span className="material-icons absolute right-3 text-slate-400 pointer-events-none text-xl">filter_list</span>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white dark:bg-[#1a2634] border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-khmer min-w-[50px]">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary cursor-pointer"
                                            />
                                        </th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-khmer min-w-[100px]">រូបភាព (Image)</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-khmer min-w-[250px]">ឈ្មោះទំនិញ (Product Name)</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-khmer min-w-[150px]">ប្រភេទទំនិញ (Category)</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-khmer min-w-[130px]">ថ្លៃដើម (Cost)</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-khmer min-w-[150px]">តម្លៃលក់ (Price)</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-khmer min-w-[150px]">ស្តុកសរុប (Stock)</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-khmer min-w-[150px]">ស្ថានភាព (Status)</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-khmer min-w-[180px]">📅 កាលបរិច្ឆេទផុតកំណត់ (Expiry)</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right min-w-[120px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {filteredProducts.map(product => {
                                        const totalStock = product.variants?.length ? product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) : (product.stock || 0);
                                        
                                        let dynamicStatus = 'In Stock';
                                        if (totalStock <= 0) {
                                            dynamicStatus = 'Out of Stock';
                                        } else if (totalStock <= ((product as any).lowStockThreshold || 5)) {
                                            dynamicStatus = 'Low Stock';
                                        }

                                        return (
                                        <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="p-4">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.includes(product.id as string)}
                                                    onChange={() => handleSelectProduct(product.id as string)}
                                                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary cursor-pointer"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600">
                                                    <img 
                                                        alt={product.name} 
                                                        className="h-full w-full object-cover" 
                                                        src={product.image}
                                                        onError={(e) => {
                                                          const img = e.target as HTMLImageElement;
                                                          img.style.display = 'none';
                                                          const parent = img.parentElement;
                                                          if (parent && !parent.querySelector('[data-fallback-icon]')) {
                                                            const fallback = document.createElement('span');
                                                            fallback.setAttribute('data-fallback-icon', 'true');
                                                            fallback.className = 'material-icons text-slate-400 text-6xl';
                                                            fallback.textContent = 'image';
                                                            parent.appendChild(fallback);
                                                          }
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-900 dark:text-white font-medium text-sm">{product.name}</span>
                                                    <span className="text-slate-500 dark:text-slate-400 text-xs">SKU: {product.sku}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-slate-900 dark:text-white font-medium text-sm">{product.category || 'General'}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-slate-900 dark:text-white font-medium">{product.cost ? '$' + product.cost.toFixed(2) : '$0.00'}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-slate-900 dark:text-white font-medium">
                                                    {(() => {
                                                        if (product.variants && product.variants.length > 0) {
                                                            const variantPrices = product.variants.map(v => Number(v.price) || 0);
                                                            const minPrice = Math.min(...variantPrices);
                                                            const maxPrice = Math.max(...variantPrices);
                                                            return minPrice === maxPrice ? `$${minPrice.toFixed(2)}` : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
                                                        }
                                                        return `$${(Number(product.price) || 0).toFixed(2)}`;
                                                    })()}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-900 dark:text-white font-medium">{totalStock} PCS</span>
                                                    <span className="text-slate-500 dark:text-slate-400 text-xs">{product.variants?.length ? `${product.variants.length} Variants` : 'Single Item'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                                                    ${dynamicStatus === 'In Stock' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' : ''}
                                                    ${dynamicStatus === 'Low Stock' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' : ''}
                                                    ${dynamicStatus === 'Out of Stock' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' : ''}
                                                `}>
                                                    <span className={`w-1.5 h-1.5 rounded-full 
                                                        ${dynamicStatus === 'In Stock' ? 'bg-green-600 dark:bg-green-400' : ''}
                                                        ${dynamicStatus === 'Low Stock' ? 'bg-amber-600 dark:bg-amber-400' : ''}
                                                        ${dynamicStatus === 'Out of Stock' ? 'bg-red-600 dark:bg-red-400' : ''}
                                                    `}></span>
                                                    {dynamicStatus === 'In Stock' && 'មានស្តុក (In Stock)'}
                                                    {dynamicStatus === 'Low Stock' && 'ជិតអស់ស្តុក (Low)'}
                                                    {dynamicStatus === 'Out of Stock' && 'អស់ស្តុក (Out)'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {(() => {
                                                    if (!product.batches || product.batches.length === 0) {
                                                        return <span className="text-slate-400 dark:text-slate-500 text-sm">-</span>;
                                                    }
                                                    
                                                    const sortedBatches = [...product.batches].sort((a, b) => 
                                                        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
                                                    );
                                                    const nearestBatch = sortedBatches[0];
                                                    const today = new Date();
                                                    const expiryDate = new Date(nearestBatch.expiryDate);
                                                    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                                    const isExpired = daysUntilExpiry <= 0;
                                                    const isNearExpiry = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

                                                    return (
                                                        <div className="flex flex-col">
                                                            <span className={`text-sm font-semibold ${
                                                                isExpired 
                                                                    ? 'text-red-600 dark:text-red-400' 
                                                                    : isNearExpiry 
                                                                    ? 'text-orange-600 dark:text-orange-400'
                                                                    : 'text-green-600 dark:text-green-400'
                                                            }`}>
                                                                {nearestBatch.expiryDate}
                                                            </span>
                                                            <span className={`text-xs font-medium ${
                                                                isExpired 
                                                                    ? 'text-red-600 dark:text-red-400' 
                                                                    : isNearExpiry 
                                                                    ? 'text-orange-600 dark:text-orange-400'
                                                                    : 'text-green-600 dark:text-green-400'
                                                            }`}>
                                                                {isExpired ? '⚠️ Expired' : isNearExpiry ? `⏰ ${daysUntilExpiry} days` : `✅ ${daysUntilExpiry} days`}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="p-4">
                                                {user?.role !== 'online_sales' && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleEdit(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit Product">
                                                        <span className="material-icons text-[20px]">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDelete(product)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Product">
                                                        <span className="material-icons text-[20px]">delete</span>
                                                    </button>
                                                </div>
                                                )}
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination - Static for now */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-slate-500 dark:text-slate-400 font-khmer">
                                បង្ហាញ <span className="font-bold text-slate-900 dark:text-white font-sans">1</span> ដល់ <span className="font-bold text-slate-900 dark:text-white font-sans">{Math.min(filteredProducts.length, 10)}</span> នៃ <span className="font-bold text-slate-900 dark:text-white font-sans">{filteredProducts.length}</span> ទំនិញ
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
                                    <span className="material-icons">chevron_left</span>
                                </button>
                                <button className="px-3 py-1 rounded-lg bg-primary text-white text-sm font-medium">1</button>
                                <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <span className="material-icons">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryList;