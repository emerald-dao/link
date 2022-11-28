import { SpinnerCircular } from 'spinners-react'
import { ArrowCircleDownIcon, ArrowCircleRightIcon } from '@heroicons/react/outline'
import useSWR, { useSWRConfig } from "swr";
import publicConfig from "../publicConfig";
import { useRecoilState } from "recoil"
import { TokenListProvider, ENV, Strategy } from 'flow-native-token-registry'
import {
  transactionInProgressState,
  transactionStatusState
} from "../lib/atoms"
import { useEffect, useState } from "react";
import { getFtLinkStatus } from "../flow/scripts";
import ErrorPage from "./ErrorPage";
import { classNames } from "../lib/utils";
import TokenCard from "./TokenCard";
import { ftBulkSetupAccount, ftRelinkAll } from '../flow/ft-transactions';

const registryFetcher = async (funcName) => {
  let env = ENV.Mainnet
  if (publicConfig.chainEnv == 'testnet') {
    env = ENV.Testnet
  }

  const tokens = await new TokenListProvider().resolve(Strategy.GitHub, env)
  return tokens.getList().map((token) => {
    token.id = `${token.address.replace("0x", "A.")}.${token.contractName}`
    return token
  })
}

const ftLinkStatusFetcher = async (funcName, account, registry) => {
  return await getFtLinkStatus(account, registry)
}

