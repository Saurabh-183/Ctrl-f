'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import dynamic from 'next/dynamic'

import { useForm, Controller } from 'react-hook-form'

import { toast } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'

import {
  Card,
  CardContent,
  Grid,
  Button,
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  IconButton
} from '@mui/material'

import { v4 as uuidv4 } from 'uuid'

import CustomTextField from '@core/components/mui/TextField'

// import FileUploader from '@/components/FileUploader'

// import RichTextEditor from '@/components/RichTextEditor'

import type { ProductData } from '@/services/product'

type FormValues = {
  productType: string
  productCode: string
  size: string
  description: string
  pattern: string
  loadIndex: string
  brand: string
  supplier: string
  weight: string
  origin: string
  cbmPerCarton: number | null
  cartonsPerSKU: number | null
  unitsPerCarton: number | null
  totalWeight: number | null
  attributes: ProductAttribute[]
  files: (File | string)[]
}

interface AddProductProps {
  token: string
  productData?: ProductData
}

export interface AttributeItem {
  attributeName: string
  attributeValue: string
}

export interface ProductAttribute {
  id?: number
  tempId?: string
  attributeJson: AttributeItem[]
  price: number | ''
  oldPrice?: number | null
}

const formatPrice = (value?: number | null) => {
  const num = Number(value ?? 0)

  return `₹${num.toLocaleString('en-IN')}`
}

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false
})

const FileUploader = dynamic(() => import('@/components/FileUploader'), {
  ssr: false
})

