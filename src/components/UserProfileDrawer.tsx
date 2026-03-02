import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({ isOpen, onClose }) => {
  const { user: currentUser, logout, orders, onlineOrders } = useData();
  const [activeTab, setActiveTab] = useState('general');
  
  // General State
  const [name, setName] = useState(currentUser?.name || '');
  
  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Handle logout
  const handleLogout = async () => {
    await logout();
    onClose();
  };
  
  // Role-based badge styling
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'Admin':
      case 'Super Admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Cashier':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'Packer':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  // Dynamic Stats Calculation
  const myReceiptsCount = useMemo(() => {
    if (!currentUser) return 0;
    const myId = currentUser.uid || currentUser.id;
    const myName = currentUser.name;
    
    // Combine POS receipts (orders) and Online Orders
    const allReceipts = [...(orders || []), ...(onlineOrders || [])];

    return allReceipts.filter((receipt: any) => 
       receipt.staffId === myId || 
       receipt.cashierId === myId || 
       receipt.userId === myId || 
       (myName && receipt.cashierName === myName) || 
       (myName && receipt.staffName === myName) || 
       (myName && receipt.createdBy === myName)
    ).length;
  }, [orders, onlineOrders, currentUser]);

  const joinedDate = useMemo(() => {
    if (!currentUser) return 'N/A';
    const rawDate = currentUser.createdAt || currentUser.joinedDate;
    
    if (!rawDate) return 'តាំងពីចាប់ផ្តើម'; // Fallback

    try {
      // Handle Firestore Timestamp (seconds) or standard Date string/object
      const date = new Date(rawDate.seconds ? rawDate.seconds * 1000 : rawDate);
      // Format to Khmer month and year if possible
      return date.toLocaleDateString('km-KH', { month: 'long', year: 'numeric' });
    } catch (e) {
      return 'តាំងពីចាប់ផ្តើម';
    }
  }, [currentUser]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-display" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out" 
        aria-hidden="true"
        onClick={onClose}
      ></div>

      {/* Drawer Panel */}
      <div className="relative z-10 flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-slate-900 animate-slide-in-right">
        <div className="flex h-full flex-col">
          
          {/* Header & Avatar (Persistent) */}
          <div className="shrink-0">
            <div className="h-32 bg-gradient-to-br from-sky-500 to-indigo-600"></div>
            <div className="relative mx-auto -mt-12 flex w-full flex-col items-center px-6">
              <div className="group relative">
                <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-100 dark:border-slate-900 shadow-md">
                  {currentUser?.avatar && currentUser.avatar.startsWith('http') ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-blue-100 text-2xl font-bold text-blue-600">
                      {currentUser?.name?.substring(0, 2).toUpperCase() || 'S'}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="material-symbols-outlined text-white">photo_camera</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-4 px-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex space-x-1">
              {['general', 'security', 'preferences'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 pb-3 text-sm font-medium transition-all relative ${
                    activeTab === tab 
                      ? 'text-indigo-600 dark:text-indigo-400' 
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {tab === 'general' && '👤 ទូទៅ'}
                  {tab === 'security' && '🔒 សុវត្ថិភាព'}
                  {tab === 'preferences' && '⚙️ ការកំណត់'}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-fade-in">
                {/* Full Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ឈ្មោះ (Full Name)</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-indigo-500/30 transition-all" 
                    placeholder="បញ្ចូលឈ្មោះរបស់អ្នក..."
                  />
                </div>

                {/* Read-only Info */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">អ៊ីមែល (Email)</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{currentUser?.email}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">តួនាទី (Role)</p>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeClass(currentUser?.role || '')}`}>
                            {currentUser?.role || 'Staff'}
                        </span>
                    </div>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">ថ្ងៃចូលធ្វើការ</p>
                        <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{joinedDate}</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800 text-center">
                        <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">ស្នាដៃ</p>
                        <p className="text-sm font-bold text-purple-700 dark:text-purple-300">{myReceiptsCount} វិក្កយបត្រ</p>
                    </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">លេខសម្ងាត់បច្ចុប្បន្ន (Current)</label>
                        <input 
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-indigo-500/30 transition-all" 
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">លេខសម្ងាត់ថ្មី (New)</label>
                        <input 
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-indigo-500/30 transition-all" 
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">បញ្ជាក់លេខសម្ងាត់ថ្មី (Confirm)</label>
                        <input 
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-indigo-500/30 transition-all" 
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">ប្រវត្តិចូលប្រើ (Recent Activity)</p>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                        <span className="material-symbols-outlined text-base text-green-500">check_circle</span>
                        ចូលប្រើចុងក្រោយ: ថ្ងៃនេះ ម៉ោង 3:48 AM (Windows)
                    </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">dark_mode</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">Theme</p>
                            <p className="text-xs text-slate-500">Light / Dark Mode</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">language</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">Language</p>
                            <p className="text-xs text-slate-500">Select Interface Language</p>
                        </div>
                    </div>
                    <select className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2">
                        <option>ខ្មែរ (Khmer)</option>
                        <option>English</option>
                    </select>
                </div>
              </div>
            )}

          </div>
          
          {/* Footer */}
          <div className="border-t border-slate-200 p-6 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
            <button className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">save</span>
                រក្សាទុកការផ្លាស់ប្តូរ (Save Changes)
            </button>
            <button 
              onClick={handleLogout}
              className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 shadow-sm transition-all hover:bg-red-50 hover:border-red-300 dark:bg-slate-800 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span>ចាកចេញ (Logout)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDrawer;
