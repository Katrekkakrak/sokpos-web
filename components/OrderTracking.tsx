import React, { useState } from 'react';
import { useData, OnlineOrder } from '../context/DataContext';

const OrderTracking: React.FC = () => {
    const { onlineOrders, setCurrentView } = useData();
    const [searchId, setSearchId] = useState('');
    const [result, setResult] = useState<OnlineOrder | null>(null);

    // Initial load demo
    React.useEffect(() => {
        setSearchId('QB-882910-KH');
    }, []);

    const handleTrack = () => {
        // Mock search logic: Check ID or Tracking Number. 
        // For demo, if ID matches our static input or any context order
        const found = onlineOrders.find(o => 
            o.id.includes(searchId) || 
            o.shippingDetails?.trackingNumber === searchId
        );

        if (found) {
            setResult(found);
        } else {
            // Mock result for the static visual if not found in context (since context might be empty initially)
            // This ensures the beautiful UI is visible immediately
            setResult({
                id: searchId,
                status: 'Shipping',
                customer: { name: 'Sokha Vann', phone: '012 345 678', address: 'Phnom Penh', avatar: '' },
                items: [], subtotal: 0, discount: 0, tax: 0, shippingFee: 0, total: 0, paymentStatus: 'Paid', paymentMethod: 'ABA', date: new Date(),
                driver: { name: 'Dara Rith', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDY6m0EVUNZ-ZvP5y5PodVakVN29oiwwPTjfIrJWoceX2Q9opjVKqjMh69P0JCfEuei8bxDqbHcEHGqupcysY3vUb1Ff4iIwFJGzsQtKugILZRVQhBomgmdI4ZgqZiVxV7b2_r9qeefb61jVABBW95rJoIxCNpIFnGtmY2cG6dRf7mY7a0b_zrWis8_x3dEw21LzyT1B9lazO5kR5vN7C9YqLUpfS8W3brBDGOoZBV2uP0nbTHs9DJuwSmAUaVQOg0qbQWRK8_FXjg', eta: 'Today' },
                shippingDetails: { courier: 'Virak Buntham', trackingNumber: searchId, fee: 2.00 }
            } as any);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-[#0d141b] flex flex-col font-display">
            <header className="bg-white dark:bg-[#1a2634] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
                <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-primary cursor-pointer" onClick={() => setCurrentView('dashboard')}>
                            <span className="material-symbols-outlined text-3xl">local_shipping</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">SokBiz KH</h1>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <button onClick={() => setCurrentView('dashboard')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Dashboard</button>
                        <button className="text-sm font-medium text-primary dark:text-primary font-semibold">Tracking</button>
                        <button onClick={() => setCurrentView('online-orders')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Orders</button>
                        <button onClick={() => setCurrentView('courier-list')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Couriers</button>
                    </nav>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-500 hover:text-primary transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                            <span className="material-symbols-outlined text-xl">notifications</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow w-full max-w-[1024px] mx-auto px-4 py-8 md:py-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Unified Delivery Tracking</h2>
                    <p className="text-secondary-text text-base md:text-lg mb-8 max-w-2xl mx-auto">Track your package status in real-time across all our partner logistics providers.</p>
                    <div className="max-w-2xl mx-auto relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-400 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-200"></div>
                        <div className="relative flex items-center bg-white dark:bg-[#1e2936] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-2">
                            <div className="pl-4 text-gray-400"><span className="material-symbols-outlined text-2xl">search</span></div>
                            <input className="w-full h-12 md:h-14 px-4 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 text-lg" placeholder="Enter Tracking Number (e.g. QB-882910)" type="text" value={searchId} onChange={e => setSearchId(e.target.value)} />
                            <button onClick={handleTrack} className="bg-primary hover:bg-primary-dark text-white px-6 md:px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 whitespace-nowrap shadow-md">
                                <span>Track</span><span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>

                {result && (
                    <div className="bg-white dark:bg-[#1e2936] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-up">
                        <div className="bg-primary/5 dark:bg-primary/10 p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 flex flex-wrap justify-between items-start gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Active</span>
                                    <span className="text-secondary-text text-sm font-medium">Tracking ID: {result.shippingDetails?.trackingNumber || result.id}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">In Transit <span className="text-lg font-normal text-secondary-text khmer-text">(កំពុងដឹកជញ្ជូន)</span></h3>
                                <p className="text-sm text-secondary-text mt-1">Expected Delivery: <span className="font-semibold text-gray-900 dark:text-gray-100">Oct 24, 2023</span></p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-xs text-secondary-text uppercase font-semibold tracking-wider">Courier</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{result.shippingDetails?.courier || 'N/A'}</p>
                                </div>
                                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center p-2"><span className="material-symbols-outlined text-3xl text-blue-600">local_shipping</span></div>
                            </div>
                        </div>

                        {/* Stepper */}
                        <div className="p-6 md:p-10">
                            <div className="relative">
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 rounded-full z-0"></div>
                                <div className="absolute top-1/2 left-0 w-3/4 h-1 bg-primary -translate-y-1/2 rounded-full z-0 transition-all duration-1000 ease-out"></div>
                                <div className="relative z-10 flex justify-between w-full">
                                    <div className="flex flex-col items-center group">
                                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 mb-4 transition-transform group-hover:scale-110"><span className="material-symbols-outlined text-xl">inventory_2</span></div>
                                        <div className="text-center"><p className="text-sm font-bold text-gray-900 dark:text-white">Packing</p><p className="text-xs text-secondary-text khmer-text">កំពុងរៀបចំ</p><p className="text-[10px] text-secondary-text mt-1 font-mono">Oct 20, 10:00 AM</p></div>
                                    </div>
                                    <div className="flex flex-col items-center group">
                                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 mb-4 transition-transform group-hover:scale-110"><span className="material-symbols-outlined text-xl">local_shipping</span></div>
                                        <div className="text-center"><p className="text-sm font-bold text-gray-900 dark:text-white">Shipped</p><p className="text-xs text-secondary-text khmer-text">ប្រគល់ឱ្យក្រុមហ៊ុនដឹក</p><p className="text-[10px] text-secondary-text mt-1 font-mono">Oct 21, 02:30 PM</p></div>
                                    </div>
                                    <div className="flex flex-col items-center group">
                                        <div className="w-12 h-12 rounded-full bg-white border-4 border-primary text-primary flex items-center justify-center shadow-lg mb-3 -mt-1 ring-4 ring-primary/20 transition-transform group-hover:scale-110"><span className="material-symbols-outlined text-2xl animate-pulse">move_to_inbox</span></div>
                                        <div className="text-center"><p className="text-base font-bold text-primary">In Transit</p><p className="text-xs font-medium text-primary/80 khmer-text">កំពុងដឹកជញ្ជូន</p><p className="text-[10px] text-secondary-text mt-1 font-mono">Oct 22, 09:15 AM</p></div>
                                    </div>
                                    <div className="flex flex-col items-center group opacity-50">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 flex items-center justify-center mb-4 border border-gray-300 dark:border-gray-600"><span className="material-symbols-outlined text-xl">check_circle</span></div>
                                        <div className="text-center"><p className="text-sm font-bold text-gray-500 dark:text-gray-400">Delivered</p><p className="text-xs text-secondary-text khmer-text">បានទទួល</p><p className="text-[10px] text-secondary-text mt-1 font-mono">Pending</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Grid */}
                        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1a232e] p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 mb-2 text-secondary-text"><span className="material-symbols-outlined text-lg">storefront</span><span className="text-xs font-bold uppercase tracking-wider">Sender</span></div>
                                    <p className="font-semibold text-gray-900 dark:text-white">SokBiz Official Store</p>
                                    <p className="text-sm text-secondary-text">Phnom Penh, Cambodia</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 mb-2 text-secondary-text"><span className="material-symbols-outlined text-lg">person</span><span className="text-xs font-bold uppercase tracking-wider">Recipient (អ្នកទទួល)</span></div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{result.customer.name}</p>
                                    <div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-secondary-text">call</span><p className="text-sm text-secondary-text">{result.customer.phone}</p></div>
                                </div>
                                <div className="flex flex-col gap-1 md:pl-8 md:border-l md:border-gray-200 md:dark:border-gray-700">
                                    <div className="flex items-center gap-2 mb-2 text-secondary-text"><span className="material-symbols-outlined text-lg">update</span><span className="text-xs font-bold uppercase tracking-wider">Latest Update</span></div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Arrived at Distribution Center</p>
                                    <p className="text-xs text-secondary-text">Battambang Province Branch</p>
                                </div>
                            </div>
                        </div>

                        {/* History */}
                        <div className="p-6 md:p-8 border-t border-gray-100 dark:border-gray-800">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Shipment History</h4>
                            <div className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-8">
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-white dark:border-[#1e2936]"></div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                                        <div><p className="text-sm font-bold text-gray-900 dark:text-white">Arrived at Distribution Center</p><p className="text-sm text-gray-500 dark:text-gray-400">Battambang Province Branch</p></div>
                                        <p className="text-xs text-secondary-text font-mono mt-1 sm:mt-0">Oct 22, 09:15 AM</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-[#1e2936]"></div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                                        <div><p className="text-sm font-medium text-gray-700 dark:text-gray-300">Departed from Sorting Facility</p><p className="text-sm text-gray-500 dark:text-gray-400">Phnom Penh Main Hub</p></div>
                                        <p className="text-xs text-secondary-text font-mono mt-1 sm:mt-0">Oct 21, 08:30 PM</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-[#1e2936]"></div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                                        <div><p className="text-sm font-medium text-gray-700 dark:text-gray-300">Package Received by Courier</p><p className="text-sm text-gray-500 dark:text-gray-400">{result.shippingDetails?.courier}</p></div>
                                        <p className="text-xs text-secondary-text font-mono mt-1 sm:mt-0">Oct 21, 02:30 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default OrderTracking;