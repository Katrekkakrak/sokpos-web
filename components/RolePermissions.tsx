import React, { useState, useEffect } from 'react';
import { useData, Role, Permission } from '../context/DataContext';

const RolePermissions: React.FC = () => {
    const { roles, updateRolePermissions, setCurrentView } = useData();
    const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || '');
    const [localPermissions, setLocalPermissions] = useState<Permission[]>([]);

    useEffect(() => {
        const role = roles.find(r => r.id === selectedRoleId);
        if (role) {
            setLocalPermissions(role.permissions);
        }
    }, [selectedRoleId, roles]);

    const handleToggle = (permId: string) => {
        setLocalPermissions(prev => prev.map(p => 
            p.id === permId ? { ...p, enabled: !p.enabled } : p
        ));
    };

    const handleSave = () => {
        updateRolePermissions(selectedRoleId, localPermissions);
        alert('Permissions saved successfully!');
    };

    const selectedRole = roles.find(r => r.id === selectedRoleId);

    // Group permissions
    const groups = ['POS', 'Inventory', 'Reports', 'Settings'];

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            {/* Header */}
            <header className="flex-none flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentView('staff-management')} className="hover:text-primary"><span className="material-symbols-outlined">arrow_back</span></button>
                    <h2 className="text-lg font-bold flex flex-col">
                        <span>Role Permissions</span>
                        <span className="text-xs font-normal text-slate-500 font-khmer">ការកំណត់សិទ្ធិប្រើប្រាស់</span>
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold">Sokha Dara</p>
                        <p className="text-xs text-slate-500">Admin</p>
                    </div>
                </div>
            </header>

            <main className="flex flex-1 overflow-hidden relative">
                {/* Sidebar Roles */}
                <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-10">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Roles / តួនាទី</h3>
                        <div className="flex flex-col gap-2">
                            {roles.map(role => (
                                <button
                                    key={role.id}
                                    onClick={() => setSelectedRoleId(role.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left group
                                        ${selectedRoleId === role.id 
                                            ? 'bg-primary/10 border-primary/30 text-primary' 
                                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}
                                    `}
                                >
                                    <div>
                                        <p className="font-bold text-sm">{role.name}</p>
                                        <p className="text-xs font-khmer opacity-90">{role.nameKh}</p>
                                    </div>
                                    {selectedRoleId === role.id && <span className="material-symbols-outlined text-lg">chevron_right</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
                        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-lg">add</span>
                            <span>Add New Role</span>
                        </button>
                    </div>
                </aside>

                {/* Permissions Panel */}
                <section className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-background-dark">
                    <div className="bg-white dark:bg-slate-900 px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start shadow-sm z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold">{selectedRole?.name} Permissions</h1>
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">Active Role</span>
                            </div>
                            <p className="text-slate-500 text-sm max-w-2xl font-khmer">កំណត់សិទ្ធិប្រើប្រាស់សម្រាប់តួនាទីនេះ។</p>
                        </div>
                        <div className="flex gap-3">
                            {!selectedRole?.isSystem && (
                                <button className="text-red-500 hover:text-red-600 font-medium text-sm px-3 py-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-lg">delete</span> Delete
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-5xl mx-auto space-y-8">
                            {groups.map(group => {
                                const groupPerms = localPermissions.filter(p => p.group === group);
                                if (groupPerms.length === 0) return null;

                                return (
                                    <div key={group} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-primary">
                                                    <span className="material-symbols-outlined">
                                                        {group === 'POS' ? 'point_of_sale' : group === 'Inventory' ? 'inventory_2' : group === 'Reports' ? 'bar_chart' : 'settings'}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-base">{group}</h3>
                                            </div>
                                        </div>
                                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {groupPerms.map(perm => (
                                                <div key={perm.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <div className="pr-8">
                                                        <p className="text-sm font-semibold mb-0.5">{perm.name}</p>
                                                        <p className="text-sm text-slate-500 font-khmer">{perm.nameKh}</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            className="sr-only peer"
                                                            checked={perm.enabled}
                                                            onChange={() => handleToggle(perm.id)}
                                                        />
                                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 px-8 flex justify-end gap-3 z-20">
                        <button onClick={() => setCurrentView('staff-management')} className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 font-khmer">បោះបង់ (Cancel)</button>
                        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-hover shadow-md font-khmer">
                            <span className="material-symbols-outlined text-lg">save</span>
                            រក្សាទុកសិទ្ធិ (Save Permissions)
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default RolePermissions;