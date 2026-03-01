import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';

const BestSellers: React.FC = () => {
    const { orders, onlineOrders, products, setCurrentView } = useData();

    // --- Analytics Logic ---
    const bestSellers = useMemo(() => {
        const itemMap = new Map<number, { id: number, name: string, sku: string, qty: number, revenue: number, image: string, stock: number }>();

        // Helper to process items
        const processItems = (orderList: any[]) => {
            orderList.forEach(order => {
                order.items.forEach((item: any) => {
                    const existing = itemMap.get(item.id);
                    // Find current stock from product list
                    const productInfo = products.find(p => p.id === item.id);
                    const currentStock = productInfo ? (productInfo.stock || 0) : 0;
                    
                    if (existing) {
                        existing.qty += item.quantity;
                        existing.revenue += item.price * item.quantity;
                    } else {
                        itemMap.set(item.id, {
                            id: item.id,
                            name: item.name,
                            sku: item.sku || productInfo?.sku || 'N/A',
                            qty: item.quantity,
                            revenue: item.price * item.quantity,
                            image: item.image,
                            stock: currentStock
                        });
                    }
                });
            });
        };

        processItems(orders);
        processItems(onlineOrders);

        return Array.from(itemMap.values()).sort((a, b) => b.qty - a.qty);
    }, [orders, onlineOrders, products]);

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                
                {/* Header */}
                <header className="flex flex-col gap-1">
                    <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <button onClick={() => setCurrentView('dashboard')} className="hover:text-primary transition-colors">គេហទំព័រ (Home)</button>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">ទំនិញលក់ដាច់បំផុត (Best Sellers)</span>
                    </nav>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mt-1 font-khmer">របាយការណ៍ទំនិញលក់ដាច់បំផុត</h1>
                </header>

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative w-full sm:w-72">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                            </span>
                            <input className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm" placeholder="ស្វែងរកទំនិញ (Search product)..." type="text" />
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                Filter
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Rank</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty Sold</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-48">Remaining Stock</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                {bestSellers.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No sales data available.</td></tr>
                                ) : (
                                    bestSellers.map((item, index) => (
                                        <tr key={item.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${index < 3 ? 'bg-slate-50/30 dark:bg-slate-800' : ''}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm border 
                                                    ${index === 0 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                                                      index === 1 ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                                      index === 2 ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                                                      'text-slate-500 border-transparent'}`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-slate-100 rounded-md border border-slate-200 overflow-hidden">
                                                        <img className="h-10 w-10 object-cover" src={item.image} alt={item.name} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">SKU: {item.sku}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-700 dark:text-slate-300 font-medium">
                                                {item.qty}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-primary dark:text-blue-400">
                                                ${item.revenue.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1 w-full max-w-[140px]">
                                                    <div className="flex justify-between text-xs mb-0.5">
                                                        <span className={`font-medium ${item.stock <= 10 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                            {item.stock <= 10 ? 'Low Stock' : 'Good'}
                                                        </span>
                                                        <span className="text-slate-500">{item.stock} left</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-1.5 dark:bg-slate-700 overflow-hidden">
                                                        <div 
                                                            className={`h-1.5 rounded-full ${item.stock <= 10 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} 
                                                            style={{ width: `${Math.min((item.stock / 100) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BestSellers;