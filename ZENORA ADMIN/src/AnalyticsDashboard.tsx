import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, Activity, ArrowUpRight, Settings2, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AnalyticsProps {
  appointments: any[];
}

const defaultHistoricalData = [
  { name: 'Jan', revenue: 42500, appointments: 120 },
  { name: 'Feb', revenue: 48200, appointments: 135 },
  { name: 'Mar', revenue: 51000, appointments: 142 },
  { name: 'Apr', revenue: 49500, appointments: 138 },
  { name: 'May', revenue: 58000, appointments: 165 },
  { name: 'Jun', revenue: 64500, appointments: 182 },
];

const defaultTreatments = [
  { name: 'Consultations', value: 35 },
  { name: 'Root Canals', value: 20 },
  { name: 'Whitening', value: 15 },
  { name: 'Implants', value: 10 },
  { name: 'Cleaning', value: 20 },
];

const defaultBaseValue = 350;

const AnalyticsDashboard: React.FC<AnalyticsProps> = ({ appointments }) => {
  const [baseValue, setBaseValue] = useState(() => {
    const saved = localStorage.getItem('analytics_baseValue');
    return saved ? Number(saved) : defaultBaseValue;
  });

  const [historicalData, setHistoricalData] = useState(() => {
    const saved = localStorage.getItem('analytics_historicalData');
    return saved ? JSON.parse(saved) : defaultHistoricalData;
  });

  const [treatmentData, setTreatmentData] = useState(() => {
    const saved = localStorage.getItem('analytics_treatmentData');
    return saved ? JSON.parse(saved) : defaultTreatments;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings form states
  const [editBaseValue, setEditBaseValue] = useState(baseValue);
  const [editHistoricalData, setEditHistoricalData] = useState(historicalData);
  const [editTreatmentData, setEditTreatmentData] = useState(treatmentData);

  useEffect(() => {
    if (isSettingsOpen) {
      setEditBaseValue(baseValue);
      setEditHistoricalData(historicalData);
      setEditTreatmentData(treatmentData);
    }
  }, [isSettingsOpen, baseValue, historicalData, treatmentData]);

  const handleSaveSettings = () => {
    setBaseValue(editBaseValue);
    setHistoricalData(editHistoricalData);
    setTreatmentData(editTreatmentData);
    
    localStorage.setItem('analytics_baseValue', editBaseValue.toString());
    localStorage.setItem('analytics_historicalData', JSON.stringify(editHistoricalData));
    localStorage.setItem('analytics_treatmentData', JSON.stringify(editTreatmentData));
    
    setIsSettingsOpen(false);
  };

  const handleHistoricalChange = (index: number, field: string, value: string) => {
    const newData = [...editHistoricalData];
    newData[index] = { ...newData[index], [field]: field === 'name' ? value : Number(value) };
    setEditHistoricalData(newData);
  };

  const handleTreatmentChange = (index: number, field: string, value: string) => {
    const newData = [...editTreatmentData];
    newData[index] = { ...newData[index], [field]: field === 'name' ? value : Number(value) };
    setEditTreatmentData(newData);
  };

  const { revenueData, kpis } = useMemo(() => {
    const rev = [...historicalData];
    const projectedCurrentRevenue = Math.max(appointments.length * baseValue, 72000);
    rev.push({ name: 'Jul', revenue: projectedCurrentRevenue, appointments: appointments.length || 190 });

    const currentTotal = rev[rev.length - 1].revenue;
    const prevTotal = rev[rev.length - 2].revenue;
    const growth = ((currentTotal - prevTotal) / prevTotal) * 100;

    return {
      revenueData: rev,
      kpis: {
        totalRevenue: currentTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        growth: growth.toFixed(1),
        avgValue: (currentTotal / (appointments.length || 190)).toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        projectedAnnual: (currentTotal * 12).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      }
    };
  }, [appointments, baseValue, historicalData]);

  const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Financial Overview</h2>
          <p className="text-zinc-500">Real-time revenue analytics and projections</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-emerald-200">
            <TrendingUp className="w-4 h-4" />
            +{kpis.growth}% Month over Month
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)} className="gap-2">
            <Settings2 className="w-4 h-4" />
            Edit Metrics
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-zinc-200 shadow-sm rounded-xl bg-white dark:bg-zinc-900/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-zinc-500">Monthly Revenue</p>
                <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">{kpis.totalRevenue}</h3>
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
                <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">{kpis.avgValue}</h3>
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
                <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">{kpis.projectedAnnual}</h3>
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
                <h3 className="text-3xl font-bold text-white mt-2">{appointments.length || 190}</h3>
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
                  >
                    {treatmentData.map((_: any, index: number) => (
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

      {/* Settings Modal Overlay */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl">
            <CardHeader className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 flex flex-row items-center justify-between pb-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Analytics Settings</h2>
                <p className="text-sm text-zinc-500 mt-1">Manually configure the dashboard metrics and historical data.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(false)} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-500" />
                  Base Calculation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Average Revenue Per Appointment ($)</Label>
                    <Input 
                      type="number" 
                      value={editBaseValue} 
                      onChange={(e) => setEditBaseValue(Number(e.target.value))}
                      className="bg-zinc-50 dark:bg-zinc-900"
                    />
                    <p className="text-xs text-zinc-500">Used to project current month revenue.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Historical Data
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest px-2">
                    <div>Month</div>
                    <div>Revenue ($)</div>
                    <div>Appointments</div>
                  </div>
                  {editHistoricalData.map((data: any, index: number) => (
                    <div key={index} className="grid grid-cols-3 gap-4">
                      <Input 
                        value={data.name} 
                        onChange={(e) => handleHistoricalChange(index, 'name', e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-900 font-medium"
                      />
                      <Input 
                        type="number" 
                        value={data.revenue} 
                        onChange={(e) => handleHistoricalChange(index, 'revenue', e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-900"
                      />
                      <Input 
                        type="number" 
                        value={data.appointments} 
                        onChange={(e) => handleHistoricalChange(index, 'appointments', e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-900"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  Treatment Distribution (%)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editTreatmentData.map((data: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <Input 
                        value={data.name} 
                        onChange={(e) => handleTreatmentChange(index, 'name', e.target.value)}
                        className="h-8 text-sm font-medium border-transparent bg-transparent focus-visible:ring-1"
                      />
                      <Input 
                        type="number" 
                        value={data.value} 
                        onChange={(e) => handleTreatmentChange(index, 'value', e.target.value)}
                        className="h-8 w-20 text-sm text-right bg-white dark:bg-zinc-950"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleSaveSettings}>
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
