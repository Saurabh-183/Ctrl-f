import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import AddUser from '@/views/user/AddUser'


const Page = async () => {

  const token = cookies().get('accessToken')?.value

  if (!token) {
    redirect('/login')
  }

  return <AddUser token={token} />
}

export default Page
