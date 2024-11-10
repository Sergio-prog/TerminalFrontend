'use client'

import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { ReactNode } from 'react'
import { tonConnectOptions } from '../lib/ton-connect'

export function TonConnectProvider({ children }: { children: ReactNode }) {
    return (
        <TonConnectUIProvider manifestUrl={tonConnectOptions.manifestUrl} >
            {children}
        </TonConnectUIProvider>
    )
}