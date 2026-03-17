export const ROLES = {
  owner: 'owner',
  admin: 'admin',
  pm: 'pm',
  inspector: 'inspector',
  viewer: 'viewer',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export interface RolePermission {
  label: string;
  description: string;
  canManageUsers: boolean;
  canManageProjects: boolean;
  canEditAllModules: boolean;
  canEditInspections: boolean;
  canEditIncidents: boolean;
  canEditTraining: boolean;
  canViewAll: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermission> = {
  owner: {
    label: 'Owner',
    description: 'Full system access',
    canManageUsers: true,
    canManageProjects: true,
    canEditAllModules: true,
    canEditInspections: true,
    canEditIncidents: true,
    canEditTraining: true,
    canViewAll: true,
  },
  admin: {
    label: 'Admin',
    description: 'Manage users within assigned projects',
    canManageUsers: true,
    canManageProjects: false,
    canEditAllModules: true,
    canEditInspections: true,
    canEditIncidents: true,
    canEditTraining: true,
    canViewAll: true,
  },
  pm: {
    label: 'Project Manager',
    description: 'Full read/write on assigned projects',
    canManageUsers: false,
    canManageProjects: false,
    canEditAllModules: true,
    canEditInspections: true,
    canEditIncidents: true,
    canEditTraining: true,
    canViewAll: true,
  },
  inspector: {
    label: 'Inspector',
    description: 'Can edit inspections, incidents, training',
    canManageUsers: false,
    canManageProjects: false,
    canEditAllModules: false,
    canEditInspections: true,
    canEditIncidents: true,
    canEditTraining: true,
    canViewAll: true,
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access',
    canManageUsers: false,
    canManageProjects: false,
    canEditAllModules: false,
    canEditInspections: false,
    canEditIncidents: false,
    canEditTraining: false,
    canViewAll: true,
  },
};

// Helper function to check if a role can edit a specific module
export function canEdit(role: UserRole, module: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (perms.canEditAllModules) return true;
  if (module === 'inspections') return perms.canEditInspections;
  if (module === 'incidents') return perms.canEditIncidents;
  if (module === 'training') return perms.canEditTraining;
  return false;
}
