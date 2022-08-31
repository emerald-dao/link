import * as fcl from "@onflow/fcl"
// Different from the response of FCL
// We don't need to show every status to users
export const TxStatus = {
  // Initializing: Initialing
  // the transaction is waiting to be approved
  initializing() {
    return { status: "Initializing", error: null, txid: null }
  },
  // Pending: Pending & Finalized & Executed
  // the transaction has not been confirmed on chain
  pending(txid) {
    return { status: "Pending", error: null, txid: txid }
  },
  // Success: Sealed with no error
  success(txid) {
    return { status: "Success", error: null, txid: txid }
  },
  // Failed: Sealed with error
  failed(error, txid) {
    return { status: "Failed", error: error, txid: txid }
  }
}

export const bulkSetupAccount = async (
  metadataArr,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doBulkSetupAccount(metadataArr)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doBulkSetupAccount = async (metadataArr) => {
  const allContracts = {}
  let code = `
  transaction() {
    prepare(signer: AuthAccount) {
  `
  for (let i = 0; i < metadataArr.length; i++) {
    const metadata = metadataArr[i]
    const contractName = metadata.contractName
    const collectionData = metadata.collectionData
    const { storagePath, publicPath, interfaces, collectionType, contracts } = parseCollectionData(collectionData)

    const body = `
    if signer.borrow<&NonFungibleToken.Collection>(from: ${storagePath}) == nil {
      signer.save(<- ${contractName}.createEmptyCollection(), to: ${storagePath})
      signer.link<&${collectionType}{${interfaces}}>(${publicPath}, target: ${storagePath})
    }
    `
    code = code.concat(body)
    for (const [name, address] of Object.entries(contracts)) {
      allContracts[name] = address
    }
  }

  let imports = ``
  for (const [name, address] of Object.entries(allContracts)) {
    imports = imports.concat(`import ${name} from 0x${address}\n`)
  }

  code = imports.concat(code).concat(`
      }
    }
  `)

  const transactionId = await fcl.mutate({
    cadence: code,
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })
  return transactionId
}

export const setupAccount = async (
  metadata,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doSetupAccount(metadata)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doSetupAccount = async (metadata) => {
  const contractName = metadata.contractName
  const collectionData = metadata.collectionData
  const { storagePath, publicPath, interfaces, imports, collectionType } = parseCollectionData(collectionData)

  const body = `
  transaction() {
    prepare(signer: AuthAccount) {
      if signer.borrow<&NonFungibleToken.Collection>(from: ${storagePath}) == nil {
        signer.save(<- ${contractName}.createEmptyCollection(), to: ${storagePath})
        signer.link<&${collectionType}{${interfaces}}>(${publicPath}, target: ${storagePath})
      }
    }
  }
  `
  const code = imports.concat(body)

  const transactionId = await fcl.mutate({
    cadence: code,
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })
  return transactionId
}

export const relinkAll = async (
  metadataArr,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doRelinkAll(metadataArr)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doRelinkAll = async (metadataArr) => {
  const allContracts = {}
  let code = `
  transaction() {
    prepare(signer: AuthAccount) {
  `
  for (let i = 0; i < metadataArr.length; i++) {
    const metadata = metadataArr[i]
    const collectionData = metadata.collectionData
    const { storagePath, publicPath, interfaces, collectionType, contracts } = parseCollectionData(collectionData)

    const body = `
        if signer.borrow<&NonFungibleToken.Collection>(from: ${storagePath}) != nil && !signer.getCapability<&${collectionType}{${interfaces}}>(${publicPath}).check() {
          signer.unlink(${publicPath})
          signer.link<&${collectionType}{${interfaces}}>(${publicPath}, target: ${storagePath})
        }
    `
    code = code.concat(body)
    for (const [name, address] of Object.entries(contracts)) {
      allContracts[name] = address
    }
  }

  let imports = ``
  for (const [name, address] of Object.entries(allContracts)) {
    imports = imports.concat(`import ${name} from 0x${address}\n`)
  }

  code = imports.concat(code).concat(`
      }
    }
  `)

  const transactionId = await fcl.mutate({
    cadence: code,
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })
  return transactionId
}

export const relink = async (
  metadata,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doRelink(metadata)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doRelink = async (metadata) => {
  const collectionData = metadata.collectionData
  const { storagePath, publicPath, interfaces, imports, collectionType } = parseCollectionData(collectionData)

  const body = `
  transaction() {
    prepare(signer: AuthAccount) {
      if signer.borrow<&NonFungibleToken.Collection>(from: ${storagePath}) != nil && !signer.getCapability<&${collectionType}{${interfaces}}>(${publicPath}).check() {
        signer.unlink(${publicPath})
        signer.link<&${collectionType}{${interfaces}}>(${publicPath}, target: ${storagePath})
      }
    }
  }
  `

  const code = imports.concat(body)

  const transactionId = await fcl.mutate({
    cadence: code,
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })
  return transactionId
}

export const txHandler = async (
  txFunc,
  setTransactionInProgress,
  setTransactionStatus
) => {
  let transactionId = null
  setTransactionInProgress(true)
  setTransactionStatus(TxStatus.initializing())

  try {
    transactionId = await txFunc()
    setTransactionStatus(TxStatus.pending(transactionId))

    let res = await fcl.tx(transactionId).onceSealed()
    if (res.status === 4) {
      if (res.statusCode === 0) {
        setTransactionStatus(TxStatus.success(transactionId))
      } else {
        setTransactionStatus(TxStatus.failed(res.errorMessage, transactionId))
      }
      setTimeout(() => setTransactionInProgress(false), 3000)
    }
    return res
  } catch (e) {
    console.log(e)
    setTransactionStatus(TxStatus.failed(e, null))
    setTimeout(() => setTransactionInProgress(false), 3000)
  }
}

// TESTONLY
export const badlink = async (
  metadata,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doBadLink(metadata)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

// TESTONLY
const doBadLink = async (metadata) => {
  const contractName = metadata.contractName
  const collectionData = metadata.collectionData
  const { storagePath, publicPath, imports, collectionType } = parseCollectionData(collectionData)

  const body = `
  transaction() {
    prepare(signer: AuthAccount) {
      if signer.borrow<&NonFungibleToken.Collection>(from: ${storagePath}) == nil {
        signer.save(<- ${contractName}.createEmptyCollection(), to: ${storagePath})
        signer.link<&${collectionType}{NonFungibleToken.CollectionPublic}>(${publicPath}, target: ${storagePath})
      }
    }
  }
  `

  const code = imports.concat(body)

  const transactionId = await fcl.mutate({
    cadence: code,
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })
  return transactionId
}

const parseCollectionData = (collectionData) => {
  const storagePath = `/${collectionData.storagePath.domain}/${collectionData.storagePath.identifier}`
  const publicPath = `/${collectionData.publicPath.domain}/${collectionData.publicPath.identifier}`

  const contracts = {}

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

  let imports = ``
  for (const [name, address] of Object.entries(contracts)) {
    imports = imports.concat(`import ${name} from 0x${address}\n`)
  }
  const interfaces = interfacesArr.join(", ")
  return { storagePath: storagePath, publicPath: publicPath, interfaces: interfaces, imports: imports, collectionType: type, contracts: contracts }
}