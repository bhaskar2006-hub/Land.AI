-- ==============================================================================
-- LAND•AI — SUPABASE DATABASE SCHEMA & ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Run this script in your Supabase Project's SQL Editor (https://supabase.com/dashboard)
-- to establish the profiles table, role-based authorization, and tamper-proof audit storage.

-- 1. Create Role Enumeration
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ADMIN', 'REVENUE_OFFICER', 'REVIEWER', 'VIEWER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create User Profiles Table
-- The 'id' directly matches the authenticated Supabase Auth user (auth.users.id)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'VIEWER', -- SECURITY RULE: Never default to elevated role!
  department TEXT NOT NULL DEFAULT 'Revenue Department',
  district TEXT NOT NULL DEFAULT 'Guntur',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Row Level Security Policies for Profiles Table
-- Any authenticated user can read their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admins and Revenue Officers can view all profiles for jurisdiction management
DROP POLICY IF EXISTS "Officers and Admins can view all profiles" ON public.profiles;
CREATE POLICY "Officers and Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'REVENUE_OFFICER')
    )
  );

-- SECURITY ENFORCEMENT: Users CANNOT update their own role!
-- Only Admins can update profiles and assign roles
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- 4. Audit Logs Table (Stores Immutable Supabase user_id and Database Role)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id), -- IMMUTABLE SUPABASE USER ID
  actor TEXT NOT NULL,
  role TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  hash TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Read policy: Authenticated users can inspect audit logs
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can view audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert policy: Users can insert audit events only under their own immutable auth.uid()
DROP POLICY IF EXISTS "Authenticated users can create audit logs under their own user_id" ON public.audit_logs;
CREATE POLICY "Authenticated users can create audit logs under their own user_id"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Tamper-proof guarantee: NO UPDATE OR DELETE policies are created for audit_logs (append-only)

-- ==============================================================================
-- DATABASE-DRIVEN ROLE TESTING INSTRUCTIONS
-- ==============================================================================
-- Step 1: In Supabase Dashboard > Authentication > Users > Add user:
--         • officer@landai.gov.in (with your chosen password)
--         • viewer@landai.gov.in  (with your chosen password)
--         • unconfigured@landai.gov.in (with your chosen password)
--
-- Step 2: In Supabase SQL Editor, assign specific roles in the public.profiles table:
--
-- -- Officer Profile (Role = REVENUE_OFFICER):
-- INSERT INTO public.profiles (id, full_name, email, role, department, district)
-- SELECT id, 'Officer R. S. Sharma', 'officer@landai.gov.in', 'REVENUE_OFFICER', 'Revenue Department', 'Guntur'
-- FROM auth.users WHERE email = 'officer@landai.gov.in'
-- ON CONFLICT (id) DO UPDATE SET role = 'REVENUE_OFFICER', full_name = 'Officer R. S. Sharma';
--
-- -- Viewer Profile (Role = VIEWER):
-- INSERT INTO public.profiles (id, full_name, email, role, department, district)
-- SELECT id, 'Cadastral Auditor', 'viewer@landai.gov.in', 'VIEWER', 'Public Oversight', 'Amaravati'
-- FROM auth.users WHERE email = 'viewer@landai.gov.in'
-- ON CONFLICT (id) DO UPDATE SET role = 'VIEWER';
--
-- -- Unconfigured User:
-- -- Do NOT insert a row in public.profiles for unconfigured@landai.gov.in.
-- -- When this user signs in, the application will enforce:
-- -- "User profile is not configured. Please contact an administrator." and terminate the session.
-- ==============================================================================
