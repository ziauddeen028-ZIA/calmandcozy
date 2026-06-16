import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,   // 60 ms stagger between cards
      duration: 0.38,
      ease: 'easeOut',
    },
  }),
};

export default function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product, i) => (
        <motion.div
          key={product.id || product.documentId}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  );
}
