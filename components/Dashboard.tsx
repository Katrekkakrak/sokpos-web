import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
    const { 
        user, setCurrentView, orders, onlineOrders, leads, products,
        customers 
    } = useData();
    const [revenueView, setRevenueView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const { role, loading: authLoading } = useAuth();
    
    // Store Link Logic
    const [copied, setCopied] = useState(false);
    const shopId = user?.name || 'shop';
    const storeLink = `${window.location.origin}/store/${encodeURIComponent(shopId)}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(storeLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    // --- Dynamic Analytics ---
    const stats = useMemo(() => {
        // 1. Daily Sales (Orders from today)
        const todayStr = new Date().toDateString();
        const todaysOrders = orders.filter(o => new Date(o.date).toDateString() === todayStr);
        const dailyTotal = todaysOrders.reduce((acc, order) => acc + order.total, 0);

        // 2. New Leads (For demo, we count total leads in the 'New Lead' status)
        const newLeadsCount = leads.filter(l => l.status === 'New Lead').length;

        // 3. Online Orders (Pending or Active)
        const pendingOnline = onlineOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;

        // 4. Low Stock Alerts (Stock <= 10)
        const lowStockCount = products.filter(p => (p.stock || 0) <= 10).length;

        return { dailyTotal, newLeadsCount, pendingOnline, lowStockCount };
    }, [orders, leads, onlineOrders, products]);

    // --- Calculations for Enhanced Dashboard ---
    const branchAnalytics = useMemo(() => {
        const branchOrders = orders;
        
        // Metric A: Today's revenue vs Yesterday's
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const todayStr = today.toDateString();
        const yesterdayStr = yesterday.toDateString();
        
        const todayRevenue = branchOrders.filter(o => new Date(o.date).toDateString() === todayStr).reduce((sum, o) => sum + o.total, 0);
        const yesterdayRevenue = branchOrders.filter(o => new Date(o.date).toDateString() === yesterdayStr).reduce((sum, o) => sum + o.total, 0);
        const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100) : 0;
        
        // Metric B: Cash vs KHQR
        const cashTotal = branchOrders.filter(o => o.method === 'Cash').reduce((sum, o) => sum + o.total, 0);
        const khqrTotal = branchOrders.filter(o => o.method === 'KHQR').reduce((sum, o) => sum + o.total, 0);
        
        // Metric C: Sales Source (Walk-in vs Facebook vs Telegram)
        const walkInOrders = branchOrders.filter(o => !o.customer?.name || o.customer?.name === 'Walk-in').length;
        const facebookOrders = onlineOrders.filter(o => o.source === 'Facebook').length;
        const telegramOrders = onlineOrders.filter(o => o.source === 'Telegram').length;
        
        // Metric D: Urgent Tasks (Orders that are New, Pending, or Packing)
        const urgentCount = onlineOrders.filter(o => (o.status === 'New' || o.status === 'Pending' || o.status === 'Packing')).length;
        
        // Metric E: Overdue Debt
        const debtCustomers = customers.filter(c => c.totalDebt > 0);
        const totalDebt = debtCustomers.reduce((sum, c) => sum + c.totalDebt, 0);
        const debtCount = debtCustomers.length;
        const topDebtors = [...debtCustomers].sort((a, b) => b.totalDebt - a.totalDebt).slice(0, 2);
        
        // Metric F: Top 5 Selling Products
        const productSales: { [key: number]: { name: string; qty: number; revenue: number } } = {};
        branchOrders.forEach(order => {
            order.items?.forEach(item => {
                if (!productSales[item.id]) {
                    productSales[item.id] = { name: item.name, qty: 0, revenue: 0 };
                }
                productSales[item.id].qty += (Number(item.quantity)||0);
                productSales[item.id].revenue += (Number(item.quantity)||0) * (Number(item.selectedUnitPrice) || Number(item.price) || 0);
            });
        });
        const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);
        
        return {
            todayRevenue,
            yesterdayRevenue,
            revenueChange,
            cashTotal,
            khqrTotal,
            walkInOrders,
            facebookOrders,
            telegramOrders,
            urgentCount,
            totalDebt,
            debtCount,
            topDebtors,
            topProducts
        };
    }, [orders, onlineOrders, customers]);

    // Recent Activity (Merge orders and take last 5)
    const recentActivity = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    // Latest Invoices (Last 5)
    const latestInvoices = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    // --- Dynamic Revenue Chart Data ---
    const chartData = useMemo(() => {
        const today = new Date();
        const currentData: { label: string; value: number }[] = [];
        
        if (revenueView === 'daily') {
            const labels = [
                '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
                '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
            ];
            const buckets = new Array(24).fill(0);
            
            orders.forEach(order => {
                const orderDate = new Date(order.date);
                if (orderDate.toDateString() === today.toDateString()) {
                    const hour = orderDate.getHours();
                    if (hour >= 0 && hour < 24) {
                        buckets[hour] += order.total;
                    }
                }
            });
            
            buckets.forEach((val, idx) => {
                currentData.push({ label: labels[idx], value: val });
            });

        } else if (revenueView === 'weekly') {
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const dayStr = d.toDateString();
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                
                const dailySum = orders
                    .filter(o => new Date(o.date).toDateString() === dayStr)
                    .reduce((sum, o) => sum + o.total, 0);
                
                currentData.push({ label: dayName, value: dailySum });
            }

        } else if (revenueView === 'monthly') {
            const labels = ['1-5', '6-10', '11-15', '16-20', '21-25', '26+'];
            const buckets = [0, 0, 0, 0, 0, 0];
            
            orders.forEach(order => {
                const orderDate = new Date(order.date);
                if (orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear()) {
                    const day = orderDate.getDate();
                    let bucketIndex = Math.floor((day - 1) / 5);
                    if (bucketIndex > 5) bucketIndex = 5;
                    buckets[bucketIndex] += order.total;
                }
            });

            buckets.forEach((val, idx) => {
                currentData.push({ label: labels[idx], value: val });
            });
        }

        const maxVal = Math.max(...currentData.map(d => d.value), 1);
        return { data: currentData, maxVal };
    }, [orders, revenueView]);

    if (authLoading) {
        return <div className="flex h-screen items-center justify-center"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
    }

    if (role === 'customer') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
                <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg max-w-md">
                    <span className="material-icons-outlined text-6xl text-red-500 mb-4">gpp_bad</span>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Unauthorized Access</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        This area is for shop administrators only. Please visit the store to place orders.
                    </p>
                    <a href="/store" className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors">
                        Go to Store
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-6 lg:p-8 h-full">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Digital Store Link Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-1 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 md:p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                            <div className="flex-1 w-full">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-khmer mb-2 flex items-center gap-2">
                                    <span className="text-2xl">🌐</span> លីងហាងឌីជីថលរបស់អ្នក (Your Digital Store Link)
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                                    Share this link with your customers to let them order online.
                                </p>
                                
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 relative">
                                        {/* 🛠️ FIX 1: ប្តូរ text-sm ទៅ text-base sm:text-sm ការពារ iPhone Zoom ពេលចុច */}
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={storeLink} 
                                            className="w-full bg-slate-100 dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-medium text-base sm:text-sm rounded-lg border-none py-3 pl-4 pr-10 focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <span className="material-icons-outlined text-lg">link</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button 
                                            onClick={handleCopyLink}
                                            className={`flex-1 sm:flex-none px-5 py-3 sm:py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${copied ? 'bg-green-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                        >
                                            <span className="material-icons-outlined text-lg">
                                                {copied ? 'check' : 'content_copy'}
                                            </span>
                                            {copied ? 'Copied! ✅' : 'Copy Link'}
                                        </button>
                                        <a 
                                            href={storeLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 sm:flex-none px-5 py-3 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-500/30"
                                        >
                                            <span className="material-icons-outlined text-lg">open_in_new</span>
                                            Visit Store
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Welcome Message */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-khmer">សួស្តី, បង {user?.name.split(' ')[0]} 👋</h2>
                        <p className="text-sm text-slate-500 font-khmer mt-1">នេះគឺជាទិន្នន័យសង្ខេបសម្រាប់អាជីវកម្មរបស់អ្នកថ្ងៃនេះ។</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button 
                            onClick={() => setCurrentView('pos')}
                            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-3 sm:py-2.5 rounded-lg text-sm font-medium transition-all shadow-md shadow-primary/30 active:scale-95 group w-full sm:w-auto"
                        >
                            <span className="material-icons-outlined text-[20px] group-hover:rotate-90 transition-transform">add</span>
                            <span className="font-khmer font-bold">វិក្កយបត្រថ្មី</span>
                        </button>
                    </div>
                </div>

                {/* Financial Summary KPI Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-icons-outlined text-6xl text-emerald-500">trending_up</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-slate-500 font-khmer mb-1">សរុបលក់ថ្មីៗ (Total Revenue)</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">${(Number(branchAnalytics.todayRevenue)||0).toFixed(2)}</h3>
                            <div className={`flex items-center gap-1 mt-2 text-xs font-medium px-2 py-0.5 rounded-full w-fit ${branchAnalytics.revenueChange >= 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'}`}>
                                <span className="material-icons-outlined text-[14px]">{branchAnalytics.revenueChange >= 0 ? 'trending_up' : 'trending_down'}</span>
                                <span>{(Number(branchAnalytics.revenueChange)||0).toFixed(1)}% vs yesterday</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-icons-outlined text-6xl text-blue-500">payments</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-slate-500 font-khmer mb-1">ប្រាក់សុទ្ធ (Cash)</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">${(Number(branchAnalytics.cashTotal)||0).toFixed(2)}</h3>
                            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full w-fit">
                                <span className="material-icons-outlined text-[14px]">account_balance_wallet</span>
                                <span>{branchAnalytics.walkInOrders} sales</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-icons-outlined text-6xl text-purple-500">qr_code_2</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-slate-500 font-khmer mb-1">KHQR ស្កេន (KHQR)</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">${(Number(branchAnalytics.khqrTotal)||0).toFixed(2)}</h3>
                            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full w-fit">
                                <span className="material-icons-outlined text-[14px]">qr_code</span>
                                <span>Mobile payments</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className={`bg-surface-light dark:bg-surface-dark p-5 rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group ${branchAnalytics.totalDebt > 0 ? 'border-orange-200 dark:border-orange-900/50' : 'border-slate-200 dark:border-slate-700'}`}>
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className={`material-icons-outlined text-6xl ${branchAnalytics.totalDebt > 0 ? 'text-orange-500' : 'text-slate-400'}`}>receipt_long</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-slate-500 font-khmer mb-1">ជំពាក់សរុប (Total Debt)</p>
                            <h3 className={`text-2xl font-bold ${branchAnalytics.totalDebt > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-900 dark:text-white'}`}>${(Number(branchAnalytics.totalDebt)||0).toFixed(2)}</h3>
                            <div className={`flex items-center gap-1 mt-2 text-xs font-medium px-2 py-0.5 rounded-full w-fit ${branchAnalytics.debtCount > 0 ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' : 'text-slate-500 bg-slate-100 dark:bg-slate-800'}`}>
                                <span className="material-icons-outlined text-[14px]">group</span>
                                <span className="font-khmer">{branchAnalytics.debtCount} customers</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Existing KPI Cards (4 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div onClick={() => setCurrentView('receipt-history')} className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-icons-outlined text-6xl text-primary">payments</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-slate-500 font-khmer mb-1">ការលក់ថ្ងៃនេះ (Daily Sales)</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">${(Number(stats.dailyTotal)||0).toFixed(2)}</h3>
                            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full w-fit">
                                <span className="material-icons-outlined text-[14px]">trending_up</span>
                                <span>Today</span>
                            </div>
                        </div>
                    </div>
                    
                    <div onClick={() => setCurrentView('crm-directory')} className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-icons-outlined text-6xl text-purple-500">group_add</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-slate-500 font-khmer mb-1">អតិថិជនថ្មី (New Leads)</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.newLeadsCount}</h3>
                            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full w-fit">
                                <span>Total Active Leads</span>
                            </div>
                        </div>
                    </div>

                    <div onClick={() => setCurrentView('online-orders')} className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-icons-outlined text-6xl text-blue-500">shopping_cart</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-slate-500 font-khmer mb-1">ការកុម្ម៉ង់អនឡាញ (Active)</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendingOnline}</h3>
                                <span className="text-xs text-slate-400">Pending</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`flex h-2 w-2 rounded-full ${stats.pendingOnline > 0 ? 'bg-orange-400 animate-pulse' : 'bg-slate-300'}`}></span>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 font-khmer">
                                    {stats.pendingOnline > 0 ? 'ត្រូវការរៀបចំ (Action Needed)' : 'រួចរាល់ទាំងអស់'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div onClick={() => setCurrentView('inventory-list')} className={`bg-surface-light dark:bg-surface-dark p-5 rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group ${stats.lowStockCount > 0 ? 'border-red-200 dark:border-red-900/50' : 'border-slate-200 dark:border-slate-700'}`}>
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className={`material-icons-outlined text-6xl ${stats.lowStockCount > 0 ? 'text-red-500' : 'text-slate-400'}`}>warning</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-slate-500 font-khmer mb-1">ការជូនដំណឹងអស់ស្តុក (Alerts)</p>
                            <h3 className={`text-2xl font-bold ${stats.lowStockCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{stats.lowStockCount} Items</h3>
                            <div className={`flex items-center gap-1 mt-2 text-xs font-medium px-2 py-0.5 rounded-full w-fit ${stats.lowStockCount > 0 ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-slate-500 bg-slate-100'}`}>
                                <span className="material-icons-outlined text-[14px]">inventory_2</span>
                                <span className="font-khmer">{stats.lowStockCount > 0 ? 'ជិតអស់ស្តុក' : 'ស្តុកមានគ្រប់គ្រាន់'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Section Grid: Chart + Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Bar Chart (Left) */}
                    <div className="lg:col-span-1 bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col overflow-x-auto">
                        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-khmer">ចំណូល (Revenue)</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    {revenueView === 'daily' ? 'Hourly breakdown' : revenueView === 'weekly' ? 'Last 7 days' : 'This month'}
                                </p>
                            </div>
                            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-full sm:w-auto">
                                <button 
                                    onClick={() => setRevenueView('daily')}
                                    className={`flex-1 sm:flex-none px-2 py-1 text-[10px] font-bold rounded-md transition-all ${revenueView === 'daily' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    Today
                                </button>
                                <button 
                                    onClick={() => setRevenueView('weekly')}
                                    className={`flex-1 sm:flex-none px-2 py-1 text-[10px] font-bold rounded-md transition-all ${revenueView === 'weekly' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    Week
                                </button>
                                <button 
                                    onClick={() => setRevenueView('monthly')}
                                    className={`flex-1 sm:flex-none px-2 py-1 text-[10px] font-bold rounded-md transition-all ${revenueView === 'monthly' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    Month
                                </button>
                            </div>
                        </div>
                        
                        {/* Dynamic Bar Chart */}
                        <div className="flex-1 min-h-[250px] w-full relative overflow-x-auto custom-scroll pb-2 border-b border-l border-slate-100 dark:border-slate-700">
                            <div className={`flex items-end justify-between h-full pt-8 pb-6 px-1 ${revenueView === 'daily' ? 'min-w-[800px] gap-1' : 'min-w-[400px] w-full gap-2'}`}>
                                {chartData.data.map((item, idx) => {
                                    const height = (item.value / chartData.maxVal) * 100;
                                    return (
                                        <div key={idx} className="relative flex flex-col items-center flex-1 group h-full justify-end z-10 cursor-pointer">
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded mb-1 transition-opacity whitespace-nowrap z-20">
                                                ${(Number(item.value)||0).toFixed(2)}
                                            </div>
                                            <div 
                                                className="w-full max-w-[20px] bg-primary/20 group-hover:bg-primary/40 rounded-t-sm transition-all" 
                                                style={{ height: `${height}%` }}
                                            ></div>
                                            <span className="text-[10px] text-slate-400 mt-2 font-medium whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                                                {item.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Sales Source Pie Chart (Center) */}
                    <div className="lg:col-span-1 bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-khmer">ប្រភពលក់ (Sales Source)</h3>
                            <p className="text-xs text-slate-500 mt-1">Breakdown by channel</p>
                        </div>
                        
                        {/* Pie/Donut Chart */}
                        <div className="flex flex-col items-center justify-center flex-1">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 relative flex items-center justify-center shrink-0">
                                <div className="w-28 h-28 rounded-full bg-surface-light dark:bg-surface-dark flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-xs text-slate-500">Total</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{branchAnalytics.walkInOrders + branchAnalytics.facebookOrders + branchAnalytics.telegramOrders}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 space-y-2 w-full">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-emerald-400 shrink-0"></span>
                                        <span className="text-slate-600 dark:text-slate-300 font-khmer">ដើរទិញ</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">{branchAnalytics.walkInOrders}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-blue-400 shrink-0"></span>
                                        <span className="text-slate-600 dark:text-slate-300">Facebook</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">{branchAnalytics.facebookOrders}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-purple-400 shrink-0"></span>
                                        <span className="text-slate-600 dark:text-slate-300">Telegram</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">{branchAnalytics.telegramOrders}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar Panel: Recent Activity */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden h-full max-h-[460px]">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-khmer">សកម្មភាពថ្មីៗ (Recent Activity)</h3>
                            <button onClick={() => setCurrentView('receipt-history')} className="text-xs text-primary font-medium hover:underline">View All</button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scroll p-0">
                            {recentActivity.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">No recent activity.</div>
                            ) : (
                                recentActivity.map((order) => (
                                    <div key={order.id} className="flex gap-3 p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                                <span className="material-icons-outlined text-[16px]">receipt</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 font-khmer truncate">
                                                <span className="font-bold">New Sale</span> completed
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5 font-mono">${(Number(order.total)||0).toFixed(2)} • {order.id}</p>
                                        </div>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                ))
                            )}
                            {/* Static Inventory Alert Mock */}
                            {stats.lowStockCount > 0 && (
                                <div onClick={() => setCurrentView('inventory-list')} className="flex gap-3 p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors bg-red-50/30 dark:bg-red-900/10 cursor-pointer">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                                            <span className="material-icons-outlined text-[16px]">warning</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 font-khmer truncate">Inventory Alert</p>
                                        <p className="text-xs text-red-500 mt-0.5 font-khmer">{stats.lowStockCount} items low in stock</p>
                                    </div>
                                    <span className="text-[10px] text-slate-400 whitespace-nowrap">Now</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Alert Boxes Row (3 Columns) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Alert Box 1: Urgent Packing */}
                    <div className={`p-5 rounded-xl border-2 ${branchAnalytics.urgentCount > 0 ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                        <div className="flex items-start gap-3">
                            <div className={`p-3 rounded-lg shrink-0 ${branchAnalytics.urgentCount > 0 ? 'bg-orange-200 dark:bg-orange-900/30' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                <span className="material-icons-outlined text-xl text-orange-600 dark:text-orange-400">local_shipping</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-slate-900 dark:text-white font-khmer">ត្រូវរៀបចំ</h4>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{branchAnalytics.urgentCount}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-khmer">ការកុម្ម៉ង់ដែលបង់ពិការ</p>
                            </div>
                        </div>
                    </div>

                    {/* Alert Box 2: Low Stock Warning */}
                    <div className={`p-5 rounded-xl border-2 ${stats.lowStockCount > 0 ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                        <div className="flex items-start gap-3">
                            <div className={`p-3 rounded-lg shrink-0 ${stats.lowStockCount > 0 ? 'bg-red-200 dark:bg-red-900/30' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                <span className="material-icons-outlined text-xl text-red-600 dark:text-red-400">inventory_2</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-slate-900 dark:text-white font-khmer">ស្តុកទាប</h4>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.lowStockCount}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-khmer">ផលិតផលមានស្តុកមិនគ្រប់</p>
                            </div>
                        </div>
                    </div>

                    {/* Alert Box 3: Debt Collection */}
                    <div className={`p-5 rounded-xl border-2 ${branchAnalytics.debtCount > 0 ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                        <div className="flex items-start gap-3">
                            <div className={`p-3 rounded-lg shrink-0 ${branchAnalytics.debtCount > 0 ? 'bg-purple-200 dark:bg-purple-900/30' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                <span className="material-icons-outlined text-xl text-purple-600 dark:text-purple-400">person_alert</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-900 dark:text-white font-khmer">ឥណទាន</h4>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">${(Number(branchAnalytics.totalDebt)||0).toFixed(0)}</p>
                                <div className="mt-2">
                                    {branchAnalytics.topDebtors.slice(0, 2).map((debtor, idx) => (
                                        <p key={idx} className="text-xs text-slate-600 dark:text-slate-400 truncate">{debtor.name}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Latest Invoices */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 dark:text-white font-khmer">វិក្កយបត្រចុងក្រោយ (Latest Invoices)</h3>
                        <button onClick={() => setCurrentView('receipt-history')} className="text-sm text-primary font-medium hover:underline font-khmer">មើលទាំងអស់</button>
                    </div>
                    {/* 🛠️ FIX: បន្ថែមរុំ overflow និងកំណត់ min-w ឲ្យតារាងទូរស័ព្ទ អូសបានមិនបែកអក្សរ */}
                    <div className="overflow-x-auto w-full pb-2">
                        <table className="w-full min-w-[800px] text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-medium">ID</th>
                                    <th scope="col" className="px-6 py-3 font-medium font-khmer">អតិថិជន (Customer)</th>
                                    <th scope="col" className="px-6 py-3 font-medium font-khmer">កាលបរិច្ឆេទ (Date)</th>
                                    <th scope="col" className="px-6 py-3 font-medium font-khmer">ស្ថានភាព (Status)</th>
                                    <th scope="col" className="px-6 py-3 font-medium text-right font-khmer">សរុប (Total)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {latestInvoices.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No invoices yet.</td></tr>
                                ) : (
                                    latestInvoices.map(order => (
                                        <tr key={order.id} className="bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white">{order.id}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                                {order.customer ? order.customer.name : 'Walk-in Customer'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{new Date(order.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded border ${
                                                    order.status === 'Paid'
                                                    ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                                    : 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">${(Number(order.total)||0).toFixed(2)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Selling Products Table */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 dark:text-white font-khmer">ផលិតផលលក់ច្រើន (Top Selling Products)</h3>
                        <button onClick={() => setCurrentView('inventory-list')} className="text-sm text-primary font-medium hover:underline font-khmer">មើលទាំងអស់</button>
                    </div>
                    {/* 🛠️ FIX: បន្ថែមរុំ overflow និងកំណត់ min-w */}
                    <div className="overflow-x-auto w-full pb-2">
                        <table className="w-full min-w-[600px] text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-medium">#</th>
                                    <th scope="col" className="px-6 py-3 font-medium font-khmer">ផលិតផល (Product)</th>
                                    <th scope="col" className="px-6 py-3 font-medium font-khmer text-right">ចំនួន (Qty)</th>
                                    <th scope="col" className="px-6 py-3 font-medium font-khmer text-right">ប្រាក់ចំណូល (Revenue)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {branchAnalytics.topProducts.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No sales data yet.</td></tr>
                                ) : (
                                    branchAnalytics.topProducts.map((product, idx) => (
                                        <tr key={idx} className="bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{idx + 1}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{product.name}</td>
                                            <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300"><span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold">{product.qty}</span></td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">${(Number(product.revenue)||0).toFixed(2)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <footer className="mt-8 text-center text-xs text-slate-400 pb-4 font-khmer">
                <p>© 2024 SokBiz. រក្សាសិទ្ធិគ្រប់យ៉ាង។</p>
            </footer>
        </div>
    );
};

export default Dashboard;