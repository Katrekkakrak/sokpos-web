import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';

const ShiftReport: React.FC = () => {
    const { orders } = useData();
    const [startingCash] = useState(100.00); // Mock starting cash

    // --- Analytics Logic ---
    const stats = useMemo(() => {
        // Filter for "Today's" orders. For demo, we might accept all if no date provided, 
        // but let's strictly filter to show logic. If array is empty, we will see 0s.
        // In a real app, ensure date comparison ignores time.
        const today = new Date();
        const isToday = (date: Date) => {
            return date.getDate() === today.getDate() &&
                   date.getMonth() === today.getMonth() &&
                   date.getFullYear() === today.getFullYear();
        };

        const todaysOrders = orders.filter(o => isToday(new Date(o.date)));

        const cashOrders = todaysOrders.filter(o => o.method === 'Cash');
        const digitalOrders = todaysOrders.filter(o => o.method === 'KHQR' || o.method === 'Card');

        const cashSalesTotal = cashOrders.reduce((acc, o) => acc + o.total, 0);
        const digitalSalesTotal = digitalOrders.reduce((acc, o) => acc + o.total, 0);
        
        const expectedCash = startingCash + cashSalesTotal;
        // Mock actual count as matching expected for now, or could add an input field
        const actualCash = expectedCash; 
        const discrepancy = actualCash - expectedCash;

        // Transaction breakdown
        const refundsCount = 0; // Mock
        const refundsTotal = 0;
        const payoutsCount = 0; // Mock
        const payoutsTotal = 0;

        return {
            date: today.toLocaleDateString(),
            cashSales: cashSalesTotal,
            digitalSales: digitalSalesTotal,
            expected: expectedCash,
            discrepancy,
            totalCollected: cashSalesTotal + digitalSalesTotal,
            counts: {
                cash: cashOrders.length,
                digital: digitalOrders.length,
                refunds: refundsCount,
                payouts: payoutsCount
            },
            refundsTotal,
            payoutsTotal
        };
    }, [orders, startingCash]);

    return (
        <div className="flex-1 flex flex-col p-4 md:p-8 max-w-[1200px] mx-auto w-full">
            {/* Breadcrumbs */}
            <nav className="flex flex-wrap gap-2 mb-6 text-sm">
                <a className="text-text-sub hover:text-primary transition-colors flex items-center gap-1" href="#">
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    Home
                </a>
                <span className="text-text-sub">/</span>
                <a className="text-text-sub hover:text-primary transition-colors" href="#">Reports</a>
                <span className="text-text-sub">/</span>
                <span className="text-text-main dark:text-white font-medium">Shift Report</span>
            </nav>

            {/* Page Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-text-main dark:text-white mb-2 font-khmer">
                        របាយការណ៍បិទវេន (Shift Report)
                    </h1>
                    <p className="text-text-sub flex flex-wrap gap-x-4 gap-y-1 text-base">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">badge</span> Session ID: #89201</span>
                        <span className="hidden sm:inline text-border-light dark:text-gray-600">|</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">calendar_today</span> {stats.date}</span>
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none items-center justify-center gap-2 rounded-lg h-10 px-4 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-main dark:text-white font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {/* Starting Cash */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400">
                            <span className="material-symbols-outlined text-[24px]">payments</span>
                        </div>
                        <p className="text-sm font-medium text-text-sub">Starting Cash<br/><span className="text-xs opacity-80">(ប្រាក់ដើម)</span></p>
                    </div>
                    <p className="text-2xl font-bold text-text-main dark:text-white tracking-tight">${startingCash.toFixed(2)}</p>
                </div>
                {/* Cash Sales */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                            <span className="material-symbols-outlined text-[24px]">attach_money</span>
                        </div>
                        <p className="text-sm font-medium text-text-sub">Cash Sales<br/><span className="text-xs opacity-80">(ប្រាក់លក់បាន)</span></p>
                    </div>
                    <p className="text-2xl font-bold text-text-main dark:text-white tracking-tight">${stats.cashSales.toFixed(2)}</p>
                    <p className="text-xs text-green-600 mt-1 font-medium">+{stats.counts.cash} transactions</p>
                </div>
                {/* Digital Sales */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                            <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
                        </div>
                        <p className="text-sm font-medium text-text-sub">Digital Sales<br/><span className="text-xs opacity-80">(KHQR/ធនាគារ)</span></p>
                    </div>
                    <p className="text-2xl font-bold text-text-main dark:text-white tracking-tight">${stats.digitalSales.toFixed(2)}</p>
                    <p className="text-xs text-purple-600 mt-1 font-medium">{stats.counts.digital} transactions</p>
                </div>
                {/* Expected Cash */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow ring-1 ring-primary/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary dark:text-blue-400">
                            <span className="material-symbols-outlined text-[24px]">calculate</span>
                        </div>
                        <p className="text-sm font-medium text-text-sub">Expected Cash<br/><span className="text-xs opacity-80">(ប្រាក់រំពឹងទុក)</span></p>
                    </div>
                    <p className="text-2xl font-bold text-primary dark:text-blue-400 tracking-tight">${stats.expected.toFixed(2)}</p>
                    <p className="text-xs text-text-sub mt-1">Start + Sales</p>
                </div>
                {/* Discrepancy */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className={`absolute right-0 top-0 w-1 h-full ${stats.discrepancy === 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${stats.discrepancy === 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            <span className="material-symbols-outlined text-[24px]">{stats.discrepancy === 0 ? 'check_circle' : 'warning'}</span>
                        </div>
                        <p className="text-sm font-medium text-text-sub">Discrepancy<br/><span className="text-xs opacity-80">(ប្រាក់ខ្វះ/លើស)</span></p>
                    </div>
                    <p className={`text-2xl font-bold tracking-tight ${stats.discrepancy === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${stats.discrepancy.toFixed(2)}
                    </p>
                    <p className="text-xs opacity-80 mt-1 font-medium">
                        {stats.discrepancy === 0 ? 'Balanced' : 'Attention required'}
                    </p>
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
                {/* Left: Transaction Breakdown */}
                <div className="flex-1 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm flex flex-col">
                    <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                        <h3 className="font-bold text-lg text-text-main dark:text-white font-khmer">Transaction Breakdown (ប្រតិបត្តិការ)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-background-light dark:bg-background-dark/50 text-text-sub uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Count</th>
                                    <th className="px-6 py-3 text-right">Amount (USD)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                <tr className="hover:bg-background-light dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-text-main dark:text-white flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div> Sales (ការលក់)
                                    </td>
                                    <td className="px-6 py-4">{stats.counts.cash + stats.counts.digital}</td>
                                    <td className="px-6 py-4 text-right font-medium text-green-600 dark:text-green-400">
                                        ${(stats.cashSales + stats.digitalSales).toFixed(2)}
                                    </td>
                                </tr>
                                <tr className="hover:bg-background-light dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-text-main dark:text-white flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div> Refunds (ការសងប្រាក់)
                                    </td>
                                    <td className="px-6 py-4">{stats.counts.refunds}</td>
                                    <td className="px-6 py-4 text-right font-medium text-red-600 dark:text-red-400">
                                        -${Math.abs(stats.refundsTotal).toFixed(2)}
                                    </td>
                                </tr>
                                <tr className="bg-background-light/50 dark:bg-background-dark/30 font-bold">
                                    <td className="px-6 py-4 text-text-main dark:text-white">Net Total (សរុប)</td>
                                    <td className="px-6 py-4">{stats.counts.cash + stats.counts.digital + stats.counts.refunds}</td>
                                    <td className="px-6 py-4 text-right text-primary dark:text-blue-400">
                                        ${(stats.totalCollected + stats.refundsTotal).toFixed(2)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-auto pt-6 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row justify-end gap-4">
                <button className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group">
                    <span className="material-symbols-outlined group-hover:animate-pulse">print</span>
                    <span>Print Z-Report (បោះពុម្ពរបាយការណ៍បិទវេន)</span>
                </button>
            </div>
        </div>
    );
};

export default ShiftReport;