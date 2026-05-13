export default ({ env }) => ({
  upload: {
    config: {
      provider: '@strapi/provider-upload-aws-s3',

      providerOptions: {
        s3Options: {
          credentials: {
            accessKeyId: env('MINIO_ACCESS_KEY'),
            secretAccessKey: env('MINIO_SECRET_KEY'),
          },

          endpoint: env('MINIO_ENDPOINT'),

          region: env('MINIO_REGION'),

          forcePathStyle: true,

          params: {
            Bucket: env('MINIO_BUCKET'),
          },
        },
      },

      sizeLimit: 500 * 1024 * 1024,
    },
  },
});