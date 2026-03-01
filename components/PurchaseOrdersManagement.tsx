import React, { useState } from 'react';
import { useData, PurchaseOrder } from '../context/DataContext';

const PurchaseOrdersManagement: React.FC = () => {
    const { purchaseOrders, setCurrentView } = useData();
    const [filterStatus, setFilterStatus] = useState('Draft');
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

    const filteredPOs = purchaseOrders.filter(po =>
        filterStatus === 'All' || po.status === filterStatus
    );

    const handleApprovePO = (poId: string) => {
        // Note: In a real app, this would call an API to update the PO status
        // For now, we'll display an alert
        alert(`✅ PO ${poId} approved! Status changed to 'Sent'`);
        console.log(`PO ${poId} approved - Status changed to Sent`);
    };

    const handleViewPO = (po: PurchaseOrder) => {
        setSelectedPO(po);
    };

    const handleClosePO = () => {
        setSelectedPO(null);
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2634]">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-khmer">
                            📦 ការបញ្ជាទិញ (Purchase Orders)
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-khmer">
                            គ្រប់គ្រងការបញ្ជាទិញដែលបានបង្កើតដោយស្វ័យប្រវត្ត
                        </p>
                    </div>
                    <button onClick={() => setCurrentView('inventory-list')} className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium font-khmer">
                        ← ត្រឡប់ក្រោយ
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">សរុប PO</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{purchaseOrders.length}</h3>
                                </div>
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
                                    <span className="material-icons">list</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">rix្ងសុំលក ដាច</p>
                                    <h3 className="text-2xl font-bold text-orange-600">{purchaseOrders.filter(p => p.status === 'Draft').length}</h3>
                                </div>
                                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-500">
                                    <span className="material-icons">edit</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">បានផ្ញើ</p>
                                    <h3 className="text-2xl font-bold text-blue-600">{purchaseOrders.filter(p => p.status === 'Sent').length}</h3>
                                </div>
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
                                    <span className="material-icons">send</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium font-khmer mb-1">ទទួលរួច</p>
                                    <h3 className="text-2xl font-bold text-green-600">{purchaseOrders.filter(p => p.status === 'Received').length}</h3>
                                </div>
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-500">
                                    <span className="material-icons">check_circle</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-[#1a2634] p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex gap-3">
                            {['All', 'Draft', 'Sent', 'Received', 'Pending', 'Cancelled'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        filterStatus === status
                                            ? 'bg-primary text-white'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* PO Table */}
                    <div className="bg-white dark:bg-[#1a2634] border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">PO ID</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-khmer">កាលបរិច្ឆេទ (Date)</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-khmer">ក្រុមហ័ន (Supplier)</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-khmer">ពិសេស (Items)</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-khmer">ស្ថានភាព (Status)</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {filteredPOs.length > 0 ? (
                                        filteredPOs.map(po => (
                                            <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4">
                                                    <span className="font-semibold text-slate-900 dark:text-white">
                                                        {po.id}
                                                        {po.autoGenerated && <span className="ml-2 text-xs text-orange-600 dark:text-orange-400 font-bold">🤖 AUTO</span>}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-600 dark:text-slate-300">
                                                    {new Date(po.date).toLocaleDateString('km-KH')}
                                                </td>
                                                <td className="p-4 text-slate-900 dark:text-white font-medium">
                                                    {po.supplierName}
                                                </td>
                                                <td className="p-4 text-slate-600 dark:text-slate-300">
                                                    {po.items.length} {po.items.length === 1 ? 'item' : 'items'}
                                                </td>
                                                <td className="p-4 text-slate-900 dark:text-white font-semibold">
                                                    ${po.totalAmount.toFixed(2)}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                                                        ${po.status === 'Draft' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800' : ''}
                                                        ${po.status === 'Sent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' : ''}
                                                        ${po.status === 'Received' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' : ''}
                                                        ${po.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' : ''}
                                                        ${po.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' : ''}
                                                    `}>
                                                        {po.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleViewPO(po)}
                                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                            title="View PO Details"
                                                        >
                                                            <span className="material-icons">visibility</span>
                                                        </button>
                                                        {po.status === 'Draft' && (
                                                            <button 
                                                                onClick={() => handleApprovePO(po.id)}
                                                                className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                                title="Approve PO"
                                                            >
                                                                <span className="material-icons">check_circle</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center">
                                                <div className="text-slate-500 dark:text-slate-400">
                                                    <span className="material-icons block text-3xl mb-2 opacity-50">inbox</span>
                                                    <p className="font-khmer">គ្មាន PO ក្នុងស្ថានភាព {filterStatus}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* PO Details Modal */}
            {selectedPO && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#1a2634] rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-khmer">
                                📄 PO Details: {selectedPO.id}
                            </h3>
                            <button 
                                onClick={handleClosePO}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Header Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Date</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                        {new Date(selectedPO.date).toLocaleDateString('km-KH')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Supplier</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">{selectedPO.supplierName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Status</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">{selectedPO.status}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Warehouse</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">{selectedPO.warehouse}</p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                <h4 className="font-bold mb-3 text-slate-900 dark:text-white font-khmer">ធាតុ (Items)</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800">
                                            <tr>
                                                <th className="p-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">Product</th>
                                                <th className="p-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">Qty</th>
                                                <th className="p-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">Unit Cost</th>
                                                <th className="p-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedPO.items.map((item, idx) => (
                                                <tr key={idx} className="border-t border-slate-100 dark:border-slate-700">
                                                    <td className="p-2 text-slate-900 dark:text-white">{item.productName}</td>
                                                    <td className="p-2 text-slate-900 dark:text-white">{item.quantity}</td>
                                                    <td className="p-2 text-slate-900 dark:text-white">${item.unitCost.toFixed(2)}</td>
                                                    <td className="p-2 font-semibold text-slate-900 dark:text-white">${item.total.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-bold text-slate-900 dark:text-white">Total Amount:</span>
                                    <span className="text-xl font-bold text-primary">${selectedPO.totalAmount.toFixed(2)}</span>
                                </div>
                                
                                {selectedPO.autoGenerated && (
                                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                        <p className="text-xs text-orange-800 dark:text-orange-300">
                                            <strong>🤖 Auto-Generated:</strong> This PO was automatically created when {selectedPO.triggerProductId}'s stock dropped below the {selectedPO.triggerThreshold} unit threshold.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end">
                            <button 
                                onClick={handleClosePO}
                                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium"
                            >
                                Close
                            </button>
                            {selectedPO.status === 'Draft' && (
                                <button 
                                    onClick={() => {
                                        handleApprovePO(selectedPO.id);
                                        handleClosePO();
                                    }}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-medium"
                                >
                                    ✓ Approve PO
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseOrdersManagement;
