'use strict';

/**
 * coupon controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::coupon.coupon', ({ strapi }) => ({
  /**
   * Validate a coupon
   */
  async validate(ctx) {
    try {
      const { data } = ctx.request.body;
      
      if (!data || !data.code || !data.cartTotal) {
        return ctx.badRequest('Missing required fields: code and cartTotal within data object.');
      }

      // Call custom service logic
      const result = await strapi
        .service('api::coupon.coupon')
        .validateCoupon(data.code, data.cartTotal);

      // Return standardized API response
      return ctx.send({ data: result });
    } catch (err) {
      // Differentiate between our explicit validation errors and other errors
      if (err.name === 'ValidationError' || err.name === 'NotFoundError') {
        return ctx.badRequest(err.message, { details: err.details });
      }

      // Fallback for unexpected errors
      strapi.log.error('Coupon validation error: ', err);
      return ctx.internalServerError('An error occurred during coupon validation.');
    }
  },
}));
