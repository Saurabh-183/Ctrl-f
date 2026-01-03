import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { Grid } from '@mui/material'

import ListBrand from '@/views/brand/ListBrand'

const ListBrandPage = () => {
  const token = cookies().get('accessToken')?.value

  if (!token) {
    redirect('/login')
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <ListBrand token={token!} />
      </Grid>
    </Grid>
  )
}

export default ListBrandPage
