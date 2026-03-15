import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const SokAssistant: React.FC = () => {
    const {
        products, onlineOrders, customers,
        userPlan, setCurrentView,
        createOnlineOrder, deductStockFromOrder
    } = useData();

    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>(() => {
        const saved = localStorage.getItem('sokAiChatHistory');
        if (saved) return JSON.parse(saved);
        return [{
            role: 'model',
            text: 'សួស្តីមេបញ្ជាការ! ខ្ញុំគឺ Sok AI ⚡\n\nខ្ញុំបានរៀនក្បួនថ្មីរួចរាល់ហើយ! ឥឡូវនេះ ថៅកែគ្រាន់តែវាយបញ្ជា (ឧ. "យកកូកា ២កំប៉ុង") ខ្ញុំនឹងរុញចូល Order Board អូតូភ្លាមៗ ១០០%!\n\nតើថ្ងៃនេះចង់កម្ម៉ង់អ្វីដែរ?'
        }];
    });

    useEffect(() => {
        localStorage.setItem('sokAiChatHistory', JSON.stringify(messages));
    }, [messages]);

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || userPlan === 'free') return;
        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setInput('');
        setIsLoading(true);

        try {
            const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error("រកមិនឃើញ API Key");

            // 🛠️ Schema ដូចគ្នាបេះបិទនឹង telegram.ts
            const tools: any = [{
                functionDeclarations: [{
                    name: "create_direct_order",
                    description: "បង្កើតការកម្មង់ទិញថ្មី (Create Order) ពេលថៅកែបញ្ជាទិញទំនិញ ភ្ជាប់ជាមួយលេខទូរស័ព្ទ ឬទីតាំង។",
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            items: {
                                type: SchemaType.ARRAY,
                                description: "បញ្ជីទំនិញដែលថៅកែបញ្ជា (ឧ. កូកា ២កំប៉ុង)",
                                items: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        name: { type: SchemaType.STRING, description: "ឈ្មោះទំនិញ" },
                                        qty: { type: SchemaType.NUMBER, description: "ចំនួន" }
                                    },
                                    required: ["name", "qty"]
                                }
                            },
                            customerInfo: {
                                type: SchemaType.STRING,
                                description: "ព័ត៌មានភ្ញៀវ (លេខទូរស័ព្ទ ឬទីតាំង)"
                            }
                        },
                        required: ["items"] // customerInfo ដាក់ Optional ស្រួលអោយ AI ធ្វើការលឿន
                    }
                }]
            }];

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash', // ដំឡើងទៅ Flash ដូច telegram.ts
                systemInstruction: "អ្នកគឺជាជំនួយការហាងដ៏ឆ្លាតវៃ។ ច្បាប់ដែកថែប៖ ត្រូវតែឆ្លើយតបជា 'ភាសាខ្មែរ' ជានិច្ច! ពេលថៅកែបញ្ជាកត់ Order សូមហៅមុខងារ 'create_direct_order' ភ្លាម។ ទោះមិនមានលេខទូរស័ព្ទ ឬឈ្មោះអតិថិជន ក៏ត្រូវតែហៅមុខងារនេះដែរ ដោយដាក់ customerInfo ជា 'N/A'។",
                tools: tools
            });

            // រៀបចំ History (កាត់ Role ទី១ចេញ បើវាជា model ដើម្បីកុំអោយ Error)
            const historyForApi = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));
            if (historyForApi.length > 0 && historyForApi[0].role === 'model') {
                historyForApi.shift();
            }

            const chat = model.startChat({ history: historyForApi });
            const result = await chat.sendMessage(userMessage);
            const response = result.response;
            
            let text = response.text(); 
            const calls = response.functionCalls();

            // ⚡ បើ AI សម្រេចចិត្តហៅមុខងារបញ្ជូលអីវ៉ាន់
            if (calls && calls.length > 0) {
                const call = calls[0];
                if (call.name === "create_direct_order") {
                    const args = call.args as any;
                    
                    // 🚀 ក្បួន Force Insert (ដូច telegram.ts ដែរ)
                    const orderItems = (args.items || []).map((item: any) => {
                        // សាកល្បងឆែកមើលក្នុង Database សិន ក្រែងលោមានទំនិញនេះមែន
                        const dbProduct = products.find(p => p.name.toLowerCase().includes(item.name.toLowerCase()));
                        
                        if (dbProduct) {
                            return { ...dbProduct, quantity: item.qty }; // បើមាន យកតម្លៃពិត
                        } else {
                            // បើអត់មានទេ ក៏មិនបដិសេធដែរ! បង្កើតជា Dummy Item 0$ រុញចូល Board តែម្តង!
                            return {
                                id: Date.now() + Math.random(),
                                name: item.name,
                                quantity: item.qty,
                                price: 0,
                                cost: 0,
                                stock: 0,
                                baseUnit: 'unit',
                                status: 'In Stock',
                                category: 'AI Custom',
                                image: ''
                            };
                        }
                    });

                    if (orderItems.length > 0) {
                        // 1. បង្កើត Online Order ចូល Board ភ្លាមៗដោយមិនបាច់មាន Modal
                        await createOnlineOrder(
                            { 
                                name: "Sok AI Customer", 
                                phone: args.customerInfo && args.customerInfo !== 'N/A' ? args.customerInfo : "N/A", 
                                address: "N/A", 
                                avatar: "🤖" 
                            },
                            orderItems, 
                            0, // ថ្លៃដឹក
                            'COD', // Payment
                            'J&T Express', // Carrier
                            'Sok AI Assistant' // Source
                        );

                        // 2. កាត់ស្តុកតែទំនិញណាដែលមានក្នុង Database ពិតប្រាកដ
                        const realItems = orderItems.filter(i => i.category !== 'AI Custom');
                        if (realItems.length > 0 && deductStockFromOrder) {
                            deductStockFromOrder(realItems);
                        }

                        // 3. ប្រាប់ AI វិញថាជោគជ័យ ដើម្បីអោយវារៀបចំសារឆ្លើយតប
                        const finalResult = await chat.sendMessage([{
                            functionResponse: {
                                name: "create_direct_order",
                                response: { 
                                    status: "SUCCESS", 
                                    message: "Order has been inserted successfully." 
                                }
                            }
                        }]);
                        text = finalResult.response.text();
                    } else {
                        const finalResult = await chat.sendMessage([{
                            functionResponse: { name: "create_direct_order", response: { status: "FAILED" } }
                        }]);
                        text = finalResult.response.text();
                    }
                }
            }

            setMessages(prev => [...prev, { role: 'model', text: text }]);

        } catch (e) {
            console.error('AI Error:', e);
            setMessages(prev => [...prev, { role: 'model', text: 'សុំទោសបង! មានបញ្ហា API រអាក់រអួលបន្តិច។' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-800 overflow-hidden relative font-khmer">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 p-4 border-b dark:border-slate-700 flex items-center gap-3 z-20 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow">
                    <span className="material-icons-outlined text-xl">bolt</span>
                </div>
                <div className="flex-1">
                    <h2 className="font-bold dark:text-white">⚡ Sok AI Assistant</h2>
                    <p className="text-xs text-slate-500">ប្រាប់ឈ្មោះទំនិញ ខ្ញុំរុញចូល Order Board ឲ្យភ្លាមៗ!</p>
                </div>
                <button onClick={() => {
                    setMessages([{ role: 'model', text: 'ឆាតត្រូវបានសម្អាត! ចង់កម្ម៉ង់អីដែរថៅកែ?' }]);
                    localStorage.removeItem('sokAiChatHistory');
                }} className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-slate-700 transition-colors">
                    <span className="material-icons-outlined text-sm">delete_outline</span>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 flex flex-col min-h-0">
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
                            placeholder="សាកវាយ: 'យក Coca ២ និង ម្សៅម៉ី ១'"
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
                        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="material-icons-outlined text-4xl">lock</span></div>
                        <h3 className="text-xl font-bold mb-2 dark:text-white">ចាក់សោរ</h3>
                        <p className="text-sm text-slate-500 mb-6">Upgrade ដើម្បីប្រើមុខងារនេះ</p>
                        <button onClick={() => setCurrentView?.('pricing')} className="w-full py-3 bg-orange-500 text-white rounded-xl">ដំឡើងឥឡូវនេះ</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SokAssistant;