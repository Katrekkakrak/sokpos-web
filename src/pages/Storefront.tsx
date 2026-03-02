import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { QRCodeSVG } from 'qrcode.react';


interface Product {
  id: number | string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  category?: string;
  variants?: any[];
  units?: any[];
}

interface CartItem extends Product {
  quantity: number;
  variantId?: string;
  unitId?: string;
  selectedUnit?: string;
}

import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import CustomerAuthModal from '../components/CustomerAuthModal';


// ... (existing interfaces)

const Storefront: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [tenantUID, setTenantUID] = useState<string>('');
  const [shopSettings, setShopSettings] = useState<any>(null);

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');

  // Checkout form state
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'KHQR'>('COD');
  const [submitting, setSubmitting] = useState(false);

  // KHQR state
  const [showKhqrModal, setShowKhqrModal] = useState(false);
  const [khqrPayload, setKhqrPayload] = useState('');
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  // Variant & UOM Selection State
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  
  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);


  // Fetch products from Firebase based on shopId
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');

        // Step 1: Query the tenants collection to find the UID for this shopId
        const tenantsQuery = query(collection(db, 'tenants'), where('name', '==', shopId));
        const tenantSnapshot = await getDocs(tenantsQuery);

        if (tenantSnapshot.empty) {
          setError(`Shop "${shopId}" not found.`);
          setProducts([]);
          setLoading(false);
          return;
        }

        // Get the first matching tenant document
        const tenantDoc = tenantSnapshot.docs[0];
        const tenantUID = tenantDoc.id;
        setTenantUID(tenantUID); // Store tenant UID for later use in checkout

        // Fetch Shop Settings for Display Name
        try {
            const settingsRef = doc(db, 'tenants', tenantUID, 'settings', 'shopSettings');
            const settingsSnap = await getDoc(settingsRef);
            if (settingsSnap.exists()) {
                setShopSettings(settingsSnap.data());
            }
        } catch (err) {
            console.error("Error fetching shop settings:", err);
        }

        // Step 2: Query the products collection for this specific tenant
        const productsSnapshot = await getDocs(
          collection(db, 'tenants', tenantUID, 'products')
        );

        const productsData = productsSnapshot.docs.map((doc) => ({
          id: parseInt(doc.id) || doc.id,
          ...doc.data()
        })) as Product[];

        setProducts(productsData);
        console.log(`✅ Loaded ${productsData.length} products for shop: ${shopId}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
        setError(errorMessage);
        console.error('❌ Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      fetchProducts();
    }
  }, [shopId]);

  // Cart Functions
  const addItemToCart = (product: Product, quantity = 1, variant?: any, unit?: any) => {
    setCart(prev => {
      const variantId = variant?.id;
      const unitId = unit?.unitId;

      const existingIndex = prev.findIndex(item => 
        item.id === product.id && 
        item.variantId === variantId && 
        item.unitId === unitId
      );

      if (existingIndex > -1) {
        const updatedCart = [...prev];
        const currentItem = updatedCart[existingIndex];
        const maxStock = variant ? (variant.stock || 0) : product.stock;
        
        updatedCart[existingIndex] = {
            ...currentItem,
            quantity: Math.min(currentItem.quantity + quantity, maxStock)
        };
        return updatedCart;
      } else {
        const newItem: CartItem = {
            ...product,
            quantity,
            variantId,
            unitId,
            selectedUnit: unit?.name,
            price: variant ? variant.price : (unit ? unit.price : product.price),
            name: variant ? `${product.name} (${variant.name})` : product.name,
            stock: variant ? (variant.stock || 0) : product.stock
        };
        return [...prev, newItem];
      }
    });
    
    setShowVariantModal(false);
    setShowUnitModal(false);
    setSelectedProductForModal(null);
  };

  const handleAddToCart = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      setSelectedProductForModal(product);
      setShowVariantModal(true);
      return;
    }
    if (product.units && product.units.length > 0) {
      setSelectedProductForModal(product);
      setShowUnitModal(true);
      return;
    }
    addItemToCart(product);
  };

  const increaseQuantity = (productId: number | string) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === productId) {
          return { ...item, quantity: Math.min(item.quantity + 1, item.stock) };
        }
        return item;
      })
    );
  };

  const decreaseQuantity = (productId: number | string) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === productId && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: number | string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const calculateCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleGenerateKHQR = async () => {
    // Validate required customer details
    if (!customerName || !phoneNumber || !address) {
      alert('Please fill in all customer details');
      return;
    }

    // Validate cart is not empty
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setIsGeneratingQr(true);

    try {
      // Fetch the tenant's settings from Firestore
      const settingsRef = doc(db, 'tenants', tenantUID, 'settings', 'shopSettings');
      const settingsSnap = await getDoc(settingsRef);

      let paymentLink = "";

      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        // Look for the link in either field: paywayLink (new) or bakongAccountId (legacy/misused)
        paymentLink = data.paywayLink || data.bakongAccountId || "";
      }

      if (paymentLink) {
        setKhqrPayload(paymentLink);
        setShowKhqrModal(true);
      } else {
        alert('ហាងនេះមិនទាន់បានរៀបចំការទូទាត់ទេ (Store has not configured payment link)');
      }
    } catch (error) {
      console.error('❌ Failed to generate KHQR:', error);
      alert('Failed to generate payment code. Please try again.');
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const submitOrder = async () => {
    // Validate required customer details
    if (!customerName || !phoneNumber || !address) {
      alert('Please fill in all customer details');
      return;
    }

    // Validate cart is not empty
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Validate tenant UID is available
    if (!tenantUID) {
      console.error('❌ Checkout Error: Shop ID missing');
      alert('Shop ID missing. Please refresh and try again.');
      return;
    }

    setSubmitting(true);

    try {
      // Generate a unique document reference FIRST (don't save yet)
      const newOrderRef = doc(collection(db, 'tenants', tenantUID, 'onlineOrders'));
      const orderId = newOrderRef.id;

      // Generate a simple, readable unique ID
      const readableOrderId = `ORD-${Date.now().toString().slice(-6)}`;

      // Sanitize order data to remove undefined values
      const sanitizedItems = cart.map(item => ({
        id: item.id || 0,
        name: item.name || 'Unknown Product',
        price: item.price || 0,
        quantity: item.quantity || 1,
        stock: item.stock || 0,
        category: item.category || '',
        image: item.image || '',
        variantId: item.variantId || null,
        unitId: item.unitId || null,
        selectedUnit: item.selectedUnit || null,
      }));

      const cartTotal = calculateCartTotal();

      // Build order object matching the exact POS OnlineOrder schema
      const orderData = {
        // Core order fields
        id: orderId,
        orderId: readableOrderId,
        customerId: currentUser ? currentUser.uid : null,
        customerEmail: currentUser ? currentUser.email : null,
        customer: {
          name: customerName || '',
          phone: phoneNumber || '',
          address: address || '',
          avatar: (customerName?.substring(0, 2) || 'U').toUpperCase(),
          type: 'Storefront Customer'
        },
        items: sanitizedItems,
        
        // Financial fields (matching Order interface)
        total: cartTotal || 0,
        subtotal: cartTotal || 0,
        tax: 0,
        discount: 0,
        shippingFee: 0,
        amountPaid: cartTotal || 0,
        debtAmount: 0,
        
        // Status fields
        status: 'New',
        paymentStatus: paymentMethod === 'COD' ? 'COD' : 'Pending',
        paymentMethod: paymentMethod || 'COD',
        
        // Metadata fields
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        source: 'Digital Storefront',
        branchId: 'storefront',
        method: paymentMethod === 'COD' ? 'COD' : 'Online Payment'
      };

      console.log('📝 Submitting order with data:', orderData);
      console.log('📍 Tenant UID:', tenantUID);
      console.log('📍 Order ID:', orderId);

      // Save to Firestore using setDoc with the generated reference
      await setDoc(newOrderRef, orderData);

      console.log(`✅ Order saved successfully with ID: ${orderId}`);
      console.log('✅ Full order object:', orderData);

      // Send Telegram notification with dynamic credentials from Firestore
      try {
        // Fetch settings from Firestore
        const settingsRef = doc(db, 'tenants', tenantUID, 'settings', 'shopSettings');
        const settingsSnap = await getDoc(settingsRef);

        let botToken = "";
        let chatId = "";

        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          // Safely extract tokens
          botToken = data.telegramToken || "";
          chatId = data.telegramChatId || "";
        }

        // Only attempt to send if tokens exist
        if (botToken && chatId) {
          console.log("✅ Using Telegram credentials from Firestore");
          
          const items = cart.map(item => `• ${item.name} x${item.quantity}`).join('\n');
          const message = `🛍️ <b>New Online Order!</b>\n🆔 <b>Order ID:</b> #${readableOrderId}\n\n👤 <b>Customer:</b> ${customerName}\n📞 <b>Phone:</b> ${phoneNumber}\n🛒 <b>Items:</b>\n${items}\n💰 <b>Total:</b> $${cartTotal.toFixed(2)}\n💳 <b>Payment:</b> ${paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}\n\n📍 <b>Address:</b> ${address}`;

          const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: 'HTML'
            })
          });
          
          console.log("Telegram API response ok?:", res.ok);

          if (!res.ok) {
            const errorData = await res.json();
            console.warn('⚠️ Telegram notification failed:', errorData);
          } else {
            console.log('✅ Telegram notification sent successfully');
          }
        } else {
          console.warn("Telegram credentials not found for this tenant. Skipping notification.");
        }
      } catch (telegramError) {
        console.warn('⚠️ Telegram notification error (order still successful):', telegramError);
      }

      // Clear form and cart
      setCart([]);
      setCustomerName('');
      setPhoneNumber('');
      setAddress('');
      setPaymentMethod('COD');
      setIsCheckingOut(false);
      setLastOrderId(readableOrderId);
      setOrderSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setOrderSuccess(false), 3000);
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      
      console.error('❌ Checkout Error:', {
        message: errorMessage,
        code: errorCode,
        error: error
      });

      // Show specific error messages based on error code
      if (errorCode === 'permission-denied') {
        alert('Error: You do not have permission to place orders. Please contact support.');
      } else if (errorCode === 'not-found') {
        alert('Error: Shop not found. Please refresh and try again.');
      } else if (errorCode === 'unavailable') {
        alert('Error: Service temporarily unavailable. Please try again later.');
      } else {
        alert(`Checkout failed: ${errorMessage}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Auth Modal */}
      {showAuthModal && <CustomerAuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {shopSettings?.logo ? (
              <img src={shopSettings.logo} alt="Store Logo" className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏪</span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{shopSettings?.name || 'Digital Storefront'}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Shop ID: {shopId}</p>
            </div>
          </div>
          <nav className="flex gap-4 items-center">
             <Link to={`/store/${shopId}`} className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition">
              Shop
            </Link>
            <Link to={`/store/${shopId}/track`} className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition">
              តាមដាន (Track)
            </Link>

            {/* Auth Buttons */}
            {!currentUser ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition"
              >
                ចូលគណនី (Login)
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to={`/store/${shopId}/history`} 
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition"
                >
                  ប្រវត្តិការទិញ (Order History)
                </Link>
                <span className="text-sm text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</span>
                <button
                  onClick={() => signOut(auth)}
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition"
                >
                  ចាកចេញ (Logout)
                </button>
              </div>
            )}
            
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition relative"
            >
              Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Welcome to the Digital Store of: <span className="text-blue-600">{shopSettings?.name || shopId}</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            Discover amazing products and great service
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-slate-600 dark:text-slate-300">Loading products...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-700 dark:text-red-300 font-medium">❌ {error}</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition p-6"
              >
                {/* Product Image */}
                <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">📦</span>
                  )}
                </div>

                {/* Product Info */}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Stock: {product.stock > 0 ? `${product.stock} units` : 'Out of Stock'}
                </p>

                {/* Price and Button */}
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">
                    ${(product.price || 0).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      product.stock > 0
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-12 text-center">
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              No products available at this time.
            </p>
          </div>
        )}
      </section>

      {/* Success Message */}
      {orderSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-pulse">
          ✅ ការបញ្ជាទិញជោគជ័យ! លេខកូដរបស់អ្នកគឺ (Your Order ID is): <strong>#{lastOrderId}</strong>
        </div>
      )}

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-40 overflow-hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => !isCheckingOut && setIsCartOpen(false)}
          ></div>

          {/* Sidebar */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-800 shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isCheckingOut ? 'Checkout' : 'Shopping Cart'}
              </h2>
              <button
                onClick={() => {
                  if (isCheckingOut) {
                    setIsCheckingOut(false);
                  } else {
                    setIsCartOpen(false);
                  }
                }}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Cart Items or Checkout Form */}
            <div className="flex-1 overflow-y-auto p-6">
              {!isCheckingOut ? (
                <>
                  {cart.length === 0 ? (
                    <p className="text-slate-600 dark:text-slate-300 text-center py-8">
                      Your cart is empty. Add some products!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                        >
                          {/* Product Image */}
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-2xl">📦</span>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                              {item.name}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              ${item.price.toFixed(2)} each
                            </p>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => decreaseQuantity(item.id)}
                                className="w-6 h-6 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-white rounded text-sm font-bold"
                              >
                                −
                              </button>
                              <span className="w-8 text-center font-semibold text-slate-700 dark:text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => increaseQuantity(item.id)}
                                className="w-6 h-6 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-white rounded text-sm font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Price and Remove */}
                          <div className="flex flex-col items-end justify-between">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 font-semibold text-sm"
                            >
                              Remove
                            </button>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // Checkout Form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+855 1234 5678"
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Address
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Delivery Address"
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as 'COD' | 'KHQR')}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="COD">Cash on Delivery (COD)</option>
                      <option value="KHQR">KHQR Bank Transfer</option>
                    </select>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Order Summary</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
                      Items: {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      Total: ${calculateCartTotal().toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-6 space-y-2">
              {!isCheckingOut ? (
                <>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setIsCheckingOut(true)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                    >
                      Proceed to Checkout
                    </button>
                  )}
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="w-full py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-semibold transition"
                  >
                    Continue Shopping
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => paymentMethod === 'KHQR' ? handleGenerateKHQR() : submitOrder()}
                    disabled={submitting || isGeneratingQr}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Placing Order...' : isGeneratingQr ? 'Generating QR Code...' : 'Place Order'}
                  </button>
                  <button
                    onClick={() => setIsCheckingOut(false)}
                    className="w-full py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-semibold transition"
                  >
                    Back to Cart
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Variant Selection Modal */}
      {showVariantModal && selectedProductForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowVariantModal(false)}></div>
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Select Option</h3>
                <button onClick={() => setShowVariantModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><span className="text-2xl">×</span></button>
            </div>
            <div className="p-4 overflow-y-auto">
                <div className="space-y-2">
                    {(() => {
                        // Group variants by name to merge batches (FEFO logic)
                        const groupedVariants = selectedProductForModal.variants?.reduce((acc: any[], variant: any) => {
                            const existing = acc.find(v => v.name === variant.name);
                            if (existing) {
                                existing.stock = (existing.stock || 0) + (variant.stock || 0);
                                // FEFO: Use ID of the variant with earliest expiry date
                                if (variant.expiryDate) {
                                    if (!existing.expiryDate || new Date(variant.expiryDate) < new Date(existing.expiryDate)) {
                                        existing.id = variant.id;
                                        existing.expiryDate = variant.expiryDate;
                                    }
                                }
                            } else {
                                acc.push({ ...variant });
                            }
                            return acc;
                        }, []) || [];

                        return groupedVariants.map((variant: any) => {
                            const isOutOfStock = (variant.stock || 0) <= 0;
                            return (
                                <button 
                                    key={variant.id}
                                    disabled={isOutOfStock}
                                    onClick={() => addItemToCart(selectedProductForModal, 1, variant)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isOutOfStock ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800/50' : 'border-slate-200 hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 bg-white dark:bg-slate-800'}`}
                                >
                                    <div className="text-left">
                                        <p className="font-bold text-slate-900 dark:text-white">{variant.name}</p>
                                        <p className={`text-xs ${isOutOfStock ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {isOutOfStock ? 'Out of Stock' : `${variant.stock} available`}
                                        </p>
                                    </div>
                                    <p className="font-bold text-blue-600 dark:text-blue-400">${variant.price.toFixed(2)}</p>
                                </button>
                            );
                        });
                    })()}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Unit Selection Modal */}
      {showUnitModal && selectedProductForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowUnitModal(false)}></div>
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Select Unit</h3>
                <button onClick={() => setShowUnitModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><span className="text-2xl">×</span></button>
            </div>
            <div className="p-4 overflow-y-auto">
                <div className="space-y-2">
                    {selectedProductForModal.units?.map((unit: any) => (
                        <button 
                            key={unit.unitId}
                            onClick={() => addItemToCart(selectedProductForModal, 1, undefined, unit)}
                            className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 bg-white dark:bg-slate-800 transition-all"
                        >
                            <div className="text-left">
                                <p className="font-bold text-slate-900 dark:text-white">{unit.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {unit.multiplier > 1 ? `Contains ${unit.multiplier} items` : 'Single Item'}
                                </p>
                            </div>
                            <p className="font-bold text-blue-600 dark:text-blue-400">${unit.price.toFixed(2)}</p>
                        </button>
                    ))}
                </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Products</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Track Order</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Email: {shopSettings?.email || 'N/A'}</li>
                <li>Phone: {shopSettings?.phone || 'N/A'}</li>
                <li>Address: {shopSettings?.address || 'Not provided'}</li>
                <li>Hours: {shopSettings?.operatingHours || 'N/A'}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2026 SokPOS Digital Storefront. Shop ID: {shopId}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* KHQR Payment Modal */}
      {showKhqrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8">
            {/* Modal Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-khmer">
                ស្កេន ឬចុចលីងដើម្បីបង់ប្រាក់ (Scan or Click to Pay)
              </h2>
            </div>

            {/* Amount Display */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-6 text-center">
              <p className="text-white/80 text-sm font-khmer mb-2">Total Amount</p>
              <p className="text-4xl font-bold text-white">
                ${calculateCartTotal().toFixed(2)}
              </p>
            </div>

            {/* QR Code */}
            {khqrPayload && (
              <div className="flex flex-col items-center justify-center mb-6 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <QRCodeSVG value={khqrPayload} size={256} />
                <a 
                  href={khqrPayload} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-4 text-blue-600 hover:underline font-khmer font-bold"
                >
                  បើកកម្មវិធីធនាគារ (Open Banking App)
                </a>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 dark:text-blue-200 font-khmer">
                📱 ប្រើ Bakong ឬ Banking App របស់អ្នក ដើម្បីស្កេនលេខកូដ QR នេះ
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-300 mt-2 font-khmer">
                (Use your Bakong or Banking app to scan this QR code)
              </p>
            </div>

            {/* Confirmation Button */}
            <button
              onClick={async () => {
                setShowKhqrModal(false);
                await submitOrder();
              }}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✓ ខ្ញុំបានបង់ប្រាក់រួចរាល់ (I have paid)
            </button>

            {/* Cancel Button */}
            <button
              onClick={() => setShowKhqrModal(false)}
              className="w-full mt-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-semibold transition"
            >
              បោះបង់ (Cancel)
            </button>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
        🚀 Storefront for: <strong>{shopId}</strong>
      </div>
    </div>
  );
};

export default Storefront;
