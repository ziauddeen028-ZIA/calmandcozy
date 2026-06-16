import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product, wishlistDocumentId) => {
    const success = addToCart(product.documentId, 1);
    if (success) {
      removeFromWishlist(wishlistDocumentId);
    }
  };

  const handleRemove = (wishlistDocumentId) => {
    removeFromWishlist(wishlistDocumentId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">
        My Wishlist
      </h1>

      {wishlist.length === 0 ? (
        <div className="rounded-xl border p-10 text-center">
          <p>Your wishlist is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {wishlist.map((item) => {
            const product = item.product;
            const API_URL = import.meta.env.VITE_API_URL;
            const imageUrl = product?.images?.[0]?.url
              ? (
                product.images[0].url.startsWith("http")
                  ? product.images[0].url
                  : `${API_URL}${product.images[0].url}`
              )
              : "https://via.placeholder.com/300";

            return (
              <div
                key={item.documentId}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <img
                  src={imageUrl}
                  alt={product?.title}
                  className="h-64 w-full object-cover"
                />

                <div className="p-4 flex flex-col flex-grow">
                  <Link to={`/product/${product.documentId}`}>
                    <h3 className="line-clamp-2 text-lg font-semibold hover:text-brand-600 transition-colors font-satoshi">
                      {product?.title}
                    </h3>
                  </Link>

                  <div className="mt-2 mb-4 flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900 font-satoshi">
                      ₹{product?.sellingPrice || product?.price}
                    </span>
                  </div>

                  <div className="mt-auto grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleAddToCart(product, item.documentId)}
                      className="col-span-3 flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-white font-medium hover:bg-brand-600 transition-colors"
                    >
                      <FiShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(item.documentId)}
                      className="col-span-1 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove from Wishlist"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;