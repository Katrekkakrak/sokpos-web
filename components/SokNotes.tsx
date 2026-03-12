import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useData } from '../context/DataContext';
import {
    collection, addDoc, updateDoc, deleteDoc,
    doc, onSnapshot, serverTimestamp, query, orderBy
} from 'firebase/firestore';
import { db } from '../src/config/firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface SokNote {
    id: string;
    title: string;
    content: string;
    category: 'daily' | 'customer' | 'product' | 'task' | 'idea';
    tags: string[];
    isPinned: boolean;
    linkedCustomerId?: string;
    linkedCustomerName?: string;
    linkedCustomerPhone?: string;
    linkedCustomerAvatar?: string;
    linkedProductId?: string;
    linkedProductName?: string;
    linkedProductStock?: number;
    linkedProductPrice?: number;
    linkedOrderId?: string;
    reminder?: string;
    aiSummary?: string;
    createdAt: any;
    updatedAt: any;
}

const CATEGORIES = [
    { id: 'all',      label: 'ទាំងអស់',         icon: '📋', color: 'text-slate-400' },
    { id: 'daily',    label: 'Daily Log',         icon: '📅', color: 'text-cyan-400' },
    { id: 'customer', label: 'Customer',           icon: '👥', color: 'text-indigo-400' },
    { id: 'product',  label: 'Product/Supplier',  icon: '📦', color: 'text-yellow-400' },
    { id: 'task',     label: 'Tasks',             icon: '🎯', color: 'text-green-400' },
    { id: 'idea',     label: 'Ideas & Strategy',  icon: '💡', color: 'text-purple-400' },
];

const CAT_COLORS: Record<string, string> = {
    daily:    'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    customer: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    product:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    task:     'bg-green-500/10 text-green-400 border-green-500/30',
    idea:     'bg-purple-500/10 text-purple-400 border-purple-500/30',
};

const DATE_PATTERNS = [
    /\b(\d{4}-\d{2}-\d{2})\b/,
    /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/,
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}/i,
    /\b(tomorrow|ស្អែក|ថ្ងៃស្អែក)\b/i,
    /ខែ(មករា|កុម្ភៈ|មីនា|មេសា|ឧសភា|មិថុនា|កក្កដា|សីហា|កញ្ញា|តុលា|វិច្ឆិកា|ធ្នូ)/,
];

