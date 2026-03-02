import React, { useState } from 'react';
import { useData, Staff } from '../context/DataContext';

const StaffManagement: React.FC = () => {
    const { staff, addStaff, updateStaff, deleteStaff, updateStaffStatus, setCurrentView } = useData();
    const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newStaff, setNewStaff] = useState<Partial<Staff>>({
        name: '', email: '', role: 'Cashier', password: '', status: 'Active'
    });

    const handleSubmit = async () => {
        if (newStaff.name && newStaff.email && (editingId || (newStaff.password && newStaff.password.length >= 6))) {
            if (editingId) {
                await updateStaff(editingId, newStaff);
            } else {
                await addStaff(newStaff);
            }
            handleClose();
        }
    };

    const handleEdit = (staffMember: Staff) => {
        setNewStaff(staffMember);
        setEditingId(staffMember.id);
        setIsSlideOverOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('តើអ្នកពិតជាចង់លុບບុគ្គលិកនេះមែនទេ? (Are you sure you want to delete this staff?)')) {
            await deleteStaff(id);
        }
    };

    const handleClose = () => {
        setIsSlideOverOpen(false);
        setNewStaff({ name: '', email: '', role: 'Cashier', password: '', status: 'Active' });
        setEditingId(null);
    };

    const toggleStatus = (id: string, currentStatus: string) => {
        updateStaffStatus(id, currentStatus === 'Active' ? 'Inactive' : 'Active');
    };

    return (
        <div className="flex h-full w-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 relative">
            <main className="flex flex-1 flex-col overflow-y-auto">
                <div className="container mx-auto max-w-7xl p-4 md:p-8">
                    {/* Breadcrumbs */}
                    <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <button onClick={() => setCurrentView('dashboard')} className="hover:text-primary">ការកំណត់</button>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                        <span className="font-medium text-slate-900 dark:text-white">បុគ្គលិក (Staff)</span>
                    </div>
                    {/* Page Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="khmer-text text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">ការគ្រប់គ្រងបុគ្គលិក & តួនាទី</h1>
                            <p className="mt-1 text-slate-500 dark:text-slate-400">Manage your staff members, roles, and system access.</p>
                        </div>
                        <button 
                            onClick={() => setIsSlideOverOpen(true)}
                            className="group flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-white shadow-sm transition-all hover:bg-blue-600 active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span className="khmer-text font-medium">បន្ថែមបុគ្គលិក</span>
                        </button>
                    </div>
                    
                    {/* Filters & Search */}
                    <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900 sm:grid-cols-12">
                        <div className="relative sm:col-span-5 md:col-span-4">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <input className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500" placeholder="ស្វែងរកឈ្មោះបុគ្គលិក..." type="text"/>
                        </div>
                        <div className="sm:col-span-4 md:col-span-3">
                            <select className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                <option value="">គ្រប់តួនាទី (All Roles)</option>
                                <option value="admin">អ្នកគ្រប់គ្រង (Admin)</option>
                                <option value="cashier">អ្នកគិតលុយ (Cashier)</option>
                                <option value="packer">អ្នកខ្ចប់ (Packer)</option>
                            </select>
                        </div>
                        <div className="sm:col-span-3 md:col-span-2">
                            <select className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                <option value="">ស្ថានភាព (All Status)</option>
                                <option value="active">សកម្ម (Active)</option>
                                <option value="inactive">អសកម្ម (Inactive)</option>
                            </select>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] table-auto text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                                        <th className="px-6 py-4 font-semibold">ឈ្មោះបុគ្គលិក (Staff Name)</th>
                                        <th className="px-6 py-4 font-semibold">តួនាទី (Role)</th>
                                        <th className="px-6 py-4 font-semibold">គណនី (Account)</th>
                                        <th className="px-6 py-4 font-semibold">ស្ថានភាព (Status)</th>
                                        <th className="px-6 py-4 text-right font-semibold">សកម្មភាព (Actions)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {staff.map(s => (
                                        <tr key={s.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 max-w-xs">
                                                <div className="flex items-center gap-3">
                                                    {s.avatar && s.avatar.startsWith('http') ? (
                                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
                                                            <img src={s.avatar} alt={s.name} className="h-full w-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                            {s.avatar ? s.avatar : s.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-medium text-slate-900 dark:text-white break-words whitespace-normal leading-relaxed">{s.name}</span>
                                                        <span className="text-xs text-slate-500 break-words whitespace-normal leading-relaxed">{s.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium break-words whitespace-normal leading-relaxed
                                                    ${s.role === 'Admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 
                                                      s.role === 'Cashier' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}
                                                `}>
                                                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full 
                                                        ${s.role === 'Admin' ? 'bg-purple-500' : s.role === 'Cashier' ? 'bg-green-500' : 'bg-amber-500'}
                                                    `}></span>
                                                    {s.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                                                    Email Login
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <label className="relative inline-flex cursor-pointer items-center">
                                                        <input 
                                                            type="checkbox" 
                                                            className="peer sr-only"
                                                            checked={s.status === 'Active'}
                                                            onChange={() => toggleStatus(s.id, s.status)}
                                                        />
                                                        <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-slate-700"></div>
                                                        <span className="ml-3 text-sm font-medium text-slate-900 dark:text-white">{s.status}</span>
                                                    </label>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button onClick={() => handleEdit(s)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-700 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                                        </svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(s.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
                            <div className="text-sm text-slate-500">
                                Showing <span className="font-medium text-slate-900 dark:text-white">1-{staff.length}</span> of <span className="font-medium text-slate-900 dark:text-white">12</span> staff
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                    </svg>
                                </button>
                                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">1</button>
                                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">2</button>
                                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">3</button>
                                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Slide-over / Side Panel for Add Staff */}
            {isSlideOverOpen && (
                <div className="absolute inset-0 z-50 flex">
                    <div className="flex-1 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>
                    <div className="flex w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900 animate-slide-in-right">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                            <h2 className="khmer-text text-lg font-bold text-slate-900 dark:text-white">
                                {editingId ? 'កែប្រែព័ត៌មានបុគ្គលិក (Edit Staff)' : 'បុគ្គលិកថ្មី (New Staff)'}
                            </h2>
                            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                                {/* Name Input */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ឈ្មោះបុគ្គលិក (Full Name)</label>
                                    <input 
                                        type="text"
                                        value={newStaff.name}
                                        onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                                        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                                        placeholder="បញ្ចូលឈ្មោះ..." 
                                    />
                                </div>
                                {/* Email Input */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">អ៊ីមែល (Email - Required)</label>
                                    <input 
                                        type="email"
                                        value={newStaff.email}
                                        onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                                        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                                        placeholder="example@quickbill.kh" 
                                    />
                                </div>
                                {/* Role Selection */}
                                <div className="flex flex-col gap-3">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">តួនាទី (Role)</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { id: 'Cashier', label: 'អ្នកគិតលុយ (Cashier)', desc: 'Can process sales, view products, and close shifts.' },
                                            { id: 'Admin', label: 'អ្នកគ្រប់គ្រង (Admin)', desc: 'Full access to settings, staff management, and reports.' },
                                            { id: 'Packer', label: 'អ្នកខ្ចប់ (Packer)', desc: 'View orders and update fulfillment status only.' },
                                            { id: 'online_sales', label: 'អ្នកលក់អនឡាញ (Online Sales 1)', desc: 'Manage CRM, create online orders, print labels, and view products.' },
                                            { id: 'online_sales_lead', label: 'មេក្រុមអនឡាញ (Online Sales Lead)', desc: 'Everything in Level 1 + Edit products, void receipts, and apply discounts.' }
                                        ].map(roleOption => (
                                            <label key={roleOption.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-slate-50 dark:hover:bg-slate-800 ${newStaff.role === roleOption.id ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-700'}`}>
                                                <input 
                                                    type="radio" 
                                                    name="role" 
                                                    className="mt-1 text-primary focus:ring-primary"
                                                    checked={newStaff.role === roleOption.id}
                                                    onChange={() => setNewStaff({ ...newStaff, role: roleOption.id as any })}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{roleOption.label}</span>
                                                    <span className="text-xs text-slate-500">
                                                        {roleOption.desc}
                                                    </span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                {/* Password Input */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ពាក្យសម្ងាត់ (Password)</label>
                                    <div className="relative">
                                        <input 
                                            type="password"
                                            value={newStaff.password}
                                            onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono tracking-widest focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                                            minLength={6}
                                            placeholder={editingId ? "Leave blank to keep current" : "******"} 
                                        />
                                        <button className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600" type="button">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500">Minimum 6 characters for login.</p>
                                </div>
                            </form>
                        </div>
                        <div className="border-t border-slate-200 p-6 dark:border-slate-800">
                            <div className="flex gap-3">
                                <button onClick={handleClose} className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Cancel</button>
                                <button onClick={handleSubmit} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-600">Save Staff</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;