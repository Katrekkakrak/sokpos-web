import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const Login: React.FC = () => {
    const { login, registerShop, authLoading } = useData();
    
    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [shopName, setShopName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const result = await login(email, password);
            if (!result.success) {
                setError(result.message || 'Login failed. Please check your credentials.');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        // Validation
        if (!shopName.trim()) {
            setError('Shop name is required.');
            setLoading(false);
            return;
        }
        if (!email.trim()) {
            setError('Email is required.');
            setLoading(false);
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            setLoading(false);
            return;
        }
        
        try {
            const result = await registerShop(email, password, shopName);
            if (!result.success) {
                setError(result.message || 'Registration failed. Please try again.');
            }
            // On success, Firebase auth listener will handle the redirect
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-600 dark:text-slate-300">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-pattern opacity-30 dark:opacity-10"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex flex-col items-center justify-center mb-8"> 
                        <img 
                            src="/logo.png" 
                            alt="SokBiz KH logo featuring a stylized storefront icon with Khmer and English text SokBiz KH, set against a clean white background evoking a welcoming and professional business environment" 
                            className="w-24 h-24 md:w-28 md:h-28 object-contain mx-auto mb-0 drop-shadow-md" 
                        />         
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">SokBiz KH</h2>
                </div>

                <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                    <div className="mb-8 text-center">
                        <h3 className="text-xl font-khmer font-bold text-slate-800 dark:text-white mb-2">
                            {isRegistering ? 'ចុះឈ្មោះហាងថ្មី' : 'សូមស្វាគមន៍មកកាន់ SokBiz KH'}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {isRegistering 
                                ? 'Create a new shop account and start selling today.' 
                                : 'Sign in to manage your shop and sales.'}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                                <span className="material-icons-round text-lg mr-2">error</span>
                                {error}
                            </p>
                        </div>
                    )}

                    {isRegistering ? (
                        // REGISTRATION FORM
                        <form className="space-y-6" onSubmit={handleRegister}>
                            {/* Shop Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 font-khmer mb-1" htmlFor="shop-name">
                                    ឈ្មោះហាង <span className="text-xs font-display font-normal text-slate-400 ml-1">(Shop Name)</span>
                                </label>
                                <div className="relative mt-1 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="material-icons-round text-slate-400 text-lg">storefront</span>
                                    </div>
                                    <input
                                        id="shop-name"
                                        name="shop-name"
                                        type="text"
                                        required
                                        value={shopName}
                                        onChange={(e) => setShopName(e.target.value)}
                                        disabled={loading}
                                        className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="e.g., My Coffee Shop"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 font-khmer mb-1" htmlFor="email">
                                    អ៊ីមែល <span className="text-xs font-display font-normal text-slate-400 ml-1">(Email)</span>
                                </label>
                                <div className="relative mt-1 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="material-icons-round text-slate-400 text-lg">mail</span>
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 font-khmer mb-1" htmlFor="password">
                                    ពាក្យសម្ងាត់ <span className="text-xs font-display font-normal text-slate-400 ml-1">(Password, min 6 chars)</span>
                                </label>
                                <div className="relative mt-1 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="material-icons-round text-slate-400 text-lg">lock</span>
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full justify-center rounded-lg bg-primary px-3 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-200 font-khmer text-base shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:-translate-y-0"
                                >
                                    {loading ? (
                                        <>
                                            <span className="animate-spin mr-2 text-lg material-icons-round">sync</span>
                                            កំពុងចុះឈ្មោះ...
                                        </>
                                    ) : (
                                        'ចុះឈ្មោះ (Register)'
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        // LOGIN FORM
                        <form className="space-y-6" onSubmit={handleLogin}>
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 font-khmer mb-1" htmlFor="email-login">
                                    អ៊ីមែល / ឈ្មោះអ្នកប្រើ <span className="text-xs font-display font-normal text-slate-400 ml-1">(Email / Username)</span>
                                </label>
                                <div className="relative mt-1 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="material-icons-round text-slate-400 text-lg">person</span>
                                    </div>
                                    <input
                                        id="email-login"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 font-khmer" htmlFor="password-login">
                                        ពាក្យសម្ងាត់ <span className="text-xs font-display font-normal text-slate-400 ml-1">(Password)</span>
                                    </label>
                                </div>
                                <div className="relative mt-1 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="material-icons-round text-slate-400 text-lg">lock</span>
                                    </div>
                                    <input
                                        id="password-login"
                                        name="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="••••••••"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                        <span className="material-icons-round text-slate-400 text-lg">visibility</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        disabled={loading}
                                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <label className="ml-2 block text-sm text-slate-600 dark:text-slate-400 font-khmer" htmlFor="remember-me">
                                        ចងចាំខ្ញុំ <span className="font-display text-xs">(Remember me)</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full justify-center rounded-lg bg-primary px-3 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-200 font-khmer text-base shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:-translate-y-0"
                                >
                                    {loading ? (
                                        <>
                                            <span className="animate-spin mr-2 text-lg material-icons-round">sync</span>
                                            កំពុងចូល...
                                        </>
                                    ) : (
                                        'ចូលប្រើប្រាស់ (Log In)'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 font-khmer">
                                    {isRegistering ? 'មានគណនីរួចហើយ?' : 'មិនទាន់មានគណនី?'}
                                </span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button 
                                type="button"
                                onClick={() => {
                                    setIsRegistering(!isRegistering);
                                    setError('');
                                    setEmail('');
                                    setPassword('');
                                    setShopName('');
                                }}
                                disabled={loading}
                                className="flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-all font-khmer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-icons-round text-primary mr-2 text-lg">
                                    {isRegistering ? 'login' : 'add_business'}
                                </span>
                                {isRegistering 
                                    ? 'ចូលដោយប្រើគណនីដែលមាន (Log In)' 
                                    : 'ចុះឈ្មោះហាងថ្មី (Register New Shop)'}
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    © 2024 SokBiz KH. All rights reserved. <br />
                    <span className="font-khmer">ប្រព័ន្ធគ្រប់គ្រងអាជីវកម្មឈានមុខគេនៅកម្ពុជា</span>
                </p>
            </div>
            
             <div className="hidden lg:block absolute right-0 bottom-0 w-1/3 h-full opacity-5 pointer-events-none">
                <div className="w-full h-full bg-gradient-to-t from-primary to-transparent" style={{maskImage: "linear-gradient(to left, black, transparent)"}}></div>
            </div>
        </div>
    );
};

export default Login;