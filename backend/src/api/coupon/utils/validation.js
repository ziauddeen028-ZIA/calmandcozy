'use strict';

const { errors } = require('@strapi/utils');
const { ValidationError } = errors;

/**
 * Validates a coupon based on its properties and the order details
 * @param {Object} coupon - The coupon object from DB
 * @param {Number} cartTotal - The total amount of the cart
 * @throws {ValidationError} If the coupon is invalid
 */
const validateCouponRules = (coupon, cartTotal) => {
  if (!coupon) {
    throw new ValidationError('Coupon not found.');
  }

  if (!coupon.isActive) {
    throw new ValidationError('This coupon is no longer active.');
  }

  if (coupon.expiryDate) {
    const now = new Date();
    const expiry = new Date(coupon.expiryDate);
    if (now > expiry) {
      throw new ValidationError('This coupon has expired.');
    }
  }

  if (coupon.minOrderAmount && cartTotal < Number(coupon.minOrderAmount)) {
    throw new ValidationError(`This coupon requires a minimum order amount of ${coupon.minOrderAmount}.`);
  }

  return true;
};

/**
 * Calculates the discount amount and final total
 * @param {Object} coupon - The valid coupon object
 * @param {Number} cartTotal - The total amount of the cart
 * @returns {Object} { discountAmount, finalTotal }
 */
const calculateDiscount = (coupon, cartTotal) => {
  let discountAmount = 0;
  const value = Number(coupon.value);

  if (coupon.type === 'percentage') {
    discountAmount = cartTotal * (value / 100);
    
    // Apply max discount cap if it exists
    if (coupon.maxDiscountAmount) {
      const maxCap = Number(coupon.maxDiscountAmount);
      if (discountAmount > maxCap) {
        discountAmount = maxCap;
      }
    }
  } else if (coupon.type === 'fixed') {
    discountAmount = value;
  }

  // Prevent negative totals
  let finalTotal = cartTotal - discountAmount;
  if (finalTotal < 0) {
    discountAmount = cartTotal;
    finalTotal = 0;
  }

  return {
    // Format to 2 decimal places to avoid floating point issues
    discountAmount: Number(discountAmount.toFixed(2)),
    finalTotal: Number(finalTotal.toFixed(2)),
  };
};

module.exports = {
  validateCouponRules,
  calculateDiscount,
};
