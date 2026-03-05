import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Save } from 'lucide-react';
import { db } from '../src/config/firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { useData } from '../context/DataContext';


const ExpenseManager: React.FC = () => {
    const { orders, hasAccessToFeature, setCurrentView } = useData();
    // State for the new expense form
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('ចំណាយទីផ្សារ (Ads)');
    const [note, setNote] = useState('');
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const canAccess = hasAccessToFeature('reports');

    const fetchExpenses = async () => {
        setLoading(true);
        const expensesCollection = collection(db, 'sok_expenses');
        const q = query(expensesCollection, orderBy('date', 'desc'));
        const expenseSnapshot = await getDocs(q);
        const expenseList = expenseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExpenses(expenseList);
        setLoading(false);
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    // Calculate Total Revenue (This Month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const totalRevenue = orders
        .filter(order => {
            const orderDate = new Date(order.date);
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        })
        .reduce((sum, order) => sum + order.total, 0);

    const handleSaveExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) {
            alert('Please enter a valid amount.');
            return;
        }
        try {
            await addDoc(collection(db, 'sok_expenses'), {
                amount: Number(amount),
                category,
                note,
                date: date || new Date().toISOString().split('T')[0],
            });
            alert(`Saved Expense:\nDate: ${date}\nAmount: ${amount}\nCategory: ${category}\nNote: ${note}`);
            setAmount('');
            setNote('');
            fetchExpenses();
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Failed to save expense.");
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-900 font-display relative">
            <div className={`max-w-7xl mx-auto w-full space-y-8 transition-all duration-500 ${!canAccess ? 'filter blur-md pointer-events-none select-none opacity-60' : ''}`}>
                {/* Header Section */}
                <header>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3 font-khmer">
                        📊 បញ្ជីចំណាយ និង ប្រាក់ចំណេញ (P&L)
                    </h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Track your revenue, expenses, and calculate net profit to understand your business's financial health.
                    </p>
                </header>

                {/* Summary Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card 1: Revenue */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">ចំណូលសរុបខែនេះ</p>
                            <h3 className="text-3xl font-bold text-green-600 dark:text-green-400">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        </div>
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    {/* Card 2: Expenses */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">ចំណាយសរុបខែនេះ</p>
                            <h3 className="text-3xl font-bold text-red-600 dark:text-red-400">${expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        </div>
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600">
                            <TrendingDown size={24} />
                        </div>
                    </div>
                    {/* Card 3: Net Profit */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border-2 border-blue-500/50 dark:border-blue-500/50 shadow-lg flex items-start justify-between">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">ចំណេញសុទ្ធ (Net Profit)</p>
                            <h3 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">${(totalRevenue - expenses.reduce((sum, exp) => sum + exp.amount, 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <main className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                    {/* Left Column: Add Expense Form */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 font-khmer flex items-center gap-2">
                            <Plus className="text-primary" />
                            បញ្ចូលចំណាយថ្មី (Add New Expense)
                        </h3>
                        <form onSubmit={handleSaveExpense} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 font-khmer">ថ្ងៃខែ (Date)</label>
                                <input 
                                    type="date" 
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 font-khmer">ចំនួនទឹកប្រាក់ (Amount)</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-slate-500 sm:text-sm">$</span>
                                    </div>
                                    <input 
                                        type="number" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-7 pr-4 rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-primary focus:border-primary"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 font-khmer">ប្រភេទ (Category)</label>
                                <select 
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-primary focus:border-primary font-khmer"
                                >
                                    <option>ចំណាយទីផ្សារ (Ads)</option>
                                    <option>ចំណាយប្រតិបត្តិការ (Packaging)</option>
                                    <option>ចំណាយដឹកជញ្ជូន (Delivery)</option>
                                    <option>បុគ្គលិក និង រដ្ឋបាល (Salary/Rent)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 font-khmer">កត់សម្គាល់ (Note)</label>
                                <input 
                                    type="text" 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-primary focus:border-primary font-khmer"
                                    placeholder="ឧ. ប៊ូសផុសសម្រាប់ប្រូម៉ូសិន..."
                                />
                            </div>
                            <div className="pt-2">
                                <button 
                                    type="submit"
                                    className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md shadow-primary/30 transition-all flex items-center justify-center gap-2 font-khmer"
                                >
                                    <Save size={18} />
                                    រក្សាទុកចំណាយ (Save Expense)
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Expense History */}
                    <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-khmer">ប្រវត្តិចំណាយ (Expense History)</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-500 dark:text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold font-khmer">ថ្ងៃខែ (Date)</th>
                                        <th className="px-6 py-4 font-semibold font-khmer">ប្រភេទ (Category)</th>
                                        <th className="px-6 py-4 font-semibold font-khmer">កត់សម្គាល់ (Note)</th>
                                        <th className="px-6 py-4 font-semibold font-khmer text-right">ចំនួនទឹកប្រាក់ (Amount)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-10 text-slate-500">Loading...</td>
                                        </tr>
                                    ) : (
                                        expenses.map((expense) => (
                                            <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{expense.date}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-khmer">
                                                        {expense.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{expense.note}</td>
                                                <td className="px-6 py-4 text-right font-semibold text-red-600 dark:text-red-400">
                                                    -${expense.amount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {!canAccess && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/10 dark:bg-slate-900/40">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-slate-200 dark:border-slate-700 animate-in zoom-in duration-300 mx-4">
                        <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <span className="material-icons-outlined text-5xl">lock</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 font-khmer">មុខងារត្រូវបានចាក់សោរ</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-khmer leading-relaxed">
                            🔒 របាយការណ៍ចំណេញខាត (P&L) គឺសម្រាប់តែអតិថិជនកញ្ចប់ Standard និង Pro ប៉ុណ្ណោះ។
                        </p>
                        <button 
                            onClick={() => setCurrentView('pricing')}
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 font-khmer text-base"
                        >
                            <span className="material-icons-outlined">diamond</span>
                            ដំឡើងកញ្ចប់ (Upgrade)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseManager;