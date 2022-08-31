export const isWhitelistedImage = (imageURL) => {
  // Should be consistent with next.config.js
  const whitelist = [
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
  ]

  const { hostname }= new URL(imageURL)
  return whitelist.includes(hostname)
}

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ')
}