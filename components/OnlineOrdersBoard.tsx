
import React, { useState } from 'react';
import { useData, OnlineOrder } from '../context/DataContext';
import { sendLowStockAlert, sendReceiptAlert } from '../utils/telegramAlert';
import { 
    Facebook, 
    MessageCircle, 
    Video, 
    Store, 
    Printer, 
    ArrowRight, 
    Package, 
    Truck, 
    CheckCircle, 
    Clock, 
    MapPin,
    User
} from 'lucide-react';

const OnlineOrdersBoard: React.FC = () => {
    const { onlineOrders, selectOnlineOrder, setIsCreateOrderModalOpen, updateOrderStatus, customers, setCurrentView, selectedOnlineOrder, setIsShippingLabelModalOpen, products, setProducts, updateProduct, updateOnlineOrder, deleteOnlineOrder, setOrders, orders, deductStockFromOrder, user, checkReceiptLimit, userPlan } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    
    // Date Filter State
    const [dateFilter, setDateFilter] = useState('ថ្ងៃនេះ (Today)');
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

    // Column Menu State
    const [activeMenuColumn, setActiveMenuColumn] = useState<string | null>(null);
    const [columnSorts, setColumnSorts] = useState<Record<string, string>>({});
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    // Permission Check for Deletion
    const canDelete = ['Admin', 'Super Admin', 'online_sales_lead'].includes(user?.role || '');

    const dateOptions = [
        'ថ្ងៃនេះ (Today)',
        'ម្សិលមិញ (Yesterday)',
        'សប្តាហ៍នេះ (This Week)',
        'ខែនេះ (This Month)'
    ];

    const handleCreateOrder = () => {
        if (!checkReceiptLimit('online')) {
            alert("🔒 គណនី Free អាចទទួលការបញ្ជាទិញអនឡាញបានត្រឹមតែ ១០០ បុងប៉ុណ្ណោះ។ សូមដំឡើងកញ្ចប់ ដើម្បីបន្តទទួលការបញ្ជាទិញគ្មានដែនកំណត់!");
            return;
        }
        setIsCreateOrderModalOpen(true);
    };

    // Filter logic
    const filteredOrders = onlineOrders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
            order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.phone.includes(searchTerm);

        // Strict Ownership for Level 1 (online_sales)
        // Only show orders created by the current user if they are Level 1
        if (user?.role === 'online_sales') {
            const myId = user?.uid || user?.id;
            const matchesOwnership = (order as any).staffId === myId || 
                                     (order as any).cashierId === myId || 
                                     (order as any).userId === myId || 
                                     (order as any).createdBy === myId;
            return matchesSearch && matchesOwnership;
        }
        return matchesSearch;
    });

    // Distribute into columns
    const newOrders = filteredOrders.filter(o => o.status === 'New');
    const packingOrders = filteredOrders.filter(o => o.status === 'Packing');
    const shippingOrders = filteredOrders.filter(o => o.status === 'Shipping');
    const completedOrders = filteredOrders.filter(o => o.status === 'Completed');

    // --- Source Helper ---
    const getSourceInfo = (phone: string) => {
        // Try to find in CRM contacts
        const contact = customers.find(c => c.phone === phone);
        const source = contact?.source?.toLowerCase() || 'walk-in';

        if (source.includes('facebook')) return { icon: <Facebook size={12} />, label: 'Facebook', color: 'text-blue-600 bg-blue-50 border-blue-100', bg: 'bg-[#1877F2]' };
        if (source.includes('telegram')) return { icon: <MessageCircle size={12} />, label: 'Telegram', color: 'text-sky-500 bg-sky-50 border-sky-100', bg: 'bg-[#24A1DE]' };
        if (source.includes('tiktok')) return { icon: <Video size={12} />, label: 'TikTok', color: 'text-slate-900 bg-slate-100 border-slate-200 dark:text-white dark:bg-slate-700', bg: 'bg-black' };
        return { icon: <Store size={12} />, label: 'Walk-in', color: 'text-purple-600 bg-purple-50 border-purple-100', bg: 'bg-purple-600' };
    };

    // --- Carrier Helper ---
    const getCarrierBadge = (carrierName: string | undefined) => {
        const name = carrierName || 'Other';
        if (name.includes('J&T')) return { short: 'J&T', color: 'bg-red-600 text-white', icon: 'local_shipping' };
        if (name.includes('Virak')) return { short: 'VET', color: 'bg-blue-600 text-white', icon: 'directions_bus' };
        if (name.includes('Grab')) return { short: 'Grab', color: 'bg-green-600 text-white', icon: 'two_wheeler' };
        if (name.includes('CE')) return { short: 'CE', color: 'bg-orange-500 text-white', icon: 'local_shipping' };
        if (name.includes('Capitol')) return { short: 'Capitol', color: 'bg-purple-600 text-white', icon: 'directions_bus' };
        return { short: name.slice(0,4), color: 'bg-slate-500 text-white', icon: 'local_shipping' };
    };

    // --- Payment Status Helper ---
    const getPaymentStatusBadge = (paymentMethod: string | undefined) => {
        const method = paymentMethod || 'COD';
        if (method === 'COD') return { label: 'COD', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800' };
        return { label: 'Paid', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' };
    };

    // --- Helper: Determine Next Stage ---
    const getNextStage = (currentStage: string) => {
        if (currentStage === 'New') return 'Packing';
        if (currentStage === 'Packing') return 'Shipping';
        if (currentStage === 'Shipping') return 'Completed';
        return null;
    };

    // --- Helper: Safely restore stock when undoing a Completed order
    const processStockRestoration = (order: any) => {
        if (!order.stockDeducted) return; // Only restore if it was actually deducted

        order.items?.forEach((item: any) => {
            const productToUpdate = products?.find((p: any) => p.id === item.id);
            if (productToUpdate && updateProduct) {
                const newStock = (Number(productToUpdate.stock) || 0) + (Number(item.quantity) || 1);
                const newStatus = newStock > 0 && productToUpdate.status === 'Out of Stock' ? 'In Stock' : productToUpdate.status;
                // Pass true as 3rd arg to prevent redirect
                updateProduct(productToUpdate.id, { ...productToUpdate, stock: newStock, status: newStatus }, true);
            }
        });
    };

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

    // Handle Undoing a Completed Order
    const handleUndoComplete = (order: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("តើអ្នកពិតជាចង់ត្រឡប់ការកុម្ម៉ង់នេះទៅកាន់ 'កំពុងដឹក (Shipping)' វិញមែនទេ? (ស្តុកនឹងត្រូវបានបូកបញ្ចូលវិញ)")) {
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

    // Handle Archiving a Single Order
    const handleArchiveSingle = (order: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("តើអ្នកចង់លាក់ (Archive) ការកុម្ម៉ង់នេះចេញពីក្ដារខៀនមែនទេ?")) {
            if (updateOnlineOrder) {
                updateOnlineOrder(order.id, { ...order, status: 'Archived' }, true);
            }
        }
    };

    // Handle Deleting an Order completely (e.g., added by mistake)
    const handleDeleteOrder = (order: any, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the order detail modal

        if (window.confirm("តើអ្នកពិតជាចង់លុបការកុម្ម៉ង់នេះចោលមែនទេ? (ទិន្នន័យនឹងត្រូវលុបបាត់ជារៀងរហូត)")) {
            // 1. Restore stock if it was already deducted
            if (order.stockDeducted && typeof processStockRestoration === 'function') {
                processStockRestoration(order);
            }

            // 2. Delete the order (Try delete function, fallback to soft delete)
            if (typeof deleteOnlineOrder === 'function') {
                deleteOnlineOrder(order.id);
            } else if (typeof updateOnlineOrder === 'function') {
                // Fallback: Soft delete by changing status to something that won't render
                updateOnlineOrder(order.id, { ...order, status: 'Deleted' }, true);
            }
        }
    };

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
                        // 1. ADD TO RECEIPT HISTORY (Reports)
                        const receipt = convertOnlineOrderToReceipt(order);
                        if (setOrders) {
                            setOrders(prev => [receipt, ...prev]);
                            console.log(`✅ Receipt added to history for bulk order ${order.id}`);
                        }
                        
                        // 2. Trigger Telegram Receipt Alert (bypass stale closure with localStorage)
                        const isAutoReceiptEnabled = JSON.parse(localStorage.getItem('autoReceiptTelegram') || 'false');
                        if (isAutoReceiptEnabled) {
                            console.log("✅ Auto-Receipt is ON. Triggering Telegram Alert for bulk:", receipt.id);
                            sendReceiptAlert(receipt).catch(e => console.error("❌ Telegram Receipt Error:", e));
                        }
                        
                        // 3. DEDUCT STOCK USING CENTRALIZED FUNCTION (no race conditions)
                        if (deductStockFromOrder) {
                            deductStockFromOrder(order.items);
                        }
                        
                        updatedOrder.stockDeducted = true;
                    }
                    
                    updateOnlineOrder(order.id, updatedOrder, true);
                }
            });
        }

        setActiveMenuColumn(null); // Close menu
    };

    // Handle Printing an aggregated Pick List
    const handlePrintPickList = (currentStage: string) => {
        const ordersInColumn = onlineOrders?.filter((o: any) => o.status === currentStage) || [];
        if (ordersInColumn.length === 0) return;

        // Aggregate items
        const pickList: Record<string, number> = {};
        ordersInColumn.forEach((order: any) => {
            order.items?.forEach((item: any) => {
                const itemName = item.nameKh || item.name;
                pickList[itemName] = (pickList[itemName] || 0) + (item.quantity || 1);
            });
        });

        // Create Print Window
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        
        let html = `
            <html>
            <head>
                <title>Pick List - ${currentStage}</title>
                <style>
                    body { font-family: 'Khmer OS Battambang', sans-serif; padding: 20px; color: #333; }
                    h2 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px dashed #ccc; padding: 10px; text-align: left; font-size: 14px; }
                    th { background-color: #f8fafc; }
                    .total-row { font-weight: bold; background-color: #f1f5f9; }
                </style>
            </head>
            <body>
                <h2>បញ្ជីទាញទំនិញ (Pick List) - ជួរ: ${currentStage}</h2>
                <p>សរុបការកុម្ម៉ង់ (Total Orders): <b>${ordersInColumn.length}</b></p>
                <table>
                    <thead>
                        <tr>
                            <th>ឈ្មោះទំនិញ (Item Name)</th>
                            <th style="width: 100px; text-align: center;">ចំនួន (Qty)</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        Object.entries(pickList).forEach(([name, qty]) => {
            html += `<tr><td>${name}</td><td style="text-align: center; font-size: 18px; font-weight: bold;">${qty}</td></tr>`;
        });

        html += `
                    </tbody>
                </table>
                <script>
                    window.onload = () => { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
        setActiveMenuColumn(null);
    };

    // Handle Printing Individual Order Invoice/Receipt
    const handlePrintInvoice = (order: any, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the order detail modal
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const customerName = order.customer?.name || 'អតិថិជនទូទៅ';
        const phone = order.customer?.phone || '';
        const date = new Date(order.createdAt || order.date || Date.now()).toLocaleString('en-GB');
        const orderId = order.id || 'N/A';
        const notes = order.notes || '';
        
        const subtotal = Number(order.subtotal || 0);
        const discount = Number(order.discount || 0);
        const deliveryFee = Number(order.deliveryFee || 0);
        const total = Number(order.total || 0);
        const deposit = Number(order.deposit || 0);
        const codAmount = total - deposit;

        const qrCodeUrl = phone ? `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=tel:${phone.replace(/\s+/g, '')}` : '';

        let html = `
            <html>
            <head>
                <title>Invoice - ${orderId}</title>
                <meta charset="UTF-8">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    
                    body { 
                        font-family: 'Khmer OS Battambang', 'Courier New', monospace; 
                        color: #000; 
                        background: #fff;
                        line-height: 1.3;
                    }
                    
                    .container {
                        width: 74mm;
                        margin: 0 auto;
                        padding: 2mm;
                    }
                    
                    /* Header Section */
                    .header {
                        text-align: center;
                        margin-bottom: 3mm;
                        padding-bottom: 3mm;
                        border-bottom: 1px dashed #333;
                    }
                    
                    .store-name {
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 1mm;
                    }
                    
                    .receipt-title {
                        font-size: 11px;
                        font-weight: bold;
                        margin-bottom: 2mm;
                    }
                    
                    /* Meta Info Section */
                    .meta-info {
                        font-size: 10px;
                        margin-bottom: 3mm;
                        padding-bottom: 3mm;
                        border-bottom: 1px dashed #333;
                    }
                    
                    .meta-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 2mm;
                        line-height: 1.2;
                    }
                    
                    .meta-label {
                        font-weight: bold;
                        width: 30%;
                    }
                    
                    .meta-value {
                        width: 70%;
                        text-align: right;
                        word-break: break-word;
                    }
                    
                    /* Customer Info Section */
                    .customer-section {
                        font-size: 11px;
                        margin-bottom: 2mm;
                        padding-bottom: 2mm;
                        border-bottom: 1px dashed #333;
                    }
                    
                    .customer-header {
                        font-weight: bold;
                        font-size: 10px;
                        margin-bottom: 1mm;
                    }
                    
                    .customer-name {
                        font-weight: bold;
                        margin-bottom: 0.5mm;
                    }
                    
                    /* Items Table */
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 10px;
                        margin-bottom: 2mm;
                    }
                    
                    .items-header {
                        border-top: 1px dashed #333;
                        border-bottom: 1px dashed #333;
                        padding: 1mm 0;
                        font-weight: bold;
                        margin-bottom: 2mm;
                    }
                    
                    .item-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 1mm 0;
                        border-bottom: 1px dotted #ccc;
                    }
                    
                    .item-name {
                        flex: 1;
                    }
                    
                    .item-qty {
                        width: 15%;
                        text-align: center;
                        margin: 0 2mm;
                    }
                    
                    .item-total {
                        width: 20%;
                        text-align: right;
                        font-weight: bold;
                    }
                    
                    /* Summary Section */
                    .summary {
                        font-size: 10px;
                        margin-bottom: 2mm;
                        padding-bottom: 2mm;
                        border-bottom: 1px dashed #333;
                    }
                    
                    .summary-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 1.5mm;
                        line-height: 1.2;
                    }
                    
                    .summary-label {
                        flex: 1;
                    }
                    
                    .summary-value {
                        text-align: right;
                        font-weight: bold;
                        min-width: 20mm;
                    }
                    
                    .grand-total-section {
                        margin-top: 2mm;
                        padding-top: 2mm;
                        border-top: 1px dashed #333;
                    }
                    
                    .grand-total {
                        font-size: 11px;
                        text-align: center;
                        margin: 1mm 0;
                    }
                    
                    .grand-total-usd {
                        font-weight: bold;
                        font-size: 12px;
                    }
                    
                    .grand-total-khr {
                        font-weight: bold;
                        font-size: 12px;
                    }
                    
                    /* COD/Payment Box */
                    .cod-box {
                        background: #f8f8f8;
                        border: 1px solid #333;
                        padding: 2mm;
                        margin-bottom: 2mm;
                        text-align: center;
                        font-size: 10px;
                    }
                    
                    .cod-title {
                        font-weight: bold;
                        font-size: 11px;
                        margin-bottom: 1mm;
                        border-bottom: 1px dashed #333;
                        padding-bottom: 1mm;
                    }
                    
                    .cod-amount-usd {
                        font-size: 16px;
                        font-weight: bold;
                        margin-bottom: 1mm;
                    }
                    
                    .cod-amount-khr {
                        font-size: 14px;
                        font-weight: bold;
                        margin-bottom: 1mm;
                    }
                    
                    .cod-status {
                        font-size: 9px;
                        color: #333;
                    }
                    
                    /* Footer Section */
                    .footer {
                        text-align: center;
                        padding-top: 2mm;
                        border-top: 1px dashed #333;
                        font-size: 10px;
                    }
                    
                    .qr-code {
                        width: 50px;
                        height: 50px;
                        margin: 2mm auto;
                        display: block;
                    }
                    
                    .thank-you {
                        margin-top: 2mm;
                        font-weight: bold;
                        font-size: 11px;
                    }
                    
                    /* 80mm POS Print Styles */
                    @media print {
                        @page {
                            margin: 0;
                        }
                        
                        html, body {
                            width: 74mm;
                            padding: 0;
                            margin: 0;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        
                        body {
                            padding: 2mm;
                        }
                        
                        * {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        
                        .no-print {
                            display: none !important;
                        }
                    }
                </style>
            </head>
            <body>
                <div id="receipt-content" style="width: 74mm; padding: 2mm; margin: 0 auto;">
                    <!-- Header -->
                    <div class="header">
                        <div class="store-name">SokBiz KH</div>
                        <div class="receipt-title">វិក្កយបត្រកុម្ម៉ង់ទំនិញ</div>
                        <div class="receipt-title">Order Receipt</div>
                    </div>
                    
                    <!-- Meta Information -->
                    <div class="meta-info">
                        <div class="meta-row">
                            <div class="meta-label">អ្នកគិតលុយ:</div>
                            <div class="meta-value">Admin</div>
                        </div>
                        <div class="meta-row">
                            <div class="meta-label">ប្រភេទ:</div>
                            <div class="meta-value">Online Order</div>
                        </div>
                        <div class="meta-row">
                            <div class="meta-label">ការបង់ប្រាក់:</div>
                            <div class="meta-value">${order.paymentMethod || 'COD'}</div>
                        </div>
                        <div class="meta-row">
                            <div class="meta-label">លេខវិក្កយបត្រ:</div>
                            <div class="meta-value">${orderId}</div>
                        </div>
                        <div class="meta-row">
                            <div class="meta-label">កាលបរិច្ឆេទ:</div>
                            <div class="meta-value">${date}</div>
                        </div>
                        <div class="meta-row">
                            <div class="meta-label">អតិថិជន:</div>
                            <div class="meta-value">${customerName}</div>
                        </div>
                        <div class="meta-row">
                            <div class="meta-label">លេខទូរស័ព្ទ:</div>
                            <div class="meta-value">${phone}</div>
                        </div>
                    </div>
                    
                    <!-- Items Section -->
                    <div class="items-header">
                        <div style="display: flex; justify-content: space-between;">
                            <span>ប្រមាណ័ន្ធ / Item</span>
                            <span style="text-align: center; width: 15%; margin: 0 2mm;">Qty</span>
                            <span style="text-align: right; width: 20%;">ថ្លៃ</span>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 2mm;">
        `;

        order.items?.forEach((item: any) => {
            const itemName = item.nameKh || item.name;
            const qty = item.quantity || 1;
            const itemTotal = (Number(item.price) || 0) * qty;
            html += `
                        <div class="item-row">
                            <div class="item-name">${itemName}</div>
                            <div class="item-qty">${qty}</div>
                            <div class="item-total">$${itemTotal.toFixed(2)}</div>
                        </div>
            `;
        });

        html += `
                    </div>
                    
                    <!-- Summary Section -->
                    <div class="summary">
                        <div class="summary-row">
                            <div class="summary-label">សរុបរង (Subtotal):</div>
                            <div class="summary-value">$${subtotal.toFixed(2)}</div>
                        </div>
                        ${discount > 0 ? `
                        <div class="summary-row">
                            <div class="summary-label">បញ្ចុះតម្លៃ (Discount):</div>
                            <div class="summary-value">-$${discount.toFixed(2)}</div>
                        </div>
                        ` : ''}
                        <div class="summary-row">
                            <div class="summary-label">ថ្លៃដឹក (Delivery):</div>
                            <div class="summary-value">$${deliveryFee.toFixed(2)}</div>
                        </div>
                        ${deposit > 0 ? `
                        <div class="summary-row">
                            <div class="summary-label">បានកក់មុន (Deposit):</div>
                            <div class="summary-value">-$${deposit.toFixed(2)}</div>
                        </div>
                        ` : ''}
                        
                        <div class="grand-total-section">
                            <div class="grand-total">
                                <div class="summary-label">សរុបត្រូវបង់ (Grand Total)</div>
                                <div class="grand-total-usd">$${total.toFixed(2)}</div>
                                <div class="grand-total-khr">${(total * 4100).toLocaleString()} ៛</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- COD/Payment Box -->
                    <div class="cod-box">
                        <div class="cod-title">
                            ${codAmount > 0 ? 'ប្រាក់ត្រូវប្រមូល (COD)' : ' સ્થિતિ (Status)'}
                        </div>
                        ${codAmount > 0 ? `
                            <div class="cod-amount-usd">$${codAmount.toFixed(2)}</div>
                            <div class="cod-amount-khr">${(codAmount * 4100).toLocaleString()} ៛</div>
                        ` : `
                            <div class="cod-status">✓ PAID IN FULL</div>
                            <div class="cod-status">បង់ប្រាក់រួចរាល់</div>
                        `}
                    </div>
                    
                    <!-- Footer with QR Code -->
                    <div class="footer">
                        ${qrCodeUrl ? `<img src="${qrCodeUrl}" class="qr-code" alt="Call" />` : ''}
                        <div class="thank-you">សូមអរគុណ! ❤️</div>
                        <div style="font-size: 9px; margin-top: 1mm;">Thank You!</div>
                    </div>
                </div>
                
                <script>
                    window.onload = () => {
                        // Measure the actual height of the receipt content
                        const content = document.getElementById('receipt-content');
                        const heightPx = content.offsetHeight;
                        
                        // Convert pixels to millimeters (1px ≈ 0.264583mm) and add a 5mm safe buffer at the bottom
                        const heightMm = Math.ceil(heightPx * 0.264583) + 5;
                        
                        // Inject dynamic page size to force 1 continuous page
                        const style = document.createElement('style');
                        style.innerHTML = '@media print { @page { size: 80mm ' + heightMm + 'mm !important; margin: 0 !important; } }';
                        document.head.appendChild(style);
                        
                        // Print after injecting styles
                        setTimeout(() => { window.print(); window.close(); }, 500);
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    // Handle Clearing/Archiving the column
    const handleClearColumn = (currentStage: string) => {
        const ordersToClear = onlineOrders?.filter((o: any) => o.status === currentStage) || [];
        if (ordersToClear.length === 0) return;

        if (window.confirm(`តើអ្នកពិតជាចង់សម្អាតការកុម្ម៉ង់ទាំង ${ordersToClear.length} នេះចូលទៅក្នុង Archive មែនទេ?`)) {
            ordersToClear.forEach((order: any) => {
                if (updateOrderStatus) {
                    updateOrderStatus(order.id, 'Archived');
                }
            });
        }
        setActiveMenuColumn(null);
    };

    // Handle Exporting Column Data to CSV
    // Handle Exporting Column Data to CSV (Fixed for Excel & Syntax Error Resolved)
    const handleExportCSV = (currentStage: string) => {
        const ordersInColumn = onlineOrders?.filter((o: any) => o.status === currentStage) || [];
        if (ordersInColumn.length === 0) {
            alert("មិនមានទិន្នន័យសម្រាប់ទាញយកទេ (No data to export)");
            return;
        }

        const headers = ['Order ID', 'Customer Name', 'Phone', 'Items', 'Payment Method', 'Total', 'Date'];
        
        const csvRows = ordersInColumn.map((order: any) => {
            const orderId = order.id || '';
            const customerName = order.customer?.name || 'General Customer';
            const phone = order.customer?.phone || 'N/A';
            const itemsString = order.items?.map((item: any) => `${item.quantity || 1}x ${item.nameKh || item.name}`).join('; ') || '';
            const method = order.paymentMethod || 'N/A';
            const total = `$${Number(order.total || 0).toFixed(2)}`;
            const date = new Date(order.createdAt || order.date || Date.now()).toLocaleString('en-GB');

            // Wrap each field in quotes to handle commas inside text safely
            return [orderId, customerName, phone, itemsString, method, total, date]
                .map(field => `"${String(field).replace(/"/g, '""')}"`)
                .join(',');
        });

        // 1. Add sep=, so Excel parses columns correctly
        // 2. Combine headers and rows
        const csvString = "sep=,\n" + headers.join(',') + "\n" + csvRows.join('\n');

        // Add BOM (Byte Order Mark) so Excel reads Khmer Unicode
        const bom = '\uFEFF';
        const blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Orders_${currentStage}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setActiveMenuColumn(null); // Close menu
    };

    // Handle Exporting Column Data to PDF (True PDF Download via html2pdf.js - Ultimate Fit Fix)
    const handleExportPDF = (currentStage: string) => {
        const ordersInColumn = onlineOrders?.filter((o: any) => o.status === currentStage) || [];
        if (ordersInColumn.length === 0) {
            alert("មិនមានទិន្នន័យសម្រាប់ទាញយកទេ (No data to export)");
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        let grandTotal = 0;

        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Order Report - ${currentStage}</title>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
                <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
                <style>
                    body { 
                        font-family: 'Khmer OS Battambang', 'Arial', sans-serif; 
                        background-color: #f1f5f9;
                        margin: 0;
                        padding: 0;
                        color: #1e293b; 
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .action-bar {
                        width: 100%;
                        background-color: #1e293b;
                        padding: 15px 20px;
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                        position: sticky;
                        top: 0;
                        z-index: 100;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                        box-sizing: border-box;
                    }
                    .btn {
                        padding: 10px 20px;
                        border-radius: 8px;
                        font-family: 'Khmer OS Battambang', sans-serif;
                        font-weight: bold;
                        font-size: 14px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        border: none;
                        transition: all 0.2s;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .btn:active { transform: scale(0.96); }
                    .btn-print { background-color: #3b82f6; color: white; }
                    .btn-print:hover { background-color: #2563eb; }
                    .btn-download { background-color: #10b981; color: white; }
                    .btn-download:hover { background-color: #059669; }
                    .btn-download:disabled { background-color: #94a3b8; cursor: not-allowed; transform: none; }
                    .btn-close { background-color: #64748b; color: white; }
                    .btn-close:hover { background-color: #475569; }
                    
                    /* A4 Page Preview Container */
                    .page-preview {
                        width: 210mm;
                        min-height: 297mm;
                        padding: 15mm;
                        margin: 40px auto;
                        background: white;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                        box-sizing: border-box;
                    }

                    /* PDF Content - Fluid layout with safe padding */
                    #pdf-content { background: white; padding: 20px; box-sizing: border-box; width: 100%; margin: 0 auto; }

                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
                    h2 { margin: 0; color: #0f172a; font-size: 24px; }
                    .subtitle { color: #64748b; font-size: 14px; margin-top: 5px; }
                    
                    table { width: 96%; margin: 20px auto; border-collapse: collapse; font-size: 12px; }
                    th, td { border: 1px solid #cbd5e1; padding: 12px 10px; text-align: left; }
                    th { background-color: #f8fafc; color: #334155; font-weight: bold; font-size: 13px; text-transform: uppercase; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .total-row { font-weight: bold; background-color: #f8fafc; font-size: 14px; }
                    .total-row td { border-top: 2px solid #94a3b8; }

                    @media print {
                        body { background-color: white; margin: 0; display: block; }
                        .action-bar { display: none !important; }
                        .page-preview { margin: 0; padding: 0; width: 100%; min-height: auto; box-shadow: none; }
                        @page { margin: 1cm; size: A4 portrait; }
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <div class="action-bar no-print">
                    <button class="btn btn-close" onclick="window.close()">
                        <span class="material-icons-round" style="font-size: 18px;">close</span> បិទ (Close)
                    </button>
                    <button class="btn btn-print" onclick="window.print()">
                        <span class="material-icons-round" style="font-size: 18px;">print</span> បោះពុម្ព (Print)
                    </button>
                    <button class="btn btn-download" id="downloadBtn" onclick="downloadRealPDF()">
                        <span class="material-icons-round" style="font-size: 18px;">picture_as_pdf</span> ទាញយកជា PDF
                    </button>
                </div>

                <div class="page-preview">
                    <div id="pdf-content">
                        <div class="header">
                            <h2>របាយការណ៍ការកុម្ម៉ង់ (Order Report) - ជួរ: ${currentStage}</h2>
                            <div class="subtitle">កាលបរិច្ឆេទ (Date): ${new Date().toLocaleDateString('en-GB')} | ចំនួនសរុប (Total Orders): ${ordersInColumn.length}</div>
                        </div>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 80px;">Order ID</th>
                                    <th>អតិថិជន (Customer)</th>
                                    <th style="width: 100px;">លេខទូរស័ព្ទ</th>
                                    <th>ទំនិញ (Items)</th>
                                    <th class="text-center" style="width: 80px;">ប្រភេទបង់</th>
                                    <th class="text-right" style="width: 80px;">សរុប</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

        ordersInColumn.forEach((order: any) => {
            const orderId = order.id || 'N/A';
            const customerName = order.customer?.name || 'General Customer';
            const phone = order.customer?.phone || 'N/A';
            const itemsString = order.items?.map((item: any) => `${item.quantity || 1}x ${item.nameKh || item.name}`).join('<br/>') || '';
            const method = order.paymentMethod || 'COD';
            const total = Number(order.total || 0);
            grandTotal += total;

            html += `
                <tr>
                    <td style="font-family: monospace; font-size: 11px;">${orderId}</td>
                    <td><b>${customerName}</b></td>
                    <td>${phone}</td>
                    <td>${itemsString}</td>
                    <td class="text-center">${method}</td>
                    <td class="text-right">$${total.toFixed(2)}</td>
                </tr>
            `;
        });

        html += `
                            </tbody>
                            <tfoot>
                                <tr class="total-row">
                                    <td colspan="5" class="text-right">សរុបទឹកប្រាក់ (Grand Total):</td>
                                    <td class="text-right" style="color: #2563eb;">$${grandTotal.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <script>
                    function downloadRealPDF() {
                        const btn = document.getElementById('downloadBtn');
                        const element = document.getElementById('pdf-content');
                        
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '<span class="material-icons-round" style="font-size: 18px;">hourglass_empty</span> កំពុងទាញយក...';
                        btn.disabled = true;

                        const opt = {
                            margin:       10,
                            filename:     'Order_Report_${currentStage}_${new Date().toISOString().split('T')[0]}.pdf',
                            image:        { type: 'jpeg', quality: 0.98 },
                            html2canvas:  { scale: 2, useCORS: true },
                            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                        };

                        html2pdf().set(opt).from(element).save().then(() => {
                            btn.innerHTML = originalText;
                            btn.disabled = false;
                        }).catch(err => {
                            console.error("PDF Generation Error: ", err);
                            alert("មានបញ្ហាក្នុងការបង្កើត PDF សូមព្យាយាមម្តងទៀត!");
                            btn.innerHTML = originalText;
                            btn.disabled = false;
                        });
                    }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        setActiveMenuColumn(null); // Close menu
    };

    // Toggle individual order selection
    const toggleOrderSelection = (orderId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the detail modal
        setSelectedOrders(prev => 
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    // Select all orders in a specific column
    const handleSelectAllInColumn = (stage: string) => {
        const ordersInColumn = onlineOrders?.filter((o: any) => o.status === stage) || [];
        const columnOrderIds = ordersInColumn.map((o: any) => o.id);
        setSelectedOrders(prev => Array.from(new Set([...prev, ...columnOrderIds])));
        setActiveMenuColumn(null); // Close menu
    };

    // Handle bulk status change from the Floating Action Bar
    const handleFloatingBulkAction = (newStatus: string) => {
        if (selectedOrders.length === 0) return;
        
        if (window.confirm(`តើអ្នកពិតជាចង់រុញការកុម្ម៉ង់ដែលបានជ្រើសរើសទាំង ${selectedOrders.length} ទៅកាន់ជួរ "${newStatus}" មែនទេ?`)) {
            selectedOrders.forEach(id => {
                const orderToUpdate = onlineOrders?.find((o: any) => o.id === id);
                if (orderToUpdate && updateOnlineOrder) {
                    let updatedOrder = { ...orderToUpdate, status: newStatus };
                    if (newStatus === 'Completed' && !orderToUpdate.stockDeducted) {
                        // Add receipt to history
                        const receipt = convertOnlineOrderToReceipt(orderToUpdate);
                        if (setOrders) {
                            setOrders(prev => [receipt, ...prev]);
                        }
                        
                        // Trigger Telegram Receipt Alert (bypass stale closure with localStorage)
                        const isAutoReceiptEnabled = JSON.parse(localStorage.getItem('autoReceiptTelegram') || 'false');
                        if (isAutoReceiptEnabled) {
                            console.log("✅ Auto-Receipt is ON. Triggering Telegram Alert for:", receipt.id);
                            sendReceiptAlert(receipt).catch(e => console.error("❌ Telegram Receipt Error:", e));
                        }
                        
                        // Use centralized stock deduction
                        if (deductStockFromOrder) {
                            deductStockFromOrder(orderToUpdate.items);
                        }
                        updatedOrder.stockDeducted = true;
                    }
                    updateOnlineOrder(id, updatedOrder, true);
                }
            });
            setSelectedOrders([]); // Clear selection after move
        }
    };

    // --- Order Card Component ---
    // Handle setting the sort method for a specific column
    const handleSort = (stage: string, method: string) => {
        setColumnSorts(prev => ({ ...prev, [stage]: method }));
        // Intentionally not closing the menu so the user can see the button highlight change
    };

    // Get sorted orders dynamically for rendering
    const getSortedOrdersForColumn = (stage: string) => {
        const ordersInColumn = filteredOrders?.filter((o: any) => o.status === stage) || [];
        const method = columnSorts[stage] || 'newest'; // default to newest
        
        return [...ordersInColumn].sort((a, b) => {
            if (method === 'price_high') return (Number(b.total) || 0) - (Number(a.total) || 0);
            if (method === 'price_low') return (Number(a.total) || 0) - (Number(b.total) || 0);
            
            // Time sorting fallback (comparing timestamps or IDs)
            const timeA = new Date(a.date || a.createdAt || 0).getTime();
            const timeB = new Date(b.date || b.createdAt || 0).getTime();
            
            if (method === 'oldest') {
                return timeA === timeB ? String(a.id).localeCompare(String(b.id)) : timeA - timeB;
            }
            // Default: newest
            return timeA === timeB ? String(b.id).localeCompare(String(a.id)) : timeB - timeA;
        });
    };

    const OrderCard: React.FC<{ order: OnlineOrder }> = ({ order }) => {
        const sourceInfo = getSourceInfo(order.customer.phone);
        const firstItem = order.items[0];
        const otherItemsCount = order.items.length - 1;
        
        // Carrier Info
        const carrierName = order.shippingCarrier || order.shippingDetails?.courier;
        const carrierBadge = getCarrierBadge(carrierName);
        const paymentBadge = getPaymentStatusBadge(order.paymentMethod);

        // Smart Time Alert: Check if order is delayed (New/Packing + >30 min old)
        const isDelayed = () => {
            if (!['New', 'Packing'].includes(order.status)) return false;
            const orderDate = new Date(order.date);
            const now = new Date();
            const minutes = (now.getTime() - orderDate.getTime()) / (1000 * 60);
            return minutes > 30;
        };
        const isOrderDelayed = isDelayed();

        // Decode hidden deposit from transactionId
        let displayDeposit = Number(order.deposit || 0);
        let displayTxId = order.transactionId || '';

        if (typeof displayTxId === 'string' && displayTxId.includes('[DEP:')) {
            const match = displayTxId.match(/\[DEP:([0-9.]+)\]\s(.*)/);
            if (match) {
                displayDeposit = parseFloat(match[1]);
            }
        }

        const isCODWithDeposit = order.paymentMethod === 'COD' && displayDeposit > 0;
        const amountToCollect = Number(order.total || 0) - displayDeposit;

        // Quick Actions
        const handlePrint = (e: React.MouseEvent) => {
            e.stopPropagation();
            // Select order first to ensure context is updated
            selectOnlineOrder(order.id);
            // Open Modal
            setIsShippingLabelModalOpen(true);
        };

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
                        
                        // CENTRALIZED PATTERN: Receipt + Stock Deduction + Telegram Alert
                        
                        // 1. ADD TO RECEIPT HISTORY (Reports)
                        const receipt = convertOnlineOrderToReceipt(order);
                        if (setOrders) {
                            setOrders(prev => [receipt, ...prev]);
                            console.log(`✅ Receipt added to history for order ${order.id}`);
                        }
                        
                        // 2. Trigger Telegram Receipt Alert (bypass stale closure with localStorage)
                        const isAutoReceiptEnabled = JSON.parse(localStorage.getItem('autoReceiptTelegram') || 'false');
                        if (isAutoReceiptEnabled) {
                            console.log("✅ Auto-Receipt is ON. Triggering Telegram Alert for:", receipt.id);
                            sendReceiptAlert(receipt).catch(e => console.error("❌ Telegram Receipt Error:", e));
                        }
                        
                        // 3. DEDUCT STOCK USING CENTRALIZED FUNCTION (no race conditions)
                        if (!order.stockDeducted && deductStockFromOrder) {
                            deductStockFromOrder(order.items);
                            updatedOrder.stockDeducted = true;
                        }
                        
                        updateOnlineOrder(order.id, updatedOrder, true);
                    }
                }
            }
        };

        return (
            <div 
                onClick={() => selectOnlineOrder(order.id)}
                className={`p-3 rounded-xl border relative group cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden ${
                    order.status === 'Completed' 
                        ? 'bg-green-50/40 dark:bg-green-900/10 border-green-200 dark:border-green-800/50 opacity-95' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
            >
                {/* If Completed, add a subtle watermark icon in the background */}
                {order.status === 'Completed' && (
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 material-icons-round text-[80px] text-green-500/5 dark:text-green-400/5 pointer-events-none z-0">
                        check_circle
                    </span>
                )}
                
                {/* Status Stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 
                    ${order.status === 'New' ? 'bg-primary' : ''}
                    ${order.status === 'Packing' ? 'bg-orange-500' : ''}
                    ${order.status === 'Shipping' ? 'bg-indigo-500' : ''}
                    ${order.status === 'Completed' ? 'bg-emerald-500' : ''}
                `}></div>
                
                {/* Multi-Select Checkbox */}
                <div className="absolute top-3 left-3 z-10">
                    <input 
                        type="checkbox" 
                        checked={selectedOrders.includes(order.id)}
                        onChange={(e) => toggleOrderSelection(order.id, e as any)}
                        onClick={(e) => e.stopPropagation()}
                        className={`w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary shadow-sm cursor-pointer transition-opacity duration-200 ${selectedOrders.includes(order.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    />
                </div>
                
                <div className="p-3 pb-2 flex-1">
                    {/* Header: Customer Name (Large) & Order ID (Small) */}
                    <div className="flex justify-between items-start mb-2 pl-2">
                        <div className="flex flex-col flex-1">
                            <span className="font-bold text-slate-900 dark:text-white text-sm hover:text-primary transition-colors font-khmer">{order.customer.name}</span>
                            <span className={`text-[10px] font-medium flex items-center gap-1 ${isOrderDelayed ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                                <Clock size={10} /> {order.elapsedTime}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">{order.id}</span>
                        </div>
                        {/* Dynamic Price Display */}
                        <div className="text-right flex flex-col items-end justify-center ml-2">
                            {isCODWithDeposit ? (
                                <>
                                    <span className="text-[13px] font-black text-red-600 dark:text-red-500 font-mono leading-none" title="ត្រូវប្រមូលពីភ្ញៀវ (To Collect)">
                                        COD: ${Math.max(0, amountToCollect).toFixed(2)}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium line-through leading-none mt-1" title="សរុប (Grand Total)">
                                        ${Number(order.total).toFixed(2)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                                    ${Number(order.total || 0).toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Customer & Source */}
                    <div className="flex items-center gap-2 mb-3 pl-2">
                        {order.customer.avatar?.startsWith('http') ? (
                            <img alt={order.customer.name} className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-600" src={order.customer.avatar} />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 text-[10px] font-bold border border-slate-200 dark:border-slate-600">
                                {order.customer.name?.slice(0, 1) ?? '?'}
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[80px]">{order.customer.phone}</span>
                            {/* Source Badge */}
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] border text-[10px] font-medium leading-none ${sourceInfo.color}`}>
                                {sourceInfo.icon}
                                <span className="hidden sm:inline-block">{sourceInfo.label}</span>
                            </div>
                        </div>
                    </div>

                    {/* Item Preview (Crucial) */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 ml-2 mb-2 border border-slate-100 dark:border-slate-700/50">
                        {firstItem ? (
                            <div className="flex items-start gap-2">
                                <div className="mt-0.5 min-w-[6px] h-[6px] rounded-full bg-red-500"></div>
                                <div className="text-xs text-slate-600 dark:text-slate-300 leading-tight">
                                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                                        {firstItem.name} <span className="text-slate-500">x{firstItem.quantity}</span>
                                    </span>
                                    {otherItemsCount > 0 && (
                                        <span className="text-slate-400 ml-1">+{otherItemsCount} others</span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <span className="text-xs text-slate-400 italic pl-1">No items</span>
                        )}
                        
                        {/* Driver Info if Shipping */}
                        {order.status === 'Shipping' && order.driver && (
                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 text-[10px] text-slate-500">
                                <Truck size={12} className="text-indigo-500" />
                                <span>{order.driver.name} • {order.shippingDetails?.courier || 'Express'}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Action Footer */}
                <div className="bg-slate-50/80 dark:bg-slate-800/80 px-3 py-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center ml-1 gap-2">
                    
                    {/* Left: Carrier Badge & Payment Status */}
                    <div className="flex gap-2">
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold shadow-sm ${carrierBadge.color}`}>
                            <span className="material-icons-round text-[12px]">{carrierBadge.icon}</span>
                            <span>{carrierBadge.short}</span>
                        </div>
                        <div className={`flex items-center px-2 py-1 rounded-md text-[10px] font-semibold shadow-sm ${paymentBadge.color}`}>
                            <span>{paymentBadge.label}</span>
                        </div>
                    </div>

                    {/* Right: Quick Actions */}
                    <div className="flex gap-2">
                        {/* Print Invoice/Receipt (New) */}
                        <button 
                            onClick={(e) => handlePrintInvoice(order, e)}
                            className="p-1.5 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="បោះពុម្ពវិក្កយបត្រ (Print Invoice)"
                        >
                            <span className="material-icons-round text-[16px]">receipt_long</span>
                        </button>
                        
                        <button 
                            onClick={handlePrint}
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                            title="Quick Print Label"
                        >
                            <Printer size={14} />
                        </button>

                        {/* Delete Button */}
                        {canDelete && (
                        <button 
                            onClick={(e) => handleDeleteOrder(order, e)}
                            className="p-1.5 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 hover:text-red-500 transition-colors mr-1"
                            title="លុបការកុម្ម៉ង់ចោល (Delete Order)"
                        >
                            <span className="material-icons-round text-[16px]">delete_outline</span>
                        </button>
                        )}
                        
                        {order.status !== 'Completed' && (
                            <button 
                                onClick={handleNextStage}
                                className={`flex items-center gap-1 pl-2 pr-1.5 py-1 rounded-md text-[10px] font-bold text-white shadow-sm transition-all active:scale-95
                                    ${order.status === 'New' ? 'bg-primary hover:bg-primary-hover' : ''}
                                    ${order.status === 'Packing' ? 'bg-indigo-500 hover:bg-indigo-600' : ''}
                                    ${order.status === 'Shipping' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                                `}
                                title="Move to Next Stage"
                            >
                                {order.status === 'New' && 'PACK'}
                                {order.status === 'Packing' && 'SHIP'}
                                {order.status === 'Shipping' && 'DONE'}
                                <ArrowRight size={12} />
                            </button>
                        )}

                        {/* New Completed Actions */}
                        {order.status === 'Completed' && (
                            <div className="flex items-center gap-1.5 relative z-10">
                                <button 
                                    onClick={(e) => handleArchiveSingle(order, e)}
                                    className="px-2.5 py-1 text-[11px] font-bold rounded border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1 font-khmer bg-white dark:bg-slate-800"
                                    title="លាក់ទុក (Archive)"
                                >
                                    <span className="material-icons-round text-[13px]">inventory_2</span> លាក់
                                </button>
                                <button 
                                    onClick={(e) => handleUndoComplete(order, e)}
                                    className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1 font-khmer border border-slate-200 dark:border-slate-600"
                                    title="ត្រឡប់ទៅ 'កំពុងដឹក' វិញ"
                                >
                                    <span className="material-icons-round text-[13px]">undo</span> ត្រឡប់
                                </button>
                                {canDelete && (
                                <button 
                                    onClick={(e) => handleDeleteOrder(order, e)}
                                    className="px-2.5 py-1 text-[11px] font-bold rounded border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center gap-1 font-khmer bg-white dark:bg-slate-800"
                                    title="លុបការកុម្ម៉ង់ចោល (Delete Order)"
                                >
                                    <span className="material-icons-round text-[13px]">delete_outline</span> លុប
                                </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full overflow-hidden font-display bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 flex-shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center text-slate-500 dark:text-slate-400 text-sm">
                        <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => window.location.reload()}>Home</span>
                        <span className="material-icons-outlined text-base mx-1">chevron_right</span>
                        <span className="hover:text-primary cursor-pointer transition-colors">Operations</span>
                        <span className="material-icons-outlined text-base mx-1">chevron_right</span>
                        <span className="text-slate-800 dark:text-slate-100 font-medium">Online Orders</span>
                    </div>
                    <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Order Board</h1>
                </div>
                <div className="flex flex-nowrap overflow-x-auto md:overflow-x-visible items-center gap-3 w-full md:w-auto px-4 md:px-0 pb-2 md:pb-0">
                    {/* Search */}
                    <div className="relative group shrink-0">
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all w-[200px] md:w-64" 
                            placeholder="Search Order ID, Customer..." 
                            type="text" 
                        />
                        <span className="material-icons-outlined absolute left-2.5 top-2 text-slate-400 group-focus-within:text-primary text-lg">search</span>
                    </div>
                    
                    {/* Date Filter Dropdown */}
                    <div className="relative shrink-0">
                        <button 
                            onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
                        >
                            <span className="material-icons-outlined text-slate-500 dark:text-slate-400">calendar_today</span>
                            <span className="font-khmer">{dateFilter}</span>
                            <span className="material-icons-outlined text-slate-400 text-sm">expand_more</span>
                        </button>
                        
                        {isDateDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsDateDropdownOpen(false)}></div>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                    <div className="py-1">
                                        {dateOptions.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => {
                                                    setDateFilter(option);
                                                    setIsDateDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-khmer ${dateFilter === option ? 'text-primary bg-primary/5 font-semibold' : 'text-slate-700 dark:text-slate-200'}`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Refresh Button */}
                    <button className="shrink-0 p-2 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary-50 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Refresh Board">
                        <span className="material-icons-outlined">refresh</span>
                    </button>
                    {/* History Button */}
                    <button 
                        onClick={() => setShowHistoryModal(true)}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-bold font-khmer flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
                        title="មើលប្រវត្តិដែលបានលាក់"
                    >
                        <span className="material-icons-round text-[18px]">history</span> ប្រវត្តិ
                    </button>
                    {/* Create Button */}
                    <button 
                        onClick={handleCreateOrder}
                        className="shrink-0 flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30 ml-2"
                    >
                        <span className="material-icons-outlined text-base">add</span>
                        <span className="font-khmer">បង្កើតថ្មី</span>
                    </button>
                </div>
            </header>

            {/* Kanban Board */}
            <main className="flex-1 overflow-hidden p-6 kanban-container">
                <div className="flex flex-nowrap overflow-x-auto overflow-y-hidden gap-6 h-[calc(100vh-220px)]">
                    {/* New Column */}
                    <div className="flex flex-col shrink-0 w-[320px] min-w-[320px] snap-center snap-always max-h-full">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20"></div>
                                <h2 className="font-khmer text-lg font-bold text-slate-800 dark:text-white">ថ្មី <span className="text-sm font-display font-normal text-slate-500 dark:text-slate-400 ml-1">(New)</span></h2>
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">{newOrders.length}</span>
                            </div>

                            {/* Column Options Menu */}
                            <div className="relative ml-auto">
                                <button 
                                    onClick={() => setActiveMenuColumn(activeMenuColumn === 'New' ? null : 'New')}
                                    className="p-1 flex items-center justify-center text-slate-400 hover:text-primary rounded-md hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                                    title="ជម្រើសបន្ថែម (Options)"
                                >
                                    <span className="material-icons-round text-[18px] leading-none">more_horiz</span>
                                </button>
                                
                                {activeMenuColumn === 'New' && (
                                    <>
                                        {/* Invisible backdrop to close menu when clicking outside */}
                                        <div className="fixed inset-0 z-20" onClick={() => setActiveMenuColumn(null)}></div>
                                        
                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 py-1">
                                            {/* 1. Bulk Move (Only if there is a next stage) */}
                                            {getNextStage('New') && (
                                                <button 
                                                    onClick={() => handleBulkMove('New')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-primary transition-colors flex items-center gap-2 group"
                                                >
                                                    <span className="material-icons-round text-[16px] text-slate-400 group-hover:text-primary">low_priority</span>
                                                    រុញទាំងអស់ទៅជួរបន្ទាប់
                                                </button>
                                            )}

                                            {/* 2. Print Pick List (Good for New/Packing/Shipping) */}
                                            {true && (
                                                <button 
                                                    onClick={() => handlePrintPickList('New')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2 group border-t border-slate-100 dark:border-slate-700"
                                                >
                                                    <span className="material-icons-round text-[16px] text-slate-400 group-hover:text-slate-600">print</span>
                                                    បោះពុម្ពបញ្ជីទាញទំនិញ
                                                </button>
                                            )}

                                            {/* 3. Clear Column (Only for Completed) */}
                                            {false && (
                                                <button 
                                                    onClick={() => handleClearColumn('New')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 group"
                                                >
                                                    <span className="material-icons-round text-[16px] text-red-400 group-hover:text-red-600">delete_sweep</span>
                                                    សម្អាតជួរនេះ (Archive)
                                                </button>
                                            )}

                                            {/* Select All in Column */}
                                            {onlineOrders?.filter((o: any) => o.status === 'New').length > 0 && (
                                                <button 
                                                    onClick={() => handleSelectAllInColumn('New')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-2 group border-t border-slate-100 dark:border-slate-700"
                                                >
                                                    <span className="material-icons-round text-[16px] text-indigo-500 group-hover:text-indigo-600">checklist</span>
                                                    ជ្រើសរើស2ឡើងទៅ (Multi Select)
                                                </button>
                                            )}

                                            {/* Export to CSV (Available for all columns if there are orders) */}
                                            {onlineOrders?.filter((o: any) => o.status === 'New').length > 0 && (
                                                <button 
                                                    onClick={() => handleExportCSV('New')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-2 group border-t border-slate-100 dark:border-slate-700"
                                                >
                                                    <span className="material-icons-round text-[16px] text-green-500 group-hover:text-green-600">file_download</span>
                                                    ទាញទិន្នន័យ (Export Excel)
                                                </button>
                                            )}

                                            {/* Export to PDF (Available for all columns if there are orders) */}
                                            {onlineOrders?.filter((o: any) => o.status === 'New').length > 0 && (
                                                <button 
                                                    onClick={() => handleExportPDF('New')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 group border-t border-slate-100 dark:border-slate-700"
                                                >
                                                    <span className="material-icons-round text-[16px] text-red-500 group-hover:text-red-600">picture_as_pdf</span>
                                                    ទាញទិន្នន័យ (Export PDF)
                                                </button>
                                            )}

                                            {/* 4. Sort Options (Always visible) */}
                                            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-khmer flex items-center gap-1.5 mb-2">
                                                    <span className="material-icons-round text-[14px]">sort</span> តម្រៀបតាម (Sort By)
                                                </span>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    <button onClick={() => handleSort('New', 'newest')} className={`text-[11px] py-1.5 rounded-md flex items-center justify-center gap-1.5 border transition-all ${columnSorts['New'] === 'newest' || !columnSorts['New'] ? 'bg-primary/10 text-primary border-primary/30 font-bold shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}>
                                                        🕒 ថ្មី
                                                    </button>
                                                    <button onClick={() => handleSort('New', 'oldest')} className={`text-[11px] py-1.5 rounded-md flex items-center justify-center gap-1.5 border transition-all ${columnSorts['New'] === 'oldest' ? 'bg-primary/10 text-primary border-primary/30 font-bold shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}>
                                                        ⏳ ចាស់
                                                    </button>
                                                    <button onClick={() => handleSort('New', 'price_high')} className={`text-[11px] py-1.5 rounded-md flex items-center justify-center gap-1.5 border transition-all ${columnSorts['New'] === 'price_high' ? 'bg-primary/10 text-primary border-primary/30 font-bold shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}>
                                                        💰 ច្រើន
                                                    </button>
                                                    <button onClick={() => handleSort('New', 'price_low')} className={`text-[11px] py-1.5 rounded-md flex items-center justify-center gap-1.5 border transition-all ${columnSorts['New'] === 'price_low' ? 'bg-primary/10 text-primary border-primary/30 font-bold shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}>
                                                        💵 តិច
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto overflow-x-hidden column-scroll pr-2 space-y-3 custom-scrollbar pb-4">
                            {getSortedOrdersForColumn('New').map(order => <OrderCard key={order.id} order={order} />)}
                        </div>
                    </div>

                    {/* Packing Column */}
                    <div className="flex flex-col shrink-0 w-[320px] min-w-[320px] snap-center snap-always max-h-full">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-500/20"></div>
                                <h2 className="font-khmer text-lg font-bold text-slate-800 dark:text-white">កំពុងខ្ចប់ <span className="text-sm font-display font-normal text-slate-500 dark:text-slate-400 ml-1">(Packing)</span></h2>
                                <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full">{packingOrders.length}</span>
                            </div>

                            {/* Column Options Menu */}
                            <div className="relative ml-auto">
                                <button 
                                    onClick={() => setActiveMenuColumn(activeMenuColumn === 'Packing' ? null : 'Packing')}
                                    className="p-1 flex items-center justify-center text-slate-400 hover:text-primary rounded-md hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                                    title="ជម្រើសបន្ថែម (Options)"
                                >
                                    <span className="material-icons-round text-[18px] leading-none">more_horiz</span>
                                </button>
                                
                                {activeMenuColumn === 'Packing' && (
                                    <>
                                        {/* Invisible backdrop to close menu when clicking outside */}
                                        <div className="fixed inset-0 z-20" onClick={() => setActiveMenuColumn(null)}></div>
                                        
                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 py-1">
                                            {/* 1. Bulk Move (Only if there is a next stage) */}
                                            {getNextStage('Packing') && (
                                                <button 
                                                    onClick={() => handleBulkMove('Packing')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-primary transition-colors flex items-center gap-2 group"
                                                >
                                                    <span className="material-icons-round text-[16px] text-slate-400 group-hover:text-primary">low_priority</span>
                                                    រុញទាំងអស់ទៅជួរបន្ទាប់
                                                </button>
                                            )}

                                            {/* 2. Print Pick List (Good for New/Packing/Shipping) */}
                                            {true && (
                                                <button 
                                                    onClick={() => handlePrintPickList('Packing')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2 group border-t border-slate-100 dark:border-slate-700"
                                                >
                                                    <span className="material-icons-round text-[16px] text-slate-400 group-hover:text-slate-600">print</span>
                                                    បោះពុម្ពបញ្ជីទាញទំនិញ
                                                </button>
                                            )}

                                            {/* 3. Clear Column (Only for Completed) */}
                                            {false && (
                                                <button 
                                                    onClick={() => handleClearColumn('Packing')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 group"
                                                >
                                                    <span className="material-icons-round text-[16px] text-red-400 group-hover:text-red-600">delete_sweep</span>
                                                    សម្អាតជួរនេះ (Archive)
                                                </button>
                                            )}

                                            {/* Select All in Column */}
                                            {onlineOrders?.filter((o: any) => o.status === 'Packing').length > 0 && (
                                                <button 
                                                    onClick={() => handleSelectAllInColumn('Packing')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-2 group border-t border-slate-100 dark:border-slate-700"
                                                >
                                                    <span className="material-icons-round text-[16px] text-indigo-500 group-hover:text-indigo-600">checklist</span>
                                                    ជ្រើសរើស2ឡើងទៅ (Multi Select)
                                                </button>
                                            )}

                                            {/* Export to CSV (Available for all columns if there are orders) */}
                                            {onlineOrders?.filter((o: any) => o.status === 'Packing').length > 0 && (
                                                <button 
                                                    onClick={() => handleExportCSV('Packing')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-2 group border-t border-slate-100 dark:border-slate-700"
                                                >
                                                    <span className="material-icons-round text-[16px] text-green-500 group-hover:text-green-600">file_download</span>
                                                    ទាញទិន្នន័យ (Export Excel)
                                                </button>
                                            )}

                                            {/* Export to PDF (Available for all columns if there are orders) */}
                                            {onlineOrders?.filter((o: any) => o.status === 'Packing').length > 0 && (
                                                <button 
                                                    onClick={() => handleExportPDF('Packing')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 group border-t border-slate-100 dark:border-slate-700"
                                                >
                                                    <span className="material-icons-round text-[16px] text-red-500 group-hover:text-red-600">picture_as_pdf</span>
                                                    ទាញទិន្នន័យ (Export PDF)
                                                </button>
                                            )}

                                            {/* 4. Sort Options (Always visible) */}
                                            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-khmer flex items-center gap-1.5 mb-2">
                                                    <span className="material-icons-round text-[14px]">sort</span> តម្រៀបតាម (Sort By)
                                                </span>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    <button onClick={() => handleSort('Packing', 'newest')} className={`text-[11px] py-1.5 rounded-md flex items-center justify-center gap-1.5 border transition-all ${columnSorts['Packing'] === 'newest' || !columnSorts['Packing'] ? 'bg-primary/10 text-primary border-primary/30 font-bold shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}>
                                                        🕒 ថ្មី
                                                    </button>
                                                    <button onClick={() => handleSort('Packing', 'oldest')} className={`text-[11px] py-1.5 rounded-md flex items-center justify-center gap-1.5 border transition-all ${columnSorts['Packing'] === 'oldest' ? 'bg-primary/10 text-primary border-primary/30 font-bold shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}>
                                                        ⏳ ចាស់
                                                    </button>
                                                    <button onClick={() => handleSort('Packing', 'price_high')} className={`text-[11px] py-1.5 rounded-md flex items-center justify-center gap-1.5 border transition-all ${columnSorts['Packing'] === 'price_high' ? 'bg-primary/10 text-primary border-primary/30 font-bold shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}>
                                                        💰 ច្រើន
                                                    </button>
                                                    <button onClick={() => handleSort('Packing', 'price_low')} className={`text-[11px] py-1.5 rounded-md flex items-center justify-center gap-1.5 border transition-all ${columnSorts['Packing'] === 'price_low' ? 'bg-primary/10 text-primary border-primary/30 font-bold shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}>
                                                        💵 តិច
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto overflow-x-hidden column-scroll pr-2 space-y-3 custom-scrollbar pb-4">
                            {getSortedOrdersForColumn('Packing').map(order => <OrderCard key={order.id} order={order} />)}
                        </div>
                    </div>

                    {/* Shipping Column */}
                    <div className="flex flex-col shrink-0 w-[320px] min-w-[320px] snap-center snap-always max-h-full">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20"></div>
                                <h2 className="font-khmer text-lg font-bold text-slate-800 dark:text-white">កំពុងដឹក <span className="text-sm font-display font-normal text-slate-500 dark:text-slate-400 ml-1">(Shipping)</span></h2>
                                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full">{shippingOrders.length}</span>
                            </div>

                            {/* Column Options Menu */}
                            <div className="relative ml-auto">
                                <button 
                                    onClick={() => setActiveMenuColumn(activeMenuColumn === 'Shipping' ? null : 'Shipping')}
                                    className="p-1 flex items-center justify-center text-slate-400 hover:text-primary rounded-md hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                                    title="ជម្រើសបន្ថែម (Options)"
                                >
                                    <span className="material-icons-round text-[18px] leading-none">more_horiz</span>
                                </button>
                                
                                {activeMenuColumn === 'Shipping' && (
                                    <>
                                        {/* Invisible backdrop to close menu when clicking outside */}
                                        <div className="fixed inset-0 z-20" onClick={() => setActiveMenuColumn(null)}></div>
                                        
                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 py-1">
                                            {/* 1. Bulk Move (Only if there is a next stage) */}
                                            {getNextStage('Shipping') && (
                                                <button 
                                                    onClick={() => handleBulkMove('Shipping')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-primary transition-colors flex items-center gap-2 group"
                                                >
                                                    <span className="material-icons-round text-[16px] text-slate-400 group-hover:text-primary">low_priority</span>
                                                    រុញទាំងអស់ទៅជួរបន្ទាប់
                                                </button>
                                            )}

                                            {/* 2. Print Pick List (Good for New/Packing/Shipping) */}
                                            {true && (
                                                <button 
                                                    onClick={() => handlePrintPickList('Shipping')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2 group border-t border-slate-100 dark:border-slate-700"
                                                >
                                                    <span className="material-icons-round text-[16px] text-slate-400 group-hover:text-slate-600">print</span>
                                                    បោះពុម្ពបញ្ជីទាញទំនិញ
                                                </button>
                                            )}

                                            {/* 3. Clear Column (Only for Completed) */}
                                            {false && (
                                                <button 
                                                    onClick={() => handleClearColumn('Shipping')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 group"
                                                >
                                                    <span className="material-icons-round text-[16px] text-red-400 group-hover:text-red-600">delete_sweep</span>
                                                    សម្អាតជួរនេះ (Archive)
                                                </button>
                                            )}

                                            {/* Select All in Column */}
                                            {onlineOrders?.filter((o: any) => o.status === 'Shipping').length > 0 && (
                                                <button 
                                                    onClick={() => handleSelectAllInColumn('Shipping')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-2 group border-t border-slate-100 dark:border-slate-700"
                                                >
                                                    <span className="material-icons-round text-[16px] text-indigo-500 group-hover:text-indigo-600">checklist</span>
                                                    ជ្រើសរើស2ឡើងទៅ (Multi Select)
                                                </button>
                                            )}

                                            {/* Export to CSV (Available for all columns if there are orders) */}
                                            {onlineOrders?.filter((o: any) => o.status === 'Shipping').length > 0 && (
                                                <button 
                                                    onClick={() => handleExportCSV('Shipping')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-2 group border-t border-slate-100 dark:border-slate-700"
                                                >
                                                    <span className="material-icons-round text-[16px] text-green-500 group-hover:text-green-600">file_download</span>
                                                    ទាញទិន្នន័យ (Export Excel)
                                                </button>
                                            )}

                                            {/* Export to PDF (Available for all columns if there are orders) */}
                                            {onlineOrders?.filter((o: any) => o.status === 'Shipping').length > 0 && (
                                                <button 
                                                    onClick={() => handleExportPDF('Shipping')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 group border-t border-slate-100 dark:border-slate-700"
                                                >
                                                    <span className="material-icons-round text-[16px] text-red-500 group-hover:text-red-600">picture_as_pdf</span>
                                                    ទាញទិន្នន័យ (Export PDF)
                                                </button>
                                            )}

                                            {/* 4. Sort Options (Always visible) */}
                                            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-khmer flex items-center gap-1.5 mb-2">
                                                    <span className="material-icons-round text-[14px]">sort</span> តម្រៀបតាម (Sort By)
                                                </span>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    <button onClick={() => handleSort('Shipping', 'newest')} className={`text-[11px] py-1.5 rounded-md flex items-center justify-center gap-1.5 border transition-all ${columnSorts['Shipping'] === 'newest' || !columnSorts['Shipping'] ? 'bg-primary/10 text-primary border-primary/30 font-bold shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}>
                                                        🕒 ថ្មី
                                                    </button>
                                                    <button onClick={() => handleSort('Shipping', 'oldest')} className={`text-[11px] py-1.5 rounded-md flex items-center justify-center gap-1.5 border transition-all ${columnSorts['Shipping'] === 'oldest' ? 'bg-primary/10 text-primary border-primary/30 font-bold shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}>
                                                        ⏳ ចាស់
                                                    </button>
                                                    <button onClick={() => handleSort('Shipping', 'price_high')} className={`text-[11px] py-1.5 rounded-md flex items-center justify-center gap-1.5 border transition-all ${columnSorts['Shipping'] === 'price_high' ? 'bg-primary/10 text-primary border-primary/30 font-bold shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}>
                                                        💰 ច្រើន
                                                    </button>
                                                    <button onClick={() => handleSort('Shipping', 'price_low')} className={`text-[11px] py-1.5 rounded-md flex items-center justify-center gap-1.5 border transition-all ${columnSorts['Shipping'] === 'price_low' ? 'bg-primary/10 text-primary border-primary/30 font-bold shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}>
                                                        💵 តិច
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto overflow-x-hidden column-scroll pr-2 space-y-3 custom-scrollbar pb-4">
                            {getSortedOrdersForColumn('Shipping').map(order => <OrderCard key={order.id} order={order} />)}
                        </div>
                    </div>

                    {/* Completed Column */}
                    <div className="flex flex-col shrink-0 w-[320px] min-w-[320px] snap-center snap-always max-h-full">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
                                <h2 className="font-khmer text-lg font-bold text-slate-800 dark:text-white">ជោគជ័យ <span className="text-sm font-display font-normal text-slate-500 dark:text-slate-400 ml-1">(Completed)</span></h2>
                                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">{completedOrders.length}</span>
                            </div>

                            {/* Column Options Menu */}
                            <div className="relative ml-auto">
                                <button 
                                    onClick={() => setActiveMenuColumn(activeMenuColumn === 'Completed' ? null : 'Completed')}
                                    className="p-1 flex items-center justify-center text-slate-400 hover:text-primary rounded-md hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                                    title="ជម្រើសបន្ថែម (Options)"
                                >
                                    <span className="material-icons-round text-[18px] leading-none">more_horiz</span>
                                </button>
                                
                                {activeMenuColumn === 'Completed' && (
                                    <>
                                        {/* Invisible backdrop to close menu when clicking outside */}
                                        <div className="fixed inset-0 z-20" onClick={() => setActiveMenuColumn(null)}></div>
                                        
                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 py-1">
                                            {/* 1. Bulk Move (Only if there is a next stage) */}
                                            {getNextStage('Completed') && (
                                                <button 
                                                    onClick={() => handleBulkMove('Completed')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-primary transition-colors flex items-center gap-2 group"
                                                >
                                                    <span className="material-icons-round text-[16px] text-slate-400 group-hover:text-primary">low_priority</span>
                                                    រុញទាំងអស់ទៅជួរបន្ទាប់
                                                </button>
                                            )}

                                            {/* 2. Print Pick List (Good for New/Packing/Shipping) */}
                                            {false && (
                                                <button 
                                                    onClick={() => handlePrintPickList('Completed')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2 group border-t border-slate-100 dark:border-slate-700"
                                                >
                                                    <span className="material-icons-round text-[16px] text-slate-400 group-hover:text-slate-600">print</span>
                                                    បោះពុម្ពបញ្ជីទាញទំនិញ
                                                </button>
                                            )}

                                            {/* 3. Clear Column (Only for Completed) */}
                                            {true && (
                                                <button 
                                                    onClick={() => handleClearColumn('Completed')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 group"
                                                >
                                                    <span className="material-icons-round text-[16px] text-red-400 group-hover:text-red-600">delete_sweep</span>
                                                    សម្អាតជួរនេះ (Archive)
                                                </button>
                                            )}

                                            {/* Select All in Column */}
                                            {onlineOrders?.filter((o: any) => o.status === 'Completed').length > 0 && (
                                                <button 
                                                    onClick={() => handleSelectAllInColumn('Completed')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-2 group border-t border-slate-100 dark:border-slate-700"
                                                >
                                                    <span className="material-icons-round text-[16px] text-indigo-500 group-hover:text-indigo-600">checklist</span>
                                                    ជ្រើសរើស2ឡើងទៅ (Multi Select)
                                                </button>
                                            )}

                                            {/* Export to CSV (Available for all columns if there are orders) */}
                                            {onlineOrders?.filter((o: any) => o.status === 'Completed').length > 0 && (
                                                <button 
                                                    onClick={() => handleExportCSV('Completed')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-2 group border-t border-slate-100 dark:border-slate-700"
                                                >
                                                    <span className="material-icons-round text-[16px] text-green-500 group-hover:text-green-600">file_download</span>
                                                    ទាញទិន្នន័យ (Export Excel)
                                                </button>
                                            )}

                                            {/* Export to PDF (Available for all columns if there are orders) */}
                                            {onlineOrders?.filter((o: any) => o.status === 'Completed').length > 0 && (
                                                <button 
                                                    onClick={() => handleExportPDF('Completed')}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold font-khmer text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 group border-t border-slate-100 dark:border-slate-700"
                                                >
                                                    <span className="material-icons-round text-[16px] text-red-500 group-hover:text-red-600">picture_as_pdf</span>
                                                    ទាញទិន្នន័យ (Export PDF)
                                                </button>
                                            )}

                                            {/* 4. Sort Options (Always visible) */}
                                            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-khmer flex items-center gap-1.5 mb-2">
                                                    <span className="material-icons-round text-[14px]">sort</span> តម្រៀបតាម (Sort By)
                                                </span>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    <button onClick={() => handleSort('Completed', 'newest')} className={`text-[11px] py-1.5 rounded-md flex items-center justify-center gap-1.5 border transition-all ${columnSorts['Completed'] === 'newest' || !columnSorts['Completed'] ? 'bg-primary/10 text-primary border-primary/30 font-bold shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}>
                                                        🕒 ថ្មី
                                                    </button>
                                                    <button onClick={() => handleSort('Completed', 'oldest')} className={`text-[11px] py-1.5 rounded-md flex items-center justify-center gap-1.5 border transition-all ${columnSorts['Completed'] === 'oldest' ? 'bg-primary/10 text-primary border-primary/30 font-bold shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}>
                                                        ⏳ ចាស់
                                                    </button>
                                                    <button onClick={() => handleSort('Completed', 'price_high')} className={`text-[11px] py-1.5 rounded-md flex items-center justify-center gap-1.5 border transition-all ${columnSorts['Completed'] === 'price_high' ? 'bg-primary/10 text-primary border-primary/30 font-bold shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}>
                                                        💰 ច្រើន
                                                    </button>
                                                    <button onClick={() => handleSort('Completed', 'price_low')} className={`text-[11px] py-1.5 rounded-md flex items-center justify-center gap-1.5 border transition-all ${columnSorts['Completed'] === 'price_low' ? 'bg-primary/10 text-primary border-primary/30 font-bold shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}>
                                                        💵 តិច
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto overflow-x-hidden column-scroll pr-2 space-y-3 custom-scrollbar pb-4">
                            {getSortedOrdersForColumn('Completed').map(order => <OrderCard key={order.id} order={order} />)}
                            <div className="py-4 text-center">
                                <p className="text-xs text-slate-400">Archived older orders...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating Action Bar (FAB) for Multi-Select */}
            {selectedOrders.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] z-50 flex items-center gap-3 animate-in slide-in-from-bottom-8 fade-in duration-300 border border-slate-700">
                    <div className="flex items-center gap-2 bg-slate-800 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-700">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold">
                            {selectedOrders.length}
                        </span>
                        <span className="text-xs font-bold font-khmer">បានជ្រើសរើស</span>
                    </div>

                    <div className="h-6 w-px bg-slate-700 mx-1"></div>

                    <span className="text-xs text-slate-400 font-khmer font-bold mr-1">រុញទៅកាន់៖</span>
                    
                    <button onClick={() => handleFloatingBulkAction('Packing')} className="px-3 py-1.5 text-xs font-bold rounded-full hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-orange-400 hover:text-orange-300">
                        <span className="material-icons-round text-[14px]">inventory_2</span> ខ្ចប់ (Pack)
                    </button>
                    <button onClick={() => handleFloatingBulkAction('Shipping')} className="px-3 py-1.5 text-xs font-bold rounded-full hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-purple-400 hover:text-purple-300">
                        <span className="material-icons-round text-[14px]">local_shipping</span> ដឹក (Ship)
                    </button>
                    <button onClick={() => handleFloatingBulkAction('Completed')} className="px-3 py-1.5 text-xs font-bold rounded-full hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-green-400 hover:text-green-300">
                        <span className="material-icons-round text-[14px]">check_circle</span> ជោគជ័យ
                    </button>

                    <div className="h-6 w-px bg-slate-700 mx-1"></div>

                    <button onClick={() => setSelectedOrders([])} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors" title="បោះបង់ (Cancel)">
                        <span className="material-icons-round text-[18px]">close</span>
                    </button>
                </div>
            )}

            {/* Archived Orders History Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowHistoryModal(false)}></div>
                    
                    {/* Modal Content */}
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
                            <h2 className="text-base font-bold font-khmer text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="material-icons-round text-slate-500">inventory_2</span> ប្រវត្តិការកុម្ម៉ង់ដែលបានលាក់ (Archived Orders)
                            </h2>
                            <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        
                        {/* Body List */}
                        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/30 dark:bg-slate-900/50">
                            {onlineOrders?.filter((o: any) => o.status === 'Archived').length > 0 ? (
                                <div className="space-y-3">
                                    {onlineOrders.filter((o: any) => o.status === 'Archived')
                                        .sort((a: any, b: any) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
                                        .map((order: any) => (
                                        <div 
                                            key={`archived-${order.id}`} 
                                            onClick={() => selectOnlineOrder(order.id)}
                                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-all group cursor-pointer hover:border-primary/30"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 shrink-0 font-bold">
                                                    {order.customer?.name ? order.customer.name.slice(0, 1) : 'G'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-800 dark:text-white font-khmer mb-0.5">{order.customer?.name || 'អតិថិជនទូទៅ'}</p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                                        <span className="material-icons-round text-[12px]">schedule</span>
                                                        {new Date(order.createdAt || order.date || Date.now()).toLocaleString('en-GB')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 sm:gap-6">
                                                {/* Price & Payment */}
                                                <div className="text-right hidden sm:block">
                                                    <p className="font-black text-sm text-slate-800 dark:text-white">${Number(order.total || 0).toFixed(2)}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">{order.paymentMethod || 'COD'}</p>
                                                </div>
                                                
                                                {/* Quick Print Actions (NEW) */}
                                                <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-700 pr-4 sm:pr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {/* Print Invoice/Receipt */}
                                                    <button 
                                                        onClick={(e) => handlePrintInvoice(order, e)}
                                                        className="p-1.5 flex items-center justify-center rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
                                                        title="បោះពុម្ពវិក្កយបត្រ (Print Invoice)"
                                                    >
                                                        <span className="material-icons-round text-[15px]">receipt_long</span>
                                                    </button>
                                                    
                                                    {/* Print Thermal Label */}
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            selectOnlineOrder(order.id);
                                                            setIsShippingLabelModalOpen(true);
                                                        }}
                                                        className="p-1.5 flex items-center justify-center rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
                                                        title="បោះពុម្ព Label (Print Label)"
                                                    >
                                                        <span className="material-icons-round text-[15px]">print</span>
                                                    </button>
                                                </div>

                                                {/* Existing Restore Button */}
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (updateOnlineOrder) {
                                                            updateOnlineOrder(order.id, { ...order, status: 'Completed' }, true);
                                                        }
                                                    }}
                                                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-green-100 dark:hover:bg-green-900/30 text-slate-600 dark:text-slate-300 hover:text-green-700 dark:hover:text-green-400 border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-800 rounded-lg text-xs font-bold font-khmer transition-colors flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                                                    title="ស្តារទិន្នន័យត្រឡប់មកវិញ (Restore)"
                                                >
                                                    <span className="material-icons-round text-[14px]">unarchive</span> ស្តារវិញ
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-slate-400 flex flex-col items-center justify-center h-full">
                                    <span className="material-icons-round text-6xl opacity-20 mb-3">inbox</span>
                                    <p className="font-khmer text-sm font-bold text-slate-500 dark:text-slate-400">មិនទាន់មានទិន្នន័យចាស់ៗទេ</p>
                                    <p className="text-xs mt-1 text-slate-400">ការកុម្ម៉ង់ដែលអ្នកបានចុច "លាក់" នឹងបង្ហាញនៅទីនេះ</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnlineOrdersBoard;
