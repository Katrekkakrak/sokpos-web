import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SokAssistant: React.FC = () => {
    const {
        orders, onlineOrders, products, customers,
        setCurrentView, userPlan,
        setPrefillOrderData, setIsCreateOrderModalOpen,
        shippingZones,
    } = useData();

    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>(() => {
        const saved = localStorage.getItem('sokAiChatHistory');
        if (saved) return JSON.parse(saved);
        return [{
            role: 'model',
            text: 'សួស្តីមេបញ្ជាការ! ខ្ញុំគឺ Sok AI។\n\nខ្ញុំអាចជួយ:\n🛒 បង្កើត Order (បើក Modal ឱ្យ confirm)\n👥 រក Customer\n📊 Report + Stock\n🏷️ គណនា Discount\n📦 Track Order\n💬 Draft Reply Facebook\n🚚 ថ្លៃដឹក\n\nតើថ្ងៃនេះមានអ្វីឲ្យជួយ?'
        }];
    });

    useEffect(() => {
        localStorage.setItem('sokAiChatHistory', JSON.stringify(messages));
    }, [messages]);

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    // ============================================================
    // ✅ SIMPLE: navigate + open empty Modal — user fills in
    // ============================================================
    const openOrderModal = () => {
        setPrefillOrderData(null);
        setCurrentView('online-orders');
        setTimeout(() => setIsCreateOrderModalOpen(true), 150);
    };

    // ============================================================
    // Stats
    // ============================================================
    const getStats = () => {
        const todayStr = new Date().toDateString();
        const todayOrders = orders.filter(o => new Date(o.date).toDateString() === todayStr);
        const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
        const weekAgo = Date.now() - 7 * 86400000;
        const weekOrders = orders.filter(o => new Date(o.date).getTime() >= weekAgo);
        const weekRevenue = weekOrders.reduce((s, o) => s + o.total, 0);
        const lowStock = products.filter(p => p.stock <= 10 && p.stock > 0);
        const outStock = products.filter(p => p.stock === 0);
        const freq: Record<string, { name: string; count: number; revenue: number }> = {};
        orders.forEach(o => o.items?.forEach((item: any) => {
            if (!freq[item.name]) freq[item.name] = { name: item.name, count: 0, revenue: 0 };
            freq[item.name].count += item.quantity || 1;
            freq[item.name].revenue += (item.price || 0) * (item.quantity || 1);
        }));
        const topProducts = Object.values(freq).sort((a, b) => b.count - a.count).slice(0, 5);
        return { todayOrders, todayRevenue, weekOrders, weekRevenue, lowStock, outStock, topProducts };
    };

    // ============================================================
    // Main handleSend
    // ============================================================
    const handleSend = async () => {
        if (!input.trim() || userPlan === 'free') return;
        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setInput('');
        setIsLoading(true);

        try {
            const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                setMessages(prev => [...prev, { role: 'model', text: 'រកមិនឃើញ API Key ទេ។' }]);
                setIsLoading(false);
                return;
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
            const stats = getStats();
            const chatHistory = messages.map(m => `${m.role === 'user' ? 'ថៅកែ' : 'Sok AI'}: ${m.text}`).join('\n');

            const productCatalog = products.map(p => ({
                id: p.id, name: p.name, nameKh: p.nameKh ?? '',
                basePrice: p.price, stock: p.stock,
                units: (p.units ?? []).map(u => ({ unitId: u.unitId, name: u.name, price: u.price })),
                variants: (p.variants ?? []).map(v => ({ id: v.id, name: v.name, price: v.price, stock: v.stock })),
            }));
            const customerList = customers.slice(0, 100).map(c => ({ id: c.id, name: c.name, phone: c.phone, totalSpent: c.totalSpent, totalDebt: c.totalDebt }));
            const zoneList = shippingZones.map(z => ({ name: z.name, price: z.price }));
            const recentOrders = (onlineOrders ?? []).slice(0, 50).map((o: any) => ({
                id: o.id, customer: o.customer?.name, status: o.status,
                total: o.total, shippingCarrier: o.shippingCarrier, paymentStatus: o.paymentStatus,
            }));

            const systemPrompt = `
អ្នកជា Sok AI ជំនួយការឆ្លាតវៃ។ ឆ្លើយជាខ្មែរ។

=== ទិន្នន័យ ===
ចំណូលថ្ងៃ: $${stats.todayRevenue.toFixed(2)} (${stats.todayOrders.length} orders)
ចំណូលសប្តាហ៍: $${stats.weekRevenue.toFixed(2)} (${stats.weekOrders.length} orders)
Stock ខ្សោយ: ${stats.lowStock.map(p => `${p.name}(${p.stock})`).join(', ') || 'គ្មាន'}
Stock អស់: ${stats.outStock.map(p => p.name).join(', ') || 'គ្មាន'}
Top: ${stats.topProducts.map(p => `${p.name}(${p.count}ដង)`).join(', ')}

Products: ${JSON.stringify(productCatalog)}
Customers: ${JSON.stringify(customerList)}
Zones: ${JSON.stringify(zoneList)}
Orders: ${JSON.stringify(recentOrders)}

=== Actions ===
បើ user ចង់ ORDER/កម្ម៉ង់ → return JSON:
\`\`\`json
{"action":"OPEN_ORDER_MODAL"}
\`\`\`
(Modal ទទេនឹងបើក — user បំពេញ + confirm ខ្លួនឯង)

រក customer → JSON:
\`\`\`json
{"action":"FIND_CUSTOMER","query":"..."}
\`\`\`

គណនា discount → JSON:
\`\`\`json
{"action":"CALC_DISCOUNT","productName":"...","qty":1,"discountPct":10}
\`\`\`

Track order → JSON:
\`\`\`json
{"action":"TRACK_ORDER","orderId":"SB-..."}
\`\`\`

Draft reply → plain text (មិនបាច់ JSON)

ថ្លៃដឹក → JSON:
\`\`\`json
{"action":"SHIPPING_FEE","destination":"..."}
\`\`\`

Report/Stock/Summary → plain text

ប្រវត្តិ: ${chatHistory}
សំណួរ: "${userMessage}"`;

            const result = await model.generateContent(systemPrompt);
            let text = result.response.text();

            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*?"action"[\s\S]*?\}/);
            const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : null;

            if (jsonStr) {
                try {
                    const data = JSON.parse(jsonStr);

                    // ✅ CREATE ORDER — Modal ទទេ
                    if (data.action === 'OPEN_ORDER_MODAL') {
                        openOrderModal();
                        text = '📋 Modal បើករួចហើយ!\n\nសូមបំពេញព័ត៌មាន:\n• ជ្រើស Customer\n• Add ទំនិញ\n• ជ្រើស Zone + Carrier\n\nហើយចុច ✅ "Create Order" ដើម្បីបញ្ជាក់!';

                    } else if (data.action === 'FIND_CUSTOMER') {
                        const q = (data.query ?? '').toLowerCase();
                        const found = customers.filter(c =>
                            c.name.toLowerCase().includes(q) || c.phone.includes(q)
                        ).slice(0, 5);
                        if (found.length > 0) {
                            text = `🔍 រកឃើញ ${found.length} នាក់:\n\n` + found.map(c =>
                                `👤 ${c.name}\n   📞 ${c.phone}\n   💰 ចំណាយ: $${c.totalSpent?.toFixed(2) ?? '0'} | 💳 បំណុល: $${c.totalDebt?.toFixed(2) ?? '0'}`
                            ).join('\n\n');
                        } else {
                            text = `😔 រកមិនឃើញ "${data.query}" ក្នុង CRM ទេ!`;
                        }

                    } else if (data.action === 'CALC_DISCOUNT') {
                        const product = products.find(p =>
                            p.name.toLowerCase().includes((data.productName ?? '').toLowerCase())
                        );
                        if (product) {
                            const orig = product.price * (data.qty || 1);
                            const disc = orig * ((data.discountPct || 0) / 100);
                            text = `🏷️ Discount Calc:\n\n📦 ${product.name} x${data.qty || 1}\n💰 ដើម: $${orig.toFixed(2)}\n🏷️ បញ្ចុះ ${data.discountPct}%: -$${disc.toFixed(2)}\n✅ ចុងក្រោយ: $${(orig - disc).toFixed(2)}`;
                        } else {
                            text = `រកមិនឃើញ "${data.productName}"`;
                        }

                    } else if (data.action === 'TRACK_ORDER') {
                        const order = (onlineOrders ?? []).find((o: any) =>
                            o.id === data.orderId || o.id?.includes(data.orderId)
                        );
                        if (order) {
                            const emoji: Record<string, string> = { New: '🆕', Packing: '📦', Shipping: '🚚', Completed: '✅', Cancelled: '❌' };
                            text = `📦 ${order.id}\n${emoji[order.status] ?? '📋'} ${order.status}\n👤 ${(order as any).customer?.name ?? 'N/A'}\n💰 $${order.total?.toFixed(2)}\n🚚 ${(order as any).shippingCarrier ?? 'N/A'}\n💳 ${(order as any).paymentStatus ?? 'N/A'}`;
                        } else {
                            text = `រកមិនឃើញ "${data.orderId}"`;
                        }

                    } else if (data.action === 'SHIPPING_FEE') {
                        const dest = (data.destination ?? '').toLowerCase();
                        const zone = shippingZones.find(z =>
                            z.name.toLowerCase().includes(dest) || dest.includes(z.name.toLowerCase())
                        );
                        text = zone
                            ? `🚚 ថ្លៃដឹក ${zone.name}: $${zone.price.toFixed(2)}`
                            : `🚚 Zones:\n` + shippingZones.map(z => `• ${z.name}: $${z.price.toFixed(2)}`).join('\n');
                    }

                } catch (err: any) {
                    console.error('AI Action Error:', err);
                    text = `⚠️ ${err.message}`;
                }
            }

            setMessages(prev => [...prev, { role: 'model', text: text.replace(/```json[\s\S]*?```/g, '').trim() }]);

        } catch (e) {
            console.error('AI Error:', e);
            setMessages(prev => [...prev, { role: 'model', text: 'សុំទោស! មានបញ្ហា AI។' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        { label: '🛒 Order ថ្មី', msg: 'ខ្ញុំចង់បង្កើត order ថ្មី' },
        { label: '📊 Report ថ្ងៃនេះ', msg: 'របាយការណ៍ថ្ងៃនេះ' },
        { label: '🔔 Stock ខ្សោយ', msg: 'ទំនិញណាខ្សោយ stock?' },
        { label: '🏆 លក់ច្រើន', msg: 'ទំនិញណាលក់ច្រើនបំផុត?' },
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-800 overflow-hidden relative font-khmer">

            {/* Header */}
            <div className="bg-white dark:bg-slate-800 p-4 border-b dark:border-slate-700 flex items-center gap-3 z-20 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow">
                    <span className="material-icons-outlined text-xl">smart_toy</span>
                </div>
                <div className="flex-1">
                    <h2 className="font-bold dark:text-white">🤖 Sok AI Assistant (2.5 Lite)</h2>
                    <p className="text-xs text-slate-500">Order • Report • Stock • Customer • Discount • Track • Reply</p>
                </div>
                <button onClick={() => {
                    setMessages([{ role: 'model', text: 'ឆាតថ្មី! តើមានអ្វីឲ្យជួយ?' }]);
                    localStorage.removeItem('sokAiChatHistory');
                }} className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-slate-700 transition-colors" title="Clear">
                    <span className="material-icons-outlined text-sm">delete_outline</span>
                </button>
            </div>

            {/* Body */}
            <div className={`flex-1 flex flex-col min-h-0 ${userPlan === 'free' ? 'filter blur-md pointer-events-none opacity-50' : ''}`}>

                {/* Quick Actions */}
                <div className="px-4 pt-3 pb-1 flex gap-2 flex-wrap">
                    {quickActions.map((qa, i) => (
                        <button key={i} onClick={() => setInput(qa.msg)}
                            className="text-xs bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm">
                            {qa.label}
                        </button>
                    ))}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scroll">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white mr-2 mt-1 flex-shrink-0">
                                    <span className="material-icons-outlined" style={{ fontSize: '14px' }}>smart_toy</span>
                                </div>
                            )}
                            <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm whitespace-pre-line text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 dark:text-white border dark:border-slate-700 rounded-tl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                                <span className="material-icons-outlined" style={{ fontSize: '14px' }}>smart_toy</span>
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none border dark:border-slate-700 flex gap-1.5">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white dark:bg-slate-800 border-t dark:border-slate-700">
                    <div className="flex gap-2 relative max-w-4xl mx-auto">
                        <input type="text" value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !isLoading && handleSend()}
                            placeholder="ឧ. 'order ថ្មី' | 'report ថ្ងៃនេះ' | 'track SB-123' | 'stock ខ្សោយ?'"
                            className="flex-1 bg-slate-100 dark:bg-slate-900 dark:text-white rounded-full py-2.5 px-5 pr-12 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                        <button onClick={handleSend} disabled={isLoading || !input.trim()}
                            className="absolute right-1 top-1 w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40">
                            <span className="material-icons-outlined text-sm">send</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Free Lock */}
            {userPlan === 'free' && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl text-center max-w-sm border dark:border-slate-700 mx-4">
                        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="material-icons-outlined text-4xl">lock</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 dark:text-white">មុខងារត្រូវបានចាក់សោរ</h3>
                        <p className="text-sm text-slate-500 mb-6">សូមដំឡើងកញ្ចប់ដើម្បីប្រើ AI</p>
                        <button onClick={() => setCurrentView?.('pricing')} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg">ដំឡើងឥឡូវនេះ</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SokAssistant;