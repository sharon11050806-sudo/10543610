import React, { useState } from 'react';
import { marketService } from '../services/api';
import { Bot, Sparkles, Loader2 } from 'lucide-react';

interface AIAnalystProps {
  symbol: string;
  currentPrice: number;
}

const AIAnalyst: React.FC<AIAnalystProps> = ({ symbol, currentPrice }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const trend = Math.random() > 0.5 ? "上漲" : "盤整"; // Simple context pass for mock/real
    const result = await marketService.getAIAnalysis(symbol, currentPrice, trend);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">AI 智能分析顧問</h3>
            <p className="text-xs text-gray-500">Powered by Gemini</p>
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          {loading ? "分析中..." : "生成報告"}
        </button>
      </div>

      {analysis ? (
        <div className="bg-white/80 p-4 rounded-lg border border-indigo-50 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {analysis}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 text-sm">
          點擊上方按鈕，取得針對 {symbol} 的即時投資建議。
        </div>
      )}
    </div>
  );
};

export default AIAnalyst;