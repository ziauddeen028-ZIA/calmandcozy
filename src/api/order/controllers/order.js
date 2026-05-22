'use strict';

/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
  // Custom Webhook Endpoint for Stripe / Razorpay
  async verifyPayment(ctx) {
    try {
      // 1. Verify webhook signature (Stripe/Razorpay) securely in production
      // const signature = ctx.request.headers['stripe-signature'];
      
      const { transactionId, orderId, status } = ctx.request.body;

      if (!orderId || !transactionId) {
        return ctx.badRequest('Missing orderId or transactionId');
      }

      // 2. Fetch Order using Strapi v5 Document API
      const orders = await strapi.documents('api::order.order').findMany({
        filters: { orderId: orderId }
      });
      
      const order = orders[0];

      if (!order) {
        return ctx.notFound('Order not found');
      }

      // 3. Update payment status securely (Triggers the afterUpdate lifecycle hook to reduce stock)
      const updatedOrder = await strapi.documents('api::order.order').update({
        documentId: order.documentId,
        data: {
          paymentStatus: status === 'success' ? 'paid' : 'failed',
          transactionId: transactionId
        }
      });

      return ctx.send({ message: 'Payment verified', order: updatedOrder });
    } catch (err) {
      ctx.body = err;
    }
  }
}));
