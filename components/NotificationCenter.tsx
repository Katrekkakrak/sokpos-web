import React, { useState } from 'react';
import { useData, NotificationItem } from '../context/DataContext';

const NotificationCenter: React.FC = () => {
    const { notifications, markAllNotificationsRead, setCurrentView } = useData();
    const [filter, setFilter] = useState<'All' | 'Unread'>('All');

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'Unread') return !n.read;
        return true;
    });

    const grouped = filteredNotifications.reduce((acc, curr) => {
        const cat = curr.dateCategory;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(curr);
        return acc;
    }, {} as Record<string, NotificationItem[]>);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="bg-background-dark text-white min-h-screen flex flex-col font-display">
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-dark px-10 py-3 bg-[#111a22] sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 text-white cursor-pointer" onClick={() => setCurrentView('dashboard')}>
                        <div className="size-8 text-primary"><span className="material-symbols-outlined !text-[32px]">dataset</span></div>
                        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">SokBiz KH</h2>
                    </div>
                </div>
                <div className="flex flex-1 justify-end gap-6 items-center">
                    <button className="text-white hover:text-primary transition-colors relative">
                        <span className="material-symbols-outlined">notifications</span>
                        {unreadCount > 0 && <span className="absolute top-0 right-0 size-2.5 bg-danger rounded-full border-2 border-[#111a22]"></span>}
                    </button>
                </div>
            </header>

            <main className="flex-1 flex justify-center py-8 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-3xl flex flex-col gap-6">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-dark">
                        <div>
                            <h1 className="text-white text-3xl font-bold leading-tight tracking-tight font-khmer">ការជូនដំណឹង (Notifications)</h1>
                            <p className="text-text-secondary text-sm mt-1 font-khmer">មើលការដាស់តឿនប្រព័ន្ធ និងបច្ចុប្បន្នភាពចុងក្រោយរបស់អ្នក</p>
                        </div>
                        <button onClick={markAllNotificationsRead} className="group flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-surface-dark hover:bg-border-dark text-primary hover:text-white text-sm font-bold transition-all border border-border-dark">
                            <span className="material-symbols-outlined text-[20px]">done_all</span>
                            <span className="truncate font-khmer">សម្គាល់ថាអានរួចទាំងអស់</span>
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button onClick={() => setFilter('All')} className={`px-4 py-2 rounded-full border text-sm font-bold font-khmer whitespace-nowrap transition-colors ${filter === 'All' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-dark text-text-secondary border-border-dark hover:text-white'}`}>
                            ទាំងអស់ <span className="ml-1 opacity-70">({notifications.length})</span>
                        </button>
                        <button onClick={() => setFilter('Unread')} className={`px-4 py-2 rounded-full border text-sm font-bold font-khmer whitespace-nowrap transition-colors ${filter === 'Unread' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-dark text-text-secondary border-border-dark hover:text-white'}`}>
                            មិនទាន់អាន <span className="ml-1 opacity-70">({unreadCount})</span>
                        </button>
                    </div>

                    {/* List */}
                    <div className="flex flex-col gap-3">
                        {Object.entries(grouped).map(([category, items]) => (
                            <div key={category} className="flex flex-col gap-3">
                                <div className="flex items-center gap-4 py-2 mt-2">
                                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider font-khmer">
                                        {category === 'Today' ? 'ថ្ងៃនេះ' : category === 'Yesterday' ? 'ម្សិលមិញ' : category}
                                    </span>
                                    <div className="h-px bg-border-dark flex-1"></div>
                                </div>
                                {(items as any[]).map((note: any) => (
                                    <div key={note.id} className={`group relative flex gap-4 p-4 rounded-xl border-l-4 border-y border-r border-y-border-dark border-r-border-dark hover:bg-[#202e3b] transition-all cursor-pointer shadow-sm ${note.read ? 'bg-surface-dark/50 border-l-border-dark opacity-80' : 'bg-surface-dark border-l-primary'}`}>
                                        <div className="shrink-0 pt-1">
                                            <div className={`flex items-center justify-center rounded-full size-10 ${
                                                note.type === 'warning' ? 'bg-warning/10 text-warning' : 
                                                note.type === 'success' ? 'bg-success/10 text-success' : 
                                                note.type === 'alert' ? 'bg-danger/10 text-danger' : 
                                                'bg-primary/10 text-primary'
                                            }`}>
                                                <span className="material-symbols-outlined">
                                                    {note.type === 'warning' ? 'warning' : 
                                                     note.type === 'success' ? 'check_circle' : 
                                                     note.type === 'alert' ? 'error' : 'info'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-1 flex-col gap-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className={`text-base font-bold font-khmer pr-8 ${note.read ? 'text-gray-400' : 'text-white'}`}>{note.title}</h3>
                                                {!note.read && <span className="size-2 rounded-full bg-primary shrink-0 mt-2"></span>}
                                            </div>
                                            <p className="text-text-secondary text-sm font-khmer leading-relaxed">{note.message}</p>
                                            <p className="text-text-secondary text-xs mt-1 font-medium">{note.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                        {filteredNotifications.length === 0 && (
                            <div className="py-12 text-center text-text-secondary">No notifications found.</div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NotificationCenter;