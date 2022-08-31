import Image from "next/image"
import { useRecoilState } from "recoil"
import { relink, setupAccount } from "../flow/transactions"
import {
  transactionInProgressState,
  transactionStatusState
} from "../lib/atoms"
import { useSWRConfig } from 'swr'
import { isWhitelistedImage } from "../lib/utils"

const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

export default function CollecitonCard(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const { mutate } = useSWRConfig()

  const { name, metadata, type, account, catalog } = props
  const imageURL = metadata.collectionDisplay.squareImage.file.url

  const getButton = (type, metadata, account, catalog) => {
    if (type == "good") {
      return null
    }

    let title = "RELINK"
    if (type == "unlinked") {
      title = "SETUP"
    }
    return (
      <button
      className={
        classNames(
          transactionInProgress ? "bg-emerald-light text-gray-500" : "hover:bg-emerald-dark bg-emerald text-black",
          "shrink-0 truncate font-flow text-base shadow-sm font-bold w-[100px] rounded-full px-3 py-2 leading-5"
        )}
      disabled={transactionInProgress}
      onClick={async () => {
        if (type == "bad") {
          await relink(metadata, setTransactionInProgress, setTransactionStatus)
        } else if (type == "unlinked") {
          await setupAccount(metadata, setTransactionInProgress, setTransactionStatus)
        }
        mutate(["linkStatusFetcher", account, catalog])
      }}
    >
      {title}
    </button>
    )
  }

  let src = `/api/imageproxy?url=${encodeURIComponent(imageURL)}`
  if (imageURL.trim() == '') {
    src = null
  } else if (isWhitelistedImage(imageURL)) {
    src = imageURL
  }

  return (
    <div key={name} className="flex gap-x-3 items-center justify-between w-full px-4 py-4 rounded-3xl 
ring-1 ring-black ring-opacity-10 overflow-hidden bg-white">
      <div className='shrink truncate flex gap-x-2 items-center'>
        <div className="h-[40px] w-[40px] shrink-0 relative rounded-xl overflow-hidden border-emerald border">
          {src ?  <Image src={src} alt="" layout="fill" objectFit="contain" /> : null}
        </div>
        <label className="shrink font-flow font-bold text-lg truncate">{name}</label>
      </div>

      {getButton(type, metadata, account, catalog)}
    </div>
  )
}