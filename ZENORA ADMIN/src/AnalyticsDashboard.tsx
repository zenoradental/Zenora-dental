import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, Activity, ArrowUpRight } from 'lucide-react';

interface AnalyticsProps {
  appointments: any[];
}

const AnimatedCounter = ({ value, prefix = "", postfix = "", isCurrency = false, isDecimal = false }: { value: number, prefix?: string, postfix?: string, isCurrency?: boolean, isDecimal?: boolean }) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1500; // 1.5 seconds

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutExpo for smooth deceleration
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setDisplayValue(value * easeProgress);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  const formatted = React.useMemo(() => {
    if (isCurrency) {
      return displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (isDecimal) {
      return displayValue.toFixed(1);
    }
    return Math.round(displayValue).toLocaleString('en-US');
  }, [displayValue, isCurrency, isDecimal]);

  return <span>{prefix}{formatted}{postfix}</span>;
};

const AnalyticsDashboard: React.FC<AnalyticsProps> = ({ appointments }) => {
  // Generate some realistic looking fake revenue data based on appointments
  const { revenueData, treatmentData, kpis } = useMemo(() => {
    // Generate 6 months of historical data
    const rev = [
      { name: 'Jan', revenue: 42500, appointments: 120 },
      { name: 'Feb', revenue: 48200, appointments: 135 },
      { name: 'Mar', revenue: 51000, appointments: 142 },
      { name: 'Apr', revenue: 49500, appointments: 138 },
      { name: 'May', revenue: 58000, appointments: 165 },
      { name: 'Jun', revenue: 64500, appointments: 182 },
    ];

    // Make current month dynamic based on the actual appointments data!
    // We assume an average patient value of ~$365 for the prototype math.
    const currentAppointments = appointments.length;
    const projectedCurrentRevenue = currentAppointments * 365;
    
    // Get the current month name (e.g., 'Jul')
    const currentMonthName = new Date().toLocaleString('default', { month: 'short' });
    
    rev.push({ name: currentMonthName, revenue: projectedCurrentRevenue, appointments: currentAppointments });

    const treatments = [
      { name: 'Consultations', value: 35 },
      { name: 'Root Canals', value: 20 },
      { name: 'Whitening', value: 15 },
      { name: 'Implants', value: 10 },
      { name: 'Cleaning', value: 20 },
    ];

    const currentTotal = rev[rev.length - 1].revenue;
    const prevTotal = rev[rev.length - 2].revenue;
    const growth = ((currentTotal - prevTotal) / prevTotal) * 100;
    const allTimeTotal = rev.reduce((acc, curr) => acc + curr.revenue, 0);

    return {
      revenueData: rev,
      treatmentData: treatments,
      kpis: {
        totalRevenue: currentTotal,
        allTimeRevenue: allTimeTotal,
        growth: growth.toFixed(1),
        avgValue: currentTotal / currentAppointments,
        projectedAnnual: currentTotal * 12,
        totalAppointments: currentAppointments
      }
    };
  }, [appointments]);

  const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Financial Overview</h2>
          <p className="text-zinc-500">Real-time revenue analytics and projections</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-emerald-200">
          <TrendingUp className="w-4 h-4" />
          +{kpis.growth}% Month over Month
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <Card className="border-zinc-200 shadow-sm rounded-xl bg-white dark:bg-zinc-900/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-zinc-500">All-Time Revenue</p>
                <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mt-2"><AnimatedCounter value={kpis.allTimeRevenue} prefix="$" isCurrency /></h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-zinc-500">Total historical revenue</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm rounded-xl bg-white dark:bg-zinc-900/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-zinc-500">Monthly Revenue</p>
                <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mt-2"><AnimatedCounter value={kpis.totalRevenue} prefix="$" isCurrency /></h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />
              <span className="text-emerald-500 font-medium">{kpis.growth}%</span>
              <span className="text-zinc-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm rounded-xl bg-white dark:bg-zinc-900/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-zinc-500">Patient LTV</p>
                <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mt-2"><AnimatedCounter value={kpis.avgValue} prefix="$" isCurrency /></h3>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-zinc-500">Avg value per appointment</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm rounded-xl bg-white dark:bg-zinc-900/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-zinc-500">Projected ARR</p>
                <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mt-2"><AnimatedCounter value={kpis.projectedAnnual} prefix="$" isCurrency /></h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-zinc-500">Annual Run Rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-zinc-400">Total Appointments</p>
                <h3 className="text-3xl font-bold text-white mt-2"><AnimatedCounter value={kpis.totalAppointments} /></h3>
              </div>
              <div className="p-3 bg-white/10 text-white rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
                <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 border-zinc-200 shadow-sm rounded-xl">
          <CardHeader>
            <h3 className="text-lg font-semibold text-zinc-900">Revenue Growth (YTD)</h3>
            <p className="text-sm text-zinc-500">Monthly revenue trends and projections</p>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} tickFormatter={(val) => `$${val / 1000}k`} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
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
            <p className="text-sm text-zinc-500">Distribution of services</p>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={treatmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    animationDuration={400}
                  >
                    {treatmentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`${value}%`, 'Share']}
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
          <p className="text-sm text-zinc-500">Total appointments booked per month</p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} dx={-10} />
                <Tooltip 
                  cursor={{ fill: '#f4f4f5' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="appointments" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
