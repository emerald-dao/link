import Image from "next/image"

export default function Footer() {
  return (
    <footer className="m-auto mt-60 max-w-[920px] flex flex-1 justify-center items-center py-6 border-t border-solid box-border">
      <div className="flex flex-col gap-y-2 items-center">
        <div className="h-[24px] w-[24px] relative rounded-xl overflow-hidden">
          <Image src={`/ecdao.png`} alt="" layout="fill" objectFit="cover" />
        </div>
        <a
          href="https://discord.com/invite/emeraldcity"
          target="_blank"
          rel="noopener noreferrer"
          className="font-flow text-sm whitespace-pre"
        >
          Created by <span className="underline font-bold decoration-emerald decoration-2">Emerald City DAO</span>
        </a>
        <label className="font-flow text-sm whitespace-pre">2022. All rights reserved.</label>
      </div>

    </footer>
  )
}