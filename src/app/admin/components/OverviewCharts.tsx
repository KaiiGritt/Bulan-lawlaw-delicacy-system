'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartPieIcon,
  CubeIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

interface SalesData {
  date: string;
  amount: number;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface CategoryData {
  category: string;
  revenue: number;
  orders: number;
}

interface OrderStatus {
  [key: string]: number;
}

interface OverviewChartsProps {
  salesData: SalesData[];
  topProducts: TopProduct[];
  categoryData: CategoryData[];
  orderStatus: OrderStatus;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  previousPeriodSales?: number;
}

const COLORS = ['#2E7D32', '#4CAF50', '#81C784', '#A5D6A7', '#C8E6C9', '#E8F5E9'];
const STATUS_COLORS: { [key: string]: string } = {
  pending: '#FFA726',
  processing: '#42A5F5',
  shipped: '#7E57C2',
  delivered: '#66BB6A',
  cancelled: '#EF5350',
};

// Custom tooltip for area chart
const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-green-100">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-lg font-bold text-primary-green">
          ₱{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for pie chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-green-100">
        <p className="text-sm font-medium text-gray-700">{payload[0].name}</p>
        <p className="text-lg font-bold text-primary-green">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

// Sales Trend Chart Component
export function SalesTrendChart({ data, totalSales, previousPeriodSales }: {
  data: SalesData[];
  totalSales: number;
  previousPeriodSales?: number;
}) {
  const percentChange = previousPeriodSales
    ? ((totalSales - previousPeriodSales) / previousPeriodSales * 100).toFixed(1)
    : null;
  const isPositive = percentChange ? parseFloat(percentChange) >= 0 : true;

  // Format date labels
  const formattedData = data.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-soft-green/30 hover:shadow-xl transition-all"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-5 h-5 text-primary-green" />
            Sales Trend
          </h3>
          <p className="text-3xl font-bold text-primary-green mt-2">
            ₱{totalSales.toLocaleString()}
          </p>
          {percentChange && (
            <div className={`flex items-center gap-1 mt-1 ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
              {isPositive ? (
                <ArrowTrendingUpIcon className="w-4 h-4" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{percentChange}% from last period</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
            <XAxis
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomAreaTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#2E7D32"
              strokeWidth={3}
              fill="url(#salesGradient)"
              dot={{ fill: '#2E7D32', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#2E7D32', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// Order Status Donut Chart
export function OrderStatusChart({ data }: { data: OrderStatus }) {
  const chartData = Object.entries(data).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: STATUS_COLORS[status] || '#9E9E9E'
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-soft-green/30 hover:shadow-xl transition-all"
    >
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <ChartPieIcon className="w-5 h-5 text-primary-green" />
        Order Status
      </h3>

      <div className="h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center text */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-3xl font-bold text-gray-800">{total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600">{item.name} ({item.value})</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Top Products Bar Chart
export function TopProductsChart({ data }: { data: TopProduct[] }) {
  const chartData = data.slice(0, 5).map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    fullName: item.name,
    revenue: item.revenue,
    quantity: item.quantity
  }));

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-green-100">
          <p className="text-sm font-medium text-gray-700 mb-2">{payload[0].payload.fullName}</p>
          <p className="text-sm text-gray-600">Revenue: <span className="font-bold text-primary-green">₱{payload[0].value.toLocaleString()}</span></p>
          <p className="text-sm text-gray-600">Sold: <span className="font-bold">{payload[0].payload.quantity}</span> units</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-soft-green/30 hover:shadow-xl transition-all"
    >
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
        <CubeIcon className="w-5 h-5 text-primary-green" />
        Top Selling Products
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2E7D32" />
                <stop offset="100%" stopColor="#66BB6A" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" horizontal={false} />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#374151', fontSize: 12 }}
              width={100}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar
              dataKey="revenue"
              fill="url(#barGradient)"
              radius={[0, 8, 8, 0]}
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// Category Performance Chart
export function CategoryPerformanceChart({ data }: { data: CategoryData[] }) {
  const chartData = data.map((item, index) => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    value: item.revenue,
    orders: item.orders,
    color: COLORS[index % COLORS.length]
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomCategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-green-100">
          <p className="text-sm font-medium text-gray-700 mb-2">{payload[0].name}</p>
          <p className="text-sm text-gray-600">Revenue: <span className="font-bold text-primary-green">₱{payload[0].value.toLocaleString()}</span></p>
          <p className="text-sm text-gray-600">Share: <span className="font-bold">{percentage}%</span></p>
          <p className="text-sm text-gray-600">Orders: <span className="font-bold">{payload[0].payload.orders}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-soft-green/30 hover:shadow-xl transition-all"
    >
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <TagIcon className="w-5 h-5 text-primary-green" />
        Revenue by Category
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={90}
              dataKey="value"
              stroke="#fff"
              strokeWidth={2}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              labelLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomCategoryTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600 truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Main Overview Charts Component
export default function OverviewCharts({
  salesData,
  topProducts,
  categoryData,
  orderStatus,
  totalSales,
  totalOrders,
  averageOrderValue,
  previousPeriodSales,
}: OverviewChartsProps) {
  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesTrendChart
          data={salesData}
          totalSales={totalSales}
          previousPeriodSales={previousPeriodSales}
        />
        <OrderStatusChart data={orderStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsChart data={topProducts} />
        <CategoryPerformanceChart data={categoryData} />
      </div>
    </div>
  );
}
