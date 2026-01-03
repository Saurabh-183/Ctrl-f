import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { Grid } from '@mui/material'

import AddCustomer from '@/views/customer/AddCustomer'

const AddCustomerPage = async () => {
  const token = cookies().get('accessToken')?.value

  if (!token) {
    redirect('/login')
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <AddCustomer token={token!} />
      </Grid>
    </Grid>
  )
}

export default AddCustomerPage
