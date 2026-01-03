'use client'

// React Imports
import React, { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports

import Card from '@mui/material/Card'

import TablePagination from '@mui/material/TablePagination'

import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
import classnames from 'classnames'

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table'

import { rankItem } from '@tanstack/match-sorter-utils'

import type {
  Column,
  Table,
  ColumnFiltersState,
  FilterFn,
  ColumnDef,
  Row,
  HeaderGroup,
  Cell,
  CellContext
} from '@tanstack/react-table'

// Component Imports

import { Button, Checkbox, IconButton, Typography, Grid, Menu, MenuItem, ListItemIcon } from '@mui/material'

import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'

// Icon Imports
import ChevronRight from '@menu/svg/ChevronRight'

// Style Imports
import styles from '@core/styles/table.module.css'

import type { User } from '@/types/userType'

import TablePaginationComponent from '../../components/TablePaginationComponent'

import { COLORS } from '@/utils/colors'
import DeleteConfirmModal from '@/components/model/DeleteConfirmModal'
import type { Employee } from '@/types/employee'
import { exportToExcel } from '@/utils/exportToExcel'

// import { exportToExcel } from '@/utils/exportToExcel'
// import StationNameMenuCell from '@/components/StationNameMenuCell'

interface ListUserProps {
  token: string
  data: Employee[]
}

// Column Definitions
const columnHelper = createColumnHelper<User>()

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

// A debounced input react component
const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & TextFieldProps) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const Filter = ({ column, table }: { column: Column<any, unknown>; table: Table<any> }) => {
  // Vars
  const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id)

  const columnFilterValue = column.getFilterValue()

  if (column.id === 'id') {
    return
  }

  return typeof firstValue === 'number' ? (
    <div className='flex gap-x-2'>
      <CustomTextField
        fullWidth
        type='number'
        sx={{ minInlineSize: 100, maxInlineSize: 125 }}
        value={(columnFilterValue as [number, number])?.[0] ?? ''}
        onChange={e => column.setFilterValue((old: [number, number]) => [e.target.value, old?.[1]])}
        placeholder={`Min ${column.getFacetedMinMaxValues()?.[0] ? `(${column.getFacetedMinMaxValues()?.[0]})` : ''}`}
      />
      <CustomTextField
        fullWidth
        type='number'
        sx={{ minInlineSize: 100, maxInlineSize: 125 }}
        value={(columnFilterValue as [number, number])?.[1] ?? ''}
        onChange={e => column.setFilterValue((old: [number, number]) => [old?.[0], e.target.value])}
        placeholder={`Max ${column.getFacetedMinMaxValues()?.[1] ? `(${column.getFacetedMinMaxValues()?.[1]})` : ''}`}
      />
    </div>
  ) : (
    <CustomTextField
      fullWidth
      sx={{ minInlineSize: 100 }}
      value={(columnFilterValue ?? '') as string}
      onChange={e => column.setFilterValue(e.target.value)}
      placeholder='Search...'
    />
  )
}

// MaxLengthCell component for long text
const MaxLengthCell = ({ value, maxLength }: { value: string; maxLength: number }) => {
  if (!value) return <span>-</span>

  return <span title={value}>{value.length > maxLength ? `${value.substring(0, maxLength)}...` : value}</span>
}

