import React from 'react';

interface EmptyStateProps {
    title: string;
    subtitle: string;
    icon?: string;
    actionLabel?: string;
    onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
    title, 
    subtitle, 
    icon = 'inbox', 
    actionLabel, 
    onAction 
}) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 w-full max-w-7xl mx-auto h-full min-h-[400px]">
            <div className="w-full max-w-2xl flex flex-col items-center justify-center text-center animate-fade-in-up">
                {/* Illustration Wrapper */}
                <div className="relative w-full max-w-[300px] aspect-square mb-8 flex items-center justify-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl opacity-60"></div>
                    {/* Placeholder Icon Graphic if no image provided */}
                    <span className="material-symbols-outlined text-[120px] text-slate-300 dark:text-slate-600">{icon}</span>
                </div>
                
                <div className="space-y-4 max-w-lg mx-auto">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-khmer">
                        {title}
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-khmer">
                        {subtitle}
                    </p>
                </div>

                {actionLabel && onAction && (
                    <div className="mt-10">
                        <button 
                            onClick={onAction}
                            className="group flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-lg shadow-lg shadow-blue-500/20 transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">add</span>
                            <span className="font-bold text-base font-khmer">{actionLabel}</span>
                        </button>
                    </div>
                )}
                
                {actionLabel && !onAction && (
                     <div className="mt-10 flex gap-4">
                        <button className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-8 py-3 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[20px]">help</span>
                            <span className="font-medium text-base font-khmer">របៀបប្រើប្រាស់</span>
                        </button>
                     </div>
                )}
            </div>
        </div>
    );
};

export default EmptyState;