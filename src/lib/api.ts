const API_BASE_URL = 'https://secret-ocean-19070-7d15bdda8dde.herokuapp.com/api';
export type TimeRange = 'm5' | 'h1' | 'h6' | 'h24';

export interface NewPair {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon: string;
  header: string;
  symbol: string;
  marketCap: number | null;
  volume: number;
  description: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  links?: {
    label?: string;
    type?: string;
    url: string;
  }[];
}


export interface PairDetail {
  name: string;
  tokenAddress: string;
  symbol: string;
  icon: string;
  price: number;
  change24h: number;
  marketCap: number;
  supply: number;
  poolAddress: string;
  txns: {
    [key in TimeRange]: {
      buys: number;
      sells: number;
    };
  };
  volume: {
    [key in TimeRange]: number;
  };
  price_change: {
    [key in TimeRange]: number;
  };
}

export interface NewUserWallet {
  address: string;
  mnemonic: string;
  public_key: string;
}

export async function fetchNewPairs(): Promise<NewPair[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/pairs/trending/`);
    if (!response.ok) throw new Error('Failed to fetch new pairs');
    const data = await response.json();

    return data.map((item: any) => ({
      url: item.id,
      chainId: item.relationships.dex.data.id,
      tokenAddress: item.attributes.address,
      icon: item.attributes.image_url === 'missing.png'
        ? '/images/missing.png'
        : item.attributes.image_url,
      header: item.attributes.name,
      symbol: item.attributes.symbol,
      marketCap: item.attributes.market_cap_usd || item.attributes.fdv_usd || null,
      volume: parseFloat(item.attributes.volume_usd.h24 || 0),
      baseToken: {
        address: item.relationships.base_token.data.id,
        name: item.attributes.name,
        symbol: item.attributes.symbol,
      },
      links: [],
    }));
  } catch (error) {
    console.error('Error fetching new pairs:', error);
    throw error;
  }
}

export async function signUp(address: string, message: string, proof: string): Promise<NewUserWallet> {
  try {
    const response = await fetch(`${API_BASE_URL}/signup/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ address, message, signature: proof })
      }
    );
    if (!response.ok) throw new Error('Failed to signUp user');
    const data: NewUserWallet = await response.json();
    console.log(data);

    return data;
  } catch (error) {
    console.error('Error:', error)
  }
}

export async function fetchPairDetail(address: string): Promise<PairDetail> {
  try {
    const response = await fetch(`${API_BASE_URL}/pairs/${address}`);
    if (!response.ok) throw new Error('Failed to fetch token details');
    const data: PairDetail = await response.json();
    console.log(data);

    return mapPairDetailToTokenDetail(data);
  } catch (error) {
    console.error('Error fetching token detail:', error);
    throw error;
  }
}

export function mapPairDetailToTokenDetail(data: any): PairDetail {
  const timeRanges: TimeRange[] = ['m5', 'h1', 'h6', 'h24'];

  console.log("assd", data.attributes?.image_url, data.info?.imageUrl, data.attributes)
  return {
    name: data.base_token.name,
    tokenAddress: data.base_token.address,
    icon: data.attributes?.image_url || data.info?.imageUrl,
    symbol: data.attributes?.symbol,
    price: data.price_usd,
    change24h: data.price_change.h24,
    marketCap: data.market_cap || 0,
    supply: data.liquidity.base || 0,
    poolAddress: data.pair_address,
    txns: timeRanges.reduce((acc, range) => {
      acc[range] = {
        buys: data.txns[range].buys,
        sells: data.txns[range].sells
      };
      return acc;
    }, {} as PairDetail['txns']),
    volume: timeRanges.reduce((acc, range) => {
      acc[range] = data.volume[range] || 0;
      return acc;
    }, {} as PairDetail['volume']),
    price_change: timeRanges.reduce((acc, range) => {
      acc[range] = data.price_change[range] || 0;
      return acc;
    }, {} as PairDetail['price_change'])
  };
}
