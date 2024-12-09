'use client'

import logo from '../../public/images/logo.svg';
import { useEffect, useState, useRef } from 'react';
import { toUserFriendlyAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { TokenDetail } from '../components/TokenDetail';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Search, LogOut, X } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import { fetchNewPairs, NewPair, getPairBySearch, fetchPositions, Position } from '../lib/api';
import { ConnectButton } from '../components/ConnectButton';
import { Input } from '../components/ui/input';

function TradingPairsList({ onSelectPair, pairs }: { onSelectPair: (pairAddress: string) => void, pairs: NewPair[] }) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedPairs = pairs.slice(startIndex, endIndex);

  return (
    <>
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Pair Info</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-right">Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedPairs.map((pair, index) => (
              <TableRow
                key={index}
                className="border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => onSelectPair(pair.tokenAddress)}
                >
                <TableCell className="flex items-center gap-3">
                  <img
                    src={pair.icon}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-medium">{pair.symbol}</span>
                </TableCell>
                <TableCell className="text-right">
                  {pair.marketCap ? `$${(pair.marketCap / 1e6).toFixed(1)}M` : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {pair.volume ? `$${(pair.volume / 1e6).toFixed(1)}M` : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center gap-2 p-4 border-t border-gray-800">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="border-gray-800 hover:bg-gray-800 bg-gray-900"
        >
          {'<'}
        </Button>
        {[1, 2].map((p) => (
          <Button
            key={p}
            variant={page === p ? "default" : "outline"}
            size="icon"
            onClick={() => setPage(p)}
            className={page === p ? "bg-blue-500" : "border-gray-800 hover:bg-gray-800 bg-gray-900"}
          >
            {p}
          </Button>
        ))}
        <span className="flex items-center">...</span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPage(p => Math.min(p + 1, Math.ceil(pairs.length / itemsPerPage)))}
          className="border-gray-800 hover:bg-gray-800 bg-gray-900"
        >
          {'>'}
        </Button>
      </div>
    </>
  );
}

