import React from "react";
import { Link } from "react-router-dom";
import { FiTrash2, FiMinus, FiPlus, FiArrowRight } from "react-icons/fi";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const {
    cartItems,
    loading,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotalItems,
    cartSubtotal,
  } = useCart();

  const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || "http://localhost:1337";

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-16 text-center">
        <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-brand-50 text-brand-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-12 w-12"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
        </div>
        <h2 className="mb-4 text-3xl font-bold text-gray-900">
          Your cart is empty
        </h2>
        <p className="mb-8 text-gray-500">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
        >
          Start Shopping
          <FiArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  const shippingEstimate = 0; // Or whatever dummy fee we want. Requirement says equal to subtotal for now.
  const grandTotal = cartSubtotal + shippingEstimate;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-sm font-medium text-red-500 hover:text-red-600 underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => {
            const product = item.product;
            const imageUrl = product?.images?.[0]?.url
              ? `${STRAPI_URL}${product.images[0].url}`
              : "https://via.placeholder.com/300";

            return (
              <div
                key={item.documentId}
                className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <Link to={`/product/${product.documentId}`} className="shrink-0">
                  <img
                    src={imageUrl}
                    alt={product.title}
                    className="h-28 w-28 rounded-xl object-cover bg-gray-50"
                  />
                </Link>

                <div className="flex flex-1 flex-col sm:flex-row justify-between w-full">
                  <div className="flex flex-col gap-1">
                    <Link
                      to={`/product/${product.documentId}`}
                      className="text-lg font-semibold text-gray-900 hover:text-brand-600 transition-colors"
                    >
                      {product.title}
                    </Link>
                    <span className="text-sm text-gray-500">
                      {product.category?.name || "Uncategorized"}
                    </span>
                    <span className="mt-2 text-lg font-bold text-gray-900">
                      ₹{product.sellingPrice || product.price}
                    </span>
                  </div>

                  <div className="mt-4 sm:mt-0 flex items-center justify-between sm:flex-col sm:items-end gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1">
                      <button
                        onClick={() => updateQuantity(item.documentId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:bg-gray-100 disabled:opacity-50 transition-colors"
                      >
                        <FiMinus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center text-sm font-semibold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.documentId, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:bg-gray-100 transition-colors"
                      >
                        <FiPlus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.documentId)}
                      className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                    >
                      <FiTrash2 className="h-4 w-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Order Summary
            </h2>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span className="font-semibold text-gray-900">
                  {cartTotalItems}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">
                  ₹{cartSubtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping estimate</span>
                <span className="font-semibold text-gray-900">
                  {shippingEstimate === 0 ? "Free" : `₹${shippingEstimate.toFixed(2)}`}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                  <span>Grand Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Link
              to="/checkout"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-4 text-base font-semibold text-white shadow-sm hover:bg-brand-700 transition-all"
            >
              Proceed to Checkout
              <FiArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
