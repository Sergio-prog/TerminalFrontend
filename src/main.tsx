import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { tonConnectOptions } from './lib/ton-connect.ts'
import WebApp from '@twa-dev/sdk'
// import { tonConnectOptions } from './lib/ton-connect.ts'

WebApp.ready();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={tonConnectOptions.manifestUrl}>
      <Router>
        <App />
      </Router>
    </TonConnectUIProvider>
  </React.StrictMode>,
)