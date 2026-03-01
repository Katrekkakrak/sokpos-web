import React, { useState } from 'react';
import { useData, Voucher } from '../context/DataContext';

const VoucherList: React.FC = () => {
    const { vouchers, createVoucher, setCurrentView } = useData();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // New Voucher State
    const [code, setCode] = useState('');
    const [type, setType] = useState<'Percentage' | 'Fixed Amount'>('Percentage');
    const [value, setValue] = useState(0);
    const [limit, setLimit] = useState(100);
    const [expiry, setExpiry] = useState('');

    const handleCreate = () => {
        if (code && value > 0) {
            createVoucher({
                code, type, value, limit, expiryDate: expiry
            });
            setIsCreateModalOpen(false);
            // Reset
            setCode(''); setValue(0); setLimit(100); setExpiry('');
        }
    };

    return (
        <div className="flex-1 p-6 md:p-10 overflow-x-hidden h-full bg-background-light dark:bg-background-dark font-display">
            <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <nav className="flex items-center gap-2 text-sm text-slate-500 font-display">
                        <button onClick={() => setCurrentView('dashboard')} className="hover:text-primary">Home</button>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span>Marketing</span>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span className="text-slate-900 dark:text-white font-medium">Vouchers</span>
                    </nav>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-[#0d141b] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Voucher & Coupon Directory</h1>
                            <p className="text-[#4c739a] dark:text-slate-400 text-base font-normal">Manage your marketing incentives and customer rewards.</p>
                        </div>
                        <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center justify-center gap-2 rounded-lg h-12 px-6 bg-primary hover:bg-blue-600 text-white text-base font-bold transition-all shadow-md hover:shadow-lg w-full md:w-auto font-khmer">
                            <span className="material-symbols-outlined">add</span>
                            <span>Create Voucher (បង្កើតប័ណ្ណ)</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-800 border border-[#e7edf3] dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between"><p className="text-[#4c739a] dark:text-slate-400 text-sm font-medium">Total Vouchers</p><span className="material-symbols-outlined text-[#4c739a]">inventory_2</span></div>
                        <p className="text-[#0d141b] dark:text-white text-3xl font-bold">{vouchers.length}</p>
                    </div>
                    {/* ... other stats can be derived ... */}
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#e7edf3] dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#e7edf3] dark:divide-slate-700">
                            <thead className="bg-[#f8fafc] dark:bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4c739a] dark:text-slate-400 uppercase tracking-wider">Voucher Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4c739a] dark:text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4c739a] dark:text-slate-400 uppercase tracking-wider">Usage Limit</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4c739a] dark:text-slate-400 uppercase tracking-wider">Expiry Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4c739a] dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#4c739a] dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-[#e7edf3] dark:divide-slate-700">
                                {vouchers.map(v => (
                                    <tr key={v.id} className="hover:bg-[#fcfdfd] dark:hover:bg-slate-700/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap"><span className="font-mono text-sm font-bold text-[#0d141b] dark:text-white bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded border border-gray-200 dark:border-slate-600">{v.code}</span></td>
                                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-[#0d141b] dark:text-white font-medium">{v.type}</div><div className="text-xs text-[#4c739a] dark:text-slate-400">{v.type === 'Percentage' ? `${v.value}% Off` : `$${v.value} Off`}</div></td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-full max-w-[120px]">
                                                <div className="flex justify-between text-xs mb-1"><span className="font-medium text-[#0d141b] dark:text-white">{v.used}</span><span className="text-[#4c739a] dark:text-slate-400">/ {v.limit}</span></div>
                                                <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full" style={{ width: `${(v.used / v.limit) * 100}%` }}></div></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0d141b] dark:text-white">{new Date(v.expiryDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${v.status === 'Active' ? 'bg-[#ecfdf5] text-[#047857] border-[#d1fae5] dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca] dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'}`}>{v.status}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-[#4c739a] hover:text-primary transition-colors"><span className="material-symbols-outlined">edit</span></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md p-6 shadow-xl animate-fade-in-up">
                        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white font-khmer">បង្កើតប័ណ្ណថ្មី (Create Voucher)</h2>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium mb-1 dark:text-slate-300">Code</label><input value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 p-2.5 uppercase" placeholder="SUMMER2024" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium mb-1 dark:text-slate-300">Type</label><select value={type} onChange={e => setType(e.target.value as any)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 p-2.5"><option value="Percentage">Percentage</option><option value="Fixed Amount">Fixed Amount</option></select></div>
                                <div><label className="block text-sm font-medium mb-1 dark:text-slate-300">Value</label><input type="number" value={value} onChange={e => setValue(parseFloat(e.target.value))} className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 p-2.5" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium mb-1 dark:text-slate-300">Usage Limit</label><input type="number" value={limit} onChange={e => setLimit(parseInt(e.target.value))} className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 p-2.5" /></div>
                                <div><label className="block text-sm font-medium mb-1 dark:text-slate-300">Expiry Date</label><input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 p-2.5" /></div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-700">Cancel</button>
                            <button onClick={handleCreate} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-600 rounded-lg">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoucherList;