import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiUser, FiPackage, FiMapPin, FiHeart, FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, customer, setCustomer, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL;
  const STRAPI_API_TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN;

  useEffect(() => {
    if (customer?.phone) {
      setPhone(customer.phone);
    }
  }, [customer]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!customer?.documentId) {
      toast.error("Customer record not found.");
      return;
    }

    setIsSaving(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (STRAPI_API_TOKEN) {
        headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
      }

      const res = await fetch(`${API_URL}/api/customers/${customer.documentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          data: { phone }
        })
      });

      const data = await res.json();
      if (data.data) {
        setCustomer(data.data);
        toast.success("Profile updated successfully");
      } else {
        throw new Error("Failed to update");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const navItems = [
    { name: 'Profile', path: '/profile', icon: FiUser },
    { name: 'Orders', path: '/orders', icon: FiPackage },
    { name: 'Addresses', path: '/addresses', icon: FiMapPin },
    { name: 'Wishlist', path: '/wishlist', icon: FiHeart },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-brand-50 text-brand-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
              
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiLogOut className="mr-3 h-5 w-5 text-red-500" />
                    Logout
                  </>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Personal Details</h2>
            
            <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-100">
              <div className="h-20 w-20 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-3xl font-bold">
                {customer?.avatar_letter || user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {customer?.full_name || user?.user_metadata?.full_name || 'User'}
                </h3>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={customer?.full_name || user?.user_metadata?.full_name || ''}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Name can only be changed by contacting support.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
