// src/lib/api/employees.client.ts
import { clientFetch } from '@/libs/fetch/client-fetch'
import type { Employee } from '@/types/employee'
import type { ApiResult } from '@/libs/types/api'

export const EmployeesClient = {
  list(): Promise<ApiResult<Employee[]>> {
    return clientFetch<Employee[]>('/api/employees')
  }
}
