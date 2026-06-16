/**
 * ProductCardSkeleton
 * Matches the exact visual footprint of ProductCard so layout doesn't shift
 * when real products replace the skeletons.
 */
export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col border border-gray-100 shadow-sm">
      {/* Image placeholder */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <div className="absolute inset-0 skeleton-shimmer" />
      </div>

      {/* Info */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow gap-3">
        {/* Category */}
        <div className="h-3 w-20 rounded-full bg-gray-200 skeleton-shimmer" />

        {/* Title – two lines */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded-full bg-gray-200 skeleton-shimmer" />
          <div className="h-4 w-3/4 rounded-full bg-gray-200 skeleton-shimmer" />
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto">
          <div className="h-5 w-16 rounded-full bg-gray-200 skeleton-shimmer" />
          <div className="h-4 w-12 rounded-full bg-gray-100 skeleton-shimmer" />
        </div>

        {/* Button */}
        <div className="h-9 sm:h-10 w-full rounded-xl bg-gray-200 skeleton-shimmer" />
      </div>
    </div>
  );
}
