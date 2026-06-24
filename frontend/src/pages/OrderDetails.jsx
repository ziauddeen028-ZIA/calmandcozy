import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiMapPin, FiCreditCard } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { fetchOrderById } from '../lib/orderService';

export default function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!user?.id || !id) return;
      try {
        setLoading(true);
        const data = await fetchOrderById(user.id, id);
        setOrder(data);
      } catch (err) {
        toast.error("Failed to load order details");
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [user?.id, id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!order) return null;


  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";

      case "confirmed":
        return "bg-blue-100 text-blue-800";

      case "processing":
        return "bg-purple-100 text-purple-800";

      case "shipped":
        return "bg-indigo-100 text-indigo-800";

      case "delivered":
        return "bg-green-100 text-green-800";

      case "cancelled":
        return "bg-red-100 text-red-800";

      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";

      case "pending":
        return "bg-yellow-100 text-yellow-800";

      case "failed":
        return "bg-red-100 text-red-800";

      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 sm:px-8 py-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Order ID</p>
              <p className="font-semibold text-gray-900">{order.orderId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total</p>
              <p className="font-bold text-gray-900">₹{order.total}</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Items in your order</h3>
          <div className="space-y-6">
            {order.orderItems?.map((item, idx) => (
              <div key={idx} className="flex gap-4 min-w-0">
                {item.previewImageUrl ? (
                  <img
                    src={
                      item.previewImageUrl?.startsWith("http")
                        ? item.previewImageUrl
                        : `${import.meta.env.VITE_API_URL}${item.previewImageUrl}`
                    }
                    alt={item.productName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-contain bg-white border border-gray-200"
                  />
                ) : item.productImage ? (
                  <img
                    src={
                      item.productImage?.startsWith("http")
                        ? item.productImage
                        : `${import.meta.env.VITE_API_URL}${item.productImage}`
                    }
                    alt={item.productName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
                    <FiPackage className="text-gray-400 h-6 w-6" />
                  </div>
                )}

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 line-clamp-2">{item.productName}</p>
                      {(item.selectedColor || item.selectedSize || item.customText || item.uploadedImageUrl || item.backImageUrl || item.logoPosition || item.specialInstructions) && (
                        <div className="mt-2 mb-1 text-xs text-gray-600 bg-gray-50 p-2 rounded-md space-y-1 inline-block">
                          {item.selectedColor && <p>Color: <span className="font-semibold">{item.selectedColor}</span></p>}
                          {item.selectedSize && <p>Size: <span className="font-semibold">{item.selectedSize}</span></p>}
                          {item.customText && <p>Text: <span className="font-semibold">{item.customText}</span></p>}
                          {item.uploadedImageUrl && (
                            <div className="flex items-center gap-2 mt-1">
                              <span>Image:</span>
                              <img
                                src={
                                  item.uploadedImageUrl.startsWith("http")
                                    ? item.uploadedImageUrl
                                    : `${import.meta.env.VITE_API_URL}${item.uploadedImageUrl}`
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
                                  item.backImageUrl.startsWith("http")
                                    ? item.backImageUrl
                                    : `${import.meta.env.VITE_API_URL}${item.backImageUrl}`
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
                      <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">₹{item.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiMapPin className="text-brand-600" />
            Shipping Address
          </h3>
          {order.shippingAddress ? (
            <div className="text-gray-600 space-y-1">
              <p className="font-semibold text-gray-900">{order.shippingAddress.full_name}</p>
              <p>{order.shippingAddress.address_line_1}</p>
              {order.shippingAddress.address_line_2 && <p>{order.shippingAddress.address_line_2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="pt-2 font-medium">📞 {order.shippingAddress.phone}</p>
            </div>
          ) : (
            <p className="text-gray-500">Address details not available.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiCreditCard className="text-brand-600" />
            Order Status
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Payment Method</p>
              <span className="font-medium text-gray-900 uppercase">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</span>
            </div>
            {order.paymentMethod === 'cod' && (
              <>
                <div>
                  <p className="text-sm text-gray-500 mb-1">COD Advance Paid</p>
                  <p className="font-medium text-green-600">₹{order.codAdvanceAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Balance Due on Delivery</p>
                  <p className="font-bold text-brand-600">₹{order.balanceDueOnDelivery}</p>
                </div>
              </>
            )}
            <div>
              <p className="text-sm text-gray-500 mb-1">Payment Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getPaymentStatusColor(order.paymentStatus)}`}
              >
                {order.paymentStatus}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Order Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getOrderStatusColor(order.orderStatus)}`}
              >
                {order.orderStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
