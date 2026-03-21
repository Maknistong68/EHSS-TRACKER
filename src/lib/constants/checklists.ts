export interface ChecklistItemDef {
  section: string;
  itemNumber: number;
  description: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}

// ═══════════════════════════════════════════════
// Pre-Mobilization Sections
// ═══════════════════════════════════════════════

export const PREMOB_SECTIONS = [
  'HSSE Management System',
  'Risk Assessment',
  'Training & Competency',
  'Insurance & Legal',
  'Site Logistics',
  'Equipment & Plant',
  'Permits & Approvals',
  'Communication',
] as const;

export const PREMOB_ITEMS: ChecklistItemDef[] = [
  // Section 1: HSSE Management System (8 items)
  { section: 'HSSE Management System', itemNumber: 1, description: 'HSSE Policy reviewed and approved for project' },
  { section: 'HSSE Management System', itemNumber: 2, description: 'Project-specific HSSE Plan developed and submitted' },
  { section: 'HSSE Management System', itemNumber: 3, description: 'Emergency Response Plan developed for project scope' },
  { section: 'HSSE Management System', itemNumber: 4, description: 'Environmental Management Plan prepared' },
  { section: 'HSSE Management System', itemNumber: 5, description: 'Waste Management Plan developed' },
  { section: 'HSSE Management System', itemNumber: 6, description: 'Traffic Management Plan prepared' },
  { section: 'HSSE Management System', itemNumber: 7, description: 'HSSE organizational chart established with roles defined' },
  { section: 'HSSE Management System', itemNumber: 8, description: 'HSSE KPIs and targets set for the project' },

  // Section 2: Risk Assessment (8 items)
  { section: 'Risk Assessment', itemNumber: 9, description: 'Baseline risk assessment completed for all work activities' },
  { section: 'Risk Assessment', itemNumber: 10, description: 'Task-specific risk assessments prepared' },
  { section: 'Risk Assessment', itemNumber: 11, description: 'Method statements developed for high-risk activities' },
  { section: 'Risk Assessment', itemNumber: 12, description: 'Job Hazard Analysis (JHA) templates prepared' },
  { section: 'Risk Assessment', itemNumber: 13, description: 'HAZID/HAZOP studies completed where required' },
  { section: 'Risk Assessment', itemNumber: 14, description: 'Critical lift plans prepared and reviewed' },
  { section: 'Risk Assessment', itemNumber: 15, description: 'Confined space entry procedures established' },
  { section: 'Risk Assessment', itemNumber: 16, description: 'Working at height rescue plans developed' },

  // Section 3: Training & Competency (8 items)
  { section: 'Training & Competency', itemNumber: 17, description: 'HSSE induction program developed for the project' },
  { section: 'Training & Competency', itemNumber: 18, description: 'Competency matrix established for all HSSE-critical roles' },
  { section: 'Training & Competency', itemNumber: 19, description: 'Operator certification records verified and filed' },
  { section: 'Training & Competency', itemNumber: 20, description: 'First aid and emergency response team identified and trained' },
  { section: 'Training & Competency', itemNumber: 21, description: 'Toolbox talk schedule and topics prepared' },
  { section: 'Training & Competency', itemNumber: 22, description: 'Specialized training needs identified (confined space, WAH, etc.)' },
  { section: 'Training & Competency', itemNumber: 23, description: 'HSSE supervisor qualifications verified' },
  { section: 'Training & Competency', itemNumber: 24, description: 'Training records management system established' },

  // Section 4: Insurance & Legal (8 items)
  { section: 'Insurance & Legal', itemNumber: 25, description: 'Contractor all-risk insurance obtained and verified' },
  { section: 'Insurance & Legal', itemNumber: 26, description: 'Workers compensation insurance confirmed' },
  { section: 'Insurance & Legal', itemNumber: 27, description: 'Third-party liability insurance in place' },
  { section: 'Insurance & Legal', itemNumber: 28, description: 'Professional indemnity insurance confirmed' },
  { section: 'Insurance & Legal', itemNumber: 29, description: 'Client HSSE requirements contractually acknowledged' },
  { section: 'Insurance & Legal', itemNumber: 30, description: 'Saudi labor law compliance requirements reviewed' },
  { section: 'Insurance & Legal', itemNumber: 31, description: 'Environmental permits and licenses identified' },
  { section: 'Insurance & Legal', itemNumber: 32, description: 'Subcontractor HSSE pre-qualification completed' },

  // Section 5: Site Logistics (8 items)
  { section: 'Site Logistics', itemNumber: 33, description: 'Site layout plan with safety zones prepared' },
  { section: 'Site Logistics', itemNumber: 34, description: 'Access and egress routes identified and planned' },
  { section: 'Site Logistics', itemNumber: 35, description: 'Material storage areas designated with safety requirements' },
  { section: 'Site Logistics', itemNumber: 36, description: 'Temporary facilities locations planned (offices, welfare)' },
  { section: 'Site Logistics', itemNumber: 37, description: 'Hazardous material storage requirements identified' },
  { section: 'Site Logistics', itemNumber: 38, description: 'Waste segregation and disposal areas planned' },
  { section: 'Site Logistics', itemNumber: 39, description: 'Emergency assembly points identified' },
  { section: 'Site Logistics', itemNumber: 40, description: 'Temporary power and lighting requirements assessed' },

  // Section 6: Equipment & Plant (8 items)
  { section: 'Equipment & Plant', itemNumber: 41, description: 'Equipment pre-use inspection checklist prepared' },
  { section: 'Equipment & Plant', itemNumber: 42, description: 'Crane and lifting equipment certification verified' },
  { section: 'Equipment & Plant', itemNumber: 43, description: 'Scaffolding inspection regime established' },
  { section: 'Equipment & Plant', itemNumber: 44, description: 'PPE requirements identified and procurement initiated' },
  { section: 'Equipment & Plant', itemNumber: 45, description: 'Fire prevention and protection equipment planned' },
  { section: 'Equipment & Plant', itemNumber: 46, description: 'First aid equipment and supplies procured' },
  { section: 'Equipment & Plant', itemNumber: 47, description: 'Environmental monitoring equipment identified' },
  { section: 'Equipment & Plant', itemNumber: 48, description: 'Communication equipment (radios, alarms) planned' },

  // Section 7: Permits & Approvals (8 items)
  { section: 'Permits & Approvals', itemNumber: 49, description: 'Permit to Work system established and communicated' },
  { section: 'Permits & Approvals', itemNumber: 50, description: 'Hot work permit procedures in place' },
  { section: 'Permits & Approvals', itemNumber: 51, description: 'Excavation permit procedures established' },
  { section: 'Permits & Approvals', itemNumber: 52, description: 'Confined space entry permit system ready' },
  { section: 'Permits & Approvals', itemNumber: 53, description: 'Working at height permit procedures defined' },
  { section: 'Permits & Approvals', itemNumber: 54, description: 'Electrical isolation (LOTO) procedures established' },
  { section: 'Permits & Approvals', itemNumber: 55, description: 'Site access permits and badges arranged' },
  { section: 'Permits & Approvals', itemNumber: 56, description: 'Vehicle and equipment entry permits coordinated' },

  // Section 8: Communication (8 items)
  { section: 'Communication', itemNumber: 57, description: 'HSSE reporting structure and escalation matrix defined' },
  { section: 'Communication', itemNumber: 58, description: 'Incident reporting and investigation procedures established' },
  { section: 'Communication', itemNumber: 59, description: 'HSSE meeting schedule established (daily, weekly, monthly)' },
  { section: 'Communication', itemNumber: 60, description: 'Emergency contact list compiled and distributed' },
  { section: 'Communication', itemNumber: 61, description: 'HSSE notice board requirements and locations identified' },
  { section: 'Communication', itemNumber: 62, description: 'Client HSSE reporting requirements confirmed' },
  { section: 'Communication', itemNumber: 63, description: 'Near miss and safety observation reporting system in place' },
  { section: 'Communication', itemNumber: 64, description: 'HSSE document control and distribution system established' },
];

