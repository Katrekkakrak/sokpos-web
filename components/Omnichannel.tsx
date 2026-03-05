import React from 'react';
import { useData } from '../context/DataContext';

const Omnichannel: React.FC = () => {
    const { hasAccessToFeature, setCurrentView } = useData();
    const canAccess = hasAccessToFeature('omnichannel');
    
    // អថេរប្រាប់ថាមុខងារនេះធ្វើរួចឬនៅ? (ដាក់ false សិន ព្រោះកំពុងសាងសង់)
    const isFeatureReady = false; 

    return (
        <div className="relative flex flex-col h-[calc(100vh-100px)] w-full overflow-hidden bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
      
            {/* BACKGROUND LAYER (Fake UI - ត្រូវព្រាលជានិច្ច ព្រោះវាមិនទាន់ដើរពិតប្រាកដ) */}
            <div className="flex-1 h-full w-full filter blur-md pointer-events-none select-none opacity-60 transition-all duration-500">
                <div className="flex h-full w-full">
                    {/* Fake Sidebar */}
                    <div className="w-[30%] min-w-[250px] bg-white dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800 p-4 space-y-4">
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4 mb-6"></div>
                        <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                        <div className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-xl"></div>
                        <div className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-xl"></div>
                    </div>
                    {/* Fake Chat Area */}
                    <div className="w-[70%] flex flex-col bg-slate-50 dark:bg-slate-900/50">
                        <div className="h-16 bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center p-4 shadow-sm z-10">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                            <div className="ml-3 h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                            <div className="flex justify-start">
                                <div className="h-16 w-48 bg-slate-200 dark:bg-slate-700 rounded-2xl rounded-tl-sm"></div>
                            </div>
                            <div className="flex justify-end">
                                <div className="h-20 w-64 bg-blue-500/20 dark:bg-blue-600/30 rounded-2xl rounded-tr-sm"></div>
                            </div>
                        </div>
                        <div className="h-20 bg-white dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 p-4">
                             <div className="h-full w-full bg-slate-100 dark:bg-slate-700 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FOREGROUND OVERLAY (ឆ្លាតវៃ - ដឹងថាគួរលោតផ្ទាំងអី) */}
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-slate-900/20 dark:bg-slate-900/50 backdrop-blur-sm">
                
                {/* ស្ថានភាពទី ១៖ អ្នកប្រើ Free/Standard ត្រូវលោត Paywall ទាមទារលុយ */}
                {!canAccess ? (
                    <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-3xl p-8 md:p-10 max-w-md w-full text-center border border-white/20 dark:border-slate-700 mx-4 transform transition-all">
                        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg mb-6">
                            <span className="material-icons-outlined text-4xl text-white">lock</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-khmer mb-3">
                            មុខងារកម្រិត Pro (Locked)
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-khmer leading-relaxed mb-8">
                            មុខងារប្រអប់សាររួម (Omnichannel) គឺសម្រាប់តែអតិថិជនកញ្ចប់អាជីព (Pro) ប៉ុណ្ណោះ។
                        </p>
                        <button 
                            onClick={() => setCurrentView('pricing')}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition hover:-translate-y-1 font-khmer flex items-center justify-center gap-2"
                        >
                            <span className="material-icons-outlined">diamond</span>
                            ដំឡើងកញ្ចប់ (Upgrade)
                        </button>
                    </div>
                ) : (
                    
                /* ស្ថានភាពទី ២៖ អ្នកប្រើ Pro ចូលមក ឃើញផ្ទាំង Coming Soon (VIP) */
                    <div className="bg-white/90 dark:bg-slate-800/90 shadow-2xl rounded-3xl p-8 md:p-10 max-w-md w-full text-center border border-blue-500/30 dark:border-blue-500/30 mx-4 transform transition-all">
                        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg mb-6 animate-pulse">
                            <span className="material-icons-outlined text-4xl text-white">rocket_launch</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-khmer mb-3">
                            កំពុងរៀបចំជូនអតិថិជន VIP
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-khmer leading-relaxed mb-2">
                            អរគុណសម្រាប់ការប្រើប្រាស់កញ្ចប់ <strong className="text-blue-600 dark:text-blue-400">Pro!</strong> 🎉
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 font-khmer leading-relaxed text-sm">
                            យើងខ្ញុំកំពុងតែភ្ជាប់ប្រព័ន្ធ Facebook, Telegram, និង Instagram ចូលគ្នា។ មុខងារដ៏អស្ចារ្យនេះនឹងរួចរាល់ក្នុងពេលឆាប់ៗនេះ!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Omnichannel;