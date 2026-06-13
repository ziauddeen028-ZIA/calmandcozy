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
    // if (data.orderItems && Array.isArray(data.orderItems)) {
    //   let strictTotal = 0;

    //   for (const item of data.orderItems) {
    //     console.log("ORDER ITEM:", item);
    //     // We assume item.productId corresponds to the Strapi v5 Document ID
    //     const product = await strapi.documents('api::product.product').findOne({
    //       documentId: item.productId,
    //       populate: ['variants']
    //     });

    //     if (!product) {
    //       console.log("Missing productId:", item);
    //       throw new Error(`Product with ID ${item.productId} not found.`);
    //     }

    //     let itemPrice = parseFloat(product.sellingPrice) || 0;
    //     let itemStock = parseInt(product.stock) || 0;
    //     let isVariant = false;

    //     // Check if a variant was ordered
    //     if (item.variant && (item.variant.size || item.variant.color)) {
    //       const variant = product.variants?.find(
    //         (v) => v.size === item.variant.size && v.color === item.variant.color
    //       );

    //       if (!variant) {
    //         throw new Error(`Variant not found for product ${product.title}`);
    //       }

    //       itemPrice = parseFloat(variant.price) || itemPrice;
    //       itemStock = parseInt(variant.stock) || 0;
    //       isVariant = true;
    //     }

    //     // Validate stock before order creation (Prevent Negative Inventory)
    //     if (itemStock < item.quantity) {
    //       throw new Error(`Insufficient stock for ${product.title}. Available: ${itemStock}`);
    //     }

    //     // Enforce Server-Side Pricing (Ignore Manipulated Frontend Prices)
    //     item.price = itemPrice;
    //     item.subtotal = itemPrice * item.quantity;
    //     strictTotal += item.subtotal;
    //   }

    //   // Override the total entirely with our securely calculated total
    //   data.total = strictTotal;
    //   // Re-assign orderItems back to override manipulated frontend JSON
    //   data.orderItems = data.orderItems;
    // }
  },

  async afterCreate(event) {
    const { result } = event;

    // Send emails on order creation if payment is successful
    if (result.paymentStatus === 'paid' && result.emailSent === false) {
      try {
        const emailService = strapi.service('api::order.email');
        if (emailService) {
          const fullOrder = await strapi.documents('api::order.order').findOne({
            documentId: result.documentId,
            populate: ['orderItems']
          });
          console.log(
            "FULL ORDER EMAIL DATA:",
            JSON.stringify(fullOrder, null, 2)
          );
          console.log(
            'FULL ORDER:',
            JSON.stringify(fullOrder, null, 2)
          );
          setImmediate(async () => {
            try {
              await emailService.sendCustomerOrderConfirmation(fullOrder);
              await emailService.sendAdminNewOrderNotification(fullOrder);

              await strapi.documents('api::order.order').update({
                documentId: result.documentId,
                data: { emailSent: true }
              });
            } catch (err) {
              strapi.log.error('Background email failed:', err);
            }
          });
        }
      } catch (err) {
        strapi.log.error('Failed to send order emails on afterCreate:', err);
      }
    }
  },

  async afterUpdate(event) {
    const { result } = event;

    // Handle sending emails if payment status is updated to paid
    if (result.paymentStatus === 'paid' && result.emailSent === false) {
      try {
        const emailService = strapi.service('api::order.email');
        if (emailService) {
          const fullOrder = await strapi.documents('api::order.order').findOne({
            documentId: result.documentId,
            populate: ['orderItems']
          });
          console.log(
            "FULL ORDER EMAIL DATA:",
            JSON.stringify(fullOrder, null, 2)
          );
          console.log(
            'FULL ORDER:',
            JSON.stringify(fullOrder, null, 2)
          );
          setImmediate(async () => {
            try {
              await emailService.sendCustomerOrderConfirmation(fullOrder);
              await emailService.sendAdminNewOrderNotification(fullOrder);

              await strapi.documents('api::order.order').update({
                documentId: result.documentId,
                data: { emailSent: true }
              });
            } catch (err) {
              strapi.log.error('Background email failed:', err);
            }
          });
        }
      } catch (err) {
        strapi.log.error('Failed to send order emails on afterUpdate:', err);
      }
    }

    // 3. Reduce stock ONLY after successful order/payment
    // Ensure we only deduct once using stockDeducted flag
    if (
      result.paymentStatus !== 'paid' ||
      result.stockDeducted === true
    ) {
      return;
    }

    const order = await strapi.documents('api::order.order').findOne({
      documentId: result.documentId,
      populate: ['orderItems']
    });

    const items = Array.isArray(order.orderItems)
      ? order.orderItems
      : [];

    for (const item of items) {
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

};
