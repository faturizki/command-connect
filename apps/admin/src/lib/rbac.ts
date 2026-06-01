import type { AdminRole } from "./auth";

export type Permission = "create" | "edit" | "delete" | "view";

const rolePermissions: Record<AdminRole, Permission[]> = {
  admin: ["create", "edit", "delete", "view"],
  editor: ["create", "edit", "view"],
  viewer: ["view"],
};

export function hasPermission(role: AdminRole | null, permission: Permission): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function canCreate(role: AdminRole | null): boolean {
  return hasPermission(role, "create");
}

export function canEdit(role: AdminRole | null): boolean {
  return hasPermission(role, "edit");
}

export function canDelete(role: AdminRole | null): boolean {
  return hasPermission(role, "delete");
}

export function canView(role: AdminRole | null): boolean {
  return hasPermission(role, "view");
}
