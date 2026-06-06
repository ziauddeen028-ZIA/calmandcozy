import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

export default function ProductCard({ product }) {
  const { documentId, title, sellingPrice, actualPrice, category, images } = product;
  const { handleToggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const inWishlist = isInWishlist(documentId);

  const handleWishlist = async (e) => {
    e.preventDefault();
    await handleToggleWishlist(documentId);
  };

  const getImageUrl = (img) => {
    if (!img) return 'https://via.placeholder.com/400x400?text=No+Image';
    if (img.url.startsWith('http')) return img.url;
    return (import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337') + img.url;
  };

  const imageUrl =
    images?.length > 0
      ? getImageUrl(images[0])
      : 'https://via.placeholder.com/400x400?text=No+Image';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl overflow-hidden flex flex-col group border border-gray-100 transition-shadow duration-300"
    >
      {/* Image */}
      <Link to={`/product/${documentId}`} className="relative block overflow-hidden aspect-square">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Wishlist Button */}
        <button
          className={`absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors ${
            inWishlist
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
        <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">
          {category?.name || 'Uncategorized'}
        </div>

        <Link to={`/product/${documentId}`} className="flex-grow">
          <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors leading-snug">
            {title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-3 sm:mb-4 mt-auto">
          <span className="text-base sm:text-xl font-bold text-gray-900">₹{sellingPrice}</span>
          {actualPrice && actualPrice > sellingPrice && (
            <span className="text-xs sm:text-sm text-gray-400 line-through">₹{actualPrice}</span>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-full py-2 sm:py-2.5 px-4 bg-gray-900 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          onClick={async (e) => {
            e.preventDefault();
            await addToCart(documentId, 1);
          }}
        >
          <FiShoppingCart className="w-4 h-4" />
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
}
