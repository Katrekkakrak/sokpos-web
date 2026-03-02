import React, { useState } from 'react';
import { useData, Contact } from '../context/DataContext';
import CustomerProfile from './CustomerProfile';
import ManageStagesModal from './ManageStagesModal';
import * as LucideIcons from 'lucide-react';
import { 
    ChevronRight, Bell, HelpCircle, Plus, Users, TrendingUp, UserPlus, 
    Search, ChevronDown, Phone, MessageSquare, Edit, Send, Globe, Store,
    LayoutGrid, MapPin, Facebook, Video, User, MessageCircle, Package, TrendingDown, Minus,
    CheckCircle, Crown, Clock, Bookmark, Target, Settings2
} from 'lucide-react';

const CrmDirectory: React.FC = () => {
    const { leads, customers, orders, onlineOrders, setIsAddLeadModalOpen, setSelectedContact, setCurrentView, customFieldsSchema, selectedContact, contactStages, setEditingContact } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [dateFilter, setDateFilter] = useState('All Time');
    const [isManageStagesOpen, setIsManageStagesOpen] = useState(false);
    const [activeCardFilter, setActiveCardFilter] = useState<'all' | 'new' | 'customer'>('all');
    
    // Define the draggable columns keys (excluding NO and NAME)
    const initialColumns = [
        { id: 'phone', label: 'លេខទូរស័ព្ទ (PHONE)' },
        { id: 'source', label: 'ប្រភព (SOURCE)' },
        { id: 'interested_in', label: 'ចំណាប់អារម្មណ៍ (INTERESTED IN)' },
        { id: 'custom_fields', label: 'ព័ត៌មានបន្ថែម (CUSTOM FIELDS)' },
        { id: 'map', label: 'ទីតាំង (MAP)' },
        { id: 'handler', label: 'អ្នកទទួលខុសត្រូវ (HANDLED BY)' },
        { id: 'joined', label: 'ថ្ងៃចុះឈ្មោះ (JOINED)' },
        { id: 'stage', label: 'ស្ថានភាព (STAGE)' },
        { id: 'actions', label: 'សកម្មភាព (ACTIONS)' }
    ];
    const [columns, setColumns] = useState(initialColumns);
    const [draggedColId, setDraggedColId] = useState<string | null>(null);

    // Add Column Modal State
    const [showAddColModal, setShowAddColModal] = useState(false);
    const [newColName, setNewColName] = useState('');
    const [newColType, setNewColType] = useState('text'); // 'text', 'priority', 'date', 'checkbox'
    
    // State to store custom field values per contact
    const [customFieldValues, setCustomFieldValues] = useState<Record<string, Record<string, any>>>({});

    // Drag Handlers
    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedColId(id);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => { (e.target as HTMLElement).style.opacity = '0.5'; }, 0);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedColId(null);
        (e.target as HTMLElement).style.opacity = '1';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedColId || draggedColId === targetId) return;

        setColumns((prevCols) => {
            const draggedIndex = prevCols.findIndex(c => c.id === draggedColId);
            const targetIndex = prevCols.findIndex(c => c.id === targetId);
            
            const newCols = [...prevCols];
            const [removed] = newCols.splice(draggedIndex, 1);
            newCols.splice(targetIndex, 0, removed);
            return newCols;
        });
        setDraggedColId(null);
    };

    // Handler to create a new custom column
    const handleAddCustomColumn = () => {
        if (!newColName.trim()) return;
        const newColId = `custom_${Date.now()}`;
        // Add new column to the draggable columns array
        setColumns([...columns, { id: newColId, label: newColName, type: newColType as any }]);
        setShowAddColModal(false);
        setNewColName('');
        setNewColType('text');
    };

    // Generic handler for inline editing custom fields
    const handleCustomFieldChange = (contactId: string, colId: string, val: any) => {
        setCustomFieldValues((prev) => ({
            ...prev,
            [contactId]: {
                ...(prev[contactId] || {}),
                [colId]: val
            }
        }));
        // In a real database, you would update the contact's custom_fields object here
        console.log(`Update Contact ${contactId} | Field ${colId} = ${val}`);
    };
    
    // Helper function to get stage config from dynamic contactStages
    const getStageConfig = (stageName: string) => {
        const stage = contactStages?.find(s => s.name === stageName);
        if (!stage) return { icon: LucideIcons.Target, bgColor: 'bg-slate-100 dark:bg-slate-800', textColor: 'text-slate-700 dark:text-slate-300', border: 'border-black/5 dark:border-white/5' };
        
        const IconComponent = (LucideIcons as any)[stage.iconName] || LucideIcons.Target;
        const classes = stage.colorClass.split(' ');
        const bgColor = classes.filter(c => c.startsWith('bg-')).join(' ');
        const textColor = classes.filter(c => c.startsWith('text-')).join(' ');
        const borderColor = classes.filter(c => c.startsWith('border-')).join(' ') || 'border-black/5 dark:border-white/5';
        
        return { icon: IconComponent, bgColor, textColor, border: borderColor };
    };
    
    // Combine and filter contacts (Leads + Customers)
    const allContacts = [...leads, ...customers];

    // ==========================================
    // 🧠 SMART METRICS CALCULATION LOGIC 
    // ==========================================
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. រូបមន្ត New Leads (Count all contacts with "New Lead" status)
    const newLeadsToday = allContacts.filter(contact => {
        if (!contact.status) return false;
        const statusStr = Array.isArray(contact.status) ? contact.status.join(',') : contact.status;
        return statusStr.includes('New Lead');
    }).length;

    // 2. រូបមន្ត Active Customers (ទិញយ៉ាងតិច ២ ដង ក្នុងរង្វង់ ៣០ ថ្ងៃ)
    const activeCustomersCount = allContacts.filter(contact => {
        // Find all POS and Online orders matching this contact by name or phone
        const customerPosOrders = orders.filter(o => 
            o.customer?.name === contact.name || o.customer?.phone === contact.phone
        );
        const customerWebOrders = onlineOrders.filter(o => 
            o.customer?.name === contact.name || o.customer?.phone === contact.phone
        );
        
        const allCustomerOrders = [...customerPosOrders, ...customerWebOrders];
        const totalOrders = allCustomerOrders.length;
        
        // Rule 1: Must have at least 2 orders
        if (totalOrders < 2) return false;

        // Rule 2: Last order must be within the last 30 days
        allCustomerOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const lastOrderDate = new Date(allCustomerOrders[0].date);
        
        return lastOrderDate >= thirtyDaysAgo;
    }).length;
    // ==========================================

    // --- Growth Rate Calculation (Month over Month) ---
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let thisMonthCount = 0;
    let lastMonthCount = 0;

    allContacts.forEach(contact => {
        if (!contact.joinedDate) return;
        const joined = new Date(contact.joinedDate);
        if (joined.getFullYear() === currentYear && joined.getMonth() === currentMonth) {
            thisMonthCount++;
        } else if (
            (joined.getFullYear() === currentYear && joined.getMonth() === currentMonth - 1) ||
            (currentMonth === 0 && joined.getFullYear() === currentYear - 1 && joined.getMonth() === 11) // Handle January case
        ) {
            lastMonthCount++;
        }
    });

    let growthPct = 0;
    if (lastMonthCount === 0) {
        growthPct = thisMonthCount > 0 ? 100 : 0; // 100% if we got new contacts this month but 0 last month
    } else {
        growthPct = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
    }
    const formattedGrowth = Math.abs(growthPct).toFixed(1);
    // --------------------------------------------------

    // --- Daily Growth Calculation (Today vs Yesterday) ---
    const todayNorm = new Date();
    todayNorm.setHours(0, 0, 0, 0);

    const yesterdayNorm = new Date(todayNorm);
    yesterdayNorm.setDate(yesterdayNorm.getDate() - 1);

    let todayCount = 0;
    let yesterdayCount = 0;

    allContacts.forEach(contact => {
        if (!contact.joinedDate) return;
        const joined = new Date(contact.joinedDate);
        joined.setHours(0, 0, 0, 0);

        if (joined.getTime() === todayNorm.getTime()) {
            todayCount++;
        } else if (joined.getTime() === yesterdayNorm.getTime()) {
            yesterdayCount++;
        }
    });

    let dailyGrowthPct = 0;
    if (yesterdayCount === 0) {
        dailyGrowthPct = todayCount > 0 ? 100 : 0;
    } else {
        dailyGrowthPct = ((todayCount - yesterdayCount) / yesterdayCount) * 100;
    }
    const formattedDailyGrowth = Math.abs(dailyGrowthPct).toFixed(1);
    // --------------------------------------------------

    // --- Leads & Customers Advanced Metrics ---

    // Leads DoD
    const newLeadsYesterday = allContacts.filter(contact => {
        if (!contact.status || !contact.joinedDate) return false;
        const statusStr = Array.isArray(contact.status) ? contact.status.join(',') : contact.status;
        if (!statusStr.includes('New Lead')) return false;
        const joined = new Date(contact.joinedDate);
        joined.setHours(0, 0, 0, 0);
        return joined.getTime() === yesterdayNorm.getTime();
    }).length;

    let leadsGrowthPct = 0;
    if (newLeadsYesterday === 0) {
        leadsGrowthPct = newLeadsToday > 0 ? 100 : 0;
    } else {
        leadsGrowthPct = ((newLeadsToday - newLeadsYesterday) / newLeadsYesterday) * 100;
    }
    const formattedLeadsGrowth = Math.abs(leadsGrowthPct).toFixed(1);

    const totalPendingLeads = allContacts.filter(contact => {
        if (!contact.status) return false;
        const statusStr = Array.isArray(contact.status) ? contact.status.join(',') : contact.status;
        return statusStr.includes('New Lead');
    }).length;

    // Customers Conversion & MoM
    const conversionRate = allContacts.length > 0 ? ((activeCustomersCount / allContacts.length) * 100).toFixed(1) : 0;
    
    let thisMonthCust = 0;
    let lastMonthCust = 0;
    allContacts.forEach(contact => {
        if (!contact.status || !contact.joinedDate) return;
        const statusStr = Array.isArray(contact.status) ? contact.status.join(',') : contact.status;
        if (statusStr.includes('Customer') || statusStr.includes('VIP')) {
             const joined = new Date(contact.joinedDate);
             if (joined.getFullYear() === currentYear && joined.getMonth() === currentMonth) thisMonthCust++;
             else if ((joined.getFullYear() === currentYear && joined.getMonth() === currentMonth - 1) || (currentMonth === 0 && joined.getFullYear() === currentYear - 1 && joined.getMonth() === 11)) lastMonthCust++;
        }
    });
    
    let custGrowthPct = 0;
    if (lastMonthCust === 0) {
        custGrowthPct = thisMonthCust > 0 ? 100 : 0;
    } else {
        custGrowthPct = ((thisMonthCust - lastMonthCust) / lastMonthCust) * 100;
    }
    const formattedCustGrowth = Math.abs(custGrowthPct).toFixed(1);
    // --------------------------------------------------

    // Customers DoD (Today vs Yesterday)
    let todayCust = 0;
    let yesterdayCust = 0;
    allContacts.forEach(contact => {
        if (!contact.status || !contact.joinedDate) return;
        const statusStr = Array.isArray(contact.status) ? contact.status.join(',') : contact.status;
        if (statusStr.includes('Customer') || statusStr.includes('VIP')) {
             const joined = new Date(contact.joinedDate);
             joined.setHours(0, 0, 0, 0);
             if (joined.getTime() === todayNorm.getTime()) todayCust++;
             else if (joined.getTime() === yesterdayNorm.getTime()) yesterdayCust++;
        }
    });

    let custDailyGrowthPct = 0;
    if (yesterdayCust === 0) {
        custDailyGrowthPct = todayCust > 0 ? 100 : 0;
    } else {
        custDailyGrowthPct = ((todayCust - yesterdayCust) / yesterdayCust) * 100;
    }
    const formattedCustDailyGrowth = Math.abs(custDailyGrowthPct).toFixed(1);
    
    // Helper function to get REAL orders for a contact by cross-referencing global onlineOrders
    const getTrueOrdersForContact = (contact: any) => {
        // Cross-reference with the true global orders database for 100% accuracy
        if (typeof onlineOrders !== 'undefined' && Array.isArray(onlineOrders)) {
            return onlineOrders.filter((o: any) => 
                (o.customer?.phone && contact.phone && o.customer.phone === contact.phone) || 
                (o.customerId && contact.id && o.customerId === contact.id)
            );
        }
        // Fallback to POS orders
        if (typeof orders !== 'undefined' && Array.isArray(orders)) {
            return orders.filter((o: any) => 
                (o.customer?.phone && contact.phone && o.customer.phone === contact.phone) || 
                (o.customerId && contact.id && o.customerId === contact.id)
            );
        }
        // Last resort: nested array
        return contact.orders || [];
    };
    
    const filteredContacts = allContacts.filter(contact => {
        const lowerSearch = searchTerm.toLowerCase();
        
        // 1. Search Logic
        const matchesSearch = contact.name.toLowerCase().includes(lowerSearch) || 
                              contact.phone.includes(lowerSearch);
        
        // 2. Status Logic
        const statusStr = Array.isArray(contact.status) ? contact.status.join(',') : contact.status;
        const matchesStatus = statusFilter === 'All Status' || statusStr === statusFilter || statusStr.includes(statusFilter);

        // 3. Date Logic
        let matchesDate = true;
        if (dateFilter !== 'All Time' && dateFilter !== 'Custom') {
            if (!contact.joinedDate) {
                matchesDate = false;
            } else {
                const joined = new Date(contact.joinedDate);
                const todayNorm = new Date();
                todayNorm.setHours(0, 0, 0, 0); 
                
                const joinedNormalized = new Date(joined);
                joinedNormalized.setHours(0, 0, 0, 0);

                if (dateFilter === 'Today') {
                    matchesDate = joinedNormalized.getTime() === todayNorm.getTime();
                } else if (dateFilter === 'Yesterday') {
                    const yesterday = new Date(todayNorm);
                    yesterday.setDate(yesterday.getDate() - 1);
                    matchesDate = joinedNormalized.getTime() === yesterday.getTime();
                } else if (dateFilter === 'This Week') {
                    const startOfWeek = new Date(todayNorm);
                    startOfWeek.setDate(todayNorm.getDate() - todayNorm.getDay()); 
                    matchesDate = joinedNormalized >= startOfWeek;
                } else if (dateFilter === 'This Month') {
                    matchesDate = joined.getMonth() === todayNorm.getMonth() && joined.getFullYear() === todayNorm.getFullYear();
                }
            }
        }
        
        // 4. Summary Card Filter Logic
        let matchesCardFilter = true;
        if (activeCardFilter === 'new') {
            matchesCardFilter = statusStr.includes('New Lead');
        } else if (activeCardFilter === 'customer') {
            // Filter by ACTUAL order count >= 2, not by stage tag
            const cOrders = getTrueOrdersForContact(contact);
            matchesCardFilter = cOrders.length >= 2;
        }
        
        return matchesSearch && matchesStatus && matchesDate && matchesCardFilter;
    }).sort((a, b) => {
        const dateA = a.joinedDate ? new Date(a.joinedDate).getTime() : 0;
        const dateB = b.joinedDate ? new Date(b.joinedDate).getTime() : 0;
        return dateB - dateA;
    });

    // Calculate repeat customers based on ACTUAL order history using helper function
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let totalTrueBuyers = 0;
    let repeatBuyersTotal = 0;
    let repeatBuyersToday = 0;
    let repeatBuyersThisMonth = 0;

    // Iterate over ALL contacts to get accurate global metrics
    allContacts.forEach((contact: any) => {
        const cOrders = getTrueOrdersForContact(contact);

        if (cOrders.length > 0) {
            totalTrueBuyers++; 

            if (cOrders.length >= 2) repeatBuyersTotal++;

            const ordersToday = cOrders.filter((o: any) => new Date(o.createdAt || o.date).getTime() >= startOfToday);
            if (ordersToday.length >= 2) repeatBuyersToday++;

            const ordersThisMonth = cOrders.filter((o: any) => new Date(o.createdAt || o.date).getTime() >= startOfMonth);
            if (ordersThisMonth.length >= 2) repeatBuyersThisMonth++;
        }
    });

    const repeatPercentTotal = totalTrueBuyers > 0 ? ((repeatBuyersTotal / totalTrueBuyers) * 100).toFixed(1) : '0.0';
    const repeatPercentToday = totalTrueBuyers > 0 ? ((repeatBuyersToday / totalTrueBuyers) * 100).toFixed(1) : '0.0';
    const repeatPercentThisMonth = totalTrueBuyers > 0 ? ((repeatBuyersThisMonth / totalTrueBuyers) * 100).toFixed(1) : '0.0';

    const handleRowClick = (contact: Contact) => {
        setSelectedContact(contact);
    };

    const getSocialLink = (contact: Contact) => {
        const rawLink = contact.customData?.socialLink || '';
        if (!rawLink) return null;
        
        if (contact.source === 'Telegram' && !rawLink.startsWith('http')) {
            return `https://t.me/${rawLink.replace('@', '')}`;
        }
        return rawLink;
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative font-display">
            {/* Header */}
            <header className="flex-shrink-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between gap-2 z-10">
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-khmer mb-1">
                        <span className="hover:text-primary cursor-pointer" onClick={() => setCurrentView('dashboard')}>ទំព័រដើម</span>
                        <ChevronRight size={10} />
                        <span className="text-slate-800 dark:text-white font-medium">បញ្ជីទំនាក់ទំនង</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white font-khmer md:text-2xl truncate">បញ្ជីទំនាក់ទំនង (Contacts Directory)</h2>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Bell size={20} />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <HelpCircle size={20} />
                    </button>
                    <button 
                        onClick={() => setIsAddLeadModalOpen(true)}
                        className="w-10 h-10 rounded-full flex items-center justify-center p-0 bg-primary hover:bg-primary-hover text-white shadow-sm shadow-blue-500/20 transition-all md:w-auto md:rounded-md md:px-4 md:py-2 md:gap-2"
                    >
                        <Plus size={18} />
                        <span className="hidden md:inline text-sm font-medium font-khmer">បង្កើតថ្មី (Add New)</span>
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="flex-shrink-0 p-6 pb-2 flex flex-nowrap overflow-x-auto gap-4 snap-x scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible md:scroll-smooth">
                {/* Total Customers */}
                <div 
                    onClick={() => setActiveCardFilter('all')}
                    className={`shrink-0 w-[85vw] max-w-[320px] snap-center md:w-auto bg-white dark:bg-slate-800 rounded-xl border-2 p-4 flex flex-col gap-1 shadow-sm cursor-pointer transition-all duration-200 ${activeCardFilter === 'all' ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 font-khmer font-medium">ទំនាក់ទំនងសរុប (Total)</span>
                        <span className="p-1.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <Users size={18} />
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{allContacts.length}</span>
                        <div className="flex items-center gap-1.5 ml-1">
                            {/* MoM Pill */}
                            <span className={`text-[10px] font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
                                growthPct > 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                                growthPct < 0 ? 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400' : 
                                'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400'
                            }`} title="ធៀបនឹងខែមុន (vs Last Month)">
                                {growthPct > 0 ? <TrendingUp size={10} /> : growthPct < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                                {growthPct > 0 ? '+' : growthPct < 0 ? '-' : ''}{formattedGrowth}% ខែនេះ
                            </span>
                            
                            {/* DoD Pill */}
                            <span className={`text-[10px] font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
                                dailyGrowthPct > 0 ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' : 
                                dailyGrowthPct < 0 ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400' : 
                                'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400'
                            }`} title="ធៀបនឹងម្សិលមិញ (vs Yesterday)">
                                {dailyGrowthPct > 0 ? <TrendingUp size={10} /> : dailyGrowthPct < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                                {dailyGrowthPct > 0 ? '+' : dailyGrowthPct < 0 ? '-' : ''}{formattedDailyGrowth}% ថ្ងៃនេះ
                            </span>
                        </div>
                    </div>
                </div>

                {/* New Leads */}
                <div 
                    onClick={() => setActiveCardFilter('new')}
                    className={`shrink-0 w-[85vw] max-w-[320px] snap-center md:w-auto bg-white dark:bg-slate-800 rounded-xl border-2 p-4 flex flex-col gap-1 shadow-sm cursor-pointer transition-all duration-200 ${activeCardFilter === 'new' ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 font-khmer font-medium">អតិថិជនថ្មីថ្ងៃនេះ (New Leads)</span>
                        <span className="p-1.5 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                            <UserPlus size={18} />
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">+{newLeadsToday}</span>
                        <div className="flex items-center gap-1.5 ml-1">
                            <span className={`text-[10px] font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
                                leadsGrowthPct > 0 ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' : 
                                leadsGrowthPct < 0 ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400' : 
                                'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400'
                            }`} title="ធៀបនឹងម្សិលមិញ (vs Yesterday)">
                                {leadsGrowthPct > 0 ? <TrendingUp size={10} /> : leadsGrowthPct < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                                {leadsGrowthPct > 0 ? '+' : leadsGrowthPct < 0 ? '-' : ''}{formattedLeadsGrowth}% ថ្ងៃនេះ
                            </span>
                            <span className="text-[10px] font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400" title="ភានមិញមិងស្ថានភាព᝷ៃពំរ (Total Pending Leads)">
                                <UserPlus size={10} /> {totalPendingLeads} កំពុងមានឱកាស
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Active Customers */}
                <div 
                    onClick={() => setActiveCardFilter('customer')}
                    className={`shrink-0 w-[85vw] max-w-[320px] snap-center md:w-auto bg-white dark:bg-slate-800 rounded-xl border-2 p-4 flex flex-col gap-1 shadow-sm cursor-pointer transition-all duration-200 ${activeCardFilter === 'customer' ? 'border-green-500 ring-2 ring-green-500/20 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 font-khmer font-medium">អតិថិជនប្រចាំ (Repeat Customers)</span>
                        <span className="p-1.5 rounded-md bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                            <LayoutGrid size={18} />
                        </span>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                        {/* Big Number: Total Repeat Customers */}
                        <div className="text-2xl font-black text-slate-800 dark:text-white">
                            {repeatBuyersTotal}
                        </div>

                        {/* Dynamic Percentage Pills */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 font-bold flex items-center gap-0.5">
                                <span className="material-icons-round text-[10px]">trending_up</span> {repeatPercentToday}% ថ្ងៃនេះ
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-bold flex items-center gap-0.5">
                                <span className="material-icons-round text-[10px]">trending_up</span> {repeatPercentThisMonth}% ខែនេះ
                            </span>
                        </div>

                        {/* Bottom Label */}
                        <p className="text-[10px] text-orange-600 dark:text-orange-400 font-khmer mt-1 flex items-center gap-1 font-bold">
                            <span className="material-icons-round text-[12px]">repeat</span>
                            {repeatPercentTotal}% ជាភ្ញៀវទិញ២ដងឡើងទៅ
                        </p>
                    </div>
                </div>
            </div>

            {/* Toolbar & Filter */}
            <div className="px-6 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full sm:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                        <Search size={18} />
                    </div>
                    <input 
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm font-khmer shadow-sm" 
                        placeholder="ស្វែងរកឈ្មោះ ឬលេខទូរស័ព្ទ..." 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {/* Filters */}
                <div className="flex gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                    <div className="relative min-w-[160px]">
                        <select 
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg font-khmer bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm appearance-none cursor-pointer"
                        >
                            <option value="All Time">គ្រប់ពេលវេលា (All Time)</option>
                            <option value="Today">ថ្ងៃនេះ (Today)</option>
                            <option value="Yesterday">ម្សិលមិញ (Yesterday)</option>
                            <option value="This Week">សប្តាហ៍នេះ (This Week)</option>
                            <option value="This Month">ខែនេះ (This Month)</option>
                            <option value="Custom">កំណត់ថ្ងៃ... (Custom)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            <ChevronDown size={16} />
                        </div>
                    </div>

                    <div className="relative min-w-[160px]">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg font-khmer bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm appearance-none cursor-pointer"
                        >
                            <option value="All Status">ស្ថានភាពទាំងអស់</option>
                            <option value="New Lead">New Lead</option>
                            <option value="Follow-up">Follow-up</option>
                            <option value="Reserved">Reserved</option>
                            <option value="Customer">Customer</option>
                            <option value="VIP">VIP</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                    
                    {/* Manage Stages Button */}
                    <button 
                        onClick={() => setIsManageStagesOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                        title="គ្រប់គ្រងស្ថានភាព (Manage Stages)"
                    >
                        <Settings2 size={16} className="text-slate-400" />
                        <span className="hidden sm:inline font-khmer">គ្រប់គ្រង</span>
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-auto px-6 pb-6">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                    <div className="w-full overflow-x-auto scrollbar-hide">
                        <table className="min-w-[1000px] w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-khmer w-16">ល.រ (No.)</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-khmer">ឈ្មោះ (Name)</th>
                                {columns.map((col) => (
                                    <th
                                        key={col.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, col.id)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, col.id)}
                                        className={`px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-khmer cursor-move hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors ${
                                            draggedColId === col.id ? 'bg-primary/10 opacity-50' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-icons-round text-xs opacity-50">drag_indicator</span>
                                            {col.label}
                                        </div>
                                    </th>
                                ))}
                                
                                {/* Add Column Button */}
                                <th className="px-4 py-4 text-center bg-slate-50 dark:bg-slate-800/50 sticky right-0 w-12 border-l border-slate-200 dark:border-slate-700">
                                    <button 
                                        onClick={() => setShowAddColModal(true)}
                                        className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors flex items-center justify-center w-full"
                                        title="បន្ថែម Column ថ្មី (Add New Column)"
                                    >
                                        <span className="material-icons-round text-[18px]">add</span>
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredContacts.length > 0 ? (
                                filteredContacts.map((contact, index) => (
                                    <tr key={contact.id} onClick={() => handleRowClick(contact)} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-medium">
                                            {(index + 1).toString().padStart(2, '0')}
                                        </td>
                                        
                                        {/* Name & Social Links (Static) */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {contact.avatar && contact.avatar.length > 2 ? (
                                                        <img className="h-10 w-10 rounded-full border border-slate-200 object-cover" src={contact.avatar} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-sm border border-indigo-200 dark:border-indigo-800">
                                                            {contact.avatar || contact.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900 dark:text-white font-khmer">{contact.name}</div>
                                                    
                                                    {/* Social Bar: Render icon based on Source */}
                                                    <div className="flex items-center gap-2 mt-1 h-4">
                                                        {contact.email && <span className="text-xs text-slate-500">{contact.email}</span>}
                                                        
                                                        {/* Dynamic Social Icon */}
                                                        {contact.customData?.socialLink && (
                                                            <>
                                                                {contact.email && <span className="text-slate-300">|</span>}
                                                                {contact.source?.toLowerCase().includes('facebook') && (
                                                                    <a 
                                                                        href={contact.customData.socialLink} 
                                                                        target="_blank" 
                                                                        rel="noreferrer" 
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 p-0.5 rounded-full transition-colors flex items-center justify-center" 
                                                                        title="Facebook Profile"
                                                                    >
                                                                        <Facebook size={12} />
                                                                    </a>
                                                                )}
                                                                {contact.source?.toLowerCase().includes('tiktok') && (
                                                                    <a 
                                                                        href={contact.customData.socialLink} 
                                                                        target="_blank" 
                                                                        rel="noreferrer" 
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="text-black dark:text-white hover:text-slate-700 bg-slate-100 dark:bg-slate-700 p-0.5 rounded-full transition-colors flex items-center justify-center" 
                                                                        title="TikTok Profile"
                                                                    >
                                                                        <Video size={12} />
                                                                    </a>
                                                                )}
                                                                {contact.source?.toLowerCase().includes('telegram') && (
                                                                    <a 
                                                                        href={getSocialLink(contact) || '#'} 
                                                                        target="_blank" 
                                                                        rel="noreferrer" 
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="text-sky-500 hover:text-sky-600 bg-sky-50 dark:bg-sky-900/20 p-0.5 rounded-full transition-colors flex items-center justify-center" 
                                                                        title="Telegram"
                                                                    >
                                                                        <MessageCircle size={12} />
                                                                    </a>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Dynamic Columns */}
                                        {columns.map((col) => {
                                            // Handle newly added custom columns
                                            if (col.id.startsWith('custom_')) {
                                                return (
                                                    <td key={col.id} className="px-6 py-4 whitespace-nowrap">
                                                        {col.type === 'checkbox' && (
                                                            <input 
                                                                type="checkbox" 
                                                                checked={customFieldValues[contact.id]?.[col.id] || false}
                                                                onChange={(e) => handleCustomFieldChange(contact.id, col.id, e.target.checked)} 
                                                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer" 
                                                            />
                                                        )}
                                                        {col.type === 'priority' && (
                                                            <select 
                                                                value={customFieldValues[contact.id]?.[col.id] || ''}
                                                                onChange={(e) => handleCustomFieldChange(contact.id, col.id, e.target.value)} 
                                                                className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded py-1 px-2 cursor-pointer outline-none focus:ring-1 focus:ring-primary"
                                                            >
                                                                <option value="">- រើស -</option>
                                                                <option value="hot">🔴 ក្តៅ (Hot)</option>
                                                                <option value="warm">🟡 ធម្មតា (Warm)</option>
                                                                <option value="cold">🔵 ត្រជាក់ (Cold)</option>
                                                            </select>
                                                        )}
                                                        {col.type === 'date' && (
                                                            <input 
                                                                type="date" 
                                                                value={customFieldValues[contact.id]?.[col.id] || ''}
                                                                onChange={(e) => handleCustomFieldChange(contact.id, col.id, e.target.value)} 
                                                                className="text-xs bg-transparent outline-none border-b border-dashed border-slate-300 dark:border-slate-600 focus:border-primary text-slate-600 dark:text-slate-300 pb-0.5 cursor-pointer" 
                                                            />
                                                        )}
                                                        {(!col.type || col.type === 'text') && (
                                                            <input 
                                                                type="text" 
                                                                placeholder="វាយបញ្ចូល..." 
                                                                value={customFieldValues[contact.id]?.[col.id] || ''}
                                                                onChange={(e) => handleCustomFieldChange(contact.id, col.id, e.target.value)} 
                                                                className="text-xs bg-transparent outline-none w-full border-b border-transparent focus:border-primary placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-700 dark:text-slate-300" 
                                                            />
                                                        )}
                                                    </td>
                                                );
                                            }

                                            // ORIGINAL HARDCODED COLUMNS LOGIC
                                            return (
                                                <td key={col.id} className={`px-6 py-4 whitespace-nowrap ${col.id === 'map' ? 'text-center' : ''} ${col.id === 'custom_fields' ? 'max-w-[220px]' : ''}`}>
                                                    {col.id === 'phone' && (
                                                        <div className="text-sm text-slate-900 dark:text-slate-200 font-medium font-mono">{contact.phone}</div>
                                                    )}
                                                    
                                                    {col.id === 'source' && (
                                                        <div className="flex flex-col items-start gap-1">
                                                            <div className="flex items-center gap-1.5">
                                                                {contact.source === 'Telegram' && <div className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-500"><Send size={10} /></div>}
                                                                {contact.source === 'Facebook' && <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600"><Globe size={10} /></div>}
                                                                {contact.source === 'Referral' && <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600"><User size={10} /></div>}
                                                                {(!contact.source || contact.source === 'Walk-in') && <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600"><Store size={10} /></div>}
                                                                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{contact.source || 'Walk-in'}</span>
                                                            </div>
                                                            
                                                            {contact.source === 'Referral' && contact.customData?.referredBy && (
                                                                <span className="text-[10px] text-slate-500 flex items-center gap-1 ml-1 pl-1 border-l-2 border-slate-200 dark:border-slate-700">
                                                                    via: <span className="font-medium text-slate-700 dark:text-slate-300">{contact.customData.referredBy}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    {col.id === 'interested_in' && (
                                                        <div className="flex flex-wrap gap-2 max-w-[200px]">
                                                            {contact.interestedProducts && contact.interestedProducts.length > 0 ? (
                                                                <>
                                                                    {contact.interestedProducts.slice(0, 2).map((prod, idx) => (
                                                                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                                                                            <Package size={10} className="opacity-70" />
                                                                            <span className="truncate max-w-[100px]">{prod.name} ({prod.qty})</span>
                                                                        </span>
                                                                    ))}
                                                                    {contact.interestedProducts.length > 2 && (
                                                                        <span 
                                                                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-help"
                                                                            title={contact.interestedProducts.slice(2).map(p => `${p.name} (${p.qty})`).join(', ')}
                                                                        >
                                                                            +{contact.interestedProducts.length - 2} more
                                                                        </span>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <span className="text-slate-400 text-xs italic">-</span>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    {col.id === 'custom_fields' && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {customFieldsSchema.length > 0 ? (
                                                                customFieldsSchema.map(field => {
                                                                    const value = contact.customData?.[field.id];
                                                                    if (!value) return null;
                                                                    return (
                                                                        <span 
                                                                            key={field.id} 
                                                                            className="inline-flex items-center text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800 mr-1.5 mb-1.5"
                                                                        >
                                                                            {value}
                                                                        </span>
                                                                    );
                                                                })
                                                            ) : (
                                                                <span className="text-slate-400 text-[10px] italic">-</span>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    {col.id === 'map' && (
                                                        <>
                                                            {contact.mapLink ? (
                                                                <a 
                                                                    href={contact.mapLink} 
                                                                    target="_blank" 
                                                                    rel="noreferrer" 
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="inline-flex p-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition-all hover:scale-110 shadow-sm border border-red-100 dark:border-red-900/30" 
                                                                    title="Open Map Location"
                                                                >
                                                                    <MapPin size={16} />
                                                                </a>
                                                            ) : (
                                                                <span className="inline-flex p-2 text-slate-300 dark:text-slate-700 rounded-full cursor-not-allowed">
                                                                    <MapPin size={16} />
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                    
                                                    {col.id === 'handler' && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                                                                {(contact.staffName || 'A').substring(0, 1).toUpperCase()}
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                                                {contact.staffName || 'Admin'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {col.id === 'joined' && (
                                                        <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                                            {contact.joinedDate ? contact.joinedDate : '-'}
                                                        </div>
                                                    )}
                                                    
                                                    {col.id === 'stage' && (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {(() => {
                                                                const statusArray = Array.isArray(contact.status) ? contact.status : [contact.status].filter(Boolean);
                                                                if (statusArray.length === 0) return <span className="text-xs text-slate-500">-</span>;

                                                                return statusArray.map((statusStr, idx) => {
                                                                    const stage = contactStages?.find(s => s.name === statusStr);
                                                                    
                                                                    let bgColor = 'bg-slate-100 dark:bg-slate-800';
                                                                    let textColor = 'text-slate-700 dark:text-slate-300';
                                                                    let borderColor = 'border-black/5 dark:border-white/5';
                                                                    let IconComponent = Target;

                                                                    if (stage) {
                                                                        const classes = stage.colorClass.split(' ');
                                                                        bgColor = classes.filter(c => c.startsWith('bg-')).join(' ') || bgColor;
                                                                        textColor = classes.filter(c => c.startsWith('text-')).join(' ') || textColor;
                                                                        const foundBorder = classes.filter(c => c.startsWith('border-')).join(' ');
                                                                        if (foundBorder) borderColor = foundBorder;
                                                                        
                                                                        if (stage.iconName && (LucideIcons as any)[stage.iconName]) {
                                                                            IconComponent = (LucideIcons as any)[stage.iconName];
                                                                        }
                                                                    }

                                                                    return (
                                                                        <span key={idx} className={`px-2.5 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-md font-khmer border ${bgColor} ${textColor} ${borderColor}`}>
                                                                            <IconComponent size={12} strokeWidth={2.5} />
                                                                            {statusStr}
                                                                        </span>
                                                                    );
                                                                });
                                                            })()}
                                                        </div>
                                                    )}
                                                    
                                                    {col.id === 'actions' && (
                                                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button className="text-slate-400 hover:text-primary p-1.5 rounded-full hover:bg-primary/10 transition-colors" title="Call">
                                                                <Phone size={16} />
                                                            </button>
                                                            <button className="text-slate-400 hover:text-primary p-1.5 rounded-full hover:bg-primary/10 transition-colors" title="Chat">
                                                                <MessageSquare size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingContact(contact);
                                                                    setIsAddLeadModalOpen(true);
                                                                }}
                                                                className="text-slate-400 hover:text-primary p-1.5 rounded-full hover:bg-primary/10 transition-colors" 
                                                                title="Edit"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        
                                        {/* Empty TD to match Add Column TH */}
                                        <td className="px-4 py-4 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800"></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + 2} className="px-6 py-12 text-center text-slate-500 font-khmer">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Search size={32} className="opacity-20" />
                                            <p>រកមិនឃើញទិន្នន័យសម្រាប់ "{searchTerm}"</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>

            {/* Render the Customer Drawer - Overlays the list */}
            {selectedContact && <CustomerProfile />}
            
            {/* Manage Stages Modal */}
            <ManageStagesModal isOpen={isManageStagesOpen} onClose={() => setIsManageStagesOpen(false)} />
            
            {/* ADD CUSTOM COLUMN MODAL */}
            {showAddColModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddColModal(false)}></div>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700 p-5">
                        <h2 className="text-lg font-bold font-khmer mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="material-icons-round text-primary">view_column</span> បង្កើត Column ថ្មី
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 font-khmer">ឈ្មោះ Column (Name)</label>
                                <input 
                                    type="text" 
                                    value={newColName} 
                                    onChange={e => setNewColName(e.target.value)} 
                                    placeholder="ឧទាហរណ៍៖ ថ្ងៃត្រូវតាមដាន..." 
                                    className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                                    autoFocus 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 font-khmer">ប្រភេទ (Type)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'text', label: 'អក្សរ (Text)', icon: 'short_text' },
                                        { id: 'priority', label: 'អាទិភាព (Status)', icon: 'label' },
                                        { id: 'date', label: 'ថ្ងៃខែ (Date)', icon: 'calendar_today' },
                                        { id: 'checkbox', label: 'ធីក (Checkbox)', icon: 'check_box' }
                                    ].map(type => (
                                        <button 
                                            key={type.id}
                                            onClick={() => setNewColType(type.id)}
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${newColType === type.id ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:border-slate-300'}`}
                                        >
                                            <span className="material-icons-round text-[20px] mb-1">{type.icon}</span>
                                            <span className="text-[10px] font-bold font-khmer">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button 
                                onClick={() => setShowAddColModal(false)} 
                                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold font-khmer transition-colors"
                            >
                                បោះបង់
                            </button>
                            <button 
                                onClick={handleAddCustomColumn} 
                                disabled={!newColName.trim()} 
                                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold font-khmer transition-colors shadow-sm"
                            >
                                បង្កើត (Create)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrmDirectory;