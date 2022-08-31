/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'images.barteryard.club',
      'assets.website-files.com',
      'd13e14gtps4iwl.cloudfront.net',
      'tokenrunners.com',
      'bl0x.xyz',
      'images.flovatar.com',
      'www.flowns.org',
      'i.imgur.com',
      'www.dimensionx.com',
      'miro.medium.com'
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  }
}

module.exports = nextConfig
