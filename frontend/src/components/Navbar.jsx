import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiMenu,
  FiChevronDown,
  FiLogOut,
  FiMapPin, FiShoppingBag,
} from "react-icons/fi";


import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import logoImg from "../assets/Black logo.PNG";

function AvatarCircle({ letter, size = 'md' }) {
  const sizeClasses = size === 'sm'
    ? 'h-7 w-7 text-xs'
    : 'h-8 w-8 text-sm';
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-brand-600 text-white font-semibold ${sizeClasses} ring-2 ring-brand-100 select-none`}
    >
      {letter}
    </span>
  );
}

export default function Navbar() {
  const { user, customer, signOut } = useAuth();
  const { wishlistCount } = useWishlist();
  const { cartTotalItems } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTshirtOpen, setIsTshirtOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsMobileCategoriesOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      closeMenus();
    }
  };

  const handleLogout = async () => {
    await signOut();
    closeMenus();
    confirm("Are you sure you want to logout?");
    navigate('/');
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
              className="flex items-center"
            >
              <img src={logoImg} alt="Calm&Cozy" className="h-[80px] w-auto object-contain" />
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
            <div className="relative group pb-2">

              <button className="text-gray-700 hover:text-brand-600 font-medium transition-colors flex items-center">
                Categories
                <FiChevronDown className="ml-1 h-4 w-4" />
              </button>

              {/* Dropdown */}
              <div className="absolute left-0 top-full mt-0 hidden group-hover:block w-56 bg-white shadow-xl rounded-xl border border-gray-100 z-50">

                <Link
                  to="/shop?category=t-shirt-customize"
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600"
                >
                  T-Shirt Customize
                </Link>

                <div
                  className="relative"
                  onMouseEnter={() => setActiveCategory("tshirts")}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <Link
                    to="/shop?category=t-shirts"
                    className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    T-Shirts
                    <FiChevronDown className="h-3 w-3 -rotate-90" />
                  </Link>

                  {activeCategory === "tshirts" && (
                    <div className="absolute left-full top-0 w-52 bg-white shadow-xl rounded-xl border border-gray-100 z-[999]">
                      <Link to="/shop?category=t-shirts" className="block px-4 py-3 hover:bg-gray-50">
                        All T-Shirts
                      </Link>

                      <Link to="/shop?category=t-shirts&theme=anime" className="block px-4 py-3 hover:bg-gray-50">
                        Anime
                      </Link>

                      <Link to="/shop?category=t-shirts&theme=football" className="block px-4 py-3 hover:bg-gray-50">
                        Football
                      </Link>

                      <Link to="/shop?category=t-shirts&theme=cricket" className="block px-4 py-3 hover:bg-gray-50">
                        Cricket
                      </Link>
                    </div>
                  )}
                </div>

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
            <form onSubmit={handleSearch} className="relative w-full">
              <button type="submit" className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <FiSearch className="text-gray-400 hover:text-brand-600 cursor-pointer" />
              </button>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-sm"
                placeholder="Search products..."
              />
            </form>
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/wishlist"
                  className="text-gray-500 hover:text-brand-600 transition-colors relative"
                >
                  <FiHeart className="h-6 w-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  className="text-gray-500 hover:text-brand-600 transition-colors relative"
                >
                  <FiShoppingCart className="h-6 w-6" />

                  {cartTotalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartTotalItems}
                    </span>
                  )}
                </Link>

                <Link
                  to="/addresses"
                  className="text-gray-500 hover:text-brand-600 transition-colors"
                  title="My Addresses"
                >
                  <FiMapPin className="h-6 w-6" />
                </Link>

                <Link
                  to="/profile"
                  className="text-gray-500 hover:text-brand-600 transition-colors"
                  title="My Profile"
                >
                  {customer?.avatar_letter ? (
                    <AvatarCircle letter={customer.avatar_letter} />
                  ) : (
                    <FiUser className="h-6 w-6" />
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-brand-600 transition-colors"
                  title="Logout"
                >
                  <FiLogOut className="h-6 w-6" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-brand-600 font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            {user && (
              <>

                <Link
                  to="/shop"
                  className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-brand-600"
                >
                  <FiShoppingBag className="h-4 w-4" />
                  Shop
                </Link>
                <Link
                  to="/wishlist"
                  className="text-gray-500 hover:text-brand-600 transition-colors relative"
                >
                  <FiHeart className="h-6 w-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/cart"
                  className="text-gray-500 hover:text-brand-600 transition-colors relative"
                >
                  <FiShoppingCart className="h-6 w-6" />
                  {cartTotalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                      {cartTotalItems}
                    </span>
                  )}
                </Link>
              </>
            )}
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
            className="md:hidden bg-white border-t border-gray-200 overflow-y-auto max-h-[calc(100vh-64px)]"
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

                        <div>
                          <button
                            onClick={() => setIsTshirtOpen(!isTshirtOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                          >
                            <span>T-Shirts</span>

                            <FiChevronDown
                              className={`transition-transform duration-200 ${isTshirtOpen ? "rotate-180" : ""
                                }`}
                            />
                          </button>

                          <AnimatePresence>
                            {isTshirtOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="ml-4 border-l border-gray-200 pl-3">

                                  <Link
                                    to="/shop?category=t-shirts"
                                    onClick={closeMenus}
                                    className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                                  >
                                    All T-Shirts
                                  </Link>

                                  <Link
                                    to="/shop?category=t-shirts&theme=anime"
                                    onClick={closeMenus}
                                    className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                                  >
                                    Anime
                                  </Link>

                                  <Link
                                    to="/shop?category=t-shirts&theme=football"
                                    onClick={closeMenus}
                                    className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                                  >
                                    Football
                                  </Link>

                                  <Link
                                    to="/shop?category=t-shirts&theme=cricket"
                                    onClick={closeMenus}
                                    className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                                  >
                                    Cricket
                                  </Link>

                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

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
                <form onSubmit={handleSearch} className="relative">
                  <button type="submit" className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <FiSearch className="text-gray-400 hover:text-brand-600 cursor-pointer" />
                  </button>

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-sm"
                    placeholder="Search products..."
                  />
                </form>
              </div>

              {/* Mobile Icons / Auth */}
              <div className="flex justify-around py-4 border-t border-gray-200 mt-4">
                {user ? (
                  <>
                    <Link
                      to="/wishlist"
                      onClick={closeMenus}
                      className="text-gray-500 hover:text-brand-600 flex flex-col items-center relative"
                    >
                      <div className="relative">
                        <FiHeart className="h-6 w-6 mb-1" />
                        {wishlistCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                            {wishlistCount}
                          </span>
                        )}
                      </div>
                      <span className="text-xs">Wishlist</span>
                    </Link>

                    <Link
                      to="/cart"
                      onClick={closeMenus}
                      className="text-gray-500 hover:text-brand-600 flex flex-col items-center relative"
                    >
                      <div className="relative">
                        <FiShoppingCart className="h-6 w-6 mb-1" />
                        {cartTotalItems > 0 && (
                          <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                            {cartTotalItems}
                          </span>
                        )}
                      </div>
                      <span className="text-xs">Cart</span>
                    </Link>

                    <Link
                      to="/addresses"
                      onClick={closeMenus}
                      className="text-gray-500 hover:text-brand-600 flex flex-col items-center"
                    >
                      <FiMapPin className="h-6 w-6 mb-1" />
                      <span className="text-xs">Address</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={closeMenus}
                      className="text-gray-500 hover:text-brand-600 flex flex-col items-center"
                    >
                      {customer?.avatar_letter ? (
                        <AvatarCircle letter={customer.avatar_letter} size="sm" />
                      ) : (
                        <FiUser className="h-6 w-6 mb-1" />
                      )}
                      <span className="text-xs mt-1">Profile</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-brand-600 flex flex-col items-center"
                    >
                      <FiLogOut className="h-6 w-6 mb-1" />
                      <span className="text-xs">Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col w-full px-4 space-y-3">
                    <Link
                      to="/login"
                      onClick={closeMenus}
                      className="w-full text-center py-2 border border-brand-600 text-brand-600 rounded-lg font-medium"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMenus}
                      className="w-full text-center py-2 bg-brand-600 text-white rounded-lg font-medium shadow-sm"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}