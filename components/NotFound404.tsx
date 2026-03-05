import React from 'react';
import { useData } from '../context/DataContext';

const NotFound404: React.FC = () => {
    const { setCurrentView } = useData();

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col text-slate-900 dark:text-white overflow-x-hidden selection:bg-primary selection:text-white font-display">
            <header className="flex items-center justify-between border-b border-gray-200 dark:border-[#233648] px-6 py-4 bg-white dark:bg-[#111a22] z-10">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-primary/20 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-xl">receipt_long</span>
                    </div>
                    <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">SokBiz KH</h2>
                </div>
                <div className="flex items-center gap-4">
                    <a className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors font-khmer" href="#">ជំនួយ (Help)</a>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center relative w-full px-4 py-12 md:py-20">
                <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none"></div>
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col items-center max-w-2xl w-full text-center">
                    <div className="relative mb-8 group">
                        <h1 className="relative text-[10rem] md:text-[14rem] font-black leading-none text-primary/20 select-none tracking-tighter">
                            ៤០៤
                        </h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                             <span className="text-6xl md:text-8xl font-bold text-primary">404</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-6 animate-fade-in-up">
                        <div className="space-y-3 max-w-lg">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight font-khmer">
                                សុំទោស! យើងរកមិនឃើញទំព័រដែលអ្នកកំពុងស្វែងរកទេ។
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg font-khmer">
                                ទំព័រដែលអ្នកកំពុងស្វែងរកអាចត្រូវបានលុប មានការប្តូរឈ្មោះ ឬមិនអាចប្រើប្រាស់បានជាបណ្តោះអាសន្ន។
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
                            <button onClick={() => setCurrentView('dashboard')} className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-8 bg-primary hover:bg-primary-hover text-white text-base font-bold rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 transform hover:-translate-y-0.5 font-khmer">
                                <span className="material-symbols-outlined">home</span>
                                <span>ត្រឡប់ទៅទំព័រដើម</span>
                            </button>
                            <button className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-8 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-[#233648] text-base font-medium rounded-xl transition-colors duration-200 font-khmer">
                                <span className="material-symbols-outlined">arrow_back</span>
                                <span>ត្រឡប់ក្រោយ</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            
            <footer className="py-6 text-center border-t border-gray-200 dark:border-[#233648] bg-white dark:bg-[#111a22] z-10">
                <p className="text-sm text-slate-500 dark:text-slate-500 font-khmer">
                    © 2024 SokBiz KH. រក្សាសិទ្ធិគ្រប់យ៉ាង។
                </p>
            </footer>
        </div>
    );
};

export default NotFound404;