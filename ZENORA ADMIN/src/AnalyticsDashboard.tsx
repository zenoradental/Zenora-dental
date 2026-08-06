import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Activity, IndianRupee, AlertTriangle, Info } from 'lucide-react';
import { formatINR, formatINRCompact } from '@/lib/currency';

interface AnalyticsProps {
  appointments: any[];
}

/**
 * When true, a banner states plainly that the figures do not represent real
 * clinic revenue. Defaults to true: it must be switched off deliberately, per
 * deployment, once the appointment data is genuine.
 */
const DEMO_MODE = (import.meta.env.VITE_ANALYTICS_DEMO_MODE ?? 'true') !== 'false';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 'YYYY-MM' key for a local YYYY-MM-DD date string, or null if unparseable. */
const monthKeyOf = (dateStr?: string): string | null => {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return null;
  return dateStr.slice(0, 7);
};

const labelForMonthKey = (key: string): string => {
  const [year, month] = key.split('-').map(Number);
  const label = MONTH_LABELS[month - 1] || key;
  // Disambiguate once we span more than one calendar year.
  return `${label} '${String(year).slice(-2)}`;
};

const AnimatedCounter = ({ value, format }: { value: number; format: (n: number) => string }) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let frame = 0;
    let startTimestamp: number | null = null;
    const duration = 1200;
    const from = 0;

    const step = (timestamp: number) => {
      if (startTimestamp === null) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(from + (value - from) * eased);
      if (progress < 1) frame = window.requestAnimationFrame(step);
      else setDisplayValue(value);
    };

    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  return <span>{format(displayValue)}</span>;
};

