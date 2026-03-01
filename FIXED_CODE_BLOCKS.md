# Complete Updated Functions - Copy-Paste Ready

## 1. OnlineOrdersBoard.tsx - Complete handleNextStage Function

```typescript
const handleNextStage = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (order.status === 'New') {
        if (updateOnlineOrder) {
            updateOnlineOrder(order.id, { ...order, status: 'Packing' }, true);
        }
    }
    else if (order.status === 'Packing') {
        if (updateOnlineOrder) {
            updateOnlineOrder(order.id, { ...order, status: 'Shipping' }, true);
        }
    }
    else if (order.status === 'Shipping') {
        if (window.confirm(`សូមចុច Okay ដើម្បីបញ្ជាក់ថាការកុម្ម៉ង់នេះបានរួចរាល់ ហើយវានឹងត្រូវបានស្តុកកាត់ចេញ។`)) {
            if (updateOnlineOrder) {
                let updatedOrder = { ...order, status: 'Completed' };
                
                // CRITICAL FIX: Handle stock deduction and receipt history
                if (!order.stockDeducted) {
                    // A. DEDUCT STOCK GLOBALLY
                    processStockDeduction(order);
                    updatedOrder.stockDeducted = true;
                }
                
                // B. ADD TO RECEIPT HISTORY (Reports)
                const receipt = convertOnlineOrderToReceipt(order);
                if (setOrders) {
                    setOrders(prev => [receipt, ...prev]);
                    console.log(`✅ Receipt added to history for order ${order.id}`);
                }
                
                updateOnlineOrder(order.id, updatedOrder, true);
            }
        }
    }
};
```

---

## 2. OnlineOrdersBoard.tsx - Helper Function

```typescript
// --- Helper: Convert OnlineOrder to Receipt (Order) format for Receipt History ---
const convertOnlineOrderToReceipt = (onlineOrder: OnlineOrder): any => {
    return {
        id: onlineOrder.id,
        customer: onlineOrder.customer,
        date: onlineOrder.date,
        status: 'Completed', // Online orders that complete go to Completed status in receipts
        total: onlineOrder.total,
        subtotal: onlineOrder.subtotal,
        tax: onlineOrder.tax || 0,
        discount: onlineOrder.discount || 0,
        shippingFee: onlineOrder.shippingFee || 0,
        items: onlineOrder.items,
        method: onlineOrder.paymentMethod || 'COD', // Payment method
        source: onlineOrder.source, // Track the source (Facebook, Telegram, etc.)
        shippingCarrier: onlineOrder.shippingCarrier, // Track courier info
        paymentStatus: onlineOrder.paymentStatus, // Track payment verification status
    } as any;
};
```

---

## 3. OnlineOrdersBoard.tsx - Enhanced handleUndoComplete

```typescript
// Handle Undoing a Completed Order
const handleUndoComplete = (order: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("តើអ្នកពិតជាចង់ត្រឡប់ការកុម្ម៉ង់នេះទៅកាន់ 'កំពុងដឹក (Shipping)' វિញមែនទេ? (ស្តុកនឹងត្រូវបានបូកបញ្ចូលវិញ)")) {
        // 1. Restore stock
        processStockRestoration(order);
        
        // 2. REMOVE FROM RECEIPT HISTORY if it was added
        if (setOrders && order.stockDeducted) {
            setOrders(prev => prev.filter(o => o.id !== order.id));
            console.log(`✅ Receipt removed from history for order ${order.id}`);
        }
        
        // 3. Update order status
        if (updateOnlineOrder) {
            updateOnlineOrder(order.id, { ...order, status: 'Shipping', stockDeducted: false }, true);
        }
    }
};
```

---

## 4. OnlineOrdersBoard.tsx - Updated handleBulkMove

