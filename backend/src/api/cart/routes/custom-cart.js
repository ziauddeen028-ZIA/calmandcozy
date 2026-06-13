module.exports = {
  routes: [
    {
      method: 'DELETE',
      path: '/cart-clear',
      handler: 'cart.clear',
      config: {
        auth: false,
      },
    },
  ],
};