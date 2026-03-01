import React from 'react';
import { useData } from '../context/DataContext';

const ActivityHistory: React.FC = () => {
    const { selectedContact } = useData();

    if (!selectedContact) return null;

    // Helper to format timestamp
    const timeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " mins ago";
        return "Just now";
    };

    return (
        <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-2 bottom-6 w-0.5 bg-neutral-border/60 dark:bg-slate-700/60"></div>
            
            <div className="flex flex-col gap-8">
                {selectedContact.activities && selectedContact.activities.length > 0 ? (
                    selectedContact.activities.map((activity) => (
                        <div key={activity.id} className="relative pl-16 group">
                            {/* Icon Node */}
                            <div className={`absolute left-0 top-0 w-12 h-12 rounded-full border-2 flex items-center justify-center z-10 shadow-sm
                                ${activity.type === 'call' ? 'bg-white dark:bg-slate-800 border-primary text-primary' : ''}
                                ${activity.type === 'chat' ? 'bg-white dark:bg-slate-800 border-indigo-400 text-indigo-500' : ''}
                                ${activity.type === 'note' ? 'bg-white dark:bg-slate-800 border-amber-400 text-amber-500' : ''}
                                ${activity.type === 'system' ? 'bg-neutral-100 dark:bg-slate-700 border-neutral-300 text-neutral-500' : ''}
                            `}>
                                <span className="material-symbols-outlined text-xl">
                                    {activity.type === 'call' && 'call'}
                                    {activity.type === 'chat' && 'forum'}
                                    {activity.type === 'note' && 'sticky_note_2'}
                                    {activity.type === 'system' && 'info'}
                                </span>
                            </div>
                            
                            {/* Card Content */}
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-wrap items-baseline gap-2">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{activity.title}</h4>
                                    <span className="ml-auto text-xs font-medium text-slate-500 whitespace-nowrap">{timeAgo(new Date(activity.timestamp))}</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50 mt-1">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {activity.description}
                                    </p>
                                    {activity.type === 'chat' && (
                                        <div className="mt-3 flex items-center gap-3">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-xs text-primary hover:text-blue-700 cursor-pointer transition-colors">
                                                <span className="material-symbols-outlined text-sm">description</span>
                                                attachment
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="pl-16 text-slate-500 text-sm">No activity recorded yet.</div>
                )}
            </div>
            
            {/* End of line dot */}
            <div className="absolute left-[27px] bottom-0 w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full transform -translate-x-1/2"></div>
        </div>
    );
};

export default ActivityHistory;