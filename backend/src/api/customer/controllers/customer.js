'use strict';

/**
 * customer controller
 *
 * Extends the core controller with custom create logic to handle
 * duplicate supabase_id gracefully (returns existing record instead of erroring).
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::customer.customer', ({ strapi }) => ({
  /**
   * Override create to handle duplicate supabase_id.
   * If a customer with the same supabase_id already exists, return it instead of erroring.
   */
  async create(ctx) {
    const { supabase_id } = ctx.request.body?.data || {};

    if (supabase_id) {
      // Check if customer already exists
      const existing = await strapi.entityService.findMany('api::customer.customer', {
        filters: { supabase_id },
        limit: 1,
      });

      if (existing && existing.length > 0) {
        // Return existing customer (idempotent create)
        return { data: existing[0] };
      }
    }

    // Proceed with normal creation
    return await super.create(ctx);
  },
}));
