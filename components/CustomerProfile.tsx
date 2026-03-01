
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useData, Activity, InterestedProduct, NoteCategory } from '../context/DataContext';
import * as LucideIcons from 'lucide-react';
import { 
    X, 
    Phone, 
    MessageSquare, 
    Edit, 
    MapPin, 
    Calendar, 
    CreditCard, 
    Clock, 
    ShoppingBag,
    Send,
    User,
    Globe,
    Store,
    AlertCircle,
    Package,
    PlusCircle,
    ShoppingCart,
    Copy,
    Check,
    Trash2,
    Pin,
    Map,
    ExternalLink,
    Target,
    Receipt,
    Printer,
    Edit2,
    ChevronDown
} from 'lucide-react';

const CustomerProfile: React.FC = () => {
    const { 
        selectedContact, 
        setSelectedContact, 
        orders, 
        onlineOrders, 
        setIsAddLeadModalOpen, 
        setEditingContact,
        customFieldsSchema,
        updateLead, // Used to save the note to global state
        products, // Access products to check current stock levels
        addToCart,
        setCurrentView,
        setPosCustomer,
        setPrefillOrderData,
        setIsCreateOrderModalOpen,
        noteCategories,
        setNoteCategories,
        contactStages,
        selectOnlineOrder,
        setIsShippingLabelModalOpen
    } = useData();

    const [activeTab, setActiveTab] = useState<'info' | 'timeline' | 'orders'>('info');
    
    // --- Logic 1 & 2: State for Inputs ---
    const [newNote, setNewNote] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');
    const [selectedNoteCategory, setSelectedNoteCategory] = useState(noteCategories[0]?.label || '');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    
    // --- Timeline Filter State ---
    const [timelineFilter, setTimelineFilter] = useState('All');

    // --- Modal State for Adding Custom Tags ---
    const [showAddTagModal, setShowAddTagModal] = useState(false);
    const [newTagLabel, setNewTagLabel] = useState('');
    const [newTagColor, setNewTagColor] = useState('bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:border-slate-600');
    const addTagModalRef = useRef<HTMLDivElement>(null);

    // --- Color Presets for Tag Creation ---
    const COLOR_PRESETS = [
        { name: 'Slate', color: 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:border-slate-600' },
        { name: 'Blue', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:border-blue-800' },
        { name: 'Green', color: 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 dark:border-green-800' },
        { name: 'Red', color: 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:border-red-800' },
        { name: 'Yellow', color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30 dark:border-yellow-800' },
        { name: 'Purple', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30 dark:border-purple-800' },
        { name: 'Pink', color: 'bg-pink-50 text-pink-600 hover:bg-pink-100 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:hover:bg-pink-900/30 dark:border-pink-800' },
        { name: 'Indigo', color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30 dark:border-indigo-800' }
    ];

    // --- Action Menu State ---
    const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);
    const [showCheckoutAllMenu, setShowCheckoutAllMenu] = useState(false);
    const checkoutAllMenuRef = useRef<HTMLDivElement>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [activeOrderMenu, setActiveOrderMenu] = useState<string | null>(null);
    const [receiptOrder, setReceiptOrder] = useState<any>(null);

    // Close order menu on outside click
    useEffect(() => {
        const handleClickOutside = () => setActiveOrderMenu(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // Helper function to resolve dynamic stages
    const resolveStages = (statusData: any) => {
        const statuses = Array.isArray(statusData) ? statusData : [statusData].filter(Boolean);
        if (statuses.length === 0) return [];

        return statuses.map(statusStr => {
            const stage = contactStages?.find(s => s.name === statusStr);
            let bgColor = 'bg-slate-100 dark:bg-slate-800';
            let textColor = 'text-slate-700 dark:text-slate-300';
            let borderColor = 'border-slate-200 dark:border-slate-700';
            let IconComponent = Target;

            if (stage) {
                const classes = stage.colorClass.split(' ');
                bgColor = classes.filter(c => c.startsWith('bg-')).join(' ') || bgColor;
                textColor = classes.filter(c => c.startsWith('text-')).join(' ') || textColor;
                const foundBorder = classes.filter(c => c.startsWith('border-')).join(' ');
                if (foundBorder) borderColor = foundBorder;
                if (stage.iconName && (LucideIcons as any)[stage.iconName]) {
                    IconComponent = (LucideIcons as any)[stage.iconName];
                }
            }

            return { name: statusStr, bgColor, textColor, borderColor, IconComponent };
        });
    };

    // If no contact selected, don't render anything (Drawer closed)
    if (!selectedContact) return null;

    // --- Derived Data ---
    
    // 1. Calculate LTV (Lifetime Value) based on Orders
    const customerOrders = useMemo(() => {
        const allOrders = [...orders, ...onlineOrders];
        // Filter orders by phone or name loosely
        return allOrders.filter(o => 
            (o.customer?.phone && o.customer.phone === selectedContact.phone) || 
            (o.customer?.name && o.customer.name === selectedContact.name)
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders, onlineOrders, selectedContact]);

    const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
    const lastOrderDate = customerOrders.length > 0 ? new Date(customerOrders[0].date).toLocaleDateString() : 'N/A';

    // 2. Timeline Data (Merge Activities + Orders for a rich timeline)
    const timeline = useMemo(() => {
        // Ensure activities exist
        const activities = (selectedContact.activities || []).map(a => ({
            ...a, 
            kind: 'activity',
            // Ensure timestamp is Date object
            timestamp: new Date(a.timestamp) 
        }));

        const orderEvents = customerOrders.map(o => ({
            id: o.id,
            kind: 'order',
            title: `New Order ${o.id}`,
            description: `Purchased ${o.items.length} items for $${o.total.toFixed(2)}`,
            timestamp: new Date(o.date),
            type: 'system',
            metadata: null
        }));
        
        // Combine activities and orders
        let combined = [...activities, ...orderEvents];
        
        // Apply filter
        if (timelineFilter === 'Orders') {
            combined = combined.filter(item => item.kind === 'order');
        } else if (timelineFilter !== 'All') {
            // Filter by specific note category
            combined = combined.filter(item => 
                item.kind === 'activity' && item.description?.includes(`[${timelineFilter}]`)
            );
        }
        
        // Sort: pinned items first (by timestamp desc), then unpinned (by timestamp desc)
        return combined.sort((a, b) => {
            const aPinned = a.metadata?.isPinned || false;
            const bPinned = b.metadata?.isPinned || false;
            
            // If one is pinned and the other is not, pinned comes first
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            
            // Both pinned or both unpinned: sort by timestamp (newest first)
            return b.timestamp.getTime() - a.timestamp.getTime();
        });
    }, [selectedContact.activities, customerOrders, timelineFilter]);


    // --- Handlers ---

    const handleClose = () => {
        setSelectedContact(null);
    };

    const handleEdit = () => {
        setEditingContact(selectedContact);
        setIsAddLeadModalOpen(true);
    };

    // --- Logic 2: Add Note Functionality ---
    const handleAddNote = () => {
        if (!newNote.trim()) return;

        // Prepend category to note text
        const finalNoteText = `[${selectedNoteCategory}] ${newNote}`;

        if (editingNoteId) {
            // UPDATE existing activity
            const updatedActivities = (selectedContact.activities || []).map(a => 
                a.id === editingNoteId 
                    ? {
                        ...a,
                        description: finalNoteText,
                        timestamp: new Date(),
                        metadata: followUpDate ? { followUpDate } : a.metadata
                    }
                    : a
            );
            updateLead(selectedContact.id, { activities: updatedActivities });
            setEditingNoteId(null);
        } else {
            // CREATE new activity
            const newActivity: Activity = {
                id: `note-${Date.now()}`,
                type: 'note',
                title: 'Note Added',
                description: finalNoteText,
                timestamp: new Date(),
                metadata: followUpDate ? { followUpDate } : undefined
            };
            const updatedActivities = [newActivity, ...(selectedContact.activities || [])];
            updateLead(selectedContact.id, { activities: updatedActivities });
        }

        // Clear Inputs and Reset Category
        setNewNote('');
        setFollowUpDate('');
        setSelectedNoteCategory(noteCategories[0]?.label || '');
    };

    // Delete Note Handler
    const handleDeleteNote = (activityId: string) => {
        const updatedActivities = (selectedContact.activities || []).filter(a => a.id !== activityId);
        updateLead(selectedContact.id, { activities: updatedActivities });
    };

    // Edit Note Handler
    const handleEditNote = (activity: Activity) => {
        setEditingNoteId(activity.id);
        
        // Extract category from description if present
        const description = activity.description || '';
        const categoryMatch = description.match(/^\[([^\]]+)\]\s*/);
        
        if (categoryMatch) {
            setSelectedNoteCategory(categoryMatch[1]);
            // Remove category tag from text for editing
            setNewNote(description.replace(/^\[[^\]]+\]\s*/, ''));
        } else {
            setSelectedNoteCategory(noteCategories[0]?.label || '');
            setNewNote(description);
        }

        // Set follow up date if it exists
        if (activity.metadata?.followUpDate) {
            setFollowUpDate(activity.metadata.followUpDate);
        }
    };

    // Pin/Unpin Note Handler
    const handleTogglePin = (activity: Activity) => {
        const updatedActivities = (selectedContact.activities || []).map(a => 
            a.id === activity.id 
                ? {
                    ...a,
                    metadata: { ...a.metadata, isPinned: !(a.metadata?.isPinned) }
                }
                : a
        );
        updateLead(selectedContact.id, { activities: updatedActivities });
    };

    // Helper to get real-time stock
    const getStockStatus = (prodId: number) => {
        const product = products.find(p => p.id === prodId);
        return product ? product.stock : 0;
    };

    // Calculate Estimated Total Value of Interested Products
    const estTotal = selectedContact.interestedProducts 
        ? selectedContact.interestedProducts.reduce((sum, p) => sum + (p.price * (p.qty || 1)), 0)
        : 0;

    // --- Copy to Clipboard Handler ---
    const handleCopy = (text: string, field: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // --- Conversion Handlers ---
    
    const handleConvertToOnlineOrder = (prod: InterestedProduct) => {
        setPrefillOrderData({
            customer: selectedContact,
            items: selectedContact.interestedProducts || []
        });
        setIsCreateOrderModalOpen(true);
        setOpenActionMenuId(null);
    };

    const handleConvertToPos = (prod: InterestedProduct) => {
        const product = products.find(p => p.id === prod.id);
        if (product) {
            // Add item to cart with quantity
            addToCart(product, prod.qty);
            
            // Set customer context for POS
            setPosCustomer(selectedContact);
            
            // Switch view
            setCurrentView('pos');
            handleClose(); // Close drawer
        } else {
            alert("Product not found in inventory.");
        }
        setOpenActionMenuId(null);
    };

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
                        <div class="store-name">QuickBill KH</div>
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

    // Close menus on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setOpenActionMenuId(null);
            }
            if (checkoutAllMenuRef.current && !checkoutAllMenuRef.current.contains(event.target as Node)) {
                setShowCheckoutAllMenu(false);
            }
            if (addTagModalRef.current && !addTagModalRef.current.contains(event.target as Node)) {
                setShowAddTagModal(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [actionMenuRef, checkoutAllMenuRef, addTagModalRef]);


    // Safe avatar
    const hasAvatar = selectedContact.avatar && selectedContact.avatar.length > 2;

    // Smart map URL logic: prioritize mapLink, fallback to address search
    const mapUrl = selectedContact.mapLink 
        ? selectedContact.mapLink 
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedContact.address || '')}`;

    const getOrderStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid':
            case 'completed': 
                return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
            case 'shipping': 
                return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            case 'pending':
            case 'packing': 
            case 'new':
                return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
            case 'cancelled':
            case 'refunded': 
                return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            default: 
                return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end font-display">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" 
                onClick={handleClose}
            ></div>

            {/* Slide Over Panel */}
            <div className="relative w-full max-w-lg h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-slide-in-right border-l border-slate-200 dark:border-slate-800">
                
                {/* 1. Header Section */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden shadow-sm">
                                    {hasAvatar ? (
                                        <img src={selectedContact.avatar} alt={selectedContact.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xl font-bold text-slate-400">{selectedContact.name.substring(0,2).toUpperCase()}</span>
                                    )}
                                </div>
                                {/* Optional: You can keep or remove the small dot indicator, removing it makes it cleaner since we have the pill */}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-khmer leading-tight">{selectedContact.name}</h2>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1 group">
                                    <Phone size={14} />
                                    <span className="font-mono">{selectedContact.phone}</span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleCopy(selectedContact.phone, 'phone'); }}
                                        className="p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Copy phone number"
                                    >
                                        {copiedField === 'phone' ? (
                                            <Check size={14} className="text-green-500" />
                                        ) : (
                                            <Copy size={14} className="text-slate-300 hover:text-blue-500 cursor-pointer transition-colors" />
                                        )}
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {resolveStages(selectedContact.status).map((s, idx) => (
                                        <span key={idx} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${s.bgColor} ${s.textColor} ${s.borderColor}`}>
                                            <s.IconComponent size={10} strokeWidth={3} />
                                            {s.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Quick Stats (LTV, Last Order, Deposit, Debt) */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-center">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Total Spent</p>
                            <p className="text-base font-bold text-slate-900 dark:text-white">${totalSpent.toFixed(2)}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-center">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Last Order</p>
                            <p className="text-base font-bold text-slate-900 dark:text-white">{lastOrderDate}</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-xl"></div>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1 font-khmer">លុយកក់ (Deposit)</p>
                            <p className="text-base font-bold text-emerald-700 dark:text-emerald-400">${(selectedContact.walletBalance || 0).toFixed(2)}</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-500 rounded-r-xl"></div>
                            <p className="text-[10px] text-red-500 dark:text-red-400 font-bold uppercase tracking-wider mb-1 font-khmer">លុយជំពាក់ (Debt)</p>
                            <p className="text-base font-bold text-red-600 dark:text-red-400">${(selectedContact.totalDebt || 0).toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* 2. Tabs Navigation */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 shrink-0 sticky top-0 z-10">
                    {[
                        { id: 'info', label: 'ព័ត៌មាន (Info)', icon: User },
                        { id: 'timeline', label: 'សកម្មភាព (Timeline)', icon: Clock },
                        { id: 'orders', label: 'ប្រវត្តិទិញ (Orders)', icon: ShoppingBag }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 font-khmer ${
                                activeTab === tab.id 
                                ? 'border-primary text-primary' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* 3. Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white dark:bg-slate-900">
                    
                    {/* TAB: INFO */}
                    {activeTab === 'info' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Contact Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Contact Details</h3>
                                <div className="flex justify-between items-stretch gap-4">
                                    {/* Text Details */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex gap-3 text-sm group">
                                            <MapPin className="text-slate-400 shrink-0" size={18} />
                                            <div className="flex-1">
                                                <p className="text-slate-500 text-xs">Address</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-slate-900 dark:text-slate-200">{selectedContact.address || 'No address provided'}</p>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleCopy(selectedContact.address || '', 'address'); }}
                                                        className="p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Copy address"
                                                    >
                                                        {copiedField === 'address' ? (
                                                            <Check size={14} className="text-green-500" />
                                                        ) : (
                                                            <Copy size={14} className="text-slate-300 hover:text-blue-500 cursor-pointer transition-colors" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 text-sm">
                                            <Globe className="text-slate-400 shrink-0" size={18} />
                                            <div>
                                                <p className="text-slate-500 text-xs">Source</p>
                                                {selectedContact.customData?.socialLink ? (
                                                    <a 
                                                        href={selectedContact.customData.socialLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1.5 font-medium transition-colors"
                                                    >
                                                        {selectedContact.source || 'Profile'}
                                                        <ExternalLink size={14} className="shrink-0" />
                                                    </a>
                                                ) : (
                                                    <p className="text-slate-900 dark:text-slate-200">{selectedContact.source || 'Walk-in'}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-3 text-sm">
                                            <Store className="text-slate-400 shrink-0" size={18} />
                                            <div>
                                                <p className="text-slate-500 text-xs">Customer Since</p>
                                                <p className="text-slate-900 dark:text-slate-200">{selectedContact.joinedDate || 'Unknown'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Mini Map */}
                                    <a 
                                        href={mapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-36 h-32 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden relative group cursor-pointer block shrink-0 flex items-center justify-center transition-all hover:shadow-xl hover:border-primary/50 dark:hover:border-primary/50"
                                    >
                                        {/* Modern Map Background Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-slate-800 dark:via-blue-900/40 dark:to-slate-900"></div>
                                        
                                        {/* Subtle Map Grid Pattern Effect */}
                                        <div className="absolute inset-0 opacity-10 dark:opacity-5" style={{
                                            backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(0, 0, 0, 0.05) 25%, rgba(0, 0, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 0, 0, 0.05) 25%, rgba(0, 0, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05) 76%, transparent 77%, transparent)`,
                                            backgroundSize: '50px 50px'
                                        }}></div>
                                        
                                        {/* Main Icon */}
                                        <div className="relative z-10 flex flex-col items-center justify-center gap-3">
                                            <MapPin size={32} className="text-primary/80 drop-shadow-md" />
                                        </div>
                                        
                                        {/* Hover Overlay Button */}
                                        <div className="absolute inset-0 bg-slate-900/75 dark:bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                                            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">View Map</span>
                                                <ExternalLink size={14} className="text-primary" />
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800"></div>

                            {/* Custom Fields */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Additional Info</h3>
                                {customFieldsSchema.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {customFieldsSchema.map(field => (
                                            <div key={field.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                                <p className="text-xs text-slate-500 mb-1">{field.label}</p>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {selectedContact.customData?.[field.id] || '-'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">No custom fields defined.</p>
                                )}
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800"></div>

                            {/* Interested Products Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                            <Package size={16} className="text-primary" />
                                            ទំនិញចាប់អារម្មណ៍ (Interested Products)
                                        </h3>
                                        {selectedContact.interestedProducts && selectedContact.interestedProducts.length > 0 && (
                                            <span className="text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-md border border-green-200 dark:border-green-800/50">
                                                Est: ${estTotal.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    {selectedContact.interestedProducts && selectedContact.interestedProducts.length > 0 && (
                                        <div className="relative" ref={checkoutAllMenuRef}>
                                            <button
                                                onClick={() => setShowCheckoutAllMenu(!showCheckoutAllMenu)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-sm"
                                                title="Checkout All Interested Products"
                                            >
                                                <ShoppingCart size={14} />
                                                <span>All</span>
                                            </button>
                                            {showCheckoutAllMenu && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                                    <div className="p-1">
                                                        <button
                                                            onClick={() => {
                                                                setPrefillOrderData({
                                                                    customer: selectedContact,
                                                                    items: selectedContact.interestedProducts.map((p: any) => ({ ...p, quantity: p.qty || 1 }))
                                                                });
                                                                setIsCreateOrderModalOpen(true);
                                                                setShowCheckoutAllMenu(false);
                                                            }}
                                                            className="w-full text-left px-3 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex items-center gap-2"
                                                        >
                                                            <Globe size={16} />
                                                            <span>Create Online Order</span>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (selectedContact.interestedProducts && selectedContact.interestedProducts.length > 0) {
                                                                    selectedContact.interestedProducts.forEach((prod: any) => {
                                                                        const product = products.find(p => p.id === prod.id);
                                                                        if (product) {
                                                                            addToCart(product, prod.qty || 1);
                                                                        }
                                                                    });
                                                                    setPosCustomer(selectedContact);
                                                                    setCurrentView('pos');
                                                                    handleClose();
                                                                }
                                                                setShowCheckoutAllMenu(false);
                                                            }}
                                                            className="w-full text-left px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"
                                                        >
                                                            <Store size={16} />
                                                            <span>Sell at POS</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {selectedContact.interestedProducts && selectedContact.interestedProducts.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedContact.interestedProducts.map((prod, idx) => {
                                            const currentStock = getStockStatus(prod.id);
                                            return (
                                                <div key={idx} className="relative flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors group">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 p-2 rounded-lg shrink-0">
                                                            <Package size={18} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{prod.name}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
                                                                    x{prod.qty}
                                                                </span>
                                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                                    ${prod.price.toFixed(2)}/ea
                                                                </span>
                                                                {currentStock > 0 && (
                                                                    <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                                                                        In Stock ({currentStock})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <div className="text-right">
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">${(prod.price * (prod.qty || 1)).toFixed(2)}</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">total</p>
                                                        </div>
                                                        {/* Action Button */}
                                                    <div className="relative" ref={openActionMenuId === prod.id ? actionMenuRef : null}>
                                                        <button 
                                                            onClick={() => setOpenActionMenuId(openActionMenuId === prod.id ? null : prod.id)}
                                                            className="text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors"
                                                            title="Convert to Order"
                                                        >
                                                            <ShoppingCart size={18} />
                                                        </button>

                                                        {/* Dropdown Menu */}
                                                        {openActionMenuId === prod.id && (
                                                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                                                <div className="p-1">
                                                                    <button 
                                                                        onClick={() => {
                                                                            setPrefillOrderData({
                                                                                customer: selectedContact,
                                                                                items: [{ ...prod, quantity: prod.qty || 1 }]
                                                                            });
                                                                            setIsCreateOrderModalOpen(true);
                                                                            setOpenActionMenuId(null);
                                                                        }}
                                                                        className="w-full text-left px-3 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex items-center gap-2"
                                                                    >
                                                                        <Globe size={16} />
                                                                        <span>Create Online Order</span>
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleConvertToPos(prod)}
                                                                        className="w-full text-left px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"
                                                                    >
                                                                        <Store size={16} />
                                                                        <span>Sell at POS</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                        <p className="text-sm text-slate-400 italic">No interested products recorded.</p>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800"></div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedContact.tags && selectedContact.tags.length > 0 ? (
                                        selectedContact.tags.map(tag => (
                                            <span key={tag} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-full font-medium border border-slate-200 dark:border-slate-700">
                                                {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-slate-400">No tags</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: TIMELINE */}
                    {activeTab === 'timeline' && (
                        <div className="space-y-6 animate-fade-in h-full flex flex-col">
                            {/* Input Area */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm">
                                <div className="flex gap-2 mb-3">
                                    <textarea 
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none dark:text-white"
                                        placeholder="Add a note or call summary..."
                                        rows={2}
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                    ></textarea>
                                </div>
                                
                                {/* Quick Tags - Note Categories */}
                                <div className="flex flex-wrap gap-2 mb-3 relative">
                                    {noteCategories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedNoteCategory(cat.label)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                                selectedNoteCategory === cat.label 
                                                    ? 'ring-2 ring-primary scale-105 shadow-md' 
                                                    : 'border'
                                            } ${cat.color} font-khmer`}
                                            title={`Tag as ${cat.label}`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                    {/* Add New Tag Button */}
                                    <button
                                        onClick={() => setShowAddTagModal(!showAddTagModal)}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                                        title="Add new tag"
                                    >
                                        + ថ្មី (New)
                                    </button>
                                    
                                    {/* Add Custom Tag Modal */}
                                    {showAddTagModal && (
                                        <div 
                                            ref={addTagModalRef}
                                            className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 p-4 w-72 animate-in fade-in zoom-in-95 duration-100 origin-top-left"
                                        >
                                            {/* Tag Label Input */}
                                            <div className="mb-4">
                                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Tag Name</label>
                                                <input
                                                    type="text"
                                                    value={newTagLabel}
                                                    onChange={(e) => setNewTagLabel(e.target.value)}
                                                    placeholder="e.g., 🎁 កាដូ"
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                                                    autoFocus
                                                />
                                            </div>

                                            {/* Color Swatch Selection */}
                                            <div className="mb-4">
                                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Color</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {COLOR_PRESETS.map((preset) => (
                                                        <button
                                                            key={preset.name}
                                                            onClick={() => setNewTagColor(preset.color)}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                                                newTagColor === preset.color 
                                                                    ? 'ring-2 ring-primary scale-105' 
                                                                    : ''
                                                            } ${preset.color}`}
                                                            title={preset.name}
                                                        >
                                                            {preset.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Preview */}
                                            {newTagLabel && (
                                                <div className="mb-4 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Preview</p>
                                                    <div className={`px-3 py-1.5 rounded-full text-xs font-medium border inline-block ${newTagColor} font-khmer`}>
                                                        {newTagLabel}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setShowAddTagModal(false);
                                                        setNewTagLabel('');
                                                        setNewTagColor('bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:border-slate-600');
                                                    }}
                                                    className="flex-1 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (!newTagLabel.trim()) return;
                                                        setNoteCategories(prev => [...prev, { 
                                                            id: 'custom-' + Date.now(), 
                                                            label: newTagLabel, 
                                                            color: newTagColor 
                                                        }]);
                                                        setShowAddTagModal(false);
                                                        setNewTagLabel('');
                                                        setNewTagColor('bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:border-slate-600');
                                                    }}
                                                    disabled={!newTagLabel.trim()}
                                                    className="flex-1 px-3 py-2 text-xs font-medium text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                                                >
                                                    Save Tag
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Timeline Filter */}
                                <div className="mb-3">
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Filter Timeline</label>
                                    <select
                                        value={timelineFilter}
                                        onChange={(e) => setTimelineFilter(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                                    >
                                        <option value="All">All Activities</option>
                                        <option value="Orders">Orders Only</option>
                                        {noteCategories.map(cat => (
                                            <option key={cat.id} value={cat.label}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    {/* Logic 1: Functional Date Picker */}
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                                                <Calendar size={14} />
                                            </div>
                                            <input 
                                                type="date"
                                                value={followUpDate}
                                                onChange={(e) => setFollowUpDate(e.target.value)}
                                                className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleAddNote}
                                        disabled={!newNote.trim()}
                                        className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                                    >
                                        <Send size={14} /> {editingNoteId ? 'Update Note' : 'Add Note'}
                                    </button>
                                </div>
                            </div>

                            {/* Logic 3: Mapped Timeline Stream */}
                            <div className="relative pl-4 space-y-6 pb-4">
                                {/* Vertical Line */}
                                <div className="absolute left-[23px] top-2 bottom-0 w-px bg-slate-200 dark:bg-slate-700"></div>

                                {timeline.map((item, idx) => (
                                    <div key={idx} className="relative flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        {/* Icon */}
                                        <div className="relative">
                                            <div className={`
                                                relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 bg-white dark:bg-slate-900
                                                ${item.kind === 'order' 
                                                    ? 'border-green-500 text-green-500' 
                                                    : item.metadata?.followUpDate 
                                                        ? 'border-amber-500 text-amber-500' 
                                                        : 'border-blue-500 text-blue-500'
                                                }
                                            `}>
                                                {item.kind === 'order' ? (
                                                    <ShoppingBag size={14} />
                                                ) : item.metadata?.followUpDate ? (
                                                    <AlertCircle size={14} />
                                                ) : (
                                                    <MessageSquare size={14} />
                                                )}
                                            </div>
                                            {/* Pin Badge */}
                                            {item.kind === 'activity' && item.metadata?.isPinned && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white dark:border-slate-900 flex items-center justify-center">
                                                    <Pin size={8} className="text-yellow-700" fill="currentColor" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Body */}
                                        <div className="flex-1 pb-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.title}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                        {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                    {item.kind === 'activity' && (
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => handleTogglePin(item as Activity)}
                                                                className={`p-1 rounded transition-colors ${
                                                                    (item as Activity).metadata?.isPinned
                                                                        ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                                                        : 'text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                                                }`}
                                                                title={(item as Activity).metadata?.isPinned ? 'Unpin note' : 'Pin note'}
                                                            >
                                                                <Pin size={14} fill={(item as Activity).metadata?.isPinned ? 'currentColor' : 'none'} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleEditNote(item as Activity)}
                                                                className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                                title="Edit note"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteNote(item.id)}
                                                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                                title="Delete note"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Note Content */}
                                            <div className="mt-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-colors">
                                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                                    {item.description}
                                                </p>
                                                
                                                {/* Follow Up Badge */}
                                                {item.kind === 'activity' && item.metadata?.followUpDate && (
                                                    <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded text-xs font-medium border border-amber-100 dark:border-amber-800/50">
                                                        <Clock size={12} />
                                                        Follow up: {new Date(item.metadata.followUpDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {timeline.length === 0 && (
                                    <div className="text-center py-12 text-slate-400 text-sm">
                                        <MessageSquare size={32} className="mx-auto mb-2 opacity-20" />
                                        <p>No activity history yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: ORDERS */}
                    {activeTab === 'orders' && (
                        <div className="space-y-4 animate-fade-in h-full">
                            {customerOrders.length > 0 ? (
                                customerOrders.map(order => (
                                    <div key={order.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/50 transition-all group cursor-pointer relative">
                                        {/* Decorative Side Status Line */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${
                                            ['Paid', 'Completed'].includes(order.status) ? 'bg-emerald-500' : 
                                            ['Cancelled', 'Refunded'].includes(order.status) ? 'bg-red-500' : 
                                            'bg-blue-500'
                                        }`}></div>
                                        
                                        <div className="flex justify-between items-start mb-3 pl-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <ShoppingBag size={16} className="text-slate-400" />
                                                    <span className="font-bold text-slate-900 dark:text-white text-sm">{order.id}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-md border font-bold uppercase tracking-wider ${getOrderStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        <span>{new Date(order.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    {order.paymentMethod && (
                                                        <>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                            <div className="flex items-center gap-1">
                                                                <CreditCard size={12} /> {order.paymentMethod}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-primary font-bold text-lg leading-none block mb-1">${order.total.toFixed(2)}</span>
                                                <span className="text-[10px] text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{order.items?.length || 0} items</span>
                                            </div>
                                        </div>
                                        
                                        {/* Items Preview */}
                                        {order.items && order.items.length > 0 && (
                                            <div className="mt-3 pl-2 pt-3 border-t border-dashed border-slate-100 dark:border-slate-700">
                                                <div className="space-y-1.5">
                                                    {order.items.slice(0, 2).map((item, idx) => (
                                                        <div key={idx} className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                                                            <span className="flex items-center gap-2 truncate pr-2">
                                                                <span className="font-mono bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1 rounded text-[10px]">x{item.quantity}</span> 
                                                                <span className="truncate">{item.name}</span>
                                                            </span>
                                                            <span className="font-medium shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                    {order.items.length > 2 && (
                                                        <div className="text-[10px] text-slate-400 font-medium pt-1 flex items-center gap-1">
                                                            <PlusCircle size={10} /> {order.items.length - 2} more item(s) in this order...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Hover Overlay Button / Dropdown */}
                                        <div className={`absolute right-4 bottom-4 transition-opacity ${activeOrderMenu === order.id ? 'opacity-100 z-30' : 'opacity-0 group-hover:opacity-100 z-10'}`}>
                                            <div className="relative">
                                                <button 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        setActiveOrderMenu(activeOrderMenu === order.id ? null : order.id); 
                                                    }}
                                                    className={`text-xs bg-white border border-slate-200 hover:border-primary hover:text-primary dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shadow-sm ${activeOrderMenu === order.id ? 'border-primary text-primary ring-2 ring-primary/20' : ''}`}
                                                >
                                                    View Order <ChevronDown size={14} className={`transition-transform ${activeOrderMenu === order.id ? 'rotate-180' : ''}`} />
                                                </button>
                                                
                                                {/* Dropdown Menu */}
                                                {activeOrderMenu === order.id && (
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                                        <div className="p-1 flex flex-col font-khmer">
                                                            <button 
                                                                onClick={(e) => { handlePrintInvoice(order, e); setActiveOrderMenu(null); }}
                                                                className="text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
                                                            >
                                                                <Receipt size={14} className="text-blue-500" />
                                                                មើលវិក្កយបត្រ (Receipt)
                                                            </button>
                                                            <button 
                                                                onClick={(e) => { 
                                                                    e.stopPropagation(); 
                                                                    if(selectOnlineOrder) selectOnlineOrder(order.id);
                                                                    if(setIsShippingLabelModalOpen) setIsShippingLabelModalOpen(true);
                                                                    setActiveOrderMenu(null); 
                                                                }}
                                                                className="text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
                                                            >
                                                                <Printer size={14} className="text-purple-500" />
                                                                មើល Label ដឹកជញ្ជូន
                                                            </button>
                                                            <button 
                                                                onClick={(e) => { 
                                                                    e.stopPropagation(); 
                                                                    if(selectOnlineOrder) selectOnlineOrder(order.id); 
                                                                    handleClose(); 
                                                                }}
                                                                className="text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
                                                            >
                                                                <Edit2 size={14} className="text-amber-500" />
                                                                កែប្រែការកម្ម៉ង់ (Edit)
                                                            </button>
                                                            <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleCopy(order.id, 'orderId'); setActiveOrderMenu(null); }}
                                                                className="text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
                                                            >
                                                                {copiedField === 'orderId' ? <Check size={14} className="text-green-500"/> : <Copy size={14} className="text-slate-400" />}
                                                                Copy Order ID
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-sm mb-3">
                                        <ShoppingBag size={32} className="text-slate-300 dark:text-slate-500" />
                                    </div>
                                    <p className="text-sm font-khmer font-bold text-slate-600 dark:text-slate-300">មិនទាន់មានប្រវត្តិទិញទេ</p>
                                    <p className="text-xs mt-1 text-slate-400">Customer hasn't placed any orders yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 4. Action Footer */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <button 
                        onClick={handleEdit}
                        className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <Edit size={18} />
                        Edit Profile
                    </button>
                    <button className="flex-1 py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-md shadow-green-500/20 transition-all flex items-center justify-center gap-2">
                        <Phone size={18} />
                        Call Now
                    </button>
                </div>

            {/* Pop-up Receipt Modal */}
            {receiptOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-display">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setReceiptOrder(null)}></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Receipt size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-khmer">វិក្កយបត្រ (Receipt)</h3>
                            <p className="text-sm text-slate-500 font-mono mt-1">{receiptOrder.id}</p>
                        </div>
                        
                        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 mb-6">
                            {receiptOrder.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-start">
                                    <span className="flex-1 pr-4">
                                        <span className="font-bold text-slate-900 dark:text-white mr-2">{item.quantity}x</span> 
                                        {item.name}
                                    </span>
                                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-3 mt-3 space-y-2">
                                <div className="flex justify-between text-slate-500">
                                    <span>Subtotal</span>
                                    <span>${receiptOrder.subtotal?.toFixed(2) || receiptOrder.total?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Shipping</span>
                                    <span>${receiptOrder.shippingFee?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between font-bold text-base text-slate-900 dark:text-white pt-2">
                                    <span>Total</span>
                                    <span className="text-primary">${receiptOrder.total?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <button onClick={() => setReceiptOrder(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold text-slate-700 dark:text-white transition-colors font-khmer">
                                បិទ (Close)
                            </button>
                            <button className="flex-1 py-2.5 bg-primary hover:bg-primary-hover rounded-xl font-bold text-white transition-colors font-khmer flex justify-center items-center gap-2">
                                <Printer size={16} /> Print
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default CustomerProfile;