// ═══════════════════════════════════════════════
// Mobilization Sections
// ═══════════════════════════════════════════════

export const MOB_SECTIONS = [
  'Site Setup & Safety',
  'Personnel Readiness',
  'Equipment Mobilization',
  'Systems & Processes',
  'Documentation',
  'Consultant Baseline',
] as const;

export const MOB_ITEMS: ChecklistItemDef[] = [
  // Section 1: Site Setup & Safety (8 items)
  { section: 'Site Setup & Safety', itemNumber: 1, description: 'Site perimeter fencing and hoarding installed' },
  { section: 'Site Setup & Safety', itemNumber: 2, description: 'Safety signage erected at all entry/exit points' },
  { section: 'Site Setup & Safety', itemNumber: 3, description: 'Emergency assembly points marked and communicated' },
  { section: 'Site Setup & Safety', itemNumber: 4, description: 'Temporary facilities (offices, toilets, rest areas) set up and inspected' },
  { section: 'Site Setup & Safety', itemNumber: 5, description: 'First aid station established and stocked' },
  { section: 'Site Setup & Safety', itemNumber: 6, description: 'Fire extinguishers placed and inspection tags attached' },
  { section: 'Site Setup & Safety', itemNumber: 7, description: 'Drinking water stations installed and tested' },
  { section: 'Site Setup & Safety', itemNumber: 8, description: 'Temporary electrical installations inspected and certified' },

  // Section 2: Personnel Readiness (8 items)
  { section: 'Personnel Readiness', itemNumber: 9, description: 'All workers completed project-specific HSSE induction' },
  { section: 'Personnel Readiness', itemNumber: 10, description: 'Medical fitness certificates verified for all personnel' },
  { section: 'Personnel Readiness', itemNumber: 11, description: 'PPE issued to all workers and fit-check completed' },
  { section: 'Personnel Readiness', itemNumber: 12, description: 'Emergency response team roles assigned and communicated' },
  { section: 'Personnel Readiness', itemNumber: 13, description: 'Site access badges and permits obtained for all personnel' },
  { section: 'Personnel Readiness', itemNumber: 14, description: 'Operator licenses and certifications verified on-site' },
  { section: 'Personnel Readiness', itemNumber: 15, description: 'Worker accommodation inspected for welfare compliance' },
  { section: 'Personnel Readiness', itemNumber: 16, description: 'Transportation arrangements verified for safety compliance' },

  // Section 3: Equipment Mobilization (8 items)
  { section: 'Equipment Mobilization', itemNumber: 17, description: 'All equipment pre-use inspections completed and documented' },
  { section: 'Equipment Mobilization', itemNumber: 18, description: 'Crane and lifting equipment third-party certified' },
  { section: 'Equipment Mobilization', itemNumber: 19, description: 'Scaffolding erected and inspected with tag system in place' },
  { section: 'Equipment Mobilization', itemNumber: 20, description: 'Vehicles inspected and fitted with required safety devices' },
  { section: 'Equipment Mobilization', itemNumber: 21, description: 'Power tools and electrical equipment PAT tested' },
  { section: 'Equipment Mobilization', itemNumber: 22, description: 'Gas detection and monitoring equipment calibrated' },
  { section: 'Equipment Mobilization', itemNumber: 23, description: 'Fall protection equipment inspected and logged' },
  { section: 'Equipment Mobilization', itemNumber: 24, description: 'Spill kits and environmental response equipment deployed' },

  // Section 4: Systems & Processes (8 items)
  { section: 'Systems & Processes', itemNumber: 25, description: 'Permit to Work system activated and first permits issued' },
  { section: 'Systems & Processes', itemNumber: 26, description: 'Daily toolbox talk program commenced' },
  { section: 'Systems & Processes', itemNumber: 27, description: 'Incident reporting system operational and tested' },
  { section: 'Systems & Processes', itemNumber: 28, description: 'HSSE inspection schedule commenced' },
  { section: 'Systems & Processes', itemNumber: 29, description: 'Waste management system operational (bins, segregation)' },
  { section: 'Systems & Processes', itemNumber: 30, description: 'Environmental monitoring commenced (dust, noise, water)' },
  { section: 'Systems & Processes', itemNumber: 31, description: 'Emergency alarm system tested and functional' },
  { section: 'Systems & Processes', itemNumber: 32, description: 'Security and access control system operational' },

  // Section 5: Documentation (8 items)
  { section: 'Documentation', itemNumber: 33, description: 'HSSE Plan approved and copies available on-site' },
  { section: 'Documentation', itemNumber: 34, description: 'Risk assessments and method statements available at work face' },
  { section: 'Documentation', itemNumber: 35, description: 'Emergency Response Plan posted at key locations' },
  { section: 'Documentation', itemNumber: 36, description: 'HSSE notice boards installed with required information' },
  { section: 'Documentation', itemNumber: 37, description: 'Training records and competency matrix available on-site' },
  { section: 'Documentation', itemNumber: 38, description: 'Equipment inspection registers and certificates filed' },
  { section: 'Documentation', itemNumber: 39, description: 'HSSE forms and checklists printed and distributed' },
  { section: 'Documentation', itemNumber: 40, description: 'Client HSSE standards available for reference' },

  // Section 6: Consultant Baseline (8 items)
  { section: 'Consultant Baseline', itemNumber: 41, description: 'Baseline HSSE audit conducted and report issued' },
  { section: 'Consultant Baseline', itemNumber: 42, description: 'Initial environmental baseline survey completed' },
  { section: 'Consultant Baseline', itemNumber: 43, description: 'Worker welfare baseline assessment completed' },
  { section: 'Consultant Baseline', itemNumber: 44, description: 'Emergency drill conducted within first week' },
  { section: 'Consultant Baseline', itemNumber: 45, description: 'First management safety tour completed' },
  { section: 'Consultant Baseline', itemNumber: 46, description: 'HSSE performance tracking system initialized with baseline data' },
  { section: 'Consultant Baseline', itemNumber: 47, description: 'Subcontractor HSSE performance baseline recorded' },
  { section: 'Consultant Baseline', itemNumber: 48, description: 'Photographic baseline record of site conditions captured' },
];

