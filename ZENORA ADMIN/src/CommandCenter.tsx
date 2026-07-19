import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  stage?: string;
}

interface CommandCenterProps {
  appointments: Appointment[];
  onViewAppointment: (apt: Appointment) => void;
  onUpdateAppointmentStage: (aptId: string, stage: string) => void;
}

const STAGES = ['Waiting Room', 'Checkup', 'Treatment', 'Discharged'];

const CommandCenter: React.FC<CommandCenterProps> = ({ appointments, onViewAppointment, onUpdateAppointmentStage }) => {
  const [particles, setParticles] = useState<{ id: number, x: number, y: number }[]>([]);

  const handleDragStart = (e: React.DragEvent, aptId: string) => {
    e.dataTransfer.setData('aptId', aptId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    const aptId = e.dataTransfer.getData('aptId');
    if (aptId) {
      onUpdateAppointmentStage(aptId, stage);
      
      // Trigger glowing particle effect
      const rect = e.currentTarget.getBoundingClientRect();
      const newParticle = { id: Date.now(), x: e.clientX - rect.left, y: e.clientY - rect.top };
      setParticles(prev => [...prev, newParticle]);
      setTimeout(() => setParticles(prev => prev.filter(p => p.id !== newParticle.id)), 1000);
    }
  };

  // Only show today's appointments
  const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(a => a.appointmentDate === todayStr);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-500" />
            Live Command Center
          </h2>
          <p className="text-zinc-500">Real-time patient flow tracking. Drag and drop to update stages.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-200px)] min-h-150">
        {STAGES.map(stage => {
          const stageApts = todaysAppointments.filter(apt => (apt.stage || 'Waiting Room') === stage);
          
          return (
            <div 
              key={stage}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className="flex flex-col bg-slate-100/50 dark:bg-gray-900/50 rounded-2xl p-4 border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden relative"
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{stage}</h3>
                <Badge variant="secondary" className="bg-white dark:bg-zinc-800 font-bold">{stageApts.length}</Badge>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pb-10">
                <AnimatePresence>
                  {stageApts.map(apt => {
                    const isPriority = apt.service?.toLowerCase().includes('priority');
                    return (
                      <motion.div
                        key={apt.appointmentId}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        draggable
                        onDragStart={(e: any) => handleDragStart(e, apt.appointmentId)}
                        onClick={() => onViewAppointment(apt)}
                        className={`cursor-grab active:cursor-grabbing p-4 rounded-xl border ${isPriority ? 'bg-amber-50 border-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.15)] dark:bg-amber-900/10 dark:border-amber-900/50' : 'bg-white border-zinc-200 shadow-sm dark:bg-zinc-950 dark:border-zinc-800'} hover:shadow-md transition-all`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate pr-2">
                            {apt.patientName}
                          </p>
                          {isPriority && <Zap className="h-4 w-4 text-amber-500 shrink-0 fill-amber-500" />}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
                          <Clock className="h-3 w-3" /> {apt.appointmentTime}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md truncate max-w-30">
                            {apt.doctor}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Particle Effects Layer */}
              {particles.map(p => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0.8, scale: 0, x: p.x, y: p.y }}
                  animate={{ opacity: 0, scale: 4, y: p.y - 100 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute pointer-events-none w-8 h-8 rounded-full bg-blue-400/30 blur-md z-10"
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommandCenter;
