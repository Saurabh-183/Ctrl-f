'use client'

import { useCallback, useEffect, useState } from 'react'

import { redirect } from 'next/navigation'

import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'

import {
  Card,
  CardContent,
  IconButton,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'

import { IconPlus, IconTrash } from '@tabler/icons-react'

import CustomTextField from '@core/components/mui/TextField'

import DeleteConfirmModal from '@/components/model/DeleteConfirmModal'

interface FormValues {
  attributeName: string
}

interface Attribute {
  id: number
  attributeName: string
  isActive: boolean
  companyId: number
  createdAt: string
}

const CreateAttributes = ({ token }: { token: string }) => {
  const API_URL = process.env.NEXT_PUBLIC_BASE_URL

  const [attributeList, setAttributeList] = useState<Attribute[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null)

  const fetchAttributes = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/product/attribute-list`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const json = await res.json()

      console.log('Products:', json)

      if (res.ok && json.status === 200) {
        setAttributeList(json.data || [])
      }
    } catch (err) {
      console.error(err)
    }
  }, [API_URL, token])

  useEffect(() => {
    if (!token) {
      redirect('/login')
    }

    fetchAttributes()
  }, [token, fetchAttributes])

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      attributeName: ''
    }
  })

  const onSubmit = async (data: FormValues) => {
    const payload = {
      attributeName: data.attributeName
    }

    try {
      const res = await fetch(`${API_URL}/product/create-attribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const json = await res.json()

      if (res.ok && json.status === 200) {
        toast.success('Attribute created successfully')
        reset()
        fetchAttributes()
      } else {
        toast.error(json.message || 'Failed to create Attribute')
      }
    } catch {
      toast.error('Server error')
    }
  }

  const handleDelete = async () => {
    if (!selectedAttribute) return

    try {
      const res = await fetch(`${API_URL}/product/delete-attribute?id=${selectedAttribute.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const result = await res.json()

      if (res.ok && result.status === 200) {
        toast.success('Attribute deleted successfully')

        // remove from UI immediately
        setAttributeList(prev => prev.filter(attr => attr.id !== selectedAttribute.id))
      } else {
        toast.error(result.message || 'Failed to delete attribute')
      }
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong')
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedAttribute(null)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card variant='outlined'>
          <CardHeader
            title='Product Attributes'
            titleTypographyProps={{ fontSize: '1rem', fontWeight: '600' }}
            sx={{ pb: 2, pt: 3 }}
          />
          <Divider sx={{ mb: 2 }} />

          <CardContent>
            <div className='flex items-center gap-4'>
              <div className='flex-1'>
                <Controller
                  name='attributeName'
                  control={control}
                  rules={{
                    required: 'Attribute name is required',
                    minLength: { value: 3, message: 'Minimum 3 characters required' }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Attribute name'
                      placeholder='Enter attribute name'
                      error={!!errors.attributeName}
                      helperText={errors.attributeName?.message}
                    />
                  )}
                />
              </div>

              <IconButton
                type='submit'
                sx={{
                  border: '1px solid #D0D5DD',
                  background: '#C9DFEE',
                  width: 32,
                  height: 32,
                  mt: 4
                }}
              >
                <IconPlus size={16} />
              </IconButton>
            </div>
          </CardContent>
        </Card>
      </form>

      <Card variant='outlined' sx={{ mt: 4 }}>
        <CardHeader title='Attributes List' titleTypographyProps={{ fontSize: '1rem', fontWeight: '600' }} />
        <Divider />

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Attributes List</TableCell>
                <TableCell align='right' sx={{ fontWeight: 600 }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {attributeList.map(attr => (
                <TableRow key={attr.id}>
                  <TableCell>{attr.attributeName}</TableCell>
                  <TableCell align='right'>
                    <IconButton
                      color='error'
                      onClick={() => {
                        setSelectedAttribute(attr)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <IconTrash size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {attributeList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align='center'>
                    No attributes found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={isDeleteDialogOpen}
        title='Delete Attribute'
        message='Are you sure you want to delete this attribute?'
        name={selectedAttribute?.attributeName}
        onCancel={() => {
          setIsDeleteDialogOpen(false)
          setSelectedAttribute(null)
        }}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default CreateAttributes
