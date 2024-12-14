import { useState, useEffect, useRef } from 'react';
import { X, Copy } from 'lucide-react';
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

interface SignupSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  mnemonic: string;
}

export function SignupSuccessModal({ isOpen, onClose, address, mnemonic }: SignupSuccessModalProps) {
  const [isChecked, setIsChecked] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Mnemonic phrase copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setIsDragging(true);
      setStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      if (deltaY > 50) {
        onClose();
        setIsDragging(false);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.addEventListener('touchstart', handleTouchStart);
      modalElement.addEventListener('touchmove', handleTouchMove);
      modalElement.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (modalElement) {
        modalElement.removeEventListener('touchstart', handleTouchStart);
        modalElement.removeEventListener('touchmove', handleTouchMove);
        modalElement.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isDragging, startY, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50 sm:items-center z-50" onClick={onClose}>
      <div
        ref={modalRef}
        className="bg-neutral-900 text-white p-6 rounded-t-lg sm:rounded-lg w-full sm:w-[28rem] space-y-6 max-h-[75vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Signup Successful</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className={cn("flex flex-col p-3 rounded-md", "bg-neutral-800")}>
            <span className="text-sm text-neutral-400">Your wallet address is:</span>
            <span className="font-mono break-all">{address}</span>
          </div>

          <div className={cn("flex flex-col p-3 rounded-md", "bg-neutral-800")}>
            <span className="text-sm text-neutral-400">Your mnemonic phrase, please, save it:</span>
            <div className="relative mt-2">
              <textarea
                className="bg-transparent w-full h-24 resize-none font-mono pr-10 focus:outline-none"
                readOnly
                value={mnemonic}
              />
              <Button
                className="absolute right-2 top-2 p-2"
                variant="ghost"
                onClick={() => copyToClipboard(mnemonic)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={isChecked}
              onCheckedChange={(checked) => setIsChecked(checked as boolean)}
              className="border-white data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
            />
            <Label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-2"
            >
              I understand that if I lose this mnemonic phrase, I'll lose access to my assets
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!isChecked}
          onClick={onClose}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-md text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          OK
        </Button>
      </div>
    </div>
  );
}

