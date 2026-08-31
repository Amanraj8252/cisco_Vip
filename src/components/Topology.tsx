import { useState } from "react";
import { Plus, Trash2, Share2, Router, Server, Wifi, Cable } from "lucide-react";
import type { TopologyLink, VlanRow } from "@/types";

interface Props {
  vlans: VlanRow[];
  links: TopologyLink[];
  setLinks: (l: TopologyLink[]) => void;
}

const vlanPalette: Record<string, { stroke: string; fill: string; text: string; chip: string }> = {
  Employee: { stroke: "#2563eb", fill: "#dbeafe", text: "#1e40af", chip: "bg-blue-100 text-blue-800 border-blue-300" },
  Guest: { stroke: "#ea580c", fill: "#ffedd5", text: "#9a3412", chip: "bg-orange-100 text-orange-800 border-orange-300" },
  Server: { stroke: "#16a34a", fill: "#dcfce7", text: "#166534", chip: "bg-green-100 text-green-800 border-green-300" },
  Management: { stroke: "#dc2626", fill: "#fee2e2", text: "#991b1b", chip: "bg-red-100 text-red-800 border-red-300" },
  Trunk: { stroke: "#475569", fill: "#f1f5f9", text: "#334155", chip: "bg-slate-100 text-slate-700 border-slate-300" },
};

function paletteFor(name: string) {
  return vlanPalette[name] ?? { stroke: "#475569", fill: "#f1f5f9", text: "#334155", chip: "bg-slate-100 text-slate-700 border-slate-300" };
}

interface NodePos {
  id: string;
  label: string;
  x: number;
  y: number;
  vlan: string;
  kind: "router" | "switch" | "ap" | "server" | "endpoint";
}

const NODE_W = 130;
const NODE_H = 46;

const baseNodes: NodePos[] = [
  { id: "Router", label: "Router", x: 430, y: 30, vlan: "Trunk", kind: "router" },
  { id: "SW1", label: "SW1", x: 240, y: 150, vlan: "Trunk", kind: "switch" },
  { id: "SW2", label: "SW2", x: 620, y: 150, vlan: "Trunk", kind: "switch" },
  { id: "Guest AP", label: "Guest AP", x: 60, y: 270, vlan: "Guest", kind: "ap" },
  { id: "Employee", label: "Employee", x: 240, y: 270, vlan: "Employee", kind: "endpoint" },
  { id: "Server", label: "Server", x: 620, y: 270, vlan: "Server", kind: "server" },
  { id: "Management", label: "Management", x: 800, y: 270, vlan: "Management", kind: "endpoint" },
];

function nodeIcon(kind: NodePos["kind"]) {
  switch (kind) {
    case "router":
      return Router;
    case "switch":
      return Cable;
    case "ap":
      return Wifi;
    case "server":
      return Server;
    default:
      return Share2;
  }
}

