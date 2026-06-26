import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { Send, Bot, User as UserIcon, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "AI SOC Copilot — SENTINEL" }] }),
  component: ChatPage,
});

const SUGGESTIONS = [
  "Write a Sigma rule that detects suspicious PowerShell encoded commands (T1059.001).",
  "Explain CVE-2024-3094 (XZ backdoor) and suggest detection ideas.",
  "Triage this alert: failed RDP brute force from 185.220.x to DC01 — what next?",
  "Generate an incident response playbook for ransomware on a Windows file server.",
  "Translate this KQL to Splunk SPL: SecurityEvent | where EventID == 4625 | summarize count() by Account",
];

function ChatPage() {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, status]);

  const busy = status === "submitted" || status === "streaming";

  async function submit(text?: string) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput("");
    await sendMessage({ text: content });
    inputRef.current?.focus();
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] w-full max-w-4xl flex-col">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary glow-cyan">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">SENTINEL Copilot</h1>
          <p className="text-xs text-muted-foreground">AI SOC analyst — SIEM, MITRE, detection engineering, IR.</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {messages.length === 0 && (
          <div className="glass rounded-xl p-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="mt-2 font-semibold">How can I help your SOC today?</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try one of these:</p>
            <div className="mt-3 grid gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => submit(s)} className="rounded-md border border-border bg-background/40 px-3 py-2 text-left text-sm hover:border-primary/40 hover:bg-primary/5">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={cn("flex gap-3", isUser && "flex-row-reverse")}>
              <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full", isUser ? "bg-secondary" : "bg-primary/15 text-primary")}>
                {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={cn("max-w-[80%] rounded-xl px-4 py-3 text-sm", isUser ? "bg-primary text-primary-foreground" : "glass")}>
                {isUser ? (
                  <div className="whitespace-pre-wrap">{text}</div>
                ) : (
                  <div className="prose prose-sm prose-invert max-w-none prose-pre:bg-background prose-pre:border prose-pre:border-border">
                    <ReactMarkdown>{text || "…"}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {busy && (
          <div className="flex gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary"><Bot className="h-4 w-4" /></div>
            <div className="glass flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error.message}
          </div>
        )}

        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="mt-3 flex items-end gap-2 rounded-xl border border-border bg-card p-2"
      >
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder="Ask about MITRE techniques, write Sigma/KQL/YARA, triage an alert…"
          className="min-h-10 max-h-40 resize-none border-0 bg-transparent focus-visible:ring-0"
          maxLength={4000}
        />
        <Button type="submit" disabled={busy || !input.trim()} size="icon">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}