// ─────────────────────────────────────────────
// Gemini helper
// ─────────────────────────────────────────────
const callGemini = async (prompt: string): Promise<string> => {
    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error('VITE_GEMINI_API_KEY រកមិនឃើញក្នុង .env');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const result = await model.generateContent(prompt);
    return result.response.text();
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const SokNotes: React.FC = () => {
    const { user, customers, products, onlineOrders, setCurrentView, selectOnlineOrder, setSelectedContact } = useData();
    const tenantId = user?.tenantId || user?.uid || '';

    // ── Core state ──
    const [notes, setNotes]                   = useState<SokNote[]>([]);
    const [loading, setLoading]               = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery]       = useState('');
    const [selectedNote, setSelectedNote]     = useState<SokNote | null>(null);
    const [isEditing, setIsEditing]           = useState(false);

    // ── Editor state ──
    const [editTitle, setEditTitle]           = useState('');
    const [editContent, setEditContent]       = useState('');
    const [editCategory, setEditCategory]     = useState<SokNote['category']>('daily');
    const [editTags, setEditTags]             = useState('');
    const [editReminder, setEditReminder]     = useState('');
    const [editPinned, setEditPinned]         = useState(false);
    const [editLinkedCustomer, setEditLinkedCustomer] = useState({ id: '', name: '', phone: '', avatar: '' });
    const [editLinkedProduct, setEditLinkedProduct]   = useState({ id: '', name: '', stock: 0, price: 0 });
    const [editLinkedOrder, setEditLinkedOrder]       = useState({ id: '', label: '' });
    const [showLinkPanel, setShowLinkPanel]           = useState(false);
    const [linkSearch, setLinkSearch]                 = useState('');
    const [isSaving, setIsSaving]             = useState(false);
    const [saveStatus, setSaveStatus]         = useState('');

    // ── AI Panel state ──
    const [aiInput, setAiInput]               = useState('');
    const [aiResponse, setAiResponse]         = useState('');
    const [aiLoading, setAiLoading]           = useState(false);
    const [showAiPanel, setShowAiPanel]       = useState(true);

    // ── Phase 2A: /ai inline popup ──
    const [inlinePopup, setInlinePopup]       = useState(false);
    const [inlineQuery, setInlineQuery]       = useState('');
    const [inlineResult, setInlineResult]     = useState('');
    const [inlineLoading, setInlineLoading]   = useState(false);

    // ── Phase 2B: Smart date detection ──
    const [dateDetected, setDateDetected]     = useState('');
    const [showDateBanner, setShowDateBanner] = useState(false);

    // ── Phase 2C: Auto AI summary on open ──
    const [autoSummary, setAutoSummary]       = useState('');
    const [autoSummaryLoading, setAutoSummaryLoading] = useState(false);

    const contentRef  = useRef<HTMLTextAreaElement>(null);
    const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Firestore listener ──
    useEffect(() => {
        if (!tenantId) return;
        const q = query(
            collection(db, 'tenants', tenantId, 'sokNotes'),
            orderBy('updatedAt', 'desc')
        );
        const unsub = onSnapshot(q, snap => {
            setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() } as SokNote)));
            setLoading(false);
        });
        return () => unsub();
    }, [tenantId]);

    // ── Auto-save ──
    useEffect(() => {
        if (!isEditing || !selectedNote) return;
        setSaveStatus('saving');
        if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
        autoSaveRef.current = setTimeout(() => handleSave(true), 1800);
        return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
    }, [editTitle, editContent, editCategory, editTags, editReminder, editPinned]);

    // ── Filtered notes ──
    const filteredNotes = notes.filter(n => {
        const matchCat = activeCategory === 'all' || n.category === activeCategory;
        const q = searchQuery.toLowerCase();
        return matchCat && (!q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    });
    const pinnedNotes   = filteredNotes.filter(n => n.isPinned);
    const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);

    // ── CRUD ──
    const handleNewNote = async () => {
        if (!tenantId) return;
        const ref = await addDoc(collection(db, 'tenants', tenantId, 'sokNotes'), {
            title: 'Note ថ្មី', content: '', category: 'daily',
            tags: [], isPinned: false,
            createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        });
        openNote({ id: ref.id, title: 'Note ថ្មី', content: '', category: 'daily',
            tags: [], isPinned: false, createdAt: new Date(), updatedAt: new Date() });
    };

    const openNote = useCallback((note: SokNote) => {
        setSelectedNote(note);
        setEditTitle(note.title);
        setEditContent(note.content);
        setEditCategory(note.category);
        setEditTags((note.tags || []).join(', '));
        setEditReminder(note.reminder || '');
        setEditPinned(note.isPinned);
        setEditLinkedCustomer({ id: note.linkedCustomerId || '', name: note.linkedCustomerName || '', phone: note.linkedCustomerPhone || '', avatar: note.linkedCustomerAvatar || '' });
        setEditLinkedProduct({ id: note.linkedProductId || '', name: note.linkedProductName || '', stock: note.linkedProductStock || 0, price: note.linkedProductPrice || 0 });
        setEditLinkedOrder({ id: note.linkedOrderId || '', label: note.linkedOrderId ? `#${note.linkedOrderId.slice(-6).toUpperCase()}` : '' });
        setShowLinkPanel(false);
        setLinkSearch('');
        setIsEditing(true);
        setAiResponse('');
        setInlinePopup(false);
        setShowDateBanner(false);
        setAutoSummary('');
        if (note.content && note.content.length > 100) {
            generateAutoSummary(note.title, note.content);
        }
    }, []);

    const handleSave = async (silent = false) => {
        if (!selectedNote || !tenantId) return;
        if (!silent) setIsSaving(true);
        try {
            await updateDoc(doc(db, 'tenants', tenantId, 'sokNotes', selectedNote.id), {
                title:              editTitle || 'Untitled',
                content:            editContent,
                category:           editCategory,
                tags:               editTags.split(',').map(t => t.trim()).filter(Boolean),
                isPinned:           editPinned,
                reminder:           editReminder || null,
                linkedCustomerId:    editLinkedCustomer.id || null,
                linkedCustomerName:  editLinkedCustomer.name || null,
                linkedCustomerPhone: editLinkedCustomer.phone || null,
                linkedCustomerAvatar:editLinkedCustomer.avatar || null,
                linkedProductId:     editLinkedProduct.id || null,
                linkedProductName:   editLinkedProduct.name || null,
                linkedProductStock:  editLinkedProduct.stock || null,
                linkedProductPrice:  editLinkedProduct.price || null,
                linkedOrderId:       editLinkedOrder.id || null,
                updatedAt:          serverTimestamp(),
            });
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(''), 2500);
        } catch (e) {
            console.error('Save error:', e);
        } finally {
            if (!silent) setIsSaving(false);
        }
    };

    const handleDelete = async (note: SokNote) => {
        if (!tenantId || !window.confirm(`លុប "${note.title}"?`)) return;
        await deleteDoc(doc(db, 'tenants', tenantId, 'sokNotes', note.id));
        if (selectedNote?.id === note.id) { setSelectedNote(null); setIsEditing(false); }
    };

    const togglePin = async (note: SokNote, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!tenantId) return;
        await updateDoc(doc(db, 'tenants', tenantId, 'sokNotes', note.id), {
            isPinned: !note.isPinned, updatedAt: serverTimestamp(),
        });
        if (selectedNote?.id === note.id) setEditPinned(p => !p);
    };

    // ── AI Panel ──
    const handleAiAsk = async () => {
        if (!aiInput.trim()) return;
        setAiLoading(true);
        setAiResponse('');
        try {
            const text = await callGemini(
`អ្នកជា Sok AI ជំនួយការ Note ។ ឆ្លើយជាខ្មែរ (ឬ English បើ user សុំ)។
Note title: "${editTitle}"
Note content: "${editContent.slice(0, 500)}"
User command: "${aiInput}"
Rules: summarize→សង្ខេបខ្លី, tasks→list checkboxes [ ], translate→EN, improve→rewrite, draft email→formal ។
ឆ្លើយខ្លី ច្បាស់ ។`
            );
            setAiResponse(text);
        } catch (e: any) {
            setAiResponse(e.message || 'AI error ។ សូម try again ។');
        } finally {
            setAiLoading(false);
            setAiInput('');
        }
    };

    // ── Phase 2C: Auto-summarize ──
    const generateAutoSummary = async (title: string, content: string) => {
        setAutoSummaryLoading(true);
        try {
            const text = await callGemini(
`សង្ខេប note ១-២ sentences ជាខ្មែរ:
Title: "${title}"
Content: "${content.slice(0, 400)}"
ឆ្លើយខ្លីបំផុត ។`
            );
            setAutoSummary(text.trim());
        } catch {
            setAutoSummary('');
        } finally {
            setAutoSummaryLoading(false);
        }
    };

    // ── Phase 2A: Content change ──
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        const cursor = e.target.selectionStart;
        setEditContent(val);

        // Detect /ai command on current line
        const lines = val.slice(0, cursor).split('\n');
        const currentLine = lines[lines.length - 1];
        const aiMatch = currentLine.match(/^\/ai\s+(.+)$/i);
        if (aiMatch) {
            setInlineQuery(aiMatch[1].trim());
            setInlinePopup(true);
            setInlineResult('');
        } else if (!currentLine.includes('/ai') && inlinePopup) {
            setInlinePopup(false);
        }

        // Phase 2B: Smart date detection
        if (!editReminder) {
            let found = false;
            for (const pattern of DATE_PATTERNS) {
                const match = val.match(pattern);
                if (match) {
                    setDateDetected(match[0]);
                    setShowDateBanner(true);
                    found = true;
                    break;
                }
            }
            if (!found) setShowDateBanner(false);
        }
    };

    // Execute inline AI
    const handleInlineAi = async () => {
        if (!inlineQuery) return;
        setInlineLoading(true);
        try {
            const text = await callGemini(
`Sok AI inline ។ ឆ្លើយខ្លីជាខ្មែរ (ឬ EN បើ user សុំ) max 5 lines ។
Context: "${editTitle}" — "${editContent.slice(0, 200)}"
Command: "${inlineQuery}"
ឆ្លើយ concise ។`
            );
            setInlineResult(text.trim());
        } catch {
            setInlineResult('AI error ។');
        } finally {
            setInlineLoading(false);
        }
    };

    // Insert inline result → replace /ai line
    const insertInlineResult = () => {
        const lines = editContent.split('\n');
        const aiIdx = lines.findIndex(l => /^\/ai\s+/i.test(l.trim()));
        if (aiIdx !== -1) lines[aiIdx] = inlineResult;
        else lines.push(inlineResult);
        setEditContent(lines.join('\n'));
        setInlinePopup(false);
        setInlineResult('');
    };

    // Apply date as reminder
    const applyDateReminder = (raw: string) => {
        let iso = raw;
        const parts = raw.split(/[\/\-\.]/);
        if (parts.length === 3 && parts[0].length <= 2) {
            const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            iso = `${year}-${parts[0].padStart(2,'0')}-${parts[1].padStart(2,'0')}`;
        } else if (/tomorrow|ស្អែក/i.test(raw)) {
            const d = new Date(); d.setDate(d.getDate() + 1);
            iso = d.toISOString().slice(0, 10);
        }
        setEditReminder(iso);
        setShowDateBanner(false);
    };

    const formatDate = (ts: any) => {
        if (!ts) return '';
        const d = ts?.toDate ? ts.toDate() : new Date(ts);
        const diff = (Date.now() - d.getTime()) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // ─────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────
    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-950 text-slate-100 overflow-hidden">

            {/* ══ SIDEBAR ══ */}
            <div className="w-52 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm">✏️</div>
                        <div>
                            <div className="text-sm font-bold font-khmer">Sok Notes</div>
                            <div className="text-[10px] text-slate-500 font-khmer">កំណត់ហេតុអាជីវកម្ម</div>
                        </div>
                    </div>
                    <button onClick={handleNewNote}
                        className="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold flex items-center justify-center gap-1 hover:opacity-90 transition-opacity font-khmer">
                        <span className="material-icons-outlined text-sm">add</span>
                        Note ថ្មី
                    </button>
                </div>

                <div className="mx-3 my-2">
                    <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 border border-slate-700">
                        <span className="material-icons-outlined text-slate-500" style={{ fontSize: 14 }}>search</span>
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="ស្វែងរក..."
                            className="bg-transparent text-xs outline-none text-slate-200 placeholder-slate-500 w-full font-khmer" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 py-1">
                    {CATEGORIES.map(cat => (
                        <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-0.5 transition-all font-khmer ${
                                activeCategory === cat.id
                                    ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}>
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                            <span className="ml-auto text-[10px] bg-slate-700 px-1.5 py-0.5 rounded-full text-slate-400">
                                {cat.id === 'all' ? notes.length : notes.filter(n => n.category === cat.id).length}
                            </span>
                        </button>
                    ))}

                    {notes.filter(n => n.isPinned).length > 0 && (
                        <div className="mt-3">
                            <div className="text-[10px] uppercase tracking-widest text-slate-600 px-3 mb-1">⭐ Pinned</div>
                            {notes.filter(n => n.isPinned).map(n => (
                                <button key={n.id} onClick={() => openNote(n)}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] mb-0.5 truncate transition-all font-khmer ${
                                        selectedNote?.id === n.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'
                                    }`}>
                                    📌 {n.title}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ══ NOTE LIST ══ */}
            <div className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col flex-shrink-0">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <div className="text-sm font-semibold font-khmer">
                        {CATEGORIES.find(c => c.id === activeCategory)?.icon}{' '}
                        {CATEGORIES.find(c => c.id === activeCategory)?.label}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{filteredNotes.length} notes</span>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {loading ? (
                        <div className="flex items-center justify-center h-32 text-slate-500 text-xs font-khmer">Loading...</div>
                    ) : filteredNotes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-slate-600 text-xs gap-2">
                            <span className="text-2xl">📝</span>
                            <span className="font-khmer">មិនទាន់មាន note ទេ</span>
                        </div>
                    ) : (
                        <>
                            {pinnedNotes.map(note => (
                                <NoteCard key={note.id} note={note} isActive={selectedNote?.id === note.id}
                                    onClick={() => openNote(note)} onPin={e => togglePin(note, e)}
                                    onDelete={() => handleDelete(note)} formatDate={formatDate} />
                            ))}
                            {pinnedNotes.length > 0 && unpinnedNotes.length > 0 && (
                                <div className="text-[10px] text-slate-600 px-2 py-1 uppercase tracking-widest">Others</div>
                            )}
                            {unpinnedNotes.map(note => (
                                <NoteCard key={note.id} note={note} isActive={selectedNote?.id === note.id}
                                    onClick={() => openNote(note)} onPin={e => togglePin(note, e)}
                                    onDelete={() => handleDelete(note)} formatDate={formatDate} />
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* ══ EDITOR ══ */}
            {isEditing && selectedNote ? (
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Toolbar */}
                    <div className="px-5 py-2 border-b border-slate-800 bg-slate-900 flex items-center gap-2 flex-shrink-0 flex-wrap">
                        <select value={editCategory} onChange={e => setEditCategory(e.target.value as SokNote['category'])}
                            className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-300 outline-none font-khmer">
                            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                            ))}
                        </select>

                        <button onClick={() => setEditPinned(p => !p)}
                            className={`text-xs px-2 py-1.5 rounded-lg border transition-all font-khmer ${
                                editPinned
                                    ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-yellow-400'
                            }`}>
                            ⭐ Pin
                        </button>

                        <div className="flex items-center gap-1">
                            <span className="material-icons-outlined text-slate-500" style={{ fontSize: 14 }}>alarm</span>
                            <input type="date" value={editReminder} onChange={e => setEditReminder(e.target.value)}
                                className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-300 outline-none" />
                        </div>

                        <div className="flex-1" />

                        {/* Phase 2 hint */}
                        <div className="hidden sm:flex items-center gap-1 text-[10px] text-indigo-400/50 border border-indigo-500/20 rounded-lg px-2 py-1">
                            <span className="material-icons-outlined" style={{ fontSize: 11 }}>auto_awesome</span>
                            <span className="font-mono">វាយ /ai [command]</span>
                        </div>

                        <button onClick={() => setShowAiPanel(p => !p)}
                            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-all font-khmer ${
                                showAiPanel
                                    ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                                    : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30'
                            }`}>
                            <span className="material-icons-outlined" style={{ fontSize: 14 }}>auto_awesome</span>
                            AI Panel
                        </button>

                        <button onClick={() => handleSave(false)} disabled={isSaving}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30 transition-all disabled:opacity-50 font-khmer">
                            <span className="material-icons-outlined" style={{ fontSize: 14 }}>save</span>
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>

                        <button onClick={() => handleDelete(selectedNote)}
                            className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border border-slate-700 text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-all">
                            <span className="material-icons-outlined" style={{ fontSize: 14 }}>delete_outline</span>
                        </button>
                    </div>

                    <div className="flex flex-1 overflow-hidden">

                        {/* Editor Body */}
                        <div className="flex-1 flex flex-col overflow-hidden">

                            {/* Title */}
                            <div className="px-8 pt-6 pb-2 flex-shrink-0">
                                <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                                    placeholder="ចំណងជើង Note..."
                                    className="w-full text-2xl font-bold bg-transparent outline-none text-slate-100 placeholder-slate-700 font-khmer" />
                            </div>

                            {/* Meta row */}
                            <div className="px-8 pb-3 flex items-center gap-2 flex-wrap flex-shrink-0 border-b border-slate-800">
                                <span className={`text-xs px-2 py-0.5 rounded-lg border font-khmer ${CAT_COLORS[editCategory]}`}>
                                    {CATEGORIES.find(c => c.id === editCategory)?.icon}{' '}
                                    {CATEGORIES.find(c => c.id === editCategory)?.label}
                                </span>
                                {editReminder && (
                                    <span className="text-xs text-yellow-400 flex items-center gap-1 font-mono">
                                        <span className="material-icons-outlined" style={{ fontSize: 12 }}>alarm</span>
                                        {editReminder}
                                        <button onClick={() => setEditReminder('')} className="text-slate-600 hover:text-red-400 ml-0.5 font-bold">×</button>
                                    </span>
                                )}
                                {editLinkedCustomer.name && (
                                    <button onClick={() => { setCurrentView('crm-directory'); }} className="text-xs text-indigo-400 flex items-center gap-1 font-khmer bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded-lg hover:bg-indigo-500/20 transition-colors">
                                        <span className="material-icons-outlined" style={{ fontSize: 12 }}>person</span>
                                        {editLinkedCustomer.name}
                                        {editLinkedCustomer.phone && <span className="text-indigo-400/60 font-mono text-[10px]">{editLinkedCustomer.phone}</span>}
                                        <button onClick={e => { e.stopPropagation(); setEditLinkedCustomer({ id: '', name: '', phone: '', avatar: '' }); }} className="text-indigo-400/40 hover:text-red-400 ml-0.5 font-bold">×</button>
                                    </button>
                                )}
                                {editLinkedProduct.name && (
                                    <button onClick={() => setCurrentView('inventory-list')} className="text-xs text-yellow-400 flex items-center gap-1 font-khmer bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded-lg hover:bg-yellow-500/20 transition-colors">
                                        <span className="material-icons-outlined" style={{ fontSize: 12 }}>inventory_2</span>
                                        {editLinkedProduct.name}
                                        {editLinkedProduct.stock > 0 && <span className="text-yellow-400/60 font-mono text-[10px]">Stock:{editLinkedProduct.stock}</span>}
                                        <button onClick={e => { e.stopPropagation(); setEditLinkedProduct({ id: '', name: '', stock: 0, price: 0 }); }} className="text-yellow-400/40 hover:text-red-400 ml-0.5 font-bold">×</button>
                                    </button>
                                )}
                                {editLinkedOrder.id && (
                                    <button onClick={() => { selectOnlineOrder(editLinkedOrder.id); setCurrentView('online-orders'); }} className="text-xs text-green-400 flex items-center gap-1 font-mono bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-lg hover:bg-green-500/20 transition-colors">
                                        <span className="material-icons-outlined" style={{ fontSize: 12 }}>receipt</span>
                                        {editLinkedOrder.label}
                                        <button onClick={e => { e.stopPropagation(); setEditLinkedOrder({ id: '', label: '' }); }} className="text-green-400/40 hover:text-red-400 ml-0.5 font-bold text-xs">×</button>
                                    </button>
                                )}
                                <div className="ml-auto text-[10px] text-slate-600 font-mono">
                                    {saveStatus === 'saving' ? '⏳ saving...' : saveStatus === 'saved' ? '✅ saved' : ''}
                                </div>
                            </div>

                            {/* Phase 2C: Auto-summary strip */}
                            {(autoSummaryLoading || autoSummary) && (
                                <div className="mx-8 mt-3 mb-1 flex-shrink-0">
                                    <div className="flex items-start gap-2 bg-indigo-500/5 border border-indigo-500/20 rounded-xl px-3 py-2">
                                        <span className="text-indigo-400 text-xs flex-shrink-0 mt-0.5">🤖</span>
                                        {autoSummaryLoading ? (
                                            <div className="flex items-center gap-1.5 py-0.5">
                                                <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" />
                                                <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                                                <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                                                <span className="text-[10px] text-slate-500 ml-1 font-khmer">AI summarizing note...</span>
                                            </div>
                                        ) : (
                                            <span className="text-[11px] text-slate-400 leading-5 font-khmer flex-1">{autoSummary}</span>
                                        )}
                                        {!autoSummaryLoading && (
                                            <button onClick={() => setAutoSummary('')} className="text-slate-700 hover:text-slate-500 flex-shrink-0 text-sm leading-none">×</button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Content + overlays */}
                            <div className="flex-1 relative flex flex-col overflow-hidden">
                                <textarea
                                    ref={contentRef}
                                    value={editContent}
                                    onChange={handleContentChange}
                                    placeholder={`វាយ note របស់អ្នក...\n\nTips:\n• [ ] task item\n• ## Heading\n• - list item\n\n✨ Phase 2 AI Inline:\nវាយ /ai summarize — AI សង្ខេប note\nវាយ /ai create tasks — AI list tasks\nវាយ /ai translate — AI បកប្រែ EN\nវាយ /ai improve — AI rewrite better`}
                                    className="flex-1 px-8 py-4 bg-transparent outline-none text-slate-300 resize-none text-sm leading-7 placeholder-slate-700 min-h-0 font-khmer"
                                />

                                {/* ── Phase 2B: Smart date banner ── */}
                                {showDateBanner && !editReminder && (
                                    <div className="absolute top-2 right-4 bg-slate-800 border border-yellow-500/40 rounded-xl px-3 py-2 flex items-center gap-2 shadow-2xl z-40">
                                        <span className="text-lg">🔔</span>
                                        <div>
                                            <div className="text-[11px] text-slate-300 font-khmer">
                                                ឃើញ date <span className="text-yellow-400 font-mono font-bold">{dateDetected}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-khmer">Add as reminder?</div>
                                        </div>
                                        <button onClick={() => applyDateReminder(dateDetected)}
                                            className="text-[11px] px-2.5 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors font-khmer ml-1">
                                            ✅ Yes
                                        </button>
                                        <button onClick={() => setShowDateBanner(false)} className="text-slate-600 hover:text-slate-400 ml-1">
                                            <span className="material-icons-outlined" style={{ fontSize: 13 }}>close</span>
                                        </button>
                                    </div>
                                )}

                                {/* ── Phase 2A: /ai inline popup ── */}
                                {inlinePopup && (
                                    <div className="absolute bottom-3 left-6 right-6 bg-slate-800 border border-indigo-500/50 rounded-2xl shadow-2xl p-4 z-50">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs flex-shrink-0">✨</div>
                                            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">AI Inline</span>
                                            <span className="text-xs text-slate-400 truncate">— "{inlineQuery}"</span>
                                            <button onClick={() => setInlinePopup(false)} className="ml-auto text-slate-500 hover:text-slate-300 flex-shrink-0">
                                                <span className="material-icons-outlined" style={{ fontSize: 14 }}>close</span>
                                            </button>
                                        </div>

                                        {inlineResult ? (
                                            <>
                                                <div className="text-xs text-slate-300 leading-6 bg-slate-900/70 rounded-xl p-3 mb-3 border border-slate-700 whitespace-pre-wrap max-h-32 overflow-y-auto font-khmer">
                                                    {inlineResult}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={insertInlineResult}
                                                        className="flex-1 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors font-khmer">
                                                        ✅ Insert ក្នុង Note
                                                    </button>
                                                    <button onClick={() => { setAiResponse(inlineResult); setShowAiPanel(true); setInlinePopup(false); }}
                                                        className="px-3 py-1.5 rounded-xl border border-slate-600 text-slate-400 text-xs hover:border-indigo-500/40 hover:text-indigo-400 transition-colors font-khmer">
                                                        → Panel
                                                    </button>
                                                    <button onClick={() => setInlineResult('')}
                                                        className="px-3 py-1.5 rounded-xl border border-slate-600 text-slate-400 text-xs hover:border-slate-500 transition-colors">
                                                        🔄
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {inlineLoading ? (
                                                    <div className="flex items-center gap-2 text-xs text-slate-400 flex-1">
                                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                                                        <span className="font-khmer ml-1">AI កំពុង generate...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="text-xs text-slate-500 flex-1 font-khmer">ចុច Generate ដើម្បី AI execute command</span>
                                                        <button onClick={handleInlineAi}
                                                            className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors flex items-center gap-1 font-khmer">
                                                            <span className="material-icons-outlined" style={{ fontSize: 13 }}>auto_awesome</span>
                                                            Generate
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Phase 3: Rich Link Panel */}
                            <div className="border-t border-slate-800 flex-shrink-0">
                                {/* Link toolbar */}
                                <div className="px-8 py-2 flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-600 font-khmer">Link ទៅ:</span>
                                    <button onClick={() => setShowLinkPanel(p => !p)}
                                        className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border transition-all font-khmer ${showLinkPanel ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400' : 'border-slate-700 text-slate-500 hover:border-indigo-500/40 hover:text-indigo-400'}`}>
                                        <span className="material-icons-outlined" style={{ fontSize: 13 }}>add_link</span>
                                        Link Data
                                    </button>
                                    <input value={editTags} onChange={e => setEditTags(e.target.value)}
                                        placeholder="🏷️ Tags (comma)"
                                        className="text-[11px] bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-400 outline-none flex-1 min-w-[80px]" />
                                </div>

                                {/* Expanded link panel */}
                                {showLinkPanel && (
                                    <div className="mx-8 mb-2 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                                        {/* Search */}
                                        <div className="p-3 border-b border-slate-800 flex items-center gap-2">
                                            <span className="material-icons-outlined text-slate-500" style={{ fontSize: 14 }}>search</span>
                                            <input value={linkSearch} onChange={e => setLinkSearch(e.target.value)}
                                                placeholder="ស្វែងរក customer, product, order..."
                                                className="bg-transparent text-xs outline-none text-slate-300 placeholder-slate-600 w-full font-khmer" />
                                        </div>

                                        <div className="flex divide-x divide-slate-800 max-h-48 overflow-hidden">
                                            {/* Customers */}
                                            <div className="flex-1 overflow-y-auto">
                                                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-600 bg-slate-800/50 font-khmer sticky top-0">👥 Customers</div>
                                                {customers.filter(c => !linkSearch || c.name.toLowerCase().includes(linkSearch.toLowerCase()) || (c.phone||'').includes(linkSearch)).slice(0, 20).map(c => (
                                                    <button key={c.id} onClick={() => { setEditLinkedCustomer({ id: c.id, name: c.name, phone: c.phone || '', avatar: c.avatar || '' }); setShowLinkPanel(false); setLinkSearch(''); }}
                                                        className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 transition-colors text-left ${editLinkedCustomer.id === c.id ? 'bg-indigo-600/10' : ''}`}>
                                                        <div className="w-6 h-6 rounded-full bg-indigo-600/30 flex items-center justify-center text-[10px] font-bold text-indigo-400 flex-shrink-0 overflow-hidden">
                                                            {c.avatar && c.avatar.length > 2 ? <img src={c.avatar} className="w-full h-full object-cover" alt="" /> : (c.avatar || c.name.slice(0,2).toUpperCase())}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-[11px] text-slate-300 font-khmer truncate">{c.name}</div>
                                                            <div className="text-[10px] text-slate-600 font-mono">{c.phone}</div>
                                                        </div>
                                                        {editLinkedCustomer.id === c.id && <span className="text-indigo-400 text-xs ml-auto">✓</span>}
                                                    </button>
                                                ))}
                                                {customers.length === 0 && <div className="px-3 py-3 text-[11px] text-slate-600 font-khmer">មិនមាន customer</div>}
                                            </div>

                                            {/* Products */}
                                            <div className="flex-1 overflow-y-auto">
                                                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-600 bg-slate-800/50 font-khmer sticky top-0">📦 Products</div>
                                                {products.filter((p: any) => !linkSearch || p.name.toLowerCase().includes(linkSearch.toLowerCase())).slice(0, 20).map((p: any) => (
                                                    <button key={p.id} onClick={() => { setEditLinkedProduct({ id: String(p.id), name: p.name, stock: p.stock || 0, price: p.price || 0 }); setShowLinkPanel(false); setLinkSearch(''); }}
                                                        className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 transition-colors text-left ${editLinkedProduct.id === String(p.id) ? 'bg-yellow-600/10' : ''}`}>
                                                        <div className="w-6 h-6 rounded-lg bg-yellow-600/20 flex items-center justify-center text-xs flex-shrink-0 overflow-hidden">
                                                            {p.image ? <img src={p.image} className="w-full h-full object-cover rounded-lg" alt="" /> : '📦'}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-[11px] text-slate-300 font-khmer truncate">{p.name}</div>
                                                            <div className="flex gap-1.5">
                                                                <span className={`text-[10px] font-mono ${p.stock <= 0 ? 'text-red-400' : p.stock < 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                                    {p.stock} {p.baseUnit || 'pcs'}
                                                                </span>
                                                                <span className="text-[10px] text-slate-600">${p.price}</span>
                                                            </div>
                                                        </div>
                                                        {editLinkedProduct.id === String(p.id) && <span className="text-yellow-400 text-xs ml-auto">✓</span>}
                                                    </button>
                                                ))}
                                                {products.length === 0 && <div className="px-3 py-3 text-[11px] text-slate-600 font-khmer">មិនមាន product</div>}
                                            </div>

                                            {/* Orders */}
                                            <div className="flex-1 overflow-y-auto">
                                                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-600 bg-slate-800/50 font-khmer sticky top-0">🧾 Orders</div>
                                                {onlineOrders.filter(o => !linkSearch || o.id.toLowerCase().includes(linkSearch.toLowerCase()) || o.customer?.name?.toLowerCase().includes(linkSearch.toLowerCase())).slice(0, 20).map(o => (
                                                    <button key={o.id} onClick={() => { setEditLinkedOrder({ id: o.id, label: `#${o.id.slice(-6).toUpperCase()}` }); setShowLinkPanel(false); setLinkSearch(''); }}
                                                        className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 transition-colors text-left ${editLinkedOrder.id === o.id ? 'bg-green-600/10' : ''}`}>
                                                        <div className="w-6 h-6 rounded-lg bg-green-600/20 flex items-center justify-center text-xs flex-shrink-0">🧾</div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-[11px] text-slate-300 font-mono">#{o.id.slice(-6).toUpperCase()}</div>
                                                            <div className="flex gap-1.5">
                                                                <span className="text-[10px] text-slate-500 font-khmer truncate">{o.customer?.name}</span>
                                                                <span className={`text-[10px] font-semibold ${o.status === 'Completed' ? 'text-green-400' : o.status === 'Cancelled' ? 'text-red-400' : 'text-yellow-400'}`}>{o.status}</span>
                                                            </div>
                                                        </div>
                                                        {editLinkedOrder.id === o.id && <span className="text-green-400 text-xs ml-auto">✓</span>}
                                                    </button>
                                                ))}
                                                {onlineOrders.length === 0 && <div className="px-3 py-3 text-[11px] text-slate-600 font-khmer">មិនមាន order</div>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Status bar */}
                            <div className="px-8 py-1.5 border-t border-slate-800 flex items-center gap-3 text-[10px] text-slate-600 font-mono flex-shrink-0 bg-slate-900">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                <span>Auto-save</span>
                                <span>•</span>
                                <span>{editContent.split(/\s+/).filter(Boolean).length} words</span>
                                <span>•</span>
                                <span className="text-indigo-500">✨ /ai command ready</span>
                            </div>
                        </div>

                        {/* ══ AI PANEL ══ */}
                        {showAiPanel && (
                            <div className="w-64 border-l border-slate-800 bg-slate-900 flex flex-col flex-shrink-0">
                                <div className="p-3 border-b border-slate-800 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs">🤖</div>
                                    <div>
                                        <div className="text-xs font-bold font-khmer">Sok AI</div>
                                        <div className="text-[10px] text-slate-500 font-khmer">Note Assistant</div>
                                    </div>
                                </div>

                                <div className="p-3 border-b border-slate-800">
                                    <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-2">Quick Commands</div>
                                    <div className="flex flex-wrap gap-1">
                                        {[
                                            { label: 'សង្ខេប', cmd: 'សង្ខេប note នេះ' },
                                            { label: 'Tasks', cmd: 'Create task list' },
                                            { label: 'Improve', cmd: 'Improve the writing' },
                                            { label: 'EN', cmd: 'Translate to English' },
                                            { label: 'Email', cmd: 'Draft professional email' },
                                        ].map(({ label, cmd }) => (
                                            <button key={label} onClick={() => setAiInput(cmd)}
                                                className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-400 transition-all font-khmer">
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-3">
                                    {aiLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                                        </div>
                                    ) : aiResponse ? (
                                        <div className="text-xs text-slate-300 leading-6 whitespace-pre-wrap bg-slate-800/50 rounded-xl p-3 border border-slate-700 font-khmer">
                                            {aiResponse}
                                            <div className="mt-2 flex gap-1">
                                                <button onClick={() => { setEditContent(c => c + '\n\n' + aiResponse); setAiResponse(''); }}
                                                    className="text-[10px] px-2 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors font-khmer">
                                                    + Insert
                                                </button>
                                                <button onClick={() => setAiResponse('')}
                                                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-700 text-slate-400 border border-slate-600 hover:bg-slate-600 transition-colors">
                                                    ✕ Clear
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-[11px] text-slate-600 leading-6 font-khmer">
                                            💡 សួរ AI អំពី note:<br />
                                            • "សង្ខេប note នេះ"<br />
                                            • "Create task list"<br />
                                            • "Draft email"<br />
                                            • "Translate to English"<br /><br />
                                            <span className="text-indigo-500/60 font-mono text-[10px]">
                                                ឬ វាយ /ai [command] ក្នុង editor
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 border-t border-slate-800">
                                    <div className="text-[10px] text-indigo-500 mb-1.5 font-khmer">✨ ASK AI</div>
                                    <div className="flex gap-2">
                                        <input value={aiInput} onChange={e => setAiInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAiAsk()}
                                            placeholder="ឧ. 'សង្ខេប', 'tasks'..."
                                            className="flex-1 text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 outline-none placeholder-slate-600 focus:border-indigo-500/50 font-khmer" />
                                        <button onClick={handleAiAsk} disabled={aiLoading || !aiInput.trim()}
                                            className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 disabled:opacity-40 transition-all flex-shrink-0">
                                            <span className="material-icons-outlined" style={{ fontSize: 14 }}>send</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-slate-600">
                    <div className="text-center">
                        <div className="text-5xl mb-4">📝</div>
                        <div className="text-sm font-semibold mb-1 font-khmer">ជ្រើស Note ដើម្បី Edit</div>
                        <div className="text-xs mb-4 font-khmer">ឬ បង្កើត Note ថ្មី</div>
                        <button onClick={handleNewNote}
                            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors font-khmer">
                            + Note ថ្មី
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────
// NoteCard
// ─────────────────────────────────────────────
const NoteCard: React.FC<{
    note: SokNote; isActive: boolean;
    onClick: () => void; onPin: (e: React.MouseEvent) => void;
    onDelete: () => void; formatDate: (ts: any) => string;
}> = ({ note, isActive, onClick, onPin, onDelete, formatDate }) => {
    const cat = CATEGORIES.find(c => c.id === note.category);
    return (
        <div onClick={onClick}
            className={`p-3 rounded-xl mb-1 cursor-pointer transition-all group border ${
                isActive ? 'bg-slate-800 border-indigo-500/40' : 'border-transparent hover:bg-slate-800/50 hover:border-slate-700'
            }`}>
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-xs font-semibold text-slate-200 line-clamp-1 flex-1 font-khmer">{note.title}</div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={onPin} className="text-slate-500 hover:text-yellow-400 transition-colors text-sm">
                        {note.isPinned ? '⭐' : '☆'}
                    </button>
                    <button onClick={e => { e.stopPropagation(); onDelete(); }} className="text-slate-500 hover:text-red-400 transition-colors">
                        <span className="material-icons-outlined" style={{ fontSize: 12 }}>close</span>
                    </button>
                </div>
            </div>
            <div className="text-[11px] text-slate-500 line-clamp-2 leading-4 mb-2 font-khmer">
                {note.content || 'Empty note...'}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-khmer ${CAT_COLORS[note.category]}`}>
                    {cat?.icon} {cat?.label}
                </span>
                {note.isPinned && <span className="text-[10px]">📌</span>}
                {note.reminder && <span className="text-[10px] text-yellow-500" title={note.reminder}>🔔</span>}
                {note.linkedCustomerId && <span className="text-[10px] text-indigo-400" title={note.linkedCustomerName}>👥</span>}
                {note.linkedProductId && <span className="text-[10px] text-yellow-400" title={note.linkedProductName}>📦</span>}
                {note.linkedOrderId && <span className="text-[10px] text-green-400" title={note.linkedOrderId}>🧾</span>}
                <span className="text-[10px] text-slate-600 ml-auto font-mono">{formatDate(note.updatedAt)}</span>
            </div>
        </div>
    );
};

export default SokNotes;