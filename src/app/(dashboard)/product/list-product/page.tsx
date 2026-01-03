import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { Grid } from '@mui/material'

import ListProduct from '@/views/product/ListProduct'
import { getProductList } from '@/services/product'

const ListProductPage = async () => {
  const token = cookies().get('accessToken')?.value

  if (!token) {
    redirect('/login')
  }

  const res = await getProductList().catch(() => {
    redirect('/error?code=PRODUCT_LIST_FETCH_FAILED&from=/product/list-product')
  })

  if (!res || res.status !== 200) {
    redirect('/error?code=PRODUCT_LIST_FETCH_FAILED')
  }

  const data = res.data ?? []

  return (
    <Grid container>
      <Grid item xs={12}>
        <ListProduct data={data} token={token} />
      </Grid>
    </Grid>
  )
}

export default ListProductPage
