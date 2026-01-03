import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { getCategory } from '@/services/category'

import EditCategoryPage from '@views/Category/EditCategory'

interface Props {
  params: { id: string }
}

const editcategory = async ({ params }: Props) => {
  try {
    const { id } = params

    // Validate token
    const token = cookies().get('accessToken')?.value

    if (!token) redirect('/login')

    // Fetch employee list
    const res = await getCategory(Number(id))

    // Validate API structure
    if (!res || res.status !== 200 || !res.data) {
      redirect('/error?msg=Invalid employee API response')
    }

    const data = res.data

    // Validate ID
    const numericId = Number(id)

    if (isNaN(numericId)) redirect('/listcategory')

    return <EditCategoryPage token={token} categoryData={data} />
  } catch (error: any) {
    console.error('Page Error:', error)
    redirect('/error?msg=' + encodeURIComponent(error?.message ?? 'Something went wrong'))
  }
}

export default editcategory
