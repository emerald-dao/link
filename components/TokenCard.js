import Image from "next/image"
import { useRecoilState } from "recoil"
import { badlink, dangerousLink, relink, setupAccount } from "../flow/transactions"
import {
  transactionInProgressState,
  transactionStatusState,
  showBasicNotificationState,
  basicNotificationContentState
} from "../lib/atoms"
import { useSWRConfig } from 'swr'
import { classNames, getImageSrcFromMetadataViewsFile, getIPFSFileURL, ipfs, isWhitelistedImage } from "../lib/utils"
import { GlobeAltIcon } from "@heroicons/react/outline"
import { useEffect, useState } from "react"
import { ftBadlink, ftDangerousLink, ftRelink, ftSetupAccount } from "../flow/ft-transactions"

const MAX_BULK_SIZE = 20

export default function TokenCard(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)
  const { mutate } = useSWRConfig()

  const { token, type, account, registry, isSelectable, selectedUnlinked, setSelectedUnlinked } = props
  const [selected, setSelected] = useState(false)
  const selectable = isSelectable == true

  const getButton = (token, type, account, registry) => {
    if (type == "good") {
      return null
    }

    let title = "RELINK"
    if (type == "unlinked") {
      title = "SETUP"
    }

    let disabledColor = "bg-emerald-light text-gray-500"
    let enabledColor = "hover:bg-emerald-dark bg-emerald text-black"
    if (type == "dangerous") {
      disabledColor = "bg-rose-300 text-white"
      enabledColor = "hover:bg-rose-600 bg-rose-500 text-white"
    }

    return (
      <button
        className={
          classNames(
            transactionInProgress || selected ? disabledColor : enabledColor,
            "absolute right-4 top-[22px] shrink-0 truncate font-flow text-base shadow-sm font-bold w-[100px] rounded-full px-3 py-2 leading-5"
          )}
        disabled={transactionInProgress || selected}
        onClick={async () => {
          if (type == "bad") {
            await ftRelink(token, setTransactionInProgress, setTransactionStatus)
          } else if (type == "unlinked") {
            await ftSetupAccount(token, setTransactionInProgress, setTransactionStatus)
          } else if (type == "dangerous") {
            await ftRelink(token, setTransactionInProgress, setTransactionStatus)
          }
          mutate(["ftLinkStatusFetcher", account, registry])
        }}
      >
        {title}
      </button>
    )
  }

  const extensions = token.extensions
  const externalLink = extensions.website
  const twitter = extensions.twitter
  const discord = extensions.discord

  const selectedLength = selectedUnlinked ? Object.values(selectedUnlinked).filter((c) => c).length : 0

  return (
    <div className="relative">
      <button
        className={classNames(
          selected ? "ring-emerald ring-4" : "ring-black ring-1 ring-opacity-10",
          `flex gap-x-3 items-center justify-between w-full px-4 py-4 rounded-3xl 
         overflow-hidden bg-white`
        )}
        disabled={!selectable || transactionInProgress}
        onClick={(event) => {
          if (selectedLength >= MAX_BULK_SIZE && !selected) {
            setShowBasicNotification(true)
            setBasicNotificationContent({ type: "exclamation", title: "MAX BULK SIZE EXCEEDED", detail: null })
            return
          }
          let _selectedUnlinked = Object.assign({}, selectedUnlinked)
          if (selected) {
            _selectedUnlinked[token.id] = false
          } else {
            _selectedUnlinked[token.id] = true
          }
          setSelected(!selected)
          setSelectedUnlinked(_selectedUnlinked)
        }}
      >
        <div className='shrink truncate flex gap-x-2 items-center'>
          <div className="h-[48px] w-[48px] shrink-0 relative rounded-full overflow-hidden border-emerald border">
            {token.logoURI ? <Image src={token.logoURI} placeholder="blur" blurDataURL="/link.png" alt="/link.png" fill sizes="10vw" className="object-contain" /> : null}
          </div>

          <div className="flex flex-col gap-y-1 shrink truncate">
            <label className="shrink font-flow font-bold text-base sm:text-lg truncate">{token.symbol}</label>
            <div className="flex gap-x-1">
              {externalLink ?
                <a
                  href={externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                >
                  <GlobeAltIcon className="h-[16px] w-[16px] text-emerald" />
                </a> : null}
              {twitter ?
                <a
                  href={twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="h-[16px] w-[16px] shrink-0 relative">
                    <Image src={"/twitter.png"} alt="" fill sizes="10vw" className="object-contain" />
                  </div>
                </a> : null}
              {discord ?
                <a
                  href={discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="h-[16px] w-[16px] shrink-0 relative">
                    <Image src={"/discord.png"} alt="" fill sizes="10vw" className="object-contain" />
                  </div>
                </a> : null}
            </div>
          </div>
        </div>
        {/* Placeholder to get the text truncation effect */}
        <div className="w-[100px] shrink-0">
        </div>
      </button>
      {getButton(token, type, account, registry)}
    </div>
  )
}