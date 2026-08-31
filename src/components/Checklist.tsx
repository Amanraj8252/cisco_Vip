import { CheckCircle2, Circle, ClipboardCheck } from "lucide-react";
import type { ChecklistItem } from "@/types";

interface Props {
  items: ChecklistItem[];
  setItems: (i: ChecklistItem[]) => void;
}

const itemIcons = [
  "📦",
  "📄",
  "🗂️",
  "🐍",
  "🧯",
  "🎬",
];

export default function Checklist({ items, setItems }: Props) {
  const toggle = (id: string) => {
    setItems(items.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it)));
  };

  const updateNote = (id: string, note: string) => {
    setItems(items.map((it) => (it.id === id ? { ...it, note } : it)));
  };

  const done = items.filter((i) => i.checked).length;
  const total = items.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
          <ClipboardCheck size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Project Checklist</h2>
          <p className="text-sm text-slate-500">Track deliverables for the SmartBranch 360 submission.</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Completion</span>
          <span className="font-semibold text-slate-900">
            {done}/{total} ({pct}%)
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((it, idx) => {
          const emoji = itemIcons[idx] ?? "✅";
          return (
            <div
              key={it.id}
              className={`rounded-xl border bg-white p-4 shadow-sm transition ${
                it.checked ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggle(it.id)}
                  className="mt-0.5 shrink-0 text-slate-300 transition hover:text-emerald-500"
                  aria-label={it.checked ? "Mark incomplete" : "Mark complete"}
                >
                  {it.checked ? (
                    <CheckCircle2 size={22} className="text-emerald-500" />
                  ) : (
                    <Circle size={22} />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{emoji}</span>
                    <span
                      className={`text-sm font-medium ${
                        it.checked ? "text-slate-500 line-through" : "text-slate-800"
                      }`}
                    >
                      {it.label}
                    </span>
                  </div>
                  <input
                    value={it.note}
                    onChange={(e) => updateNote(it.id, e.target.value)}
                    placeholder="Add a short note (e.g. file path, status, who is responsible)"
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
