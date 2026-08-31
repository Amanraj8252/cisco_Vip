import type { ChecklistItem, FaultRow, TestRow, TopologyLink, VlanRow } from "./types";

export const defaultVlans: VlanRow[] = [
  { id: "v1", name: "Employee", vlanId: "10", subnet: "10.10.10.0/24", gateway: "10.10.10.1", purpose: "Corporate workstations" },
  { id: "v2", name: "Guest", vlanId: "20", subnet: "10.10.20.0/24", gateway: "10.10.20.1", purpose: "Guest Wi-Fi access" },
  { id: "v3", name: "Server", vlanId: "30", subnet: "10.10.30.0/24", gateway: "10.10.30.1", purpose: "Internal servers" },
  { id: "v4", name: "Management", vlanId: "99", subnet: "10.10.99.0/24", gateway: "10.10.99.1", purpose: "OOB management" },
];

export const defaultFaults: FaultRow[] = [
  {
    id: "f1",
    title: "Guest clients cannot reach DNS",
    symptom: "Guest Wi-Fi devices show no internet while connected",
    rootCause: "ACL applied on Guest VLAN denies UDP/TCP 53",
    fix: "Remove the deny rule for eq 53 on the Guest ACL and permit DNS",
    status: "Open",
  },
  {
    id: "f2",
    title: "Server VLAN unreachable from Employee",
    symptom: "Workstations cannot access file server 10.10.30.10",
    rootCause: "Trunk uplink missing VLAN 30 in allowed list",
    fix: "Add 30 to 'switchport trunk allowed vlan' on the uplink",
    status: "Fixed",
  },
  {
    id: "f3",
    title: "No NAT for Guest subnet",
    symptom: "Guest traffic not translating to WAN IP",
    rootCause: "ip nat inside missing on Guest subinterface",
    fix: "Apply 'ip nat inside' on the Guest SVI and 'ip nat outside' on WAN",
    status: "Open",
  },
];

export const defaultChecklist: ChecklistItem[] = [
  { id: "c1", label: "Packet Tracer file (SmartBranch360.pkt with labeled VLANs and saved configs)", checked: false, note: "" },
  { id: "c2", label: "Design document (topology diagram, VLAN/IP table, security rules, troubleshooting notes)", checked: false, note: "" },
  { id: "c3", label: "Requirement file (YAML or spreadsheet with site name, VLANs, subnets)", checked: false, note: "" },
  { id: "c4", label: "Python tool (script plus sample validation report output)", checked: false, note: "" },
  { id: "c5", label: "Fault cards (at least 5 written fault scenarios with symptom, root cause, fix)", checked: false, note: "" },
  { id: "c6", label: "Demo video (5–10 minutes showing build, fault, diagnosis, fix, verification)", checked: false, note: "" },
];

export const defaultTestMatrix: TestRow[] = [
  { id: "t1", label: "Employee traffic: Employee PC gets DHCP, reaches server, and reaches internet", status: "Pass", note: "" },
  { id: "t2", label: "Guest isolation: Guest PC reaches internet but not server or management network", status: "Pass", note: "" },
  { id: "t3", label: "Secure management: Only management host can SSH to network devices", status: "Fail", note: "" },
  { id: "t4", label: "Troubleshooting: Each injected fault is diagnosed with evidence and fixed successfully", status: "Fail", note: "" },
  { id: "t5", label: "Automation: Python tool produces useful, readable validation output", status: "Pass", note: "" },
];

export const defaultLinks: TopologyLink[] = [
  { id: "l1", device: "Router", iface: "Gi0/0", connectsTo: "SW1", vlan: "Trunk" },
  { id: "l2", device: "Router", iface: "Gi0/0", connectsTo: "SW2", vlan: "Trunk" },
  { id: "l3", device: "SW1", iface: "Fa0/1", connectsTo: "Router", vlan: "Trunk" },
  { id: "l4", device: "SW1", iface: "Fa0/10", connectsTo: "Employee", vlan: "Employee" },
  { id: "l5", device: "SW1", iface: "Fa0/20", connectsTo: "Guest AP", vlan: "Guest" },
  { id: "l6", device: "SW2", iface: "Fa0/10", connectsTo: "Server", vlan: "Server" },
  { id: "l7", device: "SW2", iface: "Fa0/99", connectsTo: "Management", vlan: "Management" },
];

export const sampleConfig = `! SmartBranch 360 - Sample router/switch config
!
interface GigabitEthernet0/0
 description Uplink to core
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport trunk allowed vlan 10,20,99
!
interface Vlan10
 description Employee
 ip address 10.10.10.1 255.255.255.0
 ip nat inside
!
interface Vlan20
 description Guest
 ip address 10.10.20.1 255.255.255.0
!
interface Vlan30
 description Server
!
interface Vlan99
 description Management
 ip address 10.10.99.1 255.255.255.0
!
ip dhcp pool GUEST
 network 10.10.20.0 255.255.255.0
 default-router 10.10.20.1
 dns-server 8.8.8.8
!
ip access-list extended GUEST_ACL
 permit tcp any any eq 80
 permit tcp any any eq 443
 deny udp any any eq 53
 deny tcp any any eq 53
!
line vty 0 4
 transport input ssh
 password S3cret!
 login local
!
ip nat inside source list 1 interface GigabitEthernet0/1 overload
!
interface GigabitEthernet0/1
 description WAN
 ip address dhcp
!
end`;
