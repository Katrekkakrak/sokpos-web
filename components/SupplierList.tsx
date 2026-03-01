
import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const SupplierList: React.FC = () => {
    const { suppliers, addSupplier, setCurrentView } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // New Supplier State
    const [newSupplierName, setNewSupplierName] = useState('');
    const [newSupplierPhone, setNewSupplierPhone] = useState('');
    const [newSupplierEmail, setNewSupplierEmail] = useState('');
    const [newSupplierCat, setNewSupplierCat] = useState('General');

    const filteredSuppliers = suppliers.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.phone.includes(searchTerm)
    );

    const handleAddSupplier = () => {
        if (newSupplierName) {
            addSupplier({
                name: newSupplierName,
                phone: newSupplierPhone,
                email: newSupplierEmail,
                category: newSupplierCat
            });
            setIsAddModalOpen(false);
            // Reset form
            setNewSupplierName('');
            setNewSupplierPhone('');
            setNewSupplierEmail('');
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-100">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182635] px-6 py-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <button className="hover:text-primary transition-colors" onClick={() => setCurrentView('dashboard')}>ទំព័រដើម (Home)</button>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">គ្រប់គ្រងអ្នកផ្គត់ផ្គង់ (Supplier Management)</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">បញ្ជីអ្នកផ្គត់ផ្គង់ (Supplier Directory)</h2>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        <span>Export</span>
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-[#1e2e40] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">អ្នកផ្គត់ផ្គង់សរុប (Total)</span>
                            <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg text-[20px]">groups</span>
                        </div>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">{suppliers.length}</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#1e2e40] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">បំណុលសរុប (Debt)</span>
                            <span className="material-symbols-outlined text-red-500 bg-red-500/10 p-1.5 rounded-lg text-[20px]">account_balance_wallet</span>
                        </div>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                ${suppliers.reduce((acc, s) => acc + (s.outstandingDebt || 0), 0).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Table Section */}
                <div className="flex flex-col bg-white dark:bg-[#1e2e40] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm min-h-[600px]">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between gap-4 items-center">
                        <div className="relative flex-1 max-w-md group w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                            </div>
                            <input 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-[#182635] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out font-khmer" 
                                placeholder="ស្វែងរកឈ្មោះ ឬ លេខទូរស័ព្ទ..." 
                                type="text"
                            />
                        </div>
                        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 w-full sm:w-auto font-medium">
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span className="font-khmer">បន្ថែមអ្នកផ្គត់ផ្គង់ (Add)</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-[#182635]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider font-khmer">ឈ្មោះ (Name)</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider font-khmer">ទំនាក់ទំនង (Contact)</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider font-khmer">ប្រភេទទំនិញ (Category)</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider font-khmer">បំណុល (Debt)</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider font-khmer">សកម្មភាព</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-[#1e2e40] divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredSuppliers.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {s.logo && s.logo.length > 2 ? (
                                                        <img className="h-10 w-10 rounded-full object-cover" src={s.logo} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
                                                            {s.logo || s.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{s.name}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">ID: {s.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-700 dark:text-slate-300">{s.phone}</div>
                                            <div className="text-xs text-slate-500">{s.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                {s.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm font-bold ${s.outstandingDebt > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                                ${s.outstandingDebt.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-slate-400 hover:text-primary transition-colors p-1"><span className="material-symbols-outlined">edit</span></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md p-6 shadow-xl animate-fade-in-up">
                        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white font-khmer">បន្ថែមអ្នកផ្គត់ផ្គង់ថ្មី</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                                <input value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 p-2.5 text-sm dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                <input value={newSupplierPhone} onChange={e => setNewSupplierPhone(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 p-2.5 text-sm dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <input value={newSupplierEmail} onChange={e => setNewSupplierEmail(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 p-2.5 text-sm dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                <select value={newSupplierCat} onChange={e => setNewSupplierCat(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 p-2.5 text-sm dark:text-white">
                                    <option>General</option>
                                    <option>Food</option>
                                    <option>Drinks</option>
                                    <option>Electronics</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-700">Cancel</button>
                            <button onClick={handleAddSupplier} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-600 rounded-lg">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierList;
