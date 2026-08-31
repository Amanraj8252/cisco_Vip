import { useState } from "react";
import { Network, ShieldCheck, Wrench, Activity, Share2, ClipboardCheck, FlaskConical } from "lucide-react";
import type { ChecklistItem, FaultRow, TabKey, TestRow, TopologyLink, VlanRow } from "@/types";
import { defaultChecklist, defaultFaults, defaultLinks, defaultTestMatrix, defaultVlans } from "@/data";
import VlanPlan from "@/components/VlanPlan";
import ConfigValidator from "@/components/ConfigValidator";
import FaultLog from "@/components/FaultLog";
import Topology from "@/components/Topology";
import Checklist from "@/components/Checklist";
import TestMatrix from "@/components/TestMatrix";

const tabs: { key: TabKey; label: string; icon: typeof Network }[] = [
  { key: "plan", label: "Plan", icon: Network },
  { key: "validator", label: "Validator", icon: ShieldCheck },
  { key: "topology", label: "Topology", icon: Share2 },
  { key: "checklist", label: "Checklist", icon: ClipboardCheck },
  { key: "testmatrix", label: "Test Matrix", icon: FlaskConical },
  { key: "faultlog", label: "Fault Log", icon: Wrench },
];

function App() {
  const [active, setActive] = useState<TabKey>("plan");
  const [vlans, setVlans] = useState<VlanRow[]>(defaultVlans);
  const [faults, setFaults] = useState<FaultRow[]>(defaultFaults);
  const [links, setLinks] = useState<TopologyLink[]>(defaultLinks);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist);
  const [testMatrix, setTestMatrix] = useState<TestRow[]>(defaultTestMatrix);

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-900 text-slate-300 md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 text-white">
            <Activity size={20} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">SmartBranch 360</div>
            <div className="text-[11px] text-slate-400">Network Validator</div>
          </div>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = active === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <Icon size={18} />
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 px-5 py-4 text-[11px] text-slate-500">
          v1.0 &middot; offline client-side tool
        </div>
      </aside>

      {/* Mobile top tabs */}
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur md:hidden">
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 text-white">
              <Activity size={16} />
            </div>
            <span className="text-sm font-semibold">SmartBranch 360</span>
          </div>
          <div className="flex gap-1 px-2 pb-2">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = active === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition ${
                    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {active === "plan" && <VlanPlan vlans={vlans} setVlans={setVlans} />}
          {active === "validator" && <ConfigValidator vlans={vlans} />}
          {active === "topology" && <Topology vlans={vlans} links={links} setLinks={setLinks} />}
          {active === "checklist" && <Checklist items={checklist} setItems={setChecklist} />}
          {active === "testmatrix" && <TestMatrix rows={testMatrix} setRows={setTestMatrix} />}
          {active === "faultlog" && <FaultLog faults={faults} setFaults={setFaults} />}
        </main>
      </div>
    </div>
  );
}

export default App;
