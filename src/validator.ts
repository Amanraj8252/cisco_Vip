import type { Finding, Severity, VlanRow } from "./types";

const severityRank: Record<Severity, number> = { Critical: 0, Warning: 1, Info: 2 };

export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}

function parseVlanIds(text: string): { id: string; name: string }[] {
  const out: { id: string; name: string }[] = [];
  const re = /vlan\s+(\d+)\b[\s\S]*?(?:name\s+(\S+))?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    out.push({ id: m[1], name: m[2] ?? "" });
  }
  return out;
}

function parseTrunkAllowed(text: string): number[] {
  const ids = new Set<number>();
  const re = /switchport\s+trunk\s+allowed\s+vlan\s+([0-9,\-\s]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    expandList(m[1]).forEach((n) => ids.add(n));
  }
  return [...ids];
}

function expandList(spec: string): number[] {
  const out: number[] = [];
  for (const part of spec.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const range = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const a = parseInt(range[1], 10);
      const b = parseInt(range[2], 10);
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++) out.push(i);
    } else if (/^\d+$/.test(trimmed)) {
      out.push(parseInt(trimmed, 10));
    }
  }
  return out;
}

function parseInterfaces(text: string): { name: string; body: string; hasIp: boolean }[] {
  const re = /interface\s+(\S+)[\s\S]*?(?=\n!|\ninterface|\nend|$)/gi;
  const out: { name: string; body: string; hasIp: boolean }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const body = m[0];
    out.push({ name: m[1], body, hasIp: /(^|\n)\s*ip\s+address\s+/i.test(body) });
  }
  return out;
}

function parseDhcpPools(text: string): string[] {
  const re = /ip\s+dhcp\s+pool\s+(\S+)/gi;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) out.push(m[1]);
  return out;
}

