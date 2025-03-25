-- Database Schema for Pastidatang Application

-- Users Table (Extended Auth Users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'alpha', 'division')),
  division VARCHAR(50),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS Policy for Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own data
CREATE POLICY "Users can view their own data" 
  ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy: Admins and Alphas can view all data
CREATE POLICY "Admins and Alphas can view all data" 
  ON public.users
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'alpha')
    )
  );

-- Policy: Admins can update user data
CREATE POLICY "Admins can update user data" 
  ON public.users
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Dashboards Table
CREATE TABLE IF NOT EXISTS public.dashboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  division VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS Policy for Dashboards
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view dashboards for their division
CREATE POLICY "Users can view dashboards for their division" 
  ON public.dashboards
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND (
        users.division = dashboards.division OR
        users.role IN ('admin', 'alpha')
      )
    )
  );

-- Policy: Admins and Alphas can update any dashboard
CREATE POLICY "Admins and Alphas can update any dashboard" 
  ON public.dashboards
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'alpha')
    )
  );

-- Policy: Division users can update their own division's dashboards
CREATE POLICY "Division users can update their own division's dashboards" 
  ON public.dashboards
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND users.division = dashboards.division
    )
  );

-- System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Only one row allowed
  settings JSONB NOT NULL DEFAULT '{}',
  updated_by UUID REFERENCES public.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS Policy for System Settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view system settings
CREATE POLICY "Anyone can view system settings" 
  ON public.system_settings
  FOR SELECT 
  USING (true);

-- Policy: Only admins and alphas can update system settings
CREATE POLICY "Only admins and alphas can update system settings" 
  ON public.system_settings
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'alpha')
    )
  );

-- Bot Messages Table
CREATE TABLE IF NOT EXISTS public.bot_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Add RLS Policy for Bot Messages
ALTER TABLE public.bot_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Admins and Alphas can view bot messages
CREATE POLICY "Admins and Alphas can view bot messages" 
  ON public.bot_messages
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'alpha')
    )
  );

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updating timestamps
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_dashboards_updated_at
BEFORE UPDATE ON public.dashboards
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to process new user registrations
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, division)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'division'),
    COALESCE(NEW.raw_user_meta_data->>'division', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle new user registrations
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();