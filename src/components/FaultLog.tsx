import { Plus, Trash2, Wrench, CheckCircle2, Circle } from "lucide-react";
import type { FaultRow } from "@/types";

interface Props {
  faults: FaultRow[];
  setFaults: (f: FaultRow[]) => void;
}

export default function FaultLog({ faults, setFaults }: Props) {
  const update = (id: string, field: keyof FaultRow, value: string) => {
    setFaults(faults.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  };

  const toggleStatus = (id: string) => {
    setFaults(
      faults.map((f) =>
        f.id === id ? { ...f, status: f.status === "Open" ? "Fixed" : "Open" } : f,
      ),
    );
  };

  const addFault = () => {
    const newId = `f${Date.now()}`;
    setFaults([
      ...faults,
      { id: newId, title: "", symptom: "", rootCause: "", fix: "", status: "Open" },
    ]);
  };

  const deleteFault = (id: string) => {
    setFaults(faults.filter((f) => f.id !== id));
  };

  const openCount = faults.filter((f) => f.status === "Open").length;
  const fixedCount = faults.filter((f) => f.status === "Fixed").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Wrench size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Fault Log</h2>
            <p className="text-sm text-slate-500">Track incidents, root causes, and remediation status.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden gap-2 sm:flex">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <Circle size={12} /> {openCount} Open
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={12} /> {fixedCount} Fixed
            </span>
          </div>
          <button
            onClick={addFault}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            <Plus size={16} /> Add Fault
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Symptom</th>
                <th className="px-4 py-3 font-semibold">Root Cause</th>
                <th className="px-4 py-3 font-semibold">Fix</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {faults.map((f) => (
                <tr key={f.id} className="align-top hover:bg-slate-50/60">
                  <td className="px-4 py-2">
                    <input
                      value={f.title}
                      onChange={(e) => update(f.id, "title", e.target.value)}
                      placeholder="Fault title"
                      className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 font-medium text-slate-800 outline-none focus:border-slate-300 focus:bg-white"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={f.symptom}
                      onChange={(e) => update(f.id, "symptom", e.target.value)}
                      placeholder="Observed symptom"
                      className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-slate-700 outline-none focus:border-slate-300 focus:bg-white"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={f.rootCause}
                      onChange={(e) => update(f.id, "rootCause", e.target.value)}
                      placeholder="Root cause"
                      className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-slate-700 outline-none focus:border-slate-300 focus:bg-white"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={f.fix}
                      onChange={(e) => update(f.id, "fix", e.target.value)}
                      placeholder="Remediation"
                      className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-slate-700 outline-none focus:border-slate-300 focus:bg-white"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleStatus(f.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                        f.status === "Open"
                          ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {f.status === "Open" ? <Circle size={11} /> : <CheckCircle2 size={11} />}
                      {f.status}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => deleteFault(f.id)}
                      className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete fault"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {faults.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                    No faults logged. Click "Add Fault" to record an incident.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
