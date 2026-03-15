import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../src/config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const genAI = new GoogleGenerativeAI((import.meta as any).env?.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

interface Expense {
    id: string;
    amount: number;
    category: string;
    note: string;
    date: string;
    createdAt?: string;
}

const COLLECTION = 'sok_expenses';

const CATEGORIES = [
    { label: 'ប្រាក់ខែបុគ្គលិក (Salary)',      icon: '👤', type: 'fixed'    },
    { label: 'ជួលកន្លែង (Rent)',                 icon: '🏠', type: 'fixed'    },
    { label: 'ចំណាយទីផ្សារ (Ads/Marketing)',     icon: '📢', type: 'variable' },
    { label: 'ចំណាយដឹកជញ្ជូន (Delivery)',        icon: '🚚', type: 'variable' },
    { label: 'ចំណាយវេចខ្ចប់ (Packaging)',        icon: '📦', type: 'variable' },
    { label: 'ថ្លៃទឹកភ្លើង (Utilities)',          icon: '💡', type: 'fixed'    },
    { label: 'ទិញទំនិញ/Stock (COGS)',             icon: '🛒', type: 'cogs'     },
    { label: 'ចំណាយផ្សេងៗ (Other)',              icon: '📋', type: 'other'    },
];

const MONTHS_KH = ['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'];

const fmt = (n: number) => '$' + (Number(n) || 0).toFixed(2);

const ProfitLoss: React.FC = () => {
    const { orders, onlineOrders } = useData();

    const now = new Date();
    const [selMonth, setSelMonth]   = useState(now.getMonth());
    const [selYear, setSelYear]     = useState(now.getFullYear());
    const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'chart' | 'forecast'>('overview');
    const [expenses, setExpenses]   = useState<Expense[]>([]);
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);

    const [fDate, setFDate]         = useState(now.toISOString().split('T')[0]);
    const [fAmount, setFAmount]     = useState('');
    const [fCategory, setFCategory] = useState(CATEGORIES[0].label);
    const [fNote, setFNote]         = useState('');

    // P3 AI state
    const [aiCatLoading, setAiCatLoading] = useState(false);
    const [aiChat, setAiChat]   = useState<{role:'user'|'ai', text:string}[]>([]);
    const [aiInput, setAiInput] = useState('');
    const [aiLoading, setAiLoading]   = useState(false);
    const [showAiPanel, setShowAiPanel] = useState(false);

    // P4 AI state
    const [narrative, setNarrative]               = useState('');
    const [narrativeLoading, setNarrativeLoading] = useState(false);
    const [forecast, setForecast]                 = useState<{month:string;revenue:number;expenses:number;net:number}[]>([]);
    const [forecastLoading, setForecastLoading]   = useState(false);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, COLLECTION), orderBy('date', 'desc'));
            const snap = await getDocs(q);
            setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Expense)));
        } catch (e) {
            console.error('fetchExpenses:', e);
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchExpenses(); }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fAmount || Number(fAmount) <= 0) return;
        setSaving(true);
        try {
            await addDoc(collection(db, COLLECTION), {
                amount: Number(fAmount), category: fCategory,
                note: fNote, date: fDate || now.toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
            });
            setFAmount(''); setFNote('');
            await fetchExpenses();
        } catch { alert('មានបញ្ហា សូមព្យាយាមម្ដងទៀត'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('លុប expense នេះ?')) return;
        try { await deleteDoc(doc(db, COLLECTION, id)); await fetchExpenses(); }
        catch { alert('លុបមិនបាន'); }
    };

    const revenueForMonth = (year: number, month: number) => {
        const pos = orders
            .filter(o => { const d = new Date(o.date); return d.getMonth() === month && d.getFullYear() === year; })
            .reduce((s, o) => s + (Number(o.total) || 0), 0);
        const online = onlineOrders
            .filter(o => {
                const d = new Date(o.createdAt?.toDate?.() || o.date || '');
                return d.getMonth() === month && d.getFullYear() === year
                    && ['Paid','Verified','Settled'].includes(o.paymentStatus);
            })
            .reduce((s, o) => s + (Number(o.total) || 0), 0);
        return { pos, online, total: pos + online };
    };

    const expensesForMonth = (year: number, month: number) =>
        expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });

    const rev        = revenueForMonth(selYear, selMonth);
    const monthExps  = expensesForMonth(selYear, selMonth);
    const totalExp   = monthExps.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const cogsTotal  = monthExps.filter(e => e.category.includes('COGS')).reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const opexTotal  = totalExp - cogsTotal;
    const grossProfit = rev.total - cogsTotal;
    const netProfit  = rev.total - totalExp;

    const categoryBreakdown = useMemo(() => {
        const map: Record<string, number> = {};
        monthExps.forEach(e => { map[e.category] = (map[e.category] || 0) + (Number(e.amount) || 0); });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [monthExps]);

    const chartData = useMemo(() => Array.from({ length: 6 }, (_, i) => {
        const d = new Date(selYear, selMonth - 5 + i, 1);
        const m = d.getMonth(); const y = d.getFullYear();
        const r = revenueForMonth(y, m);
        const exp = expensesForMonth(y, m).reduce((s, e) => s + (Number(e.amount) || 0), 0);
        return { name: MONTHS_KH[m].slice(0, 3), ចំណូល: +r.total.toFixed(2), ចំណាយ: +exp.toFixed(2), ចំណេញ: +(r.total - exp).toFixed(2) };
    }), [expenses, orders, onlineOrders, selMonth, selYear]);

    const yearOptions = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

    // P3: AI Auto-categorize
    const handleAiCategorize = async () => {
        if (!fNote && !fAmount) return;
        setAiCatLoading(true);
        try {
            const catList = CATEGORIES.map(c => c.label).join('\n');
            const prompt = 'ចំណាយ: "' + (fNote || '') + '" ចំនួន $' + fAmount + '.\nជ្រើសប្រភេទដែលត្រូវបំផុតពី list (return ONLY the exact label):\n' + catList;
            const result = await model.generateContent(prompt);
            const suggested = result.response.text().trim();
            const match = CATEGORIES.find(c => c.label === suggested);
            if (match) setFCategory(match.label);
        } catch (e) { console.error('AI categorize:', e); }
        finally { setAiCatLoading(false); }
    };

    // P3: AI Chat
    const handleAiChat = async () => {
        if (!aiInput.trim() || aiLoading) return;
        const userMsg = aiInput.trim();
        setAiInput('');
        setAiChat(prev => [...prev, { role: 'user', text: userMsg }]);
        setAiLoading(true);
        try {
            const ctx = 'P&L ខែ' + MONTHS_KH[selMonth] + ' ' + selYear + ': ' +
                'ចំណូល $' + rev.total.toFixed(2) + ', COGS $' + cogsTotal.toFixed(2) +
                ', Gross $' + grossProfit.toFixed(2) + ', OpEx $' + opexTotal.toFixed(2) +
                ', Net $' + netProfit.toFixed(2);
            const prompt = ctx + '\nសំណួរ: ' + userMsg + '\nឆ្លើយជាភាសាខ្មែរ ខ្លី មិនលើស 3 ប្រយោគ។';
            const result = await model.generateContent(prompt);
            setAiChat(prev => [...prev, { role: 'ai', text: result.response.text().trim() }]);
        } catch { setAiChat(prev => [...prev, { role: 'ai', text: 'សូមទោស មានបញ្ហាក្នុងការភ្ជាប់ AI។' }]); }
        finally { setAiLoading(false); }
    };

    // P4: AI Narrative
    const handleNarrative = async () => {
        setNarrativeLoading(true); setNarrative('');
        try {
            const topCat = categoryBreakdown[0] ? categoryBreakdown[0][0] + ' $' + categoryBreakdown[0][1].toFixed(2) : 'N/A';
            const prompt = 'អ្នកជា CFO AI assistant។ សូម generate monthly P&L report ខ្លីជាភាសាខ្មែរ (3-4 ប្រយោគ) សម្រាប់ខែ' +
                MONTHS_KH[selMonth] + ' ' + selYear + ': ' +
                'ចំណូល $' + rev.total.toFixed(2) + ', COGS $' + cogsTotal.toFixed(2) +
                ', Gross $' + grossProfit.toFixed(2) + ', OpEx $' + opexTotal.toFixed(2) +
                ', Net $' + netProfit.toFixed(2) + ', ចំណាយខ្ពស់: ' + topCat +
                '។ រួមបញ្ចូល highlights, warning បើខាត, recommendation ១។';
            const result = await model.generateContent(prompt);
            setNarrative(result.response.text().trim());
        } catch { setNarrative('សូមទោស មានបញ្ហាក្នុងការ generate report។'); }
        finally { setNarrativeLoading(false); }
    };

    // P4: AI Forecast
    const handleForecast = async () => {
        setForecastLoading(true); setForecast([]);
        try {
            const history = Array.from({ length: 3 }, (_, i) => {
                const d = new Date(selYear, selMonth - 2 + i, 1);
                const m = d.getMonth(); const y = d.getFullYear();
                const r = revenueForMonth(y, m);
                const exp = expensesForMonth(y, m).reduce((s, e) => s + (Number(e.amount) || 0), 0);
                return { month: MONTHS_KH[m] + ' ' + y, revenue: r.total, expenses: exp, net: r.total - exp };
            });
            const historyText = history.map(h =>
                h.month + ': Revenue $' + h.revenue.toFixed(2) +
                ', Expenses $' + h.expenses.toFixed(2) +
                ', Net $' + h.net.toFixed(2)
            ).join('\n');
            const prompt = 'អ្នកជា CFO AI assistant។ ដោយផ្អែកលើ data 3 ខែខាងក្រោម សូម forecast 3 ខែខាងមុខ។\n' +
                'History:\n' + historyText + '\n\n' +
                'Return ONLY a valid JSON array (no markdown):\n' +
                '[{"month":"M Y","revenue":0,"expenses":0,"net":0},' +
                '{"month":"M Y","revenue":0,"expenses":0,"net":0},' +
                '{"month":"M Y","revenue":0,"expenses":0,"net":0}]';
            const result = await model.generateContent(prompt);
            const raw = result.response.text().trim().replace(/```json|```/g, '').trim();
            setForecast(JSON.parse(raw));
        } catch { setForecast([{ month: 'Error', revenue: 0, expenses: 0, net: 0 }]); }
        finally { setForecastLoading(false); }
    };

    // P5: Export PDF
    const handleExportPDF = () => {
        const docPdf = new jsPDF();
        const title = 'P&L Statement — ' + MONTHS_KH[selMonth] + ' ' + selYear;

        // Title
        docPdf.setFontSize(16);
        docPdf.setFont('helvetica', 'bold');
        docPdf.text(title, 14, 20);

        docPdf.setFontSize(10);
        docPdf.setFont('helvetica', 'normal');
        docPdf.text('Generated: ' + new Date().toLocaleDateString(), 14, 28);

        // Summary Cards
        autoTable(docPdf, {
            startY: 35,
            head: [['Metric', 'Amount']],
            body: [
                ['Revenue (POS)', '$' + rev.pos.toFixed(2)],
                ['Revenue (Online)', '$' + rev.online.toFixed(2)],
                ['Total Revenue', '$' + rev.total.toFixed(2)],
                ['COGS', '$' + cogsTotal.toFixed(2)],
                ['Gross Profit', '$' + grossProfit.toFixed(2)],
                ['Operating Expenses', '$' + opexTotal.toFixed(2)],
                ['Net Profit', '$' + netProfit.toFixed(2)],
            ],
            styles: { fontSize: 10 },
            headStyles: { fillColor: [37, 99, 235] },
            bodyStyles: { textColor: [30, 30, 30] },
            didParseCell: (data: any) => {
                if (data.row.index === 6) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.textColor = netProfit >= 0 ? [5, 150, 105] : [220, 38, 38];
                }
            },
        });

        // Expense breakdown
        const startY = (docPdf as any).lastAutoTable.finalY + 10;
        docPdf.setFontSize(12);
        docPdf.setFont('helvetica', 'bold');
        docPdf.text('Expense Breakdown', 14, startY);

        autoTable(docPdf, {
            startY: startY + 5,
            head: [['Date', 'Category', 'Note', 'Amount']],
            body: monthExps.map(e => [e.date, e.category, e.note || '-', '-$' + (Number(e.amount)||0).toFixed(2)]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [100, 116, 139] },
        });

        docPdf.save('PL-Statement-' + MONTHS_KH[selMonth] + '-' + selYear + '.pdf');
    };

    // P5: Export Excel
    const handleExportExcel = () => {
        const wb = XLSX.utils.book_new();

        // Sheet 1: P&L Summary
        const summaryData = [
            ['P&L Statement — ' + MONTHS_KH[selMonth] + ' ' + selYear],
            [],
            ['Metric', 'Amount'],
            ['Revenue POS', rev.pos],
            ['Revenue Online', rev.online],
            ['Total Revenue', rev.total],
            ['COGS', cogsTotal],
            ['Gross Profit', grossProfit],
            ['Operating Expenses', opexTotal],
            ['Net Profit', netProfit],
        ];
        const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
        ws1['!cols'] = [{ wch: 30 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, ws1, 'P&L Summary');

        // Sheet 2: Expense List
        const expenseData = [
            ['Date', 'Category', 'Note', 'Amount'],
            ...monthExps.map(e => [e.date, e.category, e.note || '', Number(e.amount) || 0]),
            [],
            ['Total', '', '', totalExp],
        ];
        const ws2 = XLSX.utils.aoa_to_sheet(expenseData);
        ws2['!cols'] = [{ wch: 14 }, { wch: 35 }, { wch: 30 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, ws2, 'Expenses');

        XLSX.writeFile(wb, 'PL-Statement-' + MONTHS_KH[selMonth] + '-' + selYear + '.xlsx');
    };

    const TABS = [
        { key: 'overview',  label: '📋 សង្ខេប' },
        { key: 'expenses',  label: '💸 ចំណាយ' },
        { key: 'chart',     label: '📈 Chart' },
        { key: 'forecast',  label: '🔮 Forecast' },
    ] as const;

    return (
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">

            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold font-khmer">📊 ចំណូល-ចំណាយ (P&amp;L)</h1>
                    <p className="text-xs text-slate-500 font-khmer mt-0.5">ខែ{MONTHS_KH[selMonth]} {selYear}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <select value={selMonth} onChange={e => setSelMonth(Number(e.target.value))}
                        className="text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-700 rounded-lg px-3 py-1.5 focus:outline-none font-khmer">
                        {MONTHS_KH.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <select value={selYear} onChange={e => setSelYear(Number(e.target.value))}
                        className="text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-700 rounded-lg px-3 py-1.5 focus:outline-none">
                        {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    {TABS.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={'px-4 py-1.5 rounded-lg text-sm font-khmer font-medium transition-all ' + (activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300')}>
                            {tab.label}
                        </button>
                    ))}
                    <button onClick={() => setShowAiPanel(p => !p)}
                        className={'px-4 py-1.5 rounded-lg text-sm font-khmer font-medium transition-all ' + (showAiPanel ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300')}>
                        🤖 AI Chat
                    </button>
                    <button onClick={handleExportPDF}
                        className="px-4 py-1.5 rounded-lg text-sm font-khmer font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 hover:bg-red-100 transition-all">
                        📄 PDF
                    </button>
                    <button onClick={handleExportExcel}
                        className="px-4 py-1.5 rounded-lg text-sm font-khmer font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-700 hover:bg-green-100 transition-all">
                        📊 Excel
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 pb-2">
                {[
                    { label: 'ចំណូលសរុប',   value: rev.total,    color: 'text-emerald-600', sub: 'POS: ' + fmt(rev.pos) + ' · Online: ' + fmt(rev.online) },
                    { label: 'ចំណាយសរុប',   value: totalExp,     color: 'text-red-500',     sub: 'COGS: ' + fmt(cogsTotal) + ' · OpEx: ' + fmt(opexTotal) },
                    { label: 'Gross Profit',  value: grossProfit,  color: grossProfit >= 0 ? 'text-blue-600' : 'text-red-600', sub: 'Revenue - COGS' },
                    { label: 'ចំណេញសុទ្ធ',   value: netProfit,    color: netProfit >= 0 ? 'text-emerald-600' : 'text-red-600', sub: netProfit >= 0 ? '✅ ចំណេញ' : '⚠️ ខាត' },
                ].map((c, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                        <p className="text-xs text-slate-500 font-khmer mb-1">{c.label}</p>
                        <p className={'text-xl font-bold ' + c.color}>{fmt(c.value)}</p>
                        <p className="text-[11px] text-slate-400 font-khmer mt-1">{c.sub}</p>
                    </div>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="px-6 pb-6 mt-4 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* P&L Statement */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                            <h3 className="font-bold font-khmer mb-4 text-sm border-b border-slate-100 dark:border-slate-700 pb-2">
                                📋 P&amp;L Statement — ខែ{MONTHS_KH[selMonth]} {selYear}
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { label: 'ចំណូល POS',          value: rev.pos,       indent: true },
                                    { label: 'ចំណូល Online',        value: rev.online,    indent: true },
                                    { label: 'ចំណូលសរុប',           value: rev.total,     bold: true, border: true, color: 'text-emerald-600' },
                                    { label: 'COGS (ទំនិញ)',        value: -cogsTotal,    indent: true, color: 'text-red-400' },
                                    { label: 'Gross Profit',         value: grossProfit,   bold: true, border: true, color: grossProfit >= 0 ? 'text-blue-600' : 'text-red-500' },
                                    { label: 'ចំណាយប្រតិបត្តិការ',  value: -opexTotal,    indent: true, color: 'text-orange-500' },
                                    { label: 'ចំណេញសុទ្ធ',           value: netProfit,     bold: true, border: true, big: true, color: netProfit >= 0 ? 'text-emerald-600' : 'text-red-600' },
                                ].map((row, i) => (
                                    <div key={i} className={'flex justify-between items-center py-1.5' + (row.border ? ' border-t border-slate-200 dark:border-slate-700 mt-1 pt-2' : '') + (row.indent ? ' pl-4' : '')}>
                                        <span className={'font-khmer text-sm ' + (row.bold ? 'font-bold' : 'text-slate-500')}>{row.label}</span>
                                        <span className={'font-mono text-sm ' + (row.color || '') + (row.bold ? ' font-bold' : '') + (row.big ? ' text-base' : '')}>
                                            {row.value < 0 ? '-' + fmt(Math.abs(row.value)) : fmt(row.value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Category Breakdown */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                            <h3 className="font-bold font-khmer mb-4 text-sm border-b border-slate-100 dark:border-slate-700 pb-2">🗂️ ចំណាយតាមប្រភេទ</h3>
                            {categoryBreakdown.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 text-slate-400 gap-2">
                                    <span className="text-3xl">💸</span>
                                    <span className="font-khmer text-sm">មិនទាន់មានចំណាយ</span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {categoryBreakdown.map(([cat, amt]) => {
                                        const pct = totalExp > 0 ? (amt / totalExp) * 100 : 0;
                                        const icon = CATEGORIES.find(c => c.label === cat)?.icon || '📋';
                                        return (
                                            <div key={cat}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-khmer text-slate-600 dark:text-slate-300">{icon} {cat}</span>
                                                    <span className="text-xs font-bold text-red-500">{fmt(amt)} <span className="text-slate-400 font-normal">({pct.toFixed(0)}%)</span></span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-red-400 rounded-full" style={{ width: pct + '%' }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI Narrative */}
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-700 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold font-khmer text-sm flex items-center gap-2">🤖 AI Monthly Report</h3>
                            <button onClick={handleNarrative} disabled={narrativeLoading}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-khmer rounded-lg transition-all">
                                {narrativeLoading ? '⏳ កំពុង generate...' : '✨ Generate Report'}
                            </button>
                        </div>
                        {narrative ? (
                            <p className="text-sm font-khmer text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 rounded-xl p-4 border border-purple-100 dark:border-purple-800">{narrative}</p>
                        ) : (
                            <p className="text-xs text-slate-400 font-khmer text-center py-4">ចុច Generate Report ដើម្បីឱ្យ AI សរសេរ monthly summary</p>
                        )}
                    </div>
                </div>
            )}

            {/* Chart Tab */}
            {activeTab === 'chart' && (
                <div className="px-6 pb-6 mt-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                        <h3 className="font-bold font-khmer mb-6 text-sm">📈 Revenue vs Expenses — 6 ខែចុងក្រោយ</h3>
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => '$' + v} />
                                <Tooltip formatter={(v: number) => fmt(v)} />
                                <Legend />
                                <Bar dataKey="ចំណូល" fill="#10b981" radius={[4,4,0,0]} />
                                <Bar dataKey="ចំណាយ" fill="#f87171" radius={[4,4,0,0]} />
                                <Bar dataKey="ចំណេញ" fill="#60a5fa" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
                <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-5 gap-6 mt-4">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                        <h3 className="font-bold font-khmer mb-4 text-sm">➕ បន្ថែមចំណាយ</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-khmer text-slate-500 mb-1">ថ្ងៃខែ</label>
                                <input type="date" value={fDate} onChange={e => setFDate(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-khmer text-slate-500 mb-1">ចំនួនទឹកប្រាក់ ($)</label>
                                <input type="number" value={fAmount} onChange={e => setFAmount(e.target.value)}
                                    placeholder="0.00" required min="0.01" step="0.01"
                                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-khmer text-slate-500 mb-1">ប្រភេទ</label>
                                <select value={fCategory} onChange={e => setFCategory(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-khmer">
                                    {CATEGORIES.map(c => <option key={c.label}>{c.label}</option>)}
                                </select>
                                <button type="button" onClick={handleAiCategorize} disabled={aiCatLoading}
                                    className="mt-1.5 w-full text-xs bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-700 rounded-lg py-1.5 font-khmer transition-all disabled:opacity-50">
                                    {aiCatLoading ? '⏳ AI កំពុងជ្រើស...' : '✨ AI ជ្រើសប្រភេទ'}
                                </button>
                            </div>
                            <div>
                                <label className="block text-xs font-khmer text-slate-500 mb-1">កត់សម្គាល់</label>
                                <input type="text" value={fNote} onChange={e => setFNote(e.target.value)}
                                    placeholder="ឧ. ប្រាក់ខែខែមីនា..."
                                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-khmer" />
                            </div>
                            <button type="submit" disabled={saving}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-sm font-khmer transition-all">
                                {saving ? '⏳ កំពុងរក្សាទុក...' : '💾 រក្សាទុក'}
                            </button>
                        </form>
                    </div>
                    <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-bold font-khmer text-sm">📋 ចំណាយ ខែ{MONTHS_KH[selMonth]} ({monthExps.length})</h3>
                            <span className="text-xs text-red-500 font-bold">{fmt(totalExp)}</span>
                        </div>
                        {loading ? (
                            <div className="flex items-center justify-center h-32 text-slate-400 font-khmer text-sm">កំពុងផ្ទុក...</div>
                        ) : monthExps.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-slate-400 gap-2">
                                <span className="text-3xl">💸</span>
                                <span className="font-khmer text-sm">មិនទាន់មានចំណាយខែនេះ</span>
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 font-khmer">ថ្ងៃខែ</th>
                                        <th className="px-4 py-3 font-khmer">ប្រភេទ</th>
                                        <th className="px-4 py-3 font-khmer">កត់សម្គាល់</th>
                                        <th className="px-4 py-3 font-khmer text-right">ចំនួន</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {monthExps.map(exp => (
                                        <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-4 py-3 text-slate-500 text-xs">{exp.date}</td>
                                            <td className="px-4 py-3">
                                                <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-khmer">
                                                    {CATEGORIES.find(c => c.label === exp.category)?.icon || '📋'} {exp.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-xs font-khmer">{exp.note || '—'}</td>
                                            <td className="px-4 py-3 text-right font-bold text-red-500">-{fmt(exp.amount)}</td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => handleDelete(exp.id)} className="text-slate-300 hover:text-red-500 text-sm">✕</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Forecast Tab */}
            {activeTab === 'forecast' && (
                <div className="px-6 pb-6 mt-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold font-khmer text-sm">🔮 AI Cash Flow Forecast</h3>
                                <p className="text-xs text-slate-400 font-khmer mt-0.5">ព្យាករណ៍ 3 ខែខាងមុខ ផ្អែកលើ data ចុងក្រោយ</p>
                            </div>
                            <button onClick={handleForecast} disabled={forecastLoading}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-khmer rounded-lg transition-all">
                                {forecastLoading ? '⏳ AI កំពុង analyze...' : '🔮 Generate Forecast'}
                            </button>
                        </div>
                        {forecastLoading && (
                            <div className="flex items-center justify-center h-40 gap-3 text-slate-400">
                                <span className="font-khmer text-sm">AI កំពុង analyze data...</span>
                            </div>
                        )}
                        {!forecastLoading && forecast.length > 0 && (
                            <>
                                <div className="overflow-x-auto mb-6">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-700/50">
                                                <th className="px-4 py-3 text-left text-xs font-khmer text-slate-500">ខែ</th>
                                                <th className="px-4 py-3 text-right text-xs font-khmer text-emerald-600">ចំណូល</th>
                                                <th className="px-4 py-3 text-right text-xs font-khmer text-red-500">ចំណាយ</th>
                                                <th className="px-4 py-3 text-right text-xs font-khmer text-blue-600">ចំណេញ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {forecast.map((f, i) => (
                                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                    <td className="px-4 py-3 font-khmer text-sm font-medium">{f.month}</td>
                                                    <td className="px-4 py-3 text-right font-mono text-emerald-600 font-bold">{fmt(f.revenue)}</td>
                                                    <td className="px-4 py-3 text-right font-mono text-red-500 font-bold">{fmt(f.expenses)}</td>
                                                    <td className={'px-4 py-3 text-right font-mono font-bold ' + ((Number(f.net) || 0) >= 0 ? 'text-blue-600' : 'text-red-600')}>{fmt(f.net)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={forecast.map(f => ({ name: f.month, ចំណូល: f.revenue, ចំណាយ: f.expenses, ចំណេញ: f.net }))} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => '$' + v} />
                                        <Tooltip formatter={(v: number) => fmt(v)} />
                                        <Legend />
                                        <Bar dataKey="ចំណូល" fill="#10b981" radius={[4,4,0,0]} opacity={0.8} />
                                        <Bar dataKey="ចំណាយ" fill="#f87171" radius={[4,4,0,0]} opacity={0.8} />
                                        <Bar dataKey="ចំណេញ" fill="#60a5fa" radius={[4,4,0,0]} opacity={0.8} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </>
                        )}
                        {!forecastLoading && forecast.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-3">
                                <span className="text-4xl">🔮</span>
                                <p className="font-khmer text-sm">ចុច Generate Forecast ដើម្បីឱ្យ AI ព្យាករណ៍ 3 ខែខាងមុខ</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* AI Chat Panel */}
            {showAiPanel && (
                <div className="fixed bottom-4 right-4 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden z-40" style={{ maxHeight: '420px' }}>
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🤖</span>
                            <div>
                                <p className="text-white font-bold text-sm font-khmer">AI P&amp;L Assistant</p>
                                <p className="text-purple-200 text-[10px] font-khmer">សួរអំពី P&amp;L របស់អ្នក</p>
                            </div>
                        </div>
                        <button onClick={() => setShowAiPanel(false)} className="text-white/70 hover:text-white text-lg leading-none">×</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: '200px', maxHeight: '260px' }}>
                        {aiChat.length === 0 && (
                            <div className="text-center text-slate-400 text-xs font-khmer py-6">
                                <p className="text-2xl mb-2">💬</p>
                                <p>សួរខ្ញុំអំពី P&amp;L របស់អ្នក</p>
                                <p className="mt-2 text-slate-300">ឧ. ខែនេះចំណេញប៉ុន្មាន?</p>
                            </div>
                        )}
                        {aiChat.map((msg, i) => (
                            <div key={i} className={'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                <div className={'max-w-[85%] px-3 py-2 rounded-xl text-xs font-khmer leading-relaxed ' + (msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none')}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {aiLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-xl rounded-bl-none">
                                    <span className="text-xs text-slate-400 font-khmer">AI កំពុងគិត...</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                        <input value={aiInput} onChange={e => setAiInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAiChat()}
                            placeholder="ចុះ Enter ដើម្បីផ្ញើ..."
                            className="flex-1 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 font-khmer dark:text-white" />
                        <button onClick={handleAiChat} disabled={aiLoading || !aiInput.trim()}
                            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg px-3 py-2 text-xs transition-all">
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfitLoss;