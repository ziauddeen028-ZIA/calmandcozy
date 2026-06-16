import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import api from "../lib/api";
import ProductGrid from "../components/ProductGrid";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import StoreLoadingBanner from "../components/StoreLoadingBanner";
import { useLoadingStages } from "../hooks/useLoadingStages";

// CATEGORY MAP
const categoryMap = {
  "t-shirt-customize": "T-Shirt Customize",
  "t-shirts": "T-Shirts",
  "oversized-t-shirts": "Oversized T-Shirts",
  "mugs": "Mugs",
  "mug-customize": "Mug Customize",
  "mouse-pad": "Mouse Pad",
  "desk-pad": "Desk Pad",
};

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Best Selling", value: "best-selling" },
];

export default function Shop() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearchQuery = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { stageLabel, progress } = useLoadingStages(loading);

  // FILTER & SORT STATES
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "all");
  }, [location.search]);

  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState("newest");

  // UI STATES
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const selectedTheme = searchParams.get("theme") || "";

  // FORMAT CATEGORY
  const formattedCategory = selectedCategory !== "all"
    ? categoryMap[selectedCategory] ||
    selectedCategory
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
    : null;

  // FETCH PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products?populate[0]=images&populate[1]=category&fields[0]=title&fields[1]=sellingPrice&fields[2]=actualPrice&fields[3]=stock&fields[4]=createdAt&fields[5]=theme&fields[6]=documentId");
        const fetchedProducts = response.data.data || [];
        setProducts(fetchedProducts);

        // Find max price to set realistic slider bounds
        const highestPrice = fetchedProducts.reduce(
          (max, p) => p.sellingPrice > max ? p.sellingPrice : max,
          0
        );
        if (highestPrice > 0) {
          setMaxPrice(Math.ceil(highestPrice / 100) * 100);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // HIGHEST PRICE FOR SLIDER RANGE
  const absoluteMaxPrice = useMemo(() => {
    const highest = products.reduce(
      (max, p) => p.sellingPrice > max ? p.sellingPrice : max,
      0
    );
    return highest > 0 ? Math.ceil(highest / 100) * 100 : 5000;
  }, [products]);

  // FILTER & SORT PRODUCTS
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (selectedTheme) {
      result = result.filter(
        (product) =>
          product.theme?.toLowerCase() === selectedTheme.toLowerCase()
      );
    }
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(
        (product) => product.category?.slug?.toLowerCase() === selectedCategory
      );
    }

    // Search Filter
    if (initialSearchQuery) {
      const q = initialSearchQuery.toLowerCase();
      result = result.filter((product) => {
        const titleMatch = product.title?.toLowerCase().includes(q);
        const descMatch = product.description?.toLowerCase().includes(q);
        return titleMatch || descMatch;
      });
    }

    // Price Filter
    result = result.filter(
      (product) => product.sellingPrice <= maxPrice
    );

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.sellingPrice - b.sellingPrice);
        break;
      case "price-desc":
        result.sort((a, b) => b.sellingPrice - a.sellingPrice);
        break;
      case "best-selling":
        result.sort((a, b) => (b.sales || 0) - (a.sales || 0));
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return result;
  }, [products, selectedCategory, maxPrice, sortBy, initialSearchQuery]);

  const clearFilters = () => {
    setSelectedCategory("all");
    setMaxPrice(absoluteMaxPrice);
    setSortBy("newest");
  };

  // FILTER SIDEBAR CONTENT
  const FilterContent = () => (
    <div className="space-y-8">
      {/* Category Filter */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === "all"}
              onChange={() => setSelectedCategory("all")}
              className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
            />
            <span className={`text-sm font-satoshi ${selectedCategory === "all" ? "text-gray-900 font-medium" : "text-gray-500 group-hover:text-gray-900 transition-colors"}`}>
              All Categories
            </span>
          </label>
          {Object.entries(categoryMap).map(([slug, label]) => (
            <label key={slug} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === slug}
                onChange={() => setSelectedCategory(slug)}
                className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
              />
              <span className={`text-sm font-satoshi ${selectedCategory === slug ? "text-gray-900 font-medium" : "text-gray-500 group-hover:text-gray-900 transition-colors"}`}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Max Price</h3>
          <span className="text-sm font-medium text-gray-900 font-satoshi">₹{maxPrice}</span>
        </div>
        <input
          type="range"
          min="0"
          max={absoluteMaxPrice}
          step="50"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2 font-satoshi">
          <span>₹0</span>
          <span>₹{absoluteMaxPrice}</span>
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={clearFilters}
        className="w-full py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* PAGE HEADER & CONTROLS */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            {formattedCategory ? `${formattedCategory} Products` : "Our Collection"}
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            {formattedCategory
              ? `Explore our collection of ${formattedCategory.toLowerCase()}.`
              : "Discover our curated collection of premium lifestyle products."}
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-20">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="21" y2="14" /><line x1="4" x2="20" y1="10" y2="3" /><line x1="14" x2="14" y1="21" y2="10" /><line x1="8" x2="8" y1="14" y2="3" /></svg>
            Filters
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sort by: <span className="text-gray-900">{sortOptions.find(o => o.value === sortBy)?.label}</span>
              <svg className={`w-4 h-4 transition-transform ${isSortOpen ? "rotate-180" : ""}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </button>

            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${sortBy === option.value
                        ? "bg-gray-50 text-gray-900 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* DESKTOP SIDEBAR */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <FilterContent />
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1">
          <StoreLoadingBanner
            loading={loading}
            stageLabel={stageLabel}
            progress={progress}
          />

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : error ? (
            <div className="text-center py-20 text-red-500 text-lg">{error}</div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No products found</h2>
              <p className="text-gray-500 mb-6">We couldn't find any products matching your current filters.</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <motion.div layout>
              <ProductGrid products={filteredAndSortedProducts} />
            </motion.div>
          )}
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-2xl z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <FilterContent />
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Show Results ({filteredAndSortedProducts.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}