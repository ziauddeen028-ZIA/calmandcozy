import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductCard({ product }) {
  const { documentId, title, sellingPrice, actualPrice, category, images, customizable, bundleOfferEnabled, bundleQty, bundlePrice } = product;
  console.log(product);
  const { handleToggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const inWishlist = isInWishlist(documentId);

  const [added, setAdded] = useState(false);

  const handleWishlist = (e) => {
    e.preventDefault();
    handleToggleWishlist(documentId);
  };

  const getImageUrl = (img) => {
    if (!img) return 'https://via.placeholder.com/400x400?text=No+Image';
    if (img.url.startsWith('http')) return img.url;
    return (import.meta.env.VITE_API_URL) + img.url;
  };

  const imageUrl =
    images?.length > 0
      ? getImageUrl(images[0])
      : 'https://via.placeholder.com/400x400?text=No+Image';

  return (
    <motion.div
      whileHover={{ y: customizable ? -9 : -7 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`bg-white rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 ${customizable
          ? 'border-2 border-blue-500 shadow-[0_0_0_1px_#3b82f6,0_4px_24px_rgba(59,130,246,0.15)] hover:shadow-[0_0_0_2px_#2563eb,0_12px_40px_rgba(59,130,246,0.35)]'
          : 'border border-gray-100 shadow-sm hover:shadow-2xl'
        }`}
    >
      {/* Image */}
      <Link to={`/product/${documentId}`} className="relative block overflow-hidden aspect-square bg-gray-100 flex items-center justify-center">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          loading="lazy"
        />
        {/* CUSTOM badge */}
        {customizable && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-blue-700 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-md tracking-wide z-10">
            ✨ CUSTOM
          </div>
        )}
        {/* Bundle badge */}
        {bundleOfferEnabled && (
          <div className={`absolute left-3 group/bundle flex items-center justify-center bg-black text-white px-3 py-1.5 rounded-full shadow-md z-10 cursor-pointer transition-all duration-300 hover:scale-[1.08] hover:-translate-y-[3px] hover:shadow-[0_0_15px_rgba(239,68,68,0.6)] ${customizable ? 'top-12' : 'top-3'}`}>
            <span className="text-[10px] sm:text-xs font-black tracking-wider flex items-center gap-1">
              <span className="text-sm">🔥</span> DEAL
            </span>
            <div className="absolute left-0 top-full mt-2 opacity-0 group-hover/bundle:opacity-100 transition-opacity duration-300 bg-gray-900 text-white text-[11px] font-semibold px-3 py-1.5 rounded shadow-xl pointer-events-none whitespace-nowrap">
              Buy {bundleQty} for ₹{bundlePrice}
              {/* Arrow for tooltip */}
              <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        )}
        {/* Wishlist Button */}
        <button
          className={`absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors ${inWishlist
            ? 'opacity-100 text-red-500'
            : 'opacity-100 text-gray-700 md:opacity-0 md:group-hover:opacity-100'
            }`}
          onClick={handleWishlist}
          aria-label="Add to wishlist"
        >
          <FiHeart
            className={`w-4 h-4 sm:w-5 sm:h-5 ${inWishlist ? 'fill-current text-red-500' : 'hover:text-red-500'}`}
          />
        </button>
      </Link>

      {/* Info */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1 font-satoshi">
          {category?.name || 'Uncategorized'}
        </div>

        <Link to={`/product/${documentId}`} className="flex-grow">
          <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1 line-clamp-2 hover:text-blue-600 transition-colors leading-snug">
            {title}
          </h3>
          {customizable && (
            <p className="text-[11px] text-purple-500 font-medium mb-1">🎨 Upload Your Design</p>
          )}
        </Link>

        <div className="flex items-center gap-2 mb-3 sm:mb-4 mt-auto">
          <span className="text-base sm:text-xl font-bold text-gray-900 font-satoshi">₹{sellingPrice}</span>
          {actualPrice && actualPrice > sellingPrice && (
            <span className="text-xs sm:text-sm text-gray-400 line-through font-satoshi">₹{actualPrice}</span>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`w-full py-2 sm:py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
            added ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-900 hover:bg-blue-600 text-white'
          }`}
          onClick={(e) => {
            e.preventDefault();
            const success = addToCart(documentId, 1);
            if (success) {
              setAdded(true);
              setTimeout(() => setAdded(false), 2000);
            }
          }}
        >
          {added ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              Added
            </>
          ) : (
            <>
              <FiShoppingCart className="w-4 h-4" />
              Add to Cart
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
