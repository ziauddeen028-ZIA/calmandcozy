import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiCheck, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { fetchAddresses } from '../lib/addressService';
import { createOrder } from '../lib/orderService';
import { createPaymentOrder } from '../lib/paymentService';
import html2canvas from 'html2canvas';
import api from '../lib/api';
import { FiCheckCircle } from 'react-icons/fi';

export default function Checkout() {
  const { user } = useAuth();
  const { cartItems, loading: cartLoading, cartTotalItems, cartSubtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [codAdvanceAmount, setCodAdvanceAmount] = useState(60);
  const [paymentMethod, setPaymentMethod] = useState('online');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function loadStoreSettings() {
      try {
        const res = await api.get('/store-setting');
        if (res.data?.data?.codAdvanceAmount) {
          setCodAdvanceAmount(res.data.data.codAdvanceAmount);
        }
      } catch (error) {
        console.error("Failed to load store settings", error);
      }
    }
    loadStoreSettings();
  }, []);

  useEffect(() => {
    async function loadAddresses() {
      if (!user?.id) return;
      try {
        setAddressesLoading(true);
        const data = await fetchAddresses(user.id);
        setAddresses(data);

        // Auto-select default address, or the first one if no default exists
        if (data && data.length > 0) {
          const defaultAddr = data.find(a => a.is_default);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.documentId || defaultAddr.id);
          } else {
            setSelectedAddressId(data[0].documentId || data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to load addresses", error);
        toast.error("Could not load addresses.");
      } finally {
        setAddressesLoading(false);
      }
    }

    loadAddresses();
  }, [user?.id]);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const selectedAddr = addresses.find((a) => (a.documentId || a.id) === selectedAddressId);
      const shippingEstimate = 0;
      const totalAmount = cartSubtotal + shippingEstimate;

      const isCod = paymentMethod === 'cod';
      const amountToPay = isCod ? codAdvanceAmount : totalAmount;
      const balanceDue = isCod ? (totalAmount - codAdvanceAmount) : 0;

      // 1. Create Razorpay order from backend
      const paymentOrder = await createPaymentOrder(user.id, amountToPay);

      // 2. Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency || "INR",
        name: "Calm & Cozy",
        description: "Order Payment",
        order_id: paymentOrder.id || paymentOrder.orderId || paymentOrder.order_id,
        handler: async function (response) {
          try {
            // Payment successful, now create the Strapi order
            const helperGetImageUrl = (url) => {
              if (!url) return "";
              return url.startsWith("http") ? url : `${API_URL}${url}`;
            };

            const captureMockup = async (containerDOM) => {
              // Hide it visually
              containerDOM.style.position = 'absolute';
              containerDOM.style.top = '-9999px';
              containerDOM.style.left = '-9999px';
              containerDOM.style.zIndex = '-9999';
              document.body.appendChild(containerDOM);

              // Wait for all dynamically appended images to load
              const imgs = Array.from(containerDOM.querySelectorAll('img'));
              await Promise.all(imgs.map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise((resolve) => {
                  img.onload = resolve;
                  img.onerror = resolve; // Continue even if one fails
                });
              }));

              try {
                const canvas = await html2canvas(containerDOM, {
                  useCORS: true,
                  backgroundColor: '#f9fafb',
                  ignoreElements: (node) => {
                    // This explicitly ignores any style/link tags preventing Tailwind oklch parsing errors
                    return node.tagName === 'STYLE' || node.tagName === 'LINK';
                  }
                });
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                const formData = new FormData();
                formData.append('files', blob, 'mockup.png');
                const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                return res.data[0].url;
              } finally {
                if (document.body.contains(containerDOM)) {
                  document.body.removeChild(containerDOM);
                }
              }
            };

            const orderItems = await Promise.all(cartItems.map(async (item) => {
              let frontMockupUrl = null;
              let backMockupUrl = null;

              if (item.product?.customizable && item.product?.customizationType === 't-shirt') {
                const variant = item.product.colorVariants?.find(
                  v => v.colorName?.trim().toLowerCase() === item.selectedColor?.trim().toLowerCase()
                );
                const frontImgUrl = helperGetImageUrl(variant?.frontImage?.url || item.product.images?.[0]?.url);
                const backImgUrl = helperGetImageUrl(variant?.backImage?.url);

                // --- FRONT MOCKUP ---
                const frontContainer = document.createElement('div');
                frontContainer.style.cssText = 'width: 800px; height: 800px; background-color: #f9fafb; position: relative; display: flex; align-items: center; justify-content: center;';

                if (frontImgUrl) {
                  const baseImg = document.createElement('img');
                  baseImg.crossOrigin = 'anonymous';
                  baseImg.src = frontImgUrl;
                  baseImg.style.cssText = 'width: 100%; height: 100%; object-fit: contain;';
                  frontContainer.appendChild(baseImg);
                }

                if (item.uploadedImageUrl || item.customText) {
                  const overlay = document.createElement('div');
                  overlay.style.cssText = 'position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center;';

                  if (item.logoPosition === 'Left Chest') {
                    overlay.style.cssText += 'top: 30%; left: 52%; width: 9%; height: 9%;';
                  } else if (item.logoPosition === 'Right Chest') {
                    overlay.style.cssText += 'top: 30%; left: 40%; width: 9%; height: 9%;';
                  } else {
                    overlay.style.cssText += 'top: 30%; left: 35%; width: 30%; height: 30%;';
                  }

                  if (item.uploadedImageUrl) {
                    const logoImg = document.createElement('img');
                    logoImg.crossOrigin = 'anonymous';
                    logoImg.src = helperGetImageUrl(item.uploadedImageUrl);
                    logoImg.style.cssText = 'width: 100%; height: 100%; object-fit: contain;';
                    overlay.appendChild(logoImg);
                  }
                  if (item.customText) {
                    const textSpan = document.createElement('span');
                    textSpan.innerText = item.customText;
                    textSpan.style.cssText = 'color: #111827; font-size: 24px; font-weight: 900; margin-top: 4px;';
                    overlay.appendChild(textSpan);
                  }
                  frontContainer.appendChild(overlay);
                }

                try {
                  frontMockupUrl = await captureMockup(frontContainer);
                } catch (e) { console.error('Front mockup failed:', e); }

                // --- BACK MOCKUP ---
                const backContainer = document.createElement('div');
                backContainer.style.cssText = 'width: 800px; height: 800px; background-color: #f9fafb; position: relative; display: flex; align-items: center; justify-content: center;';

                if (backImgUrl) {
                  const baseImg = document.createElement('img');
                  baseImg.crossOrigin = 'anonymous';
                  baseImg.src = backImgUrl;
                  baseImg.style.cssText = 'width: 100%; height: 100%; object-fit: contain;';
                  backContainer.appendChild(baseImg);
                }

                if (item.backImageUrl) {
                  const overlay = document.createElement('div');
                  overlay.style.cssText = 'position: absolute; top: 25%; left: 25%; width: 50%; height: 50%; display: flex; align-items: center; justify-content: center;';

                  const logoImg = document.createElement('img');
                  logoImg.crossOrigin = 'anonymous';
                  logoImg.src = helperGetImageUrl(item.backImageUrl);
                  logoImg.style.cssText = 'max-width: 100%; max-height: 100%; object-fit: contain;';
                  overlay.appendChild(logoImg);

                  backContainer.appendChild(overlay);
                }

                try {
                  backMockupUrl = await captureMockup(backContainer);
                } catch (e) { console.error('Back mockup failed:', e); }
              }

              return {
                productId: item.product.documentId,
                productName: item.product.title,
                productImage: item.product.images?.[0]?.url || '',
                quantity: item.quantity,
                price: item.product.sellingPrice || item.product.price,
                selectedColor: item.selectedColor,
                selectedSize: item.selectedSize,
                customText: item.customText,
                uploadedImageUrl: item.uploadedImageUrl || null,
                backImageUrl: item.backImageUrl || null,
                previewImageUrl: item.previewImageUrl || null,

                frontPreviewImageUrl:
                  item.previewImageUrl || item.uploadedImageUrl || null,

                backPreviewImageUrl:
                  item.backImageUrl || null,

                frontMockupUrl: frontMockupUrl,
                backMockupUrl: backMockupUrl,

                logoPosition: item.logoPosition || null,
                specialInstructions: item.specialInstructions || null,
              };
            }));

            const orderData = {
              orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              userName: user.user_metadata?.full_name || user.email.split('@')[0],
              email: user.email,
              phone: selectedAddr.phone,
              total: totalAmount,
              paymentMethod: paymentMethod,
              codAdvanceAmount: isCod ? codAdvanceAmount : 0,
              balanceDueOnDelivery: balanceDue,
              paymentStatus: 'paid',
              transactionId: response.razorpay_payment_id,
              orderStatus: 'pending',
              shippingAddress: selectedAddr,
              orderItems: orderItems
            };

            await createOrder(user.id, orderData);

            try {
              await clearCart();
            } catch (err) {
              console.error("Cart clear failed:", err);
            }

            toast.success("Payment successful! Order placed.");
            navigate('/order-success');
          } catch (error) {
            console.error("Failed to save order:", error);
            toast.error("Payment received, but failed to save order. Please contact support.");
            setIsPlacingOrder(false);
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || user.email.split('@')[0],
          email: user.email,
          contact: selectedAddr.phone,
        },
        theme: {
          color: "#0f766e" // Matches brand-600
        },
        modal: {
          ondismiss: function () {
            setIsPlacingOrder(false);
            toast.error("Payment cancelled");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setIsPlacingOrder(false);
        toast.error(response.error.description || "Payment failed. Please try again.");
      });
      rzp.open();

    } catch (error) {
      console.error("Failed to initiate payment:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setIsPlacingOrder(false);
    }
  };

  if (cartLoading || addressesLoading) {
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
          <FiShoppingBag className="h-12 w-12" />
        </div>
        <h2 className="mb-4 text-3xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="mb-8 text-gray-500">Add some items to your cart to proceed with checkout.</p>
        <Link
          to="/shop"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const shippingEstimate = 0;
  const grandTotal = cartSubtotal + shippingEstimate;
  const isCod = paymentMethod === 'cod';
  const amountToPay = isCod ? codAdvanceAmount : grandTotal;
  const balanceDue = isCod ? (grandTotal - codAdvanceAmount) : 0;

  const getImageUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${API_URL}${url}`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="container mx-auto max-w-6xl px-4 py-8"
      >
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/cart')}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Address Selection */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiMapPin className="text-brand-600" />
                Delivery Address
              </h2>

              {addresses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500 mb-4">No saved addresses found.</p>
                  <Link
                    to="/addresses"
                    className="inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700"
                    state={{ returnToCheckout: true }}
                  >
                    Add a new address
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => {
                    const addrId = addr.documentId || addr.id;
                    const isSelected = selectedAddressId === addrId;

                    return (
                      <div
                        key={addrId}
                        onClick={() => setSelectedAddressId(addrId)}
                        className={`relative cursor-pointer rounded-xl border p-5 transition-all ${isSelected
                          ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500 shadow-sm'
                          : 'border-gray-200 hover:border-brand-300 bg-white'
                          }`}
                      >
                        {isSelected && (
                          <div className="absolute top-4 right-4 text-brand-600">
                            <FiCheck className="h-5 w-5" />
                          </div>
                        )}

                        <p className="font-semibold text-gray-900 mb-1 pr-8">{addr.full_name}</p>
                        <p className="text-sm text-gray-600">{addr.address_line_1}</p>
                        {addr.address_line_2 && <p className="text-sm text-gray-600">{addr.address_line_2}</p>}
                        <p className="text-sm text-gray-600">
                          {addr.city}, {addr.state} — {addr.pincode}
                        </p>
                        <p className="text-sm text-gray-600 mt-2 font-medium">📞 {addr.phone}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {addresses.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link
                    to="/addresses"
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                    state={{ returnToCheckout: true }}
                  >
                    + Add or manage addresses
                  </Link>
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                Payment Method
              </h2>
              <div className="space-y-4">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="h-4 w-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                  />
                  <span className="ml-3 font-medium text-gray-900">Online Payment</span>
                </label>
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="h-4 w-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                  />
                  <div className="ml-3">
                    <span className="block font-medium text-gray-900">Cash on Delivery</span>
                    <span className="block text-sm text-gray-500 mt-1">Pay ₹{codAdvanceAmount} now as advance, pay balance on delivery.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Order Summary</h2>

              {/* Cart Items Preview */}
              <div className="mb-6 space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => {
                  console.log(item);
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

                  return (
                    <div key={item.documentId} className="flex gap-4">
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="h-16 w-16 rounded-lg object-cover bg-white border border-gray-100"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1 font-satoshi">{product.title}</p>
                        {(item.selectedColor || item.selectedSize || item.customText) && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {[item.selectedColor, item.selectedSize, item.customText].filter(Boolean).join(' | ')}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium text-gray-900 mt-1 font-satoshi">
                          ₹{(product.sellingPrice || product.price) * item.quantity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pricing Summary */}
              <div className="space-y-3 text-sm text-gray-600 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span>TotalItems ({cartTotalItems})</span>
                  <span className="font-medium text-gray-900 font-satoshi">₹{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-900 font-satoshi">
                    {shippingEstimate === 0 ? "Free" : `₹${shippingEstimate.toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg font-bold text-gray-900 font-satoshi mb-2">
                    <span>Grand Total</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                  {isCod && (
                    <>
                      <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                        <span>COD Advance to Pay Now</span>
                        <span>₹{amountToPay.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-medium text-brand-600 mt-1">
                        <span>Balance Due on Delivery</span>
                        <span>₹{balanceDue.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!selectedAddressId || isPlacingOrder}
                className={`mt-8 w-full rounded-xl px-6 py-4 text-base font-semibold shadow-sm transition-all flex items-center justify-center gap-2
    ${(!selectedAddressId || isPlacingOrder)
                    ? 'bg-brand-400 text-white cursor-not-allowed'
                    : 'bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98]'
                  }
  `}
              >
                {isPlacingOrder ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiCheckCircle className="mr-2 h-5 w-5" />
                    Place Order (Pay ₹{amountToPay.toFixed(2)})
                  </>
                )}
              </button>

              {!selectedAddressId && addresses.length > 0 && (
                <p className="mt-3 text-sm text-red-500 text-center flex items-center justify-center gap-1">
                  Select a delivery address to proceed
                </p>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </>
  );
}
