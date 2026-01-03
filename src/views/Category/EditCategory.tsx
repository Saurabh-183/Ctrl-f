'use client'
import React, { useEffect } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { Button, Grid } from '@mui/material'

import { Controller, useForm } from 'react-hook-form'

import { toast } from 'react-toastify'

import CustomTextField from '@/@core/components/mui/TextField'
import type { CategoryData } from '@/services/category'

export type FormValues = {

  // productType: number | null
  categoryName: string

  // subCategory: number | null
}

interface EditCategoryPageProps {
  token: string
  categoryData?: CategoryData
}

const EditCategoryPage: React.FC<EditCategoryPageProps> = ({ token, categoryData }) => {
  const router = useRouter()
  const params = useParams<{ id: string }>()


  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {

      // productType: null,
      categoryName: '',

      // subCategory: null
    }
  })

  useEffect(() => {
    if (categoryData) {
      reset({

        // productType: categoryData.productType ?? null,

        categoryName: categoryData.categoryName ?? '',

        // subCategory: categoryData.subCategory ?? null
      })
    }
  }, [categoryData, reset])

  // const fetchProducts = useCallback(async () => {
  //   try {
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/product/product-list`, {
  //       headers: {
  //         Accept: 'application/json',
  //         Authorization: `Bearer ${token}`
  //       }
  //     })
  //
  //     if (response.ok) {
  //       const res = await response.json()
  //
  //       setProductList(res?.data || [])
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }, [token])

  // const fetchSubCategory = useCallback(async () => {
  //   try {
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/sub-category/sub-category-list?status=active`, {
  //       headers: {
  //         Accept: 'application/json',
  //         Authorization: `Bearer ${token}`
  //       }
  //     })
  //
  //     if (response.ok) {
  //       const res = await response.json()
  //
  //       setSubCategoryList(res?.data || [])
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }, [token])

  // useEffect(() => {
  //   fetchProducts()
  //   fetchSubCategory()
  // }, [fetchProducts, fetchSubCategory])

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        id: Number(params.id),

        // productType: String(data.productType),
        categoryName: data.categoryName,

        // subCategory: data.subCategory ? String(data.subCategory) : null,
        isActive: true
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/category/update-category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const res = await response.json()

      if (!response.ok || res.status !== 200) {
        toast.error(res.message || 'Failed to update category')

      return
      }

      toast.success('Category updated successfully!')
      router.push('/listcategory')
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong!')
    }
  }

  return (
    <>
      <div className='flex mb-5'>
        <h1 className='text-[#232F6F] text-xl font-semibold flex items-center gap-2'>
          <span
            className='cursor-pointer flex items-center justify-center'
            onClick={() => router.push('/listcategory')}
          >
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M9.97149 18.1108C10.0939 18.2317 10.1921 18.3776 10.2602 18.5396C10.3284 18.7017 10.365 18.8766 10.3679 19.054C10.3709 19.2314 10.3401 19.4076 10.2774 19.5721C10.2148 19.7366 10.1215 19.886 10.0031 20.0115C9.88479 20.1369 9.74383 20.2358 9.58865 20.3023C9.43347 20.3687 9.26726 20.4014 9.09993 20.3982C8.9326 20.3951 8.76758 20.3563 8.61471 20.2841C8.46184 20.2119 8.32426 20.1078 8.21017 19.978L1.56368 12.932C1.3303 12.6843 1.19922 12.3485 1.19922 11.9984C1.19922 11.6483 1.3303 11.3126 1.56368 11.0649L8.21017 4.01892C8.32426 3.88912 8.46184 3.78501 8.61471 3.71281C8.76758 3.6406 8.9326 3.60177 9.09993 3.59864C9.26726 3.59551 9.43347 3.62814 9.58865 3.69459C9.74382 3.76103 9.88479 3.85993 10.0031 3.98538C10.1215 4.11083 10.2148 4.26027 10.2774 4.42477C10.3401 4.58927 10.3709 4.76547 10.3679 4.94285C10.365 5.12024 10.3284 5.29518 10.2602 5.45724C10.1921 5.61929 10.0939 5.76514 9.97149 5.88609L5.45188 10.6773L21.553 10.6773C21.8835 10.6773 22.2005 10.8165 22.4342 11.0643C22.6679 11.312 22.7992 11.6481 22.7992 11.9984C22.7992 12.3488 22.6679 12.6848 22.4342 12.9326C22.2005 13.1804 21.8835 13.3195 21.553 13.3195L5.45188 13.3196L9.97149 18.1108Z'
                fill='#232F6F'
              />
            </svg>
          </span>
          {categoryData ? ' Update Category' : ' Create Category'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <div className='border border-gray-300 rounded-md bg-white p-4'>
              <Grid container spacing={6}>

                {/*<Grid item xs={12} sm={6}>*/}
                {/*  <Controller*/}
                {/*    name='productType'*/}
                {/*    control={control}*/}
                {/*    rules={{ required: true }}*/}
                {/*    render={({ field: { value, onChange } }) => (*/}
                {/*      <CustomAutocomplete*/}
                {/*        fullWidth*/}
                {/*        options={productList}*/}
                {/*        value={value ? productList.find(p => p.id === value) || null : null}*/}
                {/*        onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}*/}
                {/*        isOptionEqualToValue={(option, val) => option.id === val?.id}*/}
                {/*        getOptionLabel={option => option.productType || ''}*/}
                {/*        renderInput={params => (*/}
                {/*          <CustomTextField*/}
                {/*            {...params}*/}
                {/*            placeholder='Select Product Type'*/}
                {/*            label='Product Type*'*/}
                {/*            error={!!errors.productType}*/}
                {/*            helperText={errors.productType && 'This field is required.'}*/}
                {/*          />*/}
                {/*        )}*/}
                {/*      />*/}
                {/*    )}*/}
                {/*  />*/}
                {/*</Grid>*/}

                <Grid item xs={12} sm={12}>
                  <Controller
                    name='categoryName'
                    control={control}
                    rules={{ required: 'This field is required.' }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Category Name*'
                        placeholder='Enter Category Name'
                        error={!!errors.categoryName}
                        helperText={errors.categoryName?.message}
                      />
                    )}
                  />
                </Grid>

                {/*<Grid item xs={12} sm={6}>*/}
                {/*  <Controller*/}
                {/*    name='subCategory'*/}
                {/*    control={control}*/}
                {/*    render={({ field: { value, onChange } }) => (*/}
                {/*      <CustomAutocomplete*/}
                {/*        fullWidth*/}
                {/*        options={subCategoryList}*/}
                {/*        value={value ? subCategoryList.find(p => p.id === value) || null : null}*/}
                {/*        onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}*/}
                {/*        isOptionEqualToValue={(option, val) => option.id === val?.id}*/}
                {/*        getOptionLabel={o => o.subCategory}*/}
                {/*        renderInput={params => (*/}
                {/*          <CustomTextField {...params} placeholder='Select Sub Category' label='Sub Category' />*/}
                {/*        )}*/}
                {/*      />*/}
                {/*    )}*/}
                {/*  />*/}
                {/*</Grid>*/}

              </Grid>
            </div>
          </Grid>

          <Grid item xs={12} className='flex justify-end gap-4 mt-6'>
            <Button variant='tonal' color='secondary' type='reset' onClick={() => reset()} sx={{ minWidth: 120 }}>
              Cancel
            </Button>
            <Button variant='contained' type='submit' sx={{ minWidth: 120 }}>
              {categoryData ? 'Update' : 'Save'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  )
}

export default EditCategoryPage
