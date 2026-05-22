'use strict';

const crypto = require('crypto');

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    // 1. Auto-generate unique secure orderId
    if (!data.orderId) {
      data.orderId = `ORD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    }

    // 2. Validate Stock & Strictly Recalculate Prices
    if (data.products && Array.isArray(data.products)) {
      let strictTotal = 0;

      for (const item of data.products) {
        // We assume item.productId corresponds to the Strapi v5 Document ID
        const product = await strapi.documents('api::product.product').findOne({
          documentId: item.productId,
          populate: ['variants']
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found.`);
        }

        let itemPrice = parseFloat(product.sellingPrice) || 0;
        let itemStock = parseInt(product.stock) || 0;
        let isVariant = false;

        // Check if a variant was ordered
        if (item.variant && (item.variant.size || item.variant.color)) {
          const variant = product.variants?.find(
            (v) => v.size === item.variant.size && v.color === item.variant.color
          );
          
          if (!variant) {
            throw new Error(`Variant not found for product ${product.title}`);
          }
          
          itemPrice = parseFloat(variant.price) || itemPrice;
          itemStock = parseInt(variant.stock) || 0;
          isVariant = true;
        }

        // Validate stock before order creation (Prevent Negative Inventory)
        if (itemStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.title}. Available: ${itemStock}`);
        }

        // Enforce Server-Side Pricing (Ignore Manipulated Frontend Prices)
        item.price = itemPrice;
        item.subtotal = itemPrice * item.quantity;
        strictTotal += item.subtotal;
      }

      // Override the total entirely with our securely calculated total
      data.total = strictTotal;
      // Re-assign products back to override manipulated frontend JSON
      data.products = data.products;
    }
  },

  async afterUpdate(event) {
    const { result } = event;

    // 3. Reduce stock ONLY after successful order/payment
    // Ensure we only deduct once using stockDeducted flag
    if (result.paymentStatus === 'paid' && result.stockDeducted === false) {
      
      const products = result.products;
      
      for (const item of products) {
        const product = await strapi.documents('api::product.product').findOne({
          documentId: item.productId,
          populate: ['variants']
        });

        if (!product) continue;

        let isVariant = false;
        let updatedVariants = product.variants || [];

        if (item.variant && (item.variant.size || item.variant.color)) {
          updatedVariants = updatedVariants.map(v => {
            if (v.size === item.variant.size && v.color === item.variant.color) {
              return { ...v, stock: Math.max(0, parseInt(v.stock) - item.quantity) };
            }
            return v;
          });
          isVariant = true;
        }

        // Determine new stock for main product
        const newProductStock = isVariant 
          ? product.stock // If it's a variant, keep master stock unchanged
          : Math.max(0, parseInt(product.stock) - item.quantity);

        // Update the product in the database
        await strapi.documents('api::product.product').update({
          documentId: product.documentId,
          data: {
            stock: newProductStock,
            variants: updatedVariants
          }
        });
      }

      // Mark order as stock deducted to prevent double-deduction
      await strapi.documents('api::order.order').update({
        documentId: result.documentId,
        data: {
          stockDeducted: true
        }
      });
    }
  }
};
