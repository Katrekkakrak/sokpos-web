
import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const ShippingLabelPreview: React.FC = () => {
    const { selectedOnlineOrder, setIsShippingLabelModalOpen, shopSettings } = useData();
    const order = selectedOnlineOrder;
    const [driverNote, setDriverNote] = useState('');

    if (!order) return null;

    const handlePrint = () => {
        window.print();
    };

    const handlePrintNow = (format: '80mm' | '150mm') => {
        const labelDiv = document.getElementById('printable-thermal-label');
        if (!labelDiv) {
            alert("មិនអាចស្វែងរកទិន្នន័យ Label បានទេ!");
            return;
        }

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) return;

        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(tag => tag.outerHTML)
            .join('\n');

        const printCss = format === '80mm' 
            ? `
                /* 80x100mm Label Printer Override */
                @media print {
                    /* Match the exact option in the user's dropdown */
                    @page { 
                        size: 80mm 100mm !important; 
                        margin: 0 !important; 
                    }
                    html, body {
                        display: block !important;
                        visibility: visible !important;
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 80mm !important;
                        height: 100mm !important; 
                        overflow: hidden !important; 
                    }
                    * { visibility: visible !important; }
                    
                    #printable-thermal-label {
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        position: absolute !important;
                        top: 1mm !important;
                        left: 7.5mm !important; /* (80mm width - 65mm scaled width) / 2 = 7.5mm */
                        width: 100mm !important;
                        height: 150mm !important;
                        /* SCALE HACK: Scale 100x150mm down by 65% to become 65x97.5mm */
                        transform: scale(0.65) !important; 
                        transform-origin: top left !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        page-break-after: avoid !important;
                        page-break-inside: avoid !important;
                    }
                }
            `
            : `
                /* Standard 100x150mm Thermal Override */
                @media print {
                    @page { 
                        size: 100mm 150mm !important; 
                        margin: 0 !important; 
                    }
                    html, body {
                        display: block !important;
                        visibility: visible !important;
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    * { visibility: visible !important; }
                    
                    #printable-thermal-label {
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        position: static !important;
                        width: 100mm !important;
                        height: 150mm !important;
                        transform: none !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        page-break-after: avoid !important;
                    }
                }
            `;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print Label - ${format}</title>
                ${styles}
                <style>
                    ${printCss}
                    body { display: flex; justify-content: flex-start; align-items: flex-start; background: #fff; min-height: 100vh; margin: 0; }
                </style>
            </head>
            <body>
                ${labelDiv.outerHTML}
                <script>
                    setTimeout(() => { window.print(); window.close(); }, 500);
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Quick Tags Data
    const quickTags = [
        { label: '📦 ហាមបោះ (Fragile)', value: 'ហាមបោះ / Fragile' },
        { label: '📞 តេមុនដឹក (Call First)', value: 'តេមុនដឹក / Call before delivery' },
        { label: '🏠 ដាក់មុខផ្ទះ (Gate)', value: 'ដាក់មុខផ្ទះ / Leave at gate' },
        { label: '❄️ ត្រជាក់ (Keep Cool)', value: 'ទុកកន្លែងត្រជាក់ / Keep Cool' },
        { label: '⚠️ ប្រយ័ត្នបែក (Care)', value: 'ប្រយ័ត្នបែក / Handle with care' }
    ];

    const handleAddTag = (tagValue: string) => {
        setDriverNote(prev => {
            const trimmed = prev.trim();
            if (!trimmed) return tagValue;
            return `${trimmed}, ${tagValue}`;
        });
    };

    // Helper for Carrier Branding
    const getCarrierStyle = (carrierName: string = '') => {
        if (carrierName.includes('J&T')) return { bg: 'bg-[#e3000f]', text: 'text-white', name: 'J&T EXPRESS', code: 'J&T' };
        if (carrierName.includes('Virak')) return { bg: 'bg-[#0056b3]', text: 'text-white', name: 'VIRAK BUNTHAM', code: 'VET' };
        if (carrierName.includes('Grab')) return { bg: 'bg-[#00b14f]', text: 'text-white', name: 'GRAB EXPRESS', code: 'GRAB' };
        if (carrierName.includes('CE')) return { bg: 'bg-[#ff6600]', text: 'text-white', name: 'CE EXPRESS', code: 'CE' };
        if (carrierName.includes('Capitol')) return { bg: 'bg-[#6a1b9a]', text: 'text-white', name: 'CAPITOL', code: 'CP' };
        return { bg: 'bg-black', text: 'text-white', name: carrierName || 'LOGISTICS', code: 'LOG' };
    };

    const carrierStyle = getCarrierStyle(order.shippingCarrier || order.shippingDetails?.courier);
    const isCOD = order.paymentStatus === 'COD' || order.paymentStatus === 'Pending';

    // Extract payment bank name dynamically
    const getPaymentBankName = () => {
        // Try different possible fields for bank name
        if ((order as any).paymentBank) return (order as any).paymentBank;
        if ((order as any).bankName) return (order as any).bankName;
        if ((order as any).paymentMethodName) return (order as any).paymentMethodName;
        
        // Try to extract from transactionId if formatted as "BANK - 123456"
        if (order.transactionId && typeof order.transactionId === 'string' && order.transactionId.includes('-')) {
            const bankPart = order.transactionId.split('-')[0].trim();
            if (bankPart && !bankPart.includes('[')) return bankPart; // Skip if it's a deposit indicator
        }
        return '';
    };

    const bankName = getPaymentBankName();
    const paidStampText = bankName && bankName !== 'N/A' && bankName.toLowerCase() !== 'cod' 
        ? `PAID by ${bankName}` 
        : 'PAID';

    // CSS-only Barcode Generator (Visual representation)
    const Barcode = ({ value }: { value: string }) => (
        <div className="flex flex-col items-center w-full overflow-hidden">
            <div className="h-10 w-full flex items-end justify-center gap-[3px]">
                {/* Randomly generated bars to simulate a barcode look */}
                {value.split('').map((char, i) => (
                    <React.Fragment key={i}>
                        <div className={`h-full bg-black w-${i % 3 === 0 ? '1' : i % 2 === 0 ? '1.5' : '0.5'}`}></div>
                        <div className={`h-full bg-black w-${i % 2 === 0 ? '0.5' : '2'}`}></div>
                        <div className={`h-full bg-white w-0.5`}></div>
                    </React.Fragment>
                ))}
                {[...Array(15)].map((_, i) => (
                     <div key={`fill-${i}`} className={`h-full bg-black w-${Math.random() > 0.5 ? '1' : '2'}`}></div>
                ))}
            </div>
            <span className="font-mono text-xs tracking-[0.3em] font-bold mt-0.5">{value}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsShippingLabelModalOpen(false)}
            ></div>

            {/* Modal Container */}
            <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 no-print">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Label Preview</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">100mm x 150mm Thermal Sticker</p>
                    </div>
                    <button 
                        onClick={() => setIsShippingLabelModalOpen(false)} 
                        className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                        <span className="material-icons">close</span>
                    </button>
                </div>

                {/* Modal Body - Split View */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    
                    {/* Left: Preview Area */}
                    <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-[#0f172a] p-8 flex justify-center items-center no-print">
                        {/* The Label Visual */}
                        <div 
                            id="printable-thermal-label" 
                            className="bg-white text-black shadow-lg relative transform-gpu"
                            style={{ 
                                width: '100mm', 
                                height: '150mm',
                                boxSizing: 'border-box',
                                borderRadius: '4px' 
                            }}
                        >
                            <div className="flex flex-col h-full border-[3px] border-black">
                                
                                {/* 1. Header: Carrier & Date (15%) */}
                                <div className="flex border-b-[3px] border-black h-[15%]">
                                    <div className={`w-[65%] ${carrierStyle.bg} flex items-center justify-center print-color-adjust border-r-[3px] border-black`}>
                                        <h1 className={`text-3xl font-black italic tracking-tighter ${carrierStyle.text} uppercase`}>
                                            {carrierStyle.name}
                                        </h1>
                                    </div>
                                    <div className="w-[35%] flex flex-col justify-center items-center p-1 bg-white">
                                        <span className="text-[10px] font-bold uppercase text-slate-500">Date</span>
                                        <span className="text-sm font-bold">{new Date().toLocaleDateString('en-GB')}</span>
                                        <span className="text-xs font-bold">{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                    </div>
                                </div>

                                {/* 2. Zone 1: Receiver Details (30%) */}
                                <div className="h-[30%] border-b-[3px] border-black p-3 relative flex flex-col justify-center bg-white">
                                    <div className="absolute top-1 left-2 text-[10px] font-bold bg-black text-white px-1.5 rounded-sm print-color-adjust">TO (អ្នកទទួល)</div>
                                    
                                    <div className="mt-3 text-2xl font-black uppercase leading-tight truncate">
                                        {order.customer.name}
                                    </div>

                                    <div className="text-[34px] font-black leading-none tracking-tight my-1">
                                        {order.customer.phone}
                                    </div>

                                    <div className="text-sm font-bold leading-snug mt-1 line-clamp-2">
                                        {order.customer.address || "No address provided"}
                                    </div>
                                    
                                    <div className="mt-1 flex items-center gap-1 text-[10px] font-bold">
                                        <span className="material-icons text-sm">location_on</span>
                                        <span>{shopSettings.address.split(',')[0] || 'Phnom Penh'}</span>
                                    </div>
                                </div>

                                {/* 3. Zone 2: COD & Sort Code (15%) */}
                                <div className="h-[15%] flex border-b-[3px] border-black bg-white">
                                    <div className="w-[30%] border-r-[3px] border-black flex flex-col items-center justify-center p-1">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Sort</span>
                                        <span className="text-4xl font-black">PNH</span>
                                    </div>

                                    <div className="w-[70%] flex flex-col items-center justify-center relative bg-slate-50 print-color-adjust">
                                        <span className="absolute top-1 left-2 text-[10px] font-bold bg-black text-white px-1">
                                            {isCOD ? 'COD AMOUNT' : 'PAYMENT'}
                                        </span>
                                        
                                        {isCOD ? (
                                            <div className="flex flex-col items-center justify-center w-full">
                                                <div className="text-2xl font-black leading-tight tracking-tighter">
                                                    ${order.total.toFixed(2)}
                                                </div>
                                                <div className="text-2xl font-black leading-tight tracking-tighter border-t-2 border-black w-4/5 text-center mt-1 pt-1">
                                                    {(order.total * 4100).toLocaleString()} ៛
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border-[4px] border-black p-2 px-3 rounded-lg transform -rotate-3 flex items-center justify-center min-h-[60px]">
                                                <span className={`font-black uppercase text-center leading-tight break-words ${paidStampText.length > 10 ? 'text-xs' : 'text-lg'}`}>
                                                    {paidStampText}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 4. Zone 3: Details (15%) */}
                                <div className="h-[15%] flex flex-col border-b-[3px] border-black p-2 bg-white">
                                    <div className="flex-1 overflow-hidden">
                                        <span className="text-[9px] font-bold uppercase mr-1">Content:</span>
                                        <span className="text-[11px] font-bold leading-tight">
                                            {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                        </span>
                                    </div>
                                    <div className="mt-1 pt-1 border-t border-black flex justify-between items-end">
                                        <div className="w-[60%]">
                                            <span className="text-[9px] font-bold uppercase block">From:</span>
                                            <span className="text-[10px] font-bold truncate block">{shopSettings.name}</span>
                                        </div>
                                        <div className="w-[40%] text-right">
                                            <span className="text-[9px] font-bold block">{shopSettings.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 5. NEW: Driver Note (12%) */}
                                <div className="h-[12%] border-b-[3px] border-black p-1 flex relative bg-white">
                                    <div className="w-full h-full border-2 border-dashed border-black flex items-center justify-center text-center px-2 overflow-hidden">
                                        <p className="font-bold italic text-lg leading-tight uppercase line-clamp-2">
                                            {driverNote || <span className="text-slate-300 font-normal not-italic">Driver Note...</span>}
                                        </p>
                                    </div>
                                    <p className="absolute top-0 left-2 -mt-1.5 text-[9px] font-bold bg-white px-1 uppercase">Note</p>
                                </div>

                                {/* 6. Footer: Barcode (13%) */}
                                <div className="flex-1 p-1 flex flex-col items-center justify-center bg-white">
                                    <Barcode value={order.id.replace(/\D/g,'').substring(0,12) || '1234567890'} />
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Right: Controls Area */}
                    <div className="w-full md:w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 p-6 flex flex-col no-print overflow-y-auto custom-scrollbar">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Print Settings</h3>
                        
                        <div className="space-y-6 flex-1">
                            {/* Driver Note Input */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Driver Instructions / Note
                                </label>
                                
                                {/* Quick Tags */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {quickTags.map((tag, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAddTag(tag.value)}
                                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white dark:hover:bg-primary transition-all border border-slate-200 dark:border-slate-700 hover:border-primary active:scale-95"
                                        >
                                            {tag.label}
                                        </button>
                                    ))}
                                </div>

                                <textarea 
                                    value={driverNote}
                                    onChange={(e) => setDriverNote(e.target.value)}
                                    className="w-full h-32 p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none resize-none placeholder:text-slate-400"
                                    placeholder="e.g. Call before arrival, Fragile, Leave at gate..."
                                    maxLength={60}
                                />
                                <p className="text-xs text-slate-500 mt-1 text-right">{driverNote.length}/60 chars</p>
                            </div>

                            {/* Printer Info */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                                <div className="flex gap-3">
                                    <span className="material-icons text-blue-600 text-xl">print</span>
                                    <div>
                                        <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300">Ready to Print</h4>
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                            Format: 4x6" (100x150mm)<br/>
                                            Printer: Default System
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                            <button 
                                onClick={() => setIsShippingLabelModalOpen(false)}
                                className="px-3 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                បោះបង់
                            </button>
                            <button 
                                onClick={() => handlePrintNow('80mm')}
                                className="flex-1 px-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-[11px] sm:text-xs font-bold shadow-lg flex items-center justify-center gap-1.5 transition-all active:scale-95"
                                title="ព្រីនចេញម៉ាស៊ីនវិក្កយបត្រតូច (POS)"
                            >
                                <span className="material-icons text-[16px]">receipt</span>
                                80mm (POS)
                            </button>
                            <button 
                                onClick={() => handlePrintNow('150mm')}
                                className="flex-1 px-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                                title="ព្រីនចេញម៉ាស៊ីន Thermal ធំ"
                            >
                                <span className="material-icons text-[16px]">print</span>
                                100x150mm
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    @page {
                        size: 100mm 150mm;
                        margin: 0;
                    }
                    body {
                        background-color: white;
                        margin: 0;
                        padding: 0;
                    }
                    /* Hide everything else */
                    body > *:not(#printable-area-wrapper) {
                        visibility: hidden;
                        display: none;
                    }
                    
                    /* Reset visibility for the label */
                    #printable-area {
                        visibility: visible;
                        display: block;
                        position: absolute;
                        left: 0;
                        top: 0;
                        margin: 0;
                        padding: 0;
                        width: 100mm !important;
                        height: 150mm !important;
                        border: none !important; /* Remove border for actual print to avoid clipping if margins exist */
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        overflow: hidden;
                        z-index: 9999;
                    }
                    
                    /* Ensure background colors print */
                    .print-color-adjust {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    /* Ensure borders are crisp black */
                    .border-black {
                        border-color: #000000 !important;
                    }
                    .text-black {
                        color: #000000 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ShippingLabelPreview;
