import { apiGet } from '@/libs/api'

export interface SubCategoryListResponse {
  status: number
  message: string
  data: SubCategoryData[]
}

export interface SubCategoryData {
  id: number
  subCategory: string
  companyId: number
  isActive: boolean
  createdAt: string | null // nullable date string
  updatedAt: string // ISO date string
}

// GET category list
export function getSubCategoryList() {
  return apiGet<SubCategoryListResponse>('/sub-category/sub-category-list?status=active')
}
