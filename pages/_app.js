import TransactionProvider from '../context/TransactionContext'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <TransactionProvider>
      <Component {...pageProps} />
    </TransactionProvider>
  )
}

export default MyApp
