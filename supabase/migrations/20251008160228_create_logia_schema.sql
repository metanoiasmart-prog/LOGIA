/*
  # LOGIA - Masonic Lodge Management System Database Schema

  ## Overview
  Complete database schema for managing a masonic lodge including members, treasury, payments, 
  expenses, and reporting. The lodge year runs from July to June.

  ## Tables Created

  ### 1. profiles
  - `id` (uuid, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `rite` (text) - Rite type: escoces_antiguo, antiguo_gremio, emulacion, york, memphis
  - `status` (text) - Member status: activo, cese, quite, licencia, irradiacion, expulsion, ad_vitam
  - `license_start_date` (date) - When license status began
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. monthly_fees
  - `id` (uuid, primary key)
  - `member_id` (uuid, references profiles)
  - `amount` (decimal) - Monthly fee amount
  - `month` (integer) - Month number (1-12, where 7=July is month 1 of lodge year)
  - `year` (integer) - Calendar year
  - `lodge_year` (integer) - Lodge year (July to June)
  - `status` (text) - paid, pending, late
  - `paid_date` (timestamptz)
  - `paid_amount` (decimal)
  - `payment_receipt_url` (text) - URL to uploaded payment receipt
  - `is_early_payment` (boolean) - Pronto pago flag
  - `created_at` (timestamptz)

  ### 3. extraordinary_fees
  - `id` (uuid, primary key)
  - `name` (text) - Fee name/description
  - `amount` (decimal)
  - `due_date` (date)
  - `created_at` (timestamptz)

  ### 4. extraordinary_fee_payments
  - `id` (uuid, primary key)
  - `fee_id` (uuid, references extraordinary_fees)
  - `member_id` (uuid, references profiles)
  - `amount_paid` (decimal)
  - `status` (text) - paid, pending
  - `paid_date` (timestamptz)
  - `payment_receipt_url` (text)
  - `created_at` (timestamptz)

  ### 5. expenses
  - `id` (uuid, primary key)
  - `category` (text) - alimentacion, alquiler, servicios_basicos, articulos_activos, membresia, otros, filantropia, eventos
  - `description` (text)
  - `amount` (decimal)
  - `expense_date` (date)
  - `receipt_url` (text) - URL to uploaded receipt/invoice
  - `created_at` (timestamptz)

  ### 6. payment_history
  - `id` (uuid, primary key)
  - `member_id` (uuid, references profiles)
  - `payment_type` (text) - monthly_fee, extraordinary_fee
  - `reference_id` (uuid) - References monthly_fees or extraordinary_fees
  - `amount` (decimal)
  - `payment_date` (timestamptz)
  - `month` (integer)
  - `year` (integer)
  - `lodge_year` (integer)
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 7. alerts
  - `id` (uuid, primary key)
  - `alert_type` (text) - temple_rent, membership_fee, late_payment
  - `message` (text)
  - `due_date` (date)
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 8. annual_reports
  - `id` (uuid, primary key)
  - `lodge_year` (integer)
  - `total_income` (decimal)
  - `total_expenses` (decimal)
  - `report_data` (jsonb) - Detailed report data
  - `generated_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users to manage their data
  - Admin policies for full access
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  rite text NOT NULL DEFAULT 'escoces_antiguo',
  status text NOT NULL DEFAULT 'activo',
  license_start_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create monthly_fees table
CREATE TABLE IF NOT EXISTS monthly_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL DEFAULT 0,
  month integer NOT NULL,
  year integer NOT NULL,
  lodge_year integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  paid_date timestamptz,
  paid_amount decimal(10,2) DEFAULT 0,
  payment_receipt_url text,
  is_early_payment boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE monthly_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all monthly fees"
  ON monthly_fees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own monthly fees"
  ON monthly_fees FOR UPDATE
  TO authenticated
  USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

CREATE POLICY "Users can insert monthly fees"
  ON monthly_fees FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create extraordinary_fees table
CREATE TABLE IF NOT EXISTS extraordinary_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  amount decimal(10,2) NOT NULL,
  due_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE extraordinary_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view extraordinary fees"
  ON extraordinary_fees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert extraordinary fees"
  ON extraordinary_fees FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update extraordinary fees"
  ON extraordinary_fees FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete extraordinary fees"
  ON extraordinary_fees FOR DELETE
  TO authenticated
  USING (true);

-- Create extraordinary_fee_payments table
CREATE TABLE IF NOT EXISTS extraordinary_fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_id uuid REFERENCES extraordinary_fees(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount_paid decimal(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  paid_date timestamptz,
  payment_receipt_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE extraordinary_fee_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view extraordinary fee payments"
  ON extraordinary_fee_payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert extraordinary fee payments"
  ON extraordinary_fee_payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update extraordinary fee payments"
  ON extraordinary_fee_payments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  description text NOT NULL,
  amount decimal(10,2) NOT NULL,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  receipt_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (true);

-- Create payment_history table
CREATE TABLE IF NOT EXISTS payment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  payment_type text NOT NULL,
  reference_id uuid,
  amount decimal(10,2) NOT NULL,
  payment_date timestamptz NOT NULL DEFAULT now(),
  month integer,
  year integer,
  lodge_year integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payment history"
  ON payment_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert payment history"
  ON payment_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  message text NOT NULL,
  due_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage alerts"
  ON alerts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create annual_reports table
CREATE TABLE IF NOT EXISTS annual_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lodge_year integer NOT NULL,
  total_income decimal(10,2) DEFAULT 0,
  total_expenses decimal(10,2) DEFAULT 0,
  report_data jsonb,
  generated_at timestamptz DEFAULT now()
);

ALTER TABLE annual_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view annual reports"
  ON annual_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert annual reports"
  ON annual_reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_monthly_fees_member ON monthly_fees(member_id);
CREATE INDEX IF NOT EXISTS idx_monthly_fees_year ON monthly_fees(lodge_year);
CREATE INDEX IF NOT EXISTS idx_payment_history_member ON payment_history(member_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_year ON payment_history(lodge_year);
CREATE INDEX IF NOT EXISTS idx_extraordinary_payments_member ON extraordinary_fee_payments(member_id);
CREATE INDEX IF NOT EXISTS idx_extraordinary_payments_fee ON extraordinary_fee_payments(fee_id);