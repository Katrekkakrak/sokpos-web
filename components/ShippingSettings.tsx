import React, { useState } from 'react';
import { useData, ShippingZone } from '../context/DataContext';
import { Edit2, Trash2, Plus, Save, X, Map } from 'lucide-react';

const ShippingSettings: React.FC = () => {
    const { shippingZones, setShippingZones } = useData();
    
    // State for inline editing
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [editingPrice, setEditingPrice] = useState('');
    
    // State for adding new zone
    const [newZoneName, setNewZoneName] = useState('');
    const [newZonePrice, setNewZonePrice] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // Handle start editing
    const startEditing = (zone: ShippingZone) => {
        setEditingId(zone.id);
        setEditingName(zone.name);
        setEditingPrice(zone.price.toString());
    };

    // Handle save edit
    const saveEdit = (zoneId: string) => {
        if (!editingName.trim() || !editingPrice || parseFloat(editingPrice) < 0) {
            alert('Please enter valid name and price');
            return;
        }
        
        const updated = shippingZones.map(z => 
            z.id === zoneId 
                ? { ...z, name: editingName, price: parseFloat(editingPrice) }
                : z
        );
        setShippingZones(updated);
        setEditingId(null);
    };

    // Handle cancel edit
    const cancelEdit = () => {
        setEditingId(null);
        setEditingName('');
        setEditingPrice('');
    };

    // Handle delete zone
    const deleteZone = (zoneId: string) => {
        if (window.confirm('Are you sure you want to delete this shipping zone?')) {
            setShippingZones(shippingZones.filter(z => z.id !== zoneId));
        }
    };

    // Handle add new zone
    const addNewZone = () => {
        if (!newZoneName.trim() || !newZonePrice || parseFloat(newZonePrice) < 0) {
            alert('Please enter valid name and price');
            return;
        }

        const newZone: ShippingZone = {
            id: `zone-${Date.now()}`,
            name: newZoneName,
            price: parseFloat(newZonePrice)
        };

        setShippingZones([...shippingZones, newZone]);
        setNewZoneName('');
        setNewZonePrice('');
        setShowAddForm(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Map size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-khmer">ភូមិកាដឹក (Shipping Zones)</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage your delivery zones and pricing</p>
                </div>
            </div>

            {/* Add New Zone Form */}
            {!showAddForm ? (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full md:w-auto bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                    <Plus size={20} />
                    <span className="font-khmer">បន្ថែមបង្គោលដឹកថ្មី (Add New Zone)</span>
                </button>
            ) : (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-khmer">បង្កើតបង្គោលដឹកថ្មី</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Zone Name</label>
                            <input
                                type="text"
                                value={newZoneName}
                                onChange={(e) => setNewZoneName(e.target.value)}
                                placeholder="e.g., ភ្នំពេញ (ក្នុងក្រុង)"
                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={newZonePrice}
                                onChange={(e) => setNewZonePrice(e.target.value)}
                                placeholder="e.g., 1.50"
                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                        </div>
                        <div className="flex gap-2 items-end">
                            <button
                                onClick={addNewZone}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                <Plus size={18} />
                                <span className="hidden sm:inline">Add</span>
                            </button>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                            >
                                <X size={18} />
                                <span className="hidden sm:inline">Cancel</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Zones List */}
            <div className="space-y-3">
                {shippingZones.length === 0 ? (
                    <div className="bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center">
                        <Map size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" strokeWidth={1} />
                        <p className="text-slate-500 dark:text-slate-400 font-khmer text-lg">មិនទាន់មានបង្គោលដឹក</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm">No shipping zones yet. Create one to get started!</p>
                    </div>
                ) : (
                    shippingZones.map((zone) => (
                        <div
                            key={zone.id}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            {editingId === zone.id ? (
                                // Edit Mode
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Zone Name</label>
                                        <input
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Price ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={editingPrice}
                                            onChange={(e) => setEditingPrice(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => saveEdit(zone.id)}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all active:scale-[0.98] text-sm"
                                        >
                                            <Save size={16} />
                                            <span className="hidden sm:inline">Save</span>
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all text-sm"
                                        >
                                            <X size={16} />
                                            <span className="hidden sm:inline">Cancel</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white font-khmer mb-1">{zone.name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Zone ID: <span className="font-mono text-xs">{zone.id}</span></p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-3xl font-bold text-primary">${zone.price.toFixed(2)}</p>
                                            <p className="text-xs text-slate-500">Standard Rate</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => startEditing(zone)}
                                                className="p-2.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-all"
                                                title="Edit Zone"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => deleteZone(zone.id)}
                                                className="p-2.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-all"
                                                title="Delete Zone"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Info Box */}
            {shippingZones.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-200 font-khmer">
                        <span className="font-semibold">💡 Tip:</span> These zones will appear in the "Zone" dropdown when creating online orders, allowing customers to select delivery areas quickly.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ShippingSettings;
