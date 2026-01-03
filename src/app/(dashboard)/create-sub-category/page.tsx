import { cookies } from 'next/headers'

import { redirect } from 'next/navigation'

import Grid from '@mui/material/Grid'

import CreateSubCategoryPage from '@/views/SubCategory/CreateSubCategoryPage'

const Createsubcategory = () => {
  const token = cookies().get('accessToken')?.value

  if (!token) {
    redirect('/login')
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <CreateSubCategoryPage ansh={token!} />
      </Grid>
    </Grid>
  )
}

export default Createsubcategory
