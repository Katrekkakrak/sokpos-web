import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
    Store, 
    Phone, 
    MapPin, 
    Package, 
    CheckCircle, 
    ArrowRight, 
    Plus, 
    Upload, 
    Trash2, 
    DollarSign, 
    ChevronRight,
    ShoppingBag
} from 'lucide-react';

const ShopOnboarding: React.FC = () => {
    const { completeOnboarding, addProduct } = useData();
    const [step, setStep] = useState(1);
    
    // Shop Details State
    const [shopName, setShopName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [currency, setCurrency] = useState('KHR');

    // Product State (Step 2)
    const [products, setProducts] = useState<{name: string, price: string}[]>([]);
    const [newProdName, setNewProdName] = useState('');
    const [newProdPrice, setNewProdPrice] = useState('');

    const handleAddProduct = () => {
        if (newProdName && newProdPrice) {
            setProducts([...products, { name: newProdName, price: newProdPrice }]);
            // Add to global context immediately for demo purposes
            addProduct({
                name: newProdName,
                nameKh: newProdName, // Using same name for simplicity in onboarding
                price: parseFloat(newProdPrice),
                category: 'General',
                stock: 100,
                status: 'In Stock',
                image: 'https://via.placeholder.com/150'
            });
            setNewProdName('');
            setNewProdPrice('');
        }
    };

    const handleRemoveProduct = (index: number) => {
        const newList = [...products];
        newList.splice(index, 1);
        setProducts(newList);
    };

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
        else completeOnboarding();
    };

    return (
        <div className="bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white min-h-screen flex items-center justify-center p-4 font-display">
            <div className="w-full max-w-5xl bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col min-h-[650px]">
                
                {/* Top Header & Progress */}
                <div className="w-full border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1e293b] p-6 sticky top-0 z-20">
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold font-khmer text-slate-900 dark:text-white leading-relaxed">
                                    សូមស្វាគមន៍មកកាន់ QuickBill KH
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                    Welcome to QuickBill KH - Let's set up your shop.
                                </p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                Step {step} / 3
                            </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="relative w-full">
                            <div className="flex justify-between mb-3 text-sm font-medium">
                                <span className={`${step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} transition-colors duration-300`}>
                                    1. ព័ត៌មានហាង <span className="text-[10px] font-normal opacity-70 ml-1">(Shop Info)</span>
                                </span>
                                <span className={`${step >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} transition-colors duration-300`}>
                                    2. បន្ថែមទំនិញ <span className="text-[10px] font-normal opacity-70 ml-1">(Add Products)</span>
                                </span>
                                <span className={`${step >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} transition-colors duration-300`}>
                                    3. រួចរាល់ <span className="text-[10px] font-normal opacity-70 ml-1">(Ready)</span>
                                </span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-in-out shadow-[0_0_10px_rgba(37,99,235,0.3)]" 
                                    style={{ width: `${(step / 3) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    
                    {/* Left Panel: Form Inputs */}
                    <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
                        
                        {/* STEP 1: SHOP INFO */}
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-1 mb-6">
                                    <h2 className="text-xl font-bold font-khmer text-slate-800 dark:text-white">ព័ត៌មានហាង</h2>
                                    <p className="text-slate-500 text-sm">Shop Information</p>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {/* Shop Name */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 font-khmer">
                                            ឈ្មោះហាង <span className="text-red-500">*</span>
                                            <span className="block text-xs font-normal text-slate-400 font-sans mt-0.5">Shop Name</span>
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                <Store size={20} />
                                            </div>
                                            <input 
                                                value={shopName} 
                                                onChange={(e) => setShopName(e.target.value)} 
                                                className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-khmer text-slate-900 dark:text-white placeholder:text-slate-400" 
                                                placeholder="ឧទាហរណ៍៖ ហាងកាហ្វេ ខ្មែរ" 
                                                type="text"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 font-khmer">
                                            លេខទូរស័ព្ទ <span className="text-red-500">*</span>
                                            <span className="block text-xs font-normal text-slate-400 font-sans mt-0.5">Phone Number</span>
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                <Phone size={20} />
                                            </div>
                                            <input 
                                                value={phone} 
                                                onChange={(e) => setPhone(e.target.value)} 
                                                className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans text-slate-900 dark:text-white placeholder:text-slate-400" 
                                                placeholder="012 345 678" 
                                                type="tel"
                                            />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 font-khmer">
                                            អាសយដ្ឋាន
                                            <span className="block text-xs font-normal text-slate-400 font-sans mt-0.5">Address</span>
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute top-3 left-3 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                <MapPin size={20} />
                                            </div>
                                            <textarea 
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-khmer text-slate-900 dark:text-white placeholder:text-slate-400 resize-none min-h-[100px]" 
                                                placeholder="បញ្ចូលអាសយដ្ឋានហាងរបស់អ្នក..."
                                            ></textarea>
                                        </div>
                                    </div>

                                    {/* Currency */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 font-khmer">
                                            រូបិយប័ណ្ណគោល
                                            <span className="block text-xs font-normal text-slate-400 font-sans mt-0.5">Base Currency</span>
                                        </label>
                                        <div className="flex gap-4">
                                            <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer w-full transition-all duration-200 ${currency === 'KHR' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                                <input type="radio" name="currency" value="KHR" checked={currency === 'KHR'} onChange={() => setCurrency('KHR')} className="h-5 w-5 text-blue-600 border-slate-300 focus:ring-blue-500"/>
                                                <div className="ml-3">
                                                    <span className="block font-bold font-khmer text-slate-900 dark:text-white">៛ រៀល</span>
                                                    <span className="block text-xs text-slate-500 uppercase tracking-wider">KHR</span>
                                                </div>
                                            </label>
                                            <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer w-full transition-all duration-200 ${currency === 'USD' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                                <input type="radio" name="currency" value="USD" checked={currency === 'USD'} onChange={() => setCurrency('USD')} className="h-5 w-5 text-blue-600 border-slate-300 focus:ring-blue-500"/>
                                                <div className="ml-3">
                                                    <span className="block font-bold font-khmer text-slate-900 dark:text-white">$ ដុល្លារ</span>
                                                    <span className="block text-xs text-slate-500 uppercase tracking-wider">USD</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: ADD PRODUCTS */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold font-khmer text-slate-800 dark:text-white">បន្ថែមទំនិញដំបូង</h2>
                                    <p className="text-slate-500 text-sm">Add First Products</p>
                                </div>

                                {/* Product List */}
                                <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 overflow-y-auto min-h-[200px]">
                                    {products.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 opacity-60">
                                            <ShoppingBag size={48} strokeWidth={1.5} />
                                            <p className="text-sm font-khmer">មិនទាន់មានទំនិញនៅឡើយ</p>
                                            <p className="text-xs">No products added yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {products.map((prod, idx) => (
                                                <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex justify-between items-center border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                            <Package size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 dark:text-white font-khmer">{prod.name}</p>
                                                            <p className="text-sm text-slate-500 font-sans font-medium">${parseFloat(prod.price).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleRemoveProduct(idx)}
                                                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Add Form */}
                                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-khmer ml-1">ឈ្មោះទំនិញ (Name)</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                    <Package size={18} />
                                                </div>
                                                <input 
                                                    value={newProdName}
                                                    onChange={e => setNewProdName(e.target.value)}
                                                    className="w-full h-11 pl-10 pr-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-sm focus:ring-2 focus:ring-blue-500 font-khmer"
                                                    placeholder="ឧ. កាហ្វេទឹកដោះគោ"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-khmer ml-1">តម្លៃ (Price)</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                    <DollarSign size={18} />
                                                </div>
                                                <input 
                                                    type="number"
                                                    value={newProdPrice}
                                                    onChange={e => setNewProdPrice(e.target.value)}
                                                    className="w-full h-11 pl-10 pr-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-sm focus:ring-2 focus:ring-blue-500 font-sans font-bold"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleAddProduct}
                                        disabled={!newProdName || !newProdPrice}
                                        className="w-full mt-4 bg-slate-900 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus size={18} />
                                        <span className="font-khmer">បន្ថែមទំនិញ</span>
                                        <span className="text-xs opacity-70 font-sans font-normal">(Add Product)</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: SUCCESS */}
                        {step === 3 && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-500 p-8">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
                                    <div className="relative bg-white dark:bg-slate-800 p-4 rounded-full shadow-lg">
                                        <CheckCircle size={80} className="text-green-500" />
                                    </div>
                                </div>
                                <div className="space-y-4 max-w-md">
                                    <h2 className="text-3xl font-bold font-khmer text-slate-900 dark:text-white">
                                        ការចុះឈ្មោះជោគជ័យ!
                                    </h2>
                                    <p className="text-lg text-slate-600 dark:text-slate-300 font-khmer">
                                        ហាងរបស់អ្នកត្រូវបានបង្កើតរួចរាល់។ អ្នកអាចចាប់ផ្តើមលក់បានភ្លាមៗ។
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        Setup Complete! You are ready to start selling.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Visual Sidebar (Hidden on mobile) */}
                    <div className="hidden md:flex w-[320px] bg-slate-50 dark:bg-[#151f2b] border-l border-slate-200 dark:border-slate-700 flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                        <div className="relative z-10">
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="relative group cursor-pointer w-48 h-48 mx-auto">
                                        <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full shadow-lg border-2 border-dashed border-slate-300 dark:border-slate-600 group-hover:border-blue-500 transition-colors flex flex-col items-center justify-center">
                                            <Upload className="text-slate-400 group-hover:text-blue-500 transition-colors mb-3" size={32} />
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 font-khmer group-hover:text-blue-500">ដាក់ឡូហ្គោ</span>
                                            <span className="text-xs text-slate-400">Upload Logo</span>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" />
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <h3 className="font-bold text-slate-900 dark:text-white font-khmer mb-1">ឡូហ្គោហាង</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            រូបភាពនេះនឹងបង្ហាញនៅលើវិក្កយបត្រដែលអ្នកបោះពុម្ពជូនអតិថិជន។
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            {step === 2 && (
                                <div className="flex flex-col items-center opacity-80">
                                    <ShoppingBag size={120} className="text-slate-300 dark:text-slate-600 mb-6" strokeWidth={1} />
                                    <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500 font-khmer">គ្រប់គ្រងស្តុកងាយស្រួល</h3>
                                    <p className="text-xs text-slate-400 mt-2">Manage inventory with ease</p>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="flex flex-col items-center opacity-80">
                                    <Store size={120} className="text-slate-300 dark:text-slate-600 mb-6" strokeWidth={1} />
                                    <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500 font-khmer">ចាប់ផ្តើមអាជីវកម្ម</h3>
                                    <p className="text-xs text-slate-400 mt-2">Start your business journey</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1e293b] flex justify-between items-center z-20">
                    {step < 3 ? (
                        <>
                            <button 
                                onClick={completeOnboarding} 
                                className="px-6 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-khmer text-sm"
                            >
                                រំលង (Skip)
                            </button>
                            <button 
                                onClick={nextStep} 
                                className="group px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-3 transform active:scale-95"
                            >
                                <span className="font-khmer">បន្តទៅមុខ</span>
                                <span className="text-xs font-normal opacity-80 font-sans pt-0.5">(Next)</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={completeOnboarding} 
                            className="w-full px-8 py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow-lg shadow-green-500/25 transition-all flex items-center justify-center gap-3 transform active:scale-[0.99]"
                        >
                            <Store size={24} />
                            <div className="flex flex-col items-start leading-none">
                                <span className="font-khmer">ចាប់ផ្តើមលក់</span>
                                <span className="text-[10px] font-normal uppercase tracking-wider font-sans mt-1">Start Selling Now</span>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopOnboarding;