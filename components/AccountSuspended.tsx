import React from 'react';
import { useData } from '../context/DataContext';

const AccountSuspended: React.FC = () => {
    const { logout, renewSubscription } = useData();

    return (
        <div className="bg-background-light dark:bg-[#221010] text-slate-900 dark:text-white min-h-screen flex flex-col font-display antialiased overflow-hidden selection:bg-red-500 selection:text-white">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-red-500/10 blur-[120px]"></div>
                <div className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-red-500/5 blur-[100px]"></div>
            </div>

            <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-md bg-white dark:bg-[#2e1616] border border-gray-200 dark:border-[#4a2525] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
                    <div className="p-8 sm:p-10 flex flex-col items-center text-center">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full scale-150 animate-pulse"></div>
                            <div className="relative w-24 h-24 bg-background-light dark:bg-[#381a1a] rounded-full flex items-center justify-center border-2 border-red-500/20 dark:border-red-500/30 shadow-inner">
                                <span className="material-symbols-outlined text-5xl text-red-500 drop-shadow-sm">lock</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight font-khmer">
                                គណនីត្រូវបានផ្អាក
                            </h1>
                            <div className="space-y-2">
                                <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed font-khmer">
                                    ការជាវរបស់អ្នកបានផុតកំណត់ហើយ។<br/>
                                    សូមធ្វើការបង់ប្រាក់ដើម្បីបន្តប្រើប្រាស់សេវាកម្ម។
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                                    Error Code: SUB_EXP_005
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={() => renewSubscription('Monthly')}
                            className="w-full group relative flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-red-500/25 hover:shadow-red-500/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-[#2e1616] mb-4 font-khmer"
                        >
                            <span className="material-symbols-outlined text-[20px]">credit_card</span>
                            <span className="text-lg">បង់ប្រាក់ឥឡូវនេះ</span>
                        </button>
                        
                        <button onClick={logout} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-sm font-medium transition-colors duration-200 flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 font-khmer">
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            <span>ចាកចេញ</span>
                        </button>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-[#231010] border-t border-gray-100 dark:border-[#4a2525] p-4 text-center">
                        <a className="inline-flex items-center gap-1.5 text-sm text-red-500/80 hover:text-red-500 transition-colors font-khmer" href="#">
                            <span>ត្រូវការជំនួយ? ទាក់ទងមកពួកយើង</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AccountSuspended;