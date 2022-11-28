import { SpinnerCircular } from 'spinners-react'
import { ArrowCircleDownIcon, ArrowCircleRightIcon } from '@heroicons/react/outline'
import CollecitonCard from '../components/CollectionCard'
import { classNames } from '../lib/utils'
import { bulkSetupAccount, relinkAll } from '../flow/transactions'
import { useRecoilState } from "recoil"
import {
  transactionInProgressState,
  transactionStatusState
} from "../lib/atoms"
import useSWR, { useSWRConfig } from 'swr'
import { useEffect, useState } from 'react'
import { bulkGetNftCatalog, getLinkStatus } from '../flow/scripts'
import ErrorPage from './ErrorPage'

const catalogFetcher = async (funcName) => {
  return await bulkGetNftCatalog()
}

const linkStatusFetcher = async (funcName, account, catalog) => {
  return await getLinkStatus(account, catalog)
}

// There are some records with duplicate contractName
// contracts with duplicate contractName can't be imported in
// the same cadence code, so we just handle the first one
const sortObject = o => Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {})

const filterCatalog = (catalog) => {
  let cleaned = {}
  let contractNames = {}
  for (const [catalogName, metadata] of Object.entries(catalog)) {
    if (!contractNames[metadata.contractName]) {
      contractNames[metadata.contractName] = true
      cleaned[catalogName] = metadata
    }
  }
  return sortObject(cleaned)
}

export default function NftLinkBoard(props) {
  const { mutate } = useSWRConfig()
  const { account } = props
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)

  const { data: catalogData, error: catalogError } = useSWR(account ? ["catalogFetcher"] : null, catalogFetcher)
  const [catalog, setCatalog] = useState(null)
  const [linkStatus, setLinkStatus] = useState(null)

  const [showCorrectlyLinked, setShowCorrectlyLinked] = useState(false)
  const [selectedUnlinked, setSelectedUnlinked] = useState({})

  useEffect(() => {
    if (!account) {
      setSelectedUnlinked({})
    }
  }, [account])

  useEffect(() => {
    if (catalogData) {
      setCatalog(filterCatalog(catalogData))
    }
  }, [catalogData])

  const { data: statusData, error: statusError } = useSWR(
    (catalog && account) ? ["linkStatusFetcher", account, catalog] : null, linkStatusFetcher)

  useEffect(() => {
    if (statusData) { setLinkStatus(statusData) }
  }, [statusData])

  if (catalogError) {
    return <ErrorPage code={catalogError.statusCode} title={"Get NFTCatalog Failed"} detail={"Please check you network status and try again"} />
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
                  <label className="shrink truncate font-flow font-bold text-xl sm:text-2xl">Dangerously Linked</label>
                  <button
                    className={
                      classNames(
                        transactionInProgress ? "bg-rose-300 text-white" : "hover:bg-rose-600 bg-rose-500 text-white",
                        "shrink-0 truncate font-flow text-base shadow-sm font-bold w-[120px] rounded-full px-3 py-2 leading-5"
                      )}
                    disabled={transactionInProgress}
                    onClick={async () => {
                      const metadataArr = linkStatus.dangerous.map((catalogName) => {
                        return catalog[catalogName]
                      })

                      await relinkAll(metadataArr, setTransactionInProgress, setTransactionStatus)
                      mutate(["linkStatusFetcher", account, catalog])
                    }}
                  >
                    RELINK ALL
                  </button>
                </div>
                {
                  linkStatus.dangerous.map((name) => {
                    const metadata = catalog[name]
                    return (<CollecitonCard key={`dangerous_${name}`} name={name} metadata={metadata} type={"dangerous"} account={account} catalog={catalog} />)
                  })
                }
              </div>
              : null
            }
            {linkStatus.bad.length > 0 ?
              <div className="mb-8 flex flex-col gap-y-3 w-full">
                <div className="flex gap-x-3 justify-between items-center">
                  <label className="shrink truncate font-flow font-bold text-xl sm:text-2xl">Not Correctly Linked</label>
                  <button
                    className={
                      classNames(
                        transactionInProgress ? "bg-emerald-light text-gray-500" : "hover:bg-emerald-dark bg-emerald text-black",
                        "shrink-0 truncate font-flow text-base shadow-sm font-bold w-[120px] rounded-full px-3 py-2 leading-5"
                      )}
                    disabled={transactionInProgress}
                    onClick={async () => {
                      const metadataArr = linkStatus.bad.map((catalogName) => {
                        return catalog[catalogName]
                      })

                      await relinkAll(metadataArr, setTransactionInProgress, setTransactionStatus)
                      mutate(["linkStatusFetcher", account, catalog])
                    }}
                  >
                    RELINK ALL
                  </button>
                </div>
                {
                  linkStatus.bad.map((name) => {
                    const metadata = catalog[name]
                    return (<CollecitonCard key={name} name={name} metadata={metadata} type={"bad"} account={account} catalog={catalog} />)
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
                  linkStatus.good.map((name) => {
                    const metadata = catalog[name]
                    return (<CollecitonCard key={name} name={name} metadata={metadata} type={"good"} account={account} catalog={catalog} />)
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
                      const metadataArr = []
                      for (const [name, selected] of Object.entries(selectedUnlinked)) {
                        if (selected && linkStatus.unlinked.includes(name)) {
                          metadataArr.push(catalog[name])
                        }
                      }

                      await bulkSetupAccount(metadataArr, setTransactionInProgress, setTransactionStatus)
                      setSelectedUnlinked({})
                      mutate(["linkStatusFetcher", account, catalog])
                    }}
                  >
                    {`BULK SETUP (${Object.values(selectedUnlinked).filter((c) => c).length})`}
                  </button>
                </div>
                {
                  linkStatus.unlinked.map((name) => {
                    const metadata = catalog[name]
                    return (<CollecitonCard
                      key={name}
                      name={name}
                      metadata={metadata}
                      type={"unlinked"}
                      account={account}
                      catalog={catalog}
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