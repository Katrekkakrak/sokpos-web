import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';

const SalesDashboard: React.FC = () => {
    const { orders, onlineOrders, products } = useData();

    // --- Analytics Logic ---
    const stats = useMemo(() => {
        const allOrders = [...orders, ...onlineOrders];
        const totalRevenue = allOrders.reduce((acc, order) => acc + order.total, 0);
        const totalOrders = allOrders.length;
        
        // Calculate Profit: Revenue - Cost
        // For each item in each order, find its cost. If cost not found, assume 70% margin for demo.
        const totalCost = allOrders.reduce((acc, order) => {
            const orderCost = order.items.reduce((iAcc, item) => {
                const product = products.find(p => p.id === item.id);
                const cost = product?.cost || (item.price * 0.5); // Fallback cost
                return iAcc + (cost * item.quantity);
            }, 0);
            return acc + orderCost;
        }, 0);
        
        const totalProfit = totalRevenue - totalCost;

        // Recent Transactions (Combined & Sorted)
        const recent = allOrders
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

        return { totalRevenue, totalOrders, totalProfit, recent };
    }, [orders, onlineOrders, products]);

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div className="flex flex-col gap-1">
                    <h1 className="khmer-text text-slate-900 dark:text-white text-2xl md:text-3xl font-bold">ផ្ទាំងគ្រប់គ្រងការលក់</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">Sales Dashboard & Analytics Overview</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select className="khmer-text appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2.5 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm cursor-pointer min-w-[160px]">
                            <option>ថ្ងៃនេះ (Today)</option>
                            <option selected>សប្តាហ៍នេះ (This Week)</option>
                            <option>ខែនេះ (This Month)</option>
                            <option>ឆ្នាំនេះ (This Year)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </div>
                    </div>
                    <button className="bg-primary hover:bg-primary/90 text-white p-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined">download</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                {/* Total Revenue */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-primary">
                            <span className="material-symbols-outlined filled">payments</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-1 rounded text-xs font-bold">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            15%
                        </span>
                    </div>
                    <div>
                        <p className="khmer-text text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">ចំណូលសរុប (Revenue)</p>
                        <h3 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">${stats.totalRevenue.toFixed(2)}</h3>
                    </div>
                </div>
                {/* Profit */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                            <span className="material-symbols-outlined filled">account_balance_wallet</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-1 rounded text-xs font-bold">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            12%
                        </span>
                    </div>
                    <div>
                        <p className="khmer-text text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">ប្រាក់ចំណេញ (Profit)</p>
                        <h3 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">${stats.totalProfit.toFixed(2)}</h3>
                    </div>
                </div>
                {/* Total Orders */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                            <span className="material-symbols-outlined filled">shopping_cart</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-1 rounded text-xs font-bold">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            5%
                        </span>
                    </div>
                    <div>
                        <p className="khmer-text text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">ការកុម្ម៉ង់សរុប (Orders)</p>
                        <h3 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">{stats.totalOrders}</h3>
                    </div>
                </div>
                {/* New Customers */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-pink-50 dark:bg-pink-900/30 rounded-lg text-pink-600 dark:text-pink-400">
                            <span className="material-symbols-outlined filled">group_add</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-1 rounded text-xs font-bold">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            2%
                        </span>
                    </div>
                    <div>
                        <p className="khmer-text text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">អតិថិជនថ្មី (New Users)</p>
                        <h3 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">34</h3>
                    </div>
                </div>
            </div>

            {/* Main Chart Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h3 className="khmer-text text-lg font-bold text-slate-900 dark:text-white">ចំណូលប្រចាំខែ (Monthly Revenue)</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">ទិន្នន័យចំណូលសរុបប្រចាំថ្ងៃសម្រាប់ខែនេះ</p>
                    </div>
                    <button className="text-sm text-primary font-medium hover:text-primary/80 transition-colors flex items-center gap-1">
                        មើលរបាយការណ៍លម្អិត
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                </div>
                {/* Chart Visualization Placeholder */}
                <div className="relative h-[320px] w-full bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 flex flex-col justify-end p-4 pb-0 overflow-hidden">
                    {/* Grid Lines (Background) */}
                    <div className="absolute inset-0 flex flex-col justify-between p-8 pointer-events-none z-0">
                        <div className="w-full h-px bg-slate-200 dark:bg-slate-700"></div>
                        <div className="w-full h-px bg-slate-200 dark:bg-slate-700"></div>
                        <div className="w-full h-px bg-slate-200 dark:bg-slate-700"></div>
                        <div className="w-full h-px bg-slate-200 dark:bg-slate-700"></div>
                        <div className="w-full h-px bg-slate-200 dark:bg-slate-700"></div>
                    </div>
                    {/* Y-Axis Labels */}
                    <div className="absolute left-2 top-8 bottom-8 flex flex-col justify-between text-xs text-slate-400 font-medium z-10 h-[calc(100%-64px)]">
                        <span>$10k</span>
                        <span>$7.5k</span>
                        <span>$5.0k</span>
                        <span>$2.5k</span>
                        <span>$0</span>
                    </div>
                    {/* Chart Bars / Data Visualization */}
                    <div className="relative z-10 flex items-end justify-between h-[calc(100%-40px)] ml-10 mr-2 gap-2 sm:gap-4">
                        {/* Bar 1 */}
                        <div className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm h-[30%] relative group transition-all duration-300">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-lg">$3,200</div>
                            <div className="w-full h-full bg-primary rounded-t-sm opacity-60"></div>
                        </div>
                        {/* Bar 2 */}
                        <div className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm h-[45%] relative group transition-all duration-300">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-lg">$4,500</div>
                            <div className="w-full h-full bg-primary rounded-t-sm opacity-70"></div>
                        </div>
                        {/* Bar 3 */}
                        <div className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm h-[25%] relative group transition-all duration-300">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-lg">$2,500</div>
                            <div className="w-full h-full bg-primary rounded-t-sm opacity-50"></div>
                        </div>
                        {/* Bar 4 (High) */}
                        <div className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm h-[85%] relative group transition-all duration-300">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-lg">$8,500</div>
                            <div className="w-full h-full bg-primary rounded-t-sm opacity-100 shadow-[0_0_15px_rgba(19,127,236,0.4)]"></div>
                        </div>
                        {/* Bar 5 */}
                        <div className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm h-[55%] relative group transition-all duration-300">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-lg">$5,500</div>
                            <div className="w-full h-full bg-primary rounded-t-sm opacity-80"></div>
                        </div>
                        {/* Bar 6 */}
                        <div className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm h-[40%] relative group transition-all duration-300">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-lg">$4,000</div>
                            <div className="w-full h-full bg-primary rounded-t-sm opacity-65"></div>
                        </div>
                        {/* Bar 7 */}
                        <div className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm h-[60%] relative group transition-all duration-300">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-lg">$6,000</div>
                            <div className="w-full h-full bg-primary rounded-t-sm opacity-85"></div>
                        </div>
                        {/* Bar 8 */}
                        <div className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm h-[35%] relative group transition-all duration-300">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-lg">$3,500</div>
                            <div className="w-full h-full bg-primary rounded-t-sm opacity-60"></div>
                        </div>
                    </div>
                    {/* X-Axis Labels */}
                    <div className="h-8 mt-2 ml-10 mr-2 flex justify-between text-xs text-slate-400 font-medium z-10">
                        <span>01 Nov</span>
                        <span>05 Nov</span>
                        <span>10 Nov</span>
                        <span>15 Nov</span>
                        <span>20 Nov</span>
                        <span>25 Nov</span>
                        <span>30 Nov</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Table Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="khmer-text text-lg font-bold text-slate-900 dark:text-white">ប្រតិបត្តិការថ្មីៗ (Recent Transactions)</h3>
                        <button className="text-sm text-slate-500 hover:text-primary">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">ID</th>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3 rounded-r-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {stats.recent.map((order, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{order.id}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                            {'customer' in order ? (order as any).customer.name : 'Walk-in Customer'}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{new Date(order.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">${order.total.toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                order.status === 'Paid' || order.status === 'Completed' 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {stats.recent.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No transactions yet</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-primary text-white rounded-xl shadow-lg p-6 flex flex-col justify-between overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-white text-2xl">diamond</span>
                        </div>
                        <h3 className="khmer-text text-xl font-bold mb-2">Upgrade to Pro</h3>
                        <p className="text-white/80 text-sm mb-6 leading-relaxed">Unlock advanced analytics, inventory forecasting, and unlimited user accounts.</p>
                    </div>
                    <button className="relative z-10 w-full py-2.5 bg-white text-primary font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                        Upgrade Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;