'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material'
import { Button, Checkbox, Grid, IconButton, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'

import type { ColumnDef, ColumnFiltersState, FilterFn } from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'
import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '../../components/TablePaginationComponent'
import styles from '@core/styles/table.module.css'
import { COLORS } from '@/utils/colors'
import DeleteConfirmModal from '@/components/model/DeleteConfirmModal'
import { exportToExcel } from '@/utils/exportToExcel'

// ---------------- Types ----------------

export interface Customer {
  id: number
  customerName: string
  customerCode: string
  email: string
  phone: string
  country: string
  whatsappNo: string
  ownerName: string
  salesManagerName: string
  inceptionDate: string
  domesticOffices: number
  internationalOffices: number
  turnoverPerMonth: number
  salesTeamSize: number
  employeeCount: number
  importVolumePerMonth: number
  importingSince: string
  isActive: boolean
  address: string
  isHidden: boolean
}

interface ListCustomerProps {
  token: string
}

// ---------------- Helpers ----------------

const columnHelper = createColumnHelper<Customer>()

const fuzzyFilter: FilterFn<Customer> = (row, columnId, value) => {
  const search = String(value ?? '')
    .toLowerCase()
    .trim()

  const cellValue = String(row.getValue(columnId) ?? '').toLowerCase()

  return rankItem(cellValue, search).passed
}

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

// ---------------- COMPONENT ----------------

const ListCustomer: React.FC<ListCustomerProps> = ({ token }) => {
  const router = useRouter()

  const [data, setData] = useState<Customer[]>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuRowData, setMenuRowData] = useState<Customer | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // ------------ Fetch Data ------------
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/customer/customer-list`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) return console.error('Failed to fetch customer list')

      const json = await response.json()

      const mapped: Customer[] = json.data.map((item: any) => ({
        id: item.id,
        customerName: item.customerName,
        customerCode: item.customerCode,
        email: item.email,
        phone: item.phoneNo,
        country: item.country,
        whatsappNo: item.whatsappNo,
        address: item.address,
        ownerName: item.ownerName,
        salesManagerName: item.salesManagerName,
        inceptionDate: item.inceptionDate,
        domesticOffices: item.domesticOffices,
        internationalOffices: item.internationalOffices,
        turnoverPerMonth: item.turnoverPerMonth,
        salesTeamSize: item.salesTeamSize,
        employeeCount: item.employeeCount,
        importVolumePerMonth: item.importVolumePerMonth,
        importingSince: item.importingSince,
        isActive: item.isActive,
      }))

      setData(mapped)
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }, [token])

  useEffect(() => {
    if (token) fetchData()
  }, [fetchData, token])

  const handleMenuOpen = (event: any, row: Customer) => {
    setAnchorEl(event.currentTarget)
    setMenuRowData(row)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setMenuRowData(null)
  }

  const handleEdit = (customer: Customer) => {
    router.push(`/customer/update-customer/${customer.id}`)
    handleMenuClose()
  }

  const handleRemove = async (customer: Customer) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/customer/delete-customer?id=${customer.id}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const res = await response.json()

      if (response.ok) {
        toast.success('Customer deleted successfully')
        await fetchData()
      } else {
        toast.error(res?.message || 'Failed to delete customer')
      }
    } catch (error) {
      console.error('Delete Customer Error:', error)
      toast.error('Something went wrong')
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const renderValueOrDash = (info: { getValue: () => any }) => {
    const value = info.getValue()

    return <span className={`font-medium ${value ? 'text-left' : 'flex justify-center'}`}>{value || '-'}</span>
  }


  const columns = useMemo<ColumnDef<Customer, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
      },

      columnHelper.accessor('customerName', {
        header: 'Customer Name',
       cell: renderValueOrDash,
      }),

      columnHelper.accessor('customerCode', {
        header: 'Customer Code',
       cell: renderValueOrDash,
      }),

      columnHelper.accessor('email', {
        header: 'Email',
       cell: renderValueOrDash,
      }),

      columnHelper.accessor('phone', {
        header: 'Phone',
       cell: renderValueOrDash,
      }),

      columnHelper.accessor('country', {
        header: 'Country',
       cell: renderValueOrDash,
      }),

      columnHelper.accessor('whatsappNo', {
        header: 'WhatsApp No.',
       cell: renderValueOrDash,
      }),

      columnHelper.accessor('address', {
        header: 'Address',
       cell: renderValueOrDash,
      }),

      columnHelper.accessor('ownerName', {
        header: 'Owner',
       cell: renderValueOrDash,
      }),

      columnHelper.accessor('salesManagerName', {
        header: 'Sales Manager',
       cell: renderValueOrDash,
      }),

      columnHelper.accessor('inceptionDate', {
        header: 'Inception Date',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('domesticOffices', {
        header: 'Domestic Offices',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('internationalOffices', {
        header: 'International Offices',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('turnoverPerMonth', {
        header: 'Turnover/Month',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),
      
      columnHelper.accessor('salesTeamSize', {
        header: 'Sales Team',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),
      columnHelper.accessor('employeeCount', {
        header: 'Employee Team',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('importVolumePerMonth', {
        header: 'Import Volume / Month',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),
      columnHelper.accessor('importingSince', {
        header: 'Importing since',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('id', {
        header: 'Action',
        cell: ({ row }) => (
          <IconButton onClick={e => handleMenuOpen(e, row.original)}>
            <i className='tabler-dots-vertical' />
          </IconButton>
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  const selectedRows = table.getSelectedRowModel().rows.map(r => r.original as Customer)
  const selectedCount = table.getSelectedRowModel().rows.length

  const handleExportCustomers = () => {
    try {
      if (!selectedRows.length) {
        toast.error('No data available for export')

        return
      }

      exportToExcel(selectedRows, 'customer_data', [
        { key: 'id', label: 'Customer ID' },
        { key: 'customerName', label: 'Customer Name' },
        { key: 'customerCode', label: 'Customer Code' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'country', label: 'Country' },
        { key: 'whatsappNo', label: 'WhatsApp No' },
        { key: 'ownerName', label: 'Owner Name' },
        { key: 'salesManagerName', label: 'Sales Manager' },
        { key: 'inceptionDate', label: 'Inception Date' },
        { key: 'domesticOffices', label: 'Domestic Offices' },
        { key: 'internationalOffices', label: 'International Offices' },
        { key: 'turnoverPerMonth', label: 'Turnover / Month' },
        { key: 'salesTeamSize', label: 'Sales Team Size' },
        { key: 'employeeCount', label: 'Employee Count' },
        { key: 'importVolumePerMonth', label: 'Import Volume / Month' },
        { key: 'importingSince', label: 'Importing Since' },
        { key: 'address', label: 'Address' },
        { key: 'isActive', label: 'Active' }
      ])

      console.log('selectedRows: ', selectedRows)

      table.resetRowSelection()

      toast.success('Customer data exported successfully')
    } catch (error) {
      console.error('Error exporting customer_data:', error)
      toast.error('Failed to export customer data')
    }
  }

  return (
    <>
      <div className='flex flex-col gap-4'>
        <Card variant='outlined' sx={{ p: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant='h5' mb={2}>
                Customer Master ({data.length})
              </Typography>
            </Grid>

            <Grid item xs={12} container alignItems='center' justifyContent='space-between'>
              <Grid item xs={12} sm={6}>
                <DebouncedInput
                  value={globalFilter ?? ''}
                  onChange={value => setGlobalFilter(String(value))}
                  placeholder='Search Brands...'
                  className='w-full'
                />
              </Grid>

              <Grid item xs={12} sm={6} display='flex' justifyContent='flex-end' gap={2}>
                <Button
                  variant='outlined'
                  startIcon={<i className='tabler-download' style={{ transform: 'rotate(180deg)' }} />}
                  onClick={handleExportCustomers}
                  disabled={selectedCount === 0}
                >
                  Export Report
                </Button>

                <Button
                  onClick={() => router.push('/customer/add-customer')}
                  variant='contained'
                  startIcon={<i className='tabler-plus' />}
                  sx={{
                    backgroundColor: COLORS.black,
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#000',
                      opacity: 0.9
                    }
                  }}
                >
                  Add Customer
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Card>

        {/* --- TABLE --- */}
        <Card variant='outlined'>
          <div className='overflow-x-auto'>
            <table className={styles.table}>
              <thead>
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(header => (
                      <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody>
                {table.getFilteredRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      No Data Available
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <TablePagination
            component={() => <TablePaginationComponent table={table} />}
            count={table.getFilteredRowModel().rows.length}
            rowsPerPage={table.getState().pagination.pageSize}
            page={table.getState().pagination.pageIndex}
            onPageChange={(_, page) => table.setPageIndex(page)}
          />
        </Card>
      </div>

      {/* Delete Confirmation Modal */}

      <DeleteConfirmModal
        open={isDeleteDialogOpen}
        title='Delete Customer'
        message='Are you sure you want to delete the Customer?'
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => handleRemove(menuRowData!)}
      />

      {/* --- MENU --- */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => menuRowData && handleEdit(menuRowData)}>
          <ListItemIcon>
            <i className='tabler-edit' />
          </ListItemIcon>
          Edit
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
          Remove
        </MenuItem>

        {/* <MenuItem onClick={() => menuRowData && handleToggleHide(menuRowData)}>
          <ListItemIcon>
            <i className='tabler-eye-off' />
          </ListItemIcon>
          {menuRowData?.isHidden ? 'Unhide' : 'Hide'}
        </MenuItem> */}
      </Menu>
    </>
  )
}

export default ListCustomer
