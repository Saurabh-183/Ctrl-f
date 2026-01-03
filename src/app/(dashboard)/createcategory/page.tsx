import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import Grid from '@mui/material/Grid'


import CreateCategoryPage from '@views/Category/CreateCategory'

const createcategory = () => {
  const token = cookies().get('accessToken')?.value

  if (!token) {
    redirect('/login')
  }

return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <CreateCategoryPage token={token} />
      </Grid>
    </Grid>
  )
}

export default createcategory
