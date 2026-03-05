
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { sendLowStockAlert } from '../utils/telegramAlert';

const PosTerminal: React.FC = () => {
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [selectedVariantProduct, setSelectedVariantProduct] = useState<any>(null);
    const [selectedProductForUnit, setSelectedProductForUnit] = useState<any>(null);
    const barcodeInputRef = useRef<HTMLInputElement>(null);
    const barcodeBufferRef = useRef<string>('');
    const barcodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isEditingTax, setIsEditingTax] = useState<boolean>(false); // សម្រាប់ចុចកែភាគរយ
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

    // Helper function to determine if a product is out of stock, considering variants.
    const isProductOutOfStock = (product: any): boolean => {
        // Rule 2: It has variants, AND every variant's stock is <= 0.
        if (product.variants && product.variants.length > 0) {
            return product.variants.every((v: any) => (v.stock || 0) <= 0);
        }
        // Rule 1: It has no variants AND (product.stock || 0) <= 0.
        return (product.stock || 0) <= 0;
    };

    // Filter products based on search and category
    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'All Items' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              product.nameKh.includes(searchQuery) ||
                              (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handleProductClick = (product: any) => {
        // Prevent adding if out of stock using the new variant-aware logic
        if (isProductOutOfStock(product)) {
            return;
        }
        
        // If product has variants, show variant selection modal
        if (product.variants && product.variants.length > 0) {
            setSelectedVariantProduct(product);
            setShowVariantModal(true);
            return;
        }

        // If product has multiple units, show unit selection modal
        if (product.units && product.units.length > 1) {
            setSelectedProductForUnit(product);
            setShowUnitModal(true);
        } else if (product.units && product.units.length === 1) {
            // Single unit - add directly with unit data
            const unit = product.units[0];
            addToCart({ ...product, price: unit.price }, 1, {
                unitId: unit.unitId,
                selectedUnit: unit.name,
                multiplier: unit.multiplier,
                price: unit.price
            });
        } else {
            // No units defined - add directly (backward compatibility)
            addToCart(product);
        }
    };

    const handleVariantSelect = (variant: any) => {
        if (selectedVariantProduct) {
            // Create a new product object for the cart that represents the selected variant
            const cartItem = {
                ...selectedVariantProduct,
                variantId: variant.id, // Add variant ID
                name: `${selectedVariantProduct.name} (${variant.name})`,
                nameKh: `${selectedVariantProduct.nameKh || selectedVariantProduct.name} (${variant.name})`,
                price: variant.price, // CRITICAL: Override price
                sku: variant.sku, // Override SKU
                stock: variant.stock, // Use variant's stock
                // Reset units/variants on the cart item to avoid confusion
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
            // By spreading the product and overriding the price, we ensure the cart total is calculated correctly.
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

    // --- BARCODE SCANNING LOGIC ---
    // Handles unit-specific barcode scanning with priority fallback
    const handleBarcodeScanned = (scannedBarcode: string) => {
        if (!scannedBarcode.trim()) return;

        let matchedProduct = null;
        let matchedUnit = null;

        // Priority 1: Check if barcode matches a specific unit's barcode
        for (const product of products) {
            const foundUnit = product.units?.find((u: any) => u.barcode === scannedBarcode);
            if (foundUnit) {
                matchedProduct = product;
                matchedUnit = foundUnit;
                break;
            }
        }

        // Priority 2: Fallback to main product barcode or SKU
        if (!matchedProduct) {
            for (const product of products) {
                if (product.barcode === scannedBarcode || product.sku === scannedBarcode) {
                    matchedProduct = product;
                    break;
                }
            }
        }

        // Action Logic:
        if (matchedProduct) {
            // Check if out of stock using the new variant-aware logic
            if (isProductOutOfStock(matchedProduct)) {
                console.warn(`❌ Barcode matched but product is out of stock: ${scannedBarcode}`);
                alert(`សូមស្វាគមន៍! ក្នុងទំនិញ: ${matchedProduct.name}`);
                return;
            }

            // Case 1: Unit-specific barcode matched
            if (matchedUnit) {
                console.log(`✅ Unit barcode matched: ${matchedProduct.name} (${matchedUnit.name})`);
                addToCart({ ...matchedProduct, price: matchedUnit.price }, 1, {
                    unitId: matchedUnit.unitId,
                    selectedUnit: matchedUnit.name,
                    multiplier: matchedUnit.multiplier,
                    price: matchedUnit.price
                });
            }
            // Case 2: Product matched with multiple units - show modal
            else if (matchedProduct.units && matchedProduct.units.length > 1) {
                console.log(`✅ Product barcode matched (multiple units): ${matchedProduct.name}`);
                setSelectedProductForUnit(matchedProduct);
                setShowUnitModal(true);
            }
            // Case 3: Product matched with single unit or no units
            else if (matchedProduct.units && matchedProduct.units.length === 1) {
                console.log(`✅ Product barcode matched (single unit): ${matchedProduct.name}`);
                const unit = matchedProduct.units[0];
                addToCart({ ...matchedProduct, price: unit.price }, 1, {
                    unitId: unit.unitId,
                    selectedUnit: unit.name,
                    multiplier: unit.multiplier,
                    price: unit.price
                });
            } else {
                console.log(`✅ Product barcode matched (no units): ${matchedProduct.name}`);
                addToCart(matchedProduct);
            }
        } else {
            console.warn(`❌ Barcode not found in system: ${scannedBarcode}`);
            alert(`លេខកូដ: ${scannedBarcode} រកមិនឃើញក្នុងប្រព័ន្ធ (Barcode not found)`);
        }
    };

    // Listen for barcode scanner input (typically triggers on Enter)
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Only process if focus is not on a text input (except the hidden barcode input)
            if (
                (e.target instanceof HTMLInputElement && e.target !== barcodeInputRef.current) ||
                e.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            // Every keystroke adds to buffer
            if (e.key === 'Enter') {
                // Barcode complete (scanner typically sends Enter at the end)
                if (barcodeBufferRef.current.trim()) {
                    handleBarcodeScanned(barcodeBufferRef.current.trim());
                    barcodeBufferRef.current = '';
                }
                e.preventDefault();
            } else if (e.key.length === 1) {
                // Accumulate scannable characters
                barcodeBufferRef.current += e.key;

                // Reset timeout on each keystroke
                if (barcodeTimeoutRef.current) {
                    clearTimeout(barcodeTimeoutRef.current);
                }

                // Clear buffer if no input for 100ms (indicates end of scan)
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
        // Check receipt limit for POS
        if (!checkReceiptLimit('pos')) {
            alert("🔒 គណនី Free អាចកាត់វិក្កយបត្រ POS បានត្រឹមតែ ៥០ បុងប៉ុណ្ណោះ។ សូមដំឡើងកញ្ចប់ ដើម្បីបន្តការលក់គ្មានដែនកំណត់!");
            return;
        }

        if (cart.length === 0) return;
        // Simply open payment modal - stock deduction happens after payment confirmation
        setIsPaymentModalOpen(true);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
            {/* Hidden Barcode Scanner Input */}
            <input 
                ref={barcodeInputRef} 
                type="text" 
                style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} 
                aria-hidden="true"
                tabIndex={-1}
            />
            
            {/* Header */}
            <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setCurrentView('dashboard')} 
                        className="flex items-center gap-1 text-slate-500 hover:text-primary mr-4 transition-colors"
                        title="Back to Dashboard"
                    >
                        <span className="material-icons text-xl">arrow_back</span>
                        <span className="text-sm font-khmer hidden sm:inline">ត្រឡប់ (Back)</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-lg">Q</div>
                        <h1 className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">SokBiz <span className="text-primary font-khmer font-normal text-sm opacity-80">ខេអេច</span></h1>
                    </div>
                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Online
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
                        <span className="material-icons text-gray-500 dark:text-gray-400">notifications</span>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark"></span>
                    </button>
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700 cursor-pointer" onClick={logout} title="Click to Logout">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
                        </div>
                        {user?.avatar ? (
                            <img 
                                className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-600" 
                                src={user.avatar}
                                alt="Cashier" 
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT PANE: Product Catalog (70%) */}
                <section className="w-[70%] flex flex-col h-full bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-700 relative">
                    {/* Filters & Search */}
                    <div className="p-4 pb-2 shrink-0 space-y-4">
                        {/* Search */}
                        <div className="relative w-full">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-icons text-gray-400">search</span>
                            </span>
                            <input 
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-none bg-surface-light dark:bg-surface-dark shadow-sm focus:ring-2 focus:ring-primary text-gray-900 dark:text-white placeholder-gray-400 font-khmer transition-all" 
                                placeholder="Search products... / ស្វែងរកទំនិញ..." 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {/* Categories */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            {categories.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-2.5 rounded-lg font-medium shadow-sm whitespace-nowrap transition-transform active:scale-95 border 
                                        ${selectedCategory === cat 
                                            ? 'bg-primary text-white border-primary' 
                                            : 'bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-700'
                                        }`}
                                >
                                    {cat === 'Drinks' && <span className="flex items-center gap-2"><span className="material-icons text-sm">local_cafe</span> Drinks</span>}
                                    {cat === 'Food' && <span className="flex items-center gap-2"><span className="material-icons text-sm">restaurant</span> Food</span>}
                                    {cat === 'Dessert' && <span className="flex items-center gap-2"><span className="material-icons text-sm">cake</span> Dessert</span>}
                                    {cat === 'Ice Cream' && <span className="flex items-center gap-2"><span className="material-icons text-sm">icecream</span> Ice Cream</span>}
                                    {cat === 'All Items' && 'All Items'}
                                    {!['Drinks', 'Food', 'Dessert', 'Ice Cream', 'All Items'].includes(cat) && cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Product Grid */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pt-0">
                        {filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400 mt-10">
                                <span className="material-icons text-6xl mb-2 opacity-50">search_off</span>
                                <p>No products found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {filteredProducts.map(product => {
                                    const isOutOfStock = isProductOutOfStock(product);
                                    return (
                                        <div 
                                            key={product.id}
                                            onClick={() => handleProductClick(product)}
                                            className={`bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden border border-transparent hover:border-primary/30 relative ${isOutOfStock ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="aspect-square bg-gray-100 relative flex items-center justify-center">
                                                {product.image ? (
                                                    <img className="w-full h-full object-cover" src={product.image} alt={product.name} />
                                                ) : (
                                                    <span className="material-icons text-gray-300 dark:text-gray-600 text-4xl">image_not_supported</span>
                                                )}
                                                <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-black/80 px-2 py-1 rounded text-xs font-bold text-gray-800 dark:text-white backdrop-blur-sm shadow-sm">
                                                    ${product.price.toFixed(2)}
                                                </div>
                                                {isOutOfStock && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Out of Stock</span>
                                                    </div>
                                                )}
                                                {!isOutOfStock && (product.stock || 0) <= 10 && (
                                                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                                        Only {product.stock} left
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3">
                                                <h3 className="font-khmer font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{product.nameKh}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{product.name}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* RIGHT PANE: Cart & Checkout (30%) */}
                <section className="w-[30%] bg-surface-light dark:bg-surface-dark flex flex-col h-full shadow-xl z-10 border-l border-gray-200 dark:border-gray-700">
                    {/* Cart Header */}
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-surface-light dark:bg-surface-dark">
                        <div>
                            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Current Order</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <span className="material-icons text-sm">schedule</span> {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                        <button 
                            onClick={clearCart}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors disabled:opacity-50" 
                            title="Clear Cart"
                            disabled={cart.length === 0}
                        >
                            <span className="material-icons">delete_sweep</span>
                        </button>
                    </div>

                    {/* Customer Selector */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-surface-light dark:bg-surface-dark">
                        <button
                            onClick={() => setShowCustomerModal(true)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                posCustomer 
                                    ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                                    : 'border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-900/30'
                            }`}
                        >
                            <span className="material-icons text-xl">{posCustomer ? 'person_check' : 'person_add'}</span>
                            <div className="text-left flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {posCustomer ? posCustomer.name : 'Walk-in Customer'}
                                </p>
                                {posCustomer && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{posCustomer.phone}</p>
                                )}
                            </div>
                            {posCustomer && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPosCustomer(null);
                                    }}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                    title="Clear customer"
                                >
                                    <span className="material-icons text-sm">close</span>
                                </button>
                            )}
                        </button>
                    </div>
                    
                    {/* Customer Selector (Dynamic) */}
                    <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-background-dark/50">
                        <button className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
                            <div className="flex items-center gap-2">
                                <span className={`material-icons text-lg ${posCustomer ? 'text-blue-500' : 'text-gray-400'}`}>person</span>
                                {posCustomer ? (
                                    <span className="font-bold text-blue-600 dark:text-blue-400 font-khmer">{posCustomer.name}</span>
                                ) : (
                                    <span>Walk-in Customer</span>
                                )}
                            </div>
                            <span className="material-icons text-gray-400 text-sm">chevron_right</span>
                        </button>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-white dark:bg-surface-dark">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-fade-in-up">
                                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                            <span className="material-icons text-4xl text-gray-300 dark:text-gray-600">shopping_cart</span>
                                </div>
                                <p className="text-sm font-medium">Cart is empty</p>
                                <p className="text-xs mt-1">Select products to add</p>
                            </div>
                        ) : (
                                    cart.map((item: any) => {
                                const displayPrice = item.selectedUnitPrice || item.price;
                                const unitDisplay = item.selectedUnit ? ` (${item.selectedUnit})` : '';
                                return (
                                <div key={`${item.id}-${item.unitId || 'base'}`} className="flex gap-3 group animate-in slide-in-from-right-4 duration-300">
                                    {item.image ? (
                                        <img className="w-14 h-14 rounded-lg object-cover border border-gray-100 dark:border-gray-700" src={item.image} alt={item.name} />
                                    ) : (
                                        <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center flex-shrink-0">
                                            <span className="material-icons text-gray-400">image</span>
                                        </div>
                                    )}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-khmer font-medium text-sm text-gray-900 dark:text-white line-clamp-1">{item.nameKh}{unitDisplay}</h4>
                                                <p className="text-xs text-gray-500">${displayPrice.toFixed(2)} / {item.selectedUnit || 'unit'}</p>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">${(displayPrice * item.quantity).toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg h-7">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, -1, item.variantId, item.unitId)} 
                                                    className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-primary hover:bg-white dark:hover:bg-gray-700 rounded-l-lg transition-all"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center text-sm font-semibold text-gray-800 dark:text-gray-200">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, 1, item.variantId, item.unitId)} 
                                                    className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-primary hover:bg-white dark:hover:bg-gray-700 rounded-r-lg transition-all"
                                                    disabled={(item.stock || 0) <= item.quantity}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => removeFromCart(item.id, item.variantId, item.unitId)}
                                                className="text-gray-400 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <span className="material-icons text-sm">close</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                );
                            })
                        )}
                    </div>

                    {/* Totals & Actions Sticky Footer */}
                    <div className="p-5 bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 space-y-4 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
                        {/* Calculation Rows */}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                <span className="font-khmer">សរុបរង (Subtotal)</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">${cartTotal.toFixed(2)}</span>
                            </div>
                            
                            {/* 💡 ជួរគិតពន្ធ (Interactive Tax Row) */}
                            <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <span className="font-khmer">ពន្ធ (Tax)</span>
                                    
                                    {/* ប៊ូតុង Toggle បើក/បិទ ពន្ធ */}
                                    <button
                                        onClick={() => setIsTaxEnabled(!isTaxEnabled)}
                                        className={`w-8 h-4 rounded-full relative transition-colors ${isTaxEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isTaxEnabled ? 'translate-x-4' : ''}`} />
                                    </button>

                                    {/* ប្រអប់បង្ហាញ និងកែប្រែភាគរយពន្ធ */}
                                    {isTaxEnabled && (
                                        isEditingTax ? (
                                            <input
                                                type="number"
                                                value={taxRate}
                                                onChange={(e) => setTaxRate(Number(e.target.value))}
                                                onBlur={() => setIsEditingTax(false)}
                                                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTax(false)}
                                                autoFocus
                                                className="w-16 px-1 py-0.5 text-xs text-center border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:border-primary text-gray-800 dark:text-white"
                                                min="0"
                                                max="100"
                                            />
                                        ) : (
                                            <span
                                                onClick={() => setIsEditingTax(true)}
                                                className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded cursor-pointer hover:bg-primary/20 transition-colors"
                                                title="ចុចដើម្បីកែប្រែភាគរយពន្ធ"
                                            >
                                                {taxRate}% ✎
                                            </span>
                                        )
                                    )}
                                </div>
                                
                                <span className={`font-medium ${isTaxEnabled ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 line-through'}`}>
                                    ${taxAmount.toFixed(2)}
                                </span>
                            </div>

                            <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
                            
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-gray-900 dark:text-white font-bold text-lg">Total</span>
                                    <div className="text-xs text-gray-400 mt-1 font-khmer">សរុបទាំងអស់</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-primary font-bold text-2xl">${finalTotal.toFixed(2)}</span>
                                    <div className="text-xs text-gray-400 font-khmer">{(finalTotal * 4100).toLocaleString()} ៛</div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods (Quick access) */}
                        <div className="grid grid-cols-3 gap-2">
                            <button className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-primary transition-colors border border-gray-100 dark:border-gray-700">
                                <span className="material-icons text-xl mb-1">payments</span>
                                <span className="text-[10px] font-medium uppercase">Cash</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-primary transition-colors border border-gray-100 dark:border-gray-700">
                                <span className="material-icons text-xl mb-1">qr_code_scanner</span>
                                <span className="text-[10px] font-medium uppercase">KHQR</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-primary transition-colors border border-gray-100 dark:border-gray-700">
                                <span className="material-icons text-xl mb-1">credit_card</span>
                                <span className="text-[10px] font-medium uppercase">Card</span>
                            </button>
                        </div>

                        {/* Primary Action Button */}
                        <button 
                            onClick={handleCheckout}
                            disabled={cart.length === 0}
                            className={`w-full py-4 rounded-xl shadow-lg flex items-center justify-center relative overflow-hidden group transition-all active:scale-[0.98]
                                ${cart.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-success hover:bg-success-hover text-white shadow-success/20'}
                            `}
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <div className="flex flex-col items-center z-10 leading-none">
                                <span className="font-khmer font-bold text-xl">គិតលុយ</span>
                                <span className="text-[10px] uppercase font-semibold tracking-wider opacity-90 mt-1">Checkout</span>
                            </div>
                        </button>
                    </div>
                </section>
            </div>

            {/* Unit Selection Modal */}
            {showUnitModal && selectedProductForUnit && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl p-6 w-96 max-w-[90vw] animate-in scale-in duration-200">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white font-khmer">Select Unit</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedProductForUnit.nameKh}</p>
                            </div>
                            <button 
                                onClick={() => setShowUnitModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            {selectedProductForUnit.units?.map((unit: any) => (
                                <button
                                    key={unit.unitId}
                                    onClick={() => handleUnitSelected(unit)}
                                    className="w-full p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{unit.name}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {unit.multiplier > 1 ? `1 ${unit.name} = ${unit.multiplier} base units` : 'Base unit'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary group-hover:scale-110 transition-transform">${unit.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => setShowUnitModal(false)}
                            className="w-full mt-4 py-2 px-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Variant Selection Modal */}
            {showVariantModal && selectedVariantProduct && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl p-6 w-96 max-w-[90vw] animate-in scale-in duration-200">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white font-khmer">Select Variant</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedVariantProduct.nameKh}</p>
                            </div>
                            <button 
                                onClick={() => setShowVariantModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                            {selectedVariantProduct.variants?.map((variant: any) => {
                                const isVariantOutOfStock = (variant.stock || 0) <= 0;
                                const today = new Date();
                                const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
                                const isExpired = variant.expiryDate ? variant.expiryDate < todayStr : false;
                                return (
                                    <button
                                        key={variant.id}
                                        onClick={() => !isVariantOutOfStock && !isExpired && handleVariantSelect(variant)}
                                        disabled={isVariantOutOfStock || isExpired}
                                        className={`w-full p-4 text-left border rounded-lg transition-all group ${
                                            isVariantOutOfStock || isExpired
                                                ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">{variant.name}</h4>
                                                <p className={`text-xs mt-1 ${isVariantOutOfStock ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                                    Stock: {variant.stock || 0}
                                                </p>
                                                {variant.expiryDate && (
                                                    <div className={`text-xs mt-1 ${isExpired ? 'text-red-500 font-bold' : 'text-orange-500'}`}>
                                                        {isExpired ? '⚠️ ផុតកំណត់ (Expired): ' : 'ផុតកំណត់ (Exp): '} {variant.expiryDate}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary group-hover:scale-110 transition-transform">${variant.price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Selection Modal */}
            {showCustomerModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-in scale-in duration-200">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Select Customer</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-khmer">ជ្រើសរើសអតិថិជន</p>
                            </div>
                            <button 
                                onClick={() => setShowCustomerModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                            {customers.length === 0 ? (
                                <div className="text-center py-8">
                                    <span className="material-icons text-4xl text-gray-300 dark:text-gray-700 block mb-2">person_off</span>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">No customers available</p>
                                </div>
                            ) : (
                                customers.map(customer => (
                                    <button
                                        key={customer.id}
                                        onClick={() => {
                                            setPosCustomer(customer);
                                            setShowCustomerModal(false);
                                        }}
                                        className={`w-full p-4 text-left border rounded-lg transition-all ${
                                            posCustomer?.id === customer.id
                                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                                                {customer.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 dark:text-white truncate">{customer.name}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{customer.phone}</p>
                                                <div className="flex items-center gap-2 mt-1 text-xs">
                                                    <span className={`px-2 py-0.5 rounded ${customer.totalDebt > 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                                                        Debt: ${customer.totalDebt.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                            {posCustomer?.id === customer.id && (
                                                <span className="material-icons text-primary text-lg flex-shrink-0">check_circle</span>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        <button 
                            onClick={() => {
                                setPosCustomer(null);
                                setShowCustomerModal(false);
                            }}
                            className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <span className="material-icons text-sm">person_off</span>
                            Use Walk-in / Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PosTerminal;
