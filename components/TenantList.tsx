import React, { useState } from 'react';
import { useData, Tenant } from '../context/DataContext';

const TenantList: React.FC = () => {
    const { tenants, setCurrentView, logout, user, updateTenantStatus, renewTenant } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const filteredTenants = tenants.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              t.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              t.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            {/* Sidebar (Duplicate from SuperAdminDashboard for consistency in this view) */}
            <aside className="hidden w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark lg:flex">
                <div className="flex h-16 items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
                        <span className="material-symbols-outlined text-xl">receipt_long</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">QuickBill KH</span>
                </div>
                <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4 gap-1">
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        ម៉ឺនុយចម្បង (Main Menu)
                    </div>
                    <button onClick={() => setCurrentView('super-admin-dashboard')} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-slate-500">dashboard</span>
                        <span className="text-sm font-medium">ផ្ទាំងគ្រប់គ្រង (Dashboard)</span>
                    </button>
                    <button onClick={() => setCurrentView('tenant-list')} className="flex w-full items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-primary dark:text-blue-400">
                        <span className="material-symbols-outlined fill-1">storefront</span>
                        <span className="text-sm font-medium">ការគ្រប់គ្រងហាង (Shops)</span>
                    </button>
                    {/* ... other links can be static for now */}
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 p-4">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={logout}>
                        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <img alt="Admin Avatar" className="h-full w-full object-cover" src={user?.avatar} />
                        </div>
                        <div className="flex flex-1 flex-col">
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Sign Out</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex flex-1 flex-col overflow-hidden bg-background-light dark:bg-background-dark">
                {/* Top Header */}
                <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark px-6">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button className="text-slate-500 hover:text-slate-700">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">QuickBill KH</span>
                    </div>
                    <div className="hidden lg:block">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">បញ្ជីឈ្មោះហាង (Tenant Directory)</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden sm:block">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </span>
                            <input 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 w-64 rounded-lg border-none bg-slate-100 dark:bg-slate-800 pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary" 
                                placeholder="ស្វែងរកហាង..." 
                                type="text"
                            />
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {/* Stats Cards - Simplified for list view context */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-5 shadow-sm border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">ហាងសរុប (Total)</p>
                                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{tenants.length}</p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30 text-primary">
                                    <span className="material-symbols-outlined">store</span>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-5 shadow-sm border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">សកម្ម (Active)</p>
                                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{tenants.filter(t => t.status === 'Active').length}</p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600">
                                    <span className="material-symbols-outlined">check_circle</span>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-5 shadow-sm border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">ផ្អាក (Suspended)</p>
                                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{tenants.filter(t => t.status === 'Suspended').length}</p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600">
                                    <span className="material-symbols-outlined">block</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Table Section */}
                    <div className="flex flex-col gap-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 shadow-sm">
                        {/* Toolbar */}
                        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800">
                            <div className="flex flex-wrap items-center gap-2">
                                {['All', 'Active', 'Suspended'].map(status => (
                                    <button 
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                                            ${filterStatus === status 
                                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' 
                                                : 'bg-white dark:bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
                                        `}
                                    >
                                        <span>{status === 'All' ? 'ទាំងអស់ (All)' : status}</span>
                                        {status === 'All' && <span className="rounded bg-white dark:bg-slate-600 px-1.5 py-0.5 text-xs text-slate-600 dark:text-slate-200">{tenants.length}</span>}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark shadow-sm hover:shadow transition-all">
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                    <span>បន្ថែមហាងថ្មី (Add Shop)</span>
                                </button>
                            </div>
                        </div>
                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold w-12"><input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700"/></th>
                                        <th className="px-6 py-4 font-semibold min-w-[240px]">ឈ្មោះហាង (Shop Name)</th>
                                        <th className="px-6 py-4 font-semibold min-w-[200px]">ម្ចាស់ហាង (Owner)</th>
                                        <th className="px-6 py-4 font-semibold">កញ្ចប់សេវាកម្ម (Plan)</th>
                                        <th className="px-6 py-4 font-semibold">ថ្ងៃផុតកំណត់ (Expiry)</th>
                                        <th className="px-6 py-4 font-semibold text-right">សកម្មភាព (Actions)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {filteredTenants.map((tenant) => (
                                        <tr key={tenant.id} className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${tenant.status === 'Suspended' ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                                            <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700"/></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 flex items-center justify-center">
                                                        {tenant.logo ? (
                                                            <img src={tenant.logo} className="h-full w-full object-cover" alt={tenant.name} />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-slate-400">store</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className={`font-semibold text-slate-900 dark:text-white ${tenant.status === 'Suspended' ? 'line-through decoration-slate-400' : ''}`}>{tenant.subName}</p>
                                                        <p className="text-xs text-slate-500">ID: {tenant.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900 dark:text-white">{tenant.owner}</span>
                                                    <span className="text-xs text-slate-500">{tenant.phone}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                                                    ${tenant.plan === 'Enterprise' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800' : 
                                                      tenant.plan === 'Pro' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800' : 
                                                      'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'}
                                                `}>
                                                    {tenant.plan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-700 dark:text-slate-300">{tenant.expiryDate ? new Date(tenant.expiryDate).toLocaleDateString() : 'N/A'}</span>
                                                    {tenant.expiryDate && new Date(tenant.expiryDate) < new Date() && (
                                                        <span className="rounded bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700 dark:text-red-400">Expired</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => renewTenant(tenant.id)} className="rounded-lg p-2 text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="ពន្យារពេល (Renew)">
                                                        <span className="material-symbols-outlined text-[20px]">autorenew</span>
                                                    </button>
                                                    {tenant.status === 'Active' ? (
                                                        <button onClick={() => updateTenantStatus(tenant.id, 'Suspended')} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="ផ្អាក (Suspend)">
                                                            <span className="material-symbols-outlined text-[20px]">block</span>
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => updateTenantStatus(tenant.id, 'Active')} className="rounded-lg p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title="ដំណើរការឡើងវិញ (Activate)">
                                                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 p-4">
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                Showing <span className="font-medium text-slate-900 dark:text-white">1</span> to <span className="font-medium text-slate-900 dark:text-white">{Math.min(filteredTenants.length, 5)}</span> of <span className="font-medium text-slate-900 dark:text-white">{filteredTenants.length}</span> results
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                </button>
                                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm font-medium">1</button>
                                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TenantList;