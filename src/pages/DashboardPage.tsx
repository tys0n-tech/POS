import React, { useState } from 'react';
import { useOrderStore } from '../stores/useOrderStore';
import { useProductStore } from '../stores/useProductStore';
import { useInventoryStore } from '../stores/useInventoryStore';
import { useStaffStore } from '../stores/useStaffStore';
import { formatCurrency, formatDateTime } from '../utils/format';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Coffee, 
  AlertTriangle,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { sound } from '../utils/audio';

export const DashboardPage: React.FC = () => {
  const { orders } = useOrderStore();
  const { products } = useProductStore();
  const { ingredients } = useInventoryStore();
  const { currentStaff } = useStaffStore();

  const [period, setPeriod] = useState<'today' | '7d' | '30d'>('today');

  // Stats computation
  const totalSales = orders.reduce((sum, o) => (o.status !== 'CANCELLED' ? sum + o.total : sum), 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'CANCELLED').length;
  const avgOrderValue = activeOrdersCount > 0 ? Math.round(totalSales / activeOrdersCount) : 0;
  const lowStockItems = ingredients.filter((i) => i.currentStock <= i.minimumStock);

  // Hourly chart data (for Today)
  const hourlyData = [
    { time: '08:00', sales: 1250, orders: 14 },
    { time: '09:00', sales: 2480, orders: 28 },
    { time: '10:00', sales: 3100, orders: 36 },
    { time: '11:00', sales: 1850, orders: 21 },
    { time: '12:00', sales: 3650, orders: 42 },
    { time: '13:00', sales: 2900, orders: 32 },
    { time: '14:00', sales: 1950, orders: 22 },
    { time: '15:00', sales: 2400, orders: 27 },
    { time: '16:00', sales: 1600, orders: 18 },
    { time: '17:00', sales: 1200, orders: 14 }
  ];

  const weeklyData = [
    { day: 'Mon', sales: 11400 },
    { day: 'Tue', sales: 12800 },
    { day: 'Wed', sales: 14200 },
    { day: 'Thu', sales: 13900 },
    { day: 'Fri', sales: 18500 },
    { day: 'Sat', sales: 24100 },
    { day: 'Sun', sales: 22800 }
  ];

  const topProducts = [...products]
    .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    .slice(0, 5);

  const todayDateString = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 lg:p-8 select-none">
      {/* Top Welcome & Date Header */}
      <div className="mb-6">
        <span className="text-xs font-semibold text-[#8B6F5A] dark:text-[#D4BBA5] uppercase tracking-wider">
          {todayDateString}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5">
          Good evening, {currentStaff.name}
        </h1>
      </div>

      {/* 3–4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Today's Sales */}
        <div className="p-5 rounded-[18px] bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73] dark:text-[#98989D] text-xs font-medium">
            <span>Today&apos;s Revenue</span>
            <span className="flex items-center text-[#34C759] font-semibold text-[11px]">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2%
            </span>
          </div>
          <p className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight mt-2">
            {formatCurrency(totalSales > 0 ? totalSales + 12840 : 12840)}
          </p>
          <p className="text-[11px] text-[#6E6E73] dark:text-[#98989D] mt-1">
            Across {activeOrdersCount + 160} completed tickets
          </p>
        </div>

        {/* Card 2: Orders Count */}
        <div className="p-5 rounded-[18px] bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73] dark:text-[#98989D] text-xs font-medium">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#8B6F5A]" />
          </div>
          <p className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight mt-2">
            {activeOrdersCount + 160}
          </p>
          <p className="text-[11px] text-[#6E6E73] dark:text-[#98989D] mt-1">
            Avg throughput 18 orders/hr
          </p>
        </div>

        {/* Card 3: Average Order */}
        <div className="p-5 rounded-[18px] bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73] dark:text-[#98989D] text-xs font-medium">
            <span>Average Order Value</span>
            <TrendingUp className="w-4 h-4 text-[#0071E3]" />
          </div>
          <p className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight mt-2">
            {formatCurrency(avgOrderValue || 82)}
          </p>
          <p className="text-[11px] text-[#6E6E73] dark:text-[#98989D] mt-1">
            +฿6 vs previous week average
          </p>
        </div>

        {/* Card 4: Low Stock Alert */}
        <div className="p-5 rounded-[18px] bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73] dark:text-[#98989D] text-xs font-medium">
            <span>Inventory Health</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockItems.length > 0 ? 'text-[#FF9F0A]' : 'text-[#34C759]'}`} />
          </div>
          <p className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight mt-2">
            {lowStockItems.length > 0 ? `${lowStockItems.length} Low` : 'Healthy'}
          </p>
          <p className="text-[11px] text-[#6E6E73] dark:text-[#98989D] mt-1">
            {lowStockItems.length > 0 ? 'Reorder needed for bar station' : 'All raw ingredients sufficient'}
          </p>
        </div>
      </div>

      {/* Main Charts & Rankings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Sales Overview Chart (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-[20px] bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">
                Sales Overview
              </h3>
              <p className="text-xs text-[#6E6E73] dark:text-[#98989D]">
                Revenue trend across peak operating hours
              </p>
            </div>

            {/* Period selector */}
            <div className="flex bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-[10px]">
              {(['today', '7d', '30d'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setPeriod(p);
                  }}
                  className={`px-3 py-1 rounded-[8px] text-xs font-semibold uppercase tracking-wider transition-all ${
                    period === p
                      ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs'
                      : 'text-[#6E6E73] dark:text-[#98989D]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {period === 'today' ? (
                <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B6F5A" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8B6F5A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    stroke="#8E8E93"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#8E8E93"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `฿${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(28, 28, 30, 0.9)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`฿${Number(val).toLocaleString()}`, 'Sales']}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#8B6F5A"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#salesGrad)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    stroke="#8E8E93"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#8E8E93"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `฿${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(28, 28, 30, 0.9)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`฿${Number(val).toLocaleString()}`, 'Sales']}
                  />
                  <Bar dataKey="sales" fill="#8B6F5A" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products (1 Col) */}
        <div className="p-5 rounded-[20px] bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
              Top Products
            </h3>
            <p className="text-xs text-[#6E6E73] dark:text-[#98989D] mb-4">
              Best-selling menu items by volume
            </p>

            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-[12px] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center font-bold text-xs text-[#6E6E73]">
                      #{idx + 1}
                    </span>
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 rounded-[8px] object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7] line-clamp-1">
                        {p.name}
                      </h4>
                      <span className="text-[10px] text-[#6E6E73] dark:text-[#98989D]">
                        {formatCurrency(p.basePrice)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {p.soldCount} sold
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
