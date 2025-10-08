import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  rite: 'escoces_antiguo' | 'antiguo_gremio' | 'emulacion' | 'york' | 'memphis';
  status: 'activo' | 'cese' | 'quite' | 'licencia' | 'irradiacion' | 'expulsion' | 'ad_vitam';
  license_start_date?: string;
  created_at: string;
  updated_at: string;
};

export type MonthlyFee = {
  id: string;
  member_id: string;
  amount: number;
  month: number;
  year: number;
  lodge_year: number;
  status: 'paid' | 'pending' | 'late';
  paid_date?: string;
  paid_amount: number;
  payment_receipt_url?: string;
  is_early_payment: boolean;
  created_at: string;
};

export type ExtraordinaryFee = {
  id: string;
  name: string;
  amount: number;
  due_date: string;
  created_at: string;
};

export type ExtraordinaryFeePayment = {
  id: string;
  fee_id: string;
  member_id: string;
  amount_paid: number;
  status: 'paid' | 'pending';
  paid_date?: string;
  payment_receipt_url?: string;
  created_at: string;
};

export type Expense = {
  id: string;
  category: 'alimentacion' | 'alquiler' | 'servicios_basicos' | 'articulos_activos' | 'membresia' | 'otros' | 'filantropia' | 'eventos';
  description: string;
  amount: number;
  expense_date: string;
  receipt_url?: string;
  created_at: string;
};

export type PaymentHistory = {
  id: string;
  member_id: string;
  payment_type: 'monthly_fee' | 'extraordinary_fee';
  reference_id?: string;
  amount: number;
  payment_date: string;
  month?: number;
  year?: number;
  lodge_year?: number;
  notes?: string;
  created_at: string;
};

export type Alert = {
  id: string;
  alert_type: 'temple_rent' | 'membership_fee' | 'late_payment';
  message: string;
  due_date?: string;
  is_active: boolean;
  created_at: string;
};

export type AnnualReport = {
  id: string;
  lodge_year: number;
  total_income: number;
  total_expenses: number;
  report_data?: any;
  generated_at: string;
};
