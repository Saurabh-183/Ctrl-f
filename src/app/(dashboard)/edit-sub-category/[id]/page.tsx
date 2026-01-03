import { redirect } from 'next/navigation'

import { cookies } from 'next/headers'

import Grid from '@mui/material/Grid'

import EditSubCategoryPage from '@/views/SubCategory/EditSubCategory'

const Editsubcategory = () => {
  const token = cookies().get('accessToken')?.value

  if (!token) {
    redirect('/login')
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <EditSubCategoryPage ansh={token!} />
      </Grid>
    </Grid>
  )
}

export default Editsubcategory
