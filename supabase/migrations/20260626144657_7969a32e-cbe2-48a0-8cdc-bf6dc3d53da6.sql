
-- Enum: roles
CREATE TYPE public.app_role AS ENUM ('admin','manager','analyst');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  title TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger: create profile + default analyst role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'analyst')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER touch_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Assets
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostname TEXT NOT NULL,
  ip TEXT,
  os TEXT,
  owner TEXT,
  department TEXT,
  criticality TEXT NOT NULL DEFAULT 'medium',
  risk_score INTEGER NOT NULL DEFAULT 0,
  online BOOLEAN NOT NULL DEFAULT true,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT ALL ON public.assets TO service_role;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assets_read_auth" ON public.assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "assets_write_manager" ON public.assets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));

-- Alerts
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium', -- critical|high|medium|low|info
  status TEXT NOT NULL DEFAULT 'open',     -- open|investigating|resolved|false_positive
  source TEXT,
  source_ip TEXT,
  dest_ip TEXT,
  username TEXT,
  hostname TEXT,
  country TEXT,
  mitre_techniques TEXT[] DEFAULT '{}',
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  raw JSONB,
  ai_summary TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX alerts_created_at_idx ON public.alerts(created_at DESC);
CREATE INDEX alerts_severity_idx ON public.alerts(severity);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alerts TO authenticated;
GRANT ALL ON public.alerts TO service_role;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts_all_auth" ON public.alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER touch_alerts BEFORE UPDATE ON public.alerts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Incidents
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'new',
  assignee UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  alert_ids UUID[] DEFAULT '{}',
  timeline JSONB DEFAULT '[]',
  notes TEXT,
  ai_summary TEXT,
  ai_rca TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.incidents TO authenticated;
GRANT ALL ON public.incidents TO service_role;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "incidents_all_auth" ON public.incidents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER touch_incidents BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Logs
CREATE TABLE public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  hostname TEXT,
  source_type TEXT,    -- windows|linux|firewall|nginx|apache|cloud
  ip TEXT,
  username TEXT,
  process TEXT,
  event_id TEXT,
  severity TEXT DEFAULT 'info',
  message TEXT,
  raw JSONB,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  upload_batch UUID,
  ai_finding TEXT,
  mitre_techniques TEXT[] DEFAULT '{}'
);
CREATE INDEX logs_ts_idx ON public.logs(ts DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.logs TO authenticated;
GRANT ALL ON public.logs TO service_role;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs_all_auth" ON public.logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Threat intel
CREATE TABLE public.threat_intel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ioc TEXT NOT NULL,
  ioc_type TEXT NOT NULL, -- ip|domain|url|hash|email
  risk_score INTEGER NOT NULL DEFAULT 0,
  malware_family TEXT,
  threat_actor TEXT,
  country TEXT,
  asn TEXT,
  mitre_techniques TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  sources TEXT[] DEFAULT '{}',
  description TEXT,
  first_seen TIMESTAMPTZ DEFAULT now(),
  last_seen TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ioc, ioc_type)
);
CREATE INDEX threat_intel_ioc_idx ON public.threat_intel(ioc);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.threat_intel TO authenticated;
GRANT ALL ON public.threat_intel TO service_role;
ALTER TABLE public.threat_intel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ti_all_auth" ON public.threat_intel FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Playbooks
CREATE TABLE public.playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  steps JSONB DEFAULT '[]',
  mitre_techniques TEXT[] DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playbooks TO authenticated;
GRANT ALL ON public.playbooks TO service_role;
ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pb_all_auth" ON public.playbooks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  report_type TEXT NOT NULL, -- executive|technical|incident|compliance|soc
  content TEXT,
  format TEXT DEFAULT 'markdown',
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rep_all_auth" ON public.reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Chat history
CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL,
  role TEXT NOT NULL, -- user|assistant|system
  content TEXT,
  parts JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX chat_history_thread_idx ON public.chat_history(thread_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_history TO authenticated;
GRANT ALL ON public.chat_history TO service_role;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_own" ON public.chat_history FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'in_app',
  title TEXT NOT NULL,
  body TEXT,
  severity TEXT DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_own" ON public.notifications FOR ALL TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- CVEs
CREATE TABLE public.cves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cve_id TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  severity TEXT,
  cvss NUMERIC,
  vendor TEXT,
  product TEXT,
  published_at TIMESTAMPTZ,
  kev BOOLEAN DEFAULT false
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cves TO authenticated;
GRANT ALL ON public.cves TO service_role;
ALTER TABLE public.cves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cves_read_auth" ON public.cves FOR SELECT TO authenticated USING (true);
CREATE POLICY "cves_admin_write" ON public.cves FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
