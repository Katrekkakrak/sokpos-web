import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const CourierList: React.FC = () => {
    const { couriers, addCourier, setCurrentView } = useData();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // New Courier State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [baseRate, setBaseRate] = useState(0);

    const handleAdd = () => {
        if (name) {
            addCourier({ name, phone, baseRate, logo: name.slice(0, 2).toUpperCase() });
            setIsAddModalOpen(false);
            setName(''); setPhone(''); setBaseRate(0);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-text-primary-light dark:text-text-primary-dark">
            {/* Top Navbar */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-3 shadow-sm lg:px-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView('dashboard')} className="size-8 flex items-center justify-center text-primary rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <h2 className="text-lg font-bold leading-tight tracking-tight">Courier Partners</h2>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white text-sm font-bold shadow-md hover:bg-primary-dark transition-colors">
                        <span className="material-symbols-outlined text-[20px]">account_circle</span>
                        <span className="hidden sm:inline">Profile</span>
                    </button>
                </div>
            </header>
            <main className="flex-1 px-4 py-8 lg:px-10 xl:px-40 overflow-y-auto">
                <div className="mx-auto max-w-7xl flex flex-col gap-6">
                    {/* Page Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold leading-tight md:text-4xl text-text-primary-light dark:text-text-primary-dark font-khmer">ដៃគូដឹកជញ្ជូន</h1>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-base">គ្រប់គ្រងក្រុមហ៊ុនដឹកជញ្ជូន និងកំណត់តម្លៃសេវា</p>
                        </div>
                        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-white shadow-lg hover:bg-primary-dark transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-khmer">
                            <span className="material-symbols-outlined">add</span>
                            <span className="font-bold">បន្ថែមក្រុមហ៊ុន</span>
                        </button>
                    </div>
                    {/* Grid Layout */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {couriers.map(courier => (
                            <div key={courier.id} className="group relative flex flex-col justify-between rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                                <div className="absolute right-4 top-4">
                                    <button className="rounded-full p-1 text-text-secondary-light hover:bg-background-light dark:text-text-secondary-dark dark:hover:bg-background-dark transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                                    </button>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border-light dark:border-border-dark bg-white p-1">
                                            {courier.logo.startsWith('http') ? 
                                                <img alt={courier.name} className="h-full w-full object-contain" src={courier.logo} /> : 
                                                <div className="flex h-full w-full items-center justify-center bg-blue-600 text-white font-bold text-xl rounded">{courier.logo}</div>
                                            }
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">{courier.name}</h3>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${courier.status === 'Active' ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 ring-gray-500/10'}`}>{courier.status}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 py-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-1 font-khmer">
                                                <span className="material-symbols-outlined text-[16px]">call</span>
                                                លេខទំនាក់ទំនង
                                            </span>
                                            <span className="font-medium font-display">{courier.phone}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-1 font-khmer">
                                                <span className="material-symbols-outlined text-[16px]">payments</span>
                                                តម្លៃមូលដ្ឋាន
                                            </span>
                                            <span className="font-bold text-primary">${courier.baseRate.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between border-t border-border-light dark:border-border-dark pt-4">
                                    <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark font-khmer">ស្ថានភាព</span>
                                    <label className="relative inline-flex cursor-pointer items-center">
                                        <input checked={courier.status === 'Active'} readOnly className="peer sr-only" type="checkbox" />
                                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700 dark:border-gray-600"></div>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-surface-dark rounded-xl w-full max-w-md p-6 shadow-xl animate-fade-in-up border border-border-light dark:border-border-dark">
                        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white font-khmer">បន្ថែមក្រុមហ៊ុនដឹកជញ្ជូន</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Name</label>
                                <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 p-2.5" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Phone</label>
                                <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 p-2.5" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Base Rate ($)</label>
                                <input type="number" value={baseRate} onChange={e => setBaseRate(parseFloat(e.target.value))} className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 p-2.5" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-700">Cancel</button>
                            <button onClick={handleAdd} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-600 rounded-lg">Add</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourierList;