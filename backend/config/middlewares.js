module.exports = ({ env }) => [
  'strapi::logger',
  'strapi::errors',

  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'res.cloudinary.com',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'res.cloudinary.com',
          ],
        },
      },
    },
  },

  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:5174', env('FRONTEND_URL')].filter(Boolean),
      headers: [
        'Content-Type',
        'Authorization',
        'Origin',
        'Accept',
        'X-Supabase-Id',
      ],
    },
  },

  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];