import { Link } from "react-router-dom";
import {
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiMenu,
  FiChevronDown,
} from "react-icons/fi";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] =
    useState(false);

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsMobileCategoriesOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navbar */}
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-brand-600"
            >
              Calm&Cozy
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">

            <Link
              to="/"
              className="text-gray-700 hover:text-brand-600 font-medium transition-colors"
            >
              Home
            </Link>

            <Link
              to="/shop"
              className="text-gray-700 hover:text-brand-600 font-medium transition-colors"
            >
              Shop
            </Link>

            {/* Categories */}
            <div className="relative group">

              <button className="text-gray-700 hover:text-brand-600 font-medium transition-colors flex items-center">
                Categories
                <FiChevronDown className="ml-1 h-4 w-4" />
              </button>

              {/* Dropdown */}
              <div className="absolute left-0 top-8 hidden group-hover:block w-56 bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden z-50">

                <Link
                  to="/shop?category=t-shirt-customize"
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600"
                >
                  T-Shirt Customize
                </Link>

                <Link
                  to="/shop?category=t-shirts"
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600"
                >
                  T-Shirt
                </Link>

                <Link
                  to="/shop?category=oversized-t-shirts"
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600"
                >
                  Oversized
                </Link>

                <Link
                  to="/shop?category=mugs"
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600"
                >
                  Mug
                </Link>

                <Link
                  to="/shop?category=mouse-pad"
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600"
                >
                  Mouse Pad
                </Link>

                <Link
                  to="/shop?category=desk-pad"  
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600"
                >
                  Desk Pad
                </Link>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md ml-8 mr-8">
            <div className="relative w-full">

              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>

              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-sm"
                placeholder="Search products..."
              />
            </div>
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-6">

            <Link
              to="/wishlist"
              className="text-gray-500 hover:text-brand-600 transition-colors"
            >
              <FiHeart className="h-6 w-6" />
            </Link>

            <Link
              to="/cart"
              className="text-gray-500 hover:text-brand-600 transition-colors relative"
            >
              <FiShoppingCart className="h-6 w-6" />

              <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>

            <Link
              to="/profile"
              className="text-gray-500 hover:text-brand-600 transition-colors"
            >
              <FiUser className="h-6 w-6" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() =>
                setIsMobileMenuOpen(!isMobileMenuOpen)
              }
              className="text-gray-500 hover:text-brand-600"
            >
              <FiMenu className="h-7 w-7" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="px-3 pt-3 pb-5 space-y-2">

              {/* Home */}
              <Link
                to="/"
                onClick={closeMenus}
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Home
              </Link>

              {/* Shop */}
              <Link
                to="/shop"
                onClick={closeMenus}
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Shop
              </Link>

              {/* Categories */}
              <div>
                <button
                  onClick={() =>
                    setIsMobileCategoriesOpen(
                      !isMobileCategoriesOpen
                    )
                  }
                  className="w-full flex items-center justify-between px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  Categories

                  <FiChevronDown
                    className={`transition-transform duration-200 ${isMobileCategoriesOpen
                        ? "rotate-180"
                        : ""
                      }`}
                  />
                </button>

                <AnimatePresence>
                  {isMobileCategoriesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 py-2 space-y-1">

                        <Link
                          to="/shop?category=t-shirt-customize"
                          onClick={closeMenus}
                          className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                        >
                          T-Shirt Customize
                        </Link>

                        <Link
                          to="/shop?category=t-shirts"
                          onClick={closeMenus}
                          className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                        >
                          T-Shirt
                        </Link>

                        <Link
                          to="/shop?category=oversized-t-shirts"
                          onClick={closeMenus}
                          className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                        >
                          Oversized
                        </Link>

                        <Link
                          to="/shop?category=mugs"
                          onClick={closeMenus}
                          className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                        >
                          Mug
                        </Link>

                        <Link
                          to="/shop?category=mouse-pad"
                          onClick={closeMenus}
                          className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                        >
                          Mouse Pad
                        </Link>

                        <Link
                          to="/shop?category=desk-pad"
                          onClick={closeMenus}
                          className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                        >
                          Desk Pad
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search */}
              <div className="mt-4 px-3">
                <div className="relative">

                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>

                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-sm"
                    placeholder="Search products..."
                  />
                </div>
              </div>

              {/* Mobile Icons */}
              <div className="flex justify-around py-4 border-t border-gray-200 mt-4">

                <Link
                  to="/wishlist"
                  onClick={closeMenus}
                  className="text-gray-500 hover:text-brand-600 flex flex-col items-center"
                >
                  <FiHeart className="h-6 w-6 mb-1" />
                  <span className="text-xs">Wishlist</span>
                </Link>

                <Link
                  to="/cart"
                  onClick={closeMenus}
                  className="text-gray-500 hover:text-brand-600 flex flex-col items-center relative"
                >
                  <div className="relative">
                    <FiShoppingCart className="h-6 w-6 mb-1" />

                    <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      0
                    </span>
                  </div>

                  <span className="text-xs">Cart</span>
                </Link>

                <Link
                  to="/profile"
                  onClick={closeMenus}
                  className="text-gray-500 hover:text-brand-600 flex flex-col items-center"
                >
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