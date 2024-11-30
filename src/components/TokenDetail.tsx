import { useState, useEffect, useRef } from 'react'
import { Check, Copy, ChevronRight, ChevronLeft } from 'lucide-react'
import { BuyModal } from './ui/buy-modal';
import { SellModal } from './ui/sell-modal';
import { fetchPairDetail, PairDetail } from '../lib/api';
import DexScreenerEmbed from './DexScreenerEmbed';
import { PriceChangeTabs } from './ui/price-change-tabs';
import { VolumeIndicator } from '../components/ui/volume-indicator';
import WebApp from '@twa-dev/sdk'

type TimeRange = 'm5' | 'h1' | 'h6' | 'h24';

export function TokenDetail({ address, onBack }: { address: string; onBack: () => void }) {
    const [data, setData] = useState<PairDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [isSellModalOpen, setIsSellModalOpen] = useState(false);
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('h24');
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const tokenDetail = await fetchPairDetail(address);
                setData(tokenDetail);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('An error occurred'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

        WebApp.BackButton.show();
        WebApp.BackButton.onClick(onBack);

        const checkScrollable = () => {
            if (contentRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = contentRef.current;
                setCanScrollLeft(scrollLeft > 0);
                setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
            }
        };

        checkScrollable();
        window.addEventListener('resize', checkScrollable);

        return () => {
            WebApp.BackButton.offClick(onBack);
            WebApp.BackButton.hide();
            window.removeEventListener('resize', checkScrollable);
        };
    }, [address, onBack]);

    const handleCopy = async () => {
        if (data?.tokenAddress) {
            await navigator.clipboard.writeText(data.tokenAddress);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const formatPercentage = (value: number): { formatted_percentage: string; raw_percentage: number } => {
        return {
            formatted_percentage: `${value > 0 ? '+' : ''}${value.toFixed(2)}%`,
            raw_percentage: value,
        };
    };

    const scrollHeader = (direction: 'left' | 'right') => {
        if (contentRef.current) {
            const scrollAmount = 100;
            contentRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            setTimeout(() => {
                if (contentRef.current) {
                    const { scrollLeft, scrollWidth, clientWidth } = contentRef.current;
                    setCanScrollLeft(scrollLeft > 0);
                    setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
                }
            }, 300);
        }
    };

    if (isLoading) return <div className="p-4 text-center text-gray-500">Loading...</div>;
    if (error) return <div className="p-4 text-center text-red-500">{error.message}</div>;
    if (!data) return null;

    const { formatted_percentage, raw_percentage } = formatPercentage(data.change24h);

    return (
        <div className="flex flex-col h-full">
            <div className="relative border-b border-gray-800" ref={headerRef}>
                <div
                    ref={contentRef}
                    className="flex items-center p-4 overflow-x-auto scrollbar-hide"
                    onScroll={() => {
                        if (contentRef.current) {
                            const { scrollLeft, scrollWidth, clientWidth } = contentRef.current;
                            setCanScrollLeft(scrollLeft > 0);
                            setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
                        }
                    }}
                >
                    <div className="flex items-center gap-4 flex-shrink-0 mr-8">
                        <img
                            src={data.icon ?? "/images/missing.png"}
                            alt={`${data.name} icon`}
                            className="w-8 h-8 rounded-full"
                        />
                        <h2 className="text-base font-bold flex items-center gap-3">
                            {data.name}
                            <button
                                onClick={handleCopy}
                                className="p-0 text-gray-400 hover:text-white transition-colors"
                                title="Copy token address"
                                aria-label={isCopied ? "Token address copied" : "Copy token address"}
                            >
                                {isCopied ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </button>
                        </h2>
                    </div>
                    <div className="flex gap-8 flex-shrink-0">
                        <div className="text-left">
                            <div className="text-sm font-light text-gray-400">Market price</div>
                            <div className="flex items-center">
                                <span className="text-lg font-semibold">{data.price}$</span>
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
                {canScrollLeft && (
                    <button
                        onClick={() => scrollHeader('left')}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-neutral-800 rounded-r-full p-1 focus:outline-none"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-4 h-4 text-gray-400" />
                    </button>
                )}
                {canScrollRight && (
                    <button
                        onClick={() => scrollHeader('right')}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-neutral-800 rounded-l-full p-1 focus:outline-none"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                )}
            </div>

            <div className="mx-5 my-2">
                <DexScreenerEmbed tokenAddress={data.poolAddress} />
            </div>

            <div className="flex justify-between gap-3 p-4 pb-0">
                <button
                    className="w-1/2 bg-[#14AE5C] text-white font-semibold text-center py-3 rounded"
                    onClick={() => setIsBuyModalOpen(true)}
                >
                    BUY
                </button>
                <button
                    className="w-1/2 bg-[#FF7373] text-white font-semibold text-center py-3 rounded"
                    onClick={() => setIsSellModalOpen(true)}
                >
                    SELL
                </button>
            </div>

            <BuyModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} pairSymbol={data.name} pairPrice={data.price} />
            <SellModal isOpen={isSellModalOpen} onClose={() => setIsSellModalOpen(false)} pairSymbol={data.name} pairPrice={data.price} />

            <div className="flex-1 overflow-auto">
                <div className="p-4 pt-0 space-y-4">
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

