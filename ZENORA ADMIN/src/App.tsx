import React, { useState, useEffect, useRef } from 'react';
console.log("CACHE BUSTER 1");
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isToday, addWeeks, subWeeks, parse } from 'date-fns';
import customLogo from './assets/favicon.svg';
import { 
  Bell, 
  Calendar, 
  Download, 
  Home, 
  LogOut, 
  Menu, 
  Search, 
  Settings,
  User, 
  Users, 
  XCircle,
  Mail,
  Phone,
  Activity,
  Clock,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  FileText,
  Trash2,
  Loader2,
  Edit,
  TrendingUp,
  Zap,
  Stethoscope
} from 'lucide-react';
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CommandCenter from './CommandCenter';
import CommandPalette from './CommandPalette';
import AnalyticsDashboard from './AnalyticsDashboard';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { cn } from '@/lib/utils';
import { InvoiceModal } from './components/InvoiceModal';

interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {}
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
      className
    )}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;



interface PasswordInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const PasswordInputField = React.forwardRef<HTMLInputElement, PasswordInputFieldProps>(
  ({ className, label, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="w-full">
        {label && (
          <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 block">
            {label}
          </Label>
        )}
        <div className="relative h-9 border border-zinc-200 shadow-sm rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-zinc-900/50 focus-within:border-zinc-900 transition-all">
          <input
            type={showPassword ? "text" : "password"}
            className={cn(
              "w-full h-full bg-background dark:bg-input/30 text-foreground px-3 pr-10 border-none outline-none focus:outline-none focus-visible:outline-none text-sm",
              className
            )}
            ref={ref}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInputField.displayName = "PasswordInputField";

// Types
interface Appointment {
  appointmentId: string;
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  service?: string;
  symptoms: string;
  doctor: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  address?: string;
  medicalHistory?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  status: string;
  phone: string;
  email: string;
}

interface StatsCardProps {
  title: string;
  currentValue: number;
  valuePrefix?: string;
  valuePostfix?: string;
  description: React.ReactNode;
  chartData: ChartDataItem[];
  icon: React.ReactElement;
  className?: string;
}

type ChartDataItem = {
  name: string;
  value: number;
  color?: string;
};

// Animated Value Component
const AnimatedValue = ({ value, prefix = "", postfix = "" }: { value: number; prefix?: string; postfix?: string }) => {
  return <span>{prefix}{Intl.NumberFormat('en-US').format(value)}{postfix}</span>;
};

const StatsCardComponent = ({ 
  title, 
  currentValue, 
  valuePrefix, 
  valuePostfix, 
  description, 
  chartData,
  icon,
  className
}: StatsCardProps) => {
  return (
    <Card className={cn("overflow-hidden border-zinc-200 shadow-sm rounded-xl transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.12)] hover:border-zinc-300 cursor-pointer group", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-slate-200 group-hover:-rotate-3">
            {React.cloneElement(icon, { className: "h-5 w-5 text-zinc-600 transition-colors duration-300 group-hover:text-zinc-900" } as any)}
          </div>
          <h3 className="text-sm font-medium text-zinc-500">{title}</h3>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-3xl font-bold tracking-tight text-zinc-900">
          <AnimatedValue value={currentValue} prefix={valuePrefix} postfix={valuePostfix} />
        </div>
        <p className="text-xs text-zinc-500 mt-1">{description}</p>
        <div className="h-[60px] mt-4 flex items-end justify-between gap-1">
          {chartData.map((item, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div
                className={cn("w-full rounded-t-sm transition-transform duration-500 ease-out group-hover:scale-y-110 origin-bottom", item.color)}
                style={{ height: `${item.value}%` }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const sampleAppointments: Appointment[] = [];

const MedicalAppointmentSystem = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('adminLoggedIn') === 'true' || sessionStorage.getItem('adminLoggedIn') === 'true';
  });
  const [loggedInUser, setLoggedInUser] = useState<{id: string, email: string, role: string} | null>(() => {
    const localUser = localStorage.getItem('adminUser');
    if (localUser) return JSON.parse(localUser);
    const sessionUser = sessionStorage.getItem('adminUser');
    if (sessionUser) return JSON.parse(sessionUser);
    return null;
  });
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'appointments' | 'patients' | 'doctors' | 'calendar' | 'settings' | 'command-center' | 'analytics'>(() => {
    return (localStorage.getItem('adminCurrentPage') as any) || 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode] = useState(false);
  const [systemSettings, setSystemSettings] = useState({ maintenanceMode: false, pauseBookings: false });
  const [togglingSetting, setTogglingSetting] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(sampleAppointments);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate] = useState(new Date());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [notifications, setNotifications] = useState<any[]>(() => {
    const saved = localStorage.getItem('dashboard_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState({ patientName: '', doctorName: '', appointmentDate: '' });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  // Global shortcut for Command Palette
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.key === ' ' || e.code === 'Space') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);
  
  const isUpdatingRef = useRef(false);
  const lastOptimisticUpdateRef = useRef(0);
  const isInitialFetchRef = useRef(true);

  useEffect(() => {
    localStorage.setItem('dashboard_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('adminCurrentPage', currentPage);
  }, [currentPage]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);
  const notificationCount = notifications.filter(n => n.unread).length;
  const [showNotifications, setShowNotifications] = useState(false);
  const previousAppointmentsRef = useRef<Set<string>>(new Set(sampleAppointments.map(a => a.appointmentId)));
  const [admins, setAdmins] = useState<{id: string, email: string, role: string}[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [toastMessage, setToastMessage] = useState<{ title?: string, message: string, type: 'success' | 'error', details?: { patient: string, time: string, date: string, count?: number } } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null);
  const [promptDialog, setPromptDialog] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: (value: string) => void } | null>(null);
  const [promptValue, setPromptValue] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [newDoctorDialog, setNewDoctorDialog] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: '', specialization: '', phone: '', email: '' });
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUser(null);
    localStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminUser');
    setEmail('');
    setPassword('');
    setCurrentPage('dashboard');
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetch(`https://zenora-backend-black.vercel.app/api/admins`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAdmins(data);
            if (loggedInUser) {
              const latestUser = data.find(a => a.id === loggedInUser.id || (a.email && loggedInUser.email && a.email.toLowerCase() === loggedInUser.email.toLowerCase()));
              if (!latestUser) {
                handleLogout();
                showToast("Your account access has been revoked.", "error");
              } else if (latestUser.role !== loggedInUser.role) {
                const updatedUser = { ...loggedInUser, role: latestUser.role };
                setLoggedInUser(updatedUser);
                if (localStorage.getItem('adminUser')) {
                  localStorage.setItem('adminUser', JSON.stringify(updatedUser));
                }
                if (sessionStorage.getItem('adminUser')) {
                  sessionStorage.setItem('adminUser', JSON.stringify(updatedUser));
                }
              }
            }
          }
        })
        .catch(console.error);
    }
  }, [isLoggedIn, currentPage]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (isUpdatingRef.current) return;
      try {
        const res = await fetch(`https://zenora-backend-black.vercel.app/api/appointments`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          // If an optimistic update occurred recently, discard the potentially stale server response
          if (Date.now() - lastOptimisticUpdateRef.current < 3000) return;
          
          let newAppointmentsFound = false;
          const newNotifications: any[] = [];
          
          data.forEach((apt: Appointment) => {
            if (!previousAppointmentsRef.current.has(apt.appointmentId)) {
              previousAppointmentsRef.current.add(apt.appointmentId);
              
              if (!isInitialFetchRef.current) {
                newAppointmentsFound = true;
                newNotifications.push({
                  id: Date.now() + Math.random(),
                  title: 'New Online Booking',
                  message: `${apt.patientName} booked an appointment for ${apt.appointmentDate} at ${apt.appointmentTime}.`,
                  time: 'Just now',
                  unread: true
                });
              }
            }
          });

          isInitialFetchRef.current = false;

          if (newAppointmentsFound) {
            setNotifications(prev => [...newNotifications, ...prev]);
            
            const count = newNotifications.length;
            const firstApt = newNotifications[0];
            const msg = count > 1 ? `${count} new appointments booked!` : 'A new appointment has been scheduled.';
            
            setToastMessage({ 
              title: count > 1 ? 'New Bookings' : 'New Appointment',
              message: msg, 
              type: 'success',
              details: {
                patient: firstApt.message.split(' booked')[0] || 'Patient',
                time: firstApt.message.split(' at ')[1]?.replace('.', '') || 'N/A',
                date: firstApt.message.split(' for ')[1]?.split(' at ')[0] || 'N/A',
                count: count
              }
            });
            setTimeout(() => setToastMessage(null), 8000);
            
            // Audio alert
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              oscillator.type = 'sine';
              oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
              gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              oscillator.start();
              gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
              oscillator.stop(audioCtx.currentTime + 0.5);
            } catch(e) { console.error('Audio alert failed', e); }

            // Desktop notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Zenora Dental', { body: msg });
            }
          }

          // Merge fetched appointments with sample ones, placing new ones first
          const existingIds = new Set(data.map((a: Appointment) => a.appointmentId));
          const filteredSamples = sampleAppointments.filter(a => !existingIds.has(a.appointmentId));
          const merged = [...data, ...filteredSamples].sort((a, b) => {
            const timeA = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
            const timeB = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
            if (timeA !== timeB && timeA > 0 && timeB > 0) return timeB - timeA;
            const idA = parseInt(String(a.appointmentId).replace(/\D/g, ''), 10) || 0;
            const idB = parseInt(String(b.appointmentId).replace(/\D/g, ''), 10) || 0;
            if (idA !== idB) return idB - idA;
            return new Date(b.appointmentDate + ' ' + (b.appointmentTime || '')).getTime() - 
                   new Date(a.appointmentDate + ' ' + (a.appointmentTime || '')).getTime();
          });
          setAppointments(merged);
        }
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
      }
    };
    
    fetchAppointments();
    const fetchInterval = setInterval(fetchAppointments, 1000);
    return () => clearInterval(fetchInterval);
  }, []);

  useEffect(() => {
    const fetchSettingsAndDoctors = async () => {
      try {
        const res = await fetch(`https://zenora-backend-black.vercel.app/api/settings`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setSystemSettings(data);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }

      try {
        const res = await fetch(`https://zenora-backend-black.vercel.app/api/doctors`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setDoctors(data);
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      }
    };

    if (isLoggedIn) {
      fetchSettingsAndDoctors();
      const settingsInterval = setInterval(fetchSettingsAndDoctors, 3000);
      return () => clearInterval(settingsInterval);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const checkAndCompleteAppointments = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.getHours() * 60 + now.getMinutes();

      setAppointments(prev => prev.map(apt => {
        if (apt.status === 'Completed' || apt.status === 'Cancelled') return apt;
        
        const aptDate = apt.appointmentDate;
        if (!aptDate) return apt; // Priority leads and others without a date shouldn't auto-complete
        if (aptDate < today) return { ...apt, status: 'Completed' };
        
        if (aptDate === today && apt.status === 'Confirmed') {
          const timeParts = apt.appointmentTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (timeParts) {
            let hours = parseInt(timeParts[1]);
            const minutes = parseInt(timeParts[2]);
            const period = timeParts[3].toUpperCase();
            
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            
            const aptTime = hours * 60 + minutes;
            if (currentTime > aptTime + 60) return { ...apt, status: 'Completed' };
          }
        }
        return apt;
      }));
    };

    checkAndCompleteAppointments();
    const interval = setInterval(checkAndCompleteAppointments, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!email || !password) {
      setLoginError('Please enter both email and password');
      return;
    }
    
    try {
      const res = await fetch(`https://zenora-backend-black.vercel.app/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setIsLoggedIn(true);
        setLoggedInUser(data.user);
        if (rememberMe) {
          localStorage.setItem('adminLoggedIn', 'true');
          localStorage.setItem('adminUser', JSON.stringify(data.user));
        } else {
          sessionStorage.setItem('adminLoggedIn', 'true');
          sessionStorage.setItem('adminUser', JSON.stringify(data.user));
        }
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setLoginError('Failed to connect to authentication server');
    }
  };



  const filteredAppointments = appointments
    .filter(apt => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchLower === '' || 
        (apt.patientName?.toLowerCase() || '').includes(searchLower) ||
        (apt.email?.toLowerCase() || '').includes(searchLower) ||
        (apt.doctor?.toLowerCase() || '').includes(searchLower);
      
      const matchesStatus = statusFilter === 'all' ? true : statusFilter === 'priority' ? Boolean(apt.service && apt.service.includes('Priority')) : apt.status === statusFilter;
      
      let matchesDate = true;
      const today = new Date();
      // Adjust timezone to get correct local date string
      const localTodayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      
      if (dateFilter === 'today') {
        matchesDate = apt.appointmentDate === localTodayStr;
      } else if (dateFilter === 'week') {
        const currentDay = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - currentDay);
        const startStr = new Date(startOfWeek.getTime() - startOfWeek.getTimezoneOffset() * 60000).toISOString().split('T')[0];
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const endStr = new Date(endOfWeek.getTime() - endOfWeek.getTimezoneOffset() * 60000).toISOString().split('T')[0];
        
        matchesDate = apt.appointmentDate >= startStr && apt.appointmentDate <= endStr;
      } else if (dateFilter === 'month') {
        const currentMonthStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 7); // YYYY-MM
        matchesDate = apt.appointmentDate.startsWith(currentMonthStr);
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
        const timeB = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
        if (timeA !== timeB && timeA > 0 && timeB > 0) return timeB - timeA;
        const idA = parseInt(String(a.appointmentId).replace(/\D/g, ''), 10) || 0;
        const idB = parseInt(String(b.appointmentId).replace(/\D/g, ''), 10) || 0;
        if (idA !== idB) return idB - idA;
        return new Date(b.appointmentDate + ' ' + (b.appointmentTime || '')).getTime() - 
               new Date(a.appointmentDate + ' ' + (a.appointmentTime || '')).getTime();
      } else if (sortBy === 'oldest') {
        const timeA = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
        const timeB = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
        if (timeA !== timeB && timeA > 0 && timeB > 0) return timeA - timeB;
        const idA = parseInt(String(a.appointmentId).replace(/\D/g, ''), 10) || 0;
        const idB = parseInt(String(b.appointmentId).replace(/\D/g, ''), 10) || 0;
        if (idA !== idB) return idA - idB;
        return new Date(a.appointmentDate + ' ' + (a.appointmentTime || '')).getTime() - 
               new Date(b.appointmentDate + ' ' + (b.appointmentTime || '')).getTime();
      } else if (sortBy === 'name') {
        return (a.patientName || '').localeCompare(b.patientName || '');
      }
      return 0;
    });

  const todayAppointments = appointments.filter(apt => apt.appointmentDate === new Date().toISOString().split('T')[0]);
  const pendingAppointments = appointments.filter(apt => apt.status === 'Pending');

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    isUpdatingRef.current = true;
    lastOptimisticUpdateRef.current = Date.now();
    // Optimistic UI update
    setAppointments(prev => prev.map(apt => 
      apt.appointmentId === appointmentId ? { ...apt, status: newStatus } : apt
    ));

    try {
      const response = await fetch(`https://zenora-backend-black.vercel.app/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) {
        console.error('Failed to update status on server');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      isUpdatingRef.current = false;
    }
  };

  const handleAssignDoctor = async (appointmentId: string, doctorName: string) => {
    isUpdatingRef.current = true;
    lastOptimisticUpdateRef.current = Date.now();
    // Optimistic UI update
    setAppointments(prev => prev.map(apt => 
      apt.appointmentId === appointmentId ? { ...apt, doctor: doctorName } : apt
    ));

    try {
      const response = await fetch(`https://zenora-backend-black.vercel.app/api/appointments/${appointmentId}/doctor`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor: doctorName })
      });
      if (!response.ok) {
        console.error('Failed to update doctor on server');
      }
    } catch (err) {
      console.error('Error assigning doctor:', err);
    } finally {
      isUpdatingRef.current = false;
    }
  };

  const togglePriority = async (appointment: Appointment) => {
    isUpdatingRef.current = true;
    lastOptimisticUpdateRef.current = Date.now();
    
    const isPriority = appointment.service && appointment.service.toLowerCase().includes('priority');
    let newService = appointment.service || 'General Checkup';
    if (isPriority) {
      newService = newService.replace(/ - Priority/gi, '').replace(/Priority Lead/gi, 'General Checkup').trim();
      if (newService.toLowerCase().includes('priority') || newService === '') {
        newService = 'General Checkup';
      }
    } else {
      newService = newService === 'General Checkup' ? 'Priority Lead' : `${newService} - Priority`;
    }

    // Optimistic UI update
    setAppointments(prev => prev.map(apt => 
      apt.appointmentId === appointment.appointmentId ? { ...apt, service: newService } : apt
    ));
    if (selectedAppointment && selectedAppointment.appointmentId === appointment.appointmentId) {
      setSelectedAppointment({ ...selectedAppointment, service: newService });
    }

    try {
      const response = await fetch(`https://zenora-backend-black.vercel.app/api/appointments/${appointment.appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...appointment, service: newService })
      });
      if (!response.ok) {
        throw new Error('Failed to update priority on server');
      }
      showToast(`Marked as ${isPriority ? 'Normal' : 'Priority'}`, 'success');
    } catch (err) {
      console.error('Error toggling priority:', err);
      showToast('Error updating priority', 'error');
    } finally {
      isUpdatingRef.current = false;
    }
  };

  const handleUpdateAppointmentDetails = async () => {
    if (!selectedAppointment) return;
    isUpdatingRef.current = true;
    lastOptimisticUpdateRef.current = Date.now();

    const updatedApt = { ...selectedAppointment, ...editForm };
    setAppointments(prev => prev.map(apt => 
      apt.appointmentId === selectedAppointment.appointmentId ? updatedApt : apt
    ));
    setSelectedAppointment(updatedApt);
    setIsEditingDetails(false);

    try {
      const response = await fetch(`https://zenora-backend-black.vercel.app/api/appointments/${selectedAppointment.appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (response.ok) {
        showToast('Appointment details updated successfully.', 'success');
      } else {
        // Fallback to PATCH endpoints if PUT is propagating or unavailable on edge node
        let fallbackSuccess = false;
        if (editForm.doctor !== undefined && editForm.doctor !== selectedAppointment.doctor) {
          const docRes = await fetch(`https://zenora-backend-black.vercel.app/api/appointments/${selectedAppointment.appointmentId}/doctor`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ doctor: editForm.doctor })
          });
          if (docRes.ok) fallbackSuccess = true;
        }
        if (editForm.status !== undefined && editForm.status !== selectedAppointment.status) {
          const statusRes = await fetch(`https://zenora-backend-black.vercel.app/api/appointments/${selectedAppointment.appointmentId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: editForm.status })
          });
          if (statusRes.ok) fallbackSuccess = true;
        }
        if (fallbackSuccess) {
          showToast('Appointment updated successfully.', 'success');
        } else {
          showToast('Failed to update appointment details on server.', 'error');
        }
      }
    } catch (err) {
      console.error('Error updating appointment details:', err);
      showToast('Error updating appointment details.', 'error');
    } finally {
      isUpdatingRef.current = false;
    }
  };

  const handleClearAppointments = async () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear Database',
      message: 'Are you sure you want to permanently clear the appointment database? This cannot be undone.',
      onConfirm: async () => {
        try {
          const response = await fetch(`https://zenora-backend-black.vercel.app/api/appointments`, {
            method: 'DELETE',
          });
          if (response.ok) {
            setAppointments([]);
            showToast('Database successfully cleared.', 'success');
          } else {
            console.error('Failed to clear appointments on server');
          }
        } catch (err) {
          console.error('Error clearing appointments:', err);
        }
      }
    });
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Patient', 'Age', 'Gender', 'Phone', 'Doctor', 'Date', 'Time', 'Status'];
    const rows = filteredAppointments.map(apt => [
      apt.appointmentId, apt.patientName, apt.age, apt.gender, `="${apt.phone}"`,
      apt.doctor, `="${apt.appointmentDate}"`, apt.appointmentTime, apt.status
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appointments.csv';
    a.click();
  };

  const getStatusBadge = (status: Appointment['status']) => {
    const variants: Record<Appointment['status'], string> = {
      Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      Completed: 'bg-green-50 text-green-700 border-green-200',
      Cancelled: 'bg-red-50 text-red-700 border-red-200'
    };
    return <Badge variant="outline" className={cn('font-medium', variants[status])}>{status}</Badge>;
  };

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
    { id: 'command-center' as const, label: 'Command Center', icon: <Activity className="h-4 w-4" /> },
    { id: 'appointments' as const, label: 'Appointments', icon: <Calendar className="h-4 w-4" /> },
    { id: 'patients' as const, label: 'Patients', icon: <Users className="h-4 w-4" /> },
    { id: 'doctors' as const, label: 'Doctors', icon: <User className="h-4 w-4" /> },
    { id: 'calendar' as const, label: 'Calendar', icon: <Calendar className="h-4 w-4" /> },
    { id: 'analytics' as const, label: 'Analytics', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'settings' as const, label: 'Settings', icon: <Settings className="h-4 w-4" /> }
  ];

  const renderDashboard = () => {
    const chartData = [
      { name: "Mon", value: 65 }, { name: "Tue", value: 80 }, { name: "Wed", value: 45 },
      { name: "Thu", value: 70 }, { name: "Fri", value: 85 }, { name: "Sat", value: 60 }, { name: "Sun", value: 40 }
    ];

    const uniquePatientsCount = new Set(appointments.map(a => a.email || a.phone || a.patientName)).size;

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Dashboard</h2>
          <p className="text-zinc-500">Welcome back, Admin</p>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCardComponent
            title="Total Appointments"
            currentValue={appointments.length}
            description="All time appointments"
            icon={<Calendar />}
            chartData={chartData.map(d => ({ ...d, color: 'bg-zinc-300' }))}
          />
          <StatsCardComponent
            title="Today's Appointments"
            currentValue={todayAppointments.length}
            description="Scheduled for today"
            icon={<Clock />}
            chartData={chartData.map(d => ({ ...d, color: 'bg-blue-500' }))}
          />
          <StatsCardComponent
            title="Total Patients"
            currentValue={uniquePatientsCount}
            description="Registered patients"
            icon={<Users />}
            chartData={chartData.map(d => ({ ...d, color: 'bg-green-500' }))}
          />
          <StatsCardComponent
            title="Pending Appointments"
            currentValue={pendingAppointments.length}
            description="Awaiting confirmation"
            icon={<Activity />}
            chartData={chartData.map(d => ({ ...d, color: 'bg-yellow-500' }))}
          />
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="border-zinc-200 shadow-sm rounded-xl transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.12)] hover:border-zinc-300">
            <CardHeader>
              <h3 className="text-base font-bold text-zinc-900">Recent Appointments</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {appointments.slice(0, 5).map(apt => (
                  <div key={apt.appointmentId} className="flex items-center">
                    <Avatar className="h-9 w-9 bg-slate-100 text-zinc-700 font-bold border-0 flex items-center justify-center">
                      <AvatarFallback className="bg-transparent">{apt.patientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none text-zinc-900">{apt.patientName}</p>
                      <p className="text-xs text-zinc-500">
                        {apt.doctor}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {getStatusBadge(apt.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 shadow-sm rounded-xl transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.12)] hover:border-zinc-300">
            <CardHeader>
              <h3 className="text-base font-bold text-zinc-900">Appointment Status Distribution</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map((status) => {
                const count = appointments.filter(apt => apt.status === status).length;
                const percentage = appointments.length > 0 ? (count / appointments.length) * 100 : 0;
                let bgClass = "bg-zinc-300";
                if (status === 'Pending') bgClass = "bg-yellow-500";
                if (status === 'Confirmed') bgClass = "bg-blue-500";
                if (status === 'Completed') bgClass = "bg-green-500";
                if (status === 'Cancelled') bgClass = "bg-red-500";

                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-zinc-900">{status}</span>
                      <span className="text-zinc-500">{count}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${bgClass} rounded-full transition-all`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderAppointments = () => (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Appointments</h2>
          <p className="text-zinc-500">Manage all patient appointments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleClearAppointments} variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg">
            <XCircle className="h-4 w-4" />
            Clear Database
          </Button>
          <Button onClick={exportToCSV} className="gap-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="border-zinc-200 shadow-sm rounded-xl">
        <CardHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 pb-2 border-b border-zinc-100">
              {[
                { id: 'all', label: 'All Appointments', count: appointments.length },
                { id: 'priority', label: '⚡ Priority Leads', count: appointments.filter(a => Boolean(a.service && a.service.includes('Priority'))).length },
                { id: 'Pending', label: '🟡 Pending', count: appointments.filter(a => a.status === 'Pending').length },
                { id: 'Confirmed', label: '🔵 Confirmed', count: appointments.filter(a => a.status === 'Confirmed').length },
                { id: 'Completed', label: '🟢 Completed', count: appointments.filter(a => a.status === 'Completed').length },
                { id: 'Cancelled', label: '🔴 Cancelled', count: appointments.filter(a => a.status === 'Cancelled').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    statusFilter === tab.id
                      ? 'bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${statusFilter === tab.id ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800' : 'bg-zinc-200/80 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search by patient name, email, or doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-lg border-zinc-200"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'all')} items={[
                { value: 'all', label: 'All Status' },
                { value: 'priority', label: '⚡ Priority Leads' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Confirmed', label: 'Confirmed' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Cancelled', label: 'Cancelled' }
              ]}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-lg border-zinc-200">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={(val) => setDateFilter(val || 'all')} items={[
                { value: 'all', label: 'All Dates' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' }
              ]}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-lg border-zinc-200">
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(val) => setSortBy(val || 'newest')} items={[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'name', label: 'Name (A-Z)' }
              ]}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-lg border-zinc-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || statusFilter !== 'all' || dateFilter !== 'all' || sortBy !== 'newest') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setDateFilter('all');
                    setSortBy('newest');
                  }}
                  className="w-full sm:w-auto rounded-lg border-zinc-200"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            <div className="text-sm text-zinc-500 font-medium">
              Showing {filteredAppointments.length} of {appointments.length} appointments
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {statusFilter === 'priority' && (
            <div className="mb-6 p-4 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-zinc-800">
              <div>
                <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
                  <span>⚡ Priority Homepage Callback Queue</span>
                </h3>
                <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-0.5">
                  Patients in this specialized section requested immediate 10-minute telephone contact via the website widget.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded bg-zinc-800 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-800">
                Active Leads: {filteredAppointments.length}
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-200">
                  <TableHead className="font-bold text-zinc-900">ID</TableHead>
                  <TableHead className="font-bold text-zinc-900">Patient</TableHead>
                  {statusFilter !== 'priority' && <TableHead className="font-bold text-zinc-900">Age</TableHead>}
                  {statusFilter !== 'priority' && <TableHead className="font-bold text-zinc-900">Gender</TableHead>}
                  <TableHead className="font-bold text-zinc-900">Phone</TableHead>
                  <TableHead className="font-bold text-zinc-900">Doctor</TableHead>
                  <TableHead className="font-bold text-zinc-900">Date</TableHead>
                  <TableHead className="font-bold text-zinc-900">Time</TableHead>
                  <TableHead className="font-bold text-zinc-900">Status</TableHead>
                  <TableHead className="font-bold text-zinc-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((apt) => (
                  <TableRow key={apt.appointmentId} className={`transition-colors ${apt.service && apt.service.includes('Priority') ? 'bg-zinc-100/80 hover:bg-zinc-200/60 dark:bg-zinc-800/50 border-l-4 border-l-zinc-900 dark:border-l-zinc-100 font-medium' : 'border-zinc-100 hover:bg-zinc-50/50'}`}>
                    <TableCell className="font-medium text-zinc-900">{apt.appointmentId}</TableCell>
                    <TableCell className="font-medium text-zinc-900">
                      <div className="flex items-center gap-2">
                        <span>{apt.patientName === 'Unknown' || !apt.patientName ? 'New Inquiry' : apt.patientName}</span>
                        {apt.service && apt.service.includes('Priority') && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 uppercase tracking-wider shadow-sm" title="Homepage Priority Callback">
                            Priority Lead
                          </span>
                        )}
                      </div>
                    </TableCell>
                    {statusFilter !== 'priority' && (
                      <TableCell className="text-zinc-500">
                        {(apt.service && apt.service.toLowerCase().includes('priority')) || (Number(apt.age) === 30 && apt.gender === 'Not specified') ? '-' : (apt.age || '-')}
                      </TableCell>
                    )}
                    {statusFilter !== 'priority' && (
                      <TableCell className="text-zinc-500">
                        {(apt.service && apt.service.toLowerCase().includes('priority')) || apt.gender === 'Not specified' || apt.gender === 'Not Specified' ? '-' : (apt.gender || '-')}
                      </TableCell>
                    )}
                    <TableCell className="text-zinc-500 font-medium text-zinc-900">{apt.phone}</TableCell>
                    <TableCell className="text-zinc-500">{apt.doctor || 'Unassigned'}</TableCell>
                    <TableCell className="text-zinc-500">{apt.appointmentDate}</TableCell>
                    <TableCell className="text-zinc-500">{apt.appointmentTime}</TableCell>
                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {apt.service && apt.service.includes('Priority') && (
                          <a
                            href={`tel:${apt.phone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs transition-colors shadow-sm"
                            title="Initiate Telephone Consultation"
                          >
                            <Phone className="w-3 h-3" />
                            Call
                          </a>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg border-zinc-200 text-zinc-600 hover:text-zinc-900"
                          title="View Details"
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setIsEditingDetails(false);
                            setShowDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:hover:bg-blue-950/30"
                          title="Edit Appointment & Patient Details"
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setEditForm({ ...apt });
                            setIsEditingDetails(true);
                            setShowDetails(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {apt.status === 'Pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                            onClick={() => handleStatusChange(apt.appointmentId, 'Confirmed')}
                            title="Approve Appointment"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {apt.status === 'Confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg border-green-200 bg-green-50 hover:bg-green-100 text-green-700"
                            onClick={() => handleStatusChange(apt.appointmentId, 'Completed')}
                            title="Mark as Completed"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleStatusChange(apt.appointmentId, 'Cancelled')}
                            title="Cancel Appointment"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {apt.status === 'Completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => {
                              setInvoiceData({ patientName: apt.patientName, doctorName: apt.doctor || 'Dr. Zora', appointmentDate: apt.appointmentDate });
                              setIsInvoiceModalOpen(true);
                            }}
                            title="Generate Invoice PDF"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg border-zinc-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-zinc-800 dark:hover:bg-red-950/30"
                          onClick={() => handleDeleteAppointment(apt)}
                          title="Delete Appointment Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  const renderCalendar = () => {
    const weekStart = startOfWeek(currentMonth, { weekStartsOn: 0 }); // Sunday
    const weekEnd = endOfWeek(currentMonth, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    // 8 AM to 6 PM
    const hours = Array.from({ length: 11 }, (_, i) => i + 8);

    const getAppointmentsForDay = (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return appointments.filter(apt => apt.appointmentDate === dateStr);
    };

    const getDotColor = (status: string) => {
      switch(status) {
        case 'Pending': return 'bg-amber-500';
        case 'Confirmed': return 'bg-blue-500';
        case 'Completed': return 'bg-emerald-500';
        case 'Cancelled': return 'bg-red-500';
        default: return 'bg-zinc-500';
      }
    };

    const getPillStyle = (status: string) => {
      switch(status) {
        case 'Pending': return 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-100 border-l-amber-500';
        case 'Confirmed': return 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 border-blue-200 dark:border-blue-500/30 text-blue-900 dark:text-blue-100 border-l-blue-500';
        case 'Completed': return 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-100 border-l-emerald-500';
        case 'Cancelled': return 'bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 border-red-200 dark:border-red-500/30 text-red-900 dark:text-red-100 border-l-red-500 opacity-60';
        default: return 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-500/10 dark:hover:bg-zinc-500/20 border-zinc-200 dark:border-zinc-500/30 text-zinc-900 dark:text-zinc-100 border-l-zinc-500';
      }
    };

    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Weekly Schedule</h2>
            <p className="text-zinc-500">Drag and drop to reschedule appointments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentMonth(subWeeks(currentMonth, 1))}>Prev Week</Button>
            <div className="text-lg font-bold flex items-center px-4 min-w-[200px] justify-center">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </div>
            <Button variant="outline" onClick={() => setCurrentMonth(addWeeks(currentMonth, 1))}>Next Week</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-zinc-950 flex flex-col h-[700px]">
            {/* Header: Days */}
            <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 pr-[14px]">
              <div className="py-2.5 flex items-center justify-center text-[10px] font-semibold text-zinc-400 uppercase tracking-wider border-r border-zinc-200 dark:border-zinc-800 shrink-0">
                Time
              </div>
              {days.map(day => (
                <div key={day.toISOString()} className="py-2 flex flex-col items-center justify-center border-l border-transparent">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{format(day, 'EEE')}</span>
                  <span className={cn(
                    "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mt-0.5",
                    isToday(day) ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-900 dark:text-zinc-100"
                  )}>
                    {format(day, 'd')}
                  </span>
                </div>
              ))}
            </div>

            {/* Scrollable Time Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] min-w-max w-full">
                {/* Time Axis */}
                <div className="flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 sticky left-0 z-20 shrink-0">
                  {hours.map(hour => (
                    <div key={hour} className="h-[80px] relative">
                      <span className="absolute -top-[9px] right-2 text-[10px] font-medium text-zinc-400 bg-white dark:bg-zinc-950/50 px-1 z-10">
                        {format(new Date().setHours(hour, 0), 'h a')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Day Columns */}
                {days.map(day => {
                  const dayApts = getAppointmentsForDay(day);
                  const isCurrentDay = isToday(day);
                  const now = new Date();
                  const currentHour = now.getHours();
                  const currentMinute = now.getMinutes();
                  const showCurrentTime = isCurrentDay && currentHour >= 8 && currentHour < 19;
                  const currentTimeTop = showCurrentTime ? ((currentHour - 8) * 80) + ((currentMinute / 60) * 80) : 0;

                  return (
                    <div 
                      key={day.toISOString()} 
                      className={cn(
                        "flex flex-col relative border-l border-zinc-100 dark:border-zinc-800/50",
                        isCurrentDay ? "bg-indigo-50/10 dark:bg-indigo-900/5" : ""
                      )}
                    >
                      {/* Current Time Indicator */}
                      {showCurrentTime && (
                        <div 
                          className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                          style={{ top: `${currentTimeTop}px`, transform: 'translateY(-50%)' }}
                        >
                          <div className="w-2 h-2 rounded-full bg-red-500 absolute -left-1 shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
                          <div className="h-[2px] bg-red-500 w-full shadow-[0_0_4px_rgba(239,68,68,0.3)]" />
                        </div>
                      )}

                      {hours.map(hour => (
                        <div 
                          key={hour} 
                          className="h-[80px] border-b border-zinc-100 dark:border-zinc-800/50 transition-colors relative group/cell"
                        >
                          <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-zinc-100 dark:border-zinc-800/30" />
                        </div>
                      ))}
                      
                      {/* Appointments (Absolutely Positioned) */}
                      {dayApts.map((apt, j) => {
                        // Calculate position based on time
                        let aptDate;
                        try {
                          aptDate = parse(apt.appointmentTime, 'hh:mm a', day);
                        } catch(e) {
                          try { aptDate = parse(apt.appointmentTime, 'h:mm a', day); }
                          catch(e2) { aptDate = new Date(day.setHours(9,0)); }
                        }
                        
                        if (isNaN(aptDate.getTime())) aptDate = new Date(day.setHours(9,0));
                        
                        const aptHour = aptDate.getHours();
                        const aptMinute = aptDate.getMinutes();
                        
                        // Map to top offset: each hour is 80px, starting at 8 AM (index 0)
                        const startHourIndex = aptHour - 8;
                        const topPx = (startHourIndex * 80) + ((aptMinute / 60) * 80);
                        
                        if (startHourIndex < 0 || startHourIndex > 10) return null;

                        return (
                          <div 
                            key={j} 
                            onClick={(e) => { e.stopPropagation(); setSelectedAppointment(apt); setShowDetails(true); }}
                            style={{ top: `${topPx}px`, height: '60px' }}
                            className={cn(
                              "absolute left-1 right-1 group border border-l-4 shadow-sm rounded-md p-1.5 transition-all cursor-pointer z-10 overflow-hidden flex flex-col justify-center",
                              getPillStyle(apt.status)
                            )}
                          >
                            <div className="font-semibold text-xs truncate leading-tight">
                              {apt.patientName}
                            </div>
                            <div className="text-[10px] mt-0.5 truncate flex items-center gap-1 opacity-80 font-medium">
                              <Clock className="w-2.5 h-2.5 shrink-0" />
                              {apt.appointmentTime}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border-zinc-200 shadow-sm rounded-xl flex flex-col h-[500px]">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">{format(selectedDate, 'EEEE, MMMM d')}</h3>
            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              {getAppointmentsForDay(selectedDate).length === 0 ? (
                <p className="text-zinc-500 text-sm text-center mt-10">No appointments on this day.</p>
              ) : (
                getAppointmentsForDay(selectedDate).map((apt) => (
                  <div 
                    key={apt.appointmentId} 
                    className="p-3 border border-zinc-200 rounded-lg flex gap-3 cursor-pointer hover:bg-zinc-50 transition-colors" 
                    onClick={() => setSelectedAppointment(apt)}
                  >
                    <div className={cn("w-1 flex-shrink-0 rounded-full", getDotColor(apt.status))}></div>
                    <div>
                      <p className="font-semibold text-sm text-zinc-900">{apt.patientName}</p>
                      <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {apt.appointmentTime}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`https://zenora-backend-black.vercel.app/api/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword })
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins(prev => [...prev, data.admin]);
        setNewAdminEmail('');
        setNewAdminPassword('');
        showToast('Administrator added successfully.', 'success');
      } else {
        const err = await res.json();
        showToast(err.error, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while adding administrator.', 'error');
    }
  };

  const handleDeleteAdmin = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Revoke Access',
      message: 'Are you sure you want to revoke access for this administrator? They will no longer be able to log in.',
      onConfirm: async () => {
        try {
          const res = await fetch(`https://zenora-backend-black.vercel.app/api/admins/${id}`, { method: 'DELETE' });
          if (res.ok) {
            setAdmins(prev => prev.filter(a => a.id !== id));
            showToast('Administrator access revoked.', 'success');
          } else {
            const err = await res.json();
            showToast(err.error, 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Network error while deleting administrator.', 'error');
        }
      }
    });
  };

  const handleUpdateRole = async (id: string, newRole: string) => {
    try {
      const res = await fetch(`https://zenora-backend-black.vercel.app/api/admins/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setAdmins(prev => prev.map(a => a.id === id ? { ...a, role: newRole } : a));
        showToast('Role updated successfully.', 'success');
      } else {
        const err = await res.json();
        showToast(err.error, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while updating role.', 'error');
    }
  };

  const handleResetPassword = (id: string) => {
    setPromptValue('');
    setPromptDialog({
      isOpen: true,
      title: 'Reset Password',
      message: 'Enter the new password for this administrator:',
      onConfirm: async (newPassword: string) => {
        try {
          const res = await fetch(`https://zenora-backend-black.vercel.app/api/admins/${id}/password`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword })
          });
          if (res.ok) {
            showToast('Password successfully reset.', 'success');
          } else {
            const err = await res.json();
            showToast(err.error, 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Network error while resetting password.', 'error');
        }
      }
    });
  };

  const handleToggleSetting = async (setting: 'maintenanceMode' | 'pauseBookings') => {
    if (togglingSetting === setting) return;
    const previousValue = systemSettings[setting];
    const newValue = !previousValue;
    
    // Optimistic UI update for instantaneous professional feedback
    setSystemSettings(prev => ({ ...prev, [setting]: newValue }));
    setTogglingSetting(setting);

    try {
      const res = await fetch(`https://zenora-backend-black.vercel.app/api/settings`, {
        method: 'PATCH',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [setting]: newValue })
      });
      if (!res.ok) throw new Error('Server returned error');
      const data = await res.json();
      if (data.settings) setSystemSettings(data.settings);
      showToast(`${setting === 'maintenanceMode' ? 'Maintenance Mode' : 'Online Bookings'} ${newValue ? 'enabled' : 'disabled'} successfully.`, 'success');
    } catch (err) {
      console.error(err);
      setSystemSettings(prev => ({ ...prev, [setting]: previousValue }));
      showToast('Failed to update setting. Please try again.', 'error');
    } finally {
      setTogglingSetting(null);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`https://zenora-backend-black.vercel.app/api/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoctor)
      });
      if (res.ok) {
        const data = await res.json();
        setDoctors(prev => [...prev, data.doctor]);
        setNewDoctor({ name: '', specialization: '', phone: '', email: '' });
        setNewDoctorDialog(false);
        showToast('Doctor added successfully.', 'success');
      } else {
        const err = await res.json();
        showToast(err.error, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while adding doctor.', 'error');
    }
  };

  const handleDeleteDoctor = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Doctor',
      message: 'Are you sure you want to remove this doctor from the directory?',
      onConfirm: async () => {
        try {
          const res = await fetch(`https://zenora-backend-black.vercel.app/api/doctors/${id}`, { method: 'DELETE' });
          if (res.ok) {
            setDoctors(prev => prev.filter(d => d.id !== id));
            showToast('Doctor removed.', 'success');
          } else {
            const err = await res.json();
            showToast(err.error, 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Network error while removing doctor.', 'error');
        }
      }
    });
  };

  const handleDeletePatient = (patient: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Patient',
      message: `Are you sure you want to delete ${patient.name} and all their appointment records?`,
      onConfirm: async () => {
        try {
          const res = await fetch(`https://zenora-backend-black.vercel.app/api/patients/${encodeURIComponent(patient.id)}`, { method: 'DELETE' });
          if (res.ok) {
            setAppointments(prev => prev.filter(apt => {
              const contact = apt.email || apt.phone || '';
              const name = apt.patientName?.trim().toLowerCase() || '';
              const key = `${name}|${contact}`;
              return key !== patient.id;
            }));
            showToast('Patient and appointment records deleted.', 'success');
          } else {
            const err = await res.json();
            showToast(err.error, 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Network error while deleting patient.', 'error');
        }
      }
    });
  };

  const handleDeleteAppointment = (apt: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Appointment',
      message: `Are you sure you want to delete appointment ${apt.appointmentId} for ${apt.patientName}?`,
      onConfirm: async () => {
        try {
          const res = await fetch(`https://zenora-backend-black.vercel.app/api/appointments/${encodeURIComponent(apt.appointmentId)}`, { method: 'DELETE' });
          if (res.ok) {
            setAppointments(prev => prev.filter(a => a.appointmentId !== apt.appointmentId));
            showToast('Appointment deleted.', 'success');
          } else {
            const err = await res.json();
            showToast(err.error || 'Failed to delete', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Network error while deleting appointment.', 'error');
        }
      }
    });
  };

  const renderSettings = () => (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">User Management</h2>
        <p className="text-zinc-500">Manage administrator access to the dashboard.</p>
      </div>

      {loggedInUser?.role === 'Master Admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="border-red-200 dark:border-red-900 shadow-sm rounded-xl overflow-hidden bg-red-50/30 dark:bg-red-950/20">
            <CardHeader className="border-b border-red-100 dark:border-red-900/50 pb-4">
              <h3 className="font-bold text-red-900 dark:text-red-400 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Master Admin System Controls
              </h3>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">Maintenance Mode</p>
                  <p className="text-xs text-zinc-500">Take the portal offline for standard users.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={systemSettings.maintenanceMode}
                  disabled={togglingSetting === 'maintenanceMode'}
                  onClick={() => handleToggleSetting('maintenanceMode')}
                  className={`w-12 h-6 rounded-full relative inline-flex items-center p-0.5 cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-60 ${systemSettings.maintenanceMode ? 'bg-rose-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                >
                  <span className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center ${systemSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}>
                    {togglingSetting === 'maintenanceMode' && <Loader2 className="w-3 h-3 text-zinc-600 animate-spin" />}
                  </span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">Pause Online Bookings</p>
                  <p className="text-xs text-zinc-500">Temporarily stop new appointments from the website.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={systemSettings.pauseBookings}
                  disabled={togglingSetting === 'pauseBookings'}
                  onClick={() => handleToggleSetting('pauseBookings')}
                  className={`w-12 h-6 rounded-full relative inline-flex items-center p-0.5 cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-60 ${systemSettings.pauseBookings ? 'bg-amber-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                >
                  <span className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center ${systemSettings.pauseBookings ? 'translate-x-6' : 'translate-x-0'}`}>
                    {togglingSetting === 'pauseBookings' && <Loader2 className="w-3 h-3 text-zinc-600 animate-spin" />}
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-gray-900">
            <CardHeader className="bg-slate-50 dark:bg-gray-950 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Active Administrators</h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50/50 dark:bg-gray-950/50 text-zinc-500 dark:text-zinc-400 font-medium border-b border-zinc-100 dark:border-zinc-800">
                    <tr>
                      <th className="px-4 py-3 font-medium">Admin ID</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {admins.map(admin => (
                      <tr key={admin.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{admin.id}</td>
                        <td className="px-4 py-3 dark:text-zinc-300">{admin.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={admin.role === 'Master Admin' ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'}>
                            {admin.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {loggedInUser?.role === 'Master Admin' && admin.id !== loggedInUser.id && admin.id !== 'ADM0001' && (loggedInUser.id === 'ADM0001' || admin.role !== 'Master Admin') && (
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleUpdateRole(admin.id, admin.role === 'Master Admin' ? 'Administrator' : 'Master Admin')} className="text-zinc-500 hover:text-zinc-900 h-8 text-xs">
                                {admin.role === 'Master Admin' ? 'Demote' : 'Promote'}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleResetPassword(admin.id)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 h-8 text-xs">
                                Reset Pwd
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteAdmin(admin.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 h-8 text-xs">
                                Revoke
                              </Button>
                            </div>
                          )}
                          {loggedInUser?.role !== 'Master Admin' && admin.role !== 'Master Admin' && admin.id !== loggedInUser?.id && admin.id !== 'ADM0001' && (
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteAdmin(admin.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 h-8 text-xs">
                              Revoke Access
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {loggedInUser?.role === 'Master Admin' && (
          <div>
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl bg-white dark:bg-gray-900">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Add New Admin</h3>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div>
                  <Label htmlFor="newAdminEmail" className="text-xs font-bold mb-1.5 block text-zinc-700 dark:text-zinc-300">Email Address</Label>
                  <Input 
                    id="newAdminEmail" 
                    type="email" 
                    value={newAdminEmail} 
                    onChange={e => setNewAdminEmail(e.target.value)} 
                    placeholder="user@hospital.com" 
                    required 
                    className="bg-slate-50 dark:bg-gray-950 border-zinc-200 dark:border-zinc-800"
                  />
                </div>
                <div>
                  <Label htmlFor="newAdminPassword" className="text-xs font-bold mb-1.5 block text-zinc-700 dark:text-zinc-300">Temporary Password</Label>
                  <Input 
                    id="newAdminPassword" 
                    type="password" 
                    value={newAdminPassword} 
                    onChange={e => setNewAdminPassword(e.target.value)} 
                    required 
                    className="bg-slate-50 dark:bg-gray-950 border-zinc-200 dark:border-zinc-800"
                  />
                </div>
                <Button type="submit" className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-white shadow-sm mt-2 font-bold">
                  <User className="w-4 h-4 mr-2" /> Invite Administrator
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        )}
      </div>
    </div>
  );

  const renderPatients = () => {
    const patientsMap = new Map();
    appointments.forEach(apt => {
      const contact = apt.email || apt.phone || '';
      const name = apt.patientName?.trim().toLowerCase() || '';
      const key = `${name}|${contact}`;
      if (!patientsMap.has(key)) {
        patientsMap.set(key, {
          id: key,
          name: apt.patientName,
          email: apt.email,
          phone: apt.phone,
          age: apt.age,
          gender: apt.gender,
          lastVisit: apt.appointmentDate,
          totalVisits: 1,
          appointments: [apt]
        });
      } else {
        const p = patientsMap.get(key);
        p.totalVisits += 1;
        p.appointments.push(apt);
        if (new Date(apt.appointmentDate) > new Date(p.lastVisit)) {
          p.lastVisit = apt.appointmentDate;
        }
      }
    });
    
    const uniquePatients = Array.from(patientsMap.values());

    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Patients Directory</h2>
            <p className="text-zinc-500">View and manage registered patients derived from appointment history.</p>
          </div>
        </div>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-gray-900">
          <CardHeader className="bg-slate-50 dark:bg-gray-950 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">All Patients ({uniquePatients.length})</h3>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50/50 dark:bg-gray-950/50 text-zinc-500 dark:text-zinc-400 font-medium border-b border-zinc-100 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-medium">Patient Name</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Age/Gender</th>
                    <th className="px-4 py-3 font-medium text-center">Total Visits</th>
                    <th className="px-4 py-3 font-medium">Last Visit</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {uniquePatients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                        No patients found.
                      </td>
                    </tr>
                  ) : (
                    uniquePatients.map(patient => (
                      <tr key={patient.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">{patient.name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="dark:text-zinc-300">{patient.phone || 'N/A'}</div>
                          <div className="text-xs text-zinc-500">{patient.email}</div>
                        </td>
                        <td className="px-4 py-3 dark:text-zinc-300">
                          {patient.age} / {patient.gender}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="secondary">{patient.totalVisits}</Badge>
                        </td>
                        <td className="px-4 py-3 dark:text-zinc-300">{patient.lastVisit}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                              onClick={() => setSelectedPatient(patient)}
                            >
                              View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/30"
                              onClick={() => handleDeletePatient(patient)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDoctors = () => {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Medical Staff</h2>
            <p className="text-zinc-500">Manage doctor profiles and specializations.</p>
          </div>
          <Button onClick={() => setNewDoctorDialog(true)} className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold dark:bg-zinc-100 dark:text-black dark:hover:bg-white">
            <User className="w-4 h-4 mr-2" /> Add Doctor
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(doc => (
            <Card key={doc.id} className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="bg-slate-50 dark:bg-gray-950 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-zinc-200 shadow-sm">
                      <AvatarFallback className="bg-zinc-100 text-zinc-900 font-bold text-xs">
                        {doc.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{doc.name}</h3>
                      <p className="text-xs text-zinc-500 font-medium">{doc.specialization}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Phone className="w-4 h-4" /> {doc.phone || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Mail className="w-4 h-4" /> {doc.email || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-2">
                    <Badge variant={doc.status === 'Available' ? 'default' : 'secondary'} className={doc.status === 'Available' ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400' : ''}>
                      {doc.status}
                    </Badge>
                  </div>
                </div>
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteDoctor(doc.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30">
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return renderDashboard();
      case 'command-center': return <CommandCenter appointments={appointments} onViewAppointment={(apt) => { setSelectedAppointment(apt); setShowDetails(true); }} />;
      case 'appointments': return renderAppointments();
      case 'calendar': return renderCalendar();
      case 'analytics': return <AnalyticsDashboard appointments={appointments} />;
      case 'patients': return renderPatients();
      case 'doctors': return renderDoctors();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-gray-950 p-4">
        <Card className="w-full max-w-md rounded-2xl px-6 py-10 shadow-xl border-0 bg-white dark:bg-gray-900">
          <CardContent>
            <div className="flex flex-col items-center space-y-8">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <img src={customLogo} alt="Zenora Dental" className="w-12 h-12 object-contain opacity-90 dark:invert" />
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-zinc-500" />
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                    Admin Access
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-center">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Dental Clinic Portal
                </h1>
                <p className="text-zinc-500 text-sm">
                  Secure administrator login
                </p>
              </div>

              <form className="w-full space-y-5" onSubmit={handleLogin}>
                <div>
                  <Label htmlFor="email" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 block text-left">
                    Administrator Email
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="admin@hospital.com"
                    className="mt-1.5 rounded-lg border-zinc-200 shadow-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <PasswordInputField
                  label="Password"
                  id="password"
                  placeholder="Enter your secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <label htmlFor="remember-me" className="text-zinc-500 font-medium cursor-pointer select-none">
                      Remember me
                    </label>
                  </div>
                </div>

                {loginError && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md text-center">
                    {loginError}
                  </div>
                )}

                <Button type="submit" className="w-full rounded-lg font-bold uppercase tracking-widest text-[13px] bg-zinc-900 hover:bg-zinc-800 text-white shadow-md transition-all duration-200" size="lg">
                  Authorize Access
                </Button>
              </form>

              <div className="relative w-full py-2">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-zinc-200" />
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="bg-white px-3 text-zinc-400">Secure Connection</span>
                </div>
              </div>

              <div className="w-full space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-zinc-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span>256-bit SSL Encrypted</span>
                </div>
              </div>

              <p className="text-center text-[10px] leading-relaxed text-zinc-400 px-4">
                This portal is restricted to authorized clinic administrators only. All access attempts are logged and monitored.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gray-950 font-sans text-zinc-900 dark:text-zinc-100">
      {/* Sidebar - Mobile */}
      <div className={`md:hidden fixed inset-0 z-50 transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
        <div className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-gray-950 border-r border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col">
          <div className="p-6 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800">
            <img src={customLogo} alt="Zenora Dental" className="w-6 h-6 object-contain opacity-90 dark:invert" />
            <span className="font-bold text-xl tracking-tight">Zenora Dental</span>
          </div>
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  currentPage === item.id 
                    ? "bg-zinc-100 text-zinc-900 font-bold" 
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden md:flex w-64 flex-col bg-white dark:bg-gray-950 border-r border-zinc-200 dark:border-zinc-800 z-10">
        <div className="p-6 flex items-center gap-2">
          <img src={customLogo} alt="Zenora Dental" className="w-6 h-6 object-contain opacity-90 dark:invert" />
          <span className="font-bold text-xl tracking-tight">Zenora Dental</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                currentPage === item.id 
                  ? "bg-zinc-100 text-zinc-900 font-bold" 
                  : "text-zinc-500 font-medium hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="bg-white dark:bg-gray-950 border-b border-zinc-200 dark:border-zinc-800 h-16 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Quick Search...</span>
              <kbd className="hidden md:inline-flex bg-zinc-200 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-[10px] font-sans font-bold">Ctrl Space</kbd>
            </button>

            <div className="relative">
              <button 
                className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-950"></span>
                )}
              </button>
              
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-gray-950/50">
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Notifications</h3>
                      <Badge variant="outline" className="text-[10px] font-bold bg-white dark:bg-gray-800">{notificationCount} new</Badge>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-zinc-500">No notifications</div>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n))}
                            className={`p-4 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer relative group ${!notif.unread ? 'opacity-60' : ''}`}
                          >
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${notif.unread ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                            <div className="flex justify-between items-start">
                              <div>
                                <p className={`text-sm font-bold ${notif.unread ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'}`}>{notif.title}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{notif.message}</p>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setNotifications(prev => prev.filter(n => n.id !== notif.id)); }}
                                className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2"
                                title="Dismiss notification"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-wider">{notif.time}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-gray-950/50">
                      <button 
                        className="text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors" 
                        onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                      >
                        Mark all as read
                      </button>
                      <button 
                        className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors" 
                        onClick={() => { setNotifications([]); setShowNotifications(false); }}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-8 w-px bg-zinc-200 mx-1"></div>
            <div className="relative">
              <div 
                className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <Avatar className="h-10 w-10 border border-zinc-200/50 dark:border-zinc-700/50 shadow-md ring-2 ring-offset-2 ring-zinc-100 dark:ring-zinc-800 dark:ring-offset-gray-950 transition-all hover:shadow-lg hover:scale-105">
                  <AvatarFallback className="bg-gradient-to-br from-zinc-800 via-zinc-900 to-black text-white font-bold text-sm tracking-wider">
                    {loggedInUser?.email ? loggedInUser.email.substring(0, 2).toUpperCase() : 'AD'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-sm mr-1">
                  <p className="font-bold leading-none text-zinc-900 dark:text-zinc-100 capitalize tracking-tight">
                    {loggedInUser?.email ? loggedInUser.email.split('@')[0] : 'Admin'}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-semibold mt-1.5">
                    {loggedInUser?.role || 'User'}
                  </p>
                </div>
              </div>
              
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-zinc-100">
                      <p className="font-bold text-sm text-zinc-900 truncate">{loggedInUser?.email}</p>
                      <p className="text-xs text-zinc-500">{loggedInUser?.role}</p>
                    </div>
                    <div className="p-1">
                      <button 
                        onClick={() => {
                          setCurrentPage('settings');
                          setShowProfileMenu(false);
                        }} 
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg text-left"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <button 
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleLogout();
                        }} 
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {renderContent()}
        </main>
      </div>

      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        appointments={appointments}
        doctors={doctors}
        onNavigate={(page) => setCurrentPage(page as any)}
        onSelectPatient={(id) => {
          const apt = appointments.find((a: any) => a.id === id || a.appointmentId === id);
          if (apt) {
            setSelectedAppointment(apt);
            setShowDetails(true);
          }
        }}
      />

      {/* Patient Details / Edit Dialog */}
      <Dialog open={showDetails} onOpenChange={(val) => {
        setShowDetails(val);
        if (!val) setIsEditingDetails(false);
      }}>
        <DialogContent className="max-w-4xl sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between pr-6">
            <DialogTitle>{isEditingDetails ? 'Edit Appointment Details' : 'Patient Details'}</DialogTitle>
            {selectedAppointment && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={selectedAppointment.service?.toLowerCase().includes('priority') ? 'default' : 'outline'}
                  onClick={() => togglePriority(selectedAppointment)}
                  className={cn("gap-1.5 text-xs font-bold", selectedAppointment.service?.toLowerCase().includes('priority') ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400" : "")}
                >
                  <Zap className="h-3.5 w-3.5" />
                  {selectedAppointment.service?.toLowerCase().includes('priority') ? 'Remove Priority' : 'Mark as Priority'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!isEditingDetails) {
                      setEditForm({ ...selectedAppointment });
                    }
                    setIsEditingDetails(!isEditingDetails);
                  }}
                  className="gap-1.5 text-xs font-bold"
                >
                  <Edit className="h-3.5 w-3.5" />
                  {isEditingDetails ? 'Cancel Edit' : 'Edit Information'}
                </Button>
              </div>
            )}
          </DialogHeader>
          {selectedAppointment && (
            isEditingDetails ? (
              <div className="px-2 py-4 space-y-6">
                {/* Patient Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <User className="h-5 w-5 text-[#2563EB]" />
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="edit-name"
                          value={editForm.patientName || ''}
                          onChange={(e) => setEditForm({ ...editForm, patientName: e.target.value })}
                          className="pl-10 h-10"
                          placeholder="Enter full name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="edit-phone"
                          value={editForm.phone || ''}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="pl-10 h-10"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="edit-email"
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="pl-10 h-10"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-age">Age *</Label>
                      <Input
                        id="edit-age"
                        type="number"
                        value={editForm.age || ''}
                        onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                        className="h-10"
                        placeholder="Enter age"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="edit-gender">Gender *</Label>
                      <div className="flex gap-2">
                        {['Male', 'Female', 'Other'].map(gender => (
                          <button
                            key={gender}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, gender: gender.toLowerCase() })}
                            className={cn(
                              "flex-1 px-3 py-2 text-sm rounded-lg border transition-all text-center",
                              (editForm.gender?.toLowerCase() || 'other') === gender.toLowerCase()
                                ? "border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB] font-medium ring-1 ring-[#2563EB]"
                                : "border-input bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                            )}
                          >
                            {gender}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Details Section */}
                <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 pt-2">
                    <Calendar className="h-5 w-5 text-[#2563EB]" />
                    Appointment Details
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="edit-doctor">Select Doctor *</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setEditForm({ ...editForm, doctor: 'Unassigned' })}
                          className={cn(
                            "px-3 py-2 text-sm rounded-lg border transition-all text-left flex items-center gap-2",
                            (!editForm.doctor || editForm.doctor === 'Unassigned')
                              ? "border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB] font-medium ring-1 ring-[#2563EB]"
                              : "border-input bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                          )}
                        >
                          <Stethoscope className={cn("h-4 w-4", (!editForm.doctor || editForm.doctor === 'Unassigned') ? "text-[#2563EB]" : "text-muted-foreground")} />
                          Unassigned
                        </button>
                        {doctors.map(doc => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, doctor: doc.name })}
                            className={cn(
                              "px-3 py-2 text-sm rounded-lg border transition-all text-left flex items-center gap-2",
                              editForm.doctor === doc.name
                                ? "border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB] font-medium ring-1 ring-[#2563EB]"
                                : "border-input bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                            )}
                          >
                            <Stethoscope className={cn("h-4 w-4 flex-shrink-0", editForm.doctor === doc.name ? "text-[#2563EB]" : "text-muted-foreground")} />
                            <span className="truncate">{doc.name} - {doc.specialization}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="edit-service">Service Type *</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          'General Checkup',
                          'Teeth Cleaning',
                          'Teeth Whitening',
                          'Root Canal',
                          'Dental Implants',
                          'Orthodontics'
                        ].map(service => (
                          <button
                            key={service}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, service: service })}
                            className={cn(
                              "px-3 py-2 text-sm rounded-lg border transition-all text-left truncate",
                              (editForm.service || 'General Checkup') === service
                                ? "border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB] font-medium ring-1 ring-[#2563EB]"
                                : "border-input bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                            )}
                          >
                            {service}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="edit-date">Appointment Date *</Label>
                      <Input
                        id="edit-date"
                        type="date"
                        value={editForm.appointmentDate || ''}
                        onChange={(e) => setEditForm({ ...editForm, appointmentDate: e.target.value })}
                        className="h-10 md:w-1/2"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="edit-time">Appointment Time *</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                        {[
                          '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
                          '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
                        ].map(time => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, appointmentTime: time })}
                            className={cn(
                              "px-3 py-2 text-sm rounded-lg border transition-all text-center flex items-center justify-center gap-1.5",
                              (editForm.appointmentTime || '10:00 AM') === time
                                ? "border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB] font-medium ring-1 ring-[#2563EB]"
                                : "border-input bg-transparent hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                            )}
                          >
                            <Clock className={cn("h-3.5 w-3.5", (editForm.appointmentTime || '10:00 AM') === time ? "text-[#2563EB]" : "text-muted-foreground")} />
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical Information Section */}
                <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 pt-2">
                    <FileText className="h-5 w-5 text-[#2563EB]" />
                    Medical Information
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-symptoms">Symptoms / Reason for Visit *</Label>
                      <Textarea
                        id="edit-symptoms"
                        value={editForm.symptoms || ''}
                        onChange={(e) => setEditForm({ ...editForm, symptoms: e.target.value })}
                        placeholder="Describe symptoms or reason for appointment"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-history">Medical History</Label>
                      <Textarea
                        id="edit-history"
                        value={editForm.medicalHistory || ''}
                        onChange={(e) => setEditForm({ ...editForm, medicalHistory: e.target.value })}
                        placeholder="Previous conditions, allergies, medications, etc."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingDetails(false)}
                    className="px-6 h-10 font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateAppointmentDetails}
                    className="px-6 h-10 bg-[#2563EB] hover:bg-[#2563EB]/90 font-medium text-white shadow-sm"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-500 text-xs font-bold uppercase">Patient Name</Label>
                    <p className="font-bold text-zinc-900">{selectedAppointment.patientName}</p>
                  </div>
                  <div>
                    <Label className="text-zinc-500 text-xs font-bold uppercase">Appointment ID</Label>
                    <p className="font-bold text-zinc-900">{selectedAppointment.appointmentId}</p>
                  </div>
                  <div>
                    <Label className="text-zinc-500 text-xs font-bold uppercase">Age</Label>
                    <p className="font-bold text-zinc-900">
                      {(selectedAppointment.service && selectedAppointment.service.toLowerCase().includes('priority')) || (Number(selectedAppointment.age) === 30 && selectedAppointment.gender === 'Not specified') ? 'N/A' : `${selectedAppointment.age || 'N/A'} ${selectedAppointment.age ? 'years' : ''}`}
                    </p>
                  </div>
                  <div>
                    <Label className="text-zinc-500 text-xs font-bold uppercase">Gender</Label>
                    <p className="font-bold text-zinc-900">
                      {(selectedAppointment.service && selectedAppointment.service.toLowerCase().includes('priority')) || selectedAppointment.gender === 'Not specified' || selectedAppointment.gender === 'Not Specified' ? 'N/A' : (selectedAppointment.gender || 'N/A')}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-zinc-100">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm font-medium">{selectedAppointment.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm font-medium">{selectedAppointment.email}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-zinc-500 text-xs font-bold uppercase">Symptoms</Label>
                  <p className="mt-1 text-sm">{selectedAppointment.symptoms}</p>
                </div>

                <div>
                  <Label className="text-zinc-500 text-xs font-bold uppercase">Medical History</Label>
                  <p className="mt-1 text-sm">{selectedAppointment.medicalHistory}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-zinc-100">
                  <div>
                    <Label className="text-zinc-500 text-xs font-bold uppercase">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
                  </div>
                  <div>
                    <Label className="text-zinc-500 text-xs font-bold uppercase">Date</Label>
                    <p className="font-bold mt-1 text-zinc-900">{selectedAppointment.appointmentDate}</p>
                  </div>
                  <div>
                    <Label className="text-zinc-500 text-xs font-bold uppercase">Time</Label>
                    <p className="font-bold mt-1 text-zinc-900">{selectedAppointment.appointmentTime}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setEditForm({ ...selectedAppointment });
                      setIsEditingDetails(true);
                    }}
                    variant="outline"
                    className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 font-bold"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                  {selectedAppointment.status === 'Pending' && (
                    <Button
                      onClick={() => {
                        handleStatusChange(selectedAppointment.appointmentId, 'Confirmed');
                        setShowDetails(false);
                      }}
                      className="flex-1 bg-zinc-900 hover:bg-zinc-800 font-bold text-white"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  {selectedAppointment.status === 'Confirmed' && (
                    <Button
                      onClick={() => {
                        handleStatusChange(selectedAppointment.appointmentId, 'Completed');
                        setShowDetails(false);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 font-bold text-white"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}
                  {selectedAppointment.status !== 'Cancelled' && selectedAppointment.status !== 'Completed' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleStatusChange(selectedAppointment.appointmentId, 'Cancelled');
                        setShowDetails(false);
                      }}
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 font-bold"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Custom Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white font-bold z-50 animate-in fade-in slide-in-from-bottom-4 ${toastMessage.type === 'error' ? 'bg-red-500' : 'bg-zinc-900 dark:bg-zinc-100 dark:text-black'}`}>
          {toastMessage.message}
        </div>
      )}

      {/* Custom Confirm Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-zinc-600 dark:text-zinc-400">
            {confirmDialog?.message}
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (confirmDialog?.onConfirm) confirmDialog.onConfirm();
              setConfirmDialog(null);
            }}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Prompt Dialog */}
      <Dialog open={!!promptDialog} onOpenChange={(open) => !open && setPromptDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{promptDialog?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
            <p>{promptDialog?.message}</p>
            <Input 
              type="text" 
              value={promptValue} 
              onChange={(e) => setPromptValue(e.target.value)} 
              autoFocus 
              onKeyDown={(e) => {
                if (e.key === 'Enter' && promptValue) {
                  if (promptDialog?.onConfirm) promptDialog.onConfirm(promptValue);
                  setPromptDialog(null);
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setPromptDialog(null)}>Cancel</Button>
            <Button className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-white text-white font-bold" onClick={() => {
              if (promptDialog?.onConfirm) promptDialog.onConfirm(promptValue);
              setPromptDialog(null);
            }} disabled={!promptValue}>Submit</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Doctor Dialog */}
      <Dialog open={newDoctorDialog} onOpenChange={setNewDoctorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDoctor} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input required value={newDoctor.name} onChange={e => setNewDoctor({ ...newDoctor, name: e.target.value })} placeholder="Dr. John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Specialization</Label>
              <Input required value={newDoctor.specialization} onChange={e => setNewDoctor({ ...newDoctor, specialization: e.target.value })} placeholder="General Dentist" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={newDoctor.phone} onChange={e => setNewDoctor({ ...newDoctor, phone: e.target.value })} placeholder="555-0100" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={newDoctor.email} onChange={e => setNewDoctor({ ...newDoctor, email: e.target.value })} placeholder="j.doe@zenora.com" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setNewDoctorDialog(false)}>Cancel</Button>
              <Button type="submit" className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold dark:bg-zinc-100 dark:text-black dark:hover:bg-white">Add Doctor</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Patient Details Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <Avatar className="h-16 w-16 border border-zinc-200 shadow-sm">
                  <AvatarFallback className="bg-zinc-100 text-zinc-900 font-bold text-lg">
                    {selectedPatient.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{selectedPatient.name}</h2>
                  <div className="flex gap-4 text-sm text-zinc-500 mt-1">
                    <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {selectedPatient.phone || 'N/A'}</span>
                    <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {selectedPatient.email || 'N/A'}</span>
                  </div>
                  <div className="text-sm text-zinc-500 mt-1">
                    {selectedPatient.age} years old • {selectedPatient.gender}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4 text-zinc-900 dark:text-zinc-100">Appointment History</h3>
                <div className="space-y-4">
                  {appointments.filter(a => (a.email || a.phone || a.patientName) === selectedPatient.id).map((apt: any) => (
                    <Card key={apt.appointmentId} className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                      <div className="bg-slate-50 dark:bg-gray-950 px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {apt.appointmentDate} <span className="text-zinc-400 dark:text-zinc-500 font-normal">at</span> {apt.appointmentTime}
                          </span>
                        </div>
                        <Badge variant={
                          apt.status === 'Confirmed' ? 'default' :
                          apt.status === 'Pending' ? 'secondary' :
                          apt.status === 'Completed' ? 'outline' : 'destructive'
                        } className={
                          apt.status === 'Confirmed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' :
                          apt.status === 'Completed' ? 'border-green-200 text-green-700 dark:border-green-900 dark:text-green-400' : ''
                        }>
                          {apt.status}
                        </Badge>
                      </div>
                      <CardContent className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Symptoms</p>
                              <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/30 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 leading-relaxed">
                                {apt.symptoms}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Medical History</p>
                              <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/30 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 leading-relaxed">
                                {apt.medicalHistory || 'None reported'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col justify-start md:border-l md:border-zinc-100 dark:md:border-zinc-800 md:pl-6 pt-2 md:pt-0">
                             <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Assigned Doctor</p>
                             <Select value={apt.doctor} onValueChange={(value) => handleAssignDoctor(apt.appointmentId, value)}>
                               <SelectTrigger className="!w-full !h-auto !min-h-[60px] !p-3 flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 hover:border-indigo-300 dark:hover:bg-zinc-900 dark:hover:border-indigo-700 transition-all shadow-sm focus:ring-2 focus:ring-indigo-500/20 data-[state=open]:border-indigo-500 data-[state=open]:ring-2 data-[state=open]:ring-indigo-500/20">
                                 <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                                   <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-700 flex-shrink-0 shadow-sm">
                                     <AvatarFallback className={apt.doctor === 'Unassigned' ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold" : "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-bold"}>
                                        {apt.doctor === 'Unassigned' ? '?' : apt.doctor.replace('Dr. ', '').substring(0,2).toUpperCase()}
                                     </AvatarFallback>
                                   </Avatar>
                                   <div className="flex flex-col flex-1 min-w-0 pr-2">
                                     <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{apt.doctor === 'Unassigned' ? 'Unassigned' : apt.doctor}</span>
                                     <span className="text-xs text-zinc-500 truncate mt-0.5">{apt.doctor === 'Unassigned' ? 'Click to assign doctor' : (doctors.find(d => d.name === apt.doctor)?.specialization || 'Specialist')}</span>
                                   </div>
                                 </div>
                               </SelectTrigger>
                               <SelectContent className="p-1 rounded-xl shadow-xl border-zinc-200 dark:border-zinc-800 min-w-[240px]">
                                 <SelectItem value="Unassigned" className="rounded-lg p-2 focus:bg-amber-50 dark:focus:bg-amber-900/20 cursor-pointer">
                                   <div className="flex items-center gap-3 w-full min-w-0">
                                     <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-amber-200/50 dark:border-amber-700/50">
                                       ?
                                     </div>
                                     <div className="flex flex-col text-left flex-1 min-w-0">
                                       <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate">Unassigned</span>
                                       <span className="text-[11px] text-zinc-500 truncate mt-0.5">Leave unassigned</span>
                                     </div>
                                   </div>
                                 </SelectItem>
                                 <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1 mx-2" />
                                 {doctors.map(d => (
                                   <SelectItem key={d.id} value={d.name} className="rounded-lg p-2 focus:bg-indigo-50 dark:focus:bg-indigo-900/20 cursor-pointer">
                                     <div className="flex items-center gap-3 w-full min-w-0">
                                       <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-indigo-200/50 dark:border-indigo-700/50">
                                         {d.name.replace('Dr. ', '').substring(0,2).toUpperCase()}
                                       </div>
                                       <div className="flex flex-col text-left flex-1 min-w-0">
                                         <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate">{d.name}</span>
                                         <span className="text-[11px] text-zinc-500 truncate mt-0.5">{d.specialization}</span>
                                       </div>
                                     </div>
                                   </SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                             <div className="mt-4 flex justify-end">
                               <Button
                                 size="sm"
                                 variant="outline"
                                 className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30 flex items-center gap-1.5"
                                 onClick={() => handleDeleteAppointment(apt)}
                               >
                                 <Trash2 className="h-4 w-4" /> Delete Appointment
                               </Button>
                             </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="outline" onClick={() => setSelectedPatient(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-4 right-4 z-[100] w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border ${toastMessage.type === 'error' ? 'border-red-500' : 'border-indigo-500'} overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100 flex flex-col animate-in slide-in-from-bottom-5`}>
          <div className="p-4 flex items-start gap-3">
            <div className={`mt-0.5 rounded-full p-2 flex-shrink-0 ${toastMessage.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
              {toastMessage.type === 'error' ? <XCircle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                {toastMessage.title || (toastMessage.type === 'success' ? 'Success' : 'Error')}
              </h4>
              <p className="text-xs text-zinc-500 mt-1">{toastMessage.message}</p>
              
              {toastMessage.details && (
                <div className="mt-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 border border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">{toastMessage.details.patient}</span>
                    {toastMessage.details.count && toastMessage.details.count > 1 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">+{toastMessage.details.count - 1} more</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                    <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /><span>{toastMessage.details.date}</span></div>
                    <span className="text-zinc-300">•</span>
                    <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /><span>{toastMessage.details.time}</span></div>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setToastMessage(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
              <XCircle className="w-4 h-4 opacity-50" />
            </button>
          </div>
          <div className={`h-1 w-full ${toastMessage.type === 'error' ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
        </div>
      )}

      <InvoiceModal 
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        patientName={invoiceData.patientName}
        doctorName={invoiceData.doctorName}
        appointmentDate={invoiceData.appointmentDate}
      />
    </div>
  );
};

export default MedicalAppointmentSystem;
