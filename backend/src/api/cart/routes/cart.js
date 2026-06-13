'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/carts',
      handler: 'cart.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/carts',
      handler: 'cart.create',
      config: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/carts/:id',
      handler: 'cart.update',
      config: {
        auth: false,
      },
    },
    {
      method: 'DELETE',
      path: '/carts/:id',
      handler: 'cart.delete',
      config: {
        auth: false,
      },
    },
    {
      method: 'DELETE',
      path: '/carts/clear',
      handler: 'cart.clear',
      config: {
        auth: false,
      },
    },
  ],
};