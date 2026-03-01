import React, { useState, useEffect } from 'react';
import { useData, LoyaltySettings } from '../context/DataContext';

const LoyaltySetup: React.FC = () => {
    const { loyaltySettings, saveLoyaltySettings, setCurrentView } = useData();
    const [settings, setSettings] = useState<LoyaltySettings>(loyaltySettings);

    useEffect(() => {
        setSettings(loyaltySettings);
    }, [loyaltySettings]);

    const handleSave = () => {
        saveLoyaltySettings(settings);
    };

    return (
        <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto h-full bg-background-light dark:bg-background-dark font-display">
            <div className="max-w-4xl mx-auto w-full">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 font-display">
                    <button onClick={() => setCurrentView('crm-directory')} className="hover:text-primary transition-colors">CRM</button>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    <button onClick={() => setCurrentView('loyalty-setup')} className="hover:text-primary transition-colors">Loyalty</button>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    <span className="text-slate-900 dark:text-white font-medium">Loyalty Setup</span>
                </nav>
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 font-khmer">ការកំណត់ពិន្ទុស្មោះត្រង់ (Loyalty Setup)</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-khmer">កំណត់ច្បាប់នៃការទទួលបាន និងការប្រើប្រាស់ពិន្ទុសម្រាប់អតិថិជនរបស់អ្នក។</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setCurrentView('crm-directory')} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors font-khmer">
                            បោះបង់ (Cancel)
                        </button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-hover shadow-sm shadow-primary/30 transition-colors font-khmer flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            រក្សាទុក (Save)
                        </button>
                    </div>
                </div>
                {/* Master Toggle Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-8 flex items-center justify-between transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-primary rounded-full">
                            <span className="material-symbols-outlined">toggle_on</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-khmer">ស្ថានភាពកម្មវិធី (Program Status)</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-khmer">បើកដំណើរការប្រព័ន្ធពិន្ទុសម្រាប់ហាងរបស់អ្នក</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.enabled}
                            onChange={(e) => setSettings({...settings, enabled: e.target.checked})}
                        />
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
                {/* Main Configuration Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Earning Rules Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="material-symbols-outlined text-green-600 bg-green-100 dark:bg-green-900/30 p-1.5 rounded-lg text-[20px]">payments</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-khmer">ច្បាប់នៃការទទួលបាន (Earning Rules)</h3>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 pl-11 font-khmer">កំណត់ចំនួនពិន្ទុដែលអតិថិជនទទួលបាននៅពេលចំណាយ។</p>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-center">
                            <div className="flex flex-col gap-6">
                                <div className="relative">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-khmer">ចំណាយគ្រប់ (Spend Amount)</label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-slate-500 sm:text-sm">$</span>
                                        </div>
                                        <input 
                                            className="block w-full rounded-lg border-slate-300 pl-7 py-3 text-slate-900 focus:border-primary focus:ring-primary dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 sm:text-sm font-semibold" 
                                            placeholder="0.00" type="number" 
                                            value={settings.earnSpend}
                                            onChange={(e) => setSettings({...settings, earnSpend: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-center text-slate-400">
                                    <span className="material-symbols-outlined text-3xl animate-bounce">arrow_downward</span>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-khmer">ទទួលបាន (Get Points)</label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <input 
                                            className="block w-full rounded-lg border-slate-300 pr-12 py-3 text-slate-900 focus:border-primary focus:ring-primary dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 sm:text-sm font-semibold" 
                                            placeholder="0" type="number" 
                                            value={settings.earnPoints}
                                            onChange={(e) => setSettings({...settings, earnPoints: parseInt(e.target.value)})}
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <span className="text-slate-500 sm:text-sm font-khmer">ពិន្ទុ</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <p className="text-sm text-blue-800 dark:text-blue-200 text-center font-medium font-khmer">
                                        អតិថិជនចំណាយ $50.00 នឹងទទួលបាន <span className="font-bold">{(50 / settings.earnSpend * settings.earnPoints).toFixed(0)} ពិន្ទុ</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Redemption Rules Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="material-symbols-outlined text-purple-600 bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-lg text-[20px]">redeem</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-khmer">ច្បាប់នៃការប្តូរពិន្ទុ (Redemption Rules)</h3>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 pl-11 font-khmer">កំណត់ចំនួនពិន្ទុដើម្បីប្តូរជាការបញ្ចុះតម្លៃ។</p>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-center">
                            <div className="flex flex-col gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-khmer">ប្រើពិន្ទុចំនួន (Points Required)</label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <input 
                                            className="block w-full rounded-lg border-slate-300 pr-12 py-3 text-slate-900 focus:border-primary focus:ring-primary dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 sm:text-sm font-semibold" 
                                            placeholder="0" type="number" 
                                            value={settings.redeemPoints}
                                            onChange={(e) => setSettings({...settings, redeemPoints: parseInt(e.target.value)})}
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <span className="text-slate-500 sm:text-sm font-khmer">ពិន្ទុ</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center text-slate-400">
                                    <span className="material-symbols-outlined text-3xl animate-bounce">arrow_downward</span>
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-khmer">បញ្ចុះតម្លៃ (Discount Value)</label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-slate-500 sm:text-sm">$</span>
                                        </div>
                                        <input 
                                            className="block w-full rounded-lg border-slate-300 pl-7 py-3 text-slate-900 focus:border-primary focus:ring-primary dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 sm:text-sm font-semibold" 
                                            placeholder="0.00" type="number" 
                                            value={settings.redeemValue}
                                            onChange={(e) => setSettings({...settings, redeemValue: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                                    <p className="text-sm text-purple-800 dark:text-purple-200 text-center font-medium font-khmer">
                                        ប្រើ 100 ពិន្ទុ អាចបញ្ចុះតម្លៃបាន <span className="font-bold">${(100 / settings.redeemPoints * settings.redeemValue).toFixed(2)}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoyaltySetup;