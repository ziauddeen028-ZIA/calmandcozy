import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

export default function ProductCard({ product }) {
  const { documentId, title, sellingPrice, actualPrice, category, images } = product;
  
  // Use the first image if available, otherwise a placeholder
  const imageUrl = images?.length > 0 
    ? `${STRAPI_URL}${images[0].url}` 
    : 'https://via.placeholder.com/400x400?text=No+Image';
    
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl overflow-hidden flex flex-col group border border-gray-100"
    >
      <Link to={`/product/${documentId}`} className="relative block overflow-hidden aspect-square">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Wishlist Button Overlay */}
        <button 
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.preventDefault(); // Prevent navigating to product details
            // Wishlist logic will go here
            console.log('Added to wishlist:', title);
          }}
          aria-label="Add to wishlist"
        >
          <FiHeart className="w-5 h-5 text-gray-700 hover:text-red-500" />
        </button>
      </Link>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1">
          {category?.name || 'Uncategorized'}
        </div>
        
        <Link to={`/product/${documentId}`} className="flex-grow">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-indigo-600 transition-colors">
            {title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 mb-4 mt-auto">
          <span className="text-xl font-bold text-gray-900">
            ${sellingPrice}
          </span>
          {actualPrice && actualPrice > sellingPrice && (
            <span className="text-sm text-gray-400 line-through">
              ${actualPrice}
            </span>
          )}
        </div>
        
        <motion.button 
          whileTap={{ scale: 0.95 }}
          className="w-full py-2.5 px-4 bg-gray-900 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          onClick={() => {
            // Add to cart logic will go here
            console.log('Added to cart:', title);
          }}
        >
          <FiShoppingCart className="w-4 h-4" />
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
}
