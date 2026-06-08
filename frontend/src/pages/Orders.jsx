import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiPackage, FiMapPin, FiHeart, FiLogOut, FiShoppingBag, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { fetchOrders } from '../lib/orderService';

function ProfileSidebar({ onLogout }) {
  const location = useLocation();
  const navItems = [
    { name: 'Profile', path: '/profile', icon: FiUser },
    { name: 'Orders', path: '/orders', icon: FiPackage },
    { name: 'Addresses', path: '/addresses', icon: FiMapPin },
    { name: 'Wishlist', path: '/wishlist', icon: FiHeart },
  ];

  return (
    <div className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-4"
          >
            <FiLogOut className="mr-3 h-5 w-5 text-red-500" />
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
}

export default function Orders() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await fetchOrders(user.id);
        setOrders(data);
      } catch (err) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [user?.id]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';

      case 'pending':
        return 'bg-yellow-100 text-yellow-800';

      case 'failed':
        return 'bg-red-100 text-red-800';

      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        <ProfileSidebar onLogout={handleLogout} />

        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h2>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-gray-50 p-6 rounded-full inline-flex mb-6">
                  <FiPackage className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-8 max-w-md">
                  When you place an order, it will appear here. Start shopping to find your next favorite item!
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors"
                >
                  <FiShoppingBag className="mr-2 h-5 w-5" />
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.documentId} className="border border-gray-200 rounded-xl overflow-hidden hover:border-brand-300 transition-colors">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Order #{order.orderId}</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}
                        >
                          Order: {order.orderStatus}
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getPaymentStatusColor(order.paymentStatus)}`}
                        >
                          Payment: {order.paymentStatus}
                        </span>

                        <p className="font-bold text-gray-900 ml-2">
                          ₹{order.total}
                        </p>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex-1 w-full">
                          <p className="text-sm font-medium text-gray-900 mb-3">Items:</p>
                          <div className="flex flex-wrap gap-4">
                            {order.orderItems?.slice(0, 4).map((item, idx) => (
                              <div key={idx} className="relative group">
                                {item.previewImageUrl ? (
                                  <img
                                    src={
                                      item.previewImageUrl?.startsWith("http")
                                        ? item.previewImageUrl
                                        : `${import.meta.env.VITE_STRAPI_URL || "http://localhost:1337"}${item.previewImageUrl}`
                                    }
                                    alt={item.productName}
                                    className="w-16 h-16 rounded-lg object-contain bg-white border border-gray-200"
                                  />
                                ) : item.productImage ? (
                                  <img
                                    src={
                                      item.productImage?.startsWith("http")
                                        ? item.productImage
                                        : `${import.meta.env.VITE_STRAPI_URL || "http://localhost:1337"}${item.productImage}`
                                    }
                                    alt={item.productName}
                                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                    <FiPackage className="text-gray-400" />
                                  </div>
                                )}
                                <div className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                  {item.quantity}
                                </div>
                              </div>
                            ))}
                            {order.orderItems?.length > 4 && (
                              <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                                +{order.orderItems.length - 4}
                              </div>
                            )}
                          </div>
                        </div>

                        <Link
                          to={`/order/${order.documentId}`}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border-2 border-brand-100 text-brand-600 hover:bg-brand-50 rounded-xl font-medium transition-colors whitespace-nowrap"
                        >
                          View Details
                          <FiChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
