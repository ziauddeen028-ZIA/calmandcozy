module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/orders/verify-payment',
      handler: 'order.verifyPayment',
      config: {
        auth: false, // For production, secure this by verifying webhook signatures in the controller instead of JWT auth
      },
    },
  ],
};
