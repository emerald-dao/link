import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"

const NFTCatalogPath = "0xNFTCatalog"

export const getLinkStatus = async (account, catalog) => {
  const catalogs = splitCatalog(catalog)
  const promises = catalogs.map((c) => {
    const code = genLinkCheckerScript(c)
    return fcl.query({
      cadence: code,
      args: (arg, t) => [
        arg(account, t.Address),
      ]
    })
  })

  const statuses = await Promise.all(promises)
  const result = statuses.reduce((acc, current) => {
    if (acc.good) {
      acc.good = acc.good.concat(current.good)
    } else {
      acc.good = current.good
    }

    if (acc.bad) {
      acc.bad = acc.bad.concat(current.bad)
    } else {
      acc.bad = current.bad
    }

    if (acc.unlinked) {
      acc.unlinked = acc.unlinked.concat(current.unlinked)
    } else {
      acc.unlinked = current.unlinked
    }

    if (acc.dangerous) {
      acc.dangerous = acc.dangerous.concat(current.dangerous)
    } else {
      acc.dangerous = current.dangerous
    }

    return acc
  }, {})

  return result
}

const splitCatalog = (catalog) => {
  const catalogs = []
  let currentCatalog = {}
  for (const [catalogName, metadata] of Object.entries(catalog)) {
    if (Object.keys(currentCatalog).length >= 40) {
      const c = Object.assign({}, currentCatalog)
      catalogs.push(c)
      currentCatalog = {}
    }

    currentCatalog[catalogName] = metadata
  }
  const c = Object.assign({}, currentCatalog)
  catalogs.push(c)
  return catalogs
}

export const getFtLinkStatus = async (account, registry) => {
  const tokens = splitList(registry)
  const promises = tokens.map((t) => {
    const code = genFtLinkCheckerScript(t)
    return fcl.query({
      cadence: code,
      args: (arg, t) => [
        arg(account, t.Address),
      ]
    })
  })

  const statuses = await Promise.all(promises)
  const result = statuses.reduce((acc, current) => {
    if (acc.good) {
      acc.good = acc.good.concat(current.good)
    } else {
      acc.good = current.good
    }

    if (acc.bad) {
      acc.bad = acc.bad.concat(current.bad)
    } else {
      acc.bad = current.bad
    }

    if (acc.unlinked) {
      acc.unlinked = acc.unlinked.concat(current.unlinked)
    } else {
      acc.unlinked = current.unlinked
    }

    if (acc.dangerous) {
      acc.dangerous = acc.dangerous.concat(current.dangerous)
    } else {
      acc.dangerous = current.dangerous
    }

    return acc
  }, {})

  return result
}

const genFtLinkCheckerScript = (tokens) => {
  let code = `
  import FungibleToken from ${publicConfig.fungibleTokenAddress}

  pub struct Result {
    pub let good: [String]
    pub let bad: [String]
    pub let unlinked: [String]
    pub let dangerous: [String]

    init(good: [String], bad: [String], unlinked: [String], dangerous: [String]) {
      self.good = good
      self.bad = bad
      self.unlinked = unlinked
      self.dangerous = dangerous
    }
  }

  pub fun main(address: Address): Result {
    let account = getAuthAccount(address)
    let good: [String] = []
    let bad: [String] = []
    let unlinked: [String] = []
    let dangerous: [String] = []
  `

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    let checkCode = `
    let vaultPath${i} = ${token.path.vault}
    let balancePath${i} = ${token.path.balance}
    let receiverPath${i} = ${token.path.receiver}

    if account.getCapability<&{FungibleToken.Provider}>(balancePath${i}).check() {
      dangerous.append("${token.id}")
    } else if account.getCapability<&{FungibleToken.Provider}>(receiverPath${i}).check() {
      dangerous.append("${token.id}")
    }

    if account.getCapability<&{FungibleToken.Receiver}>(receiverPath${i}).check() &&
      account.getCapability<&{FungibleToken.Balance}>(balancePath${i}).check() {
      good.append("${token.id}")
    } else if account.borrow<&FungibleToken.Vault>(from: vaultPath${i}) == nil {
      unlinked.append("${token.id}")
    } else {
      bad.append("${token.id}")
    }
  `

    code = code.concat(checkCode)
  }

  code = code.concat(`
    return Result(good: good, bad: bad, unlinked: unlinked, dangerous: dangerous)
  }
  `)

  return code
}

