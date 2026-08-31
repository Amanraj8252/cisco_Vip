import { Plus, Trash2, Download, Network } from "lucide-react";
import type { VlanRow } from "@/types";
import { downloadFile, vlansToYaml } from "@/validator";

interface Props {
  vlans: VlanRow[];
  setVlans: (v: VlanRow[]) => void;
}

const vlanColors: Record<string, string> = {
  Employee: "bg-blue-100 text-blue-800 border-blue-300",
  Guest: "bg-amber-100 text-amber-800 border-amber-300",
  Server: "bg-emerald-100 text-emerald-800 border-emerald-300",
  Management: "bg-purple-100 text-purple-800 border-purple-300",
};

function badgeClass(name: string): string {
  return vlanColors[name] ?? "bg-slate-100 text-slate-700 border-slate-300";
}

export default function VlanPlan({ vlans, setVlans }: Props) {
  const update = (id: string, field: keyof VlanRow, value: string) => {
    setVlans(vlans.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  const addRow = () => {
    const newId = `v${Date.now()}`;
    setVlans([
      ...vlans,
      { id: newId, name: "", vlanId: "", subnet: "", gateway: "", purpose: "" },
    ]);
  };

  const deleteRow = (id: string) => {
    setVlans(vlans.filter((v) => v.id !== id));
  };

  const exportYaml = () => {
    downloadFile("vlan-plan.yaml", vlansToYaml(vlans), "text/yaml");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Network size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">VLAN &amp; IP Plan</h2>
            <p className="text-sm text-slate-500">Define the branch network segmentation and addressing.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={addRow}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            <Plus size={16} /> Add VLAN
          </button>
          <button
            onClick={exportYaml}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Download size={16} /> Export YAML
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">VLAN Name</th>
                <th className="px-4 py-3 font-semibold">VLAN ID</th>
                <th className="px-4 py-3 font-semibold">Subnet (CIDR)</th>
                <th className="px-4 py-3 font-semibold">Gateway</th>
                <th className="px-4 py-3 font-semibold">Purpose</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vlans.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {v.name && (
                        <span className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full border ${badgeClass(v.name)}`} />
                      )}
                      <input
                        value={v.name}
                        onChange={(e) => update(v.id, "name", e.target.value)}
                        placeholder="e.g. Employee"
                        className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 font-medium text-slate-800 outline-none focus:border-slate-300 focus:bg-white"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={v.vlanId}
                      onChange={(e) => update(v.id, "vlanId", e.target.value)}
                      placeholder="e.g. 10"
                      className="w-20 rounded-md border border-transparent bg-transparent px-2 py-1 font-mono text-slate-800 outline-none focus:border-slate-300 focus:bg-white"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={v.subnet}
                      onChange={(e) => update(v.id, "subnet", e.target.value)}
                      placeholder="10.10.10.0/24"
                      className="w-36 rounded-md border border-transparent bg-transparent px-2 py-1 font-mono text-slate-800 outline-none focus:border-slate-300 focus:bg-white"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={v.gateway}
                      onChange={(e) => update(v.id, "gateway", e.target.value)}
                      placeholder="10.10.10.1"
                      className="w-32 rounded-md border border-transparent bg-transparent px-2 py-1 font-mono text-slate-800 outline-none focus:border-slate-300 focus:bg-white"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={v.purpose}
                      onChange={(e) => update(v.id, "purpose", e.target.value)}
                      placeholder="Purpose"
                      className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-slate-700 outline-none focus:border-slate-300 focus:bg-white"
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => deleteRow(v.id)}
                      className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {vlans.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                    No VLANs defined. Click "Add VLAN" to start.
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
