'use strict';

/**
 * coupon service
 */

const { createCoreService } = require('@strapi/strapi').factories;
const { validateCouponRules, calculateDiscount } = require('../utils/validation');
const { errors } = require('@strapi/utils');
const { NotFoundError } = errors;

module.exports = createCoreService('api::coupon.coupon', ({ strapi }) => ({
  /**
   * Custom service to validate a coupon and calculate its discount
   * @param {string} code - The coupon code to validate
   * @param {number} cartTotal - The cart total
   */
  async validateCoupon(code, cartTotal) {
    // Ensure inputs are valid before querying the DB
    if (!code || typeof code !== 'string') {
      throw new NotFoundError('Coupon code is missing or invalid.');
    }
    
    const parsedTotal = Number(cartTotal);
    if (isNaN(parsedTotal) || parsedTotal < 0) {
      throw new Error('Invalid cart total provided.');
    }

    // Find the coupon by its unique code
    const coupons = await strapi.entityService.findMany('api::coupon.coupon', {
      filters: { code: code.trim().toUpperCase() },
      limit: 1,
    });

    const coupon = coupons[0];

    // validateCouponRules will throw ValidationError if invalid
    validateCouponRules(coupon, parsedTotal);

    // If we reach here, it's valid. Now calculate the discount.
    const { discountAmount, finalTotal } = calculateDiscount(coupon, parsedTotal);

    return {
      originalTotal: parsedTotal,
      discountAmount,
      finalTotal,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        maxDiscountAmount: coupon.maxDiscountAmount || null,
      },
    };
  },
}));
