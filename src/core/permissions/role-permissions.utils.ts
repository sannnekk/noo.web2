import type { UserRole } from '../api/endpoints/auth.types'

type RolePermissionsMap<Permission extends string> = Record<
  Permission,
  readonly UserRole[]
>

interface RolePermissionPolicy<Permission extends string> {
  can: (permission: Permission, role?: UserRole) => boolean
  rolesFor: (permission: Permission) => UserRole[]
}

function createRolePermissionPolicy<Permission extends string>(
  permissionMap: RolePermissionsMap<Permission>
): RolePermissionPolicy<Permission> {
  function can(permission: Permission, role?: UserRole): boolean {
    if (!role) {
      return false
    }

    return permissionMap[permission].includes(role)
  }

  function rolesFor(permission: Permission): UserRole[] {
    return [...permissionMap[permission]]
  }

  return {
    can,
    rolesFor
  }
}

export type { RolePermissionPolicy, RolePermissionsMap }
export { createRolePermissionPolicy }
