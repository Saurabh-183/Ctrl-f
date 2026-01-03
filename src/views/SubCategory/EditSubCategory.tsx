'use client'

import React, { useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

import { Grid, Card, CardContent, Button, Typography, MenuItem } from '@mui/material'

import { Controller, useForm } from 'react-hook-form'

import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'

interface EditSubCategoryProps {
  ansh: string
}

interface CategoryData {
  id: number
  categoryName: string
}

const API_URL = process.env.NEXT_PUBLIC_BASE_URL

export default function EditSubCategoryPage({ ansh }: EditSubCategoryProps) {

  // eslint-disable-next-line import/no-named-as-default-member
  const [categoryList, setCategoryList] = React.useState<CategoryData[]>([])
  // eslint-disable-next-line import/no-named-as-default-member
  const [subCategoryData, setSubCategoryData] = React.useState<any>(null)
  const router = useRouter()
  const params = useParams()
  const subCategoryId = params?.id

  const { control, handleSubmit, reset } = useForm<{
    subCategoryTitle: string
    categoryId: string
  }>({
    defaultValues: {
      subCategoryTitle: '',
      categoryId: ''
    }
  })


  useEffect(() => {
    if (!subCategoryId) return

    const fetchSubCategoryDetail = async () => {
      const res = await fetch(`${API_URL}/sub-category/sub-category-detail-list?id=${subCategoryId}`, {
        headers: {
          Authorization: `Bearer ${ansh}`,
          Accept: 'application/json'
        }
      })

      const result = await res.json()

      if (res.ok && result.status === 200) {
        setSubCategoryData(result.data)
      }
    }

    fetchSubCategoryDetail()
  }, [subCategoryId, ansh])


  // eslint-disable-next-line react-hooks/exhaustive-deps,import/no-named-as-default-member
  const fetchCategories = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/category/category-list`, {
        headers: {
          Authorization: `Bearer ${ansh}`,
          Accept: 'application/json'
        }
      })

      const result = await res.json()

      if (res.ok && result.status === 200) {
        const data = Array.isArray(result.data) ? result.data : [result.data]

        setCategoryList(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [ansh])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])


  useEffect(() => {
    if (!subCategoryData) return

    const catId =
      Array.isArray(subCategoryData.categoryDetails) && subCategoryData.categoryDetails.length > 0
        ? subCategoryData.categoryDetails[0].id
        : ''

    reset({
      subCategoryTitle: subCategoryData.subCategory ?? '',
      categoryId: String(catId)
    })
  }, [subCategoryData, reset])


  const onSubmit = async (data: any) => {
    try {
      const payload = {
        id: Number(subCategoryId),
        subCategory: data.subCategoryTitle,
        category: [Number(data.categoryId)],
        isActive: true
      }

      const res = await fetch(`${API_URL}/sub-category/update-sub-category`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ansh}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await res.json()

      if (res.ok && result.status === 200) {
        toast.success('Sub category updated successfully')
        router.push('/list-sub-category')
      } else {
        toast.error(result.message || 'Failed to update sub category')
      }
    } catch (error) {
      console.error(error)
      toast.error('API Error')
    }
  }

  return (
    <div>
      <div className='flex my-5'>
        <h1 className='text-[#232F6F] text-xl font-semibold flex items-center gap-2'>
          <span className='cursor-pointer flex items-center justify-center' onClick={() => router.back()}>
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
              <path
                d='M9.97149 18.1108L5.45188 13.3196H21.553C22.2005 13.3196 22.7992 12.6848 22.7992 11.9984C22.7992 11.312 22.2005 10.6773 21.553 10.6773H5.45188L9.97149 5.88609C10.2148 5.61929 10.3709 5.29518 10.3679 4.94285C10.365 4.59052 10.0939 4.26027 9.58865 3.69459L1.56368 11.0649C1.19922 11.6483 1.19922 12.3485 1.56368 12.932L8.21017 19.978C8.61471 20.3563 9.26726 20.3951 9.58865 20.3023Z'
                fill='#232F6F'
              />
            </svg>
          </span>
          Edit Sub Category
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card variant='outlined'>
          <Typography variant='h6' className='py-4 px-6 border-b'>
            Sub Category details
          </Typography>

          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Controller
                  name='subCategoryTitle'
                  control={control}
                  rules={{ required: 'Sub category name is required' }}
                  render={({ field, fieldState }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Sub category*'
                      placeholder='Sub category name'
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      value={field.value}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name='categoryId'
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field, fieldState }) => (
                    <CustomTextField
                      select
                      fullWidth
                      label='Category*'
                      {...field}
                      SelectProps={{ displayEmpty: true }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      value={field.value}
                    >
                      <MenuItem value='' disabled>
                        Select category
                      </MenuItem>
                      {categoryList.map(cat => (
                        <MenuItem key={cat.id} value={String(cat.id)}>
                          {cat.categoryName}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <div className='flex justify-end gap-4 mt-6'>
          <Button variant='outlined' onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type='submit' variant='contained'>
            Update
          </Button>
        </div>
      </form>
    </div>
  )
}
