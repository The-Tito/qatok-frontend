/** @type {import('next').NextConfig} */
export default {
  webpack(config) {
    // La copia de shared conserva los imports ESM .js del backend.
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.js', '.ts'],
    };
    return config;
  },
};
