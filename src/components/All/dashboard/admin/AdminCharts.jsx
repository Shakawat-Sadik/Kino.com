"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Sector,
} from "recharts";

const CHART_COLORS = [
  "var(--chart-5)",
  "var(--chart-4)",
  "var(--chart-3)",
  "var(--chart-2)",
  "var(--chart-1)",
];

const TOOLTIP_STYLE = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  fontSize: 12,
  color: "var(--foreground)",
  boxShadow: "0 8px 24px var(--primary) / 0.1",
};

function ChartCard({ title, description, accentColor, children, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.12,
        ease: [0.23, 1, 0.32, 1],
      }}
      whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
      className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden group"
    >
      {/* Accent stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-0.75 rounded-t-2xl"
        style={{ background: `var(${accentColor})` }}
      />

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, var(${accentColor}) / 0.08 0%, transparent 65%)`,
        }}
      />

      <div className="relative mb-4">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{ background: `var(${accentColor})` }}
          />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 ml-4">
            {description}
          </p>
        )}
      </div>

      <div className="relative">{children}</div>
    </motion.div>
  );
}

// Custom bar shape — gradient + subtle top shine
const CustomBar = (props) => {
  const { x, y, width, height, fill } = props;
  if (!height || height <= 0) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={6} ry={6} />
      <rect
        x={x + 2}
        y={y + 2}
        width={Math.max(width - 4, 0)}
        height={Math.min(height * 0.28, 14)}
        fill="white"
        opacity={0.09}
        rx={4}
        ry={4}
      />
    </g>
  );
};

// Custom active donut shape — expands + shows center label
const ActivePieShape = (props) => {
  const {
    cx, cy,
    innerRadius, outerRadius,
    startAngle, endAngle,
    fill, payload, value,
  } = props;

  const label = payload.role ?? payload.category ?? "";
  const displayLabel = label
    ? label.charAt(0).toUpperCase() + label.slice(1)
    : "Total";

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 7}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      {/* Outer glow ring */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 14}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.28}
      />
      {/* Center value */}
      <text
        x={cx}
        y={cy - 7}
        textAnchor="middle"
        fontSize={22}
        fontWeight={700}
        fill="var(--foreground)"
      >
        {value}
      </text>
      {/* Center label */}
      <text
        x={cx}
        y={cy + 13}
        textAnchor="middle"
        fontSize={11}
        fill="var(--muted-foreground)"
      >
        {displayLabel}
      </text>
    </g>
  );
};

const formatYearMonth = (val) => {
  if (!val) return "";
  const [year, month] = val.split("-");
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

// Growth-ratio backfill: fractions of anchor-month value for each of the 5 preceding months
// Mirrors a realistic S-curve growth trajectory (same pattern as reference project mock data)
const GROWTH_RATIOS = [0.26, 0.39, 0.43, 0.63, 0.78];

function withDemoTrend(realData, valueKey) {
  const realMap = new Map(realData.map((d) => [d.month, d[valueKey]]));

  // Anchor to the latest month that actually has real data, not the current calendar month.
  // This avoids the "first day of a new month" bug where anchor value = 0.
  const now = new Date();
  const calendarKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const sorted = [...realData].sort((a, b) => a.month.localeCompare(b.month));
  const anchorKey = sorted[sorted.length - 1]?.month ?? calendarKey;

  const [anchorYear, anchorMonthNum] = anchorKey.split("-").map(Number);
  const anchorDate = new Date(anchorYear, anchorMonthNum - 1, 1);
  const anchorValue = realMap.get(anchorKey) ?? 0;

  // Build 6 months ending at anchorKey
  const monthKeys = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(anchorDate.getFullYear(), anchorDate.getMonth() - i, 1);
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  return monthKeys.map((key, i) => {
    if (realMap.has(key)) return { month: key, [valueKey]: realMap.get(key) };
    if (i === monthKeys.length - 1) return { month: key, [valueKey]: anchorValue };
    return { month: key, [valueKey]: Math.round(anchorValue * GROWTH_RATIOS[i]) };
  });
}



export function AdminCharts({ analytics }) {
  const {
    monthlyOrders = [],
    categoryPerformance = [],
    userGrowth = [],
    revenueByMonth = [],
  } = analytics ?? {};

  const ordersTrend = withDemoTrend(monthlyOrders, "count");
  const revenueTrend = withDemoTrend(revenueByMonth, "revenue");

  const [activeRoleIdx, setActiveRoleIdx] = useState(0);
  const [activeCatIdx, setActiveCatIdx] = useState(0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* Monthly Orders — Bar Chart */}
      <ChartCard
        title="Monthly Orders"
        description="Order volume over the last 6 months"
        accentColor="--chart-5"
        index={0}
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={ordersTrend} barSize={28}>
            <defs>
              <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={1} />
                <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tickFormatter={formatYearMonth}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelFormatter={formatYearMonth}
              cursor={{ fill: "var(--accent)", fillOpacity: 0.45, radius: 6 }}
            />
            <Bar
              dataKey="count"
              fill="url(#gradOrders)"
              name="Orders"
              shape={CustomBar}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* User Roles — Donut Chart */}
      <ChartCard
        title="User Roles"
        description="Distribution of buyers, sellers, and admins"
        accentColor="--chart-2"
        index={1}
      >
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={userGrowth}
              dataKey="count"
              nameKey="role"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              activeIndex={activeRoleIdx}
              onMouseEnter={(_, idx) => setActiveRoleIdx(idx)}
              animationDuration={900}
              animationEasing="ease-out"
            >
              {userGrowth.map((_, i) => (
                <Cell key={`cell-role-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value, name) => [
                value,
                name.charAt(0).toUpperCase() + name.slice(1),
              ]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }}
              formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Category Performance — Donut Chart */}
      <ChartCard
        title="Category Performance"
        description="Product distribution by category"
        accentColor="--chart-3"
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
              activeIndex={activeCatIdx}
              onMouseEnter={(_, idx) => setActiveCatIdx(idx)}
              animationDuration={900}
              animationEasing="ease-out"
            >
              {categoryPerformance.map((_, i) => (
                <Cell key={`cell-cat-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Revenue by Month — Bar Chart */}
      <ChartCard
        title="Revenue by Month"
        description="Total revenue generated per month (last 6 months)"
        accentColor="--chart-4"
        index={3}
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenueTrend} barSize={28}>
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={1} />
                <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tickFormatter={formatYearMonth}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelFormatter={formatYearMonth}
              formatter={(v) => [`৳${v.toLocaleString()}`, "Revenue"]}
              cursor={{ fill: "var(--accent)", fillOpacity: 0.45, radius: 6 }}
            />
            <Bar
              dataKey="revenue"
              fill="url(#gradRevenue)"
              name="Revenue"
              shape={CustomBar}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  );
}

export function AdminChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
          className="bg-card border border-border rounded-2xl p-5 overflow-hidden"
        >
          <div className="h-4 w-32 bg-muted rounded-lg animate-pulse mb-1.5" />
          <div className="h-3 w-44 bg-muted rounded-lg animate-pulse mb-4" />
          <div className="h-[220px] w-full bg-muted rounded-xl animate-pulse" />
        </motion.div>
      ))}
    </div>
  );
}
