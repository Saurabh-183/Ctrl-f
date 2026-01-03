'use client'

import { useCallback, useEffect, useState } from 'react'

import { Grid, IconButton, Menu, MenuItem, CircularProgress, ListItemIcon, Button } from '@mui/material'

import { FiMoreVertical } from 'react-icons/fi'

import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'

import CustomAutocomplete from '@core/components/mui/Autocomplete'

import 'react-toastify/dist/ReactToastify.css'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

interface ApprovalMatrixProps {
  ansh: string
}

export default function ApprovalMatrixPage({ ansh }: ApprovalMatrixProps) {
  const [department, setDepartment] = useState('')
  const [approver, setApprover] = useState<any>(null)
  const [tat, setTat] = useState('')
  const [customTat, setCustomTat] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [matrix, setMatrix] = useState<any[]>([])
  const [approverList, setApproverList] = useState<any[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [actionIndex, setActionIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const isFormValid =
    department.trim() !== '' && approver !== null && (tat !== 'Custom' ? tat !== '' : customTat !== '')

  const fetchApproverList = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/employee/employee-list`, {
        headers: { Authorization: `Bearer ${ansh}` }
      })

      const json = await res.json()

      if (json.status === 200) {
        const formatted = json.data.map((emp: any) => ({
          id: emp.id,
          name: emp.firstName?.trim() || ''
        }))

        setApproverList(formatted)
      }
    } catch {
      toast.error('Failed to load approver list')
    }
  }, [ansh])

  const fetchMatrixList = useCallback(async () => {
    try {
      setLoading(true)

      const res = await fetch(`${BASE_URL}/approval-matrix/approval-matrix-list?status=all`, {
        headers: { Authorization: `Bearer ${ansh}` }
      })

      const json = await res.json()

      const list = json?.data?.map((item: any) => {
        const app = approverList.find(a => a.id === item.approverId)

        return { ...item, approverName: app ? app.name : '-' }
      })

      setMatrix(list || [])
    } catch {
      toast.error('Failed to fetch matrix list')
    } finally {
      setLoading(false)
    }
  }, [ansh, approverList])

  useEffect(() => {
    fetchApproverList()
  }, [fetchApproverList])

  useEffect(() => {
    if (approverList.length > 0) {
      fetchMatrixList()
    }
  }, [approverList, fetchMatrixList])

  const handleAddOrUpdate = async () => {
    if (!isFormValid) return
    const finalTat = tat === 'Custom' ? Number(customTat) : Number(tat)

    const body: any = {
      department,
      approverId: approver.id,
      tatDays: finalTat,
      isActive: false
    }

    if (editingId !== null) body.id = editingId

    try {
      setLoading(true)

      const url =
        editingId === null
          ? `${BASE_URL}/approval-matrix/create-approval-matrix`
          : `${BASE_URL}/approval-matrix/update-approval-matrix`

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ansh}`
        },
        body: JSON.stringify(body)
      })

      const json = await res.json()

      if (json.status === 200) {
        toast.success(editingId ? 'Updated Successfully !' : 'Added Successfully !')
        await fetchMatrixList()
        resetForm()
      } else {
        toast.error('Operation failed')
      }
    } catch (err) {
      toast.error('Request Failed')
    } finally {
      setLoading(false)
    }
  }

  const deleteApprovalMatrix = async (id: number | null) => {
    if (!id) return

    try {
      const res = await fetch(`${BASE_URL}/approval-matrix/delete-approval-matrix?id=${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${ansh}`
        }
      })

      const json = await res.json()

      if (json.status === 200) {
        toast.success('Deleted Successfully')
        await fetchMatrixList()
      } else {
        toast.error(json.message || 'Delete failed')
      }
    } catch (err) {
      console.error(err)
      toast.error('API error')
    }
  }

  const handleEdit = async () => {
    if (actionIndex === null) return

    const item = matrix[actionIndex]

    try {
      const res = await fetch(`${BASE_URL}/approval-matrix/approval-matrix-detail-list?id=${item.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ansh}`
        }
      })

      const json = await res.json()

      if (json.status === 200) {
        const d = json.data

        setDepartment(d.department)

        const matchedApprover = approverList.find(a => String(a.id) === String(d.approverId))

        setApprover(matchedApprover || null)
        setTat(String(d.tatDays))
        setEditingId(d.id)
      }
    } catch {
      toast.error('Failed to load detail')
    }

    closeMenu()
  }

  const openMenu = (e: any, index: number) => {
    setAnchorEl(e.currentTarget)
    setActionIndex(index)
  }

  const closeMenu = () => {
    setAnchorEl(null)
    setActionIndex(null)
  }

  const resetForm = () => {
    setDepartment('')
    setApprover(null)
    setTat('')
    setCustomTat('')
    setEditingId(null)
  }

  return (
    <div className='w-full'>
      <h2 className='text-2xl font-semibold text-[#232F6F] mb-4'>Approval Matrix</h2>
      {/* FORM */}
      <div className='bg-white rounded-lg border p-5'>
        <Grid container spacing={3}>
          {/* Department */}
          <Grid item xs={12} sm={4}>
            <CustomTextField
              fullWidth
              label='Department *'
              placeholder='Enter department'
              value={department}
              onChange={e => setDepartment(e.target.value)}
            />
          </Grid>
          {/* Approver */}
          <Grid item xs={12} sm={4}>
            <CustomAutocomplete
              options={approverList}
              value={approver}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              getOptionLabel={o => o.name}
              onChange={(e, val) => setApprover(val)}
              renderInput={p => <CustomTextField {...p} label='Approver *' placeholder='Select Approver' />}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <CustomTextField
              label='TAT Days *'
              placeholder='Enter TAT'
              type='number'
              value={tat ?? ''}
              onChange={e => setTat(e.target.value)}
              inputProps={{ min: 0 }}
              fullWidth
            />
          </Grid>
        </Grid>

        <div className='flex justify-end'>
          <Button onClick={handleAddOrUpdate} disabled={!isFormValid || loading} variant='contained' sx={{ mt: 3 }}>
            + {editingId ? 'Update' : 'Add More'}
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className='mt-6'>
        {loading ? (
          <div className='flex justify-center py-6'>
            <CircularProgress size={30} />
          </div>
        ) : matrix.length > 0 ? (
          <table className='w-full text-sm border-collapse text-center'>
            <thead>
              <tr className='bg-[#1e1e1e] text-white border border-white border-dashed rounded-xl'>
                <th className='p-2 border-r border-gray-300'>No.</th>
                <th className='p-2 border-r border-gray-300'>Node</th>
                <th className='p-2 border-r border-gray-300'>Approver</th>
                <th className='p-2 border-r border-gray-300'>Level</th>
                <th className='p-2 border-r border-gray-300'>TAT Days</th>
                <th className='p-2'>Action</th>
              </tr>
            </thead>

            <tbody>
              {matrix.map((row, index) => (
                <tr key={row.id} className='border'>
                  <td className='p-2 border-r'>{index + 1}</td>
                  <td className='p-2 border-r'>{row.department}</td>
                  <td className='p-2 border-r'>
                    <span className='px-2 py-1 border rounded-sm'>{row.approverName}</span>
                  </td>
                  <td className='p-2 border-r'>Level {index + 1}</td>
                  <td className='p-2 border-r'>{row.tatDays}</td>
                  <td className='p-2'>
                    <IconButton onClick={e => openMenu(e, index)}>
                      <FiMoreVertical />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className='text-center text-gray-500 py-5'>No Records Found</p>
        )}
      </div>

      {deleteId !== null && (
        <div className='fixed inset-0 bg-black/30 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-80 text-center'>
            <h3 className='text-2xl font-bold text-red-600'>Delete</h3>

            <p className='mt-2 text-base font-medium text-[#2F2F2F]'>
              Are you sure you want to delete this Approval Matrix?
            </p>

            <div className='flex justify-center gap-3 mt-6'>
              <button
                className='bg-white hover:cursor-pointer px-5 py-2 rounded-full border border-[#2F2F2F]'
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await deleteApprovalMatrix(deleteId)
                  setDeleteId(null)
                }}
                className='bg-red-600 text-white hover:cursor-pointer px-5 py-2 rounded-full'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <i className='tabler-edit' />
          </ListItemIcon>
          Update
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (actionIndex !== null) {
              setDeleteId(matrix[actionIndex].id)
            }

            closeMenu()
          }}
          sx={{ color: 'red' }}
        >
          <ListItemIcon sx={{ color: 'red' }}>
            <i className='tabler-trash' />
          </ListItemIcon>
          Remove
        </MenuItem>
      </Menu>
    </div>
  )
}
