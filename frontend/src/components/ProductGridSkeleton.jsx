import ProductCardSkeleton from './ProductCardSkeleton';

/**
 * @param {number} count  – how many skeleton cards to render (default 8)
 */
export default function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
