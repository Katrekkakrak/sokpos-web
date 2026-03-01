import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';

const SuperAdminDashboard: React.FC = () => {
    const { tenants, setCurrentView, logout, user } = useData();

    // --- Analytics Logic ---
    const stats = useMemo(() => {
        const totalShops = tenants.length;
        const activeShops = tenants.filter(t => t.status === 'Active').length;
        // Mock calculation of new shops "last month"
        const newShops = tenants.filter(t => {
            const date = new Date(t.joinedDate);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(); 
        }).length; // Using current month for demo

        const mrr = tenants.reduce((acc, t) => acc + (t.status === 'Active' ? t.mrr : 0), 0);
        
        // Expiring soon logic (within 30 days)
        const expiringSoon = tenants.filter(t => {
            if (!t.expiryDate) return false;
            const diffTime = new Date(t.expiryDate).getTime() - new Date().getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 && diffDays <= 30;
        }).length;

        // Recent tenants sorted by date
        const recentTenants = [...tenants].sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()).slice(0, 5);

        return { totalShops, activeShops, newShops, mrr, expiringSoon, recentTenants };
    }, [tenants]);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display">
            {/* Sidebar (Super Admin Specific) */}
            <aside className="hidden w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121122] md:flex">
                <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-center rounded-lg bg-primary/10 p-1.5">
                        <div className="h-6 w-6 text-primary">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold text-slate-900 dark:text-white">QuickBill KH</h1>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Super Admin</span>
                    </div>
                </div>
                <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 py-4">
                    <nav className="flex flex-col gap-1">
                        <button onClick={() => setCurrentView('super-admin-dashboard')} className="group flex items-center gap-3 rounded-lg bg-primary px-3 py-2 text-white transition-colors">
                            <span className="material-symbols-outlined text-[20px]">dashboard</span>
                            <span className="text-sm font-medium">Dashboard</span>
                        </button>
                        <button onClick={() => setCurrentView('tenant-list')} className="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-surface-highlight dark:hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[20px]">group</span>
                            <span className="text-sm font-medium">Tenants</span>
                        </button>
                        <a className="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-surface-highlight dark:hover:text-white transition-colors" href="#">
                            <span className="material-symbols-outlined text-[20px]">credit_card</span>
                            <span className="text-sm font-medium">Plans</span>
                        </a>
                        <a className="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-surface-highlight dark:hover:text-white transition-colors" href="#">
                            <span className="material-symbols-outlined text-[20px]">payments</span>
                            <span className="text-sm font-medium">Billing</span>
                        </a>
                        <a className="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-surface-highlight dark:hover:text-white transition-colors" href="#">
                            <span className="material-symbols-outlined text-[20px]">analytics</span>
                            <span className="text-sm font-medium">Reports</span>
                        </a>
                        <div className="my-4 h-px bg-slate-200 dark:bg-slate-800"></div>
                        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-2">System</p>
                        <a className="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-surface-highlight dark:hover:text-white transition-colors" href="#">
                            <span className="material-symbols-outlined text-[20px]">settings</span>
                            <span className="text-sm font-medium">System Settings</span>
                        </a>
                        <a className="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-surface-highlight dark:hover:text-white transition-colors" href="#">
                            <span className="material-symbols-outlined text-[20px]">security</span>
                            <span className="text-sm font-medium">Audit Logs</span>
                        </a>
                    </nav>
                    <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                        <div className="flex items-center gap-3 px-3 cursor-pointer" onClick={logout}>
                            <div className="relative h-9 w-9 overflow-hidden rounded-full bg-slate-200 dark:bg-surface-highlight">
                                <img alt="Profile" className="h-full w-full object-cover" src={user?.avatar} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">Sign Out</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex flex-1 flex-col overflow-hidden bg-background-light dark:bg-background-dark">
                {/* Header */}
                <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-[#121122]">
                    <div className="flex items-center gap-4">
                        <button className="flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-surface-highlight md:hidden">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Super Admin Dashboard</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden max-w-md flex-1 md:flex">
                            <div className="relative w-full">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                    <span className="material-symbols-outlined text-[20px]">search</span>
                                </div>
                                <input className="block w-64 rounded-lg border-0 bg-slate-100 py-2 pl-10 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-primary dark:bg-surface-highlight dark:text-white dark:placeholder-slate-400" placeholder="Search tenants, logs..." type="text"/>
                            </div>
                        </div>
                        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-surface-highlight transition-colors">
                            <span className="material-symbols-outlined text-[22px]">notifications</span>
                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#121122]"></span>
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <div className="mx-auto max-w-7xl flex flex-col gap-6">
                        {/* KPI Cards Row */}
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Card 1 */}
                            <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-surface-dark dark:ring-slate-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">ហាងសរុប (Total Shops)</p>
                                        <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stats.totalShops.toLocaleString()}</h3>
                                    </div>
                                    <div className="rounded-lg bg-blue-500/10 p-3 text-blue-600 dark:text-blue-400">
                                        <span className="material-symbols-outlined">storefront</span>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="flex items-center font-medium text-emerald-600 dark:text-emerald-400">
                                        <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                                        +5%
                                    </span>
                                    <span className="ml-2 text-slate-500 dark:text-slate-400">from last month</span>
                                </div>
                            </div>
                            {/* Card 2 */}
                            <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-surface-dark dark:ring-slate-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">ចំណូលខែនេះ (MRR)</p>
                                        <h3 className="mt-2 text-3xl font-bold text-primary dark:text-primary-light">${stats.mrr.toLocaleString()}</h3>
                                    </div>
                                    <div className="rounded-lg bg-primary/10 p-3 text-primary dark:text-primary-light">
                                        <span className="material-symbols-outlined">attach_money</span>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="flex items-center font-medium text-emerald-600 dark:text-emerald-400">
                                        <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                                        +12%
                                    </span>
                                    <span className="ml-2 text-slate-500 dark:text-slate-400">from last month</span>
                                </div>
                            </div>
                            {/* Card 3 */}
                            <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-surface-dark dark:ring-slate-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">ហាងជិតផុតកំណត់ (Expiring Soon)</p>
                                        <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stats.expiringSoon}</h3>
                                    </div>
                                    <div className="rounded-lg bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400">
                                        <span className="material-symbols-outlined">timer</span>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="flex items-center font-medium text-amber-600 dark:text-amber-400">
                                        <span className="material-symbols-outlined text-[16px] mr-1">warning</span>
                                        Action Required
                                    </span>
                                    <span className="ml-2 text-slate-500 dark:text-slate-400">within 30 days</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart Section */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-surface-dark dark:ring-slate-800 lg:col-span-2">
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">កំណើនអ្នកប្រើប្រាស់ (User Growth)</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">New shops onboarded over the last 6 months</p>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1 dark:bg-background-dark">
                                        <button className="rounded-md bg-white px-3 py-1 text-xs font-medium text-slate-900 shadow-sm dark:bg-surface-highlight dark:text-white">6 Months</button>
                                        <button className="rounded-md px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Year</button>
                                    </div>
                                </div>
                                <div className="relative h-[300px] w-full">
                                    {/* Simulated Chart with SVG */}
                                    <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 800 300">
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#2513ec" stopOpacity="0.2"></stop>
                                                <stop offset="100%" stopColor="#2513ec" stopOpacity="0"></stop>
                                            </linearGradient>
                                        </defs>
                                        {/* Grid Lines */}
                                        <line className="opacity-20" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="250" y2="250"></line>
                                        <line className="opacity-20" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="190" y2="190"></line>
                                        <line className="opacity-20" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="130" y2="130"></line>
                                        <line className="opacity-20" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="70" y2="70"></line>
                                        {/* Area Fill */}
                                        <path d="M0,250 C100,240 150,200 200,180 C250,160 300,190 400,150 C500,110 550,130 650,80 C750,30 800,50 800,50 L800,300 L0,300 Z" fill="url(#chartGradient)"></path>
                                        {/* Line */}
                                        <path className="dark:stroke-primary-light" d="M0,250 C100,240 150,200 200,180 C250,160 300,190 400,150 C500,110 550,130 650,80 C750,30 800,50 800,50" fill="none" stroke="#2513ec" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                                        {/* Tooltip Dot Example */}
                                        <circle className="dark:fill-primary-light stroke-white dark:stroke-surface-dark" cx="650" cy="80" fill="#2513ec" r="6" strokeWidth="3"></circle>
                                    </svg>
                                    {/* X Axis Labels */}
                                    <div className="mt-2 flex justify-between px-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                        <span>Jan</span>
                                        <span>Feb</span>
                                        <span>Mar</span>
                                        <span>Apr</span>
                                        <span>May</span>
                                        <span>Jun</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Side Status Panel */}
                            <div className="flex flex-col gap-4">
                                {/* System Health */}
                                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-surface-dark dark:ring-slate-800">
                                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">System Status</h3>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">API Gateway</span>
                                            </div>
                                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Operational</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Database</span>
                                            </div>
                                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Operational</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Storage</span>
                                            </div>
                                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Operational</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Quick Actions */}
                                <div className="flex-1 rounded-xl bg-gradient-to-br from-primary to-primary-dark p-6 text-white shadow-lg">
                                    <h3 className="text-lg font-bold">Quick Actions</h3>
                                    <p className="mb-6 mt-1 text-sm text-primary-200 opacity-90">Manage your platform efficiently.</p>
                                    <div className="flex flex-col gap-3">
                                        <button className="flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                                            <span className="material-symbols-outlined text-[18px]">add_business</span>
                                            Add New Tenant
                                        </button>
                                        <button className="flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                                            <span className="material-symbols-outlined text-[18px]">campaign</span>
                                            Broadcast Message
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Tenants Table */}
                        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-surface-dark dark:ring-slate-800">
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Tenants (ហាងថ្មីៗ)</h3>
                                <button onClick={() => setCurrentView('tenant-list')} className="text-sm font-medium text-primary hover:text-primary-light dark:text-primary-light">View All</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                                    <thead className="bg-slate-50 text-xs uppercase text-slate-700 dark:bg-[#1a2333] dark:text-slate-300">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold" scope="col">Shop Name</th>
                                            <th className="px-6 py-3 font-semibold" scope="col">Owner</th>
                                            <th className="px-6 py-3 font-semibold" scope="col">Plan</th>
                                            <th className="px-6 py-3 font-semibold" scope="col">Status</th>
                                            <th className="px-6 py-3 font-semibold" scope="col">Joined Date</th>
                                            <th className="px-6 py-3 font-semibold text-right" scope="col">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {stats.recentTenants.map((tenant) => (
                                            <tr key={tenant.id} className="hover:bg-slate-50 dark:hover:bg-surface-highlight/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                                            <span className="material-symbols-outlined">
                                                                {tenant.name.includes('Cafe') ? 'local_cafe' : tenant.name.includes('Restaurant') ? 'restaurant' : tenant.name.includes('Fashion') ? 'apparel' : 'storefront'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-900 dark:text-white">{tenant.name}</div>
                                                            <div className="text-xs">{tenant.subName}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900 dark:text-white">{tenant.owner}</div>
                                                    <div className="text-xs">{tenant.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                                                        ${tenant.plan === 'Enterprise' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 
                                                          tenant.plan === 'Pro' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                          tenant.plan === 'Trial' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' :
                                                          'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'}
                                                    `}>
                                                        {tenant.plan}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                                                        ${tenant.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 
                                                          tenant.status === 'Suspended' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}
                                                    `}>
                                                        {tenant.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {new Date(tenant.joinedDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                                        <span className="material-symbols-outlined">more_vert</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SuperAdminDashboard;