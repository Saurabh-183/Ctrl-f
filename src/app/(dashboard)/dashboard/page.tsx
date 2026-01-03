'use client'
import { useState } from 'react'

import { Grid, Box, Card, Typography, CardHeader, Divider, CardContent, MenuItem } from '@mui/material'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

import { ComposableMap, Geographies, Geography} from 'react-simple-maps'

import CustomTextField from '@/@core/components/mui/TextField'

import ListRecentQuotation from '@/views/dashboard/ListRecentQuotation'

export default function DashboardPage() {
  const [duration, setDuration] = useState<string>('')

  const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

  const salesData = [
    { name: 'USA', value: '$250K', percent: '22%', code: 'USA' },
    { name: 'India', value: '$150K', percent: '15%', code: 'IND' },
    { name: 'UK', value: '$350K', percent: '35%', code: 'GBR' },
    { name: 'Japan', value: '$90K', percent: '10%', code: 'JPN' },
    { name: 'Germany', value: '$70K', percent: '18%', code: 'DEU' }
  ]

  const cards = [
    {
      icon: <i className='tabler-dashboard' />,
      value: '405',
      title: 'Total Quotations',
      bg: '#E6F2F4',
      circle: '#00879E'
    },
    {
      icon: <i className='tabler-users' />,
      value: '400',
      title: 'Pending Approvals',
      bg: '#F7F3FB',
      circle: '#C68EFD'
    },
    { icon: <i className='tabler-file' />, value: '12,045', title: 'Active PO', bg: '#FAF1F3', circle: '#D76C82' },
    { icon: <i className='tabler-chart-bar' />, value: '200', title: 'Reports', bg: '#F5F9F3', circle: '#5CB338' },
    { icon: <i className='tabler-bolt' />, value: '03', title: 'Open Invoices', bg: '#F3E5F5', circle: '#FFA725' }
  ]

  const quotationPfiData = [
    { day: 'Mon', quotation: 11, pfis: 5 },
    { day: 'Tue', quotation: 7, pfis: 6 },
    { day: 'Wed', quotation: 12, pfis: 9 },
    { day: 'Thu', quotation: 10, pfis: 7 },
    { day: 'Fri', quotation: 14, pfis: 11 },
    { day: 'Sat', quotation: 11, pfis: 6 },
    { day: 'Sun', quotation: 15, pfis: 7 }
  ]

  const customerSalesData = [
    { name: 'Al Futtaim Auto Parts', percent: 42 },
    { name: 'Doha Tyre Traders', percent: 85 },
    { name: 'Qingdao Rubber Co.', percent: 25 },
    { name: 'Shandong Tyre Corp.', percent: 45 },
    { name: 'Nairobi Auto Zone', percent: 89 }
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <div className='flex justify-between'>
          <Typography
            variant='h3'
            sx={{
              fontWeight: 'semi-bold',
              fontSize: '20px'
            }}
          >
            Dashboard
          </Typography>
          <CustomTextField
            select
            id='select-duration'
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className='is-[160px]'
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>7 days</MenuItem>
            <MenuItem value='30'>30 days</MenuItem>
            <MenuItem value='90'>90 days</MenuItem>
          </CustomTextField>
        </div>
      </Grid>
      {/* Single grid item that takes full width */}
      <Grid item xs={12}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)', // 5 equal columns
            gap: 3,
            width: '100%'
          }}
        >
          {cards.map((item, index) => (
            <Card
              variant='outlined'
              key={index}
              sx={{
                backgroundColor: item.bg,
                textAlign: 'center',
                p: 3,
                borderRadius: 1
              }}
            >
              {/* Icon Circle */}
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: item.circle,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  color: '#fff',
                  fontSize: 28
                }}
              >
                {item.icon}
              </Box>

              <Typography variant='h4' fontWeight='bold'>
                {item.value}
              </Typography>

              <Typography variant='body2' color='text.primary' fontWeight='600'>
                {item.title}
              </Typography>
            </Card>
          ))}
        </Box>
      </Grid>
      {/* line chart and world map */}
      <Grid item xs={12}>
        <Grid container spacing={3} alignItems='stretch'>
          {/* LineChart Card */}
          <Grid item xs={12} md={8} lg={8} sx={{ display: 'flex' }}>
            <Card variant='outlined' sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <CardHeader
                title='Quotation vs PFIs'
                titleTypographyProps={{ fontSize: '1rem', fontWeight: '700' }}
                sx={{ pb: 2, pt: 3 }}
              />
              <Divider sx={{ mb: 2 }} />
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={quotationPfiData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                    <CartesianGrid stroke='#eee' />
                    <XAxis dataKey='day' />
                    <YAxis width={30} />
                    <Tooltip />
                    <Legend verticalAlign='bottom' align='left' iconType='line' wrapperStyle={{ paddingTop: 12 }} />
                    <Line
                      type='linear'
                      dataKey='quotation'
                      name='Quotation'
                      stroke='#2F6BFF'
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line type='linear' dataKey='pfis' name='PFIs' stroke='#A259FF' strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Map + Sales Card */}
          <Grid item xs={12} md={4} lg={4} sx={{ display: 'flex' }}>
            <Card variant='outlined' sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <CardHeader
                title='Top Tyre Categories Sold'
                titleTypographyProps={{ fontSize: '1rem', fontWeight: '700' }}
                sx={{ pb: 2, pt: 3 }}
              />
              <Divider sx={{ mb: 2 }} />
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', px: 2, pb: 2, pt: 0 }}>
                  <ComposableMap projectionConfig={{ scale: 140 }}>
                    <Geographies geography={geoUrl}>
                      {({ geographies }) =>
                        geographies.map(geo => {
                          const isActive = salesData.find(item => item.name === geo.properties.name)

                          console.log('geo.properties.ISO_A3: ', geo.properties.name)

return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill={isActive ? '#2F6BFF' : '#E0E0E0'}
                              stroke='#fff'
                            />
                          )
                        })
                      }
                    </Geographies>
                  </ComposableMap>
                </Box>

                {/* Country List */}
                <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, padding: 2 }}>
                  {salesData.map((item, index) => (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography fontSize='0.85rem' fontWeight={600} color='text.primary'>
                          {item.name}
                        </Typography>
                        <Typography fontSize='0.85rem' fontWeight={700} color='text.primary'>
                          {item.value}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ height: 6, borderRadius: '1px', backgroundColor: '#E0E0E0', overflow: 'hidden', mb: 0.5 }}
                      >
                        <Box sx={{ width: item.percent, height: '100%', backgroundColor: '#1976d2' }} />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontSize='0.72rem' color='text.primary'>
                          Total sales
                        </Typography>
                        <Typography fontSize='0.72rem' fontWeight={600} color='text.primary'>
                          {item.percent}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      {/* Sales percentage */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8} lg={4}>
            <Card variant='outlined'>
              <CardHeader
                title='Customer wise sales'
                titleTypographyProps={{
                  fontSize: '1rem',
                  fontWeight: '700'
                }}
                sx={{ pb: 2, pt: 3 }}
              />
              <Divider sx={{ mb: 2 }} />
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                {customerSalesData.map((item, index) => (
                  <Box key={index} sx={{ mb: 1.5 }}>
                    {/* Customer name + percentage */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography fontSize='0.85rem' fontWeight={700} color='text.primary'>
                        {item.name}
                      </Typography>
                      <Typography fontSize='0.85rem' fontWeight={700}>
                        {item.percent}%
                      </Typography>
                    </Box>

                    {/* Progress bar */}
                    <Box
                      sx={{
                        width: '100%',
                        height: 10,
                        backgroundColor: '#E0E0E0',
                        borderRadius: '1px',
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: `${item.percent}%`,
                          height: '100%',
                          backgroundColor: '#8C74FF',
                          borderRadius: '1px'
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8} lg={4}>
            <Card variant='outlined'>
              <CardHeader
                title='RM wise sales'
                titleTypographyProps={{
                  fontSize: '1rem',
                  fontWeight: '700'
                }}
                sx={{ pb: 2, pt: 3 }}
              />
              <Divider sx={{ mb: 2 }} />
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                {customerSalesData.map((item, index) => (
                  <Box key={index} sx={{ mb: 1.5 }}>
                    {/* Customer name + percentage */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography fontSize='0.85rem' fontWeight={700} color='text.primary'>
                        {item.name}
                      </Typography>
                      <Typography fontSize='0.85rem' fontWeight={700}>
                        {item.percent}%
                      </Typography>
                    </Box>

                    {/* Progress bar */}
                    <Box
                      sx={{
                        width: '100%',
                        height: 10,
                        backgroundColor: '#E0E0E0',
                        borderRadius: '1px',
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: `${item.percent}%`,
                          height: '100%',
                          backgroundColor: '#7996A5',
                          borderRadius: '1px'
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8} lg={4}>
            <Card variant='outlined'>
              <CardHeader
                title='Brand wise sales'
                titleTypographyProps={{
                  fontSize: '1rem',
                  fontWeight: '700'
                }}
                sx={{ pb: 2, pt: 3 }}
              />
              <Divider sx={{ mb: 2 }} />
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                {customerSalesData.map((item, index) => (
                  <Box key={index} sx={{ mb: 1.5 }}>
                    {/* Customer name + percentage */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography fontSize='0.85rem' fontWeight={700} color='text.primary'>
                        {item.name}
                      </Typography>
                      <Typography fontSize='0.85rem' fontWeight={700}>
                        {item.percent}%
                      </Typography>
                    </Box>

                    {/* Progress bar */}
                    <Box
                      sx={{
                        width: '100%',
                        height: 10,
                        backgroundColor: '#E0E0E0',
                        borderRadius: '1px',
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: `${item.percent}%`,
                          height: '100%',
                          backgroundColor: '#3370FF',
                          borderRadius: '1px'
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      {/* table */}
      <Grid item xs={12}>
        <ListRecentQuotation data={[]} />
      </Grid>
    </Grid>
  )
}
