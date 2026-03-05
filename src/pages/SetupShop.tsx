import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const SetupShop: React.FC = () => {
    const { setCurrentView } = useData();
    const [shopName, setShopName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shopName.trim()) return;
        
        const user = auth.currentUser;
        if (!user) return;

        setLoading(true);
        try {
            await setDoc(doc(db, 'tenants', user.uid), { 
                name: shopName, 
                createdAt: new Date() 
            }, { merge: true });
            
            setCurrentView('dashboard');
        } catch (error) {
            console.error("Error setting up shop:", error);
            alert("Failed to setup shop. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 font-display">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-icons-round text-3xl">store</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-khmer mb-2">
                        ស្វាគមន៍មកកាន់ SokBiz
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        សូមកំណត់ឈ្មោះហាងរបស់អ្នកដើម្បីចាប់ផ្តើម
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 font-khmer mb-2">
                            ឈ្មោះហាង (Shop Name)
                        </label>
                        <input
                            type="text"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="បញ្ចូលឈ្មោះហាង..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 font-khmer"
                    >
                        {loading ? 'កំពុងដំណើរការ...' : 'បញ្ជាក់ (Confirm)'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetupShop;