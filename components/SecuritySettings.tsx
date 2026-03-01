import React from 'react';
import { useData } from '../context/DataContext';

const SecuritySettings: React.FC = () => {
    const { userSecurity, toggle2FA, activeSessions, revokeSession, setCurrentView } = useData();

    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-background-dark text-slate-900 dark:text-white font-display">
            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-border-dark bg-background-dark/80 backdrop-blur-md px-6 py-4 flex justify-between items-center lg:hidden">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-1.5 rounded-lg text-primary"><span className="material-symbols-outlined">security</span></div>
                    <h1 className="text-lg font-bold text-white">Security</h1>
                </div>
                <button onClick={() => setCurrentView('dashboard')} className="text-white"><span className="material-symbols-outlined">close</span></button>
            </header>

            <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 lg:p-12">
                <button onClick={() => setCurrentView('shop-settings')} className="hidden lg:flex items-center gap-2 text-slate-400 hover:text-primary mb-6 transition-colors">
                    <span className="material-symbols-outlined text-lg">arrow_back</span> Back to Settings
                </button>

                <div className="mb-10">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 font-khmer">សុវត្ថិភាពគណនី & វគ្គប្រើប្រាស់</h1>
                        <p className="text-slate-400 text-base md:text-lg max-w-2xl">Manage your account security and monitor active sessions across all your devices.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {/* 2FA */}
                        <div className="rounded-xl border border-border-dark bg-surface-dark overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-border-dark">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                            <span className="material-symbols-outlined text-2xl">encrypted</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h2 className="text-xl font-bold text-white font-khmer">ការផ្ទៀងផ្ទាត់ ២ ជំហាន (2FA)</h2>
                                            <p className="text-slate-400 text-sm">Add an extra layer of security to your account.</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                        <input type="checkbox" className="sr-only peer" checked={userSecurity.twoFactorEnabled} onChange={toggle2FA} />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-black/20 flex flex-wrap gap-4 items-center justify-between">
                                <div className={`flex items-center gap-2 text-sm font-medium ${userSecurity.twoFactorEnabled ? 'text-green-400' : 'text-slate-500'}`}>
                                    <span className="material-symbols-outlined text-base">check_circle</span>
                                    <span>{userSecurity.twoFactorEnabled ? 'បានបើកដំណើរការ (Enabled)' : 'មិនដំណើរការ (Disabled)'}</span>
                                </div>
                                {userSecurity.twoFactorEnabled && <button className="text-sm font-medium text-primary hover:text-blue-400 transition-colors">កំណត់រចនាសម្ព័ន្ធ (Configure)</button>}
                            </div>
                        </div>

                        {/* Sessions */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white font-khmer">ឧបករណ៍កំពុងប្រើប្រាស់</h2>
                            </div>
                            <div className="rounded-xl border border-border-dark bg-surface-dark overflow-hidden">
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border-dark bg-black/10 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    <div className="col-span-8 sm:col-span-6">Device & Location</div>
                                    <div className="hidden sm:block sm:col-span-4">Last Active</div>
                                    <div className="col-span-4 sm:col-span-2 text-right">Action</div>
                                </div>
                                {activeSessions.map(session => (
                                    <div key={session.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border-dark/50 items-center hover:bg-white/5 transition-colors">
                                        <div className="col-span-8 sm:col-span-6 flex gap-4 items-center">
                                            <div className="relative">
                                                <div className="h-10 w-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300">
                                                    <span className="material-symbols-outlined">
                                                        {session.device.includes('iPhone') ? 'smartphone' : 'laptop_mac'}
                                                    </span>
                                                </div>
                                                {session.isCurrent && (
                                                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-background-dark flex items-center justify-center">
                                                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-sm font-bold text-white truncate">{session.device}</span>
                                                    {session.isCurrent && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/20">THIS DEVICE</span>}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> {session.location}</span>
                                                    <span className="hidden md:inline">•</span>
                                                    <span className="font-mono text-slate-500">{session.ip}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`hidden sm:block sm:col-span-4 text-sm font-medium ${session.isCurrent ? 'text-green-400' : 'text-slate-400'}`}>
                                            {session.lastActive}
                                        </div>
                                        <div className="col-span-4 sm:col-span-2 flex justify-end">
                                            {!session.isCurrent && (
                                                <button onClick={() => revokeSession(session.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Revoke Access">
                                                    <span className="material-symbols-outlined">delete_forever</span>
                                                </button>
                                            )}
                                            {session.isCurrent && <div className="text-xs text-slate-500 italic px-2">Current</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        {/* Location */}
                        <div className="rounded-xl border border-border-dark bg-surface-dark overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-border-dark">
                                <h3 className="text-base font-bold text-white font-khmer">ទីតាំងបច្ចុប្បន្ន (Current Location)</h3>
                            </div>
                            <div className="relative h-48 w-full bg-slate-800 flex items-center justify-center">
                                <div className="absolute inset-0 bg-black/20"></div>
                                {/* Mock Map */}
                                <div className="flex flex-col items-center z-10">
                                    <div className="relative flex items-center justify-center">
                                        <div className="absolute h-12 w-12 rounded-full bg-primary/30 animate-ping"></div>
                                        <div className="relative h-4 w-4 rounded-full bg-primary shadow-lg border-2 border-white"></div>
                                    </div>
                                    <div className="mt-2 px-3 py-1 bg-surface-dark border border-border-dark rounded shadow-lg">
                                        <span className="text-xs font-bold text-white">Phnom Penh</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-black/10">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">IP Address</span>
                                    <span className="font-mono text-white">192.168.1.24</span>
                                </div>
                                <div className="flex justify-between items-center text-sm mt-2">
                                    <span className="text-slate-400">ISP</span>
                                    <span className="text-white">ISP Cambodia Co.</span>
                                </div>
                            </div>
                        </div>

                        {/* Security Score */}
                        <div className="rounded-xl border border-border-dark bg-gradient-to-br from-surface-dark to-slate-900 overflow-hidden relative p-5 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-white">Security Score</h3>
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/20">GOOD</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-black text-white">85</span>
                                <span className="text-sm text-slate-400 mb-1.5">/ 100</span>
                            </div>
                            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-primary to-green-400 h-full rounded-full" style={{width: '85%'}}></div>
                            </div>
                            <div className="flex flex-col gap-2 mt-2">
                                <div className="flex items-center gap-2 text-xs text-slate-300">
                                    <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                                    <span>Strong Password</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-300">
                                    <span className={`material-symbols-outlined text-sm ${userSecurity.twoFactorEnabled ? 'text-green-400' : 'text-slate-500'}`}>check_circle</span>
                                    <span>2FA Enabled</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-300">
                                    <span className="material-symbols-outlined text-yellow-500 text-sm">warning</span>
                                    <span>Recovery Email not verified</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;