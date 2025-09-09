export function hasRole(userRole, allowedRoles = []) {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}
