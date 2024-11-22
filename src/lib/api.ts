const API_BASE_URL = 'https://secret-ocean-19070-7d15bdda8dde.herokuapp.com/api';
export type TimeRange = 'm5' | 'h1' | 'h6' | 'h24';

export interface NewPair {
  url: string; // The pair URL or unique identifier
  chainId: string; // Chain or DEX ID
  tokenAddress: string; // Token's address on the blockchain
  icon: string; // URL of the token's icon
  header: string; // Token name
  symbol: string; // Token symbol
  marketCap: number | null; // Market cap in USD
  volume: number; // 24-hour trading volume in USD
  description: string; // Additional description or metadata
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
  name: string; // Base token name
  tokenAddress: string;
  symbol: string;
  icon: string; // Base token image URL
  price: number; // Price in USD
  change24h: number; // 24-hour price change percentage
  marketCap: number; // Market capitalization
  supply: number; // Total supply (from liquidity base)
  poolAddress: string; // Pair address
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
        ? '/public/images/missing.png' // Fallback to local missing image
        : item.attributes.image_url, // Use the provided URL if available
      header: item.attributes.name,
      symbol: item.attributes.symbol,
      marketCap: item.attributes.market_cap_usd || item.attributes.fdv_usd || null,
      volume: parseFloat(item.attributes.volume_usd.h24 || 0),
      description: `Market Cap: $${item.attributes.market_cap_usd || 'N/A'}, Volume: $${item.attributes.volume_usd.h24 || 'N/A'}`,
      baseToken: {
        address: item.relationships.base_token.data.id,
        name: item.attributes.name,
        symbol: item.attributes.symbol,
      },
      links: [], // Add links if applicable
    }));
  } catch (error) {
    console.error('Error fetching new pairs:', error);
    throw error;
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




// export async function fetchPairDetail(pairAddress: string): Promise<PairDetail> {
//     try {
//         const response = await fetch(`${API_BASE_URL}/pairs/${pairAddress}`);
//         if (!response.ok) throw new Error('Failed to fetch pair detail');
//         return await response.json();
//     } catch (error) {
//         console.error('Error fetching pair detail:', error);
//         throw error;
//     }
// }
