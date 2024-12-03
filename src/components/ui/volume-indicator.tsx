interface VolumeIndicatorProps {
  volume: number;
  txns: {
    buys: number;
    sells: number;
  };
}

export function VolumeIndicator({ volume, txns }: VolumeIndicatorProps) {
  const totalTxns = txns.buys + txns.sells;
  const buyVolume = totalTxns === 0 ? 0 : volume * (txns.buys / totalTxns);
  const sellVolume = totalTxns === 0 ? 0 : volume * (txns.sells / totalTxns);

  return (
    <div className="bg-neutral-800 rounded-b-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-green-400">
          ${buyVolume.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </div>
        <div className="text-gray-400">
          Volume: ${volume.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </div>
        <div className="text-red-400">
          ${sellVolume.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </div>
      </div>
      <div
        className={`h-1.5 rounded-full overflow-hidden flex ${
          totalTxns === 0 ? "bg-neutral-600" : "bg-neutral-700"
        }`}
      >
        {totalTxns > 0 && (
          <>
            <div
              className="h-full bg-green-500"
              style={{ width: `${(txns.buys / totalTxns) * 100}%` }}
            />
            <div
              className="h-full bg-red-500"
              style={{ width: `${(txns.sells / totalTxns) * 100}%` }}
            />
          </>
        )}
      </div>
    </div>
  );
}
