import React, { useState } from 'react';
import { useData, CustomerTier } from '../context/DataContext';

const CustomerTiers: React.FC = () => {
    const { customerTiers, addCustomerTier, setCurrentView } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTierName, setNewTierName] = useState('');
    const [newTierMinSpend, setNewTierMinSpend] = useState(0);
    const [newTierDiscount, setNewTierDiscount] = useState(0);

    const handleAddTier = () => {
        if (newTierName) {
            addCustomerTier({
                name: newTierName,
                minSpend: newTierMinSpend,
                discount: newTierDiscount,
                color: 'bg-blue-100', // default for now
                badgeIcon: 'stars'
            });
            setIsModalOpen(false);
            setNewTierName('');
            setNewTierMinSpend(0);
            setNewTierDiscount(0);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto h-full bg-background-light dark:bg-background-dark font-display">
            <div className="max-w-7xl mx-auto w-full">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 font-display">
                    <button onClick={() => setCurrentView('crm-directory')} className="hover:text-primary transition-colors">CRM</button>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    <button onClick={() => setCurrentView('loyalty-setup')} className="hover:text-primary transition-colors">Loyalty</button>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    <span className="text-slate-900 dark:text-white font-medium">Tiers</span>
                </nav>

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1 font-khmer">ការគ្រប់គ្រងកម្រិតសមាជិក</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">Membership Tiers Management</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors shadow-sm focus:ring-4 focus:ring-primary/20 font-khmer">
                        <span className="material-symbols-outlined mr-2 text-[20px]">add</span>
                        បន្ថែមតារាងកម្រិត (Add Tier)
                    </button>
                </div>

                {/* Tiers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customerTiers.map(tier => (
                        <div key={tier.id} className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden relative">
                            {/* Top Decoration */}
                            <div className={`h-2 w-full ${tier.color.replace('bg-', 'bg-gradient-to-r from-').replace('-100', '-400')} to-slate-400`}></div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full ${tier.color} dark:bg-opacity-20 flex items-center justify-center text-slate-600 dark:text-slate-300`}>
                                            <span className="material-symbols-outlined text-[28px]">{tier.badgeIcon}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white font-khmer">{tier.name}</h3>
                                            <p className="text-sm text-slate-500 font-medium">Tier Level</p>
                                        </div>
                                    </div>
                                    <button className="text-slate-400 hover:text-primary p-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                        <span className="material-symbols-outlined">more_vert</span>
                                    </button>
                                </div>
                                <div className="space-y-4 my-2 flex-1">
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Entry Criteria</p>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
                                            <span className="text-sm text-slate-600 dark:text-slate-300 font-khmer">ចំណាយសរុប (Spend) &gt;</span>
                                            <span className="text-base font-bold text-slate-900 dark:text-white">${tier.minSpend.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-lg border border-opacity-20 ${tier.color.replace('bg-', 'bg-').replace('-100', '-50')} border-current`}>
                                        <p className="text-xs font-semibold opacity-70 uppercase tracking-wider mb-1">Benefits</p>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined opacity-90 text-[18px]">percent</span>
                                            <span className="text-sm opacity-90 font-khmer">បញ្ចុះតម្លៃ (Discount)</span>
                                            <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-slate-800 shadow-sm">
                                                {tier.discount}% Off
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                                    <button className="flex-1 inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600 dark:hover:text-white dark:hover:bg-slate-700 transition-colors font-khmer">
                                        <span className="material-symbols-outlined text-[18px] mr-2">edit</span>
                                        កែប្រែ
                                    </button>
                                    <button className="inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-red-600 bg-white border border-slate-300 rounded-lg hover:bg-red-50 hover:border-red-200 dark:bg-slate-800 dark:text-red-400 dark:border-slate-600 dark:hover:text-white dark:hover:bg-red-900/20 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-khmer">បន្ថែមតារាងកម្រិត (Add Tier)</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 font-khmer">ឈ្មោះកម្រិត (Tier Name)</label>
                                <input value={newTierName} onChange={e => setNewTierName(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5" placeholder="e.g. Diamond Member" type="text"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 font-khmer">ចំណាយអប្បបរមា (Min. Spend)</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-slate-500 sm:text-sm">$</span></div>
                                        <input value={newTierMinSpend} onChange={e => setNewTierMinSpend(parseFloat(e.target.value))} className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white pl-7 py-2.5 focus:border-primary focus:ring-primary sm:text-sm" placeholder="0.00" type="number"/>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 font-khmer">បញ្ចុះតម្លៃ (Discount %)</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <input value={newTierDiscount} onChange={e => setNewTierDiscount(parseFloat(e.target.value))} className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white pr-8 py-2.5 focus:border-primary focus:ring-primary sm:text-sm" placeholder="0" type="number"/>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><span className="text-slate-500 sm:text-sm">%</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary font-khmer">បោះបង់ (Cancel)</button>
                            <button onClick={handleAddTier} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm font-khmer">រក្សាទុក (Save)</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerTiers;