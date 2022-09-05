export default function About(props) {
  const h1 = "font-flow text-black font-bold text-2xl mb-3"
  const p = "leading-7 font-flow text-black text-base font-medium"
  return (
    <div className="container mx-auto max-w-[920px] min-w-[380px] px-6">
      <h1 className={h1}>What is Link?</h1>
      <p className={p}>On Flow, NFTs live in your account at a storage path; this path is only accessible to you or anyone you give explicit permission during transactions.</p>
      <br></br>
      <p className={p}>Whenever someone wants to interact with your assets (NFTs), they need to have a 'link' and a path to where the asset is stored, technically known as a capability. These capabilities can be public or private, as you will want users to be able to access certain but not all of the information or functions of your assets at this path. One example of something that is ideally publicly linked is NFT metadata so Marketplaces can display things like NFT names, and traits of the NFTs in your account. Link, the platform verifies that the proper restrictions are in place with your NFT on the public path.</p>
      <br></br>
      <p className={p}>If a collection in your wallet is showing as 'Not Correctly Linked', it simply means that when you initially interacted with this NFT, the capabilities were incorrectly added to your account and did not meet the&nbsp;
        <a href="https://www.flow-nft-catalog.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-emerald font-bold decoration-2">
          Flow NFT Catalog
        </a>
        &nbsp;standard created by Dapper Labs, potentially limiting composability.</p>
      <br></br>
      <p className={p}>To learn more, join a Cadence course inside&nbsp;
        <a href="https://academy.ecdao.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-emerald font-bold decoration-2">
          Emerald Academy
        </a>
        &nbsp;or ask in the&nbsp;
        <a href="https://discord.com/invite/emeraldcity"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-emerald font-bold decoration-2">
          Emerald City Discord
        </a>
      .</p>
    </div>
  )
}