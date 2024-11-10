const API_BASE_URL = 'YOUR_API_BASE_URL';

export interface NewPair {
    url: string;
    chainId: string;
    tokenAddress: string;
    icon: string;
    header: string;
    openGraph: string;
    description: string;
    links: {
        label?: string;
        type?: string;
        url: string;
    }[];
}

export interface PairDetail {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: {
        address: string;
        name: string;
        symbol: string;
    };
    quoteToken: {
        address: string;
        name: string;
        symbol: string;
    };
    priceNative: string;
    priceUsd: string;
    txns: {
        m5: { buys: number; sells: number };
        h1: { buys: number; sells: number };
        h6: { buys: number; sells: number };
        h24: { buys: number; sells: number };
    };
    volume: {
        h24: number;
        h6: number;
        h1: number;
        m5: number;
    };
    priceChange: {
        m5: number;
        h1: number;
        h6: number;
        h24: number;
    };
    liquidity: {
        usd: number;
        base: number;
        quote: number;
    };
    fdv: number;
    marketCap: number;
    pairCreatedAt: number;
    info: {
        imageUrl: string;
        header: string;
        openGraph: string;
        websites: { label: string; url: string; }[];
        socials: { type: string; url: string; }[];
    };
}

export async function fetchNewPairs(): Promise<NewPair[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/pairs/new/`);
        if (!response.ok) throw new Error('Failed to fetch new pairs');
        return await response.json();
    } catch (error) {
        console.error('Error fetching new pairs:', error);
        throw error;
    }
}

export async function fetchPairDetail(pairAddress: string): Promise<PairDetail> {
    try {
        const response = await fetch(`${API_BASE_URL}/pairs/${pairAddress}`);
        if (!response.ok) throw new Error('Failed to fetch pair detail');
        return await response.json();
    } catch (error) {
        console.error('Error fetching pair detail:', error);
        throw error;
    }
}
