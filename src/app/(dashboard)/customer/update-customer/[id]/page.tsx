import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { Grid } from '@mui/material'

import UpdateCustomer from '@/views/customer/UpdateCustomer'

const UpdateCustomerPage = () => {
  const token = cookies().get('accessToken')?.value

  if (!token) {
    redirect('/login')
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <UpdateCustomer token={token!}/>
      </Grid>
    </Grid>
  )
}

export default UpdateCustomerPage
