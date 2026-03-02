import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Package, Truck, CheckCircle, ShoppingBag, TrendingUp, AlertCircle, DollarSign, User } from 'lucide-react';

const StaffDashboard: React.FC = () => {
    const { onlineOrders, user } = useData();

    const isLead = user?.role === 'online_sales_lead';

    const stats = useMemo(() => {
        const today = new Date();
        const todayStr = today.toDateString();

        // Filter orders for today
        const todaysOrders = onlineOrders.filter(o => new Date(o.date).toDateString() === todayStr);
        
        // Pending Packing (New or Packing)
        const pendingPacking = onlineOrders.filter(o => o.status === 'New' || o.status === 'Packing');
        
        // Ready to Ship / Shipping (In Transit)
        const shipping = onlineOrders.filter(o => o.status === 'Shipping');

        // Completed Today
        const completedToday = todaysOrders.filter(o => o.status === 'Completed');

        // Team Metrics (Calculated from all available orders in context)
        const teamRevenueToday = todaysOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const teamPendingCount = pendingPacking.length; // Action Center

        return {
            todayCount: todaysOrders.length,
            pendingPackingCount: pendingPacking.length,
            shippingCount: shipping.length,
            completedTodayCount: completedToday.length,
            teamRevenueToday,
            teamPendingCount,
            // Just show recent orders as "activities" for now since we don't have per-user activity logs on orders yet
            recentActivity: [...onlineOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
        };
    }, [onlineOrders]);

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light dark:bg-background-dark font-display">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-khmer">
                        ផ្ទាំងការងារបុគ្គលិក (Staff Dashboard)
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Welcome back, {user?.name || 'Staff'}. {isLead ? 'You have Lead access.' : 'Here is your daily overview.'}
                    </p>
                </div>

                {/* Lead / Team Overview Section */}
                {isLead && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 font-khmer">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            ទិន្នន័យក្រុម (Team Overview)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Team Revenue */}
                            <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-800 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <DollarSign size={48} />
                                </div>
                                <p className="text-indigo-600 dark:text-indigo-300 text-sm font-bold uppercase tracking-wider font-khmer mb-1">ចំណូលសរុបថ្ងៃនេះ</p>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white">${stats.teamRevenueToday.toFixed(2)}</h3>
                            </div>

                            {/* Team Orders */}
                            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">ការកុម្ម៉ង់សរុប (Team Orders)</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.todayCount}</h3>
                                    <span className="text-xs text-slate-400">Today</span>
                                </div>
                            </div>

                            {/* Action Center */}
                            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-l-orange-500 border-y border-r border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-orange-600 dark:text-orange-400 text-sm font-bold uppercase tracking-wider font-khmer mb-1">សកម្មភាពត្រូវការដោះស្រាយ</p>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.teamPendingCount}</h3>
                                        <p className="text-xs text-slate-500 mt-1">Pending Orders</p>
                                    </div>
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                                        <AlertCircle size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Personal Metrics */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 font-khmer">
                        <User className="w-5 h-5 text-slate-500" />
                        ការងាររបស់ខ្ញុំ (My Overview)
                    </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Orders Today */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">Order ថ្ងៃនេះ</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.todayCount}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <ShoppingBag size={24} />
                        </div>
                    </div>

                    {/* Pending Packing */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">ត្រូវវេចខ្ចប់ (Pending)</p>
                            <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pendingPackingCount}</h3>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                            <Package size={24} />
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">រង់ចាំផ្ញើចេញ (Ready)</p>
                            <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.shippingCount}</h3>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Truck size={24} />
                        </div>
                    </div>

                    {/* Completed Today */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">ជោគជ័យថ្ងៃនេះ</p>
                            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedTodayCount}</h3>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                            <CheckCircle size={24} />
                        </div>
                    </div>
                </div>
                </div>

                {/* Recent Activity List */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                        <h3 className="font-bold text-slate-900 dark:text-white font-khmer">សកម្មភាពថ្មីៗ (My Recent Activities)</h3>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {stats.recentActivity.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                No recent activity found.
                            </div>
                        ) : (
                            stats.recentActivity.map(order => (
                                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs
                                            ${order.status === 'New' ? 'bg-blue-500' : 
                                              order.status === 'Packing' ? 'bg-orange-500' : 
                                              order.status === 'Shipping' ? 'bg-indigo-500' : 
                                              order.status === 'Completed' ? 'bg-green-500' : 'bg-slate-400'}
                                        `}>
                                            {order.status.substring(0, 1)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white font-khmer">
                                                {order.customer?.name || 'Unknown Customer'}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Order #{order.id} • {new Date(order.date).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${order.status === 'New' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
                                              order.status === 'Packing' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : 
                                              order.status === 'Shipping' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' : 
                                              order.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                                              'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'}
                                        `}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
