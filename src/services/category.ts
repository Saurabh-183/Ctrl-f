import { apiGet } from '@/libs/api'

export interface CategoryData {
  id: number
  productType: number
  categoryName: string
  subCategory: number
  companyId: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  productTypeName: string
  subCategoryName: string
}

export interface CategoryListResponse {
  status: number
  message: string
  data: CategoryData[]
}

export interface CategoryResponse {
  status: number
  message: string
  data: CategoryData
}

// GET category list
export function getCategoryList() {
  return apiGet<CategoryListResponse>('/category/category-list?status=active')
}

export function getCategory(id: number) {
  return apiGet<CategoryResponse>(`/category/category-detail-list?id=${id}`)
}
