import { useState, useEffect } from 'react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { Button } from "./ui/button"

interface TokenDetail {
    id: string
    name: string
    icon: string
    price: number
    change24h: number
    marketCap: number
    volume: number
    supply: number
}

const TokenDetails: Record<string, TokenDetail> = {
  "1": {
      id: "1",
      name: "DOGS",
      icon: "../../public/images/token_logo/dogs.svg",
      price: 0.1234,
      change24h: 5.67,
      marketCap: 340000000,
      volume: 217000000,
      supply: 1000000000
  },
  "2": {
      id: "2",
      name: "Scale",
      icon: "../../public/images/token_logo/scale.svg",
      price: 2.3456,
      change24h: -3.21,
      marketCap: 340000000,
      volume: 217000000,
      supply: 500000000
  },
  "3": {
      id: "3",
      name: "Durev",
      icon: "../../public/images/token_logo/durev.svg",
      price: 1.5678,
      change24h: 1.23,
      marketCap: 340000000,
      volume: 217000000,
      supply: 800000000
  },
  "4": {
      id: "4",
      name: "TCAT",
      icon: "../../public/images/token_logo/tcat.svg",
      price: 0.9876,
      change24h: 2.34,
      marketCap: 340000000,
      volume: 217000000,
      supply: 750000000
  },
  "5": {
      id: "5",
      name: "AIC",
      icon: "../../public/images/token_logo/aic.svg",
      price: 3.7890,
      change24h: -1.56,
      marketCap: 340000000,
      volume: 217000000,
      supply: 600000000
  },
  "6": {
      id: "6",
      name: "AMORE",
      icon: "../../public/images/token_logo/amore.svg",
      price: 0.4567,
      change24h: 4.56,
      marketCap: 340000000,
      volume: 217000000,
      supply: 900000000
  },
  "7": {
      id: "7",
      name: "Redo",
      icon: "../../public/images/token_logo/redo.svg",
      price: 1.2345,
      change24h: -0.45,
      marketCap: 340000000,
      volume: 217000000,
      supply: 850000000
  },
  "8": {
      id: "8",
      name: "Batya",
      icon: "../../public/images/token_logo/batya.svg",
      price: 2.8901,
      change24h: 3.89,
      marketCap: 340000000,
      volume: 217000000,
      supply: 700000000
  }
};

export function TokenDetail({ pairId, onBack }: { pairId: string, onBack: () => void }) {
    const [data, setData] = useState<TokenDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 500));
                const tokenDetail = TokenDetails[pairId];
                if (!tokenDetail) {
                    throw new Error('Token not found');
                }
                setData(tokenDetail);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('An error occurred'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [pairId]);

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value)
    }

    const formatPercentage = (value: number) => {
        return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
    }

    if (isLoading) return <div className="p-4 text-center text-gray-500">Loading...</div>
    if (error) return <div className="p-4 text-center text-red-500">Error loading data</div>
    if (!data) return null;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-gray-800">
                <ArrowLeft onClick={onBack} className="h-8 w-8 cursor-pointer" />

                <img src={data.icon} alt="" className="w-8 h-8 rounded-full" />
                <h2 className="text-xl font-bold">{data.name}</h2>
            </div>

            {/* Price and Change */}
            <div className="flex justify-between items-center p-4 bg-gray-900">
                <div>
                    <div className="text-2xl font-bold">{formatNumber(data.price)}</div>
                    <div className={`text-sm ${data.change24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercentage(data.change24h)}
                    </div>
                </div>
                <Button className="bg-blue-500 hover:bg-blue-600">Trade</Button>
            </div>

            {/* Token Stats */}
            <div className="flex-1 overflow-auto">
                <div className="p-4 space-y-4">
                    <StatItem label="Market Cap" value={formatNumber(data.marketCap)} />
                    <StatItem label="Volume" value={formatNumber(data.volume)} />
                    <StatItem label="Supply" value={data.supply.toLocaleString()} />
                </div>
            </div>
        </div>
    )
}

function StatItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400">{label}</span>
            <div className="flex items-center gap-2">
                <span>{value}</span>
                <ChevronRight className="h-4 w-4 text-gray-500" />
            </div>
        </div>
    )
}