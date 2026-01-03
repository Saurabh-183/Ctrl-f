
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { getEmployee, getEmployeeServer } from '@/services/employee'
import AddUser from '@/views/user/AddUser'

interface Props {
  params: { id: string }
}

export default async function Page({ params }: Props) {
  try {
    const { id } = params

    // Validate token
    const token = cookies().get('accessToken')?.value

    if (!token) redirect('/login')

    // Fetch employee list
    const res = await getEmployee(Number(id))

    console.log('res: ', res)

    const result = await getEmployeeServer(Number(id))

    console.log('result: ', result)

    if (!result.success) {
      return null
    }

    // Validate API structure
    if (!res || res.status !== 200 || !res.data) {
      redirect('/error?msg=Invalid employee API response')
    }

    const data = res.data

    console.log('data: ', data)

    // Validate ID
    const numericId = Number(id)

    if (isNaN(numericId)) redirect('/employees')

    // @ts-ignore
    return <AddUser token={token} userData={result.data} />
  } catch (error: any) {
    console.error('Page Error:', error)
    redirect('/error?msg=' + encodeURIComponent(error?.message ?? 'Something went wrong'))
  }
}
