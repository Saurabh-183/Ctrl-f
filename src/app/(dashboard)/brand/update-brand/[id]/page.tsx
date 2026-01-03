import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { Grid } from '@mui/material'

import UpdateBrand from '@/views/brand/UpdateBrand'

const UpdateBrandPage = () => {
  const token = cookies().get('accessToken')?.value

  if (!token) {
    redirect('/login')
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <UpdateBrand token={token!}/>
      </Grid>
    </Grid>
  )
}

export default UpdateBrandPage
