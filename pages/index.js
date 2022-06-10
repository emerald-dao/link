import Head from 'next/head'
import Image from 'next/image'
import * as fcl from "@onflow/fcl";
import { useEffect, useState } from 'react';
import Footer from '../components/Layout/Footer';
import { useTransaction } from '../context/TransactionContext';
import Transaction from '../components/Transaction';

fcl.config()
  .put("accessNode.api", "https://rest-mainnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/authn")

export default function Home() {
  const [user, setUser] = useState({ loggedIn: false });
  const [bad, setBad] = useState([]);
  const { setTxId, setTransactionStatus, initTransactionState, setTransactionInProgress } = useTransaction();

  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
  }, [])

  useEffect(() => {
    if (user.addr) {
      getBad();
    }
  }, [user])

  async function relink() {
    initTransactionState();
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
    setTxId(transactionId);

    fcl.tx(transactionId).subscribe((res) => {
      setTransactionStatus(res.status);
      if (res.status === 4) {
        setTimeout(() => setTransactionInProgress(false), 2000)
      }
    })
    await fcl.tx(transactionId).onceSealed();
    getBad();
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

    setBad(response)
  }

  function authenticate() {
    if (user.loggedIn) {
      fcl.unauthenticate()
    } else {
      fcl.authenticate()
    }
  }

  if (!user.loggedIn) {
    <div>
      <Head>
        <title>Relink Tool</title>
        <meta name="description" content="Created by Emerald City" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav>
        <h1>ReLink</h1>
        <button onClick={authenticate}><span>{user.loggedIn ? user.addr : 'Log In'}</span></button>
      </nav>

      <main>
        <div className="middle-box green">
          <p>Please log in.</p>
        </div>
      </main>

      <Footer />
    </div>
  } else if (bad.length === 0) {
    return (
      <div>
        <Head>
          <title>Relink Tool</title>
          <meta name="description" content="Created by Emerald City" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <nav>
          <h1>ReLink</h1>
          <button onClick={authenticate}><span>{user.loggedIn ? user.addr : 'Log In'}</span></button>
        </nav>

        <main>
          <div className="middle-box green">
            <img src="/check-mark.png" />
            <p>Your collections are all linked correctly!</p>
          </div>
        </main>

        <Footer />
      </div>
    )
  } else {
    return (
      <div>
        <Head>
          <title>Relink Tool</title>
          <meta name="description" content="Created by Emerald City" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <nav>
          <h1>ReLink</h1>
          <button onClick={authenticate}><span>{user.loggedIn ? user.addr : 'Log In'}</span></button>
        </nav>

        <main>
          <div className="middle-box">
            <p>The following collections are not linked properly:</p>
            <div className="incorrect-list">
              {bad.map((incorrectCollection, i) => (
                <div className="list-item" key={i}>
                  <img src={`/${incorrectCollection}.png`} alt={`${incorrectCollection} logo`} />
                  <p>{incorrectCollection}</p>
                </div>
              ))}
            </div>
            <button onClick={relink}>Relink your collections</button>
          </div>
        </main>

        <Footer />
        <Transaction />
      </div>
    )
  }
}
