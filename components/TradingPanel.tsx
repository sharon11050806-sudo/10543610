import React, { useState, useEffect } from 'react';
import { marketService, APP_MODE } from '../services/api';
import { Transaction, Asset } from '../types';
import { RefreshCw, History, ArrowRightCircle } from 'lucide-react';

interface TradingPanelProps {
  symbol: string;
  onTrade: (transaction: Transaction) => void;
  transactions: Transaction[];
}

const TradingPanel: React.FC<TradingPanelProps> = ({ symbol, onTrade, transactions }) => {
  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [loading, setLoading] = useState(false);

  const fetchPrice = async () => {
    setLoading(true);
    const quote = await marketService.getQuote(symbol);
    setPrice(quote.price);
    setLoading(false);
  };

  // Auto fetch price on symbol change
  useEffect(() => {
    fetchPrice();
  }, [symbol]);

  const handleExecute = () => {
    if (price <= 0) return;
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      symbol,
      type,
      price,
      quantity,
      total: price * quantity
    };

    onTrade(newTransaction);
    alert(`${type === 'BUY' ? '買入' : '賣出'} 委託已成交！\n價格: ${price}\n數量: ${quantity}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Order Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">下單交易</h3>
        
        <div className="mb-4">
           <label className="block text-xs font-medium text-gray-500 uppercase mb-1">股票代號</label>
           <div className="text-2xl font-bold text-gray-900">{symbol}</div>
        </div>

        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">現價 (詢價)</label>
            <div className="flex items-center gap-2">
               <input 
                 type="number" 
                 value={price} 
                 readOnly 
                 className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-lg font-mono"
               />
               <button onClick={fetchPrice} className="p-2 text-gray-500 hover:text-accent transition-colors">
                 <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
               </button>
            </div>
          </div>
          <div className="flex-1">
             <label className="block text-xs font-medium text-gray-500 uppercase mb-1">股數</label>
             <input 
               type="number" 
               min="1"
               value={quantity}
               onChange={(e) => setQuantity(Number(e.target.value))}
               className="w-full border border-gray-200 rounded p-2 text-lg"
             />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
           <button 
             onClick={() => setType('BUY')}
             className={`p-3 rounded-lg font-bold text-sm transition-all ${type === 'BUY' ? 'bg-success text-white ring-2 ring-emerald-200' : 'bg-gray-100 text-gray-500'}`}
           >
             買進 (BUY)
           </button>
           <button 
             onClick={() => setType('SELL')}
             className={`p-3 rounded-lg font-bold text-sm transition-all ${type === 'SELL' ? 'bg-danger text-white ring-2 ring-red-200' : 'bg-gray-100 text-gray-500'}`}
           >
             賣出 (SELL)
           </button>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded">
          <span>預估金額:</span>
          <span className="font-bold font-mono text-lg">${(price * quantity).toLocaleString()}</span>
        </div>

        <button 
          onClick={handleExecute}
          className="w-full bg-primary hover:bg-slate-800 text-white py-3 rounded-lg font-bold shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
        >
          確認下單 <ArrowRightCircle size={18} />
        </button>
      </div>

      {/* Recent History */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
         <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
           <History size={18} /> 近期交易紀錄
         </h3>
         <div className="flex-1 overflow-auto max-h-[300px]">
           {transactions.length === 0 ? (
             <p className="text-gray-400 text-sm text-center mt-10">尚無交易紀錄</p>
           ) : (
             <table className="w-full text-sm text-left">
               <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                 <tr>
                   <th className="px-3 py-2">時間</th>
                   <th className="px-3 py-2">類型</th>
                   <th className="px-3 py-2">價格</th>
                   <th className="px-3 py-2">股數</th>
                 </tr>
               </thead>
               <tbody>
                 {transactions.slice().reverse().map(t => (
                   <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                     <td className="px-3 py-2 text-gray-500">{new Date(t.date).toLocaleDateString()}</td>
                     <td className={`px-3 py-2 font-bold ${t.type === 'BUY' ? 'text-success' : 'text-danger'}`}>
                       {t.type === 'BUY' ? '買入' : '賣出'}
                     </td>
                     <td className="px-3 py-2 font-mono">${t.price}</td>
                     <td className="px-3 py-2">{t.quantity}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
         </div>
         {APP_MODE === 'MOCK' && (
           <p className="text-xs text-center text-amber-600 mt-2 bg-amber-50 p-2 rounded">
             目前為模擬模式，交易紀錄僅暫存於記憶體。
           </p>
         )}
      </div>
    </div>
  );
};

export default TradingPanel;