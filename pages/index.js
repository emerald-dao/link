import Head from 'next/head'
import Image from 'next/image'
import * as fcl from "@onflow/fcl";
import { useEffect, useState } from 'react';
import Footer from '../components/Layout/Footer';
import { useTransaction } from '../context/TransactionContext';
import Transaction from '../components/Transaction';
import { checkScript } from '../flow/cadence/scripts/check';
import { linkTx } from '../flow/cadence/transactions/link';

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
      cadence: linkTx,
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
      cadence: checkScript,
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
    return (
      <div>
        <Head>
          <title>Link</title>
          <meta name="description" content="Created by Emerald City" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <nav>
          <h1>Link</h1>
          <button onClick={authenticate}><span>{user.loggedIn ? user.addr : 'Log In'}</span></button>
        </nav>

        <main>
          <div className="middle-box">
            <p>Please log in.</p>
          </div>
        </main>

        <Footer />
      </div>
    )
  } else if (bad.length === 0) {
    return (
      <div>
        <Head>
          <title>Link</title>
          <meta name="description" content="Created by Emerald City" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <nav>
          <h1>Link</h1>
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
          <title>Link</title>
          <meta name="description" content="Created by Emerald City" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <nav>
          <h1>Link</h1>
          <button onClick={authenticate}><span>{user.loggedIn ? user.addr : 'Log In'}</span></button>
        </nav>

        <main>
          <div className="middle-box red">
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
