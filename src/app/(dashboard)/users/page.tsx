
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { getEmployeesServer } from '@/services/employee'
import ListUser from '@/views/user/ListUser'


export default async function Page() {
  const token = cookies().get('accessToken')?.value

  if (!token) {
    redirect('/login')
  }

  const  result = await getEmployeesServer()

  if (!result.success) {
    if (result.error.status === 401) redirect('/login')

    // return <ErrorState title='Unable to fetch employees' message={result.error.message} />
    return <ListUser token={token} data={[]} />
  }

  // if (result.data.length === 0) {
  //   return <EmptyState title='No employees found' />
  // }

  return <ListUser token={token} data={result.data || []} />
}
