import { useState } from 'react'
import { cn } from "../../lib/utils"

type TabType = 'my-order' | 'history';

const tabDisplay = {
  'my-order': 'My Orders',
  'history': 'History'
};

export function HistoryAndOrdersTabs() {
  const [selectedTab, setSelectedTab] = useState<TabType>('my-order');
  const tabs: TabType[] = ['my-order', 'history'];

  return (
    <div className="bg-neutral-900 rounded-lg overflow-hidden">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium transition-colors",
              selectedTab === tab
                ? "bg-neutral-800 text-white"
                : "text-gray-400 hover:text-white",
              "rounded-b-none"
            )}
          >
            <div>{tabDisplay[tab]}</div>
          </button>
        ))}
      </div>
      <div className="p-4 bg-neutral-800">
        {selectedTab === 'my-order' && (
          <p className="text-center text-gray-400">Currently you have no orders</p>
        )}
        {selectedTab === 'history' && (
          <p className="text-center text-gray-400">No Data</p>
        )}
      </div>
    </div>
  );
}
