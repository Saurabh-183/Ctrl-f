'use client'

import { useCallback, useEffect, useState } from 'react'

import { Dialog, DialogTitle, DialogContent, IconButton, Button, Box, Grid } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { IconX } from '@tabler/icons-react'
import { toast } from 'react-toastify'

import CustomAutocomplete from '@core/components/mui/Autocomplete'
import CustomTextField from '@/@core/components/mui/TextField'

interface AddCategoryProps {
  open: boolean
  onClose: () => void
  token: string
  onSuccess: () => void
}

const API_URL = process.env.NEXT_PUBLIC_BASE_URL

export default function AddCategory({ open, onClose, token, onSuccess }: AddCategoryProps) {
  const [productList, setProductList] = useState<any[]>([])
  const [focusCategories, setFocusCategories] = useState<any[]>([])

  const { control, reset, handleSubmit } = useForm({
    defaultValues: {
      productType: null,
      categoryName: '',
      subCategory: null,
      sizes: []
    }
  })

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/product/product-list`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const result = await res.json()

      if (result.status !== 200) return

      const uniqueMap = new Map()

      result.data.forEach((p: any) => {
        const name = p.productType?.trim()

        if (name && !uniqueMap.has(name)) {
          uniqueMap.set(name, {
            id: p.id,
            name
          })
        }
      })

      setProductList(Array.from(uniqueMap.values()))
    } catch (error) {
      console.error('Failed to fetch products', error)
    }
  }, [token])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/sub-category/sub-category-list?status=active`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const result = await res.json()

      if (result.status !== 200) return

      const formatted = (result.data || []).map((c: any) => ({
        id: c.id,
        name: c.subCategory.trim()
      }))

      setFocusCategories(formatted)
    } catch (error) {
      console.error('Failed to fetch sub-categories', error)
    }
  }, [token])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  const submitHandler = async (data: any) => {
    if (!data.productType || !data.categoryName) {
      toast.error('Product and Category are required')

    return
    }

    const payload: any = {
      productType: String(data.productType.id),
      categoryName: data.categoryName,
      isActive: true
    }

    if (data.subCategory) {
      payload.subCategory = String(data.subCategory.id)
    }

    try {
      const response = await fetch(`${API_URL}/category/create-category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (response.ok && result.status === 200) {
        toast.success('Category Created Successfully')
        reset()
        onSuccess()
        onClose()
      } else {
        toast.error(result.message || 'Failed to create category')
      }
    } catch (error) {
      console.error(error)
      toast.error('API Error')
    }
  }

  const handleCancel = () => {
    reset()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '18px', pr: 5 }}>
        Category details
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 16, top: 16 }}>
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 4 }}>
        <Box sx={{ border: '1px solid #E4E7EC', borderRadius: '10px', p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='productType'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomAutocomplete
                    options={productList}
                    fullWidth
                    value={value}
                    getOptionLabel={(option: any) => option?.name || ''}
                    onChange={(_, val) => onChange(val)}
                    renderInput={(params: any) => (
                      <CustomTextField {...params} label='Product*' placeholder='Select product' />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='categoryName'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth label='Category*' placeholder='Category name' />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='subCategory'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomAutocomplete
                    options={focusCategories}
                    fullWidth
                    value={value}
                    getOptionLabel={(option: any) => option?.name || ''}
                    onChange={(_, val) => onChange(val)}
                    renderInput={(params: any) => (
                      <CustomTextField {...params} label='Sub-category' placeholder='Select sub-category' />
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        <Box display='flex' justifyContent='flex-end' gap={2}>
          <Button variant='outlined' onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant='contained' onClick={handleSubmit(submitHandler)}>
            Create category
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
