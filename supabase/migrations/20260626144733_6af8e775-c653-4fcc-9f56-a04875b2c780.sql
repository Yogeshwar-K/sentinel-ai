
ALTER FUNCTION public.touch_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Replace permissive write policies with role-aware ones (keep open read for SOC team)
DROP POLICY IF EXISTS "alerts_all_auth" ON public.alerts;
CREATE POLICY "alerts_read" ON public.alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "alerts_write" ON public.alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "alerts_update" ON public.alerts FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "alerts_delete" ON public.alerts FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "incidents_all_auth" ON public.incidents;
CREATE POLICY "incidents_read" ON public.incidents FOR SELECT TO authenticated USING (true);
CREATE POLICY "incidents_write" ON public.incidents FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "incidents_update" ON public.incidents FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "incidents_delete" ON public.incidents FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "logs_all_auth" ON public.logs;
CREATE POLICY "logs_read" ON public.logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "logs_insert" ON public.logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by OR uploaded_by IS NULL);
CREATE POLICY "logs_delete" ON public.logs FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "ti_all_auth" ON public.threat_intel;
CREATE POLICY "ti_read" ON public.threat_intel FOR SELECT TO authenticated USING (true);
CREATE POLICY "ti_write" ON public.threat_intel FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ti_update" ON public.threat_intel FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ti_delete" ON public.threat_intel FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "pb_all_auth" ON public.playbooks;
CREATE POLICY "pb_read" ON public.playbooks FOR SELECT TO authenticated USING (true);
CREATE POLICY "pb_write" ON public.playbooks FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by OR created_by IS NULL);
CREATE POLICY "pb_update" ON public.playbooks FOR UPDATE TO authenticated USING (auth.uid() = created_by OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin')) WITH CHECK (true);
CREATE POLICY "pb_delete" ON public.playbooks FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "rep_all_auth" ON public.reports;
CREATE POLICY "rep_read" ON public.reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "rep_write" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = generated_by OR generated_by IS NULL);
CREATE POLICY "rep_delete" ON public.reports FOR DELETE TO authenticated USING (auth.uid() = generated_by OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));
