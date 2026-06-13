'use strict';

/**
 * customer router
 *
 * Custom routes that allow:
 * - find (GET /api/customers) — public, used to check if a customer exists by supabase_id
 * - create (POST /api/customers) — public, used to create a new customer after signup
 *
 * All other operations (findOne, update, delete) require authentication.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::customer.customer', {
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
  },
});