function CopyableAddressButton({ address }: { address?: string }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (address) {
      const fullAddress = toUserFriendlyAddress(address);
      await navigator.clipboard.writeText(fullAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!address) return null;

  return (
    <Button
      variant="ghost"
      className="text-blue-500 hover:bg-gray-800"
      onClick={handleCopy}
    >
      <p>
        {shortenAddress(toUserFriendlyAddress(address))}
        {isCopied && <span className="ml-2 text-green-500">Copied!</span>}
      </p>
    </Button>
  );
}

function shortenAddress(address: string, startLength = 4, endLength = 4): string {
  if (!address) return "";
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

function PositionsList({ positions }: { positions: Position[] }) {
  return (
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Token Pair</TableHead>
            <TableHead className="text-right">Entry Price</TableHead>
            <TableHead className="text-right">Current Price</TableHead>
            <TableHead className="text-right">PNL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((position) => (
            <TableRow key={position.id}>
              <TableCell>{`${position.base_token}/${position.quote_token}`}</TableCell>
              <TableCell className="text-right">${position.created_at_price.toFixed(4)}</TableCell>
              <TableCell className="text-right">${position.sold_price.toFixed(4)}</TableCell>
              <TableCell className={`text-right ${position.sold_price >= position.created_at_price ? 'text-green-500' : 'text-red-500'}`}>
                {((position.sold_price - position.created_at_price) / position.created_at_price * 100).toFixed(2)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function TelegramMiniApp() {
  const [selectedPairAddress, setSelectedPairAddress] = useState<string | null>(null);
  const [signedMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pairs' | 'positions'>('pairs');
  const [pairs, setPairs] = useState<NewPair[]>([]);
  const [originalPairs, setOriginalPairs] = useState<NewPair[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const connected = useTonWallet();
  const [tonConnectUi] = useTonConnectUI();
  const wallet = tonConnectUi.account;

  useEffect(() => {
    WebApp.setHeaderColor('#0a0a0a');
    WebApp.expand();
    WebApp.ready();
  }, []);

  useEffect(() => {
    async function loadPairs() {
      try {
        const newPairs = await fetchNewPairs();
        setPairs(newPairs);
        setOriginalPairs(newPairs);
      } catch (error) {
        console.error('Error loading pairs:', error);
      }
    }
    loadPairs();
  }, []);

  useEffect(() => {
    async function loadPositions() {
      if (connected && activeTab === 'positions') {
        try {
          const userPositions = await fetchPositions();
          setPositions(userPositions);
        } catch (error) {
          console.error('Error loading positions:', error);
        }
      }
    }
    loadPositions();
  }, [connected, activeTab]);


  // const handleSignMessage = useCallback(async () => {
  //   if (!connected) return;

  //   const message = 'Welcome to TerminalX!';
  //   try {
  //     const result = await tonConnectUi.sendTransaction({
  //       validUntil: Math.floor(Date.now() / 1000) + 60,
  //       messages: [
  //         {
  //           address: '0:8c397c43f9ff0b49659b5d0a302b1a93af7ccc63e5f5c0c4f25a9dc1f8b47ab3',
  //           amount: '1',
  //           payload: Buffer.from(message).toString('hex'),
  //         },
  //       ],
  //     });
  //     setSignedMessage(result.boc);
  //   } catch (error) {
  //     console.error('Error signing message:', error);
  //   }
  // }, [connected, tonConnectUi]);

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const searchResults = await getPairBySearch(searchTerm);
        setPairs(searchResults);
      } catch (error) {
        console.error('Error searching pairs:', error);
      }
    } else {
      setPairs(originalPairs);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    } else {
      setSearchTerm('');
      setPairs(originalPairs);
    }
  };

  const goToTrendingPage = () => {
    setSelectedPairAddress(null);
    setActiveTab('pairs');
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-1/2 -top-1/4 w-full h-[150%] bg-green-500/10 rounded-[100%] filter blur-[100px] transform -rotate-12"></div>
        <div className="absolute -right-1/2 -top-1/4 w-full h-[150%] bg-gray-800/35 rounded-[100%] filter blur-[100px] transform rotate-12"></div>
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          {isSearchOpen ? (
            <div className="flex items-center w-full">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search pairs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-grow bg-transparent border-none focus:ring-0 text-white"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleSearch}
                className="text-gray-400 hover:text-white ml-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <>
              <div
                onClick={goToTrendingPage}
                className="flex items-center gap-2 cursor-pointer"
                title="Go to trending page"
              >
                <img src={logo} alt="Logo" width={25} height={25} />
                <h1 className="text-lg font-semibold">TerminalX</h1>
              </div>
              <div className="flex gap-2 items-center">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleSearch}
                  className="text-blue-500 hover:bg-gray-800"
                >
                  <Search className="h-5 w-5" />
                </Button>
                {connected ? (
                  <>
                    <CopyableAddressButton address={wallet?.address} />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-blue-500 hover:bg-gray-800"
                      onClick={async () => {
                        try {
                          await tonConnectUi.disconnect();
                        } catch (error) {
                          console.error('Error:', error);
                        }
                      }}
                      title="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <ConnectButton />
                )}
              </div>
            </>
          )}
        </div>

      <div className="flex gap-4 p-4 border-b border-gray-800">
        <p
          className={`text-white cursor-pointer ${activeTab === 'pairs' ? 'border-b-2 border-blue-500' : 'hover:bg-gray-800'
            }`}
          onClick={() => {
            setActiveTab('pairs');
            if (selectedPairAddress) {
              setSelectedPairAddress(null);
              window.history.pushState(null, '', '/');
            }
          }}
        >
          Pairs
        </p>

        <p
          className={`text-white cursor-pointer ${activeTab === 'positions' ? 'border-b-2 border-blue-500' : 'hover:bg-gray-800'
            }`}
          onClick={() => setActiveTab('positions')}
        >
          My positions
        </p>
      </div>

      {connected && signedMessage && (
        <div className="p-4 bg-green-800 text-white">
          Message signed successfully!
        </div>
      )}

      {activeTab === 'pairs' ? (
        selectedPairAddress ? (
          <TokenDetail address={selectedPairAddress} onBack={() => setSelectedPairAddress(null)} />
        ) : (
          <TradingPairsList onSelectPair={setSelectedPairAddress} pairs={pairs} />
        )
      ) : (
        <div className="p-4">
          {positions.length > 0 ? (
            <PositionsList positions={positions} />
          ) : (
            <p className="text-center text-gray-400">You currently have no open positions.</p>
          )}
        </div>
      )}
    </div>
    </div>
  );
}
