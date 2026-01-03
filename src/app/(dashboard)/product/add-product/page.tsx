import { cookies } from 'next/headers'

import { redirect } from 'next/navigation'

import { Grid } from '@mui/material'

import AddProduct from '@/views/product/AddProduct'

// import CreateCases from '@/views/cases/CreateCase'

const AddProductPage = async () => {
  const token = cookies().get('accessToken')?.value

  if (!token) {
    redirect('/login')
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <AddProduct token={token} />
      </Grid>
    </Grid>
  )
}

export default AddProductPage
