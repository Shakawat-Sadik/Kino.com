"use client";

import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Chart colour palette — uses your oklch primary hue family
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function ChartCard({ title, description, children, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      className="bg-card border border-border rounded-2xl p-5"
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </motion.div>
  );
}

/**
 * AdminCharts — Client Component
 *
 * Props:
 *   analytics — result from getAdminAnalytics() passed down from the page
 *   {
 *     monthlyOrders:       [{ month: "Jan", count: 12 }, ...]
 *     categoryPerformance: [{ category: "Electronics", count: 34 }, ...]
 *     userGrowth:          [{ month: "Jan", count: 8 }, ...]
 *     revenueByMonth:      [{ month: "Jan", revenue: 125000 }, ...]
 *   }
 */
export function AdminCharts({ analytics }) {
  const {
    monthlyOrders = [],
    categoryPerformance = [],
    userGrowth = [],
    revenueByMonth = [],
  } = analytics || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* Monthly Orders — Bar Chart */}
      <ChartCard
        title="Monthly Orders"
        description="Order volume over the last 6 months"
        index={0}
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyOrders} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: 12,
                color: "hsl(var(--foreground))",
              }}
              cursor={{ fill: "hsl(var(--accent))" }}
            />
            <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* User Growth — Line Chart */}
      <ChartCard
        title="User Growth"
        description="New user registrations per month"
        index={1}
      >
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={userGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: 12,
                color: "hsl(var(--foreground))",
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={CHART_COLORS[2]}
              strokeWidth={2.5}
              dot={{ r: 4, fill: CHART_COLORS[2], strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              name="New Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Category Performance — Pie Chart */}
      <ChartCard
        title="Category Performance"
        description="Product distribution by category"
        index={2}
      >
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={categoryPerformance}
              dataKey="count"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
            >
              {categoryPerformance.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: 12,
                color: "hsl(var(--foreground))",
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Revenue by Month — Bar Chart */}
      <ChartCard
        title="Revenue by Month"
        description="Total revenue generated per month"
        index={3}
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenueByMonth} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: 12,
                color: "hsl(var(--foreground))",
              }}
              formatter={(v) => [`৳${v.toLocaleString()}`, "Revenue"]}
            />
            <Bar dataKey="revenue" fill={CHART_COLORS[3]} radius={[6, 6, 0, 0]} name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  );
}

/**
 * AdminChartsSkeleton
 * Shown while analytics data is loading
 */
export function AdminChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-5">
          <div className="h-4 w-36 bg-muted rounded-lg animate-pulse mb-1.5" />
          <div className="h-3 w-48 bg-muted rounded-lg animate-pulse mb-4" />
          <div className="h-[220px] w-full bg-muted rounded-xl animate-pulse" />
        </div>
      ))}
    </div>
  );
}