export default function Topology({ vlans, links, setLinks }: Props) {
  const [draft, setDraft] = useState({ device: "", iface: "", connectsTo: "", vlan: "Employee" });

  const vlanOptions = ["Trunk", ...vlans.map((v) => v.name).filter(Boolean)];

  // Merge base nodes with any custom devices referenced by links
  const knownIds = new Set(baseNodes.map((n) => n.id));
  const customNodes: NodePos[] = [];
  const customX = 430;
  let customY = 380;
  for (const link of links) {
    for (const name of [link.device, link.connectsTo]) {
      if (!knownIds.has(name) && !customNodes.some((n) => n.id === name)) {
        customNodes.push({ id: name, label: name, x: customX, y: customY, vlan: link.vlan, kind: "endpoint" });
        knownIds.add(name);
        customY += 70;
      }
    }
  }
  const nodes = [...baseNodes, ...customNodes];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const addLink = () => {
    if (!draft.device.trim() || !draft.iface.trim() || !draft.connectsTo.trim()) return;
    setLinks([...links, { id: `l${Date.now()}`, ...draft }]);
    setDraft({ device: "", iface: "", connectsTo: "", vlan: "Employee" });
  };

  const updateLink = (id: string, field: keyof TopologyLink, value: string) => {
    setLinks(links.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const deleteLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Share2 size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Network Topology</h2>
          <p className="text-sm text-slate-500">Auto-generated diagram of device connections per VLAN.</p>
        </div>
      </div>

      {/* VLAN legend */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(vlanPalette).map((name) => {
          const p = vlanPalette[name];
          return (
            <span key={name} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${p.chip}`}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.stroke }} />
              {name}
            </span>
          );
        })}
      </div>

      {/* Add / edit connections form */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Device</label>
            <input
              value={draft.device}
              onChange={(e) => setDraft({ ...draft, device: e.target.value })}
              placeholder="e.g. SW1"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Interface</label>
            <input
              value={draft.iface}
              onChange={(e) => setDraft({ ...draft, iface: e.target.value })}
              placeholder="e.g. Fa0/1"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-slate-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Connects To</label>
            <input
              value={draft.connectsTo}
              onChange={(e) => setDraft({ ...draft, connectsTo: e.target.value })}
              placeholder="e.g. Router"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">VLAN</label>
            <select
              value={draft.vlan}
              onChange={(e) => setDraft({ ...draft, vlan: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              {vlanOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={addLink}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>
      </div>

      {/* SVG diagram */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <svg width="940" height={Math.max(360, customY)} className="min-w-[760px]" role="img" aria-label="Network topology diagram">
          {/* Edges */}
          {links.map((l) => {
            const from = nodeMap.get(l.device);
            const to = nodeMap.get(l.connectsTo);
            if (!from || !to) return null;
            const p = paletteFor(l.vlan);
            const x1 = from.x + NODE_W / 2;
            const y1 = from.y + NODE_H;
            const x2 = to.x + NODE_W / 2;
            const y2 = to.y;
            const midY = (y1 + y2) / 2;
            return (
              <g key={l.id}>
                <path
                  d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                  fill="none"
                  stroke={p.stroke}
                  strokeWidth={2.5}
                  strokeOpacity={0.85}
                />
                <text
                  x={(x1 + x2) / 2}
                  y={midY - 4}
                  textAnchor="middle"
                  fontSize={10}
                  fontFamily="ui-monospace, monospace"
                  fill={p.stroke}
                >
                  {l.iface}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const p = paletteFor(n.vlan);
            const Icon = nodeIcon(n.kind);
            return (
              <g key={n.id}>
                <rect
                  x={n.x}
                  y={n.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={8}
                  fill={p.fill}
                  stroke={p.stroke}
                  strokeWidth={2}
                />
                <foreignObject x={n.x} y={n.y} width={NODE_W} height={NODE_H}>
                  <div className="flex h-full w-full items-center justify-center gap-1.5 px-2">
                    <span style={{ color: p.stroke }}>
                      <Icon size={14} />
                    </span>
                    <span className="truncate text-xs font-semibold" style={{ color: p.text }}>
                      {n.label}
                    </span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Connections list */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-700">Connections</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Device</th>
                <th className="px-4 py-3 font-semibold">Interface</th>
                <th className="px-4 py-3 font-semibold">Connects To</th>
                <th className="px-4 py-3 font-semibold">VLAN</th>
                <th className="px-4 py-3 font-semibold">Path</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {links.map((l) => {
                const p = paletteFor(l.vlan);
                return (
                  <tr key={l.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2">
                      <input
                        value={l.device}
                        onChange={(e) => updateLink(l.id, "device", e.target.value)}
                        className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 font-medium text-slate-800 outline-none focus:border-slate-300 focus:bg-white"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={l.iface}
                        onChange={(e) => updateLink(l.id, "iface", e.target.value)}
                        className="w-28 rounded-md border border-transparent bg-transparent px-2 py-1 font-mono text-slate-800 outline-none focus:border-slate-300 focus:bg-white"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={l.connectsTo}
                        onChange={(e) => updateLink(l.id, "connectsTo", e.target.value)}
                        className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-slate-700 outline-none focus:border-slate-300 focus:bg-white"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={l.vlan}
                        onChange={(e) => updateLink(l.id, "vlan", e.target.value)}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:border-slate-400"
                      >
                        {vlanOptions.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-600">
                      {l.device} {l.iface} → {l.connectsTo}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className={`mr-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${p.chip}`}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.stroke }} />
                        {l.vlan}
                      </span>
                      <button
                        onClick={() => deleteLink(l.id)}
                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete connection"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {links.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                    No connections. Add one above to render the diagram.
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
