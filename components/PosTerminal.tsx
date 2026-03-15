import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { sendLowStockAlert } from '../utils/telegramAlert';

const PosTerminal: React.FC = () => {
    // ── Mobile Cart State ──
    const [showMobileCart, setShowMobileCart] = useState(false);
    
    // ── Modals & Scanning State ──
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [selectedVariantProduct, setSelectedVariantProduct] = useState<any>(null);
    const [selectedProductForUnit, setSelectedProductForUnit] = useState<any>(null);
    
    const barcodeInputRef = useRef<HTMLInputElement>(null);
    const barcodeBufferRef = useRef<string>('');
    const barcodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isEditingTax, setIsEditingTax] = useState<boolean>(false); 
    
    const { 
        user, logout, 
        products, categories, setProducts,
        searchQuery, setSearchQuery, 
        selectedCategory, setSelectedCategory,
        cart, addToCart, removeFromCart, updateQuantity, clearCart,
        cartTotal, taxAmount, finalTotal,
        setIsPaymentModalOpen,
        setCurrentView,
        posCustomer,
        setPosCustomer,
        customers,
        checkReceiptLimit,
        userPlan,
        isTaxEnabled, setIsTaxEnabled, taxRate, setTaxRate
    } = useData();

    // ── Logic Helpers ──
    const isProductOutOfStock = (product: any): boolean => {
        if (product.variants && product.variants.length > 0) {
            return product.variants.every((v: any) => (v.stock || 0) <= 0);
        }
        return (product.stock || 0) <= 0;
    };

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'All Items' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (product.nameKh && product.nameKh.includes(searchQuery)) ||
                              (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handleProductClick = (product: any) => {
        if (isProductOutOfStock(product)) return;
        
        if (product.variants && product.variants.length > 0) {
            setSelectedVariantProduct(product);
            setShowVariantModal(true);
            return;
        }

        if (product.units && product.units.length > 1) {
            setSelectedProductForUnit(product);
            setShowUnitModal(true);
        } else if (product.units && product.units.length === 1) {
            const unit = product.units[0];
            addToCart({ ...product, price: unit.price }, 1, {
                unitId: unit.unitId,
                selectedUnit: unit.name,
                multiplier: unit.multiplier,
                price: unit.price
            });
        } else {
            addToCart(product);
        }
    };

    const handleVariantSelect = (variant: any) => {
        if (selectedVariantProduct) {
            const cartItem = {
                ...selectedVariantProduct,
                variantId: variant.id, 
                name: `${selectedVariantProduct.name} (${variant.name})`,
                nameKh: `${selectedVariantProduct.nameKh || selectedVariantProduct.name} (${variant.name})`,
                price: variant.price, 
                sku: variant.sku, 
                stock: variant.stock, 
                units: [],
                variants: [],
            };
            addToCart(cartItem);
        }
        setShowVariantModal(false);
        setSelectedVariantProduct(null);
    };

    const handleUnitSelected = (unit: any) => {
        if (selectedProductForUnit) {
            addToCart({ ...selectedProductForUnit, price: unit.price }, 1, {
                unitId: unit.unitId,
                selectedUnit: unit.name,
                multiplier: unit.multiplier,
                price: unit.price
            });
        }
        setShowUnitModal(false);
        setSelectedProductForUnit(null);
    };

    const handleBarcodeScanned = (scannedBarcode: string) => {
        if (!scannedBarcode.trim()) return;

        let matchedProduct = null;
        let matchedUnit = null;

        for (const product of products) {
            const foundUnit = product.units?.find((u: any) => u.barcode === scannedBarcode);
            if (foundUnit) {
                matchedProduct = product;
                matchedUnit = foundUnit;
                break;
            }
        }

        if (!matchedProduct) {
            for (const product of products) {
                if (product.barcode === scannedBarcode || product.sku === scannedBarcode) {
                    matchedProduct = product;
                    break;
                }
            }
        }

        if (matchedProduct) {
            if (isProductOutOfStock(matchedProduct)) {
                alert(`សុំទោស! អស់ស្តុកហើយ: ${matchedProduct.name}`);
                return;
            }

            if (matchedUnit) {
                addToCart({ ...matchedProduct, price: matchedUnit.price }, 1, {
                    unitId: matchedUnit.unitId,
                    selectedUnit: matchedUnit.name,
                    multiplier: matchedUnit.multiplier,
                    price: matchedUnit.price
                });
            }
            else if (matchedProduct.units && matchedProduct.units.length > 1) {
                setSelectedProductForUnit(matchedProduct);
                setShowUnitModal(true);
            }
            else if (matchedProduct.units && matchedProduct.units.length === 1) {
                const unit = matchedProduct.units[0];
                addToCart({ ...matchedProduct, price: unit.price }, 1, {
                    unitId: unit.unitId,
                    selectedUnit: unit.name,
                    multiplier: unit.multiplier,
                    price: unit.price
                });
            } else {
                addToCart(matchedProduct);
            }
        } else {
            alert(`លេខកូដ: ${scannedBarcode} រកមិនឃើញក្នុងប្រព័ន្ធ`);
        }
    };

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (
                (e.target instanceof HTMLInputElement && e.target !== barcodeInputRef.current) ||
                e.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            if (e.key === 'Enter') {
                if (barcodeBufferRef.current.trim()) {
                    handleBarcodeScanned(barcodeBufferRef.current.trim());
                    barcodeBufferRef.current = '';
                }
                e.preventDefault();
            } else if (e.key.length === 1) {
                barcodeBufferRef.current += e.key;
                if (barcodeTimeoutRef.current) {
                    clearTimeout(barcodeTimeoutRef.current);
                }
                barcodeTimeoutRef.current = setTimeout(() => {
                    if (barcodeBufferRef.current.trim()) {
                        handleBarcodeScanned(barcodeBufferRef.current.trim());
                        barcodeBufferRef.current = '';
                    }
                }, 100);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            if (barcodeTimeoutRef.current) clearTimeout(barcodeTimeoutRef.current);
        };
    }, [products, addToCart]);
    
    const handleCheckout = async () => {
        if (!checkReceiptLimit('pos')) {
            alert("🔒 គណនី Free អាចកាត់វិក្កយបត្រ POS បានត្រឹមតែ ៥០ បុងប៉ុណ្ណោះ។ សូមដំឡើងកញ្ចប់!");
            return;
        }
        if (cart.length === 0) return;
        setIsPaymentModalOpen(true);
    };

    // Calculate total items for badge
    const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="flex flex-col h-[100dvh] overflow-hidden bg-slate-50 dark:bg-background-dark font-display text-slate-800 dark:text-slate-200">
            <input 
                ref={barcodeInputRef} 
                type="text" 
                style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} 
                aria-hidden="true"
                tabIndex={-1}
            />
            
            {/* ── HEADER (Global) ── */}
            <header className="h-16 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-3 sm:px-6 shrink-0 z-20 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* ✨ FIX 1: Modern Back Button */}
                    <button 
                        onClick={() => setCurrentView('dashboard')} 
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all mr-1"
                    >
                        <span className="material-icons-outlined text-xl">arrow_back</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">Q</div>
                        <h1 className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white truncate">SokBiz</h1>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700 cursor-pointer" onClick={logout}>
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[100px]">{user?.name}</p>
                            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{user?.role}</p>
                        </div>
                        {user?.avatar ? (
                            <img className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm" src={user.avatar} alt="Avatar" />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ── MAIN CONTENT AREA ── */}
            <div className="flex-1 flex overflow-hidden relative">
                
                {/* 🛒 LEFT PANE: Product Catalog */}
                <section className={`w-full lg:w-[70%] flex flex-col h-full bg-slate-50 dark:bg-background-dark border-r border-slate-200 dark:border-slate-700 relative ${showMobileCart ? 'hidden lg:flex' : 'flex'}`}>
                    
                    <div className="p-3 sm:p-4 pb-2 shrink-0 space-y-3 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800">
                        {/* ✨ FIX 2: Search Input Overlap */}
                        <div className="relative w-full">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <span className="material-icons-outlined text-slate-400">search</span>
                            </span>
                            <input 
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white placeholder-slate-400 font-khmer transition-all text-base sm:text-sm outline-none" 
                                placeholder="ស្វែងរកទំនិញ (Search)..." 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {/* Categories */}
                        <div className="flex gap-2 overflow-x-auto custom-scroll pb-1">
                            {categories.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 sm:px-5 py-2 rounded-xl font-medium shadow-sm whitespace-nowrap transition-all text-sm
                                        ${selectedCategory === cat 
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-y-auto custom-scroll p-3 sm:p-4 pb-28 lg:pb-4">
                        {filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400 mt-10">
                                <span className="material-icons-outlined text-6xl mb-2 opacity-50">inventory_2</span>
                                <p className="font-khmer text-sm">រកមិនឃើញទំនិញទេ</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                                {filteredProducts.map(product => {
                                    const isOutOfStock = isProductOutOfStock(product);
                                    return (
                                        <div 
                                            key={product.id}
                                            onClick={() => handleProductClick(product)}
                                            className={`bg-white dark:bg-surface-dark rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden border border-slate-100 dark:border-slate-800 relative flex flex-col ${isOutOfStock ? 'opacity-50 cursor-not-allowed grayscale-[50%]' : ''}`}
                                        >
                                            <div className="aspect-square bg-slate-50 dark:bg-slate-900 relative flex items-center justify-center overflow-hidden p-2">
                                                {product.image ? (
                                                    <img className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300" src={product.image} alt={product.name} />
                                                ) : (
                                                    <span className="material-icons-outlined text-slate-300 text-5xl">image</span>
                                                )}
                                                
                                                {/* Price Badge */}
                                                <div className="absolute bottom-2 right-2 bg-white/95 dark:bg-slate-900/95 px-2.5 py-1 rounded-lg text-sm font-bold text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-slate-800">
                                                    ${product.price.toFixed(2)}
                                                </div>

                                                {/* Stock Badges */}
                                                {isOutOfStock ? (
                                                    <div className="absolute top-2 left-2 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider font-khmer shadow-sm">
                                                        អស់ស្តុក
                                                    </div>
                                                ) : (product.stock || 0) <= 10 ? (
                                                    <div className="absolute top-2 left-2 bg-orange-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md font-khmer shadow-sm">
                                                        សល់ {product.stock}
                                                    </div>
                                                ) : null}
                                            </div>
                                            <div className="p-3 pt-2">
                                                <h3 className="font-khmer font-semibold text-slate-800 dark:text-slate-100 text-xs sm:text-sm line-clamp-2 leading-snug">{product.nameKh || product.name}</h3>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ✨ FIX 3: Floating Mobile Cart Button (Nham24 Style) */}
                    {!showMobileCart && (
                        <div className="lg:hidden absolute bottom-4 left-4 right-4 z-30 animate-in slide-in-from-bottom-5">
                            <button
                                onClick={() => setShowMobileCart(true)}
                                className={`w-full py-3.5 px-5 rounded-2xl font-bold flex justify-between items-center shadow-2xl active:scale-95 transition-all ${
                                    cart.length > 0 
                                    ? 'bg-slate-900 dark:bg-primary text-white' 
                                    : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 shadow-none'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <span className="material-icons-outlined text-[22px]">shopping_cart</span>
                                        {cart.length > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-slate-900 dark:border-primary">
                                                {totalItemsInCart}
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-khmer text-sm">មើលកន្ត្រក (View Cart)</span>
                                </div>
                                <span className="text-lg">${finalTotal.toFixed(2)}</span>
                            </button>
                        </div>
                    )}
                </section>

                {/* 🧾 RIGHT PANE: Cart & Checkout */}
                <section className={`w-full lg:w-[30%] bg-white dark:bg-surface-dark flex flex-col h-full shadow-2xl lg:shadow-none z-40 border-l border-slate-200 dark:border-slate-800 ${showMobileCart ? 'flex absolute inset-0 lg:static' : 'hidden lg:flex'}`}>
                    
                    {/* ✨ FIX 4: Cart Header (Mobile Friendly) */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-surface-dark shrink-0">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setShowMobileCart(false)} 
                                className="lg:hidden w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 transition-colors"
                            >
                                <span className="material-icons-outlined">expand_more</span>
                            </button>
                            <div>
                                <h2 className="font-bold text-lg text-slate-900 dark:text-white font-khmer">វិក្កយបត្រ</h2>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">
                                    {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={clearCart}
                            className="w-10 h-10 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-colors disabled:opacity-30" 
                            disabled={cart.length === 0}
                        >
                            <span className="material-icons-outlined">delete_sweep</span>
                        </button>
                    </div>

                    {/* Customer Selector */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                        <button
                            onClick={() => setShowCustomerModal(true)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                posCustomer 
                                    ? 'border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-500/10' 
                                    : 'border-dashed border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${posCustomer ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                                <span className="material-icons-outlined text-lg">{posCustomer ? 'person' : 'person_add'}</span>
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className={`text-sm font-bold font-khmer truncate ${posCustomer ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-600 dark:text-slate-400'}`}>
                                    {posCustomer ? posCustomer.name : 'អតិថិជនទូទៅ (Walk-in)'}
                                </p>
                                {posCustomer && <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 font-mono mt-0.5 truncate">{posCustomer.phone}</p>}
                            </div>
                            {posCustomer && (
                                <div
                                    onClick={(e) => { e.stopPropagation(); setPosCustomer(null); }}
                                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 rounded-full hover:bg-white/50 transition-colors shrink-0"
                                >
                                    <span className="material-icons-outlined text-sm">close</span>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-3">
                                    <span className="material-icons-outlined text-3xl opacity-50">shopping_basket</span>
                                </div>
                                <p className="text-sm font-medium font-khmer">មិនទាន់មានទំនិញ</p>
                            </div>
                        ) : (
                            cart.map((item: any) => {
                                const displayPrice = item.selectedUnitPrice || item.price;
                                const unitDisplay = item.selectedUnit ? ` (${item.selectedUnit})` : '';
                                return (
                                <div key={`${item.id}-${item.unitId || 'base'}`} className="flex gap-3 bg-white dark:bg-slate-800/30 p-2 rounded-xl border border-slate-100 dark:border-slate-800 group">
                                    {item.image ? (
                                        <img className="w-16 h-16 rounded-lg object-cover border border-slate-100 dark:border-slate-700 shrink-0" src={item.image} alt={item.name} />
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                            <span className="material-icons-outlined text-slate-400 text-xl">image</span>
                                        </div>
                                    )}
                                    <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="min-w-0">
                                                <h4 className="font-khmer font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">{item.nameKh || item.name}{unitDisplay}</h4>
                                                <p className="text-xs text-slate-500 font-mono mt-0.5">${displayPrice.toFixed(2)}</p>
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white text-sm shrink-0">${(displayPrice * item.quantity).toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg h-8">
                                                <button onClick={() => updateQuantity(item.id, -1, item.variantId, item.unitId)} className="w-8 h-full flex items-center justify-center text-slate-600 hover:text-primary transition-colors">-</button>
                                                <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1, item.variantId, item.unitId)} disabled={(item.stock || 0) <= item.quantity} className="w-8 h-full flex items-center justify-center text-slate-600 hover:text-primary disabled:opacity-30 transition-colors">+</button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id, item.variantId, item.unitId)} className="text-slate-300 hover:text-red-500 p-1.5 transition-colors">
                                                <span className="material-icons-outlined text-lg">delete_outline</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                );
                            })
                        )}
                    </div>

                    {/* Totals & Actions Footer */}
                    <div className="p-4 bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 shrink-0">
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                                <span className="font-khmer">សរុបរង (Subtotal)</span>
                                <span className="font-mono">${cartTotal.toFixed(2)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <span className="font-khmer">ពន្ធ (Tax)</span>
                                    <button onClick={() => setIsTaxEnabled(!isTaxEnabled)} className={`w-8 h-4 rounded-full relative transition-colors ${isTaxEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                        <span className={`absolute top-[2px] left-[2px] w-3 h-3 bg-white rounded-full transition-transform ${isTaxEnabled ? 'translate-x-4' : ''}`} />
                                    </button>
                                    {isTaxEnabled && (
                                        isEditingTax ? (
                                            <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} onBlur={() => setIsEditingTax(false)} onKeyDown={(e) => e.key === 'Enter' && setIsEditingTax(false)} autoFocus className="w-14 px-1 py-0.5 text-xs text-center border rounded bg-slate-50 outline-none focus:border-primary font-mono" min="0" max="100"/>
                                        ) : (
                                            <span onClick={() => setIsEditingTax(true)} className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded cursor-pointer hover:bg-primary/20 font-mono">
                                                {taxRate}% ✎
                                            </span>
                                        )
                                    )}
                                </div>
                                <span className={`font-mono ${isTaxEnabled ? 'text-slate-800 dark:text-slate-200' : 'line-through opacity-50'}`}>
                                    ${taxAmount.toFixed(2)}
                                </span>
                            </div>

                            <div className="border-t border-dashed border-slate-200 dark:border-slate-700 my-3"></div>
                            
                            <div className="flex justify-between items-end">
                                <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
                                <div className="text-right">
                                    <span className="text-primary font-bold text-3xl font-mono">${finalTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* ✨ FIX 5: Clean Payment Buttons Grid */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
                            <button className="flex flex-col items-center justify-center py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 dark:border-slate-700 transition-colors text-slate-600 dark:text-slate-300">
                                <span className="material-icons-outlined text-2xl mb-1">payments</span>
                                <span className="text-[10px] font-bold tracking-wider">CASH</span>
                            </button>
                            <button className="flex flex-col items-center justify-center py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50 hover:text-purple-600 border border-slate-100 dark:border-slate-700 transition-colors text-slate-600 dark:text-slate-300">
                                <span className="material-icons-outlined text-2xl mb-1">qr_code_scanner</span>
                                <span className="text-[10px] font-bold tracking-wider">KHQR</span>
                            </button>
                            <button className="flex flex-col items-center justify-center py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 hover:text-blue-600 border border-slate-100 dark:border-slate-700 transition-colors text-slate-600 dark:text-slate-300">
                                <span className="material-icons-outlined text-2xl mb-1">credit_card</span>
                                <span className="text-[10px] font-bold tracking-wider">CARD</span>
                            </button>
                        </div>

                        <button 
                            onClick={handleCheckout}
                            disabled={cart.length === 0}
                            className={`w-full py-4 rounded-xl shadow-lg font-khmer font-bold text-lg transition-all active:scale-[0.98]
                                ${cart.length === 0 ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed dark:bg-slate-800 dark:text-slate-600' : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-primary dark:hover:bg-primary-dark'}
                            `}
                        >
                            គិតលុយ (Checkout)
                        </button>
                    </div>
                </section>
            </div>

            {/* ── MODALS (រក្សាទុក Logic ដដែល ១០០%) ── */}
            {/* Unit Modal */}
            {showUnitModal && selectedProductForUnit && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white font-khmer">ជ្រើសរើសខ្នាត</h3>
                                <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{selectedProductForUnit.nameKh}</p>
                            </div>
                            <button onClick={() => setShowUnitModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                <span className="material-icons-outlined text-sm">close</span>
                            </button>
                        </div>
                        <div className="space-y-2">
                            {selectedProductForUnit.units?.map((unit: any) => (
                                <button key={unit.unitId} onClick={() => handleUnitSelected(unit)} className="w-full p-4 text-left border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary hover:bg-primary/5 transition-all">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-slate-900 dark:text-white">{unit.name}</h4>
                                        <p className="font-bold text-primary font-mono">${unit.price.toFixed(2)}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Variant Modal */}
            {showVariantModal && selectedVariantProduct && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-sm max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-5 shrink-0">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white font-khmer">ជ្រើសរើសប្រភេទ</h3>
                                <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{selectedVariantProduct.nameKh}</p>
                            </div>
                            <button onClick={() => setShowVariantModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 shrink-0">
                                <span className="material-icons-outlined text-sm">close</span>
                            </button>
                        </div>
                        <div className="space-y-2 overflow-y-auto custom-scroll pr-1 flex-1 pb-4">
                            {selectedVariantProduct.variants?.map((variant: any) => {
                                const isVariantOutOfStock = (variant.stock || 0) <= 0;
                                const isExpired = variant.expiryDate ? variant.expiryDate < new Date().toISOString().split('T')[0] : false;
                                return (
                                    <button key={variant.id} onClick={() => !isVariantOutOfStock && !isExpired && handleVariantSelect(variant)} disabled={isVariantOutOfStock || isExpired}
                                        className={`w-full p-4 text-left border rounded-xl transition-all ${isVariantOutOfStock || isExpired ? 'border-slate-100 bg-slate-50 opacity-60' : 'border-slate-200 hover:border-primary hover:bg-primary/5'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">{variant.name}</h4>
                                                <p className={`text-xs mt-1 font-mono ${isVariantOutOfStock ? 'text-red-500 font-bold' : 'text-slate-500'}`}>Stock: {variant.stock || 0}</p>
                                            </div>
                                            <p className="font-bold text-primary font-mono">${variant.price.toFixed(2)}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Modal */}
            {showCustomerModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-md max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-5 shrink-0">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white font-khmer">ជ្រើសរើសអតិថិជន</h3>
                            <button onClick={() => setShowCustomerModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                <span className="material-icons-outlined text-sm">close</span>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scroll space-y-2 mb-4">
                            {customers.map(customer => (
                                <button key={customer.id} onClick={() => { setPosCustomer(customer); setShowCustomerModal(false); }}
                                    className={`w-full p-3 text-left border rounded-xl flex items-center gap-3 transition-colors ${posCustomer?.id === customer.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-400'}`}>
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">{customer.name.substring(0, 2).toUpperCase()}</div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-sm text-slate-900 truncate font-khmer">{customer.name}</h4>
                                        <p className="text-xs text-slate-500 font-mono mt-0.5">{customer.phone}</p>
                                    </div>
                                    {posCustomer?.id === customer.id && <span className="material-icons-outlined text-indigo-600">check_circle</span>}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => { setPosCustomer(null); setShowCustomerModal(false); }} className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold font-khmer hover:bg-slate-200 transition-colors shrink-0">
                            អតិថិជនទូទៅ (Walk-in)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PosTerminal;