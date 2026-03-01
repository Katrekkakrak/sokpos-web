import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const DepositModal: React.FC = () => {
    const { setIsDepositModalOpen, addDeposit, selectedContact } = useData();
    const [amount, setAmount] = useState<string>('');
    const [totalAmount, setTotalAmount] = useState<string>('1250.00'); // Mock total for context

    if (!selectedContact) return null;

    const handleConfirm = () => {
        if (amount) {
            addDeposit(selectedContact.id, parseFloat(amount), 'file_ref_mock');
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity flex items-center justify-center p-4">
            <div className="relative z-50 w-full max-w-lg mx-auto bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-slate-700 bg-white dark:bg-surface-dark sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">ការគ្រប់គ្រងការកក់ប្រាក់</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Deposit Management</p>
                    </div>
                    <button onClick={() => setIsDepositModalOpen(false)} className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>
                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                    {/* Financial Inputs Group */}
                    <div className="space-y-5">
                        {/* Total Amount */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                សរុបប្រាក់វិក្កយបត្រ <span className="text-slate-500 text-xs font-normal ml-1">(Total Amount)</span>
                            </label>
                            <div className="relative rounded-lg shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-slate-500 sm:text-sm">$</span>
                                </div>
                                <input 
                                    className="block w-full rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/50 py-3 pl-8 pr-12 text-slate-900 dark:text-white focus:border-primary focus:ring-primary sm:text-sm shadow-sm transition-shadow duration-200" 
                                    placeholder="0.00" type="number" 
                                    value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)}
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <span className="text-slate-500 sm:text-sm">USD</span>
                                </div>
                            </div>
                        </div>
                        {/* Deposit Amount */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                ប្រាក់កក់ទទួលបាន <span className="text-slate-500 text-xs font-normal ml-1">(Deposit Received)</span>
                            </label>
                            <div className="relative rounded-lg shadow-sm group">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-primary font-semibold sm:text-sm">$</span>
                                </div>
                                <input 
                                    className="block w-full rounded-lg border-primary/40 dark:border-primary/40 bg-white dark:bg-slate-800/50 py-3 pl-8 pr-12 text-slate-900 dark:text-white focus:border-primary focus:ring-primary sm:text-sm shadow-sm shadow-primary/5 transition-shadow duration-200" 
                                    placeholder="0.00" type="number"
                                    value={amount} onChange={(e) => setAmount(e.target.value)}
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <span className="text-slate-500 sm:text-sm">USD</span>
                                </div>
                            </div>
                        </div>
                        {/* Remaining Balance */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ប្រាក់នៅខ្វះ (Remaining Balance)</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Auto-calculated</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-2xl font-bold text-slate-800 dark:text-white">
                                    $ {((parseFloat(totalAmount) || 0) - (parseFloat(amount) || 0)).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Upload Section */}
                    <div className="pt-2">
                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                            ភ្ជាប់រូបភាពវេរលុយ <span className="text-slate-500 text-xs font-normal ml-1">(Attach Bank Slip)</span>
                        </label>
                        <div className="mt-1 flex justify-center rounded-xl border-2 border-dashed border-primary/30 dark:border-primary/20 bg-primary/[0.02] px-6 py-8 hover:bg-primary/[0.05] transition-colors cursor-pointer group">
                            <div className="text-center space-y-2">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-200">
                                    <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                                </div>
                                <div className="flex text-sm text-slate-600 dark:text-slate-400">
                                    <label className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary-hover" htmlFor="file-upload">
                                        <span>Upload a file</span>
                                        <input className="sr-only" id="file-upload" name="file-upload" type="file" />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-slate-400 dark:text-slate-500">PNG, JPG, PDF up to 5MB</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Footer */}
                <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={() => setIsDepositModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500 transition-colors shadow-sm" type="button">
                        បោះបង់ (Cancel)
                    </button>
                    <button onClick={handleConfirm} className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2" type="button">
                        <span className="material-symbols-outlined text-[1.125rem]">check_circle</span>
                        បញ្ជាក់ការកក់ (Confirm)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DepositModal;