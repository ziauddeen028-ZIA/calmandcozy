import React, { useState } from "react";
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
    rawSubtotal,
    totalSavings,
    bundleMessages,
    appliedBundles,
  } = useCart();

  const API_URL = import.meta.env.VITE_API_URL;

  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const handleUpdateQuantity = async (documentId, newQuantity) => {
    setUpdatingId(documentId);
    try {
      await updateQuantity(documentId, newQuantity);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (documentId) => {
    setRemovingId(documentId);
    try {
      await removeFromCart(documentId);
    } finally {
      setRemovingId(null);
    }
  };

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
            const imageUrl = item.previewImageUrl
            
              ? (
                item.previewImageUrl.startsWith("http")
                  ? item.previewImageUrl
                  : `${API_URL}${item.previewImageUrl}`
              )
              : product?.images?.[0]?.url
                ? (
                  product.images[0].url.startsWith("http")
                    ? product.images[0].url
                    : `${API_URL}${product.images[0].url}`
                )
                : "https://via.placeholder.com/300";
            console.log(item);
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
                      className="text-lg font-semibold text-gray-900 hover:text-brand-600 transition-colors font-satoshi"
                    >
                      {product.title}
                    </Link>
                    <span className="text-sm text-gray-500">
                      {product.category?.name || "Uncategorized"}
                    </span>

                    {/* Customizations / Variant details */}
                    {(item.variantSize || item.selectedColor || item.selectedSize || item.customText || item.uploadedImageUrl || item.previewImageUrl || item.backImageUrl || item.logoPosition || item.specialInstructions) && (
                      <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-md space-y-1">
                        {item.selectedColor && <p>Color: <span className="font-semibold">{item.selectedColor}</span></p>}
                        {/* variantSize takes priority; fall back to selectedSize */}
                        {(item.variantSize || item.selectedSize) && (
                          <p>Size: <span className="font-semibold">{item.variantSize || item.selectedSize}</span></p>
                        )}
                        {item.customText && <p>Text: <span className="font-semibold">{item.customText}</span></p>}
                        {item.previewImageUrl ? (
                          <div className="flex items-center gap-2 mt-1">
                            <span>Preview:</span>
                            <img
                              src={
                                item.previewImageUrl?.startsWith("http")
                                  ? item.previewImageUrl
                                  : `${API_URL}${item.previewImageUrl}`
                              }
                              alt="Preview"
                              className="h-12 w-12 object-contain rounded border border-gray-200 bg-white"
                            />
                          </div>
                        ) : item.uploadedImageUrl && (
                          <div className="flex items-center gap-2 mt-1">
                            <span>Image:</span>
                            <img
                              src={
                                item.uploadedImageUrl?.startsWith("http")
                                  ? item.uploadedImageUrl
                                  : `${API_URL}${item.uploadedImageUrl}`
                              }
                              alt="Custom"
                              className="h-8 w-8 object-cover rounded border border-gray-200 bg-white"
                            />
                          </div>
                        )}
                        {item.backImageUrl && (
                          <div className="flex items-center gap-2 mt-1">
                            <span>Back Image:</span>
                            <img
                              src={
                                item.backImageUrl?.startsWith("http")
                                  ? item.backImageUrl
                                  : `${API_URL}${item.backImageUrl}`
                              }
                              alt="Back Custom"
                              className="h-8 w-8 object-cover rounded border border-gray-200 bg-white"
                            />
                          </div>
                        )}
                        {item.logoPosition && <p>Logo Position: <span className="font-semibold">{item.logoPosition}</span></p>}
                        {item.specialInstructions && <p>Special Instructions: <span className="font-semibold">{item.specialInstructions}</span></p>}
                      </div>
                    )}

                    <span className="mt-2 text-lg font-bold text-gray-900 font-satoshi">
                      ₹{product.sellingPrice || product.price}
                    </span>
                  </div>

                  <div className="mt-4 sm:mt-0 flex items-center justify-between sm:flex-col sm:items-end gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.documentId, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updatingId === item.documentId || removingId === item.documentId}
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiMinus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center flex justify-center items-center text-sm font-semibold text-gray-900">
                        {updatingId === item.documentId ? (
                          <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.documentId, item.quantity + 1)}
                        disabled={updatingId === item.documentId || removingId === item.documentId}
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiPlus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.documentId)}
                      disabled={updatingId === item.documentId || removingId === item.documentId}
                      className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {removingId === item.documentId ? (
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <FiTrash2 className="h-4 w-4" />
                          <span>Remove</span>
                        </>
                      )}
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
                <span className={`${totalSavings > 0 ? 'line-through text-gray-400' : 'font-semibold text-gray-900'} font-satoshi`}>
                  ₹{(rawSubtotal || cartSubtotal).toFixed(2)}
                </span>
              </div>
              {totalSavings > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Bundle Savings</span>
                    <span className="font-semibold font-satoshi">
                      -₹{totalSavings.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-900 pt-2 border-t border-gray-100">
                    <span>New Subtotal</span>
                    <span className="font-semibold font-satoshi">
                      ₹{cartSubtotal.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span>Shipping estimate</span>
                <span className="font-semibold text-gray-900 font-satoshi">
                  {shippingEstimate === 0 ? "Free" : `₹${shippingEstimate.toFixed(2)}`}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-bold text-gray-900 font-satoshi">
                  <span>Grand Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {appliedBundles?.length > 0 && (
              <div className="mt-6 space-y-2">
                {appliedBundles.map((bundle, idx) => (
                  <div key={idx} className="text-xs font-medium text-green-700 bg-green-50 px-3 py-2 rounded-lg flex items-start gap-2">
                    <span className="mt-0.5">🎉</span>
                    <span>{bundle.message}</span>
                  </div>
                ))}
              </div>
            )}

            {bundleMessages?.length > 0 && (
              <div className="mt-4 space-y-2">
                {bundleMessages.map((msg, idx) => (
                  <div key={idx} className="text-xs font-medium text-brand-700 bg-brand-50 px-3 py-2 rounded-lg flex items-start gap-2">
                    <span className="mt-0.5">ℹ️</span>
                    <span>{msg}</span>
                  </div>
                ))}
              </div>
            )}

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
