import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { getProductServer } from '@/services/product'
import AddProduct from '@/views/product/AddProduct'

interface Props {
  params: { id: string }
}

export default async function Page({ params }: Props) {
  const { id } = params

  const token = cookies().get('accessToken')?.value

  if (!token) redirect('/login')

  const productId = Number(id)

  if (isNaN(productId)) redirect('/products')

  let product

  try {
    product = await getProductServer(productId)
  } catch {
    redirect(`/error?code=PRODUCT_FETCH_FAILED&from=/product/edit/${productId}`)
  }

  if (!product.success) {
    redirect(`/error?code=PRODUCT_FETCH_FAILED&from=/product/edit/${productId}`)
  }

  const data = product.data ?? []

  // @ts-ignore
  return <AddProduct token={token} productData={data} />
}
