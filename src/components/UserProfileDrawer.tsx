import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({ isOpen, onClose }) => {
  const { user: currentUser, logout } = useData();
  const [name, setName] = useState(currentUser?.name || '');
  const [newPassword, setNewPassword] = useState('');

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
          {/* Profile Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Header Section */}
            <div>
              <div className="h-32 bg-gradient-to-br from-sky-500 to-indigo-600"></div>
              <div className="relative mx-auto -mt-12 flex w-full flex-col items-center px-6">
                <div className="group relative">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-100 dark:border-slate-900">
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

            {/* Info Section */}
            <div className="mt-4 text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{currentUser?.name}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
              <div className="mt-3 flex justify-center">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold
                  ${getRoleBadgeClass(currentUser?.role || '')}
                `}>
                  {currentUser?.role || 'Staff'}
                </span>
              </div>
            </div>

            {/* Quick Actions / Form */}
            <div className="mt-8 space-y-6 px-6">
              {/* Full Name Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ឈ្មោះ (Full Name)</label>
                <input 
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-indigo-500/30" 
                  placeholder="បញ្ចូលឈ្មោះរបស់អ្នក..."
                />
              </div>

              {/* Change Password Section */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ប្តូរពាក្យសម្ងាត់ (Change Password)</label>
                <div className="relative">
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm tracking-wider focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-indigo-500/30" 
                    placeholder="••••••••" 
                  />
                  <button className="absolute right-3 top-3 text-slate-400 hover:text-slate-600" type="button">
                    <span className="material-symbols-outlined text-lg">visibility</span>
                  </button>
                </div>
              </div>
              
              {/* Save Changes Button */}
              <button className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]">
                រក្សាទុកការផ្លាស់ប្តូរ (Save Changes)
              </button>

            </div>
          </div>
          
          {/* Footer */}
          <div className="border-t border-slate-200 p-6 dark:border-slate-800">
            <button 
              onClick={handleLogout}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-all hover:bg-red-600 hover:text-white dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>ចាកចេញពីគណនី (Log Out)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDrawer;
