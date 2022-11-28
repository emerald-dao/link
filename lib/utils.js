export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

export const getIPFSFileURL = (cid, path) => {
  if (!cid) { return }
  if (!path) {
    return `https://gateway.pinata.cloud/ipfs/${cid}`
  }
  return `https://gateway.pinata.cloud/ipfs/${cid}/${path}`
}

export const getIPFSFileURLByURL = (url) => {
  if (!url.includes("ipfs://")) { return }
  const newURL = url.replace("ipfs://", "")
  return `https://gateway.pinata.cloud/ipfs/${newURL}`
}

export const getImageSrcFromMetadataViewsFile = (file) => {
  if (file.url && file.url.includes("https://") && !file.url.includes("ipfs://")) {
    return file.url.trim()
  } else if (file.url && file.url.includes("ipfs://")) {
    return getIPFSFileURLByURL(file.url)
  } else if (file.cid && file.cid.trim() != '') {
    if (file.path && file.path.trim() != '') {
      const imageCID = file.cid.trim()
      const imagePath = file.path.trim()
      return getIPFSFileURL(imageCID, imagePath)
    } else {
      return getIPFSFileURL(file.cid.trim(), null)
    }
  } else {
    return "/link.png"
  }
}