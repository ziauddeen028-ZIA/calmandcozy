'use strict';

const Razorpay = require('razorpay');

module.exports = {
  async createOrder(ctx) {
    try {
      const { amount } = ctx.request.body;

      if (!amount) {
        return ctx.badRequest('Amount is required');
      }

      const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: amount * 100, // amount in the smallest currency unit (paise)
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`,
      };

      const order = await instance.orders.create(options);

      return ctx.send({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      });
    } catch (error) {
      return ctx.internalServerError('Failed to create order', { error: error.message });
    }
  },
};
