import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiCheck, FiArrowLeft } from 'react-icons/fi';
import api from '../lib/api';
import Loader from '../components/Loader';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}?populate=*`);
        const productData = response.data.data;
        setProduct(productData);
        if (productData?.images?.length > 0) {
          setActiveImage(productData.images[0].url);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <Loader />;
  
  if (error || !product) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-lg mb-4">{error || 'Product not found.'}</p>
        <Link to="/shop" className="text-indigo-600 hover:underline">
          &larr; Back to Shop
        </Link>
      </div>
    );
  }

  const { title, description, sellingPrice, actualPrice, category, stock, images } = product;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <Link to="/shop" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-8 transition-colors">
        <FiArrowLeft className="mr-2" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {images && images.length > 1 && (
            <div className="flex sm:flex-col gap-4 overflow-x-auto sm:overflow-y-auto sm:w-24 shrink-0 no-scrollbar">
              {images.map((img) => (
                <button 
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`relative w-20 h-20 sm:w-full sm:h-24 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === img.url ? 'border-indigo-600' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img 
                    src={`${STRAPI_URL}${img.url}`} 
                    alt={title} 
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          
          {/* Main Image */}
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50">
            {activeImage ? (
              <img 
                src={`${STRAPI_URL}${activeImage}`} 
                alt={title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <span className="text-sm text-indigo-600 font-semibold uppercase tracking-wider">
              {category?.name || 'Uncategorized'}
            </span>
            <h1 className="mt-2 text-4xl font-extrabold text-gray-900 tracking-tight">
              {title}
            </h1>
          </div>

          <div className="flex items-end gap-4 mb-6">
            <span className="text-4xl font-bold text-gray-900">${sellingPrice}</span>
            {actualPrice && actualPrice > sellingPrice && (
              <span className="text-xl text-gray-400 line-through mb-1">${actualPrice}</span>
            )}
            {actualPrice && actualPrice > sellingPrice && (
              <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md mb-1 ml-2">
                Save ${actualPrice - sellingPrice}
              </span>
            )}
          </div>

          <div className="prose prose-lg text-gray-600 mb-8">
            <p>{description}</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center text-sm">
              {stock > 0 ? (
                <span className="flex items-center text-green-600 font-medium">
                  <FiCheck className="mr-1.5 w-5 h-5" /> In Stock ({stock} available)
                </span>
              ) : (
                <span className="text-red-500 font-medium">Out of Stock</span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto border-t border-gray-100 pt-8">
            <button 
              disabled={stock <= 0}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 px-8 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              onClick={() => console.log('Add to cart:', title)}
            >
              <FiShoppingCart className="w-5 h-5" />
              {stock > 0 ? 'Add to Cart' : 'Sold Out'}
            </button>
            <button 
              className="px-6 py-4 border-2 border-gray-200 hover:border-gray-300 rounded-xl text-gray-600 hover:text-red-500 transition-colors flex items-center justify-center bg-white shadow-sm hover:shadow-md"
              onClick={() => console.log('Add to wishlist:', title)}
            >
              <FiHeart className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
