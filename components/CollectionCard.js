import Image from "next/image"
import { useRecoilState } from "recoil"
import { badlink, relink, setupAccount } from "../flow/transactions"
import {
  transactionInProgressState,
  transactionStatusState
} from "../lib/atoms"
import { useSWRConfig } from 'swr'
import { isWhitelistedImage } from "../lib/utils"
import { ExternalLinkIcon, GlobeAltIcon } from "@heroicons/react/outline"

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

  const externalURL = metadata.collectionDisplay.externalURL
  let externalLink = null
  if (externalURL && externalURL.url.trim() != '') {
    externalLink = externalURL.url
  }

  const socials = metadata.collectionDisplay.socials
  const twitter = socials.twitter && socials.twitter.url.trim() != '' ? socials.twitter.url : null
  const discord = socials.discord && socials.discord.url.trim() != '' ? socials.discord.url : null

  return (
    <div key={name} className="flex gap-x-3 items-center justify-between w-full px-4 py-4 rounded-3xl 
ring-1 ring-black ring-opacity-10 overflow-hidden bg-white">
      <div className='shrink truncate flex gap-x-2 items-center'>
        <div className="h-[48px] w-[48px] shrink-0 relative rounded-xl overflow-hidden border-emerald border">
          {src ? <Image src={src} alt="" layout="fill" objectFit="contain" /> : null}
        </div>

        <div className="flex flex-col gap-y-1 shrink truncate">
          <label className="shrink font-flow font-bold text-lg truncate">{name}</label>
          <div className="flex gap-x-1">
            {externalLink ?
              <a
                href={externalLink}
                target="_blank"
                rel="noopener noreferrer">
                <GlobeAltIcon className="h-[16px] w-[16px] text-emerald" />
              </a> : null}
            {twitter ?
              <a
                href={twitter}
                target="_blank"
                rel="noopener noreferrer">
                <div className="h-[16px] w-[16px] shrink-0 relative">
                  <Image src={"/twitter.png"} alt="" layout="fill" objectFit="contain" />
                </div>
              </a> : null}
            {discord ?
              <a
                href={discord}
                target="_blank"
                rel="noopener noreferrer">
                <div className="h-[16px] w-[16px] shrink-0 relative">
                  <Image src={"/discord.png"} alt="" layout="fill" objectFit="contain" />
                </div>
              </a> : null}
          </div>
        </div>
      </div>

      {getButton(type, metadata, account, catalog)}
    </div>
  )
}