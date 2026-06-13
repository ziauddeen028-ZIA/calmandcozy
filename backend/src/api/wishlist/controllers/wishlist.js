'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::wishlist.wishlist', ({ strapi }) => ({

    async find(ctx) {
        const supabaseId = ctx.request.headers['x-supabase-id'];

        if (!supabaseId) {
            return ctx.unauthorized('Missing X-Supabase-Id header');
        }

        console.log(`[Wishlist] Fetch Started — supabase_id: ${supabaseId}`);

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

  const wishlists = await strapi.entityService.findMany(
  'api::wishlist.wishlist',
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
        fields: ['title', 'sellingPrice', 'actualPrice', 'stock', 'documentId'],
      },
    },
    sort: { createdAt: 'desc' },
  }
);

        console.log(
            `[Wishlist] Fetch Success — ${wishlists.length} item(s)`
        );

        return { data: wishlists };
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

        console.log(
            '[Wishlist] Product Received:',
            body.product
        );

        const product = await strapi.documents(
            'api::product.product'
        ).findOne({
            documentId: body.product,
        });

        console.log(
            '[Wishlist] Product Found:',
            product
        );

        if (!product) {
            return ctx.badRequest('Product not found');
        }

        // Prevent duplicates
        const existing = await strapi.entityService.findMany(
            'api::wishlist.wishlist',
            {
                filters: {
                    customer: {
                        id: customer.id,
                    },
                    product: {
                        id: product.id,
                    },
                },
                limit: 1,
            }
        );

        if (existing?.length) {
            console.log(
                '[Wishlist] Already Exists'
            );

            return {
                data: existing[0],
                message: 'Already in wishlist',
            };
        }

        const created = await strapi.entityService.create(
            'api::wishlist.wishlist',
            {
                data: {
                    customer: customer.id,
                    product: product.id,
                },
                populate: {
                    product: {
                        populate: { images: true },
                        fields: ['title', 'sellingPrice', 'actualPrice', 'stock', 'documentId'],
                    },
                },
            }
        );

        console.log(
            `[Wishlist] Add Success — wishlist id: ${created.id}`
        );

        return {
            data: created,
        };
    },

    async delete(ctx) {
        const supabaseId = ctx.request.headers['x-supabase-id'];
        const { id: documentId } = ctx.params;

        if (!supabaseId) {
            return ctx.unauthorized('Missing X-Supabase-Id header');
        }

        console.log(
            `[Wishlist] Delete Started — documentId: ${documentId}`
        );

        const wishlist = await strapi.documents(
            'api::wishlist.wishlist'
        ).findOne({
            documentId,
            populate: ['customer'],
        });

        if (!wishlist) {
            return ctx.notFound('Wishlist item not found');
        }

        if (wishlist.customer?.supabase_id !== supabaseId) {
            return ctx.forbidden(
                'You do not own this wishlist item'
            );
        }

        await strapi.documents('api::wishlist.wishlist').delete({
            documentId,
        });

        console.log(
            `[Wishlist] Remove Success — documentId: ${documentId}`
        );

        return {
            data: {
                documentId,
            },
        };
    },

}));