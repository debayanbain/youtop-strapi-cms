import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            '*.backblazeb2.com',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            '*.backblazeb2.com',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  {
    name: 'strapi::body',
    config: {
      formLimit: '500mb',
      jsonLimit: '500mb',
      textLimit: '500mb',
      formidable: {
        maxFileSize: 500 * 1024 * 1024
      },
    },
  },
];

export default config;
