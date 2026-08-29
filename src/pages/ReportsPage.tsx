import React, { useState } from 'react';
import { useOrderStore } from '../stores/useOrderStore';
import { useProductStore } from '../stores/useProductStore';
import { useTranslation } from '../hooks/useTranslation';
import { formatCurrency } from '../utils/format';
import { Button } from '../components/ui/Button';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { 
  Download
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';
import { useToastStore } from '../stores/useToastStore';

export const ReportsPage: React.FC = () => {
  const { orders } = useOrderStore();
  const { products } = useProductStore();
  const { showToast } = useToastStore();
  const { t } = useTranslation();

  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d'>('today');

  // Category distribution data
  const categoryData = [
    { name: t('categories.coffee'), value: 48, color: '#8B6F5A' },
    { name: t('categories.matcha') + ' & ' + t('categories.tea'), value: 24, color: '#34C759' },
    { name: t('categories.bakery'), value: 18, color: '#FF9F0A' },
    { name: t('categories.nonCoffee'), value: 10, color: '#0071E3' }
  ];

  // Payment method distribution
  const paymentData = [
    { name: t('payment.promptpay'), value: 55, color: '#0071E3' },
    { name: t('payment.cash'), value: 30, color: '#34C759' },
    { name: t('payment.creditCard'), value: 15, color: '#8B6F5A' }
  ];

  const hourlySales = [
    { hour: '07:00', total: 640 },
    { hour: '08:00', total: 1850 },
    { hour: '09:00', total: 2980 },
    { hour: '10:00', total: 3450 },
    { hour: '11:00', total: 2100 },
    { hour: '12:00', total: 4200 },
    { hour: '13:00', total: 3100 },
    { hour: '14:00', total: 1850 },
    { hour: '15:00', total: 2600 },
    { hour: '16:00', total: 1400 },
    { hour: '17:00', total: 950 }
  ];

  const handleExportCSV = () => {
    const headers = ['Order Number,Date,Customer,Total,Payment Method,Status\n'];
    const rows = orders.map((o) =>
      `"${o.orderNumber}","${o.createdAt}","${o.customer?.name || 'Walk-in'}",${o.total},"${o.paymentMethod || 'PromptPay'}","${o.status}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Northline_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({ type: 'success', title: 'Export Generated', message: 'CSV downloaded successfully' });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 lg:p-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            {t('reports.title')}
          </h2>
          <p className="text-xs text-[#6E6E73] dark:text-[#98989D]">
            Financial performance, category share and payment breakdown
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SegmentedControl<'today' | '7d' | '30d'>
            layoutId="reports-timerange-tabs"
            value={timeRange}
            onChange={setTimeRange}
            size="sm"
            options={[
              { value: 'today', label: 'TODAY' },
              { value: '7d', label: '7D' },
              { value: '30d', label: '30D' }
            ]}
          />

          <Button
            variant="secondary"
            size="md"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Hourly Volume Bar Chart */}
        <div className="p-5 rounded-[20px] bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
          <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
            {t('reports.hourlySales')}
          </h3>
          <p className="text-xs text-[#6E6E73] dark:text-[#98989D] mb-4">
            Distribution of sales revenue throughout the day
          </p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="hour" stroke="#8E8E93" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#8E8E93" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `฿${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(28, 28, 30, 0.9)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none'
                  }}
                  formatter={(val) => [`฿${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="total" fill="#8B6F5A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut Chart */}
        <div className="p-5 rounded-[20px] bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
          <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
            {t('reports.salesByCategory')}
          </h3>
          <p className="text-xs text-[#6E6E73] dark:text-[#98989D] mb-4">
            Product mix ratio and beverage category performance
          </p>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(28, 28, 30, 0.9)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none'
                  }}
                  formatter={(val) => [`${val}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs font-semibold pt-2">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-[#1D1D1F] dark:text-[#F5F5F7]">{c.name} ({c.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="p-5 rounded-[20px] bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
        <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">
          Tender / Payment Channels
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {paymentData.map((p) => (
            <div
              key={p.name}
              className="p-4 rounded-[14px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]"
            >
              <div className="flex items-center justify-between text-xs text-[#6E6E73] dark:text-[#98989D]">
                <span>{p.name}</span>
                <span className="font-bold text-xs" style={{ color: p.color }}>
                  {p.value}%
                </span>
              </div>
              <p className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mt-1.5">
                {formatCurrency(Math.round((25000 * p.value) / 100))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
