import { useState, useEffect, useRef } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { cn } from "../../lib/utils"
import { useTonConnectUI } from '@tonconnect/ui-react'
import { ConnectButton } from '../ConnectButton'

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  pairSymbol: string;
  pairPrice: number;
  base_token: string; // KAT
  base_token_icon: string;
  quote_token: string; // TON
}

type OrderType = 'Market' | 'Limit';
type LimitType = 'MC is' | 'Price';

export function SellModal({ isOpen, onClose, pairSymbol, pairPrice, base_token, base_token_icon, quote_token }: SellModalProps) {
  const [tonConnectUI] = useTonConnectUI();
  const isWalletConnected = tonConnectUI.connected;
  const [tonBalance] = useState(5.77)
  const [tonAmount, setTonAmount] = useState(0)
  const [activePercentage, setActivePercentage] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [orderType, setOrderType] = useState<OrderType>('Market')
  const [limitType, setLimitType] = useState<LimitType>('MC is')
  const [_, setLimitValue] = useState(0)

  const handlePercentageClick = (percentage: number) => {
    if (isWalletConnected) {
      setTonAmount(Number((tonBalance * percentage / 100).toFixed(4)));
      setActivePercentage(percentage);
    }
  };

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setIsDragging(true)
      setStartY(e.touches[0].clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      const currentY = e.touches[0].clientY
      const deltaY = currentY - startY
      if (deltaY > 50) {
        onClose()
        setIsDragging(false)
      }
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
    }

    const modalElement = modalRef.current
    if (modalElement) {
      modalElement.addEventListener('touchstart', handleTouchStart)
      modalElement.addEventListener('touchmove', handleTouchMove)
      modalElement.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      if (modalElement) {
        modalElement.removeEventListener('touchstart', handleTouchStart)
        modalElement.removeEventListener('touchmove', handleTouchMove)
        modalElement.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, startY, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50 sm:items-center z-50" onClick={onClose}>
      <div
        ref={modalRef}
        className="bg-neutral-900 text-white p-6 rounded-t-lg sm:rounded-lg w-full sm:w-[28rem] space-y-6 max-h-[75vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Sell {pairSymbol}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex justify-between items-center gap-6">
          <div className={cn("flex-1 flex justify-between items-center p-3 rounded-md", "bg-neutral-800")}>
            <div className="flex items-center gap-2">
              <img src={base_token_icon} alt="TON Logo" className="w-6 h-6" />
              <span>Balance</span>
            </div>
            <span>{isWalletConnected ? tonBalance.toFixed(2) : '-'}</span>
          </div>

          <div className={cn("flex-1 flex justify-between items-center p-3 rounded-md", "bg-neutral-800")}>
            <div className="relative flex-1">
              <select
                className="bg-transparent focus:outline-none appearance-none w-full pr-4"
                disabled={!isWalletConnected}
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as OrderType)}
              >
                <option>Market</option>
                <option>Limit</option>
              </select>
              <ChevronDown className="h-4 w-4 absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {orderType === 'Limit' && (
          <div className={cn("flex justify-between items-center p-3 rounded-md", "bg-neutral-800")}>
            <div className="flex items-center relative">
              <select
                className="bg-transparent focus:outline-none appearance-none w-full pr-6"
                value={limitType}
                onChange={(e) => setLimitType(e.target.value as LimitType)}
              >
                <option>MC is</option>
                <option>Price</option>
              </select>
              <ChevronDown className="h-4 w-4 absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
            <input
              type="text"
              value={0}
              onChange={(e) => {
                const value = e.target.value;
                if (/\d*$/.test(value)) {
                  setLimitValue(value === "" ? 0 : Number(value));
                }
              }}
              className="bg-transparent text-right focus:outline-none flex-grow placeholder-gray-500 ml-3"
              placeholder="$"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
        )}

        <div className={cn("flex justify-between items-center p-3 rounded-md", "bg-neutral-800")}>
          <div className="flex items-center gap-2">
            <img src={base_token_icon} alt="TON Logo" className="w-6 h-6" />
            <span>{base_token}</span>
          </div>
          <input
            type="text"
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d*$/.test(value)) {
                setTonAmount(value === "" ? 0 : parseFloat(value));
              }
            }}
            className="bg-transparent text-right w-24 focus:outline-none"
            placeholder="Amount"
            disabled={!isWalletConnected}
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
          />
        </div>

        <div className="flex justify-between gap-2">
          {[25, 50, 75, 100].map((percentage) => (
            <button
              key={percentage}
              onClick={() => handlePercentageClick(percentage)}
              className={cn(
                "flex-1 text-white rounded-md p-2",
                isWalletConnected
                  ? activePercentage === percentage
                    ? "bg-neutral-600"
                    : "bg-neutral-800 hover:bg-neutral-700"
                  : "bg-neutral-800 opacity-50 cursor-not-allowed"
              )}
              disabled={!isWalletConnected}
            >
              {percentage}%
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {[
            { label: "Entry price", value: `${pairPrice} ${quote_token}`},
            { label: "Position size", value: `${pairPrice > 0 && !isNaN(tonAmount) && !isNaN(pairPrice) ? (tonAmount / pairPrice).toFixed(2) : "0.00"} ${pairSymbol}` },
            { label: "Slippage", value: "10%" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-neutral-400">{label}</span>
              <span>{isWalletConnected ? value : '-'}</span>
            </div>
          ))}
        </div>

        {!isWalletConnected ? (
          <ConnectButton className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-md text-lg" />
        ) : (
          <button className="w-full bg-[#FF7373] hover:bg-[#ff5959] text-white font-bold py-2.5 rounded-md text-lg">
            SELL
          </button>
        )}
      </div>
    </div>
  )
}

