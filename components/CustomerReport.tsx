import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';

const CustomerReport: React.FC = () => {
    const { customers } = useData();

    // --- Analytics Logic ---
    const stats = useMemo(() => {
        // Sort for Top Spenders
        const topSpenders = [...customers]
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5);

        // Sort for Top Debtors
        const topDebtors = [...customers]
            .filter(c => c.totalDebt > 0)
            .sort((a, b) => b.totalDebt - a.totalDebt)
            .slice(0, 5);

        // Mock dates/order counts because 'customers' in context is lightweight for now.
        // In real app, we'd aggregate from order history per customer.
        
        return { topSpenders, topDebtors };
    }, [customers]);

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
            <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
                {/* Header */}
                <header className="flex flex-col gap-1">
                    <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span className="text-primary">Reports</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="text-slate-900 dark:text-white font-medium">Customer Insights</span>
                    </nav>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 font-khmer">
                        Customer Insights & Debtors
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Spenders Card */}
                    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Top Spenders</h2>
                                <p className="text-sm text-slate-500 font-normal mt-0.5 font-khmer">អតិថិជនចំណាយច្រើនជាងគេ</p>
                            </div>
                            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-2 rounded-lg">
                                <span className="material-symbols-outlined">monetization_on</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-5 py-3 w-16 text-center">#</th>
                                        <th className="px-5 py-3">Customer</th>
                                        <th className="px-5 py-3 text-right">Total Spent</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {stats.topSpenders.length === 0 ? (
                                        <tr><td colSpan={3} className="px-5 py-8 text-center text-slate-500">No data available.</td></tr>
                                    ) : (
                                        stats.topSpenders.map((cust, idx) => (
                                            <tr key={cust.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                <td className="px-5 py-4 text-center">
                                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold mx-auto
                                                        ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                                          idx === 1 ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-700'}
                                                    `}>
                                                        {idx + 1}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                                            {cust.avatar.startsWith('http') ? (
                                                                <img src={cust.avatar} className="w-full h-full object-cover" alt={cust.name} />
                                                            ) : (
                                                                <span className="text-xs font-bold">{cust.avatar}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors font-khmer">{cust.name}</p>
                                                            <p className="text-xs text-slate-500">{cust.status}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <p className="font-bold text-slate-900 dark:text-white">${cust.totalSpent.toFixed(2)}</p>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top Debtors Card */}
                    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Top Debtors</h2>
                                <p className="text-sm text-slate-500 font-normal mt-0.5 font-khmer">អតិថិជនជំពាក់ច្រើនជាងគេ</p>
                            </div>
                            <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-lg">
                                <span className="material-symbols-outlined">warning</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-5 py-3">Customer</th>
                                        <th className="px-5 py-3 text-right">Outstanding</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {stats.topDebtors.length === 0 ? (
                                        <tr><td colSpan={2} className="px-5 py-8 text-center text-slate-500">No outstanding debts.</td></tr>
                                    ) : (
                                        stats.topDebtors.map((cust) => (
                                            <tr key={cust.id} className="hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors group">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center overflow-hidden">
                                                            {cust.avatar.startsWith('http') ? (
                                                                <img src={cust.avatar} className="w-full h-full object-cover" alt={cust.name} />
                                                            ) : (
                                                                <span className="text-xs font-bold">{cust.avatar}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900 dark:text-white font-khmer">{cust.name}</p>
                                                            <p className="text-xs text-red-500 font-medium">Overdue</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <p className="font-bold text-red-500 dark:text-red-400">${cust.totalDebt.toFixed(2)}</p>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                                                        Unpaid
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerReport;