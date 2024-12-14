import { useState, useEffect } from 'react';
import { Wallet, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface WalletDropdownProps {
  wallet: string;
}

export function WalletDropdown({ wallet }: WalletDropdownProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(wallet);
      setIsCopied(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-gray-800">
          <Wallet className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-gray-800 border border-gray-700">
        <DropdownMenuItem className="flex items-center justify-between px-4 py-2">
          <span className="mr-2 text-gray-300">{wallet}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              copyToClipboard();
            }}
            className="text-blue-500 hover:bg-gray-700 relative"
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-gray-400 absolute" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

