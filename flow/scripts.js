import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"

const NFTCatalogPath = "0xNFTCatalog"

export const getNFTCatalog = async () => {
  const code = `
  import NFTCatalog from 0xNFTCatalog

  pub fun main(): {String : NFTCatalog.NFTCatalogMetadata} {
      return NFTCatalog.getCatalog()
  }
  `
  .replace(NFTCatalogPath, publicConfig.nftCatalogAddress)

  const catalog = await fcl.query({
    cadence: code
  }) 

  return catalog
}

export const getLinkStatus = async(account, catalog) => {
  const code = genlinkCheckerScript(catalog)
  const status = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(account, t.Address),
    ]
  }) 
  return status
}

const genlinkCheckerScript = (catalog) => {
  let code = `
  pub struct Result {
    pub let good: [String]
    pub let bad: [String]
    pub let unlinked: [String]

    init(good: [String], bad: [String], unlinked: [String]) {
      self.good = good
      self.bad = bad
      self.unlinked = unlinked
    }
  }

  pub fun main(address: Address): Result {
    let account = getAuthAccount(address)
    let good: [String] = []
    let bad: [String] = []
    let unlinked: [String] = []
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
      if account.getCapability<&${type}{${interfaces}}>(${publicPath}).check() {
        good.append("${catalogName}")
      } else {
        bad.append("${catalogName}")
      }
    }`

    code = code.concat(checkCode)
  }

  code = code.concat(`
    return Result(good: good, bad: bad, unlinked: unlinked)
  }
  `)

  let imports = ``
  for (const [name, address] of Object.entries(contracts)) {
    imports = imports.concat(`import ${name} from 0x${address}\n`)
  }
  code = imports.concat(code)
  return code
}