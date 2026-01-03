// services/employee.ts
import { apiGet } from '@/libs/api'
import { serverFetch } from '@/libs/fetch/server-fetch'

import type { ApiResult } from '@/libs/types/api'
import type { Employee } from '@/types/employee'

// API Response interface



export interface EmployeeListResponse {
  message: string
  status: number
  data: Employee[]
}

// API Response interface
export interface EmployeeResponse {
  sucess: boolean
  message: string
  status: number
  data: Employee
}

export interface EmployeeDeleteResponse {
  message: string
  status: number
}

// GET employee list
// export function getEmployeeList() {
//   return apiGet<EmployeeListResponse>('/employee/employee-list')
// }

export async function getEmployeesServer(): Promise<ApiResult<Employee[]>> {
  return serverFetch<Employee[]>('/employee/employee-list')
}

export async function getEmployeeServer(id: number): Promise<ApiResult<Employee>> {
  return serverFetch<Employee>(`/employee/employee-detail-list?id=${id}`)
}

export function getEmployeeList() {
  return serverFetch<EmployeeListResponse>('/employee/employee-list')
}

export function getEmployee(id: number) {
  return apiGet<EmployeeResponse>(`/employee/employee-detail-list?id=${id}`)
}

export function deleteEmployee(id: number) {
  return apiGet<EmployeeDeleteResponse>(`/employee/delete-employee'?id=${id}`)
}
