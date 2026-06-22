import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader />
      </div>
    );
  }

  if (user && location.pathname !== '/reset-password') {
    // Redirect logged-in users away from auth pages, EXCEPT reset-password
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
      >
        <div className="text-center">
          <Link to="/" className="text-3xl font-bold text-brand-600 inline-block">
            Calm&Cozy
          </Link>
        </div>
        
        <Outlet />
      </motion.div>
    </div>
  );
}
