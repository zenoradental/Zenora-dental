import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// We use import.meta.env for Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Appointment = {
  id: string;
  patient_name: string;
  date: string; // ISO string
  status: 'pending' | 'completed' | 'cancelled';
  treatment_type: string;
  created_at: string;
};

export type Invoice = {
  id: string;
  appointment_id: string;
  total_amount: number;
  status: 'paid' | 'pending' | 'overdue';
  created_at: string;
};
