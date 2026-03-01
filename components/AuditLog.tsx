import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const AuditLog: React.FC = () => {
    const { auditLogs, setCurrentView } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('All');

    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              log.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              log.ip.includes(searchTerm);
        const matchesAction = filterAction === 'All' || log.actionType === filterAction;
        return matchesSearch && matchesAction;
    });

    return (
        <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-200">
            {/* Header */}
            <header className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-6 py-4 flex-shrink-0">
                <div className="max-w-[1400px] mx-auto w-full">
                    <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                        <button onClick={() => setCurrentView('dashboard')} className="hover:text-primary transition-colors">Dashboard</button>
                        <span className="material-symbols-outlined mx-2 text-base">chevron_right</span>
                        <span className="text-slate-900 dark:text-slate-100">Audit Log</span>
                    </nav>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-khmer">កំណត់ត្រាសកម្មភាពប្រព័ន្ធ (System Audit Log)</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">តាមដានសកម្មភាពអ្នកប្រើប្រាស់និងសុវត្ថិភាពប្រព័ន្ធ</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="inline-flex items-center justify-center px-4 py-2 border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <span className="material-symbols-outlined mr-2 text-lg">download</span> Export CSV
                            </button>
                            <button className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark shadow-sm transition-colors">
                                <span className="material-symbols-outlined mr-2 text-lg">print</span> Print Log
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6">
                    {/* Filters */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Search</label>
                                <div className="relative">
                                    <input 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white" 
                                        placeholder="IP, Name, or Action..." 
                                    />
                                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-xl pointer-events-none">search</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Action Type</label>
                                <div className="relative">
                                    <select 
                                        value={filterAction}
                                        onChange={(e) => setFilterAction(e.target.value)}
                                        className="w-full pl-10 pr-8 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none dark:text-white cursor-pointer"
                                    >
                                        <option value="All">All Actions</option>
                                        <option value="Login">Login</option>
                                        <option value="Create">Create</option>
                                        <option value="Update">Update</option>
                                        <option value="Delete">Delete</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-xl pointer-events-none">category</span>
                                    <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 text-xl pointer-events-none">expand_more</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px] text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-border-light dark:border-border-dark">
                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Staff</th>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Device / IP</th>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                    {filteredLogs.map(log => (
                                        <tr key={log.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${log.isCritical ? 'bg-red-50/50 dark:bg-red-900/10 border-l-4 border-l-red-500' : ''}`}>
                                            <td className={`py-4 px-6 ${log.isCritical ? 'pl-5' : ''}`}>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{log.date.toLocaleDateString()}</span>
                                                    <span className="text-xs text-slate-500">{log.date.toLocaleTimeString()}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ${log.staffName === 'Unknown User' ? 'bg-slate-200 text-slate-500' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                        {log.staffName.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-slate-900 dark:text-white">{log.staffName}</span>
                                                        <span className="text-xs text-slate-500">ID: {log.staffId}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <span className={`material-symbols-outlined text-lg ${
                                                        log.actionType === 'Delete' || log.isCritical ? 'text-red-500' : 
                                                        log.actionType === 'Create' ? 'text-green-500' : 
                                                        log.actionType === 'Update' ? 'text-blue-500' : 'text-slate-500'
                                                    }`}>
                                                        {log.actionType === 'Delete' ? 'delete_forever' : 
                                                         log.actionType === 'Create' ? 'add_circle' : 
                                                         log.actionType === 'Update' ? 'edit_note' : 'info'}
                                                    </span>
                                                    <span className={`text-sm ${log.isCritical ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {log.description}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                        <span className="material-symbols-outlined text-base text-slate-400">devices</span>
                                                        <span className="text-sm">{log.device}</span>
                                                    </div>
                                                    <span className="text-xs font-mono text-slate-500 mt-0.5">{log.ip}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button className="text-slate-400 hover:text-primary transition-colors p-1 rounded-full hover:bg-primary/10">
                                                    <span className="material-symbols-outlined">visibility</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredLogs.length === 0 && (
                                        <tr><td colSpan={5} className="py-8 text-center text-slate-500">No logs found matching your filters.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AuditLog;