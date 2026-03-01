import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Package, Truck, CheckCircle, Clock, Search, ArrowLeft, ShoppingBag } from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderId?: string;
  status: string;
  total: number;
  date: string;
  items: OrderItem[];
  customer: {
    name: string;
    phone: string;
    address: string;
  };
}

const TrackOrder: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tenantUID, setTenantUID] = useState('');

  // Fetch Tenant UID based on shopId (shop name)
  useEffect(() => {
    const fetchTenant = async () => {
      if (!shopId) return;
      try {
        const q = query(collection(db, 'tenants'), where('name', '==', shopId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setTenantUID(snapshot.docs[0].id);
        } else {
          setError('Shop not found');
        }
      } catch (err) {
        console.error(err);
        setError('Error loading shop info');
      }
    };
    fetchTenant();
  }, [shopId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim() || !tenantUID) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      // 1. Try searching by readable Order ID (e.g., ORD-123456)
      let q = query(
        collection(db, 'tenants', tenantUID, 'onlineOrders'),
        where('orderId', '==', searchTerm.trim())
      );
      let snapshot = await getDocs(q);

      // 2. If not found, try by Phone Number
      if (snapshot.empty) {
        q = query(
          collection(db, 'tenants', tenantUID, 'onlineOrders'),
          where('customer.phone', '==', searchTerm.trim())
        );
        snapshot = await getDocs(q);
      }

      if (!snapshot.empty) {
        // If multiple orders (e.g. by phone), take the most recent one
        const ordersData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        ordersData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrder(ordersData[0]);
      } else {
        setError('រកមិនឃើញការកុម្ម៉ង់ទេ (Order not found). សូមពិនិត្យលេខទូរស័ព្ទ ឬលេខកូដម្តងទៀត។');
      }
    } catch (err) {
      console.error(err);
      setError('Error searching for order');
    } finally {
      setLoading(false);
    }
  };

  // Timeline Steps Configuration
  const steps = [
    { id: 1, label: 'ថ្មី (New)', status: ['New', 'Pending'], icon: Clock },
    { id: 2, label: 'កំពុងរៀបចំ (Packing)', status: ['Packing', 'Preparing'], icon: Package },
    { id: 3, label: 'កំពុងដឹក (Shipping)', status: ['Shipping', 'Delivering'], icon: Truck },
    { id: 4, label: 'ជោគជ័យ (Completed)', status: ['Completed'], icon: CheckCircle },
  ];

  const getCurrentStep = (status: string) => {
    if (!status) return 0;
    const index = steps.findIndex(s => s.status.includes(status));
    return index !== -1 ? index + 1 : 0;
  };

  const currentStep = order ? getCurrentStep(order.status) : 0;
  const isCancelled = order?.status === 'Cancelled' || order?.status === 'Rejected';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-display">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to={`/store/${shopId}`} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white font-khmer">តាមដានការកុម្ម៉ង់ (Track Order)</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Search Box */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-khmer">ស្វែងរកការកុម្ម៉ង់របស់អ្នក</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">បញ្ចូលលេខទូរស័ព្ទ ឬ លេខកូដកុម្ម៉ង់ (Order ID)</p>
          </div>

          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ex: 012345678 or ORD-123456"
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <button 
                type="submit"
                disabled={loading || !searchTerm}
                className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Search'}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-3 text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg border border-red-100 dark:border-red-800">
                {error}
              </p>
            )}
          </form>
        </div>

        {/* Order Result */}
        {order && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Order Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-wrap justify-between items-center gap-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Order ID</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">#{order.orderId || order.id.slice(0, 8)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{new Date(order.date).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-8">
              {isCancelled ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-icons-round text-3xl">cancel</span>
                  </div>
                  <h3 className="text-xl font-bold text-red-600 font-khmer">ការកុម្ម៉ង់ត្រូវបានបោះបង់</h3>
                  <p className="text-slate-500 mt-2">Order has been cancelled.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Progress Bar Background */}
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 rounded-full z-0"></div>
                  {/* Active Progress */}
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full z-0 transition-all duration-1000 ease-out"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                  ></div>

                  <div className="relative z-10 flex justify-between w-full">
                    {steps.map((step) => {
                      const isActive = currentStep >= step.id;
                      const isCurrent = currentStep === step.id;
                      
                      return (
                        <div key={step.id} className="flex flex-col items-center group w-1/4">
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all duration-300 border-4 
                              ${isActive 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-400'
                              }
                              ${isCurrent ? 'scale-110 ring-4 ring-blue-100 dark:ring-blue-900/30' : ''}
                            `}
                          >
                            <step.icon size={18} strokeWidth={2.5} />
                          </div>
                          <p className={`text-xs md:text-sm font-bold text-center font-khmer transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 font-khmer">
                <ShoppingBag size={18} />
                ព័ត៌មានទំនិញ (Items)
              </h3>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-slate-500">
                        {item.quantity}x
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{item.name}</span>
                    </div>
                    <span className="text-slate-900 dark:text-white font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 dark:border-slate-700 my-3 pt-3 flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-white font-khmer">សរុប (Total)</span>
                  <span className="text-xl font-bold text-blue-600">${order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 font-khmer">ព័ត៌មានដឹកជញ្ជូន</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{order.customer.name} | {order.customer.phone}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{order.customer.address}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TrackOrder;