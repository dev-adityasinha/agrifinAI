/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'wordzz.com',
      'www.ux4g.gov.in',
      'encrypted-tbn0.gstatic.com',
      'static.vecteezy.com',
      'i.pinimg.com',
      'www.bharatbank.com',
      'flourworks.in',
      'pipagro.com',
      'www.greendna.in',
      'thespiceadventuress.com',
      'www.agrocrops.com',
      'image.tuasaude.com',
      'media.post.rvohealth.io',
      'kajabi-storefronts-production.kajabi-cdn.com',
      'www.jiomart.com',
      'static.toiimg.com',
      'www.between2kitchens.com',
      'theepicerie.com',
      'www.agrocrops.com',
      'www.indianhealthyrecipes.com',
      '5.imimg.com',
      'www.bigbasket.com',
      'www.patanjaliayurved.net',
      'www.organicmandya.com',
      'www.amul.com',
      'images.unsplash.com',
      'www.24mantra.com',
      'upload.wikimedia.org',
      'www.nabard.org',
      'www.bandhanbank.com',
      'www.bharatfinancial.com',
      'media.licdn.com'
    ],
  },
  webpack: (config) => {
    // Keep alias simple and Vercel friendly
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname),
    };

    return config;
  },
};

module.exports = nextConfig;