export function validateConfig(text: string, vlans: VlanRow[]): Finding[] {
  const findings: Finding[] = [];
  if (!text.trim()) return findings;

  const isYaml = /^\s*[-]?[\s]*name:|---/m.test(text) || /vlan/i.test(text) && /subnet/i.test(text) && !/interface/i.test(text);

  if (isYaml) {
    findings.push({
      issue: "YAML plan detected",
      location: "config input",
      symptom: "Validator currently performs Cisco IOS pattern checks; YAML is supported via the Plan tab export.",
      fix: "Use the Plan tab to manage VLAN definitions, or paste a 'show' command output for full validation.",
      severity: "Info",
    });
    return sortFindings(findings);
  }

  const lower = text.toLowerCase();
  const vlanDefs = parseVlanIds(text);
  const trunkAllowed = parseTrunkAllowed(text);
  const interfaces = parseInterfaces(text);
  const dhcpPools = parseDhcpPools(text).map((p) => p.toLowerCase());

  // 1. VLAN referenced but missing from trunk allowed
  for (const v of vlans) {
    const id = parseInt(v.vlanId, 10);
    if (Number.isNaN(id)) continue;
    const defined = vlanDefs.some((d) => parseInt(d.id, 10) === id);
    const referenced = /vlan\s+id|switchport\s+access\s+vlan|switchport\s+voice\s+vlan/i.test(text);
    if ((defined || referenced) && trunkAllowed.length > 0 && !trunkAllowed.includes(id)) {
      findings.push({
        issue: `VLAN ${id} (${v.name}) missing from trunk allowed list`,
        location: "Trunk uplink (switchport trunk allowed vlan)",
        symptom: `Devices in VLAN ${id} will not pass the trunk uplink; ${v.name} segments may be isolated.`,
        fix: `Add ${id} to 'switchport trunk allowed vlan' on the trunk interface.`,
        severity: "Critical",
      });
    }
  }

  // 2. Interface with no ip address
  for (const iface of interfaces) {
    if (iface.hasIp) continue;
    if (/loopback|tunnel|null/i.test(iface.name)) continue;
    if (/switchport\s+mode\s+(access|trunk)/i.test(iface.body) && !/no\s+switchport/i.test(iface.body)) continue;
    findings.push({
      issue: `Interface ${iface.name} has no 'ip address'`,
      location: `interface ${iface.name}`,
      symptom: "L3 gateway missing; routed traffic for this segment will fail.",
      fix: `Add 'ip address <gateway> <mask>' to interface ${iface.name}, or confirm it is a switchport.`,
      severity: "Warning",
    });
  }

  // 3. No ip dhcp pool for a VLAN that should have one
  for (const v of vlans) {
    const subnetBase = v.subnet.split("/")[0].replace(/\.\d+$/, "");
    const poolMatch = dhcpPools.some((p) => p.includes(v.name.toLowerCase()) || p.includes(v.vlanId));
    const networkInText = new RegExp(escapeRegex(subnetBase) + "\\s+255", "i").test(text);
    const hasPool = poolMatch || networkInText;
    if (!hasPool && /guest|employee|voice|client|user/i.test(v.name)) {
      findings.push({
        issue: `No DHCP pool for ${v.name} VLAN (${v.vlanId})`,
        location: "ip dhcp pool",
        symptom: `Clients in ${v.name} (${v.subnet}) will not receive an address via DHCP.`,
        fix: `Create 'ip dhcp pool ${v.name.toUpperCase()}' with network ${v.subnet.replace(/\//, " ")} and default-router ${v.gateway}.`,
        severity: "Warning",
      });
    }
  }

  // 4. ACL deny near eq 53 (blocking DNS)
  const aclBlocks = text.split(/ip\s+access-list/i);
  for (const block of aclBlocks.slice(1)) {
    const lines = block.split("\n");
    const aclName = (lines[0]?.match(/\S+/) || ["unknown"])[0];
    for (const line of lines) {
      if (/deny/i.test(line) && /eq\s+53\b/i.test(line)) {
        findings.push({
          issue: "ACL denies DNS (eq 53)",
          location: `ip access-list ${aclName}`,
          symptom: "DNS queries are blocked; clients cannot resolve hostnames.",
          fix: "Remove the deny rule for eq 53 or add a permit for DNS before the deny.",
          severity: "Critical",
        });
      }
    }
  }

  // 5. ip nat inside / ip nat outside missing
  const hasNatInside = /ip\s+nat\s+inside/i.test(text);
  const hasNatOutside = /ip\s+nat\s+outside/i.test(text);
  const hasNatSource = /ip\s+nat\s+inside\s+source/i.test(text);
  if ((hasNatSource || /nat/i.test(text)) && !hasNatInside) {
    findings.push({
      issue: "'ip nat inside' not applied to any interface",
      location: "LAN interfaces",
      symptom: "Outbound traffic from internal VLANs will not be translated.",
      fix: "Apply 'ip nat inside' on internal/LAN SVIs and 'ip nat outside' on the WAN interface.",
      severity: "Warning",
    });
  }
  if ((hasNatSource || /nat/i.test(text)) && !hasNatOutside) {
    findings.push({
      issue: "'ip nat outside' not applied to WAN interface",
      location: "WAN interface",
      symptom: "NAT translations have no egress; internet-bound traffic will fail.",
      fix: "Apply 'ip nat outside' on the WAN/uplink interface.",
      severity: "Warning",
    });
  }

  // 6. line vty without access-class restricting to management subnet
  const vtyMatch = text.match(/line\s+vty[\s\S]*?(?=\n!|\nline|\nend|$)/i);
  if (vtyMatch) {
    const vtyBlock = vtyMatch[0];
    if (!/access-class/i.test(vtyBlock)) {
      findings.push({
        issue: "'line vty' has no access-class restriction",
        location: "line vty",
        symptom: "SSH/Telnet management is reachable from any subnet, including untrusted ones.",
        fix: "Add 'access-class <mgmt-acl> in' to restrict management access to the Management subnet (10.10.99.0/24).",
        severity: "Critical",
      });
    }
  }

  // 7. No findings note
  if (findings.length === 0) {
    findings.push({
      issue: "No issues detected",
      location: "config input",
      symptom: "All implemented pattern checks passed.",
      fix: "No action required.",
      severity: "Info",
    });
  }

  return sortFindings(findings);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function vlansToYaml(vlans: VlanRow[]): string {
  const lines: string[] = ["# SmartBranch 360 - VLAN & IP Plan", "vlans:"];
  for (const v of vlans) {
    lines.push(`  - name: "${v.name}"`);
    lines.push(`    vlan_id: ${v.vlanId}`);
    lines.push(`    subnet: "${v.subnet}"`);
    lines.push(`    gateway: "${v.gateway}"`);
    lines.push(`    purpose: "${v.purpose}"`);
  }
  return lines.join("\n");
}

export function downloadFile(filename: string, content: string, mime = "text/plain"): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
