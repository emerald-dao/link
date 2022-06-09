import Head from 'next/head'
import Image from 'next/image'
import * as fcl from "@onflow/fcl";
// import relinkTx from "../flow/cadence/transactions/relink.cdc"
import { useEffect, useState } from 'react';
import Footer from '../components/Layout/Footer';

fcl.config()
  .put("accessNode.api", "https://rest-mainnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/authn")

export default function Home() {
  const [user, setUser] = useState({ loggedIn: false });
  const [bad, setBad] = useState([]);

  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
  }, [])

  useEffect(() => {
    if (user.addr) {
      getBad();
    }
  }, [user])

  async function relink() {
    const transactionId = await fcl.mutate({
      cadence: `
      import FLOAT from 0x2d4c3caffbeab845
      import NonFungibleToken from 0x1d7e57aa55817448
      import MetadataViews from 0x1d7e57aa55817448

      transaction() {
        prepare(signer: AuthAccount) {
          if !signer.getCapability<&FLOAT.Collection{FLOAT.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(FLOAT.FLOATCollectionPublicPath).check() {
            signer.unlink(FLOAT.FLOATCollectionPublicPath)
            signer.link<&FLOAT.Collection{FLOAT.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(FLOAT.FLOATCollectionPublicPath, target: FLOAT.FLOATCollectionStoragePath)
          }
        }
      }
      `,
      args: (arg, t) => [],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 999
    });
    console.log({ transactionId });
  }

  async function getBad() {
    const response = await fcl.query({
      cadence: `
      import FLOAT from 0x2d4c3caffbeab845
      import NonFungibleToken from 0x1d7e57aa55817448

      pub fun main(user: Address): [String] {
        let account = getAccount(user)
        let bad: [String] = []
        if !account.getCapability<&FLOAT.Collection{FLOAT.CollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver}>(FLOAT.FLOATCollectionPublicPath).check() {
          bad.append("FLOAT")
        }

        return bad
      }
      `,
      args: (arg, t) => [
        arg(user.addr, t.Address)
      ]
    });

    console.log({ response })
  }

  function authenticate() {
    if (user.loggedIn) {
      fcl.unauthenticate()
    } else {
      fcl.authenticate()
    }
  }

  return (
    <div>
      <Head>
        <title>Relink Tool</title>
        <meta name="description" content="Created by Emerald City" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav>
        <h1>ReLink</h1>
        <button onClick={authenticate}>{user.loggedIn ? user.addr : 'Log In'}</button>
      </nav>

      <main>
        <button onClick={relink}>Relink your Collections</button>
        <p>{JSON.stringify(bad)}</p>
      </main>

      <Footer />
    </div>
  )
}
