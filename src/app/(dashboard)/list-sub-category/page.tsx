import { redirect } from 'next/navigation'

import { cookies } from 'next/headers'

import Grid from '@mui/material/Grid'

import ListSubCategory from '@/views/SubCategory/ListSubCategory'

const subcategory = () => {
  const token = cookies().get('accessToken')?.value

  if (!token) {
    redirect('/login')
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ListSubCategory token={token!} />
      </Grid>
    </Grid>
  )
}

export default subcategory
