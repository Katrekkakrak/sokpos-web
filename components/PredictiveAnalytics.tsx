import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';

interface ForecastData {
    productId: number;
    productName: string;
    sku?: string;
    baseUnit: string;
    soldLast30Days: number;
    averageDailySales: number;
    forecastedNeed30Days: number;
    currentStock: number;
    stockGap: number; // Difference: forecastedNeed - currentStock
    recommendation: 'sufficient' | 'reorder' | 'critical';
    recommendedQty: number;
    confidenceScore: number; // 0-100 based on data points
}

const PredictiveAnalytics: React.FC = () => {
    const { products, orders, setCurrentView } = useData();
    const [sortBy, setSortBy] = useState<'name' | 'gap' | 'sold' | 'forecast'>('gap');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Main forecasting algorithm
    const forecastData = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Aggregate sales for each product in the last 30 days
        const salesMap = new Map<number, { quantity: number; orderCount: number }>();

        orders.forEach(order => {
            const orderDate = new Date(order.date);
            if (orderDate >= thirtyDaysAgo && orderDate <= now) {
                order.items?.forEach(item => {
                    const productId = item.id || item.productId;
                    if (productId) {
                        const current = salesMap.get(productId) || { quantity: 0, orderCount: 0 };
                        
                        // Account for UOM multiplier: if item has multiplier, it's already the base unit count
                        // Otherwise, use quantity as-is
                        const quantityInBaseUnits = item.multiplier 
                            ? item.quantity * item.multiplier 
                            : item.quantity;

                        current.quantity += quantityInBaseUnits;
                        current.orderCount += 1;
                        salesMap.set(productId, current);
                    }
                });
            }
        });

        // Generate forecast for each product
        const forecast: ForecastData[] = products.map(product => {
            const sales = salesMap.get(product.id) || { quantity: 0, orderCount: 0 };
            
            const soldLast30Days = sales.quantity;
            const averageDailySales = soldLast30Days / 30;
            const forecastedNeed30Days = Math.ceil(averageDailySales * 30);
            const currentStock = product.stock;
            const stockGap = forecastedNeed30Days - currentStock;

            // Determine recommendation
            let recommendation: 'sufficient' | 'reorder' | 'critical' = 'sufficient';
            let recommendedQty = 0;

            if (stockGap > 0) {
                recommendedQty = Math.ceil(stockGap * 1.2); // Order 20% extra as safety buffer
                
                // Critical if we'll run out within 5 days
                const daysOfStockRemaining = currentStock / (averageDailySales || 1);
                recommendation = daysOfStockRemaining < 5 ? 'critical' : 'reorder';
            }

            // Confidence score: higher if more sales data points
            // Max confidence (100) at 30+ orders in 30 days, 0 if no orders
            const confidenceScore = sales.orderCount === 0 ? 0 : Math.min(100, (sales.orderCount / 30) * 100);

            return {
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                baseUnit: product.baseUnit || 'unit',
                soldLast30Days,
                averageDailySales,
                forecastedNeed30Days,
                currentStock,
                stockGap,
                recommendation,
                recommendedQty,
                confidenceScore
            };
        }).filter(f => f.soldLast30Days > 0); // Only show products with sales

        // Sort
        return forecast.sort((a, b) => {
            let comparison = 0;
            
            if (sortBy === 'gap') {
                comparison = a.stockGap - b.stockGap;
            } else if (sortBy === 'sold') {
                comparison = a.soldLast30Days - b.soldLast30Days;
            } else if (sortBy === 'forecast') {
                comparison = a.forecastedNeed30Days - b.forecastedNeed30Days;
            } else {
                comparison = a.productName.localeCompare(b.productName);
            }

            return sortOrder === 'desc' ? -comparison : comparison;
        });
    }, [products, orders, sortBy, sortOrder]);

    // Summary stats
    const stats = useMemo(() => {
        const needReorder = forecastData.filter(f => f.recommendation !== 'sufficient').length;
        const critical = forecastData.filter(f => f.recommendation === 'critical').length;
        const totalSold = forecastData.reduce((sum, f) => sum + f.soldLast30Days, 0);
        const avgConfidence = forecastData.length > 0 
            ? Math.round(forecastData.reduce((sum, f) => sum + f.confidenceScore, 0) / forecastData.length)
            : 0;

        return { needReorder, critical, totalSold, avgConfidence };
    }, [forecastData]);

    const handleSort = (column: 'name' | 'gap' | 'sold' | 'forecast') => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2634]">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-khmer">
                            🔮 ការព្យាករណ៍ && វិស្តាវិទ្យា provinces (Predictive Analytics)
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-khmer">
                            AI-powered sales forecasting & inventory recommendations for next 30 days
                        </p>
                    </div>
                    <button 
                        onClick={() => setCurrentView('dashboard')} 
                        className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium font-khmer"
                    >
                        ← ត្រឡប់ក្រោយ
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">ឧបករណ៍ដែលលក់</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{forecastData.length}</h3>
                                </div>
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
                                    <span className="material-icons">inventory_2</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">ចំនួនលក់ (30D)</p>
                                    <h3 className="text-2xl font-bold text-green-600">{stats.totalSold}</h3>
                                </div>
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-500">
                                    <span className="material-icons">trending_up</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">ចាំបាច់ការ (Reorder)</p>
                                    <h3 className="text-2xl font-bold text-orange-600">{stats.needReorder}</h3>
                                </div>
                                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-500">
                                    <span className="material-icons">warning</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">អាច់រូបភាពឱ្យ</p>
                                    <h3 className="text-2xl font-bold text-primary">{stats.avgConfidence}%</h3>
                                </div>
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
                                    <span className="material-icons">assessment</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alerts */}
                    {stats.critical > 0 && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-800 dark:text-red-300">
                                <strong>🚨 Critical Alert:</strong> {stats.critical} product(s) will run out of stock within 5 days based on current sales velocity!
                            </p>
                        </div>
                    )}

                    {forecastData.length === 0 && (
                        <div className="p-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400">
                            <span className="material-icons block text-3xl mb-2 opacity-50">no_data</span>
                            <p>No sales data available for forecasting. Make some sales first!</p>
                        </div>
                    )}

                    {/* Forecast Table */}
                    {forecastData.length > 0 && (
                        <div className="bg-white dark:bg-[#1a2634] border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden flex flex-col">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th 
                                                onClick={() => handleSort('name')}
                                                className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                Product Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th 
                                                onClick={() => handleSort('sold')}
                                                className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                Sold (30D) {sortBy === 'sold' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Avg Daily
                                            </th>
                                            <th 
                                                onClick={() => handleSort('forecast')}
                                                className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                Forecast (30D) {sortBy === 'forecast' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Current Stock
                                            </th>
                                            <th 
                                                onClick={() => handleSort('gap')}
                                                className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                Gap {sortBy === 'gap' && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Confidence
                                            </th>
                                            <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                                                Recommendation
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {forecastData.map((forecast) => (
                                            <tr key={forecast.productId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-slate-900 dark:text-white">{forecast.productName}</span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">SKU: {forecast.sku || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-bold text-slate-900 dark:text-white">
                                                        {forecast.soldLast30Days} {forecast.baseUnit}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-600 dark:text-slate-300">
                                                    {forecast.averageDailySales.toFixed(1)} {forecast.baseUnit}/day
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-bold text-blue-600 dark:text-blue-400">
                                                        {forecast.forecastedNeed30Days} {forecast.baseUnit}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`font-bold ${
                                                        forecast.currentStock >= forecast.forecastedNeed30Days
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : 'text-orange-600 dark:text-orange-400'
                                                    }`}>
                                                        {forecast.currentStock} {forecast.baseUnit}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`font-bold ${
                                                        forecast.stockGap > 0
                                                            ? 'text-red-600 dark:text-red-400'
                                                            : 'text-green-600 dark:text-green-400'
                                                    }`}>
                                                        {forecast.stockGap > 0 ? '+' : ''}{forecast.stockGap} {forecast.baseUnit}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                            <div 
                                                                className={`h-2 rounded-full transition-all ${
                                                                    forecast.confidenceScore >= 75 ? 'bg-green-500' :
                                                                    forecast.confidenceScore >= 50 ? 'bg-yellow-500' :
                                                                    'bg-orange-500'
                                                                }`}
                                                                style={{ width: `${forecast.confidenceScore}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 min-w-[35px]">
                                                            {Math.round(forecast.confidenceScore)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {forecast.recommendation === 'sufficient' ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                            ✓ Sufficient
                                                        </span>
                                                    ) : forecast.recommendation === 'critical' ? (
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                                                                🔴 CRITICAL: +{forecast.recommendedQty}
                                                            </span>
                                                            <span className="text-xs text-red-600 dark:text-red-400 font-semibold">
                                                                Will stockout in {Math.ceil(forecast.currentStock / (forecast.averageDailySales || 1))} days
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                                                                ⚠ Reorder +{forecast.recommendedQty}
                                                            </span>
                                                            <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                                                                Stock runs out in {Math.ceil(forecast.currentStock / (forecast.averageDailySales || 1))} days (est.)
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-sm">ឧទាហរណ៍របស់សូលា (Legend)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-start gap-3">
                                <span className="text-green-600 font-bold">✓ Sufficient</span>
                                <span className="text-slate-600 dark:text-slate-400">Current stock meets 30-day forecast</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-orange-600 font-bold">⚠ Reorder</span>
                                <span className="text-slate-600 dark:text-slate-400">Recommend ordering to avoid stockout</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-red-600 font:bold">🔴 Critical</span>
                                <span className="text-slate-600 dark:text-slate-400">Will stockout within 5 days at current rate</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PredictiveAnalytics;
