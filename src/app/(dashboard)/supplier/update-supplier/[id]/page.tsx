import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { Grid } from '@mui/material'

import UpdateSupplier from '@/views/supplier/UpdateSupplier'

const UpdateSupplierPage = () => {
  const token = cookies().get('accessToken')?.value

  if (!token) {
    redirect('/login')
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <UpdateSupplier token={token!}/>
      </Grid>
    </Grid>
  )
}

export default UpdateSupplierPage
