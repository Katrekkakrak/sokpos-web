import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';

const PaymentModal: React.FC = () => {
    const { finalTotal, createOrder, setIsPaymentModalOpen, posCustomer } = useData();
    const [receivedAmount, setReceivedAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    // Parse received amount safely
    const received = parseFloat(receivedAmount) || 0;
    const change = received - finalTotal;
    const isSufficient = paymentMethod === 'Debt' ? true : received >= finalTotal;
    const canConfirm = paymentMethod === 'Debt' ? !!posCustomer : isSufficient;

    const handleNumPress = (val: string) => {
        if (val === '.') {
            if (!receivedAmount.includes('.')) {
                setReceivedAmount(prev => prev + val);
            }
        } else {
            setReceivedAmount(prev => prev + val);
        }
    };

    const handleBackspace = () => {
        setReceivedAmount(prev => prev.slice(0, -1));
    };

    const handleQuickAmount = (val: number) => {
        setReceivedAmount(val.toString());
    };

    const handleConfirm = () => {
        if (canConfirm) {
            createOrder(paymentMethod, received);
        }
    };

    // Keyboard support for numpad
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key >= '0' && e.key <= '9') handleNumPress(e.key);
            if (e.key === '.') handleNumPress('.');
            if (e.key === 'Backspace') handleBackspace();
            if (e.key === 'Enter') handleConfirm();
            if (e.key === 'Escape') setIsPaymentModalOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [receivedAmount, canConfirm]);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity flex items-center justify-center p-4">
            <div className="relative z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] md:h-auto overflow-hidden flex flex-col md:flex-row border border-neutral-border dark:border-slate-700">
                
                {/* Left Column: Payment Details & Summary */}
                <div className="w-full md:w-5/12 bg-neutral-surface dark:bg-slate-900 p-6 flex flex-col justify-between border-r border-neutral-border dark:border-slate-700">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-icons text-primary">payments</span>
                            Payment / ការទូទាត់
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Order #QB-New • Walk-in Customer</p>
                    </div>

                    <div className="space-y-4 mb-6">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Payment Method</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button 
                                onClick={() => setPaymentMethod('Cash')}
                                className={`relative group flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${paymentMethod === 'Cash' ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-border bg-white text-slate-600 hover:bg-slate-50'}`}
                            >
                                {paymentMethod === 'Cash' && (
                                    <div className="absolute top-2 right-2"><span className="material-icons text-lg">check_circle</span></div>
                                )}
                                <span className="material-icons text-3xl mb-2">payments</span>
                                <span className="font-bold">Cash</span>
                                <span className="text-xs font-khmer opacity-80">ប្រាក់សុទ្ធ</span>
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('KHQR')}
                                className={`relative group flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${paymentMethod === 'KHQR' ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-border bg-white text-slate-600 hover:bg-slate-50'}`}
                            >
                                {paymentMethod === 'KHQR' && (
                                    <div className="absolute top-2 right-2"><span className="material-icons text-lg">check_circle</span></div>
                                )}
                                <span className="material-icons text-3xl mb-2">qr_code_scanner</span>
                                <span className="font-bold">KHQR</span>
                                <span className="text-xs font-khmer opacity-80">ស្កេន</span>
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('Debt')}
                                className={`relative group flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${paymentMethod === 'Debt' ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-border bg-white text-slate-600 hover:bg-slate-50'}`}
                            >
                                {paymentMethod === 'Debt' && (
                                    <div className="absolute top-2 right-2"><span className="material-icons text-lg">check_circle</span></div>
                                )}
                                <span className="material-icons text-3xl mb-2">account_balance_wallet</span>
                                <span className="font-bold">Debt</span>
                                <span className="text-xs font-khmer opacity-80">ជំពាក់សិន</span>
                            </button>
                        </div>
                        {paymentMethod === 'Debt' && !posCustomer && (
                            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                                <span className="material-icons text-sm">error</span>
                                <span className="font-khmer">សូមជ្រើសរើសឈ្មោះអតិថិជន មុននឹងឲ្យជំពាក់! (Please select a customer first)</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-lg p-5 shadow-sm border border-neutral-border dark:border-slate-700 space-y-4 flex-grow">
                        <div className="flex justify-between items-end border-b border-dashed border-slate-200 dark:border-slate-700 pb-4">
                            <div className="text-left">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Due / សរុប</p>
                                <p className="text-xs text-slate-400">Rate: 1$ = 4100៛</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">${finalTotal.toFixed(2)}</p>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{(finalTotal * 4100).toLocaleString()} ៛</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-2">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Received / ទទួល</p>
                            <div className="text-right">
                                <p className={`text-xl font-bold ${receivedAmount === '' ? 'text-slate-300' : 'text-primary'}`}>
                                    ${receivedAmount || '0.00'}
                                </p>
                            </div>
                        </div>

                        <div className={`rounded-lg p-3 flex justify-between items-center border ${change >= 0 ? 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800/30' : 'bg-red-50 border-red-100 dark:bg-red-900/20'}`}>
                            <div className="flex items-center gap-2">
                                <span className={`material-icons ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>change_circle</span>
                                <span className={`text-sm font-bold ${change >= 0 ? 'text-green-800 dark:text-green-300' : 'text-red-800'}`}>
                                    {change >= 0 ? 'Change / អាប់' : 'Due / ខ្វះ'}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className={`text-lg font-bold ${change >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-600'}`}>
                                    ${Math.abs(change).toFixed(2)}
                                </p>
                                <p className={`text-xs font-medium ${change >= 0 ? 'text-green-600/80' : 'text-red-500'}`}>
                                    {(Math.abs(change) * 4100).toLocaleString()} ៛
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Keypad & Actions */}
                <div className="w-full md:w-7/12 p-6 flex flex-col bg-white dark:bg-slate-800 h-full relative">
                    <div className="absolute top-4 right-4">
                        <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            <span className="material-icons">close</span>
                        </button>
                    </div>

                    <div className="mb-4">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">Quick Amount</label>
                        <div className="grid grid-cols-4 gap-3">
                            {[1, 5, 10, 20, 50, 100].map(amt => (
                                <button key={amt} onClick={() => handleQuickAmount(amt)} className="py-2 px-1 rounded-lg border border-neutral-border dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-colors font-medium text-sm">
                                    ${amt}
                                </button>
                            ))}
                            <button onClick={() => setReceivedAmount(finalTotal.toFixed(2))} className="py-2 px-1 rounded-lg border border-blue-200 bg-blue-50 text-primary dark:bg-primary/20 dark:border-primary/30 dark:text-primary-300 hover:bg-blue-100 transition-colors font-medium text-sm col-span-2">Exact / គ្រប់</button>
                        </div>
                    </div>

                    <div className="flex-grow grid grid-cols-3 gap-3 mb-6">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map(key => (
                            <button 
                                key={key} 
                                onClick={() => handleNumPress(key)}
                                className="bg-neutral-surface dark:bg-slate-700 rounded-lg text-2xl font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition-all shadow-sm"
                            >
                                {key}
                            </button>
                        ))}
                        <button onClick={handleBackspace} className="bg-red-50 dark:bg-red-900/20 rounded-lg text-2xl font-semibold text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 transition-all shadow-sm flex items-center justify-center">
                            <span className="material-icons">backspace</span>
                        </button>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700 pt-5 mt-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                    <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300 flex flex-col">
                                        <span>Print Receipt</span>
                                        <span className="text-xs font-khmer opacity-70">បោះពុម្ពវិក្កយបត្រ</span>
                                    </span>
                                </label>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-slate-400 block mb-1">Press ENTER to confirm</span>
                            </div>
                        </div>
                        <button 
                            onClick={handleConfirm}
                            disabled={!canConfirm}
                            className={`w-full text-white rounded-lg py-4 text-lg font-bold shadow-lg flex items-center justify-center gap-3 active:scale-[0.99] transition-all
                                ${canConfirm 
                                    ? 'bg-primary hover:bg-primary-hover shadow-blue-500/30' 
                                    : 'bg-slate-300 cursor-not-allowed shadow-none'
                                }`}
                        >
                            <span>Confirm Payment</span>
                            <span className="font-khmer font-normal text-base opacity-90">| បញ្ជាក់ការបង់ប្រាក់</span>
                            <span className="material-icons text-white/80">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;