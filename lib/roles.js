export const roleAccess = {
  admin: ["SUPER_ADMIN", "ADMIN"],
  manager: ["SUPER_ADMIN", "MANAGER"],
  coordinator: ["SUPER_ADMIN", "COORDINATOR"],
  driver: ["SUPER_ADMIN", "DRIVER"],
  public: ["SUPER_ADMIN", "PUBLIC"],
};

export function hasAdminAccess(role) {
  return roleAccess.admin.includes(role);
}

export function hasDriverAccess(role) {
  return roleAccess.driver.includes(role);
}

export function hasManagerAccess(role) {
  return roleAccess.manager.includes(role);
}

export function hasCoordinatorAccess(role) {
  return roleAccess.coordinator.includes(role);
}

export function hasPublicAccess(role) {
  return roleAccess.public.includes(role);
}
