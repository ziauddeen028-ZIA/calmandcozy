import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import ProductGrid from '../components/ProductGrid';
import Loader from '../components/Loader';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products?populate=*');
        // Strapi v5 returns data inside response.data.data
        setProducts(response.data.data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Our Collection</h1>
        <p className="mt-4 text-lg text-gray-500">
          Discover our curated selection of premium products tailored for your lifestyle.
        </p>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="text-center text-red-500 py-12 text-lg">
          {error}
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </motion.div>
  );
}