export default function FtLinkBoard(props) {
  const { mutate } = useSWRConfig()
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const { account } = props

  const [registry, setRegistry] = useState(null)
  const [linkStatus, setLinkStatus] = useState(null)

  const [showCorrectlyLinked, setShowCorrectlyLinked] = useState(false)
  const [selectedUnlinked, setSelectedUnlinked] = useState({})

  useEffect(() => {
    if (!account) {
      setSelectedUnlinked({})
    }
  }, [account])

  const { data: registryData, error: registryError } = useSWR(account ? ["registryFetcher"] : null, registryFetcher)

  useEffect(() => {
    if (registryData) {
      setRegistry(registryData)
    }
  }, [registryData])

  const { data: statusData, error: statusError } = useSWR(
    (registryData && account) ? ["ftLinkStatusFetcher", account, registryData] : null, ftLinkStatusFetcher)

  useEffect(() => {
    if (statusData) { setLinkStatus(statusData) }
  }, [statusData])

  if (registryError) {
    return <ErrorPage code={registryError.statusCode} title={"Get Token List Failed"} detail={"Please check you network status and try again"} />
  }

  if (statusError) {
    return <ErrorPage code={statusError.statusCode} title={"Get Link Status Failed"} detail={"Please check you network status and try again"} />
  }

  return (
    <>
      {
        account && linkStatus ?
          <div>
            {linkStatus.dangerous.length > 0 ?
              <div className="mb-8 flex flex-col gap-y-3 w-full">
                <div className="flex gap-x-3 justify-between items-center">
                  <div className="shrink truncate flex flex-col gap-y-1">
                    <label className="shrink truncate font-flow font-bold text-xl sm:text-2xl">Dangerously Linked</label>
                    <label className="shrink truncate font-flow text-base">{`Provider is exposed to public, so everyone can withdraw your funds`}</label>
                  </div>
                  <button
                    className={
                      classNames(
                        transactionInProgress ? "bg-rose-300 text-white" : "hover:bg-rose-600 bg-rose-500 text-white",
                        "shrink-0 truncate font-flow text-base shadow-sm font-bold w-[120px] rounded-full px-3 py-2 leading-5"
                      )}
                    disabled={transactionInProgress}
                    onClick={async () => {
                      const tokens = registry.filter((token) => {
                        return linkStatus.dangerous.includes(token.id)
                      })
                      await ftRelinkAll(tokens, setTransactionInProgress, setTransactionStatus)
                      mutate(["ftLinkStatusFetcher", account, registry])
                    }}
                  >
                    RELINK ALL
                  </button>
                </div>
                {
                  linkStatus.dangerous.map((tokenID) => {
                    const token = registry.find((t) => t.id == tokenID)
                    return (<TokenCard key={`dangerous_${tokenID}`} token={token} type={"dangerous"} account={account} registry={registry} />)
                  })
                }
              </div>
              : null
            }
            {linkStatus.bad.length > 0 ?
              <div className="mb-8 flex flex-col gap-y-3 w-full">
                <div className="flex gap-x-3 justify-between items-center">
                  <div className="shrink truncate flex flex-col gap-y-1">
                    <label className="shrink truncate font-flow font-bold text-xl sm:text-2xl">Not Correctly Linked</label>
                    <label className="shrink truncate font-flow text-base">{`You aren't able to receive funds or others aren't able to query your balance`}</label>
                  </div>
                  <button
                    className={
                      classNames(
                        transactionInProgress ? "bg-emerald-light text-gray-500" : "hover:bg-emerald-dark bg-emerald text-black",
                        "shrink-0 truncate font-flow text-base shadow-sm font-bold w-[120px] rounded-full px-3 py-2 leading-5"
                      )}
                    disabled={transactionInProgress}
                    onClick={async () => {
                      const tokens = registry.filter((token) => {
                        return linkStatus.bad.includes(token.id)
                      })

                      await ftRelinkAll(tokens, setTransactionInProgress, setTransactionStatus)
                      mutate(["ftLinkStatusFetcher", account, registry])
                    }}
                  >
                    RELINK ALL
                  </button>
                </div>
                {
                  linkStatus.bad.map((tokenID) => {
                    const token = registry.find((t) => t.id == tokenID)
                    return (<TokenCard key={tokenID} token={token} type={"bad"} account={account} registry={registry} />)
                  })
                }
              </div>
              : null
            }
            {linkStatus.good.length > 0 ?
              <div className="mb-8 flex flex-col gap-y-3 w-full">
                <button
                  className="flex justify-between"
                  onClick={() => {
                    setShowCorrectlyLinked(!showCorrectlyLinked)
                  }}
                >
                  <label className="block font-flow font-bold text-xl sm:text-2xl">Correctly Linked</label>
                  {!showCorrectlyLinked ?
                    <ArrowCircleRightIcon className="text-emerald" width={32} height={32} /> :
                    <ArrowCircleDownIcon className="text-emerald" width={32} height={32} />
                  }
                </button>
                {showCorrectlyLinked ?
                  linkStatus.good.map((tokenID) => {
                    const token = registry.find((t) => t.id == tokenID)
                    return (<TokenCard key={tokenID} token={token} type={"good"} account={account} registry={registry} />)
                  })
                  : null}
              </div>
              : null
            }
            {linkStatus.unlinked.length > 0 ?
              <div className="mb-8 flex flex-col gap-y-3 w-full">
                <div className="flex gap-x-3 justify-between items-center">
                  <label className="shrink truncate font-flow font-bold text-xl sm:text-2xl">Not Linked</label>
                  <button
                    className={
                      classNames(
                        (transactionInProgress || Object.values(selectedUnlinked).filter((c) => c).length == 0) ? "bg-emerald-light text-gray-500" : "hover:bg-emerald-dark bg-emerald text-black",
                        "shrink-0 truncate font-flow text-base shadow-sm font-bold w-[170px] rounded-full px-3 py-2 leading-5"
                      )}
                    disabled={transactionInProgress || Object.values(selectedUnlinked).filter((c) => c).length == 0}
                    onClick={async () => {
                      const tokens = []
                      for (const [tokenID, selected] of Object.entries(selectedUnlinked)) {
                        if (selected && linkStatus.unlinked.includes(tokenID)) {
                          tokens.push(registry.find((t) => t.id == tokenID))
                        }
                      }

                      await ftBulkSetupAccount(tokens, setTransactionInProgress, setTransactionStatus)
                      mutate(["ftLinkStatusFetcher", account, registry])
                    }}
                  >
                    {`BULK SETUP (${Object.values(selectedUnlinked).filter((c) => c).length})`}
                  </button>
                </div>
                {
                  linkStatus.unlinked.map((tokenID) => {
                    const token = registry.find((t) => t.id == tokenID)
                    return (<TokenCard
                      key={tokenID}
                      token={token}
                      type={"unlinked"}
                      account={account}
                      registry={registry}
                      isSelectable={true}
                      selectedUnlinked={selectedUnlinked}
                      setSelectedUnlinked={setSelectedUnlinked}
                    />)
                  })
                }
              </div>
              : null}
          </div> : <>
            {account ?
              <div className="flex h-[200px] mt-10 justify-center">
                <SpinnerCircular size={50} thickness={180} speed={100} color="#38E8C6" secondaryColor="#e2e8f0" />
              </div>
              : null}
          </>
      }
    </>
  )
}