const AddProduct: React.FC<AddProductProps> = ({ token, productData }) => {
  const [attributeList, setAttributeList] = useState<{ id: number; attributeName: string }[]>([])
  const [attributesState, setAttributesState] = useState<ProductAttribute[]>([])
  const router = useRouter()
  const isEditMode = Boolean(productData?.id)
  const attributeHeaders = attributeList.map(attr => attr.attributeName)

  const API_URL = process.env.NEXT_PUBLIC_BASE_URL

  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_BASE_URL is not defined')
  }


  useEffect(() => {
    if (!productData && attributeList.length && attributesState.length === 0) {
      setAttributesState([
        {
          tempId: uuidv4(),
          attributeJson: attributeList.map(attr => ({
            attributeName: attr.attributeName,
            attributeValue: ''
          })),
          price: 0,
          oldPrice: null
        }
      ])
    }
  }, [attributeList, attributesState.length, productData])

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      productType: '',
      productCode: '',
      size: '',
      description: '',
      pattern: '',
      loadIndex: '',
      brand: '',
      supplier: '',
      weight: '',
      origin: '',
      cbmPerCarton: null,
      cartonsPerSKU: null,
      unitsPerCarton: null,
      totalWeight: null,
      attributes: [],
      files: []
    }
  })

  useEffect(() => {
    if (productData) {
      reset({
        productType: productData.productType,
        productCode: productData.productCode,
        size: productData.productSize,
        description: productData.description,
        pattern: '',
        loadIndex: '',
        brand: '',
        supplier: '',
        weight: '',
        origin: '',
        cbmPerCarton: productData.cbmPerCarton,
        cartonsPerSKU: productData.cartonsPerSKU,
        unitsPerCarton: productData.unitsPerCarton,
        totalWeight: productData.totalWeightPerCarton,
        attributes: productData.attributes,
        files: productData.media || []
      })
    }
  }, [productData, reset])

  useEffect(() => {
    if (isEditMode && productData?.attributes?.length && attributeList.length) {
      const mappedAttributes = productData.attributes.map(attr => {
        // Map the dynamic columns (Size, Pattern, etc.)
        const mappedJson = attributeList.map(baseAttr => {
          const found = attr.attributeJson.find(
            a => a.attributeName.toLowerCase() === baseAttr.attributeName.toLowerCase()
          )

          return {
            attributeName: baseAttr.attributeName,
            attributeValue: found?.attributeValue ?? ''
          }
        })

        return {
          id: attr.id,
          attributeJson: mappedJson,

          // Directly map price and oldPrice from the API JSON you provided
          price: attr.price ? Number(attr.price) : 0,
          oldPrice: attr.oldPrice ? Number(attr.oldPrice) : null
        }
      })

      setAttributesState(mappedAttributes)
    }
  }, [isEditMode, productData, attributeList])

  const fetchAttributeList = useCallback(async () => {
    const res = await fetch(`${API_URL}/product/attribute-list`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const result = await res.json()

    if (result.status === 200) {
      setAttributeList(result.data)
    }
  }, [API_URL, token])

  useEffect(() => {
    fetchAttributeList()
  }, [fetchAttributeList])

  const onSubmit = async (data: FormValues) => {
    try {
      const formData = new FormData()

      formData.append('productType', data.productType)
      formData.append('productCode', data.productCode)
      formData.append('description', data.description)
      formData.append('cbmPerCarton', String(data.cbmPerCarton))
      formData.append('cartonsPerSKU', String(data.cartonsPerSKU))
      formData.append('unitsPerCarton', String(data.unitsPerCarton))
      formData.append('totalWeightPerCarton', String(data.totalWeight))

      const attributesPayload = attributesState.map(attr => {
        const isExisting = Boolean(attr.id)

        return {
          ...(isExisting ? { id: attr.id } : {}),
          attributeJson: attr.attributeJson.map(a => ({
            attributeName: a.attributeName,
            attributeValue: a.attributeValue
          })),
          price: Number(attr.price),
          oldPrice: attr.oldPrice ?? null
        }
      })

      formData.append('attributes', JSON.stringify(attributesPayload))

      if (data.files && data.files.length > 0) {
        data.files.forEach(file => {
          if (file instanceof File) {
            formData.append('files', file)
          } else {
            formData.append('existingFiles', file)
          }
        })
      }

      let endpoint = `${API_URL}/product/create-product`

      if (productData?.id) {
        endpoint = `${API_URL}/product/update-product`
        formData.append('id', String(productData.id))
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      const result = await res.json()

      if (res.ok && result.status === 200) {
        toast.success(productData ? 'Product updated successfully' : 'Product created successfully')
        setTimeout(() => router.push('/product/list-product'), 1000)
      } else {
        toast.error(result.message || 'Failed to save product')
      }
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  const isRowComplete = (row: ProductAttribute) => {
    const attributesFilled = row.attributeJson.every(attr => attr.attributeValue.trim() !== '')
    const priceFilled = row.price !== '' && Number(row.price) > 0

    return attributesFilled && priceFilled
  }

  const deleteAttributeApi = async (attributeId: number) => {
    const res = await fetch(`${API_URL}/product/delete-product-attribute?id=${attributeId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const result = await res.json()

    if (!res.ok || result.status !== 200) {
      throw new Error(result.message || 'Failed to delete attribute')
    }

    return result
  }

  const createEmptyRow = (): ProductAttribute => ({
    tempId: uuidv4(),
    attributeJson: attributeList.map(attr => ({
      attributeName: attr.attributeName,
      attributeValue: ''
    })),
    price: '',
    oldPrice: null
  })

  // @ts-ignore
  return (
    <div>
      <div className='flex my-2'>
        <h1 className='text-[#232F6F] text-xl font-semibold flex items-center gap-2'>
          <span
            className='cursor-pointer flex items-center justify-center'
            onClick={() => router.push('/product/list-product')}
          >
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M9.97149 18.1108C10.0939 18.2317 10.1921 18.3776 10.2602 18.5396C10.3284 18.7017 10.365 18.8766 10.3679 19.054C10.3709 19.2314 10.3401 19.4076 10.2774 19.5721C10.2148 19.7366 10.1215 19.886 10.0031 20.0115C9.88479 20.1369 9.74383 20.2358 9.58865 20.3023C9.43347 20.3687 9.26726 20.4014 9.09993 20.3982C8.9326 20.3951 8.76758 20.3563 8.61471 20.2841C8.46184 20.2119 8.32426 20.1078 8.21017 19.978L1.56368 12.932C1.3303 12.6843 1.19922 12.3485 1.19922 11.9984C1.19922 11.6483 1.3303 11.3126 1.56368 11.0649L8.21017 4.01892C8.32426 3.88912 8.46184 3.78501 8.61471 3.71281C8.76758 3.6406 8.9326 3.60177 9.09993 3.59864C9.26726 3.59551 9.43347 3.62814 9.58865 3.69459C9.74382 3.76103 9.88479 3.85993 10.0031 3.98538C10.1215 4.11083 10.2148 4.26027 10.2774 4.42477C10.3401 4.58927 10.3709 4.76547 10.3679 4.94285C10.365 5.12024 10.3284 5.29518 10.2602 5.45724C10.1921 5.61929 10.0939 5.76514 9.97149 5.88609L5.45188 10.6773L21.553 10.6773C21.8835 10.6773 22.2005 10.8165 22.4342 11.0643C22.6679 11.312 22.7992 11.6481 22.7992 11.9984C22.7992 12.3488 22.6679 12.6848 22.4342 12.9326C22.2005 13.1804 21.8835 13.3195 21.553 13.3195L5.45188 13.3196L9.97149 18.1108Z'
                fill='#232F6F'
              />
            </svg>
          </span>
          {productData ? 'Update Product' : 'Create Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card variant='outlined' sx={{ mt: 4 }}>
          <Typography variant='h6' className='py-4 px-6 border-b'>
            Basic Details
          </Typography>

          <CardContent>
            <Grid container spacing={6}>
              {/* Product Name*/}
              <Grid item xs={12} sm={6}>
                <Controller
                  name='productType'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Product Name'
                      placeholder='Enter Product Name'
                      error={!!errors.productType}
                      helperText={errors.productType?.message || ''}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='productCode'
                  control={control}
                  rules={{ required: 'Product Code is required.' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Product Code'
                      placeholder='Enter Product code'
                      error={!!errors.productCode}
                      helperText={errors.productCode?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Grid container spacing={6} alignItems='stretch'>
                  {/* Description */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='description'
                      control={control}
                      rules={{ required: 'Description is required' }}
                      render={({ field: { value, onChange } }) => (
                        <Box display='flex' flexDirection='column' sx={{ height: 100 }}>
                          <RichTextEditor
                            value={value}
                            onChange={onChange}
                            label='Description'

                            // @ts-ignore
                            sx={{
                              overflow: 'auto',
                              border: '1px solid #ccc',
                              borderRadius: 1,
                              p: 1
                            }}
                          />
                          {errors.description && (
                            <Typography color='error' variant='caption' mt={1}>
                              {errors.description.message}
                            </Typography>
                          )}
                        </Box>
                      )}
                    />
                  </Grid>

                  {/* File Uploader */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='files'
                      control={control}
                      render={({ field }) => (
                        <FileUploader
                          multiple
                          value={field.value || []}
                          onChange={files => field.onChange(files)}
                          maxFiles={5}
                          allowedTypes={['image']}
                          maxSizeMB={5}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card variant='outlined' sx={{ mt: 4 }}>
          <Typography variant='h6' className='py-4 px-6 border-b'>
            FCL Details
          </Typography>

          <CardContent>
            <Grid container spacing={6}>
              {/* CBM */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name='cbmPerCarton'
                  control={control}
                  rules={{ required: 'CBM per Carton is required.' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='number'
                      label='CBM per Carton'
                      placeholder='Enter CBM '
                      error={!!errors.cbmPerCarton}
                      helperText={errors.cbmPerCarton?.message}
                      inputProps={{ min: 0 }}
                    />
                  )}
                />
              </Grid>
              {/* Cartons Per SKU */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name='cartonsPerSKU'
                  control={control}
                  rules={{ required: 'Cartons per SKU is required.' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='number'
                      label='Cartons per SKU'
                      placeholder='Enter cartons per SKU'
                      error={!!errors.cartonsPerSKU}
                      helperText={errors.cartonsPerSKU?.message}
                      inputProps={{ min: 0 }}
                    />
                  )}
                />
              </Grid>
              {/* Units */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name='unitsPerCarton'
                  control={control}
                  rules={{ required: 'Units per Carton is required.' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='number'
                      label='Units per Carton*'
                      placeholder='Enter units per carton'
                      error={!!errors.unitsPerCarton}
                      helperText={errors.unitsPerCarton?.message}
                      inputProps={{ min: 0 }}
                    />
                  )}
                />
              </Grid>
              {/* Weight */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name='totalWeight'
                  control={control}
                  rules={{ required: 'Total Weight per Carton is required.' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='number'
                      label='Total Weight per Carton'
                      placeholder='Enter weight in kg'
                      error={!!errors.totalWeight}
                      helperText={errors.totalWeight?.message}
                      inputProps={{ min: 0 }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ATTRIBUTE TABLE */}
        <Box
          sx={{
            width: '100%',
            overflowX: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            backgroundColor: '#fff',
            margin: '16px 0'
          }}
        >
          <Table
            size='small'
            sx={{
              minWidth: attributeHeaders.length * 180 + (isEditMode ? 320 : 220),
              borderCollapse: 'collapse',
              '& td, & th': { border: '1px solid', borderColor: 'divider' }
            }}
          >
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fc' }}>
                {attributeHeaders.map(header => (
                  <TableCell
                    key={header}
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'text.secondary',
                      textTransform: 'capitalize',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
                {isEditMode && (
                  <TableCell
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'text.secondary',
                      textAlign: 'center',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Old Price
                  </TableCell>
                )}
                <TableCell
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'text.secondary',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}
                >
                  New Price
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'text.secondary',
                    textAlign: 'center',
                    width: 80
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attributesState.length ? (
                attributesState.map((row, rowIndex) => (
                  <TableRow key={row.id ? `id-${row.id}` : `temp-${row.tempId}`}>
                    {attributeHeaders.map(header => {
                      const attr = row.attributeJson.find(a => a.attributeName.toLowerCase() === header.toLowerCase())

                      return (
                        <TableCell key={header}>
                          <TextField
                            size='small'
                            value={attr?.attributeValue || ''}
                            onChange={e => {
                              const val = e.target.value

                              setAttributesState(prev =>
                                prev.map((r, rIdx) =>
                                  rIdx === rowIndex
                                    ? {
                                        ...r,
                                        attributeJson: r.attributeJson.map(a =>
                                          a.attributeName.toLowerCase() === header.toLowerCase()
                                            ? { ...a, attributeValue: val }
                                            : a
                                        )
                                      }
                                    : r
                                )
                              )
                            }}
                            sx={{ width: '100%', '& input': { fontSize: 13 } }}
                          />
                        </TableCell>
                      )
                    })}

                    {/* OLD PRICE COLUMN */}
                    {isEditMode && (
                      <TableCell align='center'>
                        <Typography fontSize={13} color='text.secondary'>
                          {/* If oldPrice is null/0, it displays '-' */}
                          {formatPrice(row.oldPrice)}
                        </Typography>
                      </TableCell>
                    )}

                    {/* NEW PRICE COLUMN */}
                    <TableCell align='center'>
                      <TextField
                        type='number'
                        size='small'
                        value={row.price ?? ''}
                        onChange={e => {
                          const newPrice = e.target.value === '' ? '' : Number(e.target.value)

                          setAttributesState(prev =>
                            prev.map((r, idx) => {
                              if (idx !== rowIndex) return r

                              return {
                                ...r,
                                oldPrice: r.oldPrice ?? (typeof r.price === 'number' ? r.price : 0),
                                price: newPrice
                              }
                            })
                          )
                        }}
                        sx={{
                          width: 120,
                          '& input': { textAlign: 'center', fontSize: 13 }
                        }}
                      />
                    </TableCell>

                    <TableCell align='center'>
                      <Box display='flex' justifyContent='center' gap={1}>
                        {/* ADD ROW */}
                        <IconButton
                          size='small'
                          color='primary'
                          disabled={rowIndex !== attributesState.length - 1 || !isRowComplete(row)}
                          onClick={() => {
                            setAttributesState(prev => [...prev, createEmptyRow()])
                          }}
                        >
                          <i className='tabler-plus' />
                        </IconButton>

                        {/* DELETE ROW */}
                        <IconButton
                          size='small'
                          color='error'
                          disabled={attributesState.length === 1}
                          onClick={async () => {
                            try {
                              if (row.id) {
                                await deleteAttributeApi(row.id)
                                toast.success('Attribute deleted')
                              }

                              setAttributesState(prev => prev.filter((_, idx) => idx !== rowIndex))
                            } catch (err: any) {
                              toast.error(err.message || 'Delete failed')
                            }
                          }}
                        >
                          <i className='tabler-trash' />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={attributeHeaders.length + (isEditMode ? 3 : 2)}
                    align='center'
                    sx={{ py: 3, fontSize: 13, color: 'text.secondary' }}
                  >
                    No attribute data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>

        <Grid item xs={12} className='flex justify-end gap-4 mt-6'>
          <Button variant='outlined' onClick={() => reset()} sx={{ minWidth: 120 }}>
            Cancel
          </Button>
          <Button variant='contained' type='submit' sx={{ minWidth: 120 }}>
            {productData ? 'Update' : 'Save'}
          </Button>
        </Grid>
      </form>
    </div>
  )
}

export default AddProduct
