export interface VlanRow {
  id: string;
  name: string;
  vlanId: string;
  subnet: string;
  gateway: string;
  purpose: string;
}

export type Severity = "Critical" | "Warning" | "Info";

export interface Finding {
  issue: string;
  location: string;
  symptom: string;
  fix: string;
  severity: Severity;
}

export interface FaultRow {
  id: string;
  title: string;
  symptom: string;
  rootCause: string;
  fix: string;
  status: "Open" | "Fixed";
}

export interface TopologyLink {
  id: string;
  device: string;
  iface: string;
  connectsTo: string;
  vlan: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  note: string;
}

export interface TestRow {
  id: string;
  label: string;
  status: "Pass" | "Fail";
  note: string;
}

export type TabKey = "plan" | "validator" | "faultlog" | "topology" | "checklist" | "testmatrix";