const genLinkCheckerScript = (catalog) => {
  let code = `
  pub struct Result {
    pub let good: [String]
    pub let bad: [String]
    pub let unlinked: [String]
    pub let dangerous: [String]

    init(good: [String], bad: [String], unlinked: [String], dangerous: [String]) {
      self.good = good
      self.bad = bad
      self.unlinked = unlinked
      self.dangerous = dangerous
    }
  }

  pub fun main(address: Address): Result {
    let account = getAuthAccount(address)
    let good: [String] = []
    let bad: [String] = []
    let unlinked: [String] = []
    let dangerous: [String] = []
  `
  const contracts = {}
  for (const [catalogName, metadata] of Object.entries(catalog)) {
    const collectionData = metadata.collectionData
    const storagePath = `/${collectionData.storagePath.domain}/${collectionData.storagePath.identifier}`
    const publicPath = `/${collectionData.publicPath.domain}/${collectionData.publicPath.identifier}`

    const typeID = collectionData.publicLinkedType.type.typeID
    const [, address, name, interf] = typeID.split(".")
    contracts[name] = address
    const type = `${name}.${interf}`

    const restrictions = collectionData.publicLinkedType.restrictions
    const interfacesArr = []
    for (let i = 0; i < restrictions.length; i++) {
      const r = restrictions[i].typeID
      const [, address, name, interf] = r.split(".")
      contracts[name] = address
      interfacesArr.push(`${name}.${interf}`)
    }

    const interfaces = interfacesArr.join(", ")

    let checkCode = `
    if account.borrow<&NonFungibleToken.Collection>(from: ${storagePath}) == nil {
      unlinked.append("${catalogName}")
    } else {
      if account.getCapability<&${type}{NonFungibleToken.Provider}>(${publicPath}).check() {
        dangerous.append("${catalogName}")
      }
      if account.getCapability<&${type}{${interfaces}}>(${publicPath}).check() {
        good.append("${catalogName}")
      } else {
        bad.append("${catalogName}")
      }
    }`

    code = code.concat(checkCode)
  }

  code = code.concat(`
    return Result(good: good, bad: bad, unlinked: unlinked, dangerous: dangerous)
  }
  `)

  let imports = ``
  for (const [name, address] of Object.entries(contracts)) {
    imports = imports.concat(`import ${name} from 0x${address}\n`)
  }
  code = imports.concat(code)
  return code
}

// --- Utils ---

const splitList = (list, chunkSize) => {
  const groups = []
  let currentGroup = []
  for (let i = 0; i < list.length; i++) {
    const collectionID = list[i]
    if (currentGroup.length >= chunkSize) {
      groups.push([...currentGroup])
      currentGroup = []
    }
    currentGroup.push(collectionID)
  }
  groups.push([...currentGroup])
  return groups
}

// --- NFT Catalog ---

export const bulkGetNftCatalog = async () => {
  const collectionIdentifiers = await getCollectionIdentifiers()
  const groups = splitList(collectionIdentifiers, 50)
  const promises = groups.map((group) => {
    return getNftCatalogByCollectionIDs(group)
  })

  const itemGroups = await Promise.all(promises)
  const items = itemGroups.reduce((acc, current) => {
    return Object.assign(acc, current)
  }, {})
  return items
}

export const getNftCatalogByCollectionIDs = async (collectionIDs) => {
  const code = `
  import NFTCatalog from 0xNFTCatalog

  pub fun main(collectionIdentifiers: [String]): {String: NFTCatalog.NFTCatalogMetadata} {
    let res: {String: NFTCatalog.NFTCatalogMetadata} = {}
    for collectionID in collectionIdentifiers {
        if let catalog = NFTCatalog.getCatalogEntry(collectionIdentifier: collectionID) {
          res[collectionID] = catalog
        }
    }
    return res
  }
  `
    .replace(NFTCatalogPath, publicConfig.nftCatalogAddress)

  const catalogs = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(collectionIDs, t.Array(t.String))
    ]
  })

  return catalogs
}

const getCollectionIdentifiers = async () => {
  const typeData = await getCatalogTypeData()

  const collectionData = Object.values(typeData)
  const collectionIdentifiers = []
  for (let i = 0; i < collectionData.length; i++) {
    const data = collectionData[i]
    let collectionIDs = Object.keys(Object.assign({}, data))
    if (collectionIDs.length > 0) {
      collectionIdentifiers.push(collectionIDs[0])
    }
  }
  return collectionIdentifiers
}

const getCatalogTypeData = async () => {
  const code = `
  import NFTCatalog from 0xNFTCatalog

  pub fun main(): {String : {String : Bool}} {
    let catalog = NFTCatalog.getCatalogTypeData()
    return catalog
  }
  `
    .replace(NFTCatalogPath, publicConfig.nftCatalogAddress)

  const typeData = await fcl.query({
    cadence: code
  })

  return typeData
}