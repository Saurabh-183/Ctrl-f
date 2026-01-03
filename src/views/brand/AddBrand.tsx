'use client'

import React from 'react'

import { useRouter } from 'next/navigation'

import { useForm, Controller } from 'react-hook-form'

import { toast } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'

import { Card, CardContent, Grid, Button, Typography } from '@mui/material'

import { useCountries } from '@/types/useCountries'

import CustomTextField from '@core/components/mui/TextField'

import CustomAutocomplete from '@core/components/mui/Autocomplete'

type FormValues = {
  brandName: string
  manufacturer: string
  origin: string
  headOffice: string

  // focusCategory: number[]
  // products: number[]
  // segment: number
}

interface CreateBrandProps {
  token: string
}

const CreateBrand: React.FC<CreateBrandProps> = ({ token }) => {
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_BASE_URL

  // const [focusCategories, setFocusCategories] = useState<any[]>([])
  // const [productList, setProductList] = useState<any[]>([])
  // const [segments, setSegments] = useState<any[]>([])

  const countries = useCountries()

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      brandName: '',
      manufacturer: '',
      origin: '',
      headOffice: ''

      // focusCategory: [],
      // products: [],
      // segment: 0
    }
  })


  // const fetchCategories = useCallback(async () => {
  //   const res = await fetch(`${API_URL}/category/category-list`, {
  //     headers: { Authorization: `Bearer ${token}` }
  //   })
  //
  //   const result = await res.json()
  //
  //   const formatted = (result.data || []).map((c: any) => ({
  //     id: c.id,
  //     name: c.categoryName
  //   }))
  //
  //   setFocusCategories(formatted)
  // }, [API_URL, token])
  //
  // const fetchProducts = useCallback(async () => {
  //   const res = await fetch(`${API_URL}/product/product-list`, {
  //     headers: { Authorization: `Bearer ${token}` }
  //   })
  //
  //   const result = await res.json()
  //
  //   const formatted = (result.data || []).map((p: any) => ({
  //     id: p.id,
  //     name: p.productType.trim()
  //   }))
  //
  //   setProductList(formatted)
  // }, [API_URL, token])


  // useEffect(() => {
  //   fetchCategories()
  //   fetchProducts()
  //
  //   setSegments([
  //     { id: 1, name: 'Mid Segment' },
  //     { id: 2, name: 'Economy' },
  //     { id: 3, name: 'Cheaper Economy' },
  //     { id: 4, name: 'Super Premium' }
  //   ])
  // }, [fetchCategories, fetchProducts])


  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch(`${API_URL}/brand/create-brand`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          isActive: true
        })
      })

      const result = await response.json()

      if (response.ok && result.status === 200) {
        toast.success('Brand added successfully!')
        reset()
        router.push('/brand/list-brand')
      } else {
        toast.error(result.message || 'Failed to add brand.')
      }
    } catch (error) {
      console.error('Error creating brand:', error)
      toast.error('Something went wrong!')
    }
  }

  return (
    <div>
      <div className='flex my-5'>
        <h1 className='text-[#232F6F] text-xl font-semibold flex items-center gap-2'>
          <span
            className='cursor-pointer flex items-center justify-center'
            onClick={() => router.push('/brand/list-brand')}
          >
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M9.97149 18.1108C10.0939 18.2317 10.1921 18.3776 10.2602 18.5396C10.3284 18.7017 10.365 18.8766 10.3679 19.054C10.3709 19.2314 10.3401 19.4076 10.2774 19.5721C10.2148 19.7366 10.1215 19.886 10.0031 20.0115C9.88479 20.1369 9.74383 20.2358 9.58865 20.3023C9.43347 20.3687 9.26726 20.4014 9.09993 20.3982C8.9326 20.3951 8.76758 20.3563 8.61471 20.2841C8.46184 20.2119 8.32426 20.1078 8.21017 19.978L1.56368 12.932C1.3303 12.6843 1.19922 12.3485 1.19922 11.9984C1.19922 11.6483 1.3303 11.3126 1.56368 11.0649L8.21017 4.01892C8.32426 3.88912 8.46184 3.78501 8.61471 3.71281C8.76758 3.6406 8.9326 3.60177 9.09993 3.59864C9.26726 3.59551 9.43347 3.62814 9.58865 3.69459C9.74382 3.76103 9.88479 3.85993 10.0031 3.98538C10.1215 4.11083 10.2148 4.26027 10.2774 4.42477C10.3401 4.58927 10.3709 4.76547 10.3679 4.94285C10.365 5.12024 10.3284 5.29518 10.2602 5.45724C10.1921 5.61929 10.0939 5.76514 9.97149 5.88609L5.45188 10.6773L21.553 10.6773C21.8835 10.6773 22.2005 10.8165 22.4342 11.0643C22.6679 11.312 22.7992 11.6481 22.7992 11.9984C22.7992 12.3488 22.6679 12.6848 22.4342 12.9326C22.2005 13.1804 21.8835 13.3195 21.553 13.3195L5.45188 13.3196L9.97149 18.1108Z'
                fill='#232F6F'
              />
            </svg>
          </span>
          Brand
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card variant='outlined'>
          <Typography variant='h6' className='py-4 px-6 border-b'>
            Brand Details
          </Typography>

          <CardContent>
            <Grid container spacing={6}>
              {/* Brand Name */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name='brandName'
                  control={control}
                  rules={{ required: 'Brand Name is required.' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Brand Name*'
                      placeholder='Enter brand name'
                      error={!!errors.brandName}
                      helperText={errors.brandName?.message}
                    />
                  )}
                />
              </Grid>

              {/* Manufacturer */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name='manufacturer'
                  control={control}
                  rules={{ required: 'Manufacturer is required.' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Manufacturer*'
                      placeholder='Enter manufacturer name'
                      error={!!errors.manufacturer}
                      helperText={errors.manufacturer?.message}
                    />
                  )}
                />
              </Grid>

              {/* Origin Country */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name='origin'
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
                          label='Origin*'
                          placeholder='Select country'
                          error={!!errors.origin}
                          helperText={errors.origin?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* Head Office */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name='headOffice'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth label='Head Office' placeholder='Enter head office' />
                  )}
                />
              </Grid>

              {/*<Grid item xs={12} sm={6}>*/}
              {/* <Controller*/}
              {/* name='focusCategory'*/}
              {/* control={control}*/}
              {/* render={({ field: { value, onChange } }) => (*/}
              {/* <CustomAutocomplete*/}
              {/* multiple*/}
              {/* fullWidth*/}
              {/* options={focusCategories}*/}
              {/* value={focusCategories.filter(i => value.includes(i.id))}*/}
              {/* onChange={(e, val) => onChange(val.map(i => i.id))}*/}
              {/* getOptionLabel={o => o?.name || ''}*/}
              {/* renderInput={params => (*/}
              {/* <CustomTextField {...params} label='Focus Category' placeholder='Select focus category' />*/}
              {/* )}*/}
              {/* />*/}
              {/* )}*/}
              {/* />*/}
              {/*</Grid>*/}

              {/*<Grid item xs={12} sm={6}>*/}
              {/* <Controller*/}
              {/* name='products'*/}
              {/* control={control}*/}
              {/* render={({ field: { value, onChange } }) => (*/}
              {/* <CustomAutocomplete*/}
              {/* multiple*/}
              {/* fullWidth*/}
              {/* options={productList}*/}
              {/* value={productList.filter(i => value.includes(i.id))}*/}
              {/* onChange={(e, val) => onChange(val.map(i => i.id))}*/}
              {/* getOptionLabel={o => o?.name || ''}*/}
              {/* renderInput={params => (*/}
              {/* <CustomTextField {...params} label='Products' placeholder='Select products' />*/}
              {/* )}*/}
              {/* />*/}
              {/* )}*/}
              {/* />*/}
              {/*</Grid>*/}

              {/*<Grid item xs={12} sm={6}>*/}
              {/* <Controller*/}
              {/* name='segment'*/}
              {/* control={control}*/}
              {/* render={({ field: { value, onChange } }) => (*/}
              {/* <CustomAutocomplete*/}
              {/* fullWidth*/}
              {/* options={segments}*/}
              {/* value={segments.find(i => i.name === value) || null}*/}
              {/* onChange={(e, val) => onChange(val?.name || '')}*/}
              {/* getOptionLabel={o => o?.name || ''}*/}
              {/* renderInput={params => (*/}
              {/* <CustomTextField {...params} label='Segment' placeholder='Select segment' />*/}
              {/* )}*/}
              {/* />*/}
              {/* )}*/}
              {/* />*/}
              {/*</Grid>*/}
            </Grid>
          </CardContent>
        </Card>

        {/* Footer Buttons */}
        <Grid item xs={12} className='flex justify-end gap-4 mt-6'>
          <Button variant='outlined' onClick={() => reset()} sx={{ minWidth: 120 }}>
            Cancel
          </Button>

          <Button variant='contained' type='submit' sx={{ minWidth: 120 }}>
            Save
          </Button>
        </Grid>
      </form>
    </div>
  )
}

export default CreateBrand