```typescript
// --- Bulk Move Handler ---
const handleBulkMove = (currentStage: string) => {
    const nextStage = getNextStage(currentStage);
    if (!nextStage) return;

    // Find all orders in the current column
    const ordersToMove = filteredOrders.filter((o: any) => o.status === currentStage) || [];
    if (ordersToMove.length === 0) return;

    // Confirm before moving
    if (window.confirm(`តើអ្នកពិតជាចង់រុញការកុម្ម៉ង់ទាំង ${ordersToMove.length} ទៅកាន់ជួរ "${nextStage}" ព្រមគ្នាមែនទេ?`)) {
        // Update all orders sequentially
        ordersToMove.forEach((order: any) => {
            if (updateOnlineOrder) {
                let updatedOrder = { ...order, status: nextStage };
                
                // If moving to Completed, handle stock deduction AND receipt history
                if (nextStage === 'Completed' && !order.stockDeducted) {
                    // A. DEDUCT STOCK GLOBALLY
                    processStockDeduction(order);
                    updatedOrder.stockDeducted = true;
                    
                    // B. ADD TO RECEIPT HISTORY (Reports)
                    const receipt = convertOnlineOrderToReceipt(order);
                    if (setOrders) {
                        setOrders(prev => [receipt, ...prev]);
                        console.log(`✅ Receipt added to history for bulk order ${order.id}`);
                    }
                }
                
                updateOnlineOrder(order.id, updatedOrder, true);
            }
        });
    }

    setActiveMenuColumn(null); // Close menu
};
```

---

## 5. OnlineOrdersBoard.tsx - Updated Import Destructuring

**Line 22 - Change from:**
```typescript
const { onlineOrders, selectOnlineOrder, setIsCreateOrderModalOpen, updateOrderStatus, customers, setCurrentView, selectedOnlineOrder, setIsShippingLabelModalOpen, products, setProducts, updateProduct, updateOnlineOrder, deleteOnlineOrder } = useData();
```

**To:**
```typescript
const { onlineOrders, selectOnlineOrder, setIsCreateOrderModalOpen, updateOrderStatus, customers, setCurrentView, selectedOnlineOrder, setIsShippingLabelModalOpen, products, setProducts, updateProduct, updateOnlineOrder, deleteOnlineOrder, setOrders, orders } = useData();
```

---

## 6. DataContext.tsx - Add setOrders to Interface

**Around line 502, in the `DataContextType` interface, add:**
```typescript
// History
orders: Order[]; // Completed POS orders
setOrders: (orders: Order[] | ((prev: Order[]) => Order[])) => void;
processRefund: (orderId: string, items: {id: number, qty: number}[], amount: number) => void;
```

---

## 7. DataContext.tsx - Export setOrders in Provider

**Around line 1034, update the return statement to include:**
```typescript
removeCustomFieldDef, orders, setOrders, processRefund, discounts, addDiscount, deleteDiscount, tenants,
updateTenantStatus, renewTenant, noteCategories, setNoteCategories, contactStages, setContactStages,
posCustomer, setPosCustomer, draftOnlineOrder, setDraftOnlineOrder, prefillOrderData, setPrefillOrderData
```

---

## Key Features of the Fix

✅ **Stock Deduction**
- Matches products by `id`, `productId`, or `name`
- Prevents negative stock (Math.max(0, stock - qty))
- Triggers low stock alerts (≤ 5 units) via Telegram
- Uses functional state update for thread-safe operations

✅ **Receipt History**
- Converts OnlineOrder to standard Order format
- Preserves payment method, customer, items, and metadata
- Added to beginning of orders array (newest first)
- Removed on undo/delete

✅ **Bulk Operations**
- Works for single and bulk order completions
- Same two-step process for consistency

✅ **Audit Trail**
- Console logs for debugging
- Tracks receipt ID correlations
- Maintains order IDs across systems

---

## Data Flow Diagram

```
┌─────────────────────────────────┐
│  Online Order (Shipping Status) │
└────────────────┬────────────────┘
                 │ User clicks "DONE"
                 ▼
         ┌──────────────────┐
         │ Confirmation     │
         │ Dialog Box       │
         └────────┬─────────┘
                  │ (User confirms)
                  ▼
    ┌─────────────────────────────┐
    │  processStockDeduction()    │
    │  ├─ Find product in array  │
    │  ├─ Match by ID/name       │
    │  ├─ Deduct qty             │
    │  └─ Alert if stock ≤ 5     │
    │      via Telegram          │
    └────────┬────────────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │ convertOnlineOrderToReceipt()│
    │ └─ Format as Order object   │
    └────────┬────────────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │ setOrders(prev =>           │
    │   [receipt, ...prev]        │
    │ )                           │
    └────────┬────────────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │ updateOnlineOrder()         │
    │ Status: "Completed"         │
    │ stockDeducted: true         │
    └────────┬────────────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │ Result:                     │
    │ ✅ Stock deducted globally │
    │ ✅ Added to Receipt History │
    │ ✅ Appears in Reports       │
    └─────────────────────────────┘
```
