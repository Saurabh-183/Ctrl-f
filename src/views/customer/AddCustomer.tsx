'use client'

import { useRouter } from 'next/navigation'

import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'

import { Card, CardContent, Grid, Button } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import CustomAutocomplete from '@core/components/mui/Autocomplete'
import AppReactDatepicker from '@/libs/AppReactDatepicker'
import { useCountries } from '@/types/useCountries'

interface CustomerFormValues {
  customerName: string
  customerCode: string
  email: string
  phone: string
  country: string
  whatsapp: string
  address: string

  owner: string
  salesManager: string
  inception: Date | null
  domesticOffices: string
  internationalOffices: string
  turnover: string
  salesTeamPax: string
  employeePax: string
  importVolume: string
  importingSince: Date | null
}

const AddCustomer = ({ token }: { token: string }) => {
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_BASE_URL

  const countries = useCountries()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CustomerFormValues>({
    defaultValues: {
      customerName: '',
      customerCode: '',
      email: '',
      phone: '',
      country: '',
      whatsapp: '',
      address: '',

      owner: '',
      salesManager: '',
      inception: null,
      domesticOffices: '',
      internationalOffices: '',
      turnover: '',
      salesTeamPax: '',
      employeePax: '',
      importVolume: '',
      importingSince: null
    }
  })

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      const payload = {
        customerName: data.customerName,
        customerCode: data.customerCode,
        email: data.email,
        phoneNo: data.phone,
        country: data.country,
        whatsappNo: data.whatsapp,
        address: data.address,

        ownerName: data.owner,
        salesManagerName: data.salesManager,

        inceptionDate: data.inception ? data.inception.toISOString().split('T')[0] : null,

        domesticOffices: Number(data.domesticOffices) || 0,
        internationalOffices: Number(data.internationalOffices) || 0,
        turnoverPerMonth: Number(data.turnover) || 0,
        salesTeamSize: Number(data.salesTeamPax) || 0,
        employeeCount: Number(data.employeePax) || 0,
        importVolumePerMonth: Number(data.importVolume) || 0,

        importingSince: data.importingSince ? data.importingSince.toISOString().split('T')[0] : null,

        isActive: true
      }

      const response = await fetch(`${API_URL}/customer/create-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (response.ok && result.status === 200) {
        toast.success('Customer created successfully!')
        router.push('/customer/list-customer')
      } else {
        toast.error(result.message || 'Failed to create customer')
      }
    } catch (e) {
      toast.error('Something went wrong!')
    }
  }

  return (
    <div>
      <div className='flex my-5'>
        <h1 className='text-[#232F6F] text-xl font-semibold flex items-center gap-2'>
          <span
            className='cursor-pointer flex items-center justify-center'
            onClick={() => router.push('/customer/list-customer')}
          >
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M9.97149 18.1108C10.0939 18.2317 10.1921 18.3776 10.2602 18.5396C10.3284 18.7017 10.365 18.8766 10.3679 19.054C10.3709 19.2314 10.3401 19.4076 10.2774 19.5721C10.2148 19.7366 10.1215 19.886 10.0031 20.0115C9.88479 20.1369 9.74383 20.2358 9.58865 20.3023C9.43347 20.3687 9.26726 20.4014 9.09993 20.3982C8.9326 20.3951 8.76758 20.3563 8.61471 20.2841C8.46184 20.2119 8.32426 20.1078 8.21017 19.978L1.56368 12.932C1.3303 12.6843 1.19922 12.3485 1.19922 11.9984C1.19922 11.6483 1.3303 11.3126 1.56368 11.0649L8.21017 4.01892C8.32426 3.88912 8.46184 3.78501 8.61471 3.71281C8.76758 3.6406 8.9326 3.60177 9.09993 3.59864C9.26726 3.59551 9.43347 3.62814 9.58865 3.69459C9.74382 3.76103 9.88479 3.85993 10.0031 3.98538C10.1215 4.11083 10.2148 4.26027 10.2774 4.42477C10.3401 4.58927 10.3709 4.76547 10.3679 4.94285C10.365 5.12024 10.3284 5.29518 10.2602 5.45724C10.1921 5.61929 10.0939 5.76514 9.97149 5.88609L5.45188 10.6773L21.553 10.6773C21.8835 10.6773 22.2005 10.8165 22.4342 11.0643C22.6679 11.312 22.7992 11.6481 22.7992 11.9984C22.7992 12.3488 22.6679 12.6848 22.4342 12.9326C22.2005 13.1804 21.8835 13.3195 21.553 13.3195L5.45188 13.3196L9.97149 18.1108Z'
                fill='#232F6F'
              />
            </svg>
          </span>
          Customer
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card variant='outlined'>
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='customerName'
                  control={control}
                  rules={{
                    required: 'Customer Name is required',
                    minLength: { value: 3, message: 'Minimum 3 characters required' }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Customer Name*'
                      placeholder='Enter customer name'
                      error={!!errors.customerName}
                      helperText={errors.customerName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='customerCode'
                  control={control}
                  rules={{ required: 'Customer Code is required' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Customer Code*'
                      placeholder='Enter customer code'
                      error={!!errors.customerCode}
                      helperText={errors.customerCode?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='email'
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Email*'
                      placeholder='Email address'
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='phone'
                  control={control}
                  rules={{
                    required: 'Phone number required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Enter valid 10 digit number'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Phone No*'
                      placeholder='Enter phone number'
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='country'
                  control={control}
                  rules={{ required: 'Country is required' }}
                  render={({ field: { value, onChange } }) => (
                    <CustomAutocomplete
                      fullWidth
                      options={countries}
                      value={countries.find(i => i.name === value) || null}
                      onChange={(e, val) => onChange(val?.name || '')}
                      getOptionLabel={o => o?.name || ''}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          label='Country*'
                          placeholder='Select country'
                          error={!!errors.country}
                          helperText={errors.country?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='whatsapp'
                  control={control}
                  rules={{
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Enter valid 10 digit number'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='WhatsApp No.'
                      placeholder='Enter WhatsApp number'
                      error={!!errors.whatsapp}
                      helperText={errors.whatsapp?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name='address'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      multiline
                      rows={2}
                      label='Address'
                      placeholder='Enter address'
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <div className='mt-10 text-[#232F6F] font-semibold'>Business Details</div>

        <Card variant='outlined' className='mt-2'>
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='owner'
                  control={control}
                  rules={{
                    required: 'Owner name is required',
                    minLength: { value: 3, message: 'Minimum 3 characters required' }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Owner*'
                      placeholder='Enter owner name'
                      error={!!errors.owner}
                      helperText={errors.owner?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='salesManager'
                  control={control}
                  rules={{
                    required: 'Sales Manager is required',
                    minLength: { value: 3, message: 'Minimum 3 characters required' }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Sales Manager*'
                      placeholder='Enter sales manager name'
                      error={!!errors.salesManager}
                      helperText={errors.salesManager?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='inception'
                  control={control}
                  rules={{ required: 'Inception date is required' }}
                  render={({ field }) => (
                    <AppReactDatepicker
                      selected={field.value}
                      onChange={field.onChange}
                      customInput={
                        <CustomTextField
                          label='Inception*'
                          fullWidth
                          InputProps={{
                            endAdornment: (
                              <svg
                                width='24'
                                height='24'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                              >
                                <path
                                  d='M2 12C2 8.229 2 6.343 3.172 5.172C4.344 4.001 6.229 4 10 4H14C17.771 4 19.657 4 20.828 5.172C21.999 6.344 22 8.229 22 12V14C22 17.771 22 19.657 20.828 20.828C19.656 21.999 17.771 22 14 22H10C6.229 22 4.343 22 3.172 20.828C2.001 19.656 2 17.771 2 14V12Z'
                                  stroke='#606060'
                                  stroke-width='1.5'
                                />
                                <path
                                  d='M7 4V2.5M17 4V2.5M2.5 9H21.5'
                                  stroke='#606060'
                                  stroke-width='1.5'
                                  stroke-linecap='round'
                                />
                                <path
                                  d='M18 17C18 17.2652 17.8946 17.5196 17.7071 17.7071C17.5196 17.8946 17.2652 18 17 18C16.7348 18 16.4804 17.8946 16.2929 17.7071C16.1054 17.5196 16 17.2652 16 17C16 16.7348 16.1054 16.4804 16.2929 16.2929C16.4804 16.1054 16.7348 16 17 16C17.2652 16 17.5196 16.1054 17.7071 16.2929C17.8946 16.4804 18 16.7348 18 17ZM18 13C18 13.2652 17.8946 13.5196 17.7071 13.7071C17.5196 13.8946 17.2652 14 17 14C16.7348 14 16.4804 13.8946 16.2929 13.7071C16.1054 13.5196 16 13.2652 16 13C16 12.7348 16.1054 12.4804 16.2929 12.2929C16.4804 12.1054 16.7348 12 17 12C17.2652 12 17.5196 12.1054 17.7071 12.2929C17.8946 12.4804 18 12.7348 18 13ZM13 17C13 17.2652 12.8946 17.5196 12.7071 17.7071C12.5196 17.8946 12.2652 18 12 18C11.7348 18 11.4804 17.8946 11.2929 17.7071C11.1054 17.5196 11 17.2652 11 17C11 16.7348 11.1054 16.4804 11.2929 16.2929C11.4804 16.1054 11.7348 16 12 16C12.2652 16 12.5196 16.1054 12.7071 16.2929C12.8946 16.4804 13 16.7348 13 17ZM13 13C13 13.2652 12.8946 13.5196 12.7071 13.7071C12.5196 13.8946 12.2652 14 12 14C11.7348 14 11.4804 13.8946 11.2929 13.7071C11.1054 13.5196 11 13.2652 11 13C11 12.7348 11.1054 12.4804 11.2929 12.2929C11.4804 12.1054 11.7348 12 12 12C12.2652 12 12.5196 12.1054 12.7071 12.2929C12.8946 12.4804 13 12.7348 13 13ZM8 17C8 17.2652 7.89464 17.5196 7.70711 17.7071C7.51957 17.8946 7.26522 18 7 18C6.73478 18 6.48043 17.8946 6.29289 17.7071C6.10536 17.5196 6 17.2652 6 17C6 16.7348 6.10536 16.4804 6.29289 16.2929C6.48043 16.1054 6.73478 16 7 16C7.26522 16 7.51957 16.1054 7.70711 16.2929C7.89464 16.4804 8 16.7348 8 17ZM8 13C8 13.2652 7.89464 13.5196 7.70711 13.7071C7.51957 13.8946 7.26522 14 7 14C6.73478 14 6.48043 13.8946 6.29289 13.7071C6.10536 13.5196 6 13.2652 6 13C6 12.7348 6.10536 12.4804 6.29289 12.2929C6.48043 12.1054 6.73478 12 7 12C7.26522 12 7.51957 12.1054 7.70711 12.2929C7.89464 12.4804 8 12.7348 8 13Z'
                                  fill='#606060'
                                />
                              </svg>
                            )
                          }}
                          error={!!errors.inception}
                          helperText={errors.inception?.message}
                        />
                      }
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='domesticOffices'
                  control={control}
                  rules={{
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'Only numbers allowed'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Domestic Offices'
                      placeholder='Enter number of domestic offices'
                      error={!!errors.domesticOffices}
                      helperText={errors.domesticOffices?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='internationalOffices'
                  control={control}
                  rules={{
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'Only numbers allowed'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='International Offices'
                      placeholder='Enter number of international offices'
                      error={!!errors.internationalOffices}
                      helperText={errors.internationalOffices?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='turnover'
                  control={control}
                  rules={{
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'Only numbers allowed'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Turnover / Month'
                      placeholder='e.g. 50,00,000'
                      error={!!errors.turnover}
                      helperText={errors.turnover?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='salesTeamPax'
                  control={control}
                  rules={{
                    required: 'Sales Team Pax is required',
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'Only numbers allowed'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Sales Team Pax*'
                      placeholder='e.g. 250'
                      error={!!errors.salesTeamPax}
                      helperText={errors.salesTeamPax?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='employeePax'
                  control={control}
                  rules={{
                    required: 'Employee Pax is required',
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'Only numbers allowed'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Employee Pax*'
                      placeholder='e.g. 250'
                      error={!!errors.employeePax}
                      helperText={errors.employeePax?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='importVolume'
                  control={control}
                  rules={{
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'Only numbers allowed'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Import Volume / Month'
                      placeholder='% e.g. 30'
                      error={!!errors.importVolume}
                      helperText={errors.importVolume?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='importingSince'
                  control={control}
                  rules={{ required: 'Importing since date is required' }}
                  render={({ field }) => (
                    <AppReactDatepicker
                      selected={field.value}
                      onChange={field.onChange}
                      customInput={
                        <CustomTextField
                          label='Importing since*'
                          fullWidth
                          InputProps={{
                            endAdornment: (
                              <svg
                                width='24'
                                height='24'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                              >
                                <path
                                  d='M2 12C2 8.229 2 6.343 3.172 5.172C4.344 4.001 6.229 4 10 4H14C17.771 4 19.657 4 20.828 5.172C21.999 6.344 22 8.229 22 12V14C22 17.771 22 19.657 20.828 20.828C19.656 21.999 17.771 22 14 22H10C6.229 22 4.343 22 3.172 20.828C2.001 19.656 2 17.771 2 14V12Z'
                                  stroke='#606060'
                                  stroke-width='1.5'
                                />
                                <path
                                  d='M7 4V2.5M17 4V2.5M2.5 9H21.5'
                                  stroke='#606060'
                                  stroke-width='1.5'
                                  stroke-linecap='round'
                                />
                                <path
                                  d='M18 17C18 17.2652 17.8946 17.5196 17.7071 17.7071C17.5196 17.8946 17.2652 18 17 18C16.7348 18 16.4804 17.8946 16.2929 17.7071C16.1054 17.5196 16 17.2652 16 17C16 16.7348 16.1054 16.4804 16.2929 16.2929C16.4804 16.1054 16.7348 16 17 16C17.2652 16 17.5196 16.1054 17.7071 16.2929C17.8946 16.4804 18 16.7348 18 17ZM18 13C18 13.2652 17.8946 13.5196 17.7071 13.7071C17.5196 13.8946 17.2652 14 17 14C16.7348 14 16.4804 13.8946 16.2929 13.7071C16.1054 13.5196 16 13.2652 16 13C16 12.7348 16.1054 12.4804 16.2929 12.2929C16.4804 12.1054 16.7348 12 17 12C17.2652 12 17.5196 12.1054 17.7071 12.2929C17.8946 12.4804 18 12.7348 18 13ZM13 17C13 17.2652 12.8946 17.5196 12.7071 17.7071C12.5196 17.8946 12.2652 18 12 18C11.7348 18 11.4804 17.8946 11.2929 17.7071C11.1054 17.5196 11 17.2652 11 17C11 16.7348 11.1054 16.4804 11.2929 16.2929C11.4804 16.1054 11.7348 16 12 16C12.2652 16 12.5196 16.1054 12.7071 16.2929C12.8946 16.4804 13 16.7348 13 17ZM13 13C13 13.2652 12.8946 13.5196 12.7071 13.7071C12.5196 13.8946 12.2652 14 12 14C11.7348 14 11.4804 13.8946 11.2929 13.7071C11.1054 13.5196 11 13.2652 11 13C11 12.7348 11.1054 12.4804 11.2929 12.2929C11.4804 12.1054 11.7348 12 12 12C12.2652 12 12.5196 12.1054 12.7071 12.2929C12.8946 12.4804 13 12.7348 13 13ZM8 17C8 17.2652 7.89464 17.5196 7.70711 17.7071C7.51957 17.8946 7.26522 18 7 18C6.73478 18 6.48043 17.8946 6.29289 17.7071C6.10536 17.5196 6 17.2652 6 17C6 16.7348 6.10536 16.4804 6.29289 16.2929C6.48043 16.1054 6.73478 16 7 16C7.26522 16 7.51957 16.1054 7.70711 16.2929C7.89464 16.4804 8 16.7348 8 17ZM8 13C8 13.2652 7.89464 13.5196 7.70711 13.7071C7.51957 13.8946 7.26522 14 7 14C6.73478 14 6.48043 13.8946 6.29289 13.7071C6.10536 13.5196 6 13.2652 6 13C6 12.7348 6.10536 12.4804 6.29289 12.2929C6.48043 12.1054 6.73478 12 7 12C7.26522 12 7.51957 12.1054 7.70711 12.2929C7.89464 12.4804 8 12.7348 8 13Z'
                                  fill='#606060'
                                />
                              </svg>
                            )
                          }}
                          error={!!errors.importingSince}
                          helperText={errors.importingSince?.message}
                        />
                      }
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <div className='flex justify-end gap-4 mt-6'>
          <Button variant='outlined' onClick={() => reset()}>
            Cancel
          </Button>

          <Button variant='contained' type='submit'>
            Save
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AddCustomer
