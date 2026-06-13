module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/payment/create-order',
      handler: 'payment.createOrder',
      config: {
        auth: false,
      },
    },
  ],
};
