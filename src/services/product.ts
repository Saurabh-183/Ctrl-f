import { apiGet } from '@/libs/api'
import { serverFetch } from '@/libs/fetch/server-fetch'
import type { ApiResult } from '@/libs/types/api'

export interface CategoryItem {
  id: number
  name: string
}

export interface ProductAttribute {
  id?: number
  attributeJson: AttributeItem[]
  oldPrice: number
  price: number
}

export interface AttributeItem {
  attributeName: string
  attributeValue: string
}

export interface ProductData {

  id: number
  productType: string
  productSize: string
  productCode: string
  category: string | null
  tyreType: string
  position: string
  brand: string
  countryOrigin: string
  description: string
  cbmPerCarton: number
  cartonsPerSKU: number
  totalWeightPerCarton: number
  unitsPerCarton: number
  media: string[]
  companyId: number
  isActive: boolean
  createdAt: string
  updatedAt: string | null
  categories: CategoryItem[]
  attributes: ProductAttribute[]
}

export interface ProductListResponse {
  status: number
  message: string
  data: ProductData[]
}

// GET category list
export function getProductList() {
  return apiGet<ProductListResponse>('/product/product-list')
}

// export function getEmployee(id: number) {
//   return apiGet<EmployeeResponse>(`/employee/employee-detail-list?id=${id}`)
// }

export async function getProductServer(id: number): Promise<ApiResult<ProductData>> {
  const res: ApiResult<ProductData> = await serverFetch(`/product/product-detail-list?id=${id}`)

  if (!res.success) {
    throw new Error(res.error.message || 'PRODUCT_FETCH_FAILED')
  }

  if (res.status !== 200 || !res.data) {
    throw new Error('PRODUCT_FETCH_FAILED')
  }

  return res
}
