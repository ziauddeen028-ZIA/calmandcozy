'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::address.address', ({ strapi }) => ({

  async find(ctx) {
    const supabaseId = ctx.request.headers['x-supabase-id'];

    if (!supabaseId) {
      return ctx.unauthorized('Missing X-Supabase-Id header');
    }

    console.log(`[Address] Fetch Started — supabase_id: ${supabaseId}`);

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

    const addresses = await strapi.entityService.findMany(
      'api::address.address',
      {
        filters: {
          customer: {
            id: customer.id,
          },
        },
        sort: { createdAt: 'desc' },
      }
    );

    console.log(
      `[Address] Fetch Success — ${addresses.length} address(es)`
    );

    return { data: addresses };
  },

  async create(ctx) {
    const supabaseId = ctx.request.headers['x-supabase-id'];

    if (!supabaseId) {
      return ctx.unauthorized('Missing X-Supabase-Id header');
    }

    const { data: body } = ctx.request.body || {};

    if (!body) {
      return ctx.badRequest('Request body is missing');
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

    if (body.is_default) {
      const defaults = await strapi.entityService.findMany(
        'api::address.address',
        {
          filters: {
            customer: { id: customer.id },
            is_default: true,
          },
        }
      );

      for (const addr of defaults) {
        await strapi.entityService.update(
          'api::address.address',
          addr.id,
          {
            data: {
              is_default: false,
            },
          }
        );
      }
    }

    const created = await strapi.entityService.create(
      'api::address.address',
      {
        data: {
          ...body,
          customer: customer.id,
        },
      }
    );

    console.log(
      `[Address] Create Success — address id: ${created.id}`
    );

    return { data: created };
  },

  async update(ctx) {
    const supabaseId = ctx.request.headers['x-supabase-id'];
    const { id: documentId } = ctx.params;

    if (!supabaseId) {
      return ctx.unauthorized('Missing X-Supabase-Id header');
    }

    console.log(
      `[Address] Update Started — documentId: ${documentId}`
    );

    const address = await strapi.documents(
      'api::address.address'
    ).findOne({
      documentId,
      populate: ['customer'],
    });

    if (!address) {
      return ctx.notFound('Address not found');
    }

    if (address.customer?.supabase_id !== supabaseId) {
      return ctx.forbidden('You do not own this address');
    }

    const { data: body } = ctx.request.body || {};

    if (body?.is_default) {
      const defaults = await strapi.entityService.findMany(
        'api::address.address',
        {
          filters: {
            customer: { id: address.customer.id },
            is_default: true,
          },
        }
      );

      for (const addr of defaults) {
        if (addr.documentId !== documentId) {
          await strapi.entityService.update(
            'api::address.address',
            addr.id,
            {
              data: {
                is_default: false,
              },
            }
          );
        }
      }
    }

    const updated = await strapi.documents(
      'api::address.address'
    ).update({
      documentId,
      data: body,
    });

    console.log(
      `[Address] Update Success — documentId: ${documentId}`
    );

    return { data: updated };
  },

  async delete(ctx) {
    const supabaseId = ctx.request.headers['x-supabase-id'];
    const { id: documentId } = ctx.params;

    if (!supabaseId) {
      return ctx.unauthorized('Missing X-Supabase-Id header');
    }

    console.log(
      `[Address] Delete Started — documentId: ${documentId}`
    );

    const address = await strapi.documents(
      'api::address.address'
    ).findOne({
      documentId,
      populate: ['customer'],
    });

    if (!address) {
      return ctx.notFound('Address not found');
    }

    if (address.customer?.supabase_id !== supabaseId) {
      return ctx.forbidden('You do not own this address');
    }

    await strapi.documents('api::address.address').delete({
      documentId,
    });

    console.log(
      `[Address] Delete Success — documentId: ${documentId}`
    );

    return {
      data: {
        documentId,
      },
    };
  },

}));