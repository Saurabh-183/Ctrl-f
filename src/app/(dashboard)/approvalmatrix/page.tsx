import { redirect } from 'next/navigation'

import { cookies } from 'next/headers'

import Grid from '@mui/material/Grid'

import ApprovalMatrixPage from '@views/ApprovalMatrix/AddApprovalMatrix'

const approvalmatrix = () => {
  const token = cookies().get('accessToken')?.value

  if (!token) {
    redirect('/login')
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ApprovalMatrixPage ansh={token!} />
      </Grid>
    </Grid>
  )
}

export default approvalmatrix
