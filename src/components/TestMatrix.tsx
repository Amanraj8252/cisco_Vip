import { CheckCircle2, XCircle, FlaskConical } from "lucide-react";
import type { TestRow } from "@/types";

interface Props {
  rows: TestRow[];
  setRows: (r: TestRow[]) => void;
}

export default function TestMatrix({ rows, setRows }: Props) {
  const toggle = (id: string) => {
    setRows(
      rows.map((r) =>
        r.id === id ? { ...r, status: r.status === "Pass" ? "Fail" : "Pass" } : r,
      ),
    );
  };

  const updateNote = (id: string, note: string) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, note } : r)));
  };

  const passing = rows.filter((r) => r.status === "Pass").length;
  const total = rows.length;
  const pct = total === 0 ? 0 : Math.round((passing / total) * 100);
  const allPass = passing === total && total > 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
          <FlaskConical size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Test Matrix</h2>
          <p className="text-sm text-slate-500">Verify the SmartBranch 360 network against acceptance criteria.</p>
        </div>
      </div>

      {/* Summary */}
      <div
        className={`rounded-xl border p-4 shadow-sm transition ${
          allPass
            ? "border-emerald-200 bg-emerald-50"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {allPass ? (
              <CheckCircle2 size={26} className="text-emerald-500" />
            ) : (
              <XCircle size={26} className="text-slate-400" />
            )}
            <div>
              <div className="text-sm text-slate-500">Overall status</div>
              <div className="text-xl font-semibold text-slate-900">
                {passing}/{total} Passing
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-40 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  allPass ? "bg-emerald-500" : "bg-gradient-to-r from-sky-500 to-emerald-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-700">{pct}%</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Test</th>
                <th className="px-4 py-3 font-semibold">Result</th>
                <th className="px-4 py-3 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r, idx) => (
                <tr key={r.id} className="align-top hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{r.label}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle(r.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                        r.status === "Pass"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      {r.status === "Pass" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {r.status}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={r.note}
                      onChange={(e) => updateNote(r.id, e.target.value)}
                      placeholder="Evidence, commands run, observations..."
                      className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
