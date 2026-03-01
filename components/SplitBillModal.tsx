import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const SplitBillModal: React.FC = () => {
    const { finalTotal, setIsSplitBillModalOpen, createOrder } = useData();
    const [personCount, setPersonCount] = useState(4);
    const [splitType, setSplitType] = useState<'Equally' | 'Items'>('Equally');

    const perPerson = finalTotal / personCount;

    const handleConfirm = () => {
        // In a real scenario, this would likely open a payment flow for 1/N amount repeatedly or track paid portions.
        // For this demo, we simulate processing the first split payment or closing the modal to proceed.
        // We'll call createOrder with the FULL amount to simulate closing the ticket, assuming all splits paid.
        createOrder('Cash', finalTotal); 
        setIsSplitBillModalOpen(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Background Context */}
            <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSplitBillModalOpen(false)}></div>
            
            {/* Modal Container */}
            <div className="relative z-10 w-full max-w-[520px] bg-white dark:bg-[#1e2936] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                    <h1 className="text-xl text-gray-900 dark:text-white font-bold flex items-center gap-2">
                        <span className="font-khmer font-bold">ចែកវិក្កយបត្រ</span>
                        <span className="text-gray-400 text-sm font-normal pt-1">Split Bill</span>
                    </h1>
                    <button onClick={() => setIsSplitBillModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                {/* Total Display */}
                <div className="px-6 py-6 bg-slate-50 dark:bg-slate-800/50">
                    <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-5 flex flex-col items-center justify-center text-center shadow-sm">
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1 font-khmer">សរុបទឹកប្រាក់ (Total Amount)</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-primary dark:text-primary tracking-tight">${finalTotal.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Current Order</div>
                    </div>
                </div>
                {/* Tabs */}
                <div className="px-6 pt-2">
                    <div className="flex border-b border-gray-200 dark:border-gray-700 w-full">
                        <button 
                            onClick={() => setSplitType('Equally')}
                            className={`flex-1 pb-3 pt-2 text-center border-b-[3px] font-medium transition-all ${splitType === 'Equally' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            <div className="flex flex-col items-center gap-1">
                                <span className="material-symbols-outlined text-[20px]">groups</span>
                                <span className="text-sm font-khmer">ចែកស្មើគ្នា (Equally)</span>
                            </div>
                        </button>
                        <button 
                            onClick={() => setSplitType('Items')}
                            className={`flex-1 pb-3 pt-2 text-center border-b-[3px] font-medium transition-all ${splitType === 'Items' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            <div className="flex flex-col items-center gap-1">
                                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                                <span className="text-sm font-khmer">ចែកតាមទំនិញ (By Items)</span>
                            </div>
                        </button>
                    </div>
                </div>
                {/* Content Area */}
                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {splitType === 'Equally' ? (
                        <div className="space-y-6">
                            {/* Number of people input */}
                            <div className="flex flex-col gap-3">
                                <label className="text-gray-700 dark:text-gray-200 text-base font-medium font-khmer">ចំនួនមនុស្ស (Number of People)</label>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setPersonCount(Math.max(2, personCount - 1))} className="w-14 h-14 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-white flex items-center justify-center transition-colors">
                                        <span className="material-symbols-outlined">remove</span>
                                    </button>
                                    <div className="flex-1 h-14 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center relative">
                                        <input className="w-full h-full text-center text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 p-0" type="number" value={personCount} readOnly/>
                                        <span className="absolute right-4 text-gray-400 text-sm pointer-events-none font-khmer">នាក់</span>
                                    </div>
                                    <button onClick={() => setPersonCount(personCount + 1)} className="w-14 h-14 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-primary flex items-center justify-center transition-colors shadow-sm">
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                </div>
                            </div>
                            {/* Calculation Result Card */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl p-5 flex flex-col gap-3 mt-2">
                                <div className="flex justify-between items-center border-b border-blue-200 dark:border-blue-800/50 pb-3">
                                    <span className="text-gray-600 dark:text-gray-300 font-khmer text-sm">ទឹកប្រាក់សរុប (Total)</span>
                                    <span className="text-gray-900 dark:text-white font-semibold">${finalTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-blue-200 dark:border-blue-800/50 pb-3">
                                    <span className="text-gray-600 dark:text-gray-300 font-khmer text-sm">ចែកជា (Split by)</span>
                                    <span className="text-gray-900 dark:text-white font-semibold">{personCount} people</span>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-primary font-bold font-khmer text-lg">ទឹកប្រាក់ម្នាក់ (Per Person)</span>
                                    <span className="text-2xl font-bold text-primary">${perPerson.toFixed(2)}</span>
                                </div>
                            </div>
                            {/* Visual Cue */}
                            <div className="flex justify-center -space-x-2 pt-2 pb-2">
                                {[...Array(Math.min(personCount, 5))].map((_, i) => (
                                    <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-slate-800 text-white ${i === 0 ? 'bg-primary' : `bg-primary/${100 - (i*20)}`}`}>{i+1}</div>
                                ))}
                                {personCount > 5 && <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-slate-800">+{personCount - 5}</div>}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                            <p>Item splitting not available in this demo.</p>
                        </div>
                    )}
                </div>
                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1e2936]">
                    <button onClick={handleConfirm} className="w-full bg-primary hover:bg-primary-dark text-white rounded-lg h-14 flex items-center justify-center gap-2 font-bold text-lg shadow-lg shadow-primary/30 transition-all active:scale-[0.98]">
                        <span className="font-khmer">គិតលុយបន្ត</span>
                        <span className="text-base font-normal opacity-90">(Proceed to Pay)</span>
                        <span className="material-symbols-outlined ml-1">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SplitBillModal;