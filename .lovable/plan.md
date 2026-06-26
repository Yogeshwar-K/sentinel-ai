# AI-Powered Cybersecurity SOC Assistant — Build Plan

A production-grade SOC dashboard built on the Lovable stack (TanStack Start + React + Tailwind + Lovable Cloud + Lovable AI Gateway). Realistic mock threat-intel data; real auth, database, and AI.

## Stack mapping (your spec → what we'll actually use)

Your spec lists FastAPI/MongoDB/Docker/Socket.IO. This Lovable project runs on a fixed stack — same capabilities, different implementation:

- Frontend: React 19 + TanStack Start + Tailwind v4 + Framer Motion + Recharts + Leaflet
- Backend: TanStack server functions + server routes (replaces FastAPI/Express)
- Database: Lovable Cloud Postgres + RLS (replaces MongoDB)
- Auth: Lovable Cloud (email/password + Google) + `user_roles` table (analyst/manager/admin)
- AI: Lovable AI Gateway (Gemini default; GPT optional) via AI SDK — chat, summaries, IOC extraction, log analysis, report generation
- Realtime: Supabase Realtime channels (replaces Socket.IO)
- Storage: Lovable Cloud Storage (log uploads, evidence, reports)
- Threat intel: realistic seeded mock data for VirusTotal/AbuseIPDB/Shodan/OTX/CISA KEV/CVE — swappable for real APIs later

No Docker/Nginx/GitHub Actions — Lovable handles deploy.

## Design

Enterprise SOC dark theme inspired by Sentinel/CrowdStrike/Splunk ES:
- Deep navy background (`oklch(0.16 0.03 250)`), elevated cards with subtle glassmorphism
- Cyber accent palette: electric cyan primary, neon green success, amber warning, hot-pink critical
- Severity tokens: critical / high / medium / low / info
- Monospace for logs/IOCs (JetBrains Mono); Inter for UI
- Framer Motion: card stagger, alert pulse, attack-line draw, count-up stats
- Skeleton loaders, animated KPI cards, live ticker

## Phase 1 — Foundation (this turn)

1. Enable Lovable Cloud
2. Design system in `src/styles.css` (dark SOC theme, severity tokens, mono font, glass utilities)
3. Auth: email/password + Google sign-in via `lovable.auth.signInWithOAuth` + `/auth` public page + `_authenticated` gate
4. Schema (with GRANTs + RLS):
   - `profiles` (id→auth.users, name, avatar, title)
   - `app_role` enum + `user_roles` + `has_role()` security-definer
   - `alerts` (severity, status, source, mitre_techniques[], asset, raw, ai_summary)
   - `incidents` (status, severity, assignee, timeline jsonb, notes)
   - `assets` (hostname, ip, os, owner, risk_score, online)
   - `logs` (uploaded raw + parsed fields, hostname/ip/user/process/event_id/severity/ts)
   - `threat_intel` (ioc, type, score, family, actor, country, asn, mitre[], last_seen)
   - `playbooks` (title, steps jsonb, mitre, ai_generated)
   - `reports` (type, title, content, generated_by, format)
   - `chat_history` (user_id, role, content, parts jsonb)
   - `notifications` (user_id, channel, payload, read)
5. Storage buckets: `log-uploads` (private), `evidence` (private), `reports` (private)
6. App shell: collapsible sidebar (Dashboard / Alerts / Threat Hunting / Incident Response / Threat Intel / Attack Map / Log Management / Asset Inventory / Playbooks / Reports / AI Chat / Settings), top bar with global IOC search, user menu, theme
7. Dashboard page: KPI cards (today's threats, severity counts, devices online, blocked IPs, incidents), attack timeline (Recharts), top attack countries (mini map), CPU/RAM/Disk gauges, suspicious users/processes tables, latest CVEs ticker
8. AI Chat Assistant page: streaming chat via `/api/chat` server route + Lovable AI Gateway (Gemini 3 Flash), system prompt tuned for SOC/SIEM/MITRE/CVE/Sigma/YARA/KQL, markdown rendering with `react-markdown`, persisted to `chat_history`
9. Seed: realistic alerts/incidents/assets/IOCs/CVEs across last 30 days, MITRE technique mapping

## Phase 2 (next iteration)

- Alerts page: filter/sort/triage, AI "Explain this alert" + auto-summary
- Incident Response: kanban, timeline, evidence attachments, AI incident summary + RCA
- Log Management: upload CSV/JSON/TXT/Syslog → parser → AI log analyzer (privilege escalation, brute force, SQLi, XSS, ransomware, lateral movement) → MITRE mapping + remediation
- Threat Intel lookup: IOC search (IP/hash/domain/URL/email) hitting seeded `threat_intel` + AI enrichment
- Threat Hunting: query box (KQL/Sigma/SPL textareas) running against `logs` with translated SQL
- Attack Map: Leaflet world map, animated attack arcs from realtime channel
- Playbooks: AI playbook generator, library, recommendations per alert
- Reports: AI-generated executive/technical/incident/compliance reports → PDF (jspdf) / CSV / XLSX export
- Settings: profile, MFA, API keys (stub), theme, notification channels
- MITRE heatmap, CVE explorer, threat-actor profiles, executive/compliance dashboards
- Voice (Web Speech API) for chat
- Role-gated routes (manager sees team views; admin sees user mgmt)

## Tech notes (technical section)

- All AI calls server-side via `createServerFn` or `/api/chat` server route; `LOVABLE_API_KEY` never reaches the client
- All tables get explicit `GRANT` + `ENABLE RLS` + policies scoped to `auth.uid()` or role
- `has_role()` security-definer used in every role-gated policy
- Google OAuth via `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`
- Charts via Recharts; map via `react-leaflet`
- Animation via Framer Motion
- Toasts via existing `sonner`
- File parsing in-browser for CSV/JSON/TXT; EVTX flagged as "coming soon" (binary format needs server parser we can add later)

## What I'll do this turn

Phase 1 in full: enable Cloud, schema + RLS + seed, auth, app shell with all sidebar routes (stub pages where Phase 2 takes over), full Dashboard, full AI Chat Assistant. Then propose continuing with Phase 2 sections in priority order.

Confirm to proceed, or tell me to re-order/cut scope.