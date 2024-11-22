import { useState, useEffect, useRef } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { cn } from "../../lib/utils"
import { useTonConnectUI } from '@tonconnect/ui-react'
import { ConnectButton } from '../ConnectButton'

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BuyModal({ isOpen, onClose }: BuyModalProps) {
  const [tonConnectUI] = useTonConnectUI();
  const isWalletConnected = tonConnectUI.connected;
  const [tonBalance] = useState(5.7789)
  const [tonAmount, setTonAmount] = useState(0)
  const [activePercentage, setActivePercentage] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)

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
    <div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50 sm:items-center" onClick={onClose}>
      <div
        ref={modalRef}
        className="bg-neutral-900 text-white p-6 rounded-t-lg sm:rounded-lg w-full sm:w-[28rem] space-y-6 max-h-[75vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Buy Token</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex justify-between items-center gap-6">
          <div className={cn("flex-1 flex justify-between items-center p-3 rounded-md", "bg-neutral-800")}>
            <div className="flex items-center gap-2">
              <img src="/images/ton_logo.png" alt="TON Logo" className="w-6 h-6" />
              <span>Balance</span>
            </div>
            <span>{isWalletConnected ? tonBalance.toFixed(4) : '-'}</span>
          </div>

          <div className={cn("flex-1 flex justify-between items-center p-3 rounded-md relative", "bg-neutral-800")}>
            <select className="bg-transparent focus:outline-none appearance-none pr-8 w-full" disabled={!isWalletConnected}>
              <option>Market</option>
              <option>Limit</option>
            </select>
            <ChevronDown className="h-4 w-4 absolute right-3 pointer-events-none" />
          </div>
        </div>

        <div className={cn("flex justify-between items-center p-3 rounded-md", "bg-neutral-800")}>
          <div className="flex items-center gap-2">
            <img src="/images/ton_logo.png" alt="TON Logo" className="w-6 h-6" />
            <span>TON</span>
          </div>
          <input
            type="number"
            value={tonAmount}
            onChange={(e) => isWalletConnected && setTonAmount(Number(e.target.value))}
            className="bg-transparent text-right w-24 focus:outline-none"
            placeholder="Amount"
            disabled={!isWalletConnected}
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
            { label: "Entry price", value: "0.0234 USD" },
            { label: "Position size", value: "0 DOGS" },
            { label: "Slippage", value: "2%" },
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
          <button className="w-full bg-[#14AE5C] hover:bg-[#119a4f] text-white font-bold py-2.5 rounded-md text-lg">
            BUY
          </button>
        )}
      </div>
    </div>
  )
}

