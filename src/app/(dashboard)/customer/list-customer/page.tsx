import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { Grid } from '@mui/material'

import ListCustomer from '@/views/customer/ListCustomer'

const ListCustomerPage = () => {
  const token = cookies().get('accessToken')?.value

  if (!token) {
    redirect('/login')
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <ListCustomer token={token!} />
      </Grid>
    </Grid>
  )
}

export default ListCustomerPage
