import { Link } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu } from 'react-icons/fi';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-brand-600">
              Calm&Cozy
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-brand-600 font-medium transition-colors">Home</Link>
            <Link to="/shop" className="text-gray-700 hover:text-brand-600 font-medium transition-colors">Shop</Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md ml-8 mr-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all"
                placeholder="Search products..."
              />
            </div>
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/wishlist" className="text-gray-500 hover:text-brand-600 transition-colors">
              <FiHeart className="h-6 w-6" />
            </Link>
            <Link to="/cart" className="text-gray-500 hover:text-brand-600 transition-colors relative">
              <FiShoppingCart className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
            </Link>
            <Link to="/profile" className="text-gray-500 hover:text-brand-600 transition-colors">
              <FiUser className="h-6 w-6" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-brand-600 focus:outline-none"
            >
              <FiMenu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50">Home</Link>
              <Link to="/shop" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50">Shop</Link>
              <div className="mt-4 px-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    placeholder="Search products..."
                  />
                </div>
              </div>
              <div className="flex justify-around py-4 border-t border-gray-200 mt-4">
                <Link to="/wishlist" className="text-gray-500 hover:text-brand-600 flex flex-col items-center">
                  <FiHeart className="h-6 w-6 mb-1" />
                  <span className="text-xs">Wishlist</span>
                </Link>
                <Link to="/cart" className="text-gray-500 hover:text-brand-600 flex flex-col items-center relative">
                  <div className="relative">
                    <FiShoppingCart className="h-6 w-6 mb-1" />
                    <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">0</span>
                  </div>
                  <span className="text-xs">Cart</span>
                </Link>
                <Link to="/profile" className="text-gray-500 hover:text-brand-600 flex flex-col items-center">
                  <FiUser className="h-6 w-6 mb-1" />
                  <span className="text-xs">Profile</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
