import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, User, Activity, ArrowRight, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: any[];
  doctors: any[];
  onNavigate: (page: string) => void;
  onSelectPatient: (patientId: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, 
  onClose, 
  appointments = [], 
  doctors = [],
  onNavigate,
  onSelectPatient
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter logic
  const normalizedQuery = query.toLowerCase().trim();
  
  const matchingAppointments = normalizedQuery 
    ? appointments.filter(a => 
        a.patientName.toLowerCase().includes(normalizedQuery) ||
        (a.symptoms && a.symptoms.toLowerCase().includes(normalizedQuery)) ||
        (a.id && a.id.toLowerCase().includes(normalizedQuery))
      ).slice(0, 5)
    : [];

  const matchingDoctors = normalizedQuery
    ? doctors.filter(d => 
        d.name.toLowerCase().includes(normalizedQuery) ||
        d.specialization.toLowerCase().includes(normalizedQuery)
      ).slice(0, 3)
    : [];

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === ' ' || e.code === 'Space') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        // The toggle logic is handled in App.tsx to set isOpen
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm dark:bg-black/60"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
        >
          {/* Search Input */}
          <div className="flex items-center px-4 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <Search className="w-6 h-6 text-zinc-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patients, appointments, or doctors... (Ctrl+Space)"
              className="flex-1 bg-transparent border-none outline-none text-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            />
            <div className="flex items-center gap-1 text-xs font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
              ESC
            </div>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {!query ? (
              <div className="p-8 text-center text-zinc-500">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Quick Search</p>
                <p className="text-sm mt-1">Start typing to search across the entire clinic.</p>
                
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  <button onClick={() => { onNavigate('dashboard'); onClose(); }} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Go to Dashboard</button>
                  <button onClick={() => { onNavigate('appointments'); onClose(); }} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">View Appointments</button>
                  <button onClick={() => { onNavigate('doctors'); onClose(); }} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Manage Doctors</button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 py-2">
                
                {/* Appointments Results */}
                {matchingAppointments.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                      Patients & Appointments
                    </div>
                    <div className="space-y-1">
                      {matchingAppointments.map((apt) => (
                        <button
                          key={apt.appointmentId || apt.id}
                          onClick={() => {
                            onSelectPatient(apt.appointmentId || apt.id);
                            onClose();
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                                {apt.patientName}
                              </div>
                              <div className="text-sm text-zinc-500 flex items-center gap-2 mt-0.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{apt.appointmentDate} at {apt.appointmentTime}</span>
                                {apt.symptoms && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                                    <Activity className="w-3.5 h-3.5" />
                                    <span className="truncate max-w-[150px]">{apt.symptoms}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doctors Results */}
                {matchingDoctors.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                      Doctors
                    </div>
                    <div className="space-y-1">
                      {matchingDoctors.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => {
                            onNavigate('doctors');
                            onClose();
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                              <Stethoscope className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                                {doc.name}
                              </div>
                              <div className="text-sm text-zinc-500 mt-0.5">
                                {doc.specialization}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {matchingAppointments.length === 0 && matchingDoctors.length === 0 && (
                  <div className="p-8 text-center text-zinc-500">
                    <p className="text-lg font-medium">No results found</p>
                    <p className="text-sm mt-1">Try searching for a different name or term.</p>
                  </div>
                )}

              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-sans">↑</kbd><kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-sans">↓</kbd> to navigate</span>
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-sans">Enter</kbd> to select</span>
            </div>
            <span>Zenora Command Palette</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
