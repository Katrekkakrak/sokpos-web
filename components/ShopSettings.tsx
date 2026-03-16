import React, { useState, useEffect, useRef } from 'react';
import { useData, Branch } from '../context/DataContext';
import ShippingSettings from './ShippingSettings';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../src/config/firebase';

const ShopSettings: React.FC = () => {
    const { shopSettings, updateShopSettings, setCurrentView, user } = useData();
    const [formData, setFormData] = useState(shopSettings);
    const [operatingHours, setOperatingHours] = useState('');
    const [activeTab, setActiveTab] = useState('general');
    const [newBranchName, setNewBranchName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFormData(shopSettings);
        setOperatingHours((shopSettings as any).operatingHours || '');
    }, [shopSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setFormData(prev => ({ ...prev, logo: '' }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAddBranch = () => {
        if (!newBranchName.trim()) return;
        const newBranch: Branch = { id: `b-${Date.now()}`, name: newBranchName.trim() };
        const currentBranches = (formData as any).branches || [];
        setFormData(prev => ({ ...prev, branches: [...currentBranches, newBranch] }));
        setNewBranchName('');
    };

    const handleUpdateBranch = (id: string, name: string) => {
        const currentBranches = (formData as any).branches || [];
        const updatedBranches = currentBranches.map((b: Branch) => b.id === id ? { ...b, name } : b);
        setFormData(prev => ({ ...prev, branches: updatedBranches }));
    };

    const handleDeleteBranch = (id: string) => {
        if (window.confirm('តើអ្នកពិតជាចង់លុបសាខានេះមែនទេ? (Are you sure you want to delete this branch?)')) {
            const currentBranches = (formData as any).branches || [];
            setFormData(prev => ({ ...prev, branches: currentBranches.filter((b: Branch) => b.id !== id) }));
        }
    };

    const handleSave = async () => {
        if (!user || !user.uid) {
            alert("Error: User authentication missing!");
            return;
        }

    try {
        // Sanitize formData to prevent Firestore 'undefined' errors.
        // This ensures all fields have a default value if they are not set.
        const payload = {
            name: formData.name || '',
            phone: formData.phone || '',
            email: formData.email || '',
            address: formData.address || '',
            operatingHours: operatingHours || '',
            logo: formData.logo || '',
            timezone: formData.timezone || '(GMT+07:00) Phnom Penh',
            currency: formData.currency || 'USD',
            taxRate: Number(formData.taxRate) || 0,
            telegramToken: formData.telegramToken || '',
            telegramChatId: formData.telegramChatId || '',
            aiTelegramToken: (formData as any).aiTelegramToken || '',
            bakongAccountId: (formData as any).bakongAccountId || '',
            bankAccountName: (formData as any).bankAccountName || '',
            branches: (formData as any).branches || []
        };

        // Direct save to cloud
        const settingsRef = doc(db, 'tenants', user.uid, 'settings', 'shopSettings');
        await setDoc(settingsRef, payload, { merge: true });

        alert('ការកំណត់ត្រូវបានរក្សាទុកជោគជ័យ! (Settings saved successfully!) 🚀');
    } catch (error) {
        console.error("Failed to save settings:", error);
        alert('បរាជ័យក្នុងការរក្សាទុក! (Failed to save)');
    }
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-64px)] overflow-y-auto bg-background-light dark:bg-background-dark">
            {/* Header & Breadcrumbs */}
            <header className="px-6 py-6 md:px-10 md:py-8 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark sticky top-0 z-10">
                <div className="max-w-5xl mx-auto w-full">
                    <div className="flex flex-col gap-4">
                        {/* Breadcrumbs */}
                        <div className="flex items-center text-sm text-text-secondary">
                            <button onClick={() => setCurrentView('dashboard')} className="hover:text-primary transition-colors">គេហទំព័រ (Home)</button>
                            <span className="mx-2">/</span>
                            <span className="hover:text-primary transition-colors cursor-default">ការកំណត់ (Settings)</span>
                            <span className="mx-2">/</span>
                            <span className="text-text-primary font-medium">ទូទៅ (General)</span>
                        </div>
                        {/* Title & Description */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight font-khmer">ការកំណត់ទូទៅ (Shop General Settings)</h2>
                                <p className="text-text-secondary mt-2 text-sm md:text-base font-khmer">
                                    គ្រប់គ្រងព័ត៌មានហាង រូបិយប័ណ្ណ និងការកំណត់វិក្កយបត្ររបស់អ្នកនៅទីនេះ។
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setCurrentView('dashboard')} className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-text-primary bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm font-khmer">
                                    បោះបង់ (Cancel)
                                </button>
                                <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors text-sm font-medium shadow-sm flex items-center gap-2 font-khmer">
                                    <span className="material-symbols-outlined text-[20px]">save</span>
                                    រក្សាទុកការកំណត់ (Save)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
                <div className="max-w-5xl mx-auto w-full px-6 py-8 md:px-10">
                    {/* Tabs */}
                    <div className="border-b border-border-light dark:border-border-dark mb-8">
                        <nav aria-label="Tabs" className="-mb-px flex space-x-8 overflow-x-auto">
                            <button onClick={(e) => { e.preventDefault(); setActiveTab('general'); }} className={`whitespace-nowrap border-b-[3px] py-4 px-1 text-sm flex items-center gap-2 transition-colors font-khmer ${
                                activeTab === 'general' 
                                  ? 'border-primary text-primary font-bold' 
                                  : 'border-transparent text-text-secondary hover:border-gray-300 hover:text-text-primary font-medium'
                            }`}>
                                <span className="material-symbols-outlined text-[20px] filled">storefront</span>
                                ព័ត៌មានទូទៅ (General Info)
                            </button>
                            <button onClick={(e) => { e.preventDefault(); setActiveTab('currency'); }} className={`whitespace-nowrap border-b-[3px] py-4 px-1 text-sm flex items-center gap-2 transition-colors font-khmer ${
                                activeTab === 'currency' 
                                  ? 'border-primary text-primary font-bold' 
                                  : 'border-transparent text-text-secondary hover:border-gray-300 hover:text-text-primary font-medium'
                            }`}>
                                <span className="material-symbols-outlined text-[20px]">currency_exchange</span>
                                រូបិយប័ណ្ណ & ពន្ធ (Currency & Tax)
                            </button>
                            <button onClick={(e) => { e.preventDefault(); setActiveTab('receipt'); }} className={`whitespace-nowrap border-b-[3px] py-4 px-1 text-sm flex items-center gap-2 transition-colors font-khmer ${
                                activeTab === 'receipt' 
                                  ? 'border-primary text-primary font-bold' 
                                  : 'border-transparent text-text-secondary hover:border-gray-300 hover:text-text-primary font-medium'
                            }`}>
                                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                                វិក្កយបត្រ (Receipt Settings)
                            </button>
                        </nav>
                    </div>

                    {/* General Tab Content */}
                    {activeTab === 'general' && (
                    <>
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark">
                        <div className="p-6 md:p-8 space-y-8">
                            {/* Logo Upload Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-text-primary mb-1 font-khmer">ឡូហ្គោហាង (Shop Logo)</label>
                                    <p className="text-xs text-text-secondary font-khmer">
                                        ឯកសារដែលអនុញ្ញាត: PNG, JPG, SVG<br/>
                                        ទំហំអតិបរមា: 2MB
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="flex items-center gap-6">
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="relative group h-24 w-24 shrink-0 rounded-full border border-border-light dark:border-border-dark overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center cursor-pointer"
                                        >
                                            {/* Placeholder or Current Logo */}
                                            {formData.logo ? (
                                                <img src={formData.logo} alt="Shop Logo" className="h-full w-full object-contain" />
                                            ) : (
                                                <img src="/logo.png" alt="Default Logo" className="h-full w-full object-contain p-2 opacity-40 grayscale" />
                                            )}
                                            {/* Overlay on hover */}
                                            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center cursor-pointer transition-all">
                                                <span className="material-symbols-outlined text-white">edit</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex gap-3">
                                                <button 
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="rounded-lg bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark px-3 py-2 text-sm font-medium text-text-primary shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all font-khmer" 
                                                    type="button"
                                                >
                                                    ផ្លាស់ប្តូរ (Change)
                                                </button>
                                                <button 
                                                    onClick={handleRemoveLogo}
                                                    className="rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-khmer" 
                                                    type="button"
                                                >
                                                    លុប (Remove)
                                                </button>
                                            </div>
                                            <p className="text-xs text-text-secondary font-khmer">ណែនាំអោយប្រើរូបភាពដែលមានទំហំស្មើគ្នា (Square ratio 1:1)</p>
                                            <input type="file" accept="image/png, image/jpeg, image/svg+xml" ref={fileInputRef} className="hidden" onChange={handleLogoChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-border-light dark:border-border-dark"/>

                            {/* Shop Name */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                <label className="block text-sm font-semibold text-text-primary font-khmer" htmlFor="name">ឈ្មោះហាង (Shop Name)</label>
                                <div className="md:col-span-2">
                                    <input 
                                        className="block w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3 font-khmer" 
                                        id="name" name="name" 
                                        placeholder="បញ្ចូលឈ្មោះហាងរបស់អ្នក (Enter shop name)" type="text" 
                                        value={formData.name} onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                <label className="block text-sm font-semibold text-text-primary font-khmer" htmlFor="phone">លេខទូរស័ព្ទ (Phone Number)</label>
                                <div className="md:col-span-2">
                                    <input 
                                        className="block w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3" 
                                        id="phone" name="phone" 
                                        placeholder="012 345 678" type="tel" 
                                        value={formData.phone} onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                <label className="block text-sm font-semibold text-text-primary font-khmer" htmlFor="email">អ៊ីមែល (Email)</label>
                                <div className="md:col-span-2">
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="material-symbols-outlined text-gray-400 text-[20px]">mail</span>
                                        </div>
                                        <input 
                                            className="block w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark pl-10 focus:border-primary focus:ring-primary sm:text-sm py-2.5" 
                                            id="email" name="email" 
                                            placeholder="contact@shop.com" type="email" 
                                            value={formData.email} onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                <label className="block text-sm font-semibold text-text-primary mt-2 font-khmer" htmlFor="address">អាសយដ្ឋាន (Address)</label>
                                <div className="md:col-span-2">
                                    <textarea 
                                        className="block w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3 font-khmer" 
                                        id="address" name="address" 
                                        placeholder="ផ្ទះលេខ... ផ្លូវ... សង្កាត់..." rows={3}
                                        value={formData.address} onChange={handleChange}
                                    ></textarea>
                                    <p className="mt-2 text-xs text-text-secondary font-khmer">អាសយដ្ឋាននេះនឹងបង្ហាញនៅលើវិក្កយបត្ររបស់អតិថិជន។</p>
                                </div>
                            </div>

                            {/* Operating Hours */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                <label className="block text-sm font-semibold text-text-primary font-khmer" htmlFor="operatingHours">ម៉ោងបើកហាង (Operating Hours)</label>
                                <div className="md:col-span-2">
                                    <input 
                                        className="block w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3 font-khmer" 
                                        id="operatingHours" 
                                        placeholder="ឧ. 8:00 AM - 9:00 PM" 
                                        type="text" 
                                        value={operatingHours} 
                                        onChange={(e) => setOperatingHours(e.target.value)}
                                    />
                                </div>
                            </div>

                            <hr className="border-border-light dark:border-border-dark"/>

                            {/* Timezone */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-text-primary font-khmer">តំបន់ពេលវេលា (Timezone)</label>
                                </div>
                                <div className="md:col-span-2">
                                    <select 
                                        className="block w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3" 
                                        id="timezone" name="timezone"
                                        value={formData.timezone} onChange={handleChange}
                                    >
                                        <option>(GMT+07:00) Phnom Penh</option>
                                        <option>(GMT+07:00) Bangkok</option>
                                        <option>(GMT+07:00) Jakarta</option>
                                    </select>
                                </div>
                            </div>

                            <hr className="border-border-light dark:border-border-dark"/>

                            {/* Telegram Bot Token */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-text-primary font-khmer">Telegram Bot Token</label>
                                    <p className="text-xs text-text-secondary mt-1 font-khmer">សម្រាប់ផ្ញើលម្អាតដែលបង្ហាញលម្អាត (For sending order notifications)</p>
                                </div>
                                <div className="md:col-span-2">
                                    <input 
                                        className="block w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3 font-mono text-xs" 
                                        id="telegramToken" name="telegramToken" 
                                        placeholder="ឧ. 123456:ABC-DEF..." type="password" 
                                        value={formData.telegramToken || ''} onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Telegram Chat ID */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-text-primary font-khmer">Telegram Chat ID</label>
                                    <p className="text-xs text-text-secondary mt-1 font-khmer">លេខសម្គាល់ច្រក (Recipient chat ID)</p>
                                </div>
                                <div className="md:col-span-2">
                                    <input 
                                        className="block w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3 font-mono text-xs" 
                                        id="telegramChatId" name="telegramChatId" 
                                        placeholder="ឧ. -1234567890123" type="text" 
                                        value={formData.telegramChatId || ''} onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30 rounded-lg p-6 mt-8 mb-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-[28px]">smart_toy</span>
                                    <h3 className="text-lg font-bold text-text-primary font-khmer">ភ្នាក់ងារ AI (AI Assistant Bot)</h3>
                                </div>
                                <p className="text-sm text-text-secondary mb-6 font-khmer">
                                    បញ្ចូល Token របស់ Bot ថ្មីមួយទៀត សម្រាប់ឲ្យអ្នកបញ្ជាការងារ AI (បង្កើត Order, សួររបាយការណ៍) ផ្ទាល់តាមរយៈ Telegram។
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-text-primary font-khmer">AI Bot Token</label>
                                    </div>
                                    <div className="md:col-span-2">
                                        <input 
                                            className="block w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3 font-mono text-xs" 
                                            id="aiTelegramToken" name="aiTelegramToken" 
                                            placeholder="ឧ. 987654:XYZ-UVW..." type="password" 
                                            value={(formData as any).aiTelegramToken || ''} onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-border-light dark:border-border-dark"/>

                            {/* Bakong Payment Settings Section */}
                            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-lg p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[28px]">payment</span>
                                    <h3 className="text-lg font-bold text-text-primary font-khmer">ការទូទាត់ប្រាក់ (Payment Settings - KHQR)</h3>
                                </div>
                                <p className="text-sm text-text-secondary mb-6 font-khmer">
                                    កំណត់ព័ត៌មាននៃគណនី Bakong របស់អ្នក ដើម្បីបង្កើតលេខកូដ QR ថាមវន្តសម្រាប់ការទូទាត់ (Configure your Bakong account to generate dynamic KHQR payment codes)
                                </p>

                                {/* Bakong Account ID */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-6">
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-text-primary font-khmer">Bakong Account ID</label>
                                        <p className="text-xs text-text-secondary mt-1 font-khmer">ឧ. sokpos@acleda ឬ 012345678@aba</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <input 
                                            className="block w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3" 
                                            id="bakongAccountId" name="bakongAccountId"
                                            placeholder="sokbiz@acleda ឬ 012345678@aba" type="text"
                                            value={formData.bakongAccountId || ''} onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Bank Account Name */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-text-primary font-khmer">ឈ្មោះគណនី (Account Name)</label>
                                        <p className="text-xs text-text-secondary mt-1 font-khmer">ឯកសារឈ្មោះអាចបង្ហាញលើលេខកូដ QR</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <input 
                                            className="block w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3" 
                                            id="bankAccountName" name="bankAccountName"
                                            placeholder="SokBiz" type="text"
                                            value={formData.bankAccountName || ''} onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Footer */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 rounded-b-xl border-t border-border-light dark:border-border-dark flex items-center justify-between">
                            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full text-xs font-medium border border-yellow-200 dark:border-yellow-900/30">
                                <span className="material-symbols-outlined text-[16px] filled">info</span>
                                <span className="font-khmer">ការផ្លាស់ប្តូរខ្លះអាចត្រូវការពេលបន្តិចដើម្បីដំណើរការ</span>
                            </div>
                            <div className="text-xs text-text-secondary font-khmer">
                                បានកែប្រែចុងក្រោយ: ថ្ងៃនេះ ម៉ោង 10:30 ព្រឹក
                            </div>
                        </div>
                    </div>

                    {/* Shipping Zones & Delivery Fees Section */}
                    <div className="mt-12 pt-8 border-t border-border-light dark:border-border-dark">
                        <ShippingSettings />
                    </div>

                    {/* Branch Management Section */}
                    <div className="mt-12 pt-8 border-t border-border-light dark:border-border-dark">
                        <h2 className="text-xl font-semibold mb-4 text-text-primary font-khmer">សាខា (Branch Management)</h2>
                        
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 md:p-8">
                            {/* Add Branch */}
                            <div className="flex gap-3 mb-6">
                                <input 
                                    type="text" 
                                    value={newBranchName}
                                    onChange={(e) => setNewBranchName(e.target.value)}
                                    placeholder="ឈ្មោះសាខាថ្មី (New Branch Name)"
                                    className="flex-1 block w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-3 font-khmer"
                                />
                                <button 
                                    onClick={handleAddBranch}
                                    className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors text-sm font-medium shadow-sm flex items-center gap-2 font-khmer whitespace-nowrap"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                    បន្ថែម (Add)
                                </button>
                            </div>

                            {/* Branch List */}
                            <div className="space-y-3">
                                {((formData as any).branches || []).map((branch: Branch) => (
                                    <div key={branch.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-border-light dark:border-border-dark group">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary shrink-0">
                                                <span className="material-symbols-outlined">store</span>
                                            </div>
                                            <div className="flex-1">
                                                <input 
                                                    type="text"
                                                    value={branch.name}
                                                    onChange={(e) => handleUpdateBranch(branch.id, e.target.value)}
                                                    className="bg-transparent border-none focus:ring-0 p-0 font-medium text-text-primary font-khmer w-full"
                                                />
                                                <p className="text-xs text-text-secondary">ID: {branch.id}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteBranch(branch.id)}
                                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete Branch"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                ))}
                                {(!((formData as any).branches) || (formData as any).branches.length === 0) && (
                                    <div className="text-center py-8 border-2 border-dashed border-border-light dark:border-border-dark rounded-lg">
                                        <p className="text-text-secondary font-khmer">មិនទាន់មានសាខាទេ។ (No branches yet)</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    </>
                    )}

                    {/* Currency & Tax Tab Placeholder */}
                    {activeTab === 'currency' && (
                    <div className="p-10 text-center text-text-secondary font-khmer">
                        ការកំណត់រូបិយប័ណ្ណ និងពន្ធ នឹងមាននៅទីនេះ (Currency & Tax Settings Coming Soon)
                    </div>
                    )}

                    {/* Receipt Tab Placeholder */}
                    {activeTab === 'receipt' && (
                    <div className="p-10 text-center text-text-secondary font-khmer">
                        ការកំណត់វិក្កយបត្រ នឹងមាននៅទីនេះ (Receipt Settings Coming Soon)
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopSettings;