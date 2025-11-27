
import React, { useState, useEffect } from 'react';
import { APP_MODE, marketService } from './services/api';
import { AppMode, CandleData, Asset, Transaction, TimeRange } from './types';
import StockChart from './components/StockChart';
import AssetDashboard from './components/AssetDashboard';
import TradingPanel from './components/TradingPanel';
import AIAnalyst from './components/AIAnalyst';
import { LayoutDashboard, BarChart2, Wallet, Search, Settings } from 'lucide-react';

// --- Default Assets for Mock Mode ---
const DEFAULT_ASSETS: Asset[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', quantity: 10, avgCost: 145, type: 'STOCK', currentPrice: 175, lastUpdated: '2023-10-25T10:30:00Z' },
  { id: '2', symbol: 'USD', name: 'Cash', quantity: 5000, avgCost: 1, type: 'CASH', currentPrice: 1, lastUpdated: '2023-10-01T09:00:00Z' },
  { id: '3', symbol: 'BTC', name: 'Bitcoin', quantity: 0.1, avgCost: 30000, type: 'CRYPTO', currentPrice: 45000, lastUpdated: '2023-11-15T14:20:00Z' },
];

function App() {
  // --- State ---
  const [symbol, setSymbol] = useState<string>('AAPL');
  const [searchInput, setSearchInput] = useState('');
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [assets, setAssets] = useState<Asset[]>(DEFAULT_ASSETS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [tab, setTab] = useState<'DASHBOARD' | 'TRADE' | 'ASSETS'>('DASHBOARD');

  // --- Effects ---
  useEffect(() => {
    loadMarketData();
  }, [symbol, timeRange]);

  const loadMarketData = async () => {
    const data = await marketService.getStockCandles(symbol, timeRange);
    setCandleData(data);
    
    // Update current price
    if (data.length > 0) {
      setCurrentPrice(data[data.length - 1].close);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSymbol(searchInput.toUpperCase());
      setSearchInput('');
    }
  };

  const handleTrade = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
    
    // Update Assets Logic (Simple simulation)
    setAssets(prev => {
      const existing = prev.find(a => a.symbol === transaction.symbol);
      let newAssets = [...prev];

      if (transaction.type === 'BUY') {
        if (existing) {
          const totalCost = (existing.quantity * existing.avgCost) + transaction.total;
          const totalQty = existing.quantity + transaction.quantity;
          existing.quantity = totalQty;
          existing.avgCost = totalCost / totalQty;
          existing.lastUpdated = transaction.date;
        } else {
          newAssets.push({
            id: Date.now().toString(),
            symbol: transaction.symbol,
            name: transaction.symbol, // Simplify name lookup
            quantity: transaction.quantity,
            avgCost: transaction.price,
            type: 'STOCK',
            currentPrice: transaction.price,
            lastUpdated: transaction.date
          });
        }
        // Deduct Cash (Simulated)
        const cash = newAssets.find(a => a.type === 'CASH');
        if (cash) {
          cash.quantity -= transaction.total;
          cash.lastUpdated = transaction.date;
        }

      } else {
        // SELL
        if (existing) {
          existing.quantity -= transaction.quantity;
          existing.lastUpdated = transaction.date;
          if (existing.quantity <= 0) {
            newAssets = newAssets.filter(a => a.symbol !== transaction.symbol);
          }
        }
        // Add Cash
        const cash = newAssets.find(a => a.type === 'CASH');
        if (cash) {
          cash.quantity += transaction.total;
          cash.lastUpdated = transaction.date;
        }
      }
      return newAssets;
    });
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-tight text-emerald-400">ProsperEdge</h1>
          <p className="text-xs text-slate-400 mt-1">專業資產管理系統</p>
          <div className="mt-2 inline-block px-2 py-1 rounded text-[10px] font-mono bg-slate-800 border border-slate-700">
             {APP_MODE === AppMode.MOCK ? '⚠️ 模擬演示模式 (Mock)' : '🟢 真實連線模式 (Real)'}
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setTab('DASHBOARD')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${tab === 'DASHBOARD' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}
          >
            <LayoutDashboard size={20} /> 看板總覽
          </button>
          <button 
            onClick={() => setTab('TRADE')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${tab === 'TRADE' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}
          >
            <BarChart2 size={20} /> 交易中心
          </button>
           <button 
            onClick={() => setTab('ASSETS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${tab === 'ASSETS' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}
          >
            <Wallet size={20} /> 資產記帳
          </button>
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <button className="flex items-center gap-3 text-slate-400 hover:text-white text-sm">
            <Settings size={18} /> 系統設定
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {tab === 'DASHBOARD' && '資產配置看板'}
            {tab === 'TRADE' && '模擬交易與分析'}
            {tab === 'ASSETS' && '資產管理'}
          </h2>

          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="輸入代號 (e.g. NVDA)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-accent w-64 text-sm"
            />
          </form>
        </header>

        {tab === 'DASHBOARD' && (
          <div className="space-y-6 animate-fade-in">
            <AssetDashboard assets={assets} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                 <div className="flex items-center gap-4 mb-4">
                    <h3 className="font-bold text-gray-700">{symbol} 市場走勢</h3>
                    <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                      {(['1D', '1M', '1Y'] as TimeRange[]).map(r => (
                        <button 
                          key={r}
                          onClick={() => setTimeRange(r)}
                          className={`px-3 py-1 text-xs rounded-md ${timeRange === r ? 'bg-slate-800 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                 </div>
                 <StockChart data={candleData} symbol={symbol} />
              </div>
              <div>
                <AIAnalyst symbol={symbol} currentPrice={currentPrice} />
              </div>
            </div>
          </div>
        )}

        {tab === 'TRADE' && (
           <div className="space-y-6">
             <div className="flex items-center gap-4 mb-2">
                <span className="text-gray-500 text-sm">當前標的:</span>
                <span className="text-xl font-bold text-gray-800">{symbol}</span>
             </div>
             <TradingPanel symbol={symbol} onTrade={handleTrade} transactions={transactions} />
             <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">即時走勢參考</h3>
                <StockChart data={candleData} symbol={symbol} />
             </div>
           </div>
        )}

        {tab === 'ASSETS' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <div className="flex justify-between mb-4">
                <h3 className="text-lg font-bold">我的資產清單</h3>
                <button 
                  onClick={() => alert('記帳功能 (新增資產) 可在此擴充 Modal 表單')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  + 新增資產
                </button>
             </div>
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-gray-100 text-gray-500 text-sm">
                   <th className="py-3 font-medium">名稱</th>
                   <th className="py-3 font-medium">類型</th>
                   <th className="py-3 font-medium">下單時間</th>
                   <th className="py-3 font-medium">數量</th>
                   <th className="py-3 font-medium">平均成本</th>
                   <th className="py-3 font-medium">現價</th>
                   <th className="py-3 font-medium text-right">總值</th>
                 </tr>
               </thead>
               <tbody>
                 {assets.map(asset => (
                   <tr key={asset.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                     <td className="py-3 font-bold text-gray-700">{asset.name} <span className="text-gray-400 font-normal">({asset.symbol})</span></td>
                     <td className="py-3">
                       <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{asset.type}</span>
                     </td>
                     <td className="py-3 text-gray-500 text-xs">
                        {asset.lastUpdated ? new Date(asset.lastUpdated).toLocaleString() : '-'}
                     </td>
                     <td className="py-3">{asset.quantity.toLocaleString()}</td>
                     <td className="py-3">${asset.avgCost.toLocaleString()}</td>
                     <td className="py-3">${(asset.currentPrice || asset.avgCost).toLocaleString()}</td>
                     <td className="py-3 text-right font-mono font-bold text-slate-700">
                       ${((asset.currentPrice || asset.avgCost) * asset.quantity).toLocaleString()}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
