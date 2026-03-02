import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
    RefreshCw, Search, Printer, Bluetooth, Receipt, Wifi, MoreVertical, 
    PlusCircle, Settings, Banknote, ChevronDown, ScanBarcode, HelpCircle 
} from 'lucide-react';

const HardwareSetup: React.FC = () => {
    const { setCurrentView } = useData();
    const [printers, setPrinters] = useState([
        { id: 1, name: 'Kitchen Printer', status: 'Connected', ip: '192.168.1.50', type: 'Network' },
        { id: 2, name: 'Counter Receipt (POS 1)', status: 'Offline', ip: 'Epson TM-m30', type: 'Bluetooth' }
    ]);
    const [isScanning, setIsScanning] = useState(false);

    const handleScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            // Simulate finding a new printer or refreshing
            setPrinters(prev => prev.map(p => ({ ...p, status: 'Connected' })));
        }, 2000);
    };

    const toggleConnection = (id: number) => {
        setPrinters(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, status: p.status === 'Connected' ? 'Offline' : 'Connected' };
            }
            return p;
        }));
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background-light dark:bg-background-dark font-display">
            {/* Header */}
            <div className="flex-1 overflow-y-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex w-full max-w-5xl flex-col gap-8 mx-auto">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
                        <button onClick={() => setCurrentView('dashboard')} className="hover:text-primary transition-colors">Settings</button>
                        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
                        <span className="text-slate-900 dark:text-white">Hardware</span>
                    </nav>
                    
                    {/* Header Section */}
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Hardware & Printer Setup
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-base">
                                Manage your thermal printers, cash drawers, and POS peripherals.
                            </p>
                        </div>
                        {/* Primary Action */}
                        <button 
                            onClick={handleScan}
                            disabled={isScanning}
                            className="group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark transition-all disabled:opacity-75"
                        >
                            {isScanning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            <span className="flex flex-col items-start leading-tight">
                                <span>{isScanning ? 'Scanning...' : 'Scan for Printers'}</span>
                                <span className="text-[10px] font-normal opacity-90 font-khmer">ស្វែងរកម៉ាស៊ីនបោះពុម្ព</span>
                            </span>
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Left Column: Printer List */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Printer className="w-5 h-5 text-slate-400" />
                                    Connected Printers
                                </h2>
                                <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-primary/20">{printers.length} Devices</span>
                            </div>

                            {/* Printer Cards */}
                            {printers.map(printer => (
                                <div key={printer.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30 dark:border-slate-700 dark:bg-slate-800">
                                    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                                {printer.type === 'Bluetooth' ? <Bluetooth size={28} /> : <Receipt size={28} />}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-slate-900 dark:text-white">{printer.name}</h3>
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium 
                                                        ${printer.status === 'Connected' 
                                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${printer.status === 'Connected' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                        {printer.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        {printer.type === 'Bluetooth' ? <Bluetooth size={16} /> : <Wifi size={16} />}
                                                        {printer.ip}
                                                    </span>
                                                    <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                    <span>Port: 9100</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                            <button 
                                                onClick={() => toggleConnection(printer.id)}
                                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                {printer.status === 'Connected' ? <Printer size={18} /> : <RefreshCw size={18} />}
                                                {printer.status === 'Connected' ? 'Test Print' : 'Reconnect'}
                                            </button>
                                            <button className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors">
                                                <MoreVertical size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add New Manual Card */}
                            <button className="group flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-4 text-sm font-medium text-slate-600 hover:border-primary hover:bg-primary/5 hover:text-primary dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-400 dark:hover:border-primary dark:hover:bg-primary/10 transition-all">
                                <PlusCircle className="w-5 h-5" />
                                Add Printer Manually
                            </button>
                        </div>

                        {/* Right Column: Settings */}
                        <div className="lg:col-span-1 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-slate-400" />
                                    Peripherals
                                </h2>
                            </div>
                            
                            {/* Cash Drawer */}
                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                <div className="bg-slate-50 p-4 border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-primary dark:bg-blue-900/30 dark:text-blue-400">
                                            <Banknote size={18} />
                                        </div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white">Cash Drawer</h3>
                                    </div>
                                </div>
                                <div className="p-4 flex flex-col gap-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">Connect Cash Drawer</span>
                                            <span className="text-xs font-khmer text-slate-500 dark:text-slate-400">ភ្ជាប់ថតលុយ</span>
                                        </div>
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            <input defaultChecked className="peer sr-only" type="checkbox"/>
                                            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-slate-700"></div>
                                        </label>
                                    </div>
                                    <div className="h-px w-full bg-slate-100 dark:bg-slate-700"></div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold dark:text-slate-400">Trigger Event</label>
                                        <div className="relative">
                                            <select className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                                <option>Open on Receipt Print</option>
                                                <option>Open on Sale Completion</option>
                                                <option>Manual Open Only</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                                <ChevronDown size={20} />
                                            </div>
                                        </div>
                                    </div>
                                    <button className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                                        Test Open Drawer
                                    </button>
                                </div>
                            </div>

                            {/* Barcode Scanner */}
                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                <div className="p-4 flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                            <ScanBarcode size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Barcode Scanner</h3>
                                            <span className="text-xs text-slate-500">Mode: Keyboard Wedge</span>
                                        </div>
                                    </div>
                                    <div className="h-px w-full bg-slate-100 dark:bg-slate-700"></div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Beep on Scan</span>
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            <input defaultChecked className="peer sr-only" type="checkbox"/>
                                            <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-slate-700"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Help Area */}
                    <div className="mt-8 rounded-xl bg-blue-50 p-4 border border-blue-100 dark:bg-slate-800 dark:border-slate-700">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-sm dark:bg-slate-900">
                                    <HelpCircle className="w-6 h-6" />
                                </span>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Need help connecting?</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">Check our troubleshooting guide for network printers.</p>
                                </div>
                            </div>
                            <a className="text-sm font-medium text-primary hover:underline whitespace-nowrap" href="#">View Documentation →</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HardwareSetup;