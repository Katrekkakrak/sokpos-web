import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const BroadcastCenter: React.FC = () => {
    const { customers, sendBroadcastMessage, setCurrentView } = useData();
    const [message, setMessage] = useState('');
    const [audience, setAudience] = useState('All');
    const [channel, setChannel] = useState('Telegram');

    const audienceCount = audience === 'All' ? customers.length : 
                         audience === 'VIP' ? customers.filter(c => c.status === 'VIP').length :
                         Math.floor(customers.length * 0.3); // Mock for inactive

    const handleSend = () => {
        if (message) {
            sendBroadcastMessage(audience, channel, message);
            setMessage('');
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark font-display overflow-hidden">
             {/* Header */}
             <div className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-6 py-4 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto w-full">
                    <nav className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                        <button onClick={() => setCurrentView('crm-directory')} className="hover:text-primary transition-colors">CRM</button>
                        <span className="material-symbols-outlined text-base">chevron_right</span>
                        <span className="font-medium text-text-main dark:text-white">Broadcast Center</span>
                    </nav>
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-bold text-text-main dark:text-white tracking-tight">Marketing Broadcast Center</h1>
                            <p className="text-text-secondary dark:text-gray-400 text-sm mt-1 font-khmer">គ្រប់គ្រងនិងផ្ញើយុទ្ធនាការទៅកាន់អតិថិជនរបស់អ្នក</p>
                        </div>
                        <div className="hidden sm:flex gap-2">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium border border-green-200">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> System Active
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-grow p-4 md:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                    {/* Left Column */}
                    <div className="lg:col-span-7 flex flex-col gap-8 pb-20 lg:pb-0">
                        {/* Step 1: Audience */}
                        <section className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">1</div>
                                <h2 className="text-lg font-bold text-text-main dark:text-white">Select Audience <span className="text-text-secondary font-normal text-base ml-1 font-khmer">(ជ្រើសរើសអតិថិជន)</span></h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {['All', 'VIP', 'Inactive'].map(opt => (
                                    <label key={opt} className={`relative flex flex-col gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${audience === opt ? 'border-primary bg-primary/5' : 'border-transparent bg-background-light dark:bg-background-dark hover:border-primary/30'}`}>
                                        <input type="radio" name="audience" className="peer sr-only" checked={audience === opt} onChange={() => setAudience(opt)} />
                                        <div className="flex justify-between items-start">
                                            <div className={`p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm ${opt === 'All' ? 'text-primary' : opt === 'VIP' ? 'text-amber-500' : 'text-slate-500'}`}>
                                                <span className="material-symbols-outlined">{opt === 'All' ? 'groups' : opt === 'VIP' ? 'diamond' : 'person_off'}</span>
                                            </div>
                                            {audience === opt && <span className="material-symbols-outlined text-primary">check_circle</span>}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-text-main dark:text-white">{opt === 'All' ? 'All Customers' : opt === 'VIP' ? 'VIP Members' : 'Inactive Users'}</p>
                                            <p className="text-xs text-text-secondary font-khmer">{opt === 'All' ? 'អតិថិជនទាំងអស់' : opt === 'VIP' ? 'សមាជិក VIP' : 'អ្នកមិនសកម្ម'}</p>
                                        </div>
                                        <div className="mt-2 text-xs font-medium px-2 py-1 bg-white dark:bg-gray-800 rounded w-fit text-text-secondary border border-border-light dark:border-border-dark">
                                            ~{audience === 'All' ? customers.length : audience === 'VIP' ? customers.filter(c => c.status === 'VIP').length : '850'} users
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </section>

                        {/* Step 2: Channel */}
                        <section className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary font-bold">2</div>
                                <h2 className="text-lg font-bold text-text-main dark:text-white">Select Channel <span className="text-text-secondary font-normal text-base ml-1 font-khmer">(ជ្រើសរើសបណ្តាញ)</span></h2>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {['SMS', 'Telegram', 'App Push'].map(ch => (
                                    <button 
                                        key={ch}
                                        onClick={() => setChannel(ch)}
                                        className={`flex items-center gap-3 px-5 py-3 rounded-lg border-2 transition-all ${channel === ch ? 'border-primary bg-primary text-white shadow-md' : 'border-transparent bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-gray-700 text-text-main dark:text-white'}`}
                                    >
                                        <span className={`material-symbols-outlined ${channel === ch ? 'text-white' : ch === 'Telegram' ? 'text-[#229ED9]' : ch === 'App Push' ? 'text-purple-500' : ''}`}>
                                            {ch === 'SMS' ? 'sms' : ch === 'Telegram' ? 'send' : 'notifications_active'}
                                        </span>
                                        <div className="text-left leading-tight">
                                            <span className="block font-semibold">{ch}</span>
                                            <span className={`text-[10px] ${channel === ch ? 'opacity-90' : 'text-text-secondary'}`}>{ch === 'SMS' ? 'Direct Carrier' : ch === 'Telegram' ? 'Bot API' : 'Mobile Notification'}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Step 3: Message */}
                        <section className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm flex-grow">
                            <div className="flex justify-between items-center mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary font-bold">3</div>
                                    <h2 className="text-lg font-bold text-text-main dark:text-white">Compose Message <span className="text-text-secondary font-normal text-base ml-1 font-khmer">(សរសេរសារ)</span></h2>
                                </div>
                                <button className="text-primary text-sm font-medium flex items-center gap-1 hover:underline"><span className="material-symbols-outlined text-lg">data_object</span> Insert Variable</button>
                            </div>
                            <div className="relative">
                                <textarea 
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    className="w-full h-40 p-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-text-main dark:text-white placeholder-text-secondary" 
                                    placeholder="Type your message here... (សូមសរសេរសាររបស់អ្នកនៅទីនេះ...)"
                                ></textarea>
                                <div className="absolute bottom-3 right-3 flex items-center gap-3 text-xs text-text-secondary">
                                    <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded border border-border-light dark:border-border-dark">1 SMS Segment</span>
                                    <span>{message.length} / 160 characters</span>
                                </div>
                            </div>
                        </section>

                        {/* Actions */}
                        <div className="hidden lg:flex items-center justify-between mt-auto pt-4">
                            <button className="px-6 py-3 rounded-lg border border-border-light dark:border-border-dark text-text-main dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 font-khmer">
                                <span className="material-symbols-outlined">schedule</span> Schedule (កំណត់ពេលផ្ញើ)
                            </button>
                            <button onClick={handleSend} className="px-8 py-3 rounded-lg bg-primary text-white font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all flex items-center gap-2 transform active:scale-95 font-khmer">
                                <span className="material-symbols-outlined">send</span> Send Now (ផ្ញើឥឡូវនេះ)
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="lg:col-span-5 h-full relative">
                        <div className="sticky top-24">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="font-bold text-text-main dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-text-secondary">smartphone</span> Live Preview
                                </h3>
                                <span className="text-xs text-text-secondary bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">iphone 14 Pro</span>
                            </div>
                            {/* Phone Mockup */}
                            <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl flex flex-col overflow-hidden">
                                <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white dark:bg-gray-900 relative flex flex-col">
                                    {/* App Header */}
                                    <div className="bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3 shrink-0 z-10 sticky top-0 mt-8">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">QB</div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-black dark:text-white">SokBiz KH</span>
                                            <span className="text-[9px] text-gray-500">{channel} • Today 9:41 AM</span>
                                        </div>
                                    </div>
                                    {/* Chat Body */}
                                    <div className="flex-grow p-4 overflow-y-auto bg-white dark:bg-gray-900 flex flex-col gap-3 relative">
                                        <div className="self-start max-w-[85%] rounded-2xl rounded-tl-none px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-xs shadow-sm">
                                            <p>Hello! Do you have any promotions today?</p>
                                        </div>
                                        <div className="text-[9px] text-gray-400 text-center my-1">Today 9:41 AM</div>
                                        {message && (
                                            <div className="self-end max-w-[90%] rounded-2xl rounded-tr-none px-3 py-2 bg-blue-500 text-white text-xs shadow-md animate-fade-in-up">
                                                <p>{message}</p>
                                            </div>
                                        )}
                                        {message && <div className="self-end text-[9px] text-gray-400 font-medium">Delivered</div>}
                                    </div>
                                    {/* Input Fake */}
                                    <div className="h-12 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center px-3 gap-2 shrink-0">
                                        <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center"><span className="material-symbols-outlined text-white text-[14px]">add</span></div>
                                        <div className="flex-grow h-7 rounded-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-3 text-[10px] flex items-center text-gray-400">iMessage</div>
                                        <span className="material-symbols-outlined text-blue-500 text-[18px]">mic</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BroadcastCenter;