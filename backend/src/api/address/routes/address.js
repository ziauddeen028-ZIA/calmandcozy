'use strict';

/**
 * address router
 *
 * All routes are public (auth: false) because ownership is enforced
 * via the X-Supabase-Id request header inside the controller.
 * This avoids needing a Strapi API token on the frontend.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::address.address', {
  config: {
    find: {
      auth: false,
      policies: [],
      middlewares: [],
    },
    create: {
      auth: false,
      policies: [],
      middlewares: [],
    },
    update: {
      auth: false,
      policies: [],
      middlewares: [],
    },
    delete: {
      auth: false,
      policies: [],
      middlewares: [],
    },
  },
});
