'use client'

import React from 'react'

import { useRouter } from 'next/navigation'

import { Grid, Card, CardContent, Button, Typography, MenuItem } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'
import CustomTextField from '@core/components/mui/TextField'

interface FormData {
  subCategoryTitle: string
  categoryId: number | ''
}

interface CategoryData {
  id: number
  categoryName: string
}

interface SubCategoryProps {
  ansh: string
}

const API_URL = process.env.NEXT_PUBLIC_BASE_URL

export default function CreateSubCategoryPage({ ansh }: SubCategoryProps) {
  // eslint-disable-next-line import/no-named-as-default-member
  const [categoryList, setCategoryList] = React.useState<CategoryData[]>([])
  const router = useRouter()

  const { control, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      subCategoryTitle: '',
      categoryId: ''
    }
  })

  // eslint-disable-next-line import/no-named-as-default-member
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/category/category-list`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${ansh}`
          }
        })

        const result = await response.json()

        if (response.ok && result.status === 200) {
          const data = Array.isArray(result.data) ? result.data : [result.data]

          setCategoryList(data)
        } else {
          toast.error(result.message || 'Failed to fetch categories')
        }
      } catch (error) {
        console.error(error)
        toast.error('API Error while fetching categories')
      }
    }

    fetchCategories()
  }, [ansh])

  const onSubmit = async (data: FormData) => {
    if (!data.subCategoryTitle || data.categoryId === '') {
      toast.error('All fields are required')

return
    }

    const payload = {
      subCategory: data.subCategoryTitle,
      category: [data.categoryId],
      isActive: true
    }

    try {
      const response = await fetch(`${API_URL}/sub-category/create-sub-category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ansh}`
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (response.ok && result.status === 200) {
        toast.success('Sub Category Created Successfully')
        reset()
        router.push('/list-sub-category')
      } else {
        toast.error(result.message || 'Failed to create sub category')
      }
    } catch (error) {
      console.error(error)
      toast.error('API Error while creating sub category')
    }
  }

  const handleCancel = () => {
    reset()
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
          Sub Category
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
                      SelectProps={{
                        displayEmpty: true
                      }}
                      value={field.value || ''}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={e => field.onChange(Number(e.target.value))}
                    >
                      <MenuItem value='' disabled>
                        Select category
                      </MenuItem>
                      {categoryList.map(category => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.categoryName}
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
          <Button variant='outlined' onClick={handleCancel}>
            Cancel
          </Button>
          <Button type='submit' variant='contained'>
            Save
          </Button>
        </div>
      </form>
    </div>
  )
}
