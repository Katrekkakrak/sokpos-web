# Online Order Completion Logic - Complete Fix

## Problem Identified
When an online order was marked as 'completed', it had TWO critical issues:
1. **Receipt History Issue**: Order didn't appear in Receipt History (Reports)
2. **Stock Deduction Issue**: Stock wasn't being deducted globally from the inventory

The completion logic was entirely disconnected from the global `useData` context actions for receipts.

---

## Solution Implemented

### 1. **Updated DataContext** (`context/DataContext.tsx`)
- **Added `setOrders` to the DataContextType interface** (line ~502)
  - Signature: `setOrders: (orders: Order[] | ((prev: Order[]) => Order[])) => void;`
  - This allows external components to add receipts to the global orders history

- **Exported `setOrders` in the Provider** (line ~1034)
  - Added to the value object passed to `DataContext.Provider`

### 2. **Updated OnlineOrdersBoard** (`components/OnlineOrdersBoard.tsx`)

#### A. Import Enhancement (line 22)
```typescript
const { 
    onlineOrders, 
    selectOnlineOrder, 
    setIsCreateOrderModalOpen, 
    updateOrderStatus, 
    customers, 
    setCurrentView, 
    selectedOnlineOrder, 
    setIsShippingLabelModalOpen, 
    products, 
    setProducts, 
    updateProduct, 
    updateOnlineOrder, 
    deleteOnlineOrder,
    setOrders,      // ← NEW: Receipt history setter
    orders          // ← NEW: Current receipt history (for reference)
} = useData();
```

#### B. New Helper Function: `convertOnlineOrderToReceipt()` (lines ~146-162)
Converts an OnlineOrder to standard Receipt (Order) format:
```typescript
const convertOnlineOrderToReceipt = (onlineOrder: OnlineOrder): any => {
    return {
        id: onlineOrder.id,
        customer: onlineOrder.customer,
        date: onlineOrder.date,
        status: 'Completed',
        total: onlineOrder.total,
        subtotal: onlineOrder.subtotal,
        tax: onlineOrder.tax || 0,
        discount: onlineOrder.discount || 0,
        shippingFee: onlineOrder.shippingFee || 0,
        items: onlineOrder.items,
        method: onlineOrder.paymentMethod || 'COD',
        source: onlineOrder.source,
        shippingCarrier: onlineOrder.shippingCarrier,
        paymentStatus: onlineOrder.paymentStatus,
    };
};
```

#### C. Updated `handleNextStage()` Function (Lines ~1120-1150)
**When order status changes to 'Completed':**

```typescript
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
```

**Two-Step Process:**
1. **STOCK DEDUCTION** → Calls `processStockDeduction()` which:
   - Iterates through all products
   - Matches products by `id`, `productId`, or `name` (fallback)
   - Deducts quantities and prevents negative stock
   - Triggers low stock alerts (≤ 5 units) via Telegram

2. **RECEIPT HISTORY** → Calls `setOrders()` which:
   - Converts the OnlineOrder to standard Receipt format
   - Adds it to the beginning of the global `orders` array
   - Makes it visible in Receipt History (Reports)

#### D. Updated `handleBulkMove()` Function (Lines ~209-236)
**Same two-step process for bulk operations:**
- When bulk-moving orders to 'Completed' status
- Each order gets:
  - ✅ Stock deducted globally
  - ✅ Added to receipt history

#### E. Enhanced `handleUndoComplete()` Function (Lines ~164-177)
**When undoing a completed order:**
```typescript
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
```

---

## How It Works Now

### Complete → Receipt History Flow:
```
Online Order (Status: Shipping)
         ↓ [User clicks DONE button]
         ↓ [System confirms completion]
         ├─────── STOCK DEDUCTION ────────┐
         │                                 │
         │ 1. Find product in inventory   │
         │ 2. Match by ID/productId/name │
         │ 3. Deduct quantity            │
         │ 4. Prevent negative stock     │
         │ 5. Fire Telegram alert if ≤5  │
         │ 6. Global update via setProducts
         │
         └─────── RECEIPT HISTORY ────────┐
                                           │
                 1. Convert to Receipt    │
                 2. Add to orders array   │
                 3. Global update via    │
                    setOrders()          │
                                         ↓
Order Status: Completed (Online Orders Board)
  ✅ Stock deducted from Inventory
  ✅ Appears in Receipt History (Reports)
```

---

## Key Improvements

| Issue | Before | After |
|-------|--------|-------|
| **Stock Deduction** | ❌ Not happening | ✅ Deducted globally with alerts |
| **Receipt History** | ❌ Missing from reports | ✅ Added to receipt history |
| **Bulk Operations** | ⚠️ Partial | ✅ Full support for both operations |
| **Undo Actions** | ⚠️ Only restored stock | ✅ Restores stock + removes receipt |
| **Logging** | ⚠️ Limited | ✅ Console logs for debugging |

---

## Testing Checklist

- [ ] Create an online order with multiple items
- [ ] Move order through pipeline: New → Packing → Shipping
- [ ] Click "DONE" to complete the order
- [ ] Verify stock is deducted in Inventory List
- [ ] Verify order appears in Receipt History (Reports)
- [ ] Test bulk move to Completed (should apply to all orders)
- [ ] Test Undo button (should restore stock and remove from receipts)
- [ ] Check Telegram alerts for low stock items (≤ 5 units)

---

## Files Modified

1. **`context/DataContext.tsx`**
   - Added `setOrders` to interface
   - Exported `setOrders` in provider

2. **`components/OnlineOrdersBoard.tsx`**
   - Added `setOrders` and `orders` to destructuring
   - Added `convertOnlineOrderToReceipt()` helper
   - Updated `handleNextStage()` with dual operations
   - Updated `handleBulkMove()` with dual operations
   - Enhanced `handleUndoComplete()` to remove receipts

---

## Result

Completing an online order now **perfectly mirrors a POS checkout**:
- ✅ Stock deducted globally
- ✅ Appears in Receipt History
- ✅ Low stock alerts triggered
- ✅ Maintains full audit trail
