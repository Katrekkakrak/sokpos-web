import React, { useState, useRef, useEffect } from 'react';
import { useData, Contact, InterestedProduct } from '../context/DataContext';
import * as LucideIcons from 'lucide-react'; // Import all icons for dynamic rendering
import { 
    UserPlus, X, User, Phone, Globe, ChevronDown, Tag, Ban, Truck, Save, Camera, MapPin, 
    ImagePlus, LayoutList, PlusCircle, Trash2, AlertCircle, Plus, Target, Check, Video, 
    MessageCircle, Users, Facebook, Store, Link as LinkIcon, Crosshair, Map as MapIcon, 
    Search, Package, CheckCircle, Crown, Clock, Bookmark, Settings2, Palette, Smile
} from 'lucide-react';

type CustomFieldType = 'text' | 'number' | 'date' | 'select';

interface AddLeadModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    onSuccess?: (contact: Contact) => void;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { 
        isAddLeadModalOpen, 
        setIsAddLeadModalOpen, 
        addCustomer, 
        updateLead, 
        editingContact, 
        setEditingContact,
        customFieldsSchema, 
        addCustomFieldDef, 
        removeCustomFieldDef,
        products,
        contactStages,
        setContactStages
    } = useData();

    const isVisible = isOpen !== undefined ? isOpen : isAddLeadModalOpen;

    // --- Dynamic Stage Configuration Helper ---
    const getStageConfig = (stageName: string) => {
        // Find the stage config from global context
        const stage = contactStages?.find(s => s.name === stageName);
        
        if (!stage) {
            // Fallback styling if stage is not found
            return {
                icon: <Target size={12} strokeWidth={2.5} />,
                bgColor: 'bg-slate-50 dark:bg-slate-900/30',
                textColor: 'text-slate-800 dark:text-slate-300',
                borderColor: 'border-slate-200 dark:border-slate-800'
            };
        }
        
        // Dynamically grab the Lucide icon component
        const IconComponent = (LucideIcons as any)[stage.iconName] || Target;
        
        // Parse Tailwind classes from the colorClass string
        const classes = stage.colorClass.split(' ');
        const bgColor = classes.filter(c => c.startsWith('bg-')).join(' ');
        const textColor = classes.filter(c => c.startsWith('text-')).join(' ');
        const borderColor = classes.filter(c => c.startsWith('border-')).join(' ');
        
        return {
            icon: <IconComponent size={12} strokeWidth={2.5} />,
            bgColor: bgColor || 'bg-slate-50 dark:bg-slate-900/30',
            textColor: textColor || 'text-slate-800 dark:text-slate-300',
            borderColor: borderColor || 'border-slate-200 dark:border-slate-800'
        };
    };

    // --- Core Fields ---
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    
    // --- Source State ---
    const [source, setSource] = useState('');
    const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
    const [sourceDetail, setSourceDetail] = useState(''); 

    // --- Map & Address State ---
    const [address, setAddress] = useState('');
    const [mapLink, setMapLink] = useState('');
    const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
    
    // Map Picker Internal State
    const [mapSearch, setMapSearch] = useState('');
    const [pinnedLocation, setPinnedLocation] = useState<{x: number, y: number} | null>(null);

    // --- Stage State ---
    const [selectedStages, setSelectedStages] = useState<string[]>(['New Lead']);
    const [stageInput, setStageInput] = useState('');
    const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false);
    
    const [tags, setTags] = useState<string[]>(['New Customer']);
    const [tagInput, setTagInput] = useState('');
    const [profilePic, setProfilePic] = useState<string | null>(null);
    
    // --- Dynamic Data ---
    const [customValues, setCustomValues] = useState<Record<string, any>>({});

    // --- Product Interest State ---
    const [interestedProducts, setInterestedProducts] = useState<InterestedProduct[]>([]);
    const [interestProdId, setInterestProdId] = useState('');
    const [interestQty, setInterestQty] = useState(1);

    // --- Form Builder State ---
    const [isCreatingField, setIsCreatingField] = useState(false);
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [newFieldType, setNewFieldType] = useState<CustomFieldType>('text');
    const [newFieldOptionsList, setNewFieldOptionsList] = useState<string[]>([]);
    const [currentOptionInput, setCurrentOptionInput] = useState('');
    const [fieldToDelete, setFieldToDelete] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const stageDropdownRef = useRef<HTMLDivElement>(null);
    const sourceDropdownRef = useRef<HTMLDivElement>(null);

    // --- Stage Manager State ---
    const [isStageManagerOpen, setIsStageManagerOpen] = useState(false);
    const [newStageName, setNewStageName] = useState('');
    const [newStageColor, setNewStageColor] = useState('bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300');
    const [newStageIcon, setNewStageIcon] = useState('Target');

    // Predefined color options
    const colorOptions = [
        { label: 'Blue', value: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', hex: 'bg-blue-500' },
        { label: 'Green', value: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', hex: 'bg-emerald-500' },
        { label: 'Yellow', value: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300', hex: 'bg-yellow-400' },
        { label: 'Orange', value: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300', hex: 'bg-orange-500' },
        { label: 'Red', value: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300', hex: 'bg-red-500' },
        { label: 'Pink', value: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300', hex: 'bg-pink-500' },
        { label: 'Purple', value: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300', hex: 'bg-purple-500' },
        { label: 'Gray', value: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300', hex: 'bg-slate-500' }
    ];

    const iconOptions = ['Target', 'UserPlus', 'CheckCircle', 'Crown', 'Clock', 'Bookmark', 'Heart', 'Star', 'Flag', 'Zap', 'ThumbsUp', 'Flame'];

    // --- Edit Mode State ---
    const [editingStageId, setEditingStageId] = useState<string | null>(null);

    const handleEditStageClick = (stage: any) => {
        setEditingStageId(stage.id);
        setNewStageName(stage.name);
        setNewStageColor(stage.colorClass);
        setNewStageIcon(stage.iconName);
    };

    const resetStageForm = () => {
        setEditingStageId(null);
        setNewStageName('');
        setNewStageColor('bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300');
        setNewStageIcon('Target');
    };

    // Dynamic list of stage names
    const defaultStages = contactStages?.map(s => s.name) || [];
    
    const defaultSources = [
        { label: 'Facebook', icon: <Facebook className="w-4 h-4 text-blue-600" /> },
        { label: 'Telegram', icon: <MessageCircle className="w-4 h-4 text-sky-500" /> },
        { label: 'TikTok', icon: <Video className="w-4 h-4 text-black dark:text-white" /> },
        { label: 'Walk-in', icon: <Store className="w-4 h-4 text-purple-500" /> },
        { label: 'Referral', icon: <Users className="w-4 h-4 text-green-600" /> }
    ];

    // --- Initialization ---
    useEffect(() => {
        if (editingContact && isVisible) {
            setName(editingContact.name || '');
            setPhone(editingContact.phone || '');
            setSource(editingContact.source || '');
            setAddress(editingContact.address || '');
            setMapLink(editingContact.mapLink || '');
            setInterestedProducts(editingContact.interestedProducts || []);
            
            // Smart Source Logic
            if (editingContact.customData?.referredBy) {
                setSourceDetail(editingContact.customData.referredBy);
            } else if (editingContact.customData?.socialLink) {
                setSourceDetail(editingContact.customData.socialLink);
            } else {
                setSourceDetail('');
            }

            if (Array.isArray(editingContact.status)) {
                setSelectedStages(editingContact.status);
            } else if (typeof editingContact.status === 'string') {
                setSelectedStages([editingContact.status]);
            } else {
                setSelectedStages(['New Lead']);
            }

            setTags(editingContact.tags || ['New Customer']);
            
            const hasAvatar = editingContact.avatar && typeof editingContact.avatar === 'string' && editingContact.avatar.length > 2;
            setProfilePic(hasAvatar ? editingContact.avatar : null);
            
            setCustomValues(editingContact.customData || {});
        } else if (isVisible && !editingContact) {
            setName('');
            setPhone('');
            setSource('');
            setSourceDetail('');
            setSelectedStages(['New Lead']);
            setAddress('');
            setMapLink('');
            setInterestedProducts([]);
            setTags(['New Customer']);
            setProfilePic(null);
            setCustomValues({});
        }
    }, [editingContact, isVisible]);

    // Close dropdowns on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (stageDropdownRef.current && !stageDropdownRef.current.contains(event.target as Node)) {
                setIsStageDropdownOpen(false);
            }
            if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(event.target as Node)) {
                setIsSourceDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // --- Tag Handlers ---
    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput) {
            e.preventDefault();
            if (!tags.includes(tagInput)) {
                setTags([...tags, tagInput]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    // --- Stage Handlers ---
    const toggleStage = (stage: string) => {
        if (selectedStages.includes(stage)) {
            setSelectedStages(selectedStages.filter(s => s !== stage));
        } else {
            setSelectedStages([...selectedStages, stage]);
        }
        setStageInput('');
    };

    const removeStage = (stageToRemove: string) => {
        setSelectedStages(selectedStages.filter(s => s !== stageToRemove));
    };

    const handleStageInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && stageInput.trim()) {
            e.preventDefault();
            if (!selectedStages.includes(stageInput.trim())) {
                setSelectedStages([...selectedStages, stageInput.trim()]);
            }
            setStageInput('');
        } else if (e.key === 'Backspace' && !stageInput && selectedStages.length > 0) {
            const newStages = [...selectedStages];
            newStages.pop();
            setSelectedStages(newStages);
        }
    };

    // --- Source Handlers ---
    const selectSource = (value: string) => {
        setSource(value);
        setIsSourceDropdownOpen(false);
    };

    const filteredSources = defaultSources.filter(s => 
        s.label.toLowerCase().includes(source.toLowerCase())
    );

    const getSourceFieldConfig = (sourceName: string) => {
        const s = sourceName.toLowerCase();
        if (s.includes('facebook')) return { label: 'Facebook Profile Link', placeholder: 'Paste profile URL here...', icon: <Facebook className="w-4 h-4 text-blue-600" />, key: 'socialLink' };
        if (s.includes('tiktok')) return { label: 'TikTok ID / Link', placeholder: '@username or link...', icon: <Video className="w-4 h-4 text-black dark:text-white" />, key: 'socialLink' };
        if (s.includes('telegram')) return { label: 'Telegram Username', placeholder: '@username', icon: <MessageCircle className="w-4 h-4 text-sky-500" />, key: 'socialLink' };
        if (s.includes('referral') || s.includes('អ្នកណែនាំ')) return { label: 'Referred By (ឈ្មោះអ្នកណែនាំ)', placeholder: 'Enter referrer name...', icon: <Users className="w-4 h-4 text-green-600" />, key: 'referredBy' };
        if (['instagram', 'ig', 'twitter', 'x', 'linkedin', 'youtube'].some(k => s.includes(k))) return { label: 'Social Profile Link', placeholder: 'Paste link here...', icon: <LinkIcon className="w-4 h-4 text-slate-500" />, key: 'socialLink' };
        return null;
    };

    const activeSourceConfig = getSourceFieldConfig(source);

    // --- Product Interest Handlers ---
    const handleAddInterest = () => {
        if (!interestProdId) return;
        const prod = products.find(p => p.id.toString() === interestProdId);
        if (prod) {
            const existingIdx = interestedProducts.findIndex(p => p.id === prod.id);
            if (existingIdx >= 0) {
                const updated = [...interestedProducts];
                updated[existingIdx].qty += interestQty;
                setInterestedProducts(updated);
            } else {
                setInterestedProducts([...interestedProducts, {
                    id: prod.id,
                    name: prod.name,
                    qty: interestQty,
                    price: prod.price
                }]);
            }
            setInterestProdId('');
            setInterestQty(1);
        }
    };

    const handleRemoveInterest = (id: number) => {
        setInterestedProducts(interestedProducts.filter(p => p.id !== id));
    };

    // --- Map Logic ---
    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setMapLink(`https://maps.google.com/?q=${latitude},${longitude}`);
                },
                (error) => {
                    alert('Unable to retrieve your location. Please check browser permissions.');
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPinnedLocation({ x, y });
    };

    const confirmMapLocation = () => {
        if (pinnedLocation) {
            const lat = 11.5564 + (Math.random() - 0.5) * 0.1;
            const lng = 104.9282 + (Math.random() - 0.5) * 0.1;
            setMapLink(`https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`);
            setIsMapPickerOpen(false);
            setPinnedLocation(null);
        } else {
            alert("Please click on the map to place a pin.");
        }
    };

    // --- Image Upload ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Custom Fields Handlers ---
    const handleAddOption = () => {
        if (currentOptionInput.trim()) {
            if (!newFieldOptionsList.includes(currentOptionInput.trim())) {
                setNewFieldOptionsList([...newFieldOptionsList, currentOptionInput.trim()]);
            }
            setCurrentOptionInput('');
        }
    };

    const handleRemoveOption = (optToRemove: string) => {
        setNewFieldOptionsList(newFieldOptionsList.filter(o => o !== optToRemove));
    };

    const handleCreateCustomField = () => {
        if (newFieldLabel) {
            addCustomFieldDef({
                label: newFieldLabel,
                type: newFieldType,
                options: newFieldType === 'select' ? newFieldOptionsList : undefined
            });
            setIsCreatingField(false);
            setNewFieldLabel('');
            setNewFieldType('text');
            setNewFieldOptionsList([]);
            setCurrentOptionInput('');
        }
    };

    const confirmDeleteField = () => {
        if (fieldToDelete) {
            removeCustomFieldDef(fieldToDelete);
            const newValues = { ...customValues };
            delete newValues[fieldToDelete];
            setCustomValues(newValues);
            setFieldToDelete(null);
        }
    };

    const handleCustomValueChange = (fieldId: string, value: any) => {
        setCustomValues(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            setIsAddLeadModalOpen(false);
        }
        setEditingContact(null);
    };

    const handleSubmit = () => {
        if (!name.trim() || !phone.trim()) {
            alert('សូមបញ្ចូល ឈ្មោះ និង លេខទូរស័ព្ទ ជាមុនសិន! (Please enter Name and Phone)');
            return;
        }

        const finalCustomData = { ...customValues };
        delete finalCustomData.referredBy;
        delete finalCustomData.socialLink;

        if (activeSourceConfig && sourceDetail) {
            finalCustomData[activeSourceConfig.key] = sourceDetail;
        }

        const leadData = { 
            name, 
            phone, 
            source,
            status: selectedStages,
            tags,
            address,
            mapLink, 
            interestedProducts,
            avatar: profilePic || undefined,
            customData: finalCustomData
        };

        if (editingContact) {
            updateLead(editingContact.id, leadData);
            if (onSuccess) onSuccess({ ...editingContact, ...leadData } as Contact);
        } else {
            const newContact = addCustomer(leadData); 
            if (onSuccess) {
                onSuccess(newContact);
            }
        }
        
        handleClose();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity flex items-center justify-center p-4 font-display">
            <div className="relative z-50 w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-0 text-left shadow-2xl transition-all flex flex-col max-h-[90vh] animate-fade-in-up">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-6 py-5 bg-white dark:bg-slate-800 sticky top-0 z-10">
                    <div>
                        <h3 className="text-xl font-bold leading-6 text-slate-900 dark:text-white flex items-center gap-2 font-khmer">
                            <UserPlus className="text-primary w-6 h-6" />
                            {editingContact ? 'កែប្រែព័ត៌មាន (Edit Contact)' : 'បង្កើតអតិថិជនថ្មី (Add New Contact)'}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {editingContact ? 'កែប្រែព័ត៌មានខាងក្រោម' : 'បញ្ចូលព័ត៌មានខាងក្រោមដើម្បីតាមដានអតិថិជននេះ'} (Enter details below).
                        </p>
                    </div>
                    <button onClick={handleClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary transition-colors" type="button">
                        <span className="sr-only">Close</span>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="px-6 py-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                        {/* Profile Picture Upload */}
                        <div className="flex justify-center">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="relative w-28 h-28 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-all group overflow-hidden"
                            >
                                {profilePic ? (
                                    <img src={profilePic} alt="Profile Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center text-slate-400 group-hover:text-slate-500 dark:text-slate-400 dark:group-hover:text-slate-300">
                                        <Camera className="w-8 h-8 mb-1" />
                                        <span className="text-[10px] font-medium uppercase tracking-wide">Upload</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ImagePlus className="text-white w-8 h-8" />
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 font-khmer" htmlFor="name">
                                    ឈ្មោះ (Name) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <User className="text-slate-400 w-5 h-5" />
                                    </div>
                                    <input 
                                        value={name} onChange={e => setName(e.target.value)}
                                        className="block w-full rounded-xl border-0 py-3.5 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white dark:placeholder:text-slate-500 font-khmer" 
                                        id="name" placeholder="ឧ. សុខ សាន្ត" type="text"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 font-khmer" htmlFor="phone">
                                    លេខទូរស័ព្ទ (Phone) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Phone className="text-slate-400 w-5 h-5" />
                                    </div>
                                    <input 
                                        value={phone} onChange={e => setPhone(e.target.value)}
                                        className="block w-full rounded-xl border-0 py-3.5 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white dark:placeholder:text-slate-500 font-mono" 
                                        id="phone" placeholder="012 xxx xxx" type="tel"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Stage and Source Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {/* Dynamic Stage Selection */}
                            <div className="space-y-2 relative" ref={stageDropdownRef}>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 font-khmer" htmlFor="status">
                                        ស្ថានភាព (Stage)
                                    </label>
                                    <button 
                                        type="button" 
                                        onClick={() => { setIsStageManagerOpen(true); resetStageForm(); }}
                                        className="text-xs text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors flex items-center gap-1 font-medium font-khmer"
                                    >
                                        <Settings2 className="w-3.5 h-3.5" /> រៀបចំ
                                    </button>
                                </div>
                                <div 
                                    onClick={() => setIsStageDropdownOpen(true)}
                                    className={`w-full rounded-xl border-0 py-2.5 pl-3 pr-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white bg-white min-h-[48px] flex flex-wrap items-center gap-2 cursor-text ${isStageDropdownOpen ? 'ring-2 ring-primary' : ''}`}
                                >
                                    <div className="flex items-center pl-1 pointer-events-none">
                                        <Target className="text-slate-400 w-5 h-5 mr-1" />
                                    </div>
                                    {selectedStages.map(stage => {
                                        const config = getStageConfig(stage);
                                        return (
                                            <span key={stage} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${config.bgColor} ${config.textColor} text-xs font-medium border ${config.borderColor}`}>
                                                {config.icon}
                                                {stage}
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeStage(stage); }}
                                                    className="hover:opacity-75 focus:outline-none ml-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        );
                                    })}
                                    <input 
                                        type="text" 
                                        className="flex-1 bg-transparent border-none outline-none focus:ring-0 p-0 text-sm min-w-[80px] dark:text-white"
                                        placeholder={selectedStages.length === 0 ? "Select or type..." : ""}
                                        value={stageInput}
                                        onChange={(e) => setStageInput(e.target.value)}
                                        onKeyDown={handleStageInputKeyDown}
                                        onFocus={() => setIsStageDropdownOpen(true)}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <ChevronDown className="text-slate-400 w-5 h-5" />
                                    </div>
                                </div>
                                
                                {/* Dropdown Menu mapped directly from context */}
                                {isStageDropdownOpen && (
                                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                                        {defaultStages.map(stage => {
                                            const config = getStageConfig(stage);
                                            const isSelected = selectedStages.includes(stage);
                                            return (
                                                <div 
                                                    key={stage}
                                                    onClick={() => toggleStage(stage)}
                                                    className={`px-4 py-3 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between group transition-colors ${
                                                        isSelected ? `${config.bgColor} ${config.textColor}` : 'text-slate-700 dark:text-slate-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${config.bgColor} ${config.textColor} text-xs font-medium border ${config.borderColor}`}>
                                                            {config.icon}
                                                            {stage}
                                                        </span>
                                                    </div>
                                                    {isSelected && <Check className="w-4 h-4" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Source Selection */}
                            <div className="space-y-3">
                                <div className="space-y-2 relative" ref={sourceDropdownRef}>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 font-khmer" htmlFor="source">
                                        ប្រភពអតិថិជន (Source)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                            <Globe className="text-slate-400 w-5 h-5" />
                                        </div>
                                        <input 
                                            type="text"
                                            value={source}
                                            onChange={(e) => {
                                                setSource(e.target.value);
                                                setIsSourceDropdownOpen(true);
                                            }}
                                            onClick={() => setIsSourceDropdownOpen(true)}
                                            className="block w-full rounded-xl border-0 py-3.5 pl-10 pr-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white dark:placeholder:text-slate-500 font-khmer"
                                            placeholder="Select or type source..."
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <ChevronDown className="text-slate-400 w-5 h-5" />
                                        </div>
                                        
                                        {isSourceDropdownOpen && (
                                            <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                                                {filteredSources.map((opt, idx) => (
                                                    <div 
                                                        key={idx}
                                                        onClick={() => selectSource(opt.label)}
                                                        className="px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                                                    >
                                                        {opt.icon}
                                                        <span>{opt.label}</span>
                                                    </div>
                                                ))}
                                                {source && !filteredSources.find(s => s.label.toLowerCase() === source.toLowerCase()) && (
                                                    <div 
                                                        onClick={() => selectSource(source)}
                                                        className="px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-primary font-medium border-t border-slate-100 dark:border-slate-700"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Use "{source}"
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {activeSourceConfig && (
                                    <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 font-khmer uppercase tracking-wide flex items-center gap-1.5">
                                            {activeSourceConfig.icon}
                                            {activeSourceConfig.label}
                                        </label>
                                        <div className="relative">
                                            <input 
                                                value={sourceDetail} 
                                                onChange={e => setSourceDetail(e.target.value)}
                                                className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm bg-slate-50 dark:bg-slate-900 dark:ring-slate-700 dark:text-white dark:placeholder:text-slate-500 transition-all" 
                                                placeholder={activeSourceConfig.placeholder} 
                                                type="text"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Address & Map Link */}
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 font-khmer" htmlFor="address">
                                    អាសយដ្ឋាន (Address / Location)
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <MapPin className="text-slate-400 w-5 h-5" />
                                    </div>
                                    <input 
                                        value={address} onChange={e => setAddress(e.target.value)}
                                        className="block w-full rounded-xl border-0 py-3.5 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white dark:placeholder:text-slate-500 font-khmer" 
                                        id="address" placeholder="ផ្ទះលេខ, ផ្លូវ, សង្កាត់, ខណ្ឌ..." type="text"
                                    />
                                </div>
                            </div>

                            {/* Map Link / Picker Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 font-khmer">
                                    ទីតាំងលើផែនទី (Map Link)
                                </label>
                                <div className="relative flex gap-2">
                                    <div className="relative flex-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <Globe className="text-slate-400 w-5 h-5" />
                                        </div>
                                        <input 
                                            value={mapLink} 
                                            onChange={e => setMapLink(e.target.value)}
                                            className="block w-full rounded-xl border-0 py-3.5 pl-10 pr-24 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-slate-900 dark:ring-slate-700 dark:text-white dark:placeholder:text-slate-500" 
                                            placeholder="https://maps.google.com..." type="text"
                                        />
                                        <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
                                            <button 
                                                onClick={handleGetCurrentLocation}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                title="Get Current Location (GPS)"
                                                type="button"
                                            >
                                                <Crosshair className="w-5 h-5" />
                                            </button>
                                            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                                            <button 
                                                onClick={() => setIsMapPickerOpen(true)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                title="Pick on Map"
                                                type="button"
                                            >
                                                <MapIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- Product Interest Section --- */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 font-khmer flex items-center gap-2">
                                    <Package className="w-4 h-4 text-primary" />
                                    ទំនិញដែលចាប់អារម្មណ៍ (Products of Interest)
                                </label>
                            </div>
                            
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-200 dark:border-slate-600 space-y-3">
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-xs text-slate-500 dark:text-slate-400">ជ្រើសរើសទំនិញ (Select Product)</label>
                                        <select 
                                            value={interestProdId} 
                                            onChange={(e) => setInterestProdId(e.target.value)}
                                            className="block w-full rounded-lg border-slate-300 dark:border-slate-600 text-sm py-2 px-3 dark:bg-slate-800 dark:text-white focus:ring-primary focus:border-primary"
                                        >
                                            <option value="">-- Select Product --</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} - [Stock: {p.stock}]
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-20 space-y-1">
                                        <label className="text-xs text-slate-500 dark:text-slate-400">ចំនួន (Qty)</label>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            value={interestQty} 
                                            onChange={(e) => setInterestQty(parseInt(e.target.value) || 1)}
                                            className="block w-full rounded-lg border-slate-300 dark:border-slate-600 text-sm py-2 px-3 dark:bg-slate-800 dark:text-white focus:ring-primary focus:border-primary"
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={handleAddInterest}
                                        className="bg-primary hover:bg-primary-hover text-white p-2 rounded-lg transition-colors flex items-center justify-center h-[38px] w-[38px]"
                                        title="Add Product"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* List of Interested Products */}
                                {interestedProducts.length > 0 ? (
                                    <div className="space-y-2 mt-2">
                                        {interestedProducts.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 p-1 rounded-md">
                                                        <Package className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[180px]">{item.name}</span>
                                                    <span className="text-xs text-slate-400">x{item.qty}</span>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveInterest(item.id)}
                                                    className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 text-center py-2 italic">No products added yet.</p>
                                )}
                            </div>
                        </div>

                        {/* --- Dynamic Custom Fields Section --- */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 font-khmer flex items-center gap-2">
                                    <LayoutList className="w-4 h-4 text-primary" />
                                    ព័ត៌មានបន្ថែម (Custom Fields)
                                </label>
                                {!isCreatingField && (
                                    <button 
                                        type="button" 
                                        onClick={() => setIsCreatingField(true)}
                                        className="text-xs text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors flex items-center gap-1 font-medium"
                                    >
                                        <PlusCircle className="w-3.5 h-3.5" />
                                        បង្កើតប្រអប់ថ្មី
                                    </button>
                                )}
                            </div>

                            {/* Field Creator */}
                            {isCreatingField && (
                                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-200 dark:border-slate-600 space-y-3 animate-fade-in-up">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-500">ឈ្មោះប្រអប់ (Label)</label>
                                            <input 
                                                autoFocus
                                                type="text" 
                                                value={newFieldLabel} 
                                                onChange={(e) => setNewFieldLabel(e.target.value)}
                                                className="w-full text-sm rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white p-2"
                                                placeholder="e.g. Birthday" 
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-500">ប្រភេទ (Type)</label>
                                            <select 
                                                value={newFieldType}
                                                onChange={(e) => setNewFieldType(e.target.value as CustomFieldType)}
                                                className="w-full text-sm rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white p-2"
                                            >
                                                <option value="text">អក្សរ (Text)</option>
                                                <option value="number">លេខ (Number)</option>
                                                <option value="date">កាលបរិច្ឆេទ (Date)</option>
                                                <option value="select">ជម្រើស (Select)</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    {/* Options Input for Select Type */}
                                    {newFieldType === 'select' && (
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500">ជម្រើស (Options)</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    value={currentOptionInput} 
                                                    onChange={(e) => setCurrentOptionInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddOption();
                                                        }
                                                    }}
                                                    className="flex-1 text-sm rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white p-2"
                                                    placeholder="Type option & hit Enter (e.g. Option A)" 
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={handleAddOption}
                                                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 rounded-lg text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </div>
                                            {/* Chips Display */}
                                            {newFieldOptionsList && newFieldOptionsList.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 min-h-[40px]">
                                                    {newFieldOptionsList.map((opt, idx) => (
                                                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 animate-in fade-in zoom-in duration-200">
                                                            {opt}
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleRemoveOption(opt)}
                                                                className="hover:text-blue-900 dark:hover:text-blue-100 p-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-600">
                                        <button 
                                            type="button" 
                                            onClick={() => setIsCreatingField(false)}
                                            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={handleCreateCustomField}
                                            className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded hover:bg-primary-hover"
                                        >
                                            Save Field
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Render Custom Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {customFieldsSchema && customFieldsSchema.map(field => (
                                    <div key={field.id} className="space-y-1">
                                        {/* Dynamic Header: Normal or Confirm Delete */}
                                        {fieldToDelete === field.id ? (
                                            <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 p-1.5 rounded-lg border border-red-100 dark:border-red-900/30 animate-in fade-in zoom-in-95 duration-200">
                                                <div className="flex items-center gap-1.5">
                                                    <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                                                    <span className="text-xs font-bold text-red-600 dark:text-red-400 font-khmer">
                                                        លុបប្រអប់នេះ? (Delete?)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setFieldToDelete(null)}
                                                        className="px-2 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                                                    >
                                                        No
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={confirmDeleteField}
                                                        className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded hover:bg-red-600 shadow-sm"
                                                    >
                                                        Yes
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center h-[34px]">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 font-khmer">
                                                    {field.label}
                                                </label>
                                                <button 
                                                    type="button"
                                                    onClick={() => setFieldToDelete(field.id)}
                                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors p-1.5 rounded-md"
                                                    title="Remove Field"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}

                                        {field.type === 'select' ? (
                                            <select
                                                value={customValues[field.id] || ''}
                                                onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
                                                className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-primary sm:text-sm dark:bg-slate-900 dark:ring-slate-700 dark:text-white"
                                            >
                                                <option value="">Select...</option>
                                                {field.options?.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input 
                                                type={field.type}
                                                value={customValues[field.id] || ''}
                                                onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
                                                className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-primary sm:text-sm dark:bg-slate-900 dark:ring-slate-700 dark:text-white"
                                                placeholder={`Enter ${field.label}...`}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 font-khmer">
                                ចំណាំពិសេស (Special Notes / Tags)
                            </label>
                            <div className="rounded-xl ring-1 ring-inset ring-slate-200 dark:ring-slate-700 p-4 bg-slate-50 dark:bg-slate-900/50">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    {tags.map(tag => (
                                        <div key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-200 ring-1 ring-inset ring-blue-700/10">
                                            <Tag className="w-3.5 h-3.5" />
                                            {tag}
                                            <button onClick={() => removeTag(tag)} className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-blue-600 hover:bg-blue-200 focus:outline-none dark:text-blue-300 dark:hover:bg-blue-800" type="button">
                                                <span className="sr-only">Remove</span>
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <input 
                                        value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag}
                                        className="flex-1 min-w-[120px] border-0 bg-transparent p-1 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-0 dark:text-white" 
                                        placeholder="+ Add tag (Type & Enter)" type="text"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                                    <span className="text-xs text-slate-400 dark:text-slate-500 py-1">Quick Add:</span>
                                    <button onClick={() => setTags([...tags, 'Blacklist'])} className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" type="button">
                                        <Ban className="w-3.5 h-3.5 text-red-500" />
                                        Blacklist
                                    </button>
                                    <button onClick={() => setTags([...tags, 'Wholesale'])} className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" type="button">
                                        <Truck className="w-3.5 h-3.5 text-green-500" />
                                        Wholesale
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Modal Footer */}
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-700 sticky bottom-0 z-10">
                    <button onClick={handleClose} className="rounded-xl bg-white dark:bg-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors font-khmer" type="button">
                        បោះបង់ (Cancel)
                    </button>
                    <button onClick={handleSubmit} className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors font-khmer" type="button">
                        <Save className="w-5 h-5" />
                        {editingContact ? 'រក្សាទុកការកែប្រែ (Update Profile)' : 'រក្សាទុកព័ត៌មាន (Save Profile)'}
                    </button>
                </div>
            </div>

            {/* Map Picker Modal (Sub-Modal) */}
            {isMapPickerOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMapPickerOpen(false)}></div>
                    <div className="relative w-full max-w-4xl h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white font-khmer">ជ្រើសរើសទីតាំង (Pick Location)</h2>
                                <p className="text-sm text-slate-500">Click on the map to pin customer location</p>
                            </div>
                            <button onClick={() => setIsMapPickerOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Search Bar Overlay */}
                        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-20">
                            <div className="relative shadow-lg rounded-xl overflow-hidden group focus-within:ring-2 focus-within:ring-primary">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 sm:text-sm"
                                    placeholder="Search places (e.g. Wat Phnom)..."
                                    value={mapSearch}
                                    onChange={(e) => setMapSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Map Area Simulation */}
                        <div 
                            className="flex-1 bg-slate-100 dark:bg-slate-800 relative cursor-crosshair overflow-hidden group"
                            onClick={handleMapClick}
                            style={{
                                backgroundImage: `
                                    linear-gradient(rgba(200,200,200,0.3) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(200,200,200,0.3) 1px, transparent 1px)
                                `,
                                backgroundSize: '40px 40px'
                            }}
                        >
                            {/* Fake Map Content */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                <span className="text-4xl font-bold text-slate-300 dark:text-slate-600 uppercase tracking-[1em]">Map View</span>
                            </div>
                            
                            {/* Pin */}
                            {pinnedLocation && (
                                <div 
                                    className="absolute -translate-x-1/2 -translate-y-full transition-all duration-300 ease-out animate-in zoom-in slide-in-from-bottom-4"
                                    style={{ left: `${pinnedLocation.x}%`, top: `${pinnedLocation.y}%` }}
                                >
                                    <MapPin className="w-10 h-10 text-red-600 drop-shadow-md fill-current" />
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div className="text-sm text-slate-500">
                                {pinnedLocation 
                                    ? <span className="text-green-600 font-medium flex items-center gap-1"><Check className="w-4 h-4"/> Location Pinned</span> 
                                    : "No location selected"}
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setIsMapPickerOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmMapLocation}
                                    disabled={!pinnedLocation}
                                    className="px-6 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg shadow-sm transition-all"
                                >
                                    Confirm Location
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stage Manager Modal (Sub-Modal) Upgraded */}
            {isStageManagerOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => { setIsStageManagerOpen(false); resetStageForm(); }}></div>
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10 sticky top-0">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-khmer flex items-center gap-2">
                                <Settings2 className="w-5 h-5 text-primary" /> គ្រប់គ្រងស្ថានភាព (Manage Stages)
                            </h2>
                            <button onClick={() => { setIsStageManagerOpen(false); resetStageForm(); }} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
                            {/* List of Existing Stages to Edit */}
                            <div className="space-y-2.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-khmer">ចុចដើម្បីកែប្រែរបស់ចាស់ (Click to Edit)</label>
                                <div className="flex flex-wrap gap-2 border border-slate-100 dark:border-slate-800 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/50">
                                    {contactStages?.map(stage => {
                                        const IconCmp = (LucideIcons as any)[stage.iconName] || LucideIcons.Target;
                                        const classes = stage.colorClass.split(' ');
                                        const bg = classes.filter(c => c.startsWith('bg-')).join(' ');
                                        const txt = classes.filter(c => c.startsWith('text-')).join(' ');
                                        const isEditingThis = editingStageId === stage.id;
                                        
                                        return (
                                            <button
                                                key={stage.id}
                                                type="button"
                                                onClick={() => handleEditStageClick(stage)}
                                                className={`px-2.5 py-1.5 inline-flex items-center gap-1.5 text-xs font-semibold rounded-md transition-all border border-black/5 dark:border-white/5 ${bg} ${txt} ${isEditingThis ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-sm' : 'hover:scale-105 opacity-90 hover:opacity-100'}`}
                                                title="Edit this stage"
                                            >
                                                <IconCmp size={14} strokeWidth={2.5} />
                                                {stage.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 font-khmer flex items-center gap-1.5">
                                        <Palette className="w-4 h-4 text-primary" /> 
                                        {editingStageId ? 'កែប្រែស្ថានភាព (Edit Mode)' : 'បង្កើតស្ថានភាពថ្មី (Create New)'}
                                    </h3>
                                    {editingStageId && (
                                        <button onClick={resetStageForm} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-md font-medium transition-colors font-khmer">
                                            + បង្កើតថ្មី
                                        </button>
                                    )}
                                </div>

                                {/* Name Input */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 font-khmer">ឈ្មោះស្ថានភាព (Name)</label>
                                    <input 
                                        type="text" value={newStageName} onChange={(e) => setNewStageName(e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                                        placeholder="e.g. VIP Customer"
                                    />
                                </div>

                                {/* Color Picker */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 font-khmer">ជ្រើសរើសពណ៌ (Color)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {colorOptions.map((c, i) => (
                                            <button 
                                                key={i} type="button" onClick={() => setNewStageColor(c.value)}
                                                className={`w-8 h-8 rounded-full ${c.hex} ring-offset-2 dark:ring-offset-slate-900 transition-all ${newStageColor === c.value ? 'ring-2 ring-primary scale-110' : 'hover:scale-105 opacity-80'}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Icon Picker */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 font-khmer">ជ្រើសរើសរូបតំណាង (Icon)</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {iconOptions.map((iconName) => {
                                            const IconCmp = (LucideIcons as any)[iconName] || LucideIcons.Target;
                                            return (
                                                <button 
                                                    key={iconName} type="button" onClick={() => setNewStageIcon(iconName)}
                                                    className={`p-2 rounded-xl border flex items-center justify-center transition-all ${newStageIcon === iconName ? 'bg-primary/10 border-primary text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                                >
                                                    <IconCmp size={18} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
                            <button 
                                onClick={() => { setIsStageManagerOpen(false); resetStageForm(); }}
                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors font-khmer"
                            >
                                បោះបង់
                            </button>
                            <button 
                                onClick={() => {
                                    if(!newStageName.trim()) return alert('សូមបញ្ចូលឈ្មោះស្ថានភាព (Please enter a name)!');
                                    
                                    if (editingStageId) {
                                        // Update existing stage
                                        setContactStages(contactStages.map(s => 
                                            s.id === editingStageId 
                                                ? { ...s, name: newStageName.trim(), colorClass: newStageColor, iconName: newStageIcon } 
                                                : s
                                        ));
                                    } else {
                                        // Create new stage
                                        setContactStages([...contactStages, {
                                            id: 'stage_' + Date.now(),
                                            name: newStageName.trim(),
                                            colorClass: newStageColor,
                                            iconName: newStageIcon,
                                            isDefault: false
                                        }]);
                                    }
                                    
                                    resetStageForm();
                                    setIsStageManagerOpen(false);
                                }}
                                className="px-6 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-sm transition-all font-khmer flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> {editingStageId ? 'រក្សាទុកការកែប្រែ' : 'បង្កើតថ្មី'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddLeadModal;