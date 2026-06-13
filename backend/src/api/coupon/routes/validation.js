module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/coupons/validate',
      handler: 'coupon.validate',
      config: {
        auth: false, // Ensure public access if required, otherwise remove or set to true based on user permissions config.
      },
    },
  ],
};