const KpiCard = ({
  label,
  children,
  footer,
  icon,
  iconClass,
  dark = false
}: {
  label: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  icon: React.ReactNode;
  iconClass?: string;
  dark?: boolean;
}) => (
  <Card className={dark
    ? 'border-zinc-200 shadow-sm rounded-xl bg-linear-to-br from-zinc-900 to-zinc-800 text-white'
    : 'border-zinc-200 shadow-sm rounded-xl bg-white dark:bg-zinc-900/50'}>
    <CardContent className="p-4 lg:p-5">
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <p className={`text-sm font-medium ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>{label}</p>
          <h3 className={`text-xl lg:text-2xl tracking-tight font-bold mt-1.5 truncate ${dark ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
            {children}
          </h3>
        </div>
        <div className={`p-2.5 rounded-lg shrink-0 ${dark ? 'bg-white/10 text-white' : iconClass}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center text-[11px] lg:text-xs">{footer}</div>
    </CardContent>
  </Card>
);

const AnalyticsDashboard: React.FC<AnalyticsProps> = ({ appointments }) => {
  const analytics = useMemo(() => {
    const all = Array.isArray(appointments) ? appointments : [];

    // Revenue is recognised only from appointments the clinic actually completed
    // AND that carry a stamped price. Anything else contributes zero — no figure
    // is ever estimated or filled in.
    const completed = all.filter(a => a.status === 'Completed');
    const priced = completed.filter(a => typeof a.price === 'number' && a.price > 0);
    const unpricedCompleted = completed.length - priced.length;

    const allTimeRevenue = priced.reduce((sum, a) => sum + a.price, 0);

    // Group revenue and volume by the month of the appointment date.
    const revenueByMonth = new Map<string, number>();
    const volumeByMonth = new Map<string, number>();

    for (const apt of all) {
      const key = monthKeyOf(apt.appointmentDate);
      if (!key) continue;
      volumeByMonth.set(key, (volumeByMonth.get(key) || 0) + 1);
    }
    for (const apt of priced) {
      const key = monthKeyOf(apt.appointmentDate);
      if (!key) continue;
      revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + apt.price);
    }

    // Build a contiguous trailing window ending this month, so gaps read as zero
    // rather than being silently skipped.
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const knownKeys = [...new Set([...revenueByMonth.keys(), ...volumeByMonth.keys()])].sort();
    const earliestKey = knownKeys[0];

    const series: { name: string; key: string; revenue: number; appointments: number }[] = [];
    if (earliestKey) {
      const [startY, startM] = earliestKey.split('-').map(Number);
      const cursor = new Date(startY, startM - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      // Cap the window at 12 months so the chart stays readable.
      const months: string[] = [];
      while (cursor <= end) {
        months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`);
        cursor.setMonth(cursor.getMonth() + 1);
      }
      for (const key of months.slice(-12)) {
        series.push({
          name: labelForMonthKey(key),
          key,
          revenue: revenueByMonth.get(key) || 0,
          appointments: volumeByMonth.get(key) || 0
        });
      }
    }

    const thisMonthRevenue = revenueByMonth.get(currentKey) || 0;
    const prevKeyDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevKey = `${prevKeyDate.getFullYear()}-${String(prevKeyDate.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthRevenue = revenueByMonth.get(prevKey) || 0;

    // Growth is only meaningful with a non-zero base month.
    const growth = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : null;

    // Run rate from the average of months that actually produced revenue —
    // not this month multiplied by twelve.
    const earningMonths = [...revenueByMonth.values()].filter(v => v > 0);
    const avgMonthlyRevenue = earningMonths.length > 0
      ? earningMonths.reduce((a, b) => a + b, 0) / earningMonths.length
      : 0;
    const runRate = avgMonthlyRevenue * 12;

    const avgValue = priced.length > 0 ? allTimeRevenue / priced.length : 0;

    // Revenue share by service, from real stamped prices.
    const byService = new Map<string, number>();
    for (const apt of priced) {
      const name = (apt.service || 'Unspecified').replace(/^[^\w₹]+\s*/, '').trim() || 'Unspecified';
      byService.set(name, (byService.get(name) || 0) + apt.price);
    }
    const treatmentData = [...byService.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return {
      series,
      treatmentData,
      totalAppointments: all.length,
      completedCount: completed.length,
      pricedCount: priced.length,
      unpricedCompleted,
      allTimeRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      growth,
      runRate,
      avgValue,
      hasRevenue: priced.length > 0
    };
  }, [appointments]);

  const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#6366f1'];

  const growthLabel = analytics.growth === null
    ? null
    : `${analytics.growth >= 0 ? '+' : ''}${analytics.growth.toFixed(1)}%`;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {DEMO_MODE && (
        <div className="rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900 dark:text-amber-300 tracking-wide">
              SAMPLE DATA — NOT YOUR REVENUE
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-400/90 mt-0.5">
              This deployment is in demo mode. Every figure below is computed from the demo
              appointment records in this database, not from real clinic income. Set
              <code className="mx-1 px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-[12px]">VITE_ANALYTICS_DEMO_MODE=false</code>
              once this instance holds real patient data.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Financial Overview</h2>
          <p className="text-zinc-500">
            Revenue recognised from completed appointments with a recorded price
          </p>
        </div>
        {growthLabel !== null && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${
            analytics.growth! >= 0
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {analytics.growth! >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {growthLabel} Month over Month
          </div>
        )}
      </div>

      {!analytics.hasRevenue ? (
        /* Empty state. We show nothing rather than a fabricated number. */
        <Card className="border-zinc-200 shadow-sm rounded-xl">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <IndianRupee className="w-7 h-7 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No revenue recorded yet</h3>
            <p className="text-sm text-zinc-500 mt-2 max-w-md mx-auto">
              Revenue appears here once appointments are marked <strong>Completed</strong> and the
              service they were booked for has a price in the price list.
            </p>
            {analytics.completedCount > 0 && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mt-5 inline-block text-left max-w-md">
                <AlertTriangle className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                {analytics.completedCount} completed appointment{analytics.completedCount === 1 ? '' : 's'} carry
                no price. Add prices under <strong>Settings → Service Prices</strong>, then mark future
                appointments complete to record revenue.
              </p>
            )}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-left">
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                <p className="text-xs text-zinc-500">Total appointments</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{analytics.totalAppointments}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                <p className="text-xs text-zinc-500">Completed</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{analytics.completedCount}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                <p className="text-xs text-zinc-500">With a price</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{analytics.pricedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {analytics.unpricedCompleted > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 px-4 py-3 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900 dark:text-amber-300">
                <strong>{analytics.unpricedCompleted}</strong> completed appointment
                {analytics.unpricedCompleted === 1 ? '' : 's'} {analytics.unpricedCompleted === 1 ? 'has' : 'have'} no
                recorded price and {analytics.unpricedCompleted === 1 ? 'is' : 'are'} excluded from every figure below.
                Add the missing service prices under <strong>Settings → Service Prices</strong>.
              </p>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard
              label="All-Time Revenue"
              icon={<IndianRupee className="w-5 h-5" />}
              iconClass="bg-emerald-50 text-emerald-600"
              footer={
                <span className="text-zinc-500">
                  From {analytics.pricedCount} completed appointment{analytics.pricedCount === 1 ? '' : 's'}
                </span>
              }
            >
              <AnimatedCounter value={analytics.allTimeRevenue} format={formatINR} />
            </KpiCard>

            <KpiCard
              label="This Month"
              icon={<IndianRupee className="w-5 h-5" />}
              iconClass="bg-blue-50 text-blue-600"
              footer={
                growthLabel === null ? (
                  <span className="text-zinc-500">No revenue last month to compare</span>
                ) : (
                  <>
                    {analytics.growth! >= 0
                      ? <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                      : <TrendingDown className="w-4 h-4 text-rose-500 mr-1" />}
                    <span className={`font-medium ${analytics.growth! >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {growthLabel}
                    </span>
                    <span className="text-zinc-500 ml-1.5">vs last month</span>
                  </>
                )
              }
            >
              <AnimatedCounter value={analytics.thisMonthRevenue} format={formatINR} />
            </KpiCard>

            <KpiCard
              label="Average Value"
              icon={<Users className="w-5 h-5" />}
              iconClass="bg-purple-50 text-purple-600"
              footer={<span className="text-zinc-500">Per completed appointment</span>}
            >
              <AnimatedCounter value={analytics.avgValue} format={formatINR} />
            </KpiCard>

            <KpiCard
              label="Annual Run Rate"
              icon={<TrendingUp className="w-5 h-5" />}
              iconClass="bg-emerald-50 text-emerald-600"
              footer={<span className="text-zinc-500">Avg earning month &times; 12</span>}
            >
              <AnimatedCounter value={analytics.runRate} format={formatINR} />
            </KpiCard>

            <KpiCard
              label="Total Appointments"
              dark
              icon={<Activity className="w-5 h-5" />}
              footer={
                <span className="text-zinc-400">
                  {analytics.completedCount} completed
                </span>
              }
            >
              <AnimatedCounter value={analytics.totalAppointments} format={(n) => Math.round(n).toLocaleString('en-IN')} />
            </KpiCard>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-1 lg:col-span-2 border-zinc-200 shadow-sm rounded-xl">
              <CardHeader>
                <h3 className="text-lg font-semibold text-zinc-900">Revenue by Month</h3>
                <p className="text-sm text-zinc-500">Recognised revenue from completed appointments</p>
              </CardHeader>
              <CardContent>
                <div className="h-87.5 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.series} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} tickFormatter={formatINRCompact} width={70} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [formatINR(Number(value)), 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 border-zinc-200 shadow-sm rounded-xl">
              <CardHeader>
                <h3 className="text-lg font-semibold text-zinc-900">Revenue by Treatment</h3>
                <p className="text-sm text-zinc-500">Share of recognised revenue</p>
              </CardHeader>
              <CardContent>
                <div className="h-87.5 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.treatmentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        animationDuration={400}
                      >
                        {analytics.treatmentData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any, name: any) => [formatINR(Number(value)), name]}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-zinc-200 shadow-sm rounded-xl">
            <CardHeader>
              <h3 className="text-lg font-semibold text-zinc-900">Appointment Volume</h3>
              <p className="text-sm text-zinc-500">All appointments booked per month, regardless of status</p>
            </CardHeader>
            <CardContent>
              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.series} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} dx={-10} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: '#f4f4f5' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [value, 'Appointments']}
                    />
                    <Bar dataKey="appointments" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
