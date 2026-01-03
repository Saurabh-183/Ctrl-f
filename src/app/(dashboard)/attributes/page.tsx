import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { Grid } from '@mui/material'

import CreateAttributes from '@/views/attributes/CreateAttributes'

const AttributesPage = async () => {
  const token = cookies().get('accessToken')?.value

  if (!token) {
    redirect('/login')
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <CreateAttributes token={token!} />
      </Grid>
    </Grid>
  )
}

export default AttributesPage
