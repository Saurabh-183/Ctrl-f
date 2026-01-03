import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { Grid } from '@mui/material'

import ListSupplier from '@/views/supplier/ListSupplier'

const ListSupplierPage = () => {
  const token = cookies().get('accessToken')?.value

  if (!token) {
    redirect('/login')
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <ListSupplier token={token!}/>
      </Grid>
    </Grid>
  )
}

export default ListSupplierPage