const ListUser: React.FC<ListUserProps> = ({ token, data }) => {
  const router = useRouter()

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Action menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuRowData, setMenuRowData] = useState<User | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Action handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget)
    setMenuRowData(user)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setMenuRowData(null)
  }

  const handleEdit = (user: User) => {
    router.push(`/users/update-user/${user.id}`)
    handleMenuClose()
  }

  const handleDelete = async (user: User) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/employee/delete-employee?id=${user.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await res.json()

      if (result.status === 200) {
        toast.success('User deleted successfully')
        router.refresh()

        // setData(prevData => prevData.filter(u => u.id !== user.id))
      } else {
        toast.error('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('An error occurred while deleting the user')
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  // const fetchData = useCallback(async () => {
  //   try {
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/employee/employee-list`, {
  //       headers: {
  //         Accept: 'application/json',
  //         Authorization: `Bearer ${token}`
  //       }
  //     })

  //     if (response.ok) {
  //       const res = await response.json()
  //       console.log('res: ', res)
  //       setData(res?.data)
  //     } else {
  //       console.error('Failed to fetch roles:', response.statusText)
  //     }
  //   } catch (error) {
  //     console.error('Error fetching user roles:', error)
  //   }
  // }, [token])

  // useEffect(() => {
  //   if (!token) return
  //   fetchData()
  // }, [fetchData, token])
  // Hooks
  const columns = useMemo<ColumnDef<User, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }: { table: Table<User> }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }: { row: Row<User> }) => (
          <Checkbox checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
        ),
        enableSorting: false,
        enableColumnFilter: false
      },

      columnHelper.accessor('firstName', {
        cell: info => info.getValue(),
        header: 'Name',
        enableColumnFilter: false
      }),

      columnHelper.accessor('userName', {
        cell: (info: CellContext<User, string>) => <span className='font-medium'>{info.getValue()}</span>,
        header: 'Username',
        enableColumnFilter: false
      }),

      columnHelper.accessor('employeeId', {
        cell: (info: CellContext<User, string>) => <span className='font-medium'>{info.getValue()}</span>,
        header: 'Employee ID',
        enableColumnFilter: false
      }),

      columnHelper.accessor('userEmail', {
        cell: (info: CellContext<User, string>) => <span className='font-medium'>{info.getValue()}</span>,
        header: 'Email',
        enableColumnFilter: false
      }),

      columnHelper.accessor('userMobile', {
        cell: (info: CellContext<User, string>) => <span className='font-medium'>{info.getValue() || '-'}</span>,
        header: 'Mobile',
        enableColumnFilter: false
      }),

      // columnHelper.accessor('gender', {
      //   cell: (info: CellContext<User, string>) => info.getValue(),
      //   header: 'Gender',
      //   enableColumnFilter: false
      // }),

      columnHelper.accessor('userRole', {
        cell: (info: CellContext<User, string>) => <MaxLengthCell value={info.getValue() || ''} maxLength={40} />,
        header: 'Role',
        enableColumnFilter: false
      }),

      // columnHelper.accessor('stationData', {
      //   id: 'stationNameMenu',
      //   header: 'Station Name',
      //   enableColumnFilter: false,

      //   cell: ({ row }) => {
      //     const stations = row.original.stationData?.filter(s => s && s.stationName)?.map(s => s!.stationName) || []

      //     return <StationNameMenuCell stations={stations} />
      //   }
      // }),

      columnHelper.accessor('id', {
        cell: ({ row }: { row: Row<User> }) => (
          <IconButton
            size='small'
            onClick={e => handleMenuOpen(e, row.original)}
            aria-label='Actions'
            sx={{ color: '#232F6F' }}
          >
            <i className='tabler-dots-vertical' />
          </IconButton>
        ),
        header: 'Action',
        enableSorting: false,
        enableColumnFilter: false
      })
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      columnFilters,
      globalFilter
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  useEffect(() => {
    if (table.getState().columnFilters[0]?.id === 'city') {
      if (table.getState().sorting[0]?.id !== 'city') {
        table.setSorting([{ id: 'city', desc: false }])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.getState().columnFilters[0]?.id])

  const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)
  const selectedCount = table.getSelectedRowModel().rows.length

  const handleExportBrands = (data: User[]) => {
    try {
      if (!data || data.length === 0) {
        toast.error('No data available for export')

        return
      }

      exportToExcel(selectedRows, 'user_data', [
        { key: 'id', label: 'User ID' },
        { key: 'firstName', label: 'Name' },
        { key: 'userName', label: 'Username' },
        { key: 'userEmail', label: 'User Email' },
        { key: 'employeeId', label: 'Employee ID' },

        // { key: 'gender', label: 'Gender' },
        { key: 'profilePic', label: 'Profile Pic' }
      ])

      table.resetRowSelection()

      toast.success('Users data exported')
    } catch (error) {
      console.error('Error exporting user_data:', error)
      toast.error('Failed to export report')
    }
  }

  // const handleImportBrands = () => {
  //   toast.info('Import Brand clicked')
  // }

  return (
    <>
      <div className='flex flex-col gap-4'>
        <Card variant='outlined' sx={{ p: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant='h5' mb={2}>
                User List ({data.length})
              </Typography>
            </Grid>

            <Grid item xs={12} container alignItems='center' justifyContent='space-between'>
              <Grid item xs={12} sm={6}>
                <DebouncedInput
                  value={globalFilter ?? ''}
                  onChange={value => setGlobalFilter(String(value))}
                  placeholder='Search Users...'
                  className='w-full'
                />
              </Grid>

              <Grid item xs={12} sm={6} display='flex' justifyContent='flex-end' gap={2}>
                <Button
                  variant='outlined'
                  startIcon={<i className='tabler-download' style={{ transform: 'rotate(180deg)' }} />}
                  onClick={() => handleExportBrands(selectedRows.length ? selectedRows : data)}
                  disabled={selectedCount === 0}
                >
                  Export Report
                </Button>

                {/* <Button variant='outlined' startIcon={<i className='tabler-upload' />} onClick={handleImportBrands}>
                  Import
                </Button> */}

                <Button
                  onClick={() => router.push('/users/add-user')}
                  variant='contained'
                  startIcon={<i className='tabler-plus' />}
                  sx={{
                    backgroundColor: COLORS.black,
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#000', // keep black on hover
                      opacity: 0.9
                    }
                  }}
                >
                  Add User
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Card>

        {/* Table Card */}
        <Card variant='outlined'>
          <div className='overflow-x-auto'>
            <table className={styles.table}>
              <thead>
                {table.getHeaderGroups().map((headerGroup: HeaderGroup<User>) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
                        {header.isPlaceholder ? null : (
                          <>
                            <div
                              className={classnames({
                                'flex items-center': header.column.getIsSorted(),
                                'cursor-pointer select-none': header.column.getCanSort()
                              })}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {{
                                asc: <ChevronRight fontSize='1.25rem' className='-rotate-90' />,
                                desc: <ChevronRight fontSize='1.25rem' className='rotate-90' />
                              }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                            </div>
                            {header.column.getCanFilter() && <Filter column={header.column} table={table} />}
                          </>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              {table.getFilteredRowModel().rows.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      No data available
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {table.getRowModel().rows.map((row: Row<User>) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell: Cell<User, unknown>) => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

          {/* Pagination */}
          <TablePagination
            component={() => <TablePaginationComponent table={table} />}
            count={table.getFilteredRowModel().rows.length}
            rowsPerPage={table.getState().pagination.pageSize}
            page={table.getState().pagination.pageIndex}
            onPageChange={(_, page) => {
              table.setPageIndex(page)
            }}
          />
        </Card>
      </div>

      {/* Delete Confirmation Modal */}

      <DeleteConfirmModal
        open={isDeleteDialogOpen}
        title='Delete User'
        message='Are you sure you want to delete the User?'
        name={menuRowData?.firstName}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => handleDelete(menuRowData!)}
      />

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <MenuItem onClick={() => menuRowData && handleEdit(menuRowData)}>
          <ListItemIcon>
            <i className='tabler-edit' />
          </ListItemIcon>
          Edit User
        </MenuItem>
        <MenuItem
          onClick={() => {
            setIsDeleteDialogOpen(true)
            setAnchorEl(null)
          }}
        >
          <ListItemIcon>
            <i className='tabler-trash' />
          </ListItemIcon>
          Delete User
        </MenuItem>
      </Menu>
    </>
  )
}

export default ListUser
