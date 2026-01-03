import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import Grid from '@mui/material/Grid'

import CategoryTable from '@views/Category/ListCategory'

const ListCategoryPage = async () => {
  const token = cookies().get('accessToken')?.value

  if (!token) {
    redirect('/login')
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <CategoryTable token={token} />
      </Grid>
    </Grid>
  )
}

export default ListCategoryPage
