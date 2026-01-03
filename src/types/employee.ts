// types/employee.ts
export type Permission = {
  permissionId: number
  permissionName: string
}

export type Role = {
  roleId: number
  roleName: string
}

export type Employee = {
  id: number
  firstName: string
  lastName: string
  userName: string
  userEmail: string
  userMobile: number
  employeeId: string
  gender: string
  userRole: number
  role: Role
  permission: Permission[]
}
