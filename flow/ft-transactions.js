import * as fcl from "@onflow/fcl"
import publicConfig from "../publicConfig"
import { txHandler } from "./transactions"

export const ftBulkSetupAccount = async (
  tokens,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doFtBulkSetupAccount(tokens)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doFtBulkSetupAccount = async (tokens) => {
  const allContracts = {}
  let code = `
  import FungibleToken from ${publicConfig.fungibleTokenAddress}
  
  transaction() {
    prepare(signer: AuthAccount) {
  `
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const contractName = token.contractName
    const contractAddress = token.address

    const body = `
    if signer.borrow<&FungibleToken.Vault>(from: ${token.path.vault}) == nil {
      signer.save(<- ${contractName}.createEmptyVault(), to: ${token.path.vault})
      signer.link<&${contractName}.Vault{FungibleToken.Balance}>(${token.path.balance}, target: ${token.path.vault})
      signer.link<&${contractName}.Vault{FungibleToken.Receiver}>(${token.path.receiver}, target: ${token.path.vault})
    }
    `
    code = code.concat(body)
    allContracts[contractName] = contractAddress
  }

  let imports = ``
  for (const [name, address] of Object.entries(allContracts)) {
    imports = imports.concat(`import ${name} from ${address}\n`)
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

export const ftSetupAccount = async (
  token,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doFtSetupAccount(token)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doFtSetupAccount = async (token) => {
  const contractName = token.contractName
  const contractAddress = token.address

  const code = `
  import FungibleToken from ${publicConfig.fungibleTokenAddress}
  import ${contractName} from ${contractAddress}

  transaction() {
    prepare(signer: AuthAccount) {
      if signer.borrow<&FungibleToken.Vault>(from: ${token.path.vault}) == nil {
        signer.save(<- ${contractName}.createEmptyVault(), to: ${token.path.vault})
        signer.link<&${contractName}.Vault{FungibleToken.Balance}>(${token.path.balance}, target: ${token.path.vault})
        signer.link<&${contractName}.Vault{FungibleToken.Receiver}>(${token.path.receiver}, target: ${token.path.vault})
      }
    }
  }
  `
  const transactionId = await fcl.mutate({
    cadence: code,
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })
  return transactionId
}

export const ftRelinkAll = async (
  tokens,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doFtRelinkAll(tokens)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doFtRelinkAll = async (tokens) => {
  const allContracts = {}
  let code = `
  import FungibleToken from ${publicConfig.fungibleTokenAddress}

  transaction() {
    prepare(signer: AuthAccount) {
  `
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const contractName = token.contractName
    const contractAddress = token.address

    const body = `
    signer.unlink(${token.path.balance})
    signer.link<&${contractName}.Vault{FungibleToken.Balance}>(${token.path.balance}, target: ${token.path.vault})
    signer.unlink(${token.path.receiver})
    signer.link<&${contractName}.Vault{FungibleToken.Receiver}>(${token.path.receiver}, target: ${token.path.vault})
    `
    code = code.concat(body)
    allContracts[contractName] = contractAddress
  }

  let imports = ``
  for (const [name, address] of Object.entries(allContracts)) {
    imports = imports.concat(`import ${name} from ${address}\n`)
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

export const ftRelink = async (
  token,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doFtRelink(token)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doFtRelink = async (token) => {
  const contractName = token.contractName
  const contractAddress = token.address

  const code = `
  import FungibleToken from ${publicConfig.fungibleTokenAddress}
  import ${contractName} from ${contractAddress}

  transaction() {
    prepare(signer: AuthAccount) {
      signer.unlink(${token.path.balance})
      signer.link<&${contractName}.Vault{FungibleToken.Balance}>(${token.path.balance}, target: ${token.path.vault})
      signer.unlink(${token.path.receiver})
      signer.link<&${contractName}.Vault{FungibleToken.Receiver}>(${token.path.receiver}, target: ${token.path.vault})
    }
  }
  `

  const transactionId = await fcl.mutate({
    cadence: code,
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })
  return transactionId
}

// TESTONLY
export const ftBadlink = async (
  token,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doFtBadLink(token)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

// TESTONLY
const doFtBadLink = async (token) => {
  const contractName = token.contractName
  const contractAddress = token.address

  const code = `
  import FungibleToken from ${publicConfig.fungibleTokenAddress}
  import ${contractName} from ${contractAddress}

  transaction() {
    prepare(signer: AuthAccount) {
      if signer.borrow<&FungibleToken.Vault>(from: ${token.path.vault}) == nil {
        signer.save(<- ${contractName}.createEmptyVault(), to: ${token.path.vault})
        signer.link<&${contractName}.Vault{FungibleToken.Receiver}>(${token.path.balance}, target: ${token.path.vault})
        signer.link<&${contractName}.Vault{FungibleToken.Balance}>(${token.path.receiver}, target: ${token.path.vault})
      }
    }
  }
  `
  const transactionId = await fcl.mutate({
    cadence: code,
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })
  return transactionId
}

// TESTONLY
export const ftDangerousLink = async (
  token,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doFtDangerousLink(token)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

// TESTONLY
const doFtDangerousLink = async (token) => {
  const contractName = token.contractName
  const contractAddress = token.address

  const code = `
  import FungibleToken from ${publicConfig.fungibleTokenAddress}
  import ${contractName} from ${contractAddress}

  transaction() {
    prepare(signer: AuthAccount) {
      if signer.borrow<&FungibleToken.Vault>(from: ${token.path.vault}) == nil {
        signer.save(<- ${contractName}.createEmptyVault(), to: ${token.path.vault})
        signer.link<&${contractName}.Vault{FungibleToken.Provider}>(${token.path.balance}, target: ${token.path.vault})
        signer.link<&${contractName}.Vault{FungibleToken.Receiver}>(${token.path.receiver}, target: ${token.path.vault})
      }
    }
  }
  `
  const transactionId = await fcl.mutate({
    cadence: code,
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })
  return transactionId
}