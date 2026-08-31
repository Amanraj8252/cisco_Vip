import { useState } from "react";
import { ShieldCheck, Play, FileText, AlertTriangle, Info, AlertOctagon } from "lucide-react";
import type { Finding, Severity, VlanRow } from "@/types";
import { validateConfig } from "@/validator";
import { sampleConfig } from "@/data";

interface Props {
  vlans: VlanRow[];
}

const severityStyles: Record<Severity, { badge: string; icon: typeof Info }> = {
  Critical: { badge: "bg-red-100 text-red-700 border-red-200", icon: AlertOctagon },
  Warning: { badge: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertTriangle },
  Info: { badge: "bg-sky-100 text-sky-700 border-sky-200", icon: Info },
};

export default function ConfigValidator({ vlans }: Props) {
  const [config, setConfig] = useState("");
  const [findings, setFindings] = useState<Finding[] | null>(null);

  const runValidation = () => {
    setFindings(validateConfig(config, vlans));
  };

  const loadSample = () => {
    setConfig(sampleConfig);
    setFindings(null);
  };

  const clearAll = () => {
    setConfig("");
    setFindings(null);
  };

  const counts = findings
    ? {
        Critical: findings.filter((f) => f.severity === "Critical").length,
        Warning: findings.filter((f) => f.severity === "Warning").length,
        Info: findings.filter((f) => f.severity === "Info").length,
      }
    : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Config Validator</h2>
            <p className="text-sm text-slate-500">Paste a Cisco "show" output or config and run pattern-based checks.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadSample}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <FileText size={16} /> Load sample
          </button>
          <button
            onClick={clearAll}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
          >
            Clear
          </button>
          <button
            onClick={runValidation}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            <Play size={16} /> Validate
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Configuration input</label>
          <textarea
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            spellCheck={false}
            placeholder={"! Paste 'show run', 'show vlan brief', or a config block here...\ninterface Vlan10\n ip address 10.10.10.1 255.255.255.0"}
            className="h-[420px] w-full resize-none rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-[13px] leading-relaxed text-slate-100 outline-none transition focus:border-slate-400"
          />
          <p className="text-xs text-slate-400">
            Tip: click "Load sample" to auto-fill a representative config with several intentional issues.
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Findings</label>

          {counts && (
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${severityStyles.Critical.badge}`}>
                <AlertOctagon size={13} /> {counts.Critical} Critical
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${severityStyles.Warning.badge}`}>
                <AlertTriangle size={13} /> {counts.Warning} Warning
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${severityStyles.Info.badge}`}>
                <Info size={13} /> {counts.Info} Info
              </span>
            </div>
          )}

          <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            {findings === null ? (
              <div className="flex h-[420px] flex-col items-center justify-center gap-2 p-6 text-center text-sm text-slate-400">
                <ShieldCheck size={28} className="text-slate-300" />
                <p>Run a validation to see findings here.</p>
              </div>
            ) : findings.length === 0 ? (
              <div className="flex h-[420px] flex-col items-center justify-center gap-2 p-6 text-center text-sm text-emerald-600">
                <ShieldCheck size={28} />
                <p>No findings.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Severity</th>
                    <th className="px-3 py-2.5 font-semibold">Issue</th>
                    <th className="px-3 py-2.5 font-semibold">Location</th>
                    <th className="px-3 py-2.5 font-semibold">Symptom</th>
                    <th className="px-3 py-2.5 font-semibold">Suggested Fix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {findings.map((f, i) => {
                    const s = severityStyles[f.severity];
                    const Icon = s.icon;
                    return (
                      <tr key={i} className="align-top hover:bg-slate-50/60">
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${s.badge}`}>
                            <Icon size={12} /> {f.severity}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-medium text-slate-800">{f.issue}</td>
                        <td className="px-3 py-3 font-mono text-xs text-slate-600">{f.location}</td>
                        <td className="px-3 py-3 text-slate-600">{f.symptom}</td>
                        <td className="px-3 py-3 text-slate-600">{f.fix}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
