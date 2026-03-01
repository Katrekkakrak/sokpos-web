import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import * as LucideIcons from 'lucide-react';
import { X, Settings, Plus, Save, Trash2, Edit2, Check } from 'lucide-react';

interface ManageStagesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PREDEFINED_COLORS = [
    { name: 'Blue', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', hex: 'bg-blue-500' },
    { name: 'Emerald', class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', hex: 'bg-emerald-500' },
    { name: 'Yellow', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300', hex: 'bg-yellow-500' },
    { name: 'Orange', class: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300', hex: 'bg-orange-500' },
    { name: 'Purple', class: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300', hex: 'bg-purple-500' },
    { name: 'Pink', class: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300', hex: 'bg-pink-500' },
    { name: 'Red', class: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300', hex: 'bg-red-500' },
    { name: 'Slate', class: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300', hex: 'bg-slate-500' }
];

const POPULAR_ICONS = ['UserPlus', 'CheckCircle', 'Crown', 'Clock', 'Bookmark', 'Target', 'Star', 'Heart', 'Zap', 'Shield', 'Flame', 'Flag'];

const ManageStagesModal: React.FC<ManageStagesModalProps> = ({ isOpen, onClose }) => {
    const { contactStages, setContactStages } = useData();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempStage, setTempStage] = useState({ name: '', colorClass: '', iconName: '' });

    if (!isOpen) return null;

    const handleEdit = (stage: any) => {
        setEditingId(stage.id);
        setTempStage({ name: stage.name, colorClass: stage.colorClass, iconName: stage.iconName });
    };

    const handleSave = () => {
        if (!tempStage.name.trim()) return alert("សូមបញ្ចូលឈ្មោះស្ថានភាព! (Enter stage name)");
        
        if (editingId === 'new') {
            const newStage = {
                id: `stage_${Date.now()}`,
                name: tempStage.name.trim(),
                colorClass: tempStage.colorClass || PREDEFINED_COLORS[0].class,
                iconName: tempStage.iconName || 'Target',
                isDefault: false
            };
            setContactStages([...(contactStages || []), newStage]);
        } else {
            const updated = (contactStages || []).map(s => 
                s.id === editingId ? { ...s, ...tempStage } : s
            );
            setContactStages(updated);
        }
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        if (confirm("តើអ្នកពិតជាចង់លុបស្ថានភាពនេះមែនទេ? (Are you sure you want to delete this stage?)")) {
            setContactStages((contactStages || []).filter(s => s.id !== id));
        }
    };

    const handleAddNew = () => {
        setEditingId('new');
        setTempStage({ name: '', colorClass: PREDEFINED_COLORS[0].class, iconName: 'Target' });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] transition-opacity flex items-center justify-center p-4 font-display">
            <div className="relative z-50 w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-0 text-left shadow-2xl transition-all flex flex-col max-h-[90vh] animate-fade-in-up">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-6 py-4 bg-white dark:bg-slate-800 sticky top-0 z-10">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-khmer">
                            <Settings className="text-primary w-5 h-5" />
                            គ្រប់គ្រងស្ថានភាព (Manage Stages)
                        </h3>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-900/20 space-y-4">
                    {(contactStages || []).map((stage) => {
                        const isEditing = editingId === stage.id;
                        const Icon = (LucideIcons as any)[isEditing ? tempStage.iconName : stage.iconName] || LucideIcons.Target;
                        const currentColor = isEditing ? tempStage.colorClass : stage.colorClass;

                        return (
                            <div key={stage.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm transition-all">
                                {isEditing ? (
                                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">ឈ្មោះ (Name)</label>
                                            <input 
                                                autoFocus
                                                type="text" value={tempStage.name} onChange={e => setTempStage({...tempStage, name: e.target.value})}
                                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white text-sm py-2"
                                                placeholder="e.g. New Lead"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">ពណ៌ (Color)</label>
                                            <div className="flex flex-wrap gap-2">
                                                {PREDEFINED_COLORS.map(c => (
                                                    <button 
                                                        key={c.name} onClick={() => setTempStage({...tempStage, colorClass: c.class})}
                                                        className={`w-8 h-8 rounded-full ${c.hex} flex items-center justify-center transition-transform hover:scale-110 ${tempStage.colorClass === c.class ? 'ring-2 ring-offset-2 ring-primary dark:ring-offset-slate-800' : ''}`}
                                                    >
                                                        {tempStage.colorClass === c.class && <Check className="w-4 h-4 text-white" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">រូបតំណាង (Icon)</label>
                                            <div className="flex flex-wrap gap-2">
                                                {POPULAR_ICONS.map(iconName => {
                                                    const IconCmp = (LucideIcons as any)[iconName];
                                                    return (
                                                        <button 
                                                            key={iconName} onClick={() => setTempStage({...tempStage, iconName})}
                                                            className={`p-2 rounded-lg border transition-all ${tempStage.iconName === iconName ? 'bg-primary/10 border-primary text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                                        >
                                                            <IconCmp size={18} />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2">
                                            <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">បោះបង់</button>
                                            <button onClick={handleSave} className="px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-lg flex items-center gap-1"><Save size={14}/> រក្សាទុក</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between group">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border border-black/5 dark:border-white/5 ${currentColor}`}>
                                            <Icon size={14} strokeWidth={2.5} />
                                            {stage.name}
                                        </span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(stage)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md"><Edit2 size={16} /></button>
                                            {!stage.isDefault && (
                                                <button onClick={() => handleDelete(stage.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={16} /></button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {editingId !== 'new' && (
                        <button onClick={handleAddNew} className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 font-medium hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-primary transition-colors flex items-center justify-center gap-2">
                            <Plus size={18} /> បន្ថែមស្ថានភាពថ្មី (Add New)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageStagesModal;