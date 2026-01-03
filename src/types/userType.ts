export type StationData = {
  stationId: string
  stationName: string
} | null

export interface User {
  id: number
  firstName: string
  lastName: string | null
  userName: string
  password: string
  userEmail: string
  userMobile: string
  department: string | null
  userRole: number
  role: { roleId: number; roleName: string }
  permission: { permissionId: number; permissionName: string }[]
  employeeId: string
  gender: 'male' | 'female' | 'other' | string
  profilePic: string | null
  createdOn: string
  createdBy: string
  updatedOn: string | null
  updatedBy: string | null
  isActive: boolean
  companyId: number
}
