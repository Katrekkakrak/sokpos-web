import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';

const ChannelReport: React.FC = () => {
    const { orders, onlineOrders } = useData();

    // --- Stats Calculation ---
    const stats = useMemo(() => {
        // POS Data
        const posCount = orders.length;
        const posTotal = orders.reduce((acc, o) => acc + o.total, 0);
        const posAvg = posCount > 0 ? posTotal / posCount : 0;

        // Online Data (Split into sub-channels manually for demo, assuming source field exists or logic applied)
        // In real logic, we'd check onlineOrder.source. Here we simulate distribution based on existing data.
        const onlineCount = onlineOrders.length;
        const onlineTotal = onlineOrders.reduce((acc, o) => acc + o.total, 0);
        const onlineAvg = onlineCount > 0 ? onlineTotal / onlineCount : 0;

        // Mock breakdown for channels since onlineOrder currently doesn't strictly enforce 'source' field in all interfaces
        // We will distribute the online orders: 60% FB, 25% Telegram, 15% Other
        const fbCount = Math.floor(onlineCount * 0.6);
        const fbTotal = onlineTotal * 0.6;
        
        const tgCount = Math.floor(onlineCount * 0.25);
        const tgTotal = onlineTotal * 0.25;

        const appCount = onlineCount - fbCount - tgCount;
        const appTotal = onlineTotal - fbTotal - tgTotal;

        const totalCount = posCount + onlineCount;
        const totalRevenue = posTotal + onlineTotal;
        const totalAvg = totalCount > 0 ? totalRevenue / totalCount : 0;

        // Chart Percentages
        const posPercent = totalRevenue > 0 ? (posTotal / totalRevenue) * 100 : 0;
        const onlinePercent = totalRevenue > 0 ? (onlineTotal / totalRevenue) * 100 : 0;
        
        // Dash arrays for donut chart (circumference ~ 251.2 for r=40)
        const C = 251.2;
        const posDash = (posPercent / 100) * C;
        const onlineDash = (onlinePercent / 100) * C;

        return {
            pos: { count: posCount, total: posTotal, avg: posAvg },
            fb: { count: fbCount, total: fbTotal, avg: fbCount ? fbTotal/fbCount : 0 },
            tg: { count: tgCount, total: tgTotal, avg: tgCount ? tgTotal/tgCount : 0 },
            app: { count: appCount, total: appTotal, avg: appCount ? appTotal/appCount : 0 },
            online: { count: onlineCount, total: onlineTotal, percent: onlinePercent, dash: onlineDash },
            grand: { count: totalCount, total: totalRevenue, avg: totalAvg },
            chart: { posDash }
        };
    }, [orders, onlineOrders]);

    return (
        <div className="flex-1 px-4 sm:px-8 py-8 w-full max-w-[1400px] mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-sm font-medium">
                        <span>Reports</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="text-primary">Sales Channels</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight font-khmer">
                        របាយការណ៍ប្រភពលក់
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-base">
                        Sales Channel Report: Comparison between Walk-in POS and Online Sales
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                    {/* Date Range Picker Mockup */}
                    <div className="flex items-center bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg h-10 px-3 gap-2 shadow-sm w-full md:w-auto cursor-pointer hover:border-primary transition-colors group">
                        <span className="material-symbols-outlined text-neutral-400 group-hover:text-primary">calendar_today</span>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">01 Oct 2023 - 31 Oct 2023</span>
                        <span className="material-symbols-outlined text-neutral-400 text-[18px] ml-auto">expand_more</span>
                    </div>
                    <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm font-bold shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Chart Section */}
                <div className="col-span-1 lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 flex-1 flex flex-col justify-between min-h-[420px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Sales Distribution</h3>
                            <button className="text-neutral-400 hover:text-primary">
                                <span className="material-symbols-outlined">more_horiz</span>
                            </button>
                        </div>
                        <div className="relative flex-1 flex items-center justify-center py-6">
                            {/* SVG Donut Chart */}
                            <div className="relative w-64 h-64">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    {/* Background Circle */}
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" className="dark:stroke-neutral-700"></circle>
                                    {/* Segment 1: POS (Blue) */}
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#137fec" strokeWidth="12"
                                        strokeDasharray={`${stats.chart.posDash} 251.2`}
                                        strokeDashoffset="0"
                                        className="transition-all duration-1000 ease-out"
                                    ></circle>
                                    {/* Segment 2: Online (Green) */}
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12"
                                        strokeDasharray={`${stats.online.dash} 251.2`}
                                        strokeDashoffset={`-${stats.chart.posDash}`}
                                        className="transition-all duration-1000 ease-out"
                                    ></circle>
                                    {/* Segment 3: Other (Orange) Mock small filler if needed, skipping for now */}
                                </svg>
                                {/* Center Text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Total Revenue</span>
                                    <span className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">${stats.grand.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        {/* Legend */}
                        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                            <div className="flex flex-col items-center text-center">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <div className="size-2.5 rounded-full bg-primary"></div>
                                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">POS</span>
                                </div>
                                <span className="text-sm font-bold text-neutral-900 dark:text-white">{Math.round((stats.pos.total / stats.grand.total) * 100) || 0}%</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <div className="size-2.5 rounded-full bg-[#10b981]"></div>
                                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">ONLINE</span>
                                </div>
                                <span className="text-sm font-bold text-neutral-900 dark:text-white">{Math.round(stats.online.percent) || 0}%</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <div className="size-2.5 rounded-full bg-[#f59e0b]"></div>
                                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">OTHER</span>
                                </div>
                                <span className="text-sm font-bold text-neutral-900 dark:text-white">0%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table Section */}
                <div className="col-span-1 lg:col-span-7 flex flex-col gap-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col gap-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded text-primary">
                                    <span className="material-symbols-outlined text-[20px]">storefront</span>
                                </div>
                                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Walk-in POS</span>
                            </div>
                            <span className="text-2xl font-bold text-neutral-900 dark:text-white">${stats.pos.total.toLocaleString()}</span>
                            <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                                <span className="ml-1">+12.5%</span>
                                <span className="text-neutral-400 ml-1 font-normal">vs last month</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col gap-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-green-50 dark:bg-green-900/30 rounded text-emerald-600">
                                    <span className="material-symbols-outlined text-[20px]">public</span>
                                </div>
                                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Online Sales</span>
                            </div>
                            <span className="text-2xl font-bold text-neutral-900 dark:text-white">${stats.online.total.toLocaleString()}</span>
                            <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                                <span className="ml-1">+5.2%</span>
                                <span className="text-neutral-400 ml-1 font-normal">vs last month</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col gap-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-orange-50 dark:bg-orange-900/30 rounded text-orange-500">
                                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                </div>
                                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Orders</span>
                            </div>
                            <span className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.grand.count}</span>
                            <div className="flex items-center text-xs font-medium text-rose-500">
                                <span className="material-symbols-outlined text-[16px]">trending_down</span>
                                <span className="ml-1">-2.1%</span>
                                <span className="text-neutral-400 ml-1 font-normal">vs last month</span>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Table */}
                    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Channel Breakdown</h3>
                            <button className="text-primary text-sm font-semibold hover:underline">View Full Report</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                            Source (ប្រភព)
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-right">
                                            Order Count (ចំនួនកុម្ម៉ង់)
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-right">
                                            Total Amount (សរុបទឹកប្រាក់)
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-right">
                                            Avg. Order
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                    {/* POS */}
                                    <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-primary">
                                                    <span className="material-symbols-outlined">storefront</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">Walk-in POS</span>
                                                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-display">លក់ផ្ទាល់</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{stats.pos.count}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-bold text-neutral-900 dark:text-white">${stats.pos.total.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm text-neutral-500 dark:text-neutral-400">${stats.pos.avg.toFixed(2)}</span>
                                        </td>
                                    </tr>
                                    {/* Facebook */}
                                    <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2]">
                                                    <span className="material-symbols-outlined">chat_bubble</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">Facebook</span>
                                                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-display">ហ្វេសប៊ុក</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{stats.fb.count}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-bold text-neutral-900 dark:text-white">${stats.fb.total.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm text-neutral-500 dark:text-neutral-400">${stats.fb.avg.toFixed(2)}</span>
                                        </td>
                                    </tr>
                                    {/* Telegram */}
                                    <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-[#24A1DE]/10 flex items-center justify-center text-[#24A1DE]">
                                                    <span className="material-symbols-outlined">send</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">Telegram</span>
                                                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-display">តេឡេក្រាម</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{stats.tg.count}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-bold text-neutral-900 dark:text-white">${stats.tg.total.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm text-neutral-500 dark:text-neutral-400">${stats.tg.avg.toFixed(2)}</span>
                                        </td>
                                    </tr>
                                    {/* Other Apps */}
                                    <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-[#D70F64]/10 flex items-center justify-center text-[#D70F64]">
                                                    <span className="material-symbols-outlined">restaurant</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">Food Delivery Apps</span>
                                                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-display">ដឹកជញ្ជូន</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{stats.app.count}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-bold text-neutral-900 dark:text-white">${stats.app.total.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm text-neutral-500 dark:text-neutral-400">${stats.app.avg.toFixed(2)}</span>
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot className="bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-700">
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-neutral-900 dark:text-white">Total (សរុប)</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-bold text-neutral-900 dark:text-white">{stats.grand.count}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-bold text-primary">${stats.grand.total.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-bold text-neutral-900 dark:text-white">${stats.grand.avg.toFixed(2)}</span>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 flex justify-center">
                <p className="text-neutral-400 text-xs text-center">
                    Data last updated: {new Date().toLocaleDateString()} • QuickBill KH Analytics
                </p>
            </div>
        </div>
    );
};

export default ChannelReport;