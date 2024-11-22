import { useState, useEffect } from 'react'
import { ArrowLeft, ChevronRight, Check, Copy } from 'lucide-react'
import { BuyModal } from './ui/buy-modal';
import { SellModal } from './ui/sell-modal';
import { fetchPairDetail, PairDetail } from '../lib/api';
import DexScreenerEmbed from './DexScreenerEmbed';
import { PriceChangeTabs } from './ui/price-change-tabs';
import { VolumeIndicator } from '../components/ui/volume-indicator';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';

type TimeRange = 'm5' | 'h1' | 'h6' | 'h24';

export function TokenDetail({ address, onBack }: { address: string; onBack: () => void }) {
  const [data, setData] = useState<PairDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('h24');

  console.log("TokenDetail component rendered with address:", address);

  useEffect(() => {
      const fetchData = async () => {
          console.log("Fetching details for address:", address);
          setIsLoading(true);
          try {
              const tokenDetail = await fetchPairDetail(address);
              console.log("Fetched data:", tokenDetail);
              setData(tokenDetail);
          } catch (err) {
              console.error("Error fetching pair details:", err);
              setError(err instanceof Error ? err : new Error('An error occurred'));
          } finally {
              setIsLoading(false);
          }
      };

      fetchData();
  }, [address]);

  const handleCopy = async () => {
    if (data?.tokenAddress) {
      await navigator.clipboard.writeText(data.tokenAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
    }
  };

  const formatPercentage = (value: number): { formatted_percentage: string; raw_percentage: number } => {
    return {
        formatted_percentage: `${value > 0 ? '+' : ''}${value.toFixed(2)}%`,
        raw_percentage: value,
    };
  };

  if (isLoading) return <div className="p-4 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error.message}</div>;
  if (!data) return null;

  const { formatted_percentage, raw_percentage } = formatPercentage(data.change24h);

  return (
      <div className="flex flex-col h-full">
          <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-800">
              <div className="flex items-center gap-4">
                  <ArrowLeft onClick={onBack} className="h-8 w-8 cursor-pointer" />
                  <img
                      src={data.icon}
                      alt=""
                      className="w-8 h-8 rounded-full"
                  />
                  <h2 className="text-xl font-bold flex items-center gap-3">
                      {data.name}
                      <button
                          onClick={handleCopy}
                          className="p-0 text-gray-400 hover:text-white transition-colors"
                          title="Copy token address"
                      >
                          {isCopied ? (
                              <Check className="w-4 h-4 text-green-500" />
                          ) : (
                              <Copy className="w-4 h-4" />
                          )}
                      </button>
                  </h2>
              </div>
              <div className="flex gap-8">
                  {/* Market Price */}
                  <div className="text-left">
                      <div className="text-sm font-light text-gray-400">Market price</div>
                      <div className="flex items-center">
                          <span className="text-lg font-semibold">{data.price} TON</span>
                          <span className={`ml-2 text-sm ${raw_percentage > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {formatted_percentage}
                          </span>
                      </div>
                  </div>
                  <div className="text-left">
                      <div className="text-sm font-light text-gray-400">Market cap</div>
                      <div className="text-lg font-semibold">${data.marketCap.toLocaleString()}</div>
                  </div>
              </div>
          </div>

          <div className="mx-5 my-2">
              <DexScreenerEmbed tokenAddress={data.poolAddress} />
          </div>

          <div className="flex justify-between gap-4 p-4">
              <button
                  className="w-1/2 bg-[#14AE5C] text-white font-semibold text-center py-3 rounded"
                  onClick={() => setIsBuyModalOpen(true)}
              >
                  BUY
              </button>
              <button
                  className="w-1/2 bg-[#212121] text-white font-semibold text-center py-3 rounded"
                  onClick={() => setIsSellModalOpen(true)}
              >
                  SELL
              </button>
          </div>

          <BuyModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} />
          <SellModal isOpen={isSellModalOpen} onClose={() => setIsSellModalOpen(false)} />

          <div className="flex-1 overflow-auto">
            <div className="p-4 space-y-4">
              <div className="mt-6">
                <div className="rounded-lg overflow-hidden">
                  <PriceChangeTabs
                    priceChange={data.price_change}
                    selectedTimeRange={selectedTimeRange}
                    onSelectTimeRange={setSelectedTimeRange}
                  />
                  <VolumeIndicator
                    volume={data.volume[selectedTimeRange]}
                    txns={data.txns[selectedTimeRange]}
                  />
                </div>
              </div>
            </div>
          </div>
      </div>
  );
}
