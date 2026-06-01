import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPackage, FiHome } from 'react-icons/fi';

export default function OrderSuccess() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container mx-auto max-w-4xl px-4 py-16 sm:py-24"
    >
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
        <div className="mx-auto mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-500">
          <FiCheckCircle className="h-12 w-12" />
        </div>
        
        <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
          Order placed successfully!
        </h1>
        
        <p className="mx-auto mb-10 max-w-xl text-lg text-gray-600">
          Thank you for shopping with Calm & Cozy. We've received your order and will begin processing it right away.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/orders"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
          >
            <FiPackage className="h-5 w-5" />
            View My Orders
          </Link>
          
          <Link
            to="/"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <FiHome className="h-5 w-5" />
            Return Home
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
