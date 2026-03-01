import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import UserProfileDrawer from '../src/components/UserProfileDrawer';

const Sidebar: React.FC = () => {
    const { setCurrentView, currentView, user, isSidebarOpen, setIsSidebarOpen } = useData();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Active state helpers
    const isInventoryActive = ['inventory-list', 'product-form', 'stock-adjustment', 'barcode-generator'].includes(currentView);
    const isSettingsActive = ['shop-settings', 'hardware-setup', 'staff-management'].includes(currentView);
    const isAnalyticsActive = ['predictive-analytics', 'receipt-history'].includes(currentView);

    return (
        <>
            {/* Backdrop Overlay for Mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-700 
                flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'} 
                lg:static lg:translate-x-0 lg:shadow-none
            `}>
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-1.5 rounded-lg">
                            <span className="material-icons-outlined text-primary">point_of_sale</span>
                        </div>
                        <h1 className="font-bold text-xl tracking-tight text-primary">QuickBill <span className="text-slate-700 dark:text-white font-normal text-lg">KH</span></h1>
                    </div>
                    {/* Mobile Close Button */}
                    <button 
                        onClick={() => setIsSidebarOpen(false)} 
                        className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                        <span className="material-icons-outlined">close</span>
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto custom-scroll py-4 px-3 space-y-1">
                    <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-display">Overview</p>
                    
                    <button 
                        onClick={() => setCurrentView('dashboard')}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg group transition-colors ${currentView === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <span className="material-icons-outlined text-[20px]">dashboard</span>
                        <span className="text-sm font-medium font-khmer">ផ្ទាំងគ្រប់គ្រង (Dashboard)</span>
                    </button>

                    <button 
                        onClick={() => setCurrentView('pos')}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg group transition-colors ${currentView === 'pos' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <span className="material-icons-outlined text-[20px] group-hover:text-primary transition-colors">storefront</span>
                        <span className="text-sm font-medium font-khmer">ការលក់ (POS)</span>
                    </button>
                    
                    <button 
                        onClick={() => setCurrentView('online-orders')}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg group transition-colors ${currentView === 'online-orders' || currentView === 'order-details' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <span className="material-icons-outlined text-[20px] group-hover:text-primary transition-colors">shopping_cart_checkout</span>
                        <span className="text-sm font-medium font-khmer">ការកុម្ម៉ង់ (Online Orders)</span>
                    </button>

                    {/* CRM */}
                    <button 
                        onClick={() => setCurrentView('crm-directory')}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg group transition-colors ${currentView === 'crm-directory' || currentView === 'customer-profile' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <span className="material-icons-outlined text-[20px] group-hover:text-primary transition-colors">people</span>
                        <span className="text-sm font-medium font-khmer">អតិថិជន (CRM)</span>
                    </button>
                    
                    {/* Inventory Group */}
                    <div className="py-2">
                        <button 
                            onClick={() => setCurrentView('inventory-list')}
                            className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg group transition-colors ${isInventoryActive ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            <span className="material-icons-outlined text-[20px] group-hover:text-primary transition-colors">inventory_2</span>
                            <span className="text-sm font-medium font-khmer">ស្តុកទំនិញ (Inventory)</span>
                        </button>
                        
                        {/* Inventory Submenu */}
                        {isInventoryActive && (
                            <div className="ml-9 border-l-2 border-slate-200 dark:border-slate-700 pl-3 mt-1 flex flex-col gap-1">
                                <button onClick={() => setCurrentView('inventory-list')} className={`text-left py-1.5 text-sm ${currentView === 'inventory-list' ? 'text-primary font-medium' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>បញ្ជីទំនិញ (List)</button>
                                <button onClick={() => setCurrentView('product-form')} className={`text-left py-1.5 text-sm ${currentView === 'product-form' ? 'text-primary font-medium' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>បន្ថែមថ្មី (Add New)</button>
                                <button onClick={() => setCurrentView('stock-adjustment')} className={`text-left py-1.5 text-sm ${currentView === 'stock-adjustment' ? 'text-primary font-medium' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>កែសម្រួលស្តុក (Adjust)</button>
                                <button onClick={() => setCurrentView('barcode-generator')} className={`text-left py-1.5 text-sm ${currentView === 'barcode-generator' ? 'text-primary font-medium' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>Barcode</button>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => setCurrentView('receipt-history')}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg group transition-colors ${isAnalyticsActive ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <span className="material-icons-outlined text-[20px]">receipt_long</span>
                        <span className="text-sm font-medium font-khmer">របាយការណ៍ (Reports)</span>
                    </button>

                    {/* Analytics Submenu */}
                    {isAnalyticsActive && (
                        <div className="ml-9 border-l-2 border-slate-200 dark:border-slate-700 pl-3 mt-1 flex flex-col gap-1">
                            <button onClick={() => setCurrentView('receipt-history')} className={`text-left py-1.5 text-sm ${currentView === 'receipt-history' ? 'text-primary font-medium' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>ប្រវត្តិរបាយ (History)</button>
                            <button onClick={() => setCurrentView('predictive-analytics')} className={`text-left py-1.5 text-sm ${currentView === 'predictive-analytics' ? 'text-primary font-medium' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>📊 ព្យាករណ៍ (Forecast)</button>
                        </div>
                    )}

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-display">System</p>
                        
                        {/* Settings Group */}
                        <button 
                            onClick={() => setCurrentView('shop-settings')}
                            className={`flex w-full items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg group transition-colors ${isSettingsActive ? 'bg-primary/10 text-primary' : ''}`}
                        >
                            <span className="material-icons-outlined text-[20px] group-hover:text-primary transition-colors">settings</span>
                            <span className="text-sm font-medium font-khmer">ការកំណត់ (Settings)</span>
                        </button>

                        {isSettingsActive && (
                            <div className="ml-9 border-l-2 border-slate-200 dark:border-slate-700 pl-3 mt-1 flex flex-col gap-1">
                                <button onClick={() => setCurrentView('shop-settings')} className={`text-left py-1.5 text-sm ${currentView === 'shop-settings' ? 'text-primary font-medium' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>ទូទៅ (General)</button>
                                <button onClick={() => setCurrentView('staff-management')} className={`text-left py-1.5 text-sm ${currentView === 'staff-management' ? 'text-primary font-medium' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>បុគ្គលិក (Staff)</button>
                                <button onClick={() => setCurrentView('hardware-setup')} className={`text-left py-1.5 text-sm ${currentView === 'hardware-setup' ? 'text-primary font-medium' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>Hardware</button>
                            </div>
                        )}

                        <button 
                            onClick={() => alert("Help Center is under construction.")} 
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg group transition-colors"
                        >
                            <span className="material-icons-outlined text-[20px] group-hover:text-primary transition-colors">help_outline</span>
                            <span className="text-sm font-medium font-khmer">ជំនួយ (Help)</span>
                        </button>
                    </div>
                </div>

                {/* User Profile Section */}
                {user && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                        <div 
                            onClick={() => setIsProfileOpen(true)}
                            className="flex items-center gap-3 p-2 -m-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <img 
                                src={user.avatar} 
                                alt="Admin Profile" 
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</span>
                                <span className="text-xs text-slate-500 font-khmer">{user.role}</span>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            <UserProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </>
    );
};

export default Sidebar;