import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const SubscriptionBilling: React.FC = () => {
    const { subscription, renewSubscription, setCurrentView } = useData();
    const [selectedPlan, setSelectedPlan] = useState<'Monthly' | '6_Months' | 'Yearly'>('Monthly');

    const handleRenew = () => {
        // Mock payment flow
        const confirm = window.confirm(`Proceed to pay for ${selectedPlan} renewal?`);
        if (confirm) {
            renewSubscription(selectedPlan);
            alert('Payment Successful! Subscription renewed.');
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 dark:text-slate-100">
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[1280px] mx-auto">
                {/* Breadcrumbs */}
                <nav className="flex items-center text-sm font-medium text-slate-500 mb-6">
                    <button onClick={() => setCurrentView('dashboard')} className="hover:text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[20px]">dashboard</span>
                        <span>Dashboard</span>
                    </button>
                    <span className="material-symbols-outlined text-[16px] mx-2">chevron_right</span>
                    <span className="font-semibold text-slate-900 dark:text-white">Subscription & Billing</span>
                </nav>

                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2 font-khmer">ការជាវ និងការទូទាត់</h1>
                    <p className="text-slate-500 text-lg font-khmer">គ្រប់គ្រងគម្រោងបច្ចុប្បន្ន និងប្រវត្តិការទូទាត់របស់អ្នកនៅទីនេះ</p>
                </header>

                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><span className="material-symbols-outlined text-8xl text-primary">verified</span></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div><h3 className="text-sm font-medium text-slate-500 font-khmer mb-1">គម្រោងបច្ចុប្បន្ន</h3><div className="text-2xl font-bold">{subscription.plan} Tier</div></div>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${subscription.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${subscription.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    {subscription.status}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500 font-khmer">កាលបរិច្ឆេទផុតកំណត់:</p>
                                <p className="text-lg font-semibold">{subscription.expiryDate.toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                    {/* Usage & Status Cards (Static for layout) */}
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-medium text-slate-500 font-khmer">ការប្រើប្រាស់គម្រោង</h3><span className="material-symbols-outlined text-primary text-2xl">bar_chart</span></div>
                        <div className="flex items-end gap-2 mb-2"><span className="text-3xl font-bold">85%</span><span className="text-sm text-slate-500 mb-1">នៃកូតាសរុប</span></div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden"><div className="bg-primary h-2.5 rounded-full" style={{width: '85%'}}></div></div>
                    </div>
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm bg-gradient-to-br from-white to-slate-50 dark:from-surface-dark dark:to-slate-800/50">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-medium text-slate-500 font-khmer">ស្ថានភាពគណនី</h3><span className="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span></div>
                        <div className="mt-2"><p className="text-sm text-slate-500 font-khmer mb-1">ទឹកប្រាក់ដែលត្រូវបង់បន្ទាប់</p><p className="text-2xl font-bold">$10.00</p></div>
                    </div>
                </div>

                {/* Renewal Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">autorenew</span><span className="font-khmer">បន្តការជាវថ្មី</span></h2>
                        <div className="grid grid-cols-1 gap-4">
                            <label className={`relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan === 'Monthly' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50'}`}>
                                <input type="radio" name="plan" className="sr-only" checked={selectedPlan === 'Monthly'} onChange={() => setSelectedPlan('Monthly')} />
                                <div className="flex items-center gap-4"><div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === 'Monthly' ? 'border-primary bg-primary' : 'border-slate-300'}`}><div className="w-2 h-2 rounded-full bg-white"></div></div><div><p className="font-semibold text-lg font-khmer">1 ខែ</p><p className="text-sm text-slate-500 font-khmer">បង់ប្រាក់ប្រចាំខែ</p></div></div>
                                <div className="text-right"><p className="font-bold text-xl">$10.00</p><p className="text-xs text-slate-400 font-khmer">/ខែ</p></div>
                            </label>
                            <label className={`relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan === '6_Months' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50'}`}>
                                <input type="radio" name="plan" className="sr-only" checked={selectedPlan === '6_Months'} onChange={() => setSelectedPlan('6_Months')} />
                                <div className="absolute -top-3 right-4 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm font-khmer">ចំណេញ 10%</div>
                                <div className="flex items-center gap-4"><div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === '6_Months' ? 'border-primary bg-primary' : 'border-slate-300'}`}><div className="w-2 h-2 rounded-full bg-white"></div></div><div><p className="font-semibold text-lg font-khmer">6 ខែ</p><p className="text-sm text-slate-500 font-khmer">បង់ប្រាក់រៀងរាល់ 6 ខែម្តង</p></div></div>
                                <div className="text-right"><p className="font-bold text-xl">$55.00</p><p className="text-xs text-slate-400 line-through">$60.00</p></div>
                            </label>
                            <label className={`relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan === 'Yearly' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50'}`}>
                                <input type="radio" name="plan" className="sr-only" checked={selectedPlan === 'Yearly'} onChange={() => setSelectedPlan('Yearly')} />
                                <div className="absolute -top-3 right-4 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm font-khmer">តម្លៃពិសេស</div>
                                <div className="flex items-center gap-4"><div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === 'Yearly' ? 'border-primary bg-primary' : 'border-slate-300'}`}><div className="w-2 h-2 rounded-full bg-white"></div></div><div><p className="font-semibold text-lg font-khmer">1 ឆ្នាំ</p><p className="text-sm text-slate-500 font-khmer">បង់ប្រាក់ប្រចាំឆ្នាំ (ចំណេញច្រើនជាងគេ)</p></div></div>
                                <div className="text-right"><p className="font-bold text-xl">$100.00</p><p className="text-xs text-slate-400 line-through">$120.00</p></div>
                            </label>
                        </div>
                    </div>
                    
                    {/* Payment Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden flex flex-col h-full">
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-center">
                                <h3 className="text-lg font-bold font-khmer mb-1">ស្កេនដើម្បីបង់ប្រាក់</h3>
                                <p className="text-sm text-slate-500 font-khmer">KHQR Payment</p>
                            </div>
                            <div className="p-8 flex-1 flex flex-col items-center justify-center">
                                <div className="relative bg-white p-4 rounded-lg border-2 border-red-600 shadow-sm w-full max-w-[240px] aspect-square flex items-center justify-center mb-6">
                                    <div className="absolute top-0 left-0 w-full h-8 bg-red-600 flex items-center justify-center"><span className="text-white font-bold text-xs tracking-widest">KHQR</span></div>
                                    {/* Mock QR */}
                                    <div className="w-full h-full bg-slate-900 mt-4 opacity-10"></div>
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-red-600 font-bold">$ USD</div>
                                </div>
                                <div className="text-center w-full mb-6">
                                    <p className="text-sm text-slate-500 font-khmer mb-1">ទឹកប្រាក់សរុប</p>
                                    <p className="text-3xl font-black text-primary">
                                        ${selectedPlan === 'Monthly' ? '10.00' : selectedPlan === '6_Months' ? '55.00' : '100.00'}
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <button onClick={handleRenew} className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    <span className="font-khmer">ផ្ទៀងផ្ទាត់ការទូទាត់ (Confirm)</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SubscriptionBilling;