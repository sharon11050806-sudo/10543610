import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Asset } from '../types';
import { PieChart as PieIcon, DollarSign, TrendingUp } from 'lucide-react';

interface AssetDashboardProps {
  assets: Asset[];
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

const AssetDashboard: React.FC<AssetDashboardProps> = ({ assets }) => {
  const summary = useMemo(() => {
    let totalValue = 0;
    let totalCost = 0;
    const typeDistribution: Record<string, number> = {};

    assets.forEach(asset => {
      const currentPrice = asset.currentPrice || asset.avgCost; // Fallback to cost if no live price
      const value = asset.quantity * currentPrice;
      const cost = asset.quantity * asset.avgCost;
      
      totalValue += value;
      totalCost += cost;

      if (typeDistribution[asset.type]) {
        typeDistribution[asset.type] += value;
      } else {
        typeDistribution[asset.type] = value;
      }
    });

    const profit = totalValue - totalCost;
    const profitPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    return { totalValue, totalCost, profit, profitPercent, typeDistribution };
  }, [assets]);

  const pieData = Object.keys(summary.typeDistribution).map(key => ({
    name: key,
    value: summary.typeDistribution[key]
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Summary Cards */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-accent" />
          </div>
          <span className="text-gray-500 font-medium">總資產市值</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">${summary.totalValue.toLocaleString()}</h2>
          <p className="text-sm text-gray-400 mt-1">成本: ${summary.totalCost.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <div className="flex items-center space-x-3 mb-2">
           <div className="p-2 bg-emerald-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <span className="text-gray-500 font-medium">總損益</span>
        </div>
        <div>
          <h2 className={`text-3xl font-bold ${summary.profit >= 0 ? 'text-success' : 'text-danger'}`}>
            {summary.profit >= 0 ? '+' : ''}{summary.profit.toLocaleString()}
          </h2>
          <p className={`text-sm mt-1 ${summary.profitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
             {summary.profitPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Asset Allocation Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
        <h3 className="text-gray-600 font-medium mb-2 flex items-center gap-2">
          <PieIcon size={16} /> 資產配置
        </h3>
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={8} wrapperStyle={{fontSize: '12px'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AssetDashboard;