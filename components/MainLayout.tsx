import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Sidebar from './Sidebar';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const { 
        user, 
        currentView, 
        setCurrentView, 
        onlineOrders, 
        setIsSidebarOpen 
    } = useData();
    
    // --- Header State (Moved from Dashboard) ---
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });

    // Toggle Dark Mode
    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Stats for notifications (Red Dot)
    const stats = useMemo(() => {
        const pendingOnline = onlineOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
        return { pendingOnline };
    }, [onlineOrders]);

    // POS usually needs full screen
    const isPosMode = currentView === 'pos';

    if (isPosMode) {
        // 🛠️ កែ h-screen ទៅ h-[100dvh] ដើម្បីកុំឲ្យបាត់ប៊ូតុងខាងក្រោមលើទូរស័ព្ទ
        return <div className="h-[100dvh] w-full overflow-hidden">{children}</div>;
    }

    return (
        // 🛠️ កែ h-screen ទៅ h-[100dvh] នៅទីនេះដូចគ្នា
        <div className="flex h-[100dvh] overflow-hidden bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display antialiased">
            {/* Sidebar */}
            <Sidebar />

            <main className="flex-1 flex flex-col h-full min-w-0 relative transition-all duration-300">
                {/* Global Header */}
                {/* 🛠️ កែ px-6 ទៅជា px-4 md:px-6 ដើម្បីសន្សំទំហំអេក្រង់ទូរស័ព្ទ */}
                <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-6 z-20 shadow-sm shrink-0 transition-colors duration-200">
                    
                    {/* Mobile Hamburger & Logo */}
                    <div className="flex items-center gap-2 md:gap-4 lg:hidden">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="text-slate-500 hover:text-primary transition-colors p-1.5 rounded-md active:bg-slate-100 dark:active:bg-slate-800"
                        >
                            <span className="material-icons-outlined text-2xl">menu</span>
                        </button>
                        <img src="/logo.png" alt="SokBiz Logo" className="w-8 h-8 object-contain drop-shadow-sm" />
                        <h1 className="font-bold text-base md:text-lg text-primary truncate max-w-[120px] sm:max-w-none">SokBiz KH</h1>
                    </div>
                    
                    {/* Search (Hidden on Mobile) */}
                    <div className="hidden lg:flex flex-1 max-w-lg relative group">
                        <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-khmer font-khmer transition-all" 
                            placeholder="ស្វែងរកវិក្កយបត្រ, អតិថិជន, ឬទំនិញ..." 
                            type="text" 
                        />
                        
                        {/* Live Search Dropdown */}
                        {isFocused && searchQuery.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider font-khmer">
                                    លទ្ធផលស្វែងរក (Search Results)
                                </div>
                                <ul>
                                    <li className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                                        <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-md text-blue-600 dark:text-blue-400">
                                            <span className="material-icons-outlined text-sm">receipt</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">វិក្កយបត្រ #1024</p>
                                            <p className="text-xs text-slate-500">Yesterday • $25.00</p>
                                        </div>
                                    </li>
                                    <li className="p-2 text-xs text-center text-primary cursor-pointer hover:underline font-khmer">
                                        កំពុងស្វែងរកទិន្នន័យសម្រាប់: "{searchQuery}"
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1 sm:gap-3">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">{currentDate}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wide">Phnom Penh, KH</span>
                        </div>
                        <button onClick={() => setCurrentView('notification-center')} className="relative p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <span className="material-icons-outlined">notifications</span>
                            {stats.pendingOnline > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark"></span>}
                        </button>
                        <button 
                            onClick={toggleTheme}
                            className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-colors"
                            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            <span className="material-icons-outlined transform transition-transform duration-500 rotate-0 dark:rotate-180">
                                {isDarkMode ? 'light_mode' : 'dark_mode'}
                            </span>
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden relative w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;