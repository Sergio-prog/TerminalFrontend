import { useMutation, useQuery } from "react-query";
import api from './apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
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
  base_token: string;
  quote_token: string;
  tokenAddress: string;
  symbol: string;
  icon: string;
  price_ton: number;
  price_usd: number;
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

export interface Position {
  id: string;
  base_token: string;
  quote_token: string;
  base_token_address: string;
  quote_token_address: string;
  created_at_price: number;
  created_at_native_price: number;
  sold_price: number;
  sold_native_price: number;
  user: string;
  pair_address: string;
  created_at: string;
  updated_at: string;
}

export interface UserWallet {
  address: string;
  created_at: string;
}

export interface CreatedUserWallet extends UserWallet {
  mnemonic: string;
  public_key: string;
}

export interface User {
  address: string;
  created_at: string;
  wallet: UserWallet;
}

export const useSignup = () => {
  return useMutation(async (data: { signature: string, address: string, message: string }): Promise<CreatedUserWallet> => {
    const response = await api.post('/signup/', data);
    return response.data;
  });
};

export const useLogin = () => {
  return useMutation(async (data: { signature: string, address: string, message: string }) => {
    const response = await api.post('/login/', data);
    return response.data;
  });
};

export const useUserMe = () => {
  return useQuery('userMe', async (): Promise<User> => {
    const response = await api.get('/users/me/');
    return response.data;
  }, {
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useCheckUserExists = (address: string | undefined) => {
  return useQuery(
    ['checkUserExists', address],
    async (): Promise<boolean> => {
      if (!address) return false;
      try {
        const response = await api.get(`/users/${address}/exists`);
        console.log(`Address checked: ${address}`);
        console.log(`User exists: ${response.data.exists}`);
        return response.data.exists;
      } catch (error) {
        console.error('Error checking if user exists:', error);
        return false;
      }
    }
  );
};

// export const checkUserExists = (address: string) => {
//   return useQuery('IsUserExists', async (): Promise<boolean> => {
//     const response = await api.get(`/users/${address}/exists`);
//     return response.data.exists;
//   });
// };


// export const checkUserExists = async (address: string): Promise<boolean> => {
//   try {
//     const response = await api.get(`/users/${address}/exists`);
//     return response.data.exists;
//   } catch (error) {
//     console.error('Error checking if user exists:', error);
//     return false;
//   }
// };

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
    }));
  } catch (error) {
    throw error;
  }
}

export async function signUp(address: string, message: string, proof: string): Promise<UserWallet | null> {
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
    const data: UserWallet = await response.json();
    console.log(data);

    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function fetchPairDetail(address: string): Promise<PairDetail> {
  try {
    const response = await fetch(`${API_BASE_URL}/pairs/${address}`);
    if (!response.ok) throw new Error('Failed to fetch token details');
    const data: PairDetail = await response.json();

    return mapPairDetailToTokenDetail(data);
  } catch (error) {
    console.error('Error fetching token detail:', error);
    throw error;
  }
}

export function mapPairDetailToTokenDetail(data: any): PairDetail {
  const timeRanges: TimeRange[] = ['m5', 'h1', 'h6', 'h24'];

  return {
    name: data.base_token.symbol,
    base_token: data.base_token.symbol,
    quote_token: data.quote_token.symbol,
    tokenAddress: data.base_token.address,
    icon: data.attributes?.image_url || data.info?.imageUrl,
    symbol: data.attributes?.symbol,
    price_ton: data.price_native,
    price_usd: data.price_usd, // base token price
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

export async function getPairBySearch(searchTerm: string): Promise<NewPair[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/pairs/?search=${encodeURIComponent(searchTerm)}`);
    if (!response.ok) throw new Error('Failed to fetch search results');
    const data = await response.json();

    return data.results.map((item: any) => ({
      url: item.url,
      chainId: item.chain_id,
      tokenAddress: item.pair_address,
      icon: item.info?.imageUrl || '/images/missing.png',
      header: item.base_token.name,
      symbol: item.base_token.symbol,
      marketCap: item.market_cap || null,
      volume: item.volume.h24 || 0,
      baseToken: {
        address: item.base_token.address,
        name: item.base_token.name,
        symbol: item.base_token.symbol,
      }
    }));
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
}

export async function fetchPositions(): Promise<Position[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/positions/`);
    if (!response.ok) throw new Error('Failed to fetch positions');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching positions:', error);
    throw error;
  }
}
