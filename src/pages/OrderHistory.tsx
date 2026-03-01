import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../config/firebase';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderId: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
}

const OrderHistory: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  // 1. Listen for Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser || !shopId) return;

      try {
        setLoading(true);
        setError('');

        // A. Find Tenant UID from shopId (slug)
        const tenantsQuery = query(collection(db, 'tenants'), where('name', '==', shopId));
        const tenantSnapshot = await getDocs(tenantsQuery);

        if (tenantSnapshot.empty) {
          setError('Shop not found');
          setLoading(false);
          return;
        }

        const tenantUID = tenantSnapshot.docs[0].id;

        // B. Query Orders for this Customer in this Shop
        const ordersQuery = query(
          collection(db, 'tenants', tenantUID, 'onlineOrders'),
          where('customerId', '==', currentUser.uid)
        );
        
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];

        // Sort by date descending (newest first)
        ordersData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setOrders(ordersData);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError('Failed to load order history.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser, shopId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Please Login</h2>
          <p className="text-slate-500 mb-6">សូមចូលគណនីដើម្បីមើលប្រវត្តិការទិញរបស់អ្នក (Please login to view your order history)</p>
          <Link 
            to={`/store/${shopId}`} 
            className="inline-block w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/store/${shopId}`} className="text-slate-500 hover:text-slate-800 transition-colors">
              <span className="text-2xl">←</span>
            </Link>
            <h1 className="text-lg font-bold text-slate-900">ប្រវត្តិការទិញ (Order History)</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 text-2xl">
              📦
            </div>
            <h3 className="text-lg font-medium text-slate-900">No orders yet</h3>
            <p className="text-slate-500 mt-1">You haven't placed any orders with this shop yet.</p>
            <Link to={`/store/${shopId}`} className="text-blue-600 font-medium mt-4 inline-block hover:underline">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Order ID</p>
                    <p className="font-mono font-bold text-slate-700">#{order.orderId || order.id.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Date</p>
                    <p className="text-sm font-medium text-slate-700">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm text-slate-600">
                          <span className="font-bold text-slate-900">{item.quantity}x</span> {item.name}
                        </div>
                      ))}
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <Link 
                      to={`/store/${shopId}/track`} 
                      className="text-sm text-blue-600 font-medium hover:text-blue-800"
                    >
                      Track Order
                    </Link>
                    <div className="text-lg font-bold text-slate-900">
                      ${order.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderHistory;