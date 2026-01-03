'use client'

import { useEffect, useState } from 'react'

import { useRouter, useParams } from 'next/navigation'

import { IconPlus } from '@tabler/icons-react'

import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { toast } from 'react-toastify'

import { Card, CardContent, Grid, Button, IconButton } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import CustomAutocomplete from '@core/components/mui/Autocomplete'
import AppReactDatepicker from '@/libs/AppReactDatepicker'
import { useCountries } from '@/types/useCountries'

interface SupplierFormValues {
  supplierName: string
  supplierCode: string
  email: string
  phone: string
  country: string
  whatsapp: string
  wechat: string
  brandSupplies: number[]
  address: string

  owner: string
  salesManager: string
  inception: Date | null
  employeePax: string
  domesticOffices: string
  internationalOffices: string
  turnover: string
  exportPercent: string

  paymentTerms: string
  bankName: string
  accountNo: string
  ifsc: string
  focusCategory: number[]

  production: {
    category: number | ''
    capacity: string
  }[]
}

const UpdateSupplier = ({ token }: { token: string }) => {
  const router = useRouter()
  const params = useParams()
  const supplierId = params.id

  const API_URL = process.env.NEXT_PUBLIC_BASE_URL
  const [focusCategories, setFocusCategories] = useState<any[]>([])
  const [paymentTerms, setPaymentTerms] = useState<any[]>([])
  const [brandList, setBrandList] = useState<any[]>([])

  const countries = useCountries()

  useEffect(() => {
    setPaymentTerms([
      { id: 1, name: '30/70' },
      { id: 2, name: 'LC' },
      { id: 3, name: 'TT' }
    ])

    fetchCategories()
    fetchBrand()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (supplierId && focusCategories.length >= 0 && brandList.length >= 0) {
      fetchSupplierDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId, focusCategories, brandList])

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/category/category-list`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const result = await res.json()

      const formatted = (result.data || []).map((c: any) => ({
        id: c.id,
        name: c.categoryName
      }))

      setFocusCategories(formatted)
    } catch (err) {
      console.error('Error fetching categories', err)
    }
  }

  const fetchBrand = async () => {
    try {
      const res = await fetch(`${API_URL}/brand/brand-list`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const result = await res.json()

      const formatted = (result.data || []).map((p: any) => ({
        id: p.id,
        name: p.brandName.trim()
      }))

      setBrandList(formatted)
    } catch (err) {
      console.error('Error fetching brands', err)
    }
  }


  const formatIndianNumber = (value: string) => {
    const num = value.replace(/\D/g, '')

    return num.replace(/\B(?=(\d{2})+(?!\d))/g, ',')
  }



  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SupplierFormValues>({
    defaultValues: {
      supplierName: '',
      supplierCode: '',
      email: '',
      phone: '',
      country: '',
      whatsapp: '',
      wechat: '',
      brandSupplies: [],
      address: '',
      owner: '',
      salesManager: '',
      inception: null,
      employeePax: '',
      domesticOffices: '',
      internationalOffices: '',
      turnover: '',
      exportPercent: '',
      paymentTerms: '',
      bankName: '',
      accountNo: '',
      ifsc: '',
      focusCategory: [],
      production: [{ category: '', capacity: '' }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    name: 'production',
    control
  })

  const fetchSupplierDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/supplier/supplier-detail-list?id=${supplierId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const s = (await res.json())?.data

      if (!s) return

      const productionMapped = (s.productionDetails || []).map((p: any) => ({
        category: p.categoryId ?? '',
        capacity: p.productionCapacity ?? ''
      }))

      reset({
        supplierName: s.supplierName || '',
        supplierCode: s.supplierCode || '',
        email: s.email || '',
        phone: s.phoneNo || '',
        country: (s.country || '').toLowerCase().trim(),
        whatsapp: s.whatsappNo || '',
        wechat: s.wechatId || '',
        brandSupplies: (s.brandSupplies || []).map((b: any) => b.id),
        address: s.address || '',
        owner: s.ownerName || '',
        salesManager: s.salesManagerName || '',
        inception: s.inceptionDate ? new Date(s.inceptionDate) : null,
        employeePax: String(s.employeePax ?? ''),
        domesticOffices: String(s.domesticOffices || ''),
        internationalOffices: String(s.internationalOffices || ''),
        turnover: String(s.turnoverPerMonth || ''),
        exportPercent: String(s.exportProduction || ''),
        paymentTerms: s.paymentTerms || '',
        bankName: s.bankName || '',
        accountNo: s.accountNo || '',
        ifsc: s.ifscCode || '',
        focusCategory: [],
        production: productionMapped.length ? productionMapped : [{ category: '', capacity: '' }]
      })
    } catch (error) {
      console.error('Error fetching supplier detail:', error)
    }
  }

  const onSubmit = async (data: SupplierFormValues) => {
    const payload = {
      id: Number(supplierId),

      supplierName: data.supplierName,
      supplierCode: data.supplierCode,
      email: data.email,
      phoneNo: data.phone,

      country: data.country?.toLowerCase().trim() || null,

      whatsappNo: data.whatsapp,
      wechatId: data.wechat,

      brandSupplies: data.brandSupplies.map(id => String(id)),

      address: data.address,
      ownerName: data.owner,
      salesManagerName: data.salesManager,

      inceptionDate: data.inception ? data.inception.toISOString().split('T')[0] : null,

      domesticOffices: Number(data.domesticOffices),
      internationalOffices: Number(data.internationalOffices),
      turnoverPerMonth: Number(data.turnover.replace(/,/g, '')),
      exportProduction: Number(data.exportPercent),

      paymentTerms: data.paymentTerms,
      bankName: data.bankName,
      accountNo: data.accountNo,

      employeePax: data.employeePax,

      ifscCode: data.ifsc,

      productionDetails: data.production
        .filter(p => p.category && p.capacity)
        .map(p => ({
          category: p.category,
          productionCapacity: p.capacity
        })),

      isActive: true
    }

    try {
      const response = await fetch(`${API_URL}/supplier/update-supplier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (response.ok && result.status === 200) {
        toast.success('Supplier updated successfully!')
        router.push('/supplier/list-supplier')
      } else {
        toast.error(result.message || 'Failed to update supplier')
      }
    } catch (e) {
      console.error('Update error', e)
      toast.error('Something went wrong!')
    }
  }

  return (
    <div>
      <div className='flex my-5'>
        <h1 className='text-[#232F6F] text-xl font-semibold flex items-center gap-2'>
          <span
            className='cursor-pointer flex items-center justify-center'
            onClick={() => router.push('/supplier/list-supplier')}
          >
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M9.97149 18.1108C10.0939 18.2317 10.1921 18.3776 10.2602 18.5396C10.3284 18.7017 10.365 18.8766 10.3679 19.054C10.3709 19.2314 10.3401 19.4076 10.2774 19.5721C10.2148 19.7366 10.1215 19.886 10.0031 20.0115C9.88479 20.1369 9.74383 20.2358 9.58865 20.3023C9.43347 20.3687 9.26726 20.4014 9.09993 20.3982C8.9326 20.3951 8.76758 20.3563 8.61471 20.2841C8.46184 20.2119 8.32426 20.1078 8.21017 19.978L1.56368 12.932C1.3303 12.6843 1.19922 12.3485 1.19922 11.9984C1.19922 11.6483 1.3303 11.3126 1.56368 11.0649L8.21017 4.01892C8.32426 3.88912 8.46184 3.78501 8.61471 3.71281C8.76758 3.6406 8.9326 3.60177 9.09993 3.59864C9.26726 3.59551 9.43347 3.62814 9.58865 3.69459C9.74382 3.76103 9.88479 3.85993 10.0031 3.98538C10.1215 4.11083 10.2148 4.26027 10.2774 4.42477C10.3401 4.58927 10.3709 4.76547 10.3679 4.94285C10.365 5.12024 10.3284 5.29518 10.2602 5.45724C10.1921 5.61929 10.0939 5.76514 9.97149 5.88609L5.45188 10.6773L21.553 10.6773C21.8835 10.6773 22.2005 10.8165 22.4342 11.0643C22.6679 11.312 22.7992 11.6481 22.7992 11.9984C22.7992 12.3488 22.6679 12.6848 22.4342 12.9326C22.2005 13.1804 21.8835 13.3195 21.553 13.3195L5.45188 13.3196L9.97149 18.1108Z'
                fill='#232F6F'
              />
            </svg>
          </span>
          Update Supplier
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card variant='outlined'>
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='supplierName'
                  control={control}
                  rules={{
                    required: 'Supplier Name is required',
                    minLength: { value: 3, message: 'Minimum 3 characters required' }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Supplier Name*'
                      placeholder='Enter supplier name'
                      error={!!errors.supplierName}
                      helperText={errors.supplierName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='supplierCode'
                  control={control}
                  rules={{ required: 'Supplier Code is required' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Supplier Code*'
                      placeholder='Enter supplier code'
                      error={!!errors.supplierCode}
                      helperText={errors.supplierCode?.message}
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
                      placeholder='Enter email'
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
                  render={({ field }) => (
                    <CustomAutocomplete
                      fullWidth
                      options={countries}
                      value={
                        countries.find(
                          c => c.name && c.name.toLowerCase().trim() === (field.value ?? '').toLowerCase().trim()
                        ) || null
                      }
                      onChange={(_, val) => field.onChange(val ? val.name.toLowerCase().trim() : '')}
                      isOptionEqualToValue={(option, value) =>
                        option.name?.toLowerCase() === value?.name?.toLowerCase()
                      }
                      getOptionLabel={option => option?.name || ''}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          label='Origin'
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
                      message: 'Enter valid 10 digit whatspp number'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='WhatsApp'
                      placeholder='Enter WhatsApp number'
                      error={!!errors.whatsapp}
                      helperText={errors.whatsapp?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='wechat'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth label='WeChat ID' placeholder='WeChat ID (if any)' />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='brandSupplies'
                  control={control}
                  rules={{ required: 'Brand is required' }}
                  render={({ field: { value, onChange } }) => (
                    <CustomAutocomplete
                      multiple
                      fullWidth
                      options={brandList}
                      value={brandList.filter(b => value?.includes(b.id))}
                      onChange={(e, val) => onChange(val.map((v: any) => v.id))}
                      getOptionLabel={o => o?.name || ''}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          label='Brand*'
                          placeholder='Select brands'
                          error={!!errors.brandSupplies}
                          helperText={errors.brandSupplies?.message}
                        />
                      )}
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
                      placeholder='Enter supplier address'
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <div className='mt-10 mb-2 text-[#232F6F] font-semibold'>Business Details</div>

        <Card variant='outlined'>
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='owner'
                  control={control}
                  rules={{ required: 'Owner name required' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Owner*'
                      placeholder='Owner name'
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
                  rules={{ required: 'Sales Manager required' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Sales Manager*'
                      placeholder='Sales manager name'
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
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value)}
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
                    required: 'Turnover is required',
                    validate: value => /^\d+(,\d+)*$/.test(value) || 'Invalid amount'
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      fullWidth
                      label='Turnover / Month'
                      placeholder='e.g. 50,00,000'
                      value={field.value}
                      onChange={e => {
                        const raw = e.target.value.replace(/,/g, '')

                        if (/^\d*$/.test(raw)) {
                          field.onChange(formatIndianNumber(raw))
                        }
                      }}
                      error={!!errors.turnover}
                      helperText={errors.turnover?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='exportPercent'
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
                      label='Export % of Production'
                      placeholder='% e.g. 30'
                      error={!!errors.exportPercent}
                      helperText={errors.exportPercent?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='paymentTerms'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <CustomAutocomplete
                      options={paymentTerms}
                      fullWidth
                      value={paymentTerms.find(i => i.name === value) || null}
                      onChange={(e, val) => onChange(val?.name)}
                      getOptionLabel={o => o?.name || ''}
                      renderInput={params => (
                        <CustomTextField {...params} label='Payment Terms' placeholder='Select payment terms' />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='bankName'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth label='Bank Detail' placeholder='Enter bank name' />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='accountNo'
                  control={control}
                  rules={{
                    required: 'Account number is required',
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'Only numbers allowed'
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Account No.'
                      placeholder='Enter account number'
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                      onChange={e => {
                        const value = e.target.value.replace(/\D/g, '')

                        field.onChange(value)
                      }}
                      error={!!errors.accountNo}
                      helperText={errors.accountNo?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='ifsc'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth label='IFSC Code' placeholder='IFSC code' />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <div className='text-[#232F6F] font-semibold mt-5 mb-1 flex items-center gap-2'>Production capacity</div>

        <Card variant='outlined' className='p-4'>
          {fields.map((item, index) => (
            <div key={item.id} className='mb-4 last:mb-0'>
              <div className='flex items-center gap-4'>
                <div className='flex-1'>
                  <Controller
                    name={`production.${index}.category`}
                    control={control}
                    render={({ field }) => (
                      <CustomAutocomplete
                        fullWidth
                        options={focusCategories}
                        value={focusCategories.find(i => i.id === field.value) || null}
                        onChange={(e, val) => field.onChange(val?.id)}
                        getOptionLabel={o => o?.name || ''}
                        renderInput={params => (
                          <CustomTextField {...params} label='Category' placeholder='Select category' />
                        )}
                      />
                    )}
                  />
                </div>

                <div className='flex-1'>
                  <Controller
                    name={`production.${index}.capacity`}
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Production Capacity'
                        placeholder='Enter capacity units'
                      />
                    )}
                  />
                </div>

                <div className='flex items-center mt-4'>
                  {index === 0 ? (
                    <IconButton
                      onClick={() => append({ category: '', capacity: '' })}
                      sx={{ border: '1px solid #D0D5DD', background: '#EEF7FF', width: 32, height: 32 }}
                    >
                      <IconPlus size={16} color='#1171B2' />
                    </IconButton>
                  ) : (
                    <IconButton
                      onClick={() => remove(index)}
                      sx={{ border: '1px solid #D0D5DD', background: '#FEECEC', width: 32, height: 32 }}
                    >
                      <span style={{ fontSize: 22, color: '#D92D20' }}>−</span>
                    </IconButton>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Card>

        <div className='flex justify-end gap-4 mt-6'>
          <Button variant='outlined' onClick={() => reset()}>
            Cancel
          </Button>
          <Button variant='contained' type='submit'>
            Update Supplier
          </Button>
        </div>
      </form>
    </div>
  )
}

export default UpdateSupplier
