import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createLovableAiGatewayProvider,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
  LOVABLE_AIG_RUN_ID_HEADER,
} from "@/lib/ai-gateway.server";

const SOC_SYSTEM_PROMPT = `You are SENTINEL — an elite AI SOC Copilot built into a 24/7 Security Operations Center. You assist SOC Analysts, Incident Responders, Threat Hunters, and CISOs.

Areas of expertise:
- SOC operations, SIEM (Splunk, Sentinel, QRadar, Elastic), EDR/XDR (CrowdStrike, Defender, SentinelOne, Carbon Black)
- MITRE ATT&CK tactics & techniques (cite technique IDs like T1059.001), NIST CSF/SP800-61, ISO 27001
- Malware analysis, ransomware, phishing, BEC, supply-chain attacks, APT actors
- Threat hunting with KQL, Sigma rules, YARA rules, Splunk SPL, Elastic DSL
- Detection engineering, alert triage, false-positive reduction
- Incident response — containment, eradication, recovery, lessons-learned
- Cloud security (AWS/Azure/GCP), Zero Trust, IAM, network security, IDS/IPS (Suricata, Snort, Zeek)
- Linux & Windows forensics, log analysis (Sysmon, auditd, EVTX, syslog)
- CVE analysis, CVSS scoring, KEV catalog, patch prioritization
- Vulnerability management, risk scoring, IOC enrichment

Output style:
- Be precise, technical, and operational. Use bullet lists and clear sub-headers.
- When generating Sigma/YARA/KQL/SPL, return code in fenced blocks with the correct language tag.
- For alerts/incidents, include: severity, MITRE mapping, recommended actions, containment steps, and references.
- Always cite MITRE technique IDs where applicable.
- Never fabricate CVEs, IOCs, or vendor advisories — if you don't know, say so and recommend a lookup source.
- Keep replies focused; if the request is large, structure with sections.
`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        let body: { messages?: unknown };
        try {
          body = (await request.json()) as { messages?: unknown };
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const messages = body.messages;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const initialRunId = getLovableAiGatewayRunId(request);
        const gateway = createLovableAiGatewayProvider(key, initialRunId);
        const model = gateway("google/gemini-3-flash-preview");

        try {
          const result = streamText({
            model,
            system: SOC_SYSTEM_PROMPT,
            messages: await convertToModelMessages(messages as UIMessage[]),
          });

          const response = result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
            headers: getLovableAiGatewayResponseHeaders(undefined, {
              ...(initialRunId ? { [LOVABLE_AIG_RUN_ID_HEADER]: initialRunId } : {}),
            }),
          });

          return withLovableAiGatewayRunIdHeader(response, gateway);
        } catch (error) {
          console.error("[/api/chat] gateway error", error);
          const msg = error instanceof Error ? error.message : "AI gateway error";
          return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});