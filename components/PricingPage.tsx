import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const PricingPage: React.FC = () => {
    const { userPlan } = useData();
    const [isYearly, setIsYearly] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('');
    const [selectedPrice, setSelectedPrice] = useState('');

    const handleOpenModal = (planName: string, price: string) => {
        setSelectedPlan(planName);
        setSelectedPrice(price);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-[#f8f6f6] dark:bg-[#221610] h-full max-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-300 custom-scroll overflow-y-auto font-khmer pb-20">
            <main className="py-10 px-4">
                {/* Hero Section */}
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">កញ្ចប់តម្លៃសេវាកម្ម SokBiz</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">ជ្រើសរើសកញ្ចប់ដែលស័ក្តិសមសម្រាប់អាជីវកម្មរបស់អ្នក និងចាប់ផ្តើមរីកចម្រើននៅថ្ងៃនេះ</p>
                    
                    {/* Billing Toggle */}
                    <div className="mt-10 flex items-center justify-center gap-4">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">បង់ប្រចាំខែ</span>
                        <div 
                            onClick={() => setIsYearly(!isYearly)}
                            className="relative flex h-11 w-64 items-center justify-between rounded-full bg-slate-200 dark:bg-slate-800 p-1 cursor-pointer"
                        >
                            <div className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-white dark:bg-slate-700 shadow-sm transition-transform duration-300 ease-in-out ${isYearly ? 'translate-x-[calc(100%+4px)]' : 'translate-x-1'}`}></div>
                            <button className={`relative z-10 w-1/2 text-sm font-semibold transition-colors ${!isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>ប្រចាំខែ</button>
                            <button className={`relative z-10 w-1/2 text-sm font-semibold transition-colors ${isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>ប្រចាំឆ្នាំ</button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">បង់ប្រចាំឆ្នាំ</span>
                            <span className="inline-flex items-center rounded-full bg-[#ec5b13]/10 px-2.5 py-0.5 text-xs font-bold text-[#ec5b13]">
                                🔥 ចំណេញ ២០%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards Grid */}
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* 1. Free Plan */}
                    <div className="flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 hover:border-[#ec5b13]/30 transition-all group">
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">កញ្ចប់ចាប់ផ្តើម</h3>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-bold tracking-tight">$0</span>
                                <span className="ml-1 text-sm font-medium text-slate-500">/{isYearly ? 'ឆ្នាំ' : 'ខែ'}</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-500 italic">សាកល្បងឥតគិតថ្លៃជារៀងរហូត</p>
                        </div>
                        {userPlan === 'free' ? (
                            <button disabled className="mb-8 w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 py-2.5 text-sm font-bold text-slate-400 cursor-not-allowed transition-colors">
                                កំពុងប្រើប្រាស់
                            </button>
                        ) : (
                            <button onClick={() => handleOpenModal('កញ្ចប់ចាប់ផ្តើម (Free)', '$0')} className="mb-8 w-full rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity">
                                ជ្រើសរើសយក
                            </button>
                        )}
                        <ul className="space-y-4 flex-1">
                            <li className="flex items-center gap-3 text-sm"><span className="material-icons-outlined text-green-500 text-lg">check_circle</span>១០០ វិក្កយបត្រ / ខែ</li>
                            <li className="flex items-center gap-3 text-sm"><span className="material-icons-outlined text-green-500 text-lg">check_circle</span>៥០ មុខទំនិញ</li>
                            <li className="flex items-center gap-3 text-sm"><span className="material-icons-outlined text-green-500 text-lg">check_circle</span>បុគ្គលិក ១ នាក់</li>
                            <li className="flex items-center gap-3 text-sm"><span className="material-icons-outlined text-green-500 text-lg">check_circle</span>មើល Dashboard ទូទៅ</li>
                            <li className="flex items-center gap-3 text-sm opacity-40"><span className="material-icons-outlined text-lg">cancel</span>គ្មានជំនួយការ AI</li>
                            <li className="flex items-center gap-3 text-sm opacity-40"><span className="material-icons-outlined text-lg">cancel</span>គ្មានប្រអប់សាររួម</li>
                            <li className="flex items-center gap-3 text-sm opacity-40"><span className="material-icons-outlined text-lg">info</span>វិក្កយបត្រជាប់ Logo SokBiz</li>
                        </ul>
                    </div>

                    {/* 2. Standard Plan */}
                    <div className="flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-[#ec5b13]/30 transition-all">
                        <div className="mb-8 text-center md:text-left">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">កញ្ចប់ស្តង់ដារ</h3>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-bold tracking-tight">${isYearly ? '150' : '15'}</span>
                                <span className="ml-1 text-sm font-medium text-slate-500">/{isYearly ? 'ឆ្នាំ' : 'ខែ'}</span>
                            </div>
                            <p className="mt-2 text-sm text-[#ec5b13] font-medium">{isYearly ? 'ចំណេញ $30 ភ្លាមៗ' : 'ពេញនិយមសម្រាប់ហាងទូទៅ'}</p>
                        </div>
                        {userPlan === 'standard' ? (
                            <button disabled className="mb-8 w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 py-2.5 text-sm font-bold text-slate-400 cursor-not-allowed transition-colors">
                                កំពុងប្រើប្រាស់
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleOpenModal('កញ្ចប់ស្តង់ដារ (Standard)', isYearly ? '$150' : '$15')}
                                className="mb-8 w-full rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity"
                            >
                                ជ្រើសរើសយក
                            </button>
                        )}
                        <ul className="space-y-4 flex-1">
                            <li className="flex items-center gap-3 text-sm"><span className="material-icons-outlined text-[#ec5b13] text-lg">check_circle</span>ទំនិញ/វិក្កយបត្រ មិនកំណត់</li>
                            <li className="flex items-center gap-3 text-sm"><span className="material-icons-outlined text-[#ec5b13] text-lg">check_circle</span>បុគ្គលិក ៥ នាក់</li>
                            <li className="flex items-center gap-3 text-sm"><span className="material-icons-outlined text-[#ec5b13] text-lg">check_circle</span>របាយការណ៍ចំណេញ-ខាត (P&L)</li>
                            <li className="flex items-center gap-3 text-sm"><span className="material-icons-outlined text-[#ec5b13] text-lg">check_circle</span>គ្រប់គ្រងស្តុកកម្រិតខ្ពស់</li>
                            <li className="flex items-center gap-3 text-sm"><span className="material-icons-outlined text-[#ec5b13] text-lg">qr_code_scanner</span>បង្កើតកូដ KHQR ទូទាត់ប្រាក់</li>
                            <li className="flex items-center gap-3 text-sm"><span className="material-icons-outlined text-[#ec5b13] text-lg">check_circle</span>គ្មាន Logo SokBiz លើវិក្កយបត្រ</li>
                            <li className="flex items-center gap-3 text-sm"><span className="material-icons-outlined text-[#ec5b13] text-lg">smart_toy</span>AI Assistant (១០ដង/ថ្ងៃ)</li>
                            <li className="flex items-center gap-3 text-sm opacity-40"><span className="material-icons-outlined text-lg">cancel</span>គ្មានប្រអប់សាររួម</li>
                        </ul>
                    </div>

                    {/* 3. Pro Plan */}
                    <div className="relative flex flex-col rounded-3xl bg-gradient-to-br from-[#ec5b13] to-[#ff8c52] p-8 text-white shadow-2xl shadow-[#ec5b13]/30 transform md:-translate-y-4">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1 text-xs font-bold text-[#ec5b13] uppercase tracking-widest">
                            ពេញនិយមបំផុត
                        </div>
                        <div className="mb-8">
                            <h3 className="text-lg font-bold">កញ្ចប់អាជីព</h3>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-bold tracking-tight">${isYearly ? '290' : '29'}</span>
                                <span className="ml-1 text-sm font-medium text-orange-100">/{isYearly ? 'ឆ្នាំ' : 'ខែ'}</span>
                            </div>
                            <p className="mt-2 text-sm text-orange-50 font-medium">ល្អបំផុតសម្រាប់អាជីវកម្មធំៗ</p>
                        </div>
                        {userPlan === 'pro' ? (
                            <button disabled className="mb-8 w-full rounded-xl border-2 border-white/40 bg-white/10 py-2.5 text-sm font-bold text-white/80 cursor-not-allowed transition-colors">
                                កំពុងប្រើប្រាស់
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleOpenModal('កញ្ចប់អាជីព (Pro)', isYearly ? '$290' : '$29')}
                                className="mb-8 w-full rounded-xl bg-white text-[#ec5b13] py-2.5 text-sm font-bold hover:bg-orange-50 transition-colors shadow-lg shadow-black/10"
                            >
                                ជាវកញ្ចប់នេះ
                            </button>
                        )}
                        <ul className="space-y-4 flex-1">
                            <li className="flex items-center gap-3 text-sm font-medium"><span className="material-icons-outlined text-white text-lg">verified</span>អ្វីៗដែលមានក្នុង Standard</li>
                            <li className="flex items-center gap-3 text-sm font-medium"><span className="material-icons-outlined text-white text-lg">groups</span>បុគ្គលិក/សាខា មិនកំណត់</li>
                            <li className="flex items-center gap-3 text-sm font-medium"><span className="material-icons-outlined text-white text-lg">smart_toy</span>Sok AI ប្រើមិនកំណត់កម្រិត Pro</li>
                            <li className="flex items-center gap-3 text-sm font-medium"><span className="material-icons-outlined text-white text-lg">forum</span>Omnichannel (FB/Tele/IG)</li>
                            <li className="flex items-center gap-3 text-sm font-medium"><span className="material-icons-outlined text-white text-lg">loyalty</span>Advanced CRM & Loyalty Point</li>
                            <li className="flex items-center gap-3 text-sm font-medium"><span className="material-icons-outlined text-white text-lg">pie_chart</span>របាយការណ៍វិភាគស៊ីជម្រៅ</li>
                            <li className="flex items-center gap-3 text-sm font-medium"><span className="material-icons-outlined text-white text-lg">api</span>ភ្ជាប់ជាមួយប្រព័ន្ធដទៃ (API)</li>
                            <li className="flex items-center gap-3 text-sm font-medium"><span className="material-icons-outlined text-white text-lg">support_agent</span>ជំនួយបច្ចេកទេស VIP ២៤/៧</li>
                        </ul>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-5xl mx-auto mt-24">
                    <h2 className="text-3xl font-bold text-center mb-12">សំណួរដែលសួរញឹកញាប់</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <h4 className="font-bold text-lg mb-3">តើខ្ញុំអាចផ្លាស់ប្តូរកញ្ចប់បានទេ?</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">អ្នកអាចធ្វើការតម្លើង ឬបន្ថយកញ្ចប់តម្លៃបានគ្រប់ពេលវេលាពីផ្ទាំង Dashboard របស់អ្នក។</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <h4 className="font-bold text-lg mb-3">តើទិន្នន័យរបស់ខ្ញុំមានសុវត្ថិភាពទេ?</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">ទិន្នន័យរបស់អ្នកត្រូវបានរក្សាទុកក្នុង Cloud Server ដែលមានសុវត្ថិភាពបំផុត និងការចម្លងទុកជានិច្ច។</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <h4 className="font-bold text-lg mb-3">តើមានការបណ្តុះបណ្តាលដែរឬទេ?</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">យើងមានវីដេអូបង្រៀន និងក្រុមការងារជំនួយដែលនឹងជួយអ្នកក្នុងការដំឡើង និងប្រើប្រាស់ដំបូង។</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <h4 className="font-bold text-lg mb-3">តើមុខងារ AI របស់ SokBiz ប្រើប្រាស់ ChatGPT ដែរឬទេ?</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">ទេ! ដើម្បីធានាបាននូវឯកជនភាពទិន្នន័យអាជីវកម្មរបស់អ្នក ១០០% យើងមិនប្រើប្រាស់ ChatGPT ឡើយ។ SokBiz AI ដំណើរការដោយបច្ចេកវិទ្យាសុវត្ថិភាពកម្រិតកំពូលពី <strong>Claude Code</strong> និង <strong>Google Gemini</strong> ដែលធានាដាច់ខាតថារាល់ទិន្នន័យអាជីវកម្មរបស់អ្នក នឹងមិនត្រូវបានយកទៅហ្វឹកហាត់ (Train) បន្តនោះទេ។</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Payment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white/95 dark:bg-slate-900/95 shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                            <span className="material-icons-outlined">close</span>
                        </button>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#ec5b13]/10 text-[#ec5b13] mb-6">
                                <span className="material-icons-outlined text-4xl">payments</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">ទូទាត់ប្រាក់តាមរយៈ KHQR</h3>
                            <p className="text-sm text-slate-500 mb-6">អ្នកជ្រើសរើស <strong>{selectedPlan}</strong> ក្នុងតម្លៃ <strong className="text-[#ec5b13]">{selectedPrice}</strong></p>
                            
                            <div className="relative mx-auto w-48 h-48 bg-white rounded-3xl p-2 shadow-inner border border-slate-200 mb-8 flex items-center justify-center overflow-hidden">
    <img src="/khqr.jpg" alt="KHQR Payment" className="w-full h-full object-contain rounded-2xl" />
</div>
                            
                            <div className="space-y-3 mb-8 text-left bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">ឈ្មោះគណនី:</span>
                                    <span className="font-bold">Borann Rottanakk</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">លេខគណនី ABA:</span>
                                    <span className="font-bold tracking-widest">001 297 598</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                <a 
                                    href="https://t.me/Xx_Future" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-[#0088cc] text-white font-bold hover:opacity-90 transition-all"
                                >
                                    <span className="material-icons-outlined">send</span>
                                    ផ្ញើវិក្កយបត្រទៅ Telegram
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PricingPage;