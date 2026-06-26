import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { Activity, Loader2, Mail, Lock, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Minimum 8 characters").max(128),
});

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — SENTINEL SOC" },
      { name: "description", content: "Sign in to the SENTINEL AI SOC console." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate({ to: "/dashboard", replace: true });
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name || parsed.data.email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth error");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    // session was set, listener handles navigation
  }

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-sidebar p-10 lg:flex">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/15 text-primary glow-cyan">
            <Activity className="h-4 w-4" />
          </div>
          <span className="text-mono font-semibold tracking-wider">SENTINEL</span>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold leading-tight">
            Your AI SOC, <br />
            <span className="bg-gradient-to-r from-primary to-chart-5 bg-clip-text text-transparent">
              already on shift.
            </span>
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Real-time alerts, MITRE-mapped detections, threat hunting, and an AI copilot for SOC analysts, incident responders, and CISOs.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" /> SOC 2 patterns · Role-based access · Encrypted at rest
          </div>
        </div>
        <div className="text-mono text-xs uppercase tracking-widest text-muted-foreground">
          OPS-CENTER · TIER 2 · v1.0
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <h1 className="text-2xl font-semibold tracking-tight">Access the SOC console</h1>
          <p className="mt-1 text-sm text-muted-foreground">Authenticate to enter the operations center.</p>

          <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6 space-y-4">
              <Button onClick={handleGoogle} disabled={loading} variant="outline" className="w-full">
                Continue with Google
              </Button>
              <Divider />
              <EmailForm
                loading={loading}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                onSubmit={handleEmail}
                submitLabel="Sign in"
              />
            </TabsContent>

            <TabsContent value="signup" className="mt-6 space-y-4">
              <Button onClick={handleGoogle} disabled={loading} variant="outline" className="w-full">
                Continue with Google
              </Button>
              <Divider />
              <form onSubmit={handleEmail} className="space-y-3">
                <div>
                  <Label htmlFor="name">Display name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" maxLength={80} />
                </div>
                <EmailFields
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
      <div className="relative flex justify-center"><span className="bg-background px-2 text-[10px] uppercase tracking-widest text-muted-foreground">or</span></div>
    </div>
  );
}

function EmailFields(p: { email: string; setEmail: (v: string) => void; password: string; setPassword: (v: string) => void }) {
  return (
    <>
      <div>
        <Label htmlFor="email">Work email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="email" type="email" autoComplete="email" value={p.email} onChange={(e) => p.setEmail(e.target.value)} className="pl-9" placeholder="analyst@company.com" maxLength={255} required />
        </div>
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="password" type="password" autoComplete="current-password" value={p.password} onChange={(e) => p.setPassword(e.target.value)} className="pl-9" placeholder="••••••••" minLength={8} maxLength={128} required />
        </div>
      </div>
    </>
  );
}

function EmailForm(p: {
  loading: boolean;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
}) {
  return (
    <form onSubmit={p.onSubmit} className="space-y-3">
      <EmailFields email={p.email} setEmail={p.setEmail} password={p.password} setPassword={p.setPassword} />
      <Button type="submit" disabled={p.loading} className="w-full">
        {p.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : p.submitLabel}
      </Button>
    </form>
  );
}