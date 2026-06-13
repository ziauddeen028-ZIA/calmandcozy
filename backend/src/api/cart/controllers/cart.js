'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::cart.cart', ({ strapi }) => ({

    async find(ctx) {
        const supabaseId = ctx.request.headers['x-supabase-id'];

        if (!supabaseId) {
            return ctx.unauthorized('Missing X-Supabase-Id header');
        }

        console.log(`[Cart] Fetch Started — supabase_id: ${supabaseId}`);

        const customers = await strapi.entityService.findMany(
            'api::customer.customer',
            {
                filters: { supabase_id: supabaseId },
                limit: 1,
            }
        );

        if (!customers?.length) {
            return ctx.notFound('Customer not found');
        }

        const customer = customers[0];

        const carts = await strapi.entityService.findMany(
            'api::cart.cart',
            {
                filters: {
                    customer: {
                        id: customer.id,
                    },
                },
                populate: {
                    product: {
                        populate: {
                            images: true,
                            category: { fields: ['name', 'slug'] },
                        },
                        fields: ['title', 'sellingPrice', 'actualPrice', 'stock', 'customizable', 'customizationType', 'documentId', 'bundleOfferEnabled', 'bundleQty', 'bundlePrice', 'availableColors', 'availableSizes'],
                    },
                },
                sort: { createdAt: 'desc' },
            }
        );

        console.log(
            `[Cart] Fetch Success — ${carts.length} item(s)`
        );

        return { data: carts };
    },

    async create(ctx) {
        const supabaseId = ctx.request.headers['x-supabase-id'];

        if (!supabaseId) {
            return ctx.unauthorized('Missing X-Supabase-Id header');
        }

        const { data: body } = ctx.request.body || {};

        if (!body?.product) {
            return ctx.badRequest('Product is required');
        }

        const quantity = body.quantity || 1;

        const customers = await strapi.entityService.findMany(
            'api::customer.customer',
            {
                filters: { supabase_id: supabaseId },
                limit: 1,
            }
        );

        if (!customers?.length) {
            return ctx.notFound('Customer not found');
        }

        const customer = customers[0];

        const product = await strapi.documents(
            'api::product.product'
        ).findOne({
            documentId: body.product,
        });

        if (!product) {
            return ctx.badRequest('Product not found');
        }

        // Build duplicate-check filters.
        // For variant-based products, a different variantId means a separate cart item.
        const duplicateFilters = {
            customer: { id: customer.id },
            product: { id: product.id },
        };

        // If a variantId was supplied, scope the duplicate check to that variant
        if (body.variantId != null) {
            duplicateFilters.variantId = body.variantId;
        } else if (!body.selectedColor && !body.selectedSize && !body.customText) {
            // Plain product (no variant, no customisation) — treat as single slot
        }

        const existing = await strapi.entityService.findMany(
            'api::cart.cart',
            {
                filters: duplicateFilters,
                limit: 1,
            }
        );

        if (existing?.length) {
            // Update quantity of the matching cart item
            const cartItem = existing[0];
            const updated = await strapi.entityService.update(
                'api::cart.cart',
                cartItem.id,
                {
                    data: {
                        quantity: cartItem.quantity + quantity,

                        selectedColor: body.selectedColor || cartItem.selectedColor,
                        selectedSize: body.selectedSize || cartItem.selectedSize,
                        customText: body.customText || cartItem.customText,
                        uploadedImageUrl: body.uploadedImageUrl || cartItem.uploadedImageUrl,
                        previewImageUrl: body.previewImageUrl || cartItem.previewImageUrl,
                        previewImageId: body.previewImageId || cartItem.previewImageId,
                        variantId: body.variantId ?? cartItem.variantId,
                        variantSize: body.variantSize || cartItem.variantSize,
                        logoPosition: body.logoPosition || cartItem.logoPosition,
                        specialInstructions: body.specialInstructions || cartItem.specialInstructions,
                    },
                }
            );

            console.log(`[Cart] Updated Quantity — cart id: ${updated.id}`);
            return { data: updated };
        }

        const created = await strapi.entityService.create(
            'api::cart.cart',
            {
                data: {
                    customer: customer.id,
                    product: product.id,
                    quantity: quantity,

                    selectedColor: body.selectedColor || null,
                    selectedSize: body.selectedSize || null,
                    customText: body.customText || null,
                    uploadedImageUrl: body.uploadedImageUrl || null,
                    previewImageUrl: body.previewImageUrl || null,
                    previewImageId: body.previewImageId || null,
                    variantId: body.variantId ?? null,
                    variantSize: body.variantSize || null,
                    logoPosition: body.logoPosition || null,
                    specialInstructions: body.specialInstructions || null,
                },
            }
        );

        console.log(`[Cart] Add Success — cart id: ${created.id}`);

        return {
            data: created,
        };
    },

    async update(ctx) {
        const supabaseId = ctx.request.headers['x-supabase-id'];
        const { id: documentId } = ctx.params;
        const { data: body } = ctx.request.body || {};

        if (!supabaseId) {
            return ctx.unauthorized('Missing X-Supabase-Id header');
        }

        if (body?.quantity === undefined) {
            return ctx.badRequest('Quantity is required');
        }

        const cartItem = await strapi.documents('api::cart.cart').findOne({
            documentId,
            populate: ['customer'],
        });

        if (!cartItem) {
            return ctx.notFound('Cart item not found');
        }

        if (cartItem.customer?.supabase_id !== supabaseId) {
            return ctx.forbidden('You do not own this cart item');
        }

        const updated = await strapi.documents('api::cart.cart').update({
            documentId,
            data: {
                quantity: body.quantity,
            },
        });

        console.log(`[Cart] Update Success — documentId: ${documentId}`);

        return { data: updated };
    },

    async delete(ctx) {
        const supabaseId = ctx.request.headers['x-supabase-id'];
        const { id: documentId } = ctx.params;

        if (!supabaseId) {
            return ctx.unauthorized('Missing X-Supabase-Id header');
        }

        const cartItem = await strapi.documents('api::cart.cart').findOne({
            documentId,
            populate: ['customer'],
        });

        if (!cartItem) {
            return ctx.notFound('Cart item not found');
        }

        if (cartItem.customer?.supabase_id !== supabaseId) {
            return ctx.forbidden('You do not own this cart item');
        }

        await strapi.documents('api::cart.cart').delete({
            documentId,
        });

        console.log(`[Cart] Remove Success — documentId: ${documentId}`);

        return {
            data: { documentId },
        };
    },

    async clear(ctx) {
        const supabaseId = ctx.request.headers['x-supabase-id'];

        if (!supabaseId) {
            return ctx.unauthorized('Missing X-Supabase-Id header');
        }

        const customers = await strapi.entityService.findMany(
            'api::customer.customer',
            {
                filters: { supabase_id: supabaseId },
                limit: 1,
            }
        );

        if (!customers?.length) {
            return ctx.notFound('Customer not found');
        }

        const customer = customers[0];

        const carts = await strapi.entityService.findMany(
            'api::cart.cart',
            {
                filters: {
                    customer: { id: customer.id },
                },
            }
        );

        for (const item of carts) {
            await strapi.entityService.delete('api::cart.cart', item.id);
        }

        console.log(`[Cart] Clear Success — removed ${carts.length} item(s)`);

        return { data: { success: true } };
    }

}));