// ═══════════════════════════════════════════════
// Demobilization Sections (with priority)
// ═══════════════════════════════════════════════

export const DEMOB_SECTIONS = [
  'Site Closure',
  'Equipment & Materials',
  'Personnel',
  'Documentation',
  'Compliance & Closeout',
] as const;

export const DEMOB_ITEMS: ChecklistItemDef[] = [
  // Section 1: Site Closure - HIGH (7 items)
  { section: 'Site Closure', itemNumber: 1, description: 'Environmental site assessment completed', priority: 'HIGH' },
  { section: 'Site Closure', itemNumber: 2, description: 'Contaminated areas identified and remediation plan in place', priority: 'HIGH' },
  { section: 'Site Closure', itemNumber: 3, description: 'All temporary structures safely dismantled', priority: 'HIGH' },
  { section: 'Site Closure', itemNumber: 4, description: 'Underground services and utilities safely disconnected', priority: 'HIGH' },
  { section: 'Site Closure', itemNumber: 5, description: 'Excavations backfilled and compacted to specification', priority: 'HIGH' },
  { section: 'Site Closure', itemNumber: 6, description: 'Hazardous materials removed and disposed of per regulations', priority: 'HIGH' },
  { section: 'Site Closure', itemNumber: 7, description: 'Final site inspection conducted with client representative', priority: 'HIGH' },

  // Section 2: Equipment & Materials - HIGH (7 items)
  { section: 'Equipment & Materials', itemNumber: 8, description: 'All equipment de-energized and isolated', priority: 'HIGH' },
  { section: 'Equipment & Materials', itemNumber: 9, description: 'Equipment inspection prior to transport completed', priority: 'HIGH' },
  { section: 'Equipment & Materials', itemNumber: 10, description: 'Hazardous substances inventory reconciled and removed', priority: 'HIGH' },
  { section: 'Equipment & Materials', itemNumber: 11, description: 'Waste materials segregated and disposed of properly', priority: 'HIGH' },
  { section: 'Equipment & Materials', itemNumber: 12, description: 'Recyclable materials separated and sent for recycling', priority: 'HIGH' },
  { section: 'Equipment & Materials', itemNumber: 13, description: 'Transport plan for equipment demobilization approved', priority: 'HIGH' },
  { section: 'Equipment & Materials', itemNumber: 14, description: 'Fuel and oil storage properly drained and cleaned', priority: 'HIGH' },

  // Section 3: Personnel - MEDIUM (7 items)
  { section: 'Personnel', itemNumber: 15, description: 'Demobilization safety briefing conducted for all personnel', priority: 'MEDIUM' },
  { section: 'Personnel', itemNumber: 16, description: 'Exit medical examinations completed where required', priority: 'MEDIUM' },
  { section: 'Personnel', itemNumber: 17, description: 'All PPE collected and accounted for', priority: 'MEDIUM' },
  { section: 'Personnel', itemNumber: 18, description: 'Site access badges and permits returned', priority: 'MEDIUM' },
  { section: 'Personnel', itemNumber: 19, description: 'Worker welfare and final payments verified', priority: 'MEDIUM' },
  { section: 'Personnel', itemNumber: 20, description: 'Travel arrangements confirmed for departing personnel', priority: 'MEDIUM' },
  { section: 'Personnel', itemNumber: 21, description: 'Lessons learned session conducted with HSSE team', priority: 'MEDIUM' },

  // Section 4: Documentation - MEDIUM (7 items)
  { section: 'Documentation', itemNumber: 22, description: 'Final HSSE performance report prepared', priority: 'MEDIUM' },
  { section: 'Documentation', itemNumber: 23, description: 'All incident investigation reports closed out', priority: 'MEDIUM' },
  { section: 'Documentation', itemNumber: 24, description: 'Training records archived and handed over', priority: 'MEDIUM' },
  { section: 'Documentation', itemNumber: 25, description: 'Inspection and audit records compiled and filed', priority: 'MEDIUM' },
  { section: 'Documentation', itemNumber: 26, description: 'Equipment inspection and maintenance logs archived', priority: 'MEDIUM' },
  { section: 'Documentation', itemNumber: 27, description: 'Environmental monitoring data compiled and reported', priority: 'MEDIUM' },
  { section: 'Documentation', itemNumber: 28, description: 'Waste disposal manifests and certificates filed', priority: 'MEDIUM' },

  // Section 5: Compliance & Closeout - LOW (7 items)
  { section: 'Compliance & Closeout', itemNumber: 29, description: 'All NCRs and corrective actions closed out', priority: 'LOW' },
  { section: 'Compliance & Closeout', itemNumber: 30, description: 'Regulatory compliance confirmation obtained', priority: 'LOW' },
  { section: 'Compliance & Closeout', itemNumber: 31, description: 'Insurance claims and notifications completed', priority: 'LOW' },
  { section: 'Compliance & Closeout', itemNumber: 32, description: 'Client HSSE closeout acceptance obtained', priority: 'LOW' },
  { section: 'Compliance & Closeout', itemNumber: 33, description: 'Lessons learned report distributed to stakeholders', priority: 'LOW' },
  { section: 'Compliance & Closeout', itemNumber: 34, description: 'HSSE performance benchmarked against initial targets', priority: 'LOW' },
  { section: 'Compliance & Closeout', itemNumber: 35, description: 'Project HSSE file handed over to client for record', priority: 'LOW' },
];
