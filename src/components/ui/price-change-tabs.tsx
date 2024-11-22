import { cn } from "../../lib/utils"

type TimeRange = 'm5' | 'h1' | 'h6' | 'h24';

interface PriceChangeTabsProps {
  priceChange: {
    [key in TimeRange]: number;
  };
  selectedTimeRange: TimeRange;
  onSelectTimeRange: (timeRange: TimeRange) => void;
}

const timeRangeDisplay = {
  'm5': '5m',
  'h1': '1h',
  'h6': '6h',
  'h24': '24h'
};

export function PriceChangeTabs({ priceChange, selectedTimeRange, onSelectTimeRange }: PriceChangeTabsProps) {
  const timeRanges: TimeRange[] = ['m5', 'h1', 'h6', 'h24'];

  return (
    <div className="bg-neutral-900 rounded-t-lg overflow-hidden">
      <div className="flex">
        {timeRanges.map((range) => (
          <button
            key={range}
            onClick={() => onSelectTimeRange(range)}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium transition-colors",
              selectedTimeRange === range
                ? "bg-neutral-800 text-white"
                : "text-gray-400 hover:text-white",
              "rounded-t-md rounded-b-none"
            )}
          >
            <div>{timeRangeDisplay[range]}</div>
            <div className={cn(
              "text-sm",
              priceChange[range] > 0 ? "text-green-400" : "text-red-400"
            )}>
              {priceChange[range] > 0 ? '+' : ''}{priceChange[range].toFixed(2)}%
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

