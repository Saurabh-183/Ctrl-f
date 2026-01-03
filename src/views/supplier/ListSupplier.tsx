'use client'

// React Imports
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import { Button, Checkbox, Grid, IconButton, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material'

// Third-party Imports
import classnames from 'classnames'

import type { ColumnDef, ColumnFiltersState, FilterFn } from '@tanstack/react-table'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'

import { rankItem } from '@tanstack/match-sorter-utils'

// Utils
import { toast } from 'react-toastify'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '../../components/TablePaginationComponent'

// Icon Imports
import ChevronRight from '@menu/svg/ChevronRight'

// Style Imports
import styles from '@core/styles/table.module.css'
import { COLORS } from '@/utils/colors'
import DeleteConfirmModal from '@/components/model/DeleteConfirmModal'

// import { exportToExcel } from '@/utils/exportToExcel'

// ---------- Types ----------

export interface Supplier {
  id: number
  supplierName: string
  supplierCode: string
  email: string
  phone: string
  country: string
  address: string
  whatsappNo: string
  wechatId: string
  brands: string
  ownerName: string
  salesManagerName: string
  inceptionDate: string
  employeePax: string | number
  domesticOffices: number
  internationalOffices: number
  turnoverPerMonth: number
  exportProduction: number
  paymentTerms: string
  bankName: string
  accountNo: string
  ifscCode: string
  isActive: boolean
  productionDetails: ProductionDetail[]
}

export interface ProductionDetail {
  categoryId: number
  categoryName: string
  productionCapacity: string
}

interface ListSupplierProps {
  token: string
}

// ---------- Helpers ----------

const columnHelper = createColumnHelper<Supplier>()

const fuzzyFilter: FilterFn<Supplier> = (row, columnId, value) => {
  const search = String(value ?? '')
    .toLowerCase()
    .trim()

  const cellValue = String(row.getValue(columnId) ?? '').toLowerCase()

  const itemRank = rankItem(cellValue, search)

  return itemRank.passed
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
  }, [debounce, onChange, value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const ListSupplier: React.FC<ListSupplierProps> = ({ token }) => {
  const router = useRouter()

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [data, setData] = useState<Supplier[]>([])

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuRowData, setMenuRowData] = useState<Supplier | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/supplier/supplier-list?status=active`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const res = await response.json()

        console.log('res: ', res)

        const mapped: Supplier[] = res?.data?.map((item: any) => ({
          id: item.id,
          supplierName: item.supplierName,
          supplierCode: item.supplierCode,
          email: item.email,
          phone: item.phoneNo,
          country: item.country,
          address: item.address,
          whatsappNo: item.whatsappNo || '',
          wechatId: item.wechatId || '',
          brands: item.brandSupplies?.map((b: any) => b.brandName).join(', ') || '',
          ownerName: item.ownerName,
          salesManagerName: item.salesManagerName,
          inceptionDate: item.inceptionDate,
          employeePax: item.employeePax,
          domesticOffices: item.domesticOffices,
          internationalOffices: item.internationalOffices,
          turnoverPerMonth: item.turnoverPerMonth,
          exportProduction: item.exportProduction,
          paymentTerms: item.paymentTerms,
          bankName: item.bankName,
          accountNo: item.accountNo,
          ifscCode: item.ifscCode,
          isActive: item.isActive,
          productionDetails: item.productionDetails
        }))

        setData(mapped)
      } else {
        console.error('Failed to fetch suppliers:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    fetchData()
  }, [fetchData, token])

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, supplier: Supplier) => {
    setAnchorEl(event.currentTarget)
    setMenuRowData(supplier)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setMenuRowData(null)
  }

  const handleEdit = (supplier: Supplier) => {
    router.push(`/supplier/update-supplier/${supplier.id}`)
    handleMenuClose()
  }

  const handleRemove = async (supplier: Supplier) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/supplier/delete-supplier?id=${supplier.id}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const res = await response.json()

      if (response.ok) {
        toast.success('Supplier deleted successfully')
        await fetchData()
        setIsDeleteDialogOpen(false)
      } else {
        toast.error(res?.message || 'Failed to delete supplier')
      }
    } catch (error) {
      console.error('Delete Supplier Error:', error)
      toast.error('Something went wrong')
    } finally {
      handleMenuClose()
    }
  }

  const renderValueOrDash = (info: { getValue: () => any }) => {
    const value = info.getValue()

    return <span className={`font-medium ${value ? 'text-left' : 'flex justify-center'}`}>{value || '-'}</span>
  }

  const columns = useMemo<ColumnDef<Supplier, any>[]>(
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
        cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />,
        enableSorting: false,
        enableColumnFilter: false
      },

      columnHelper.accessor('supplierName', {
        header: 'Supplier Name',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('supplierCode', {
        header: 'Supplier Code',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('phone', {
        header: 'Phone No.',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('wechatId', {
        header: 'Wechat Id',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('ownerName', {
        header: 'Owner Name',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('salesManagerName', {
        header: 'SalesManager Name',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('brands', {
        header: 'Brands',
        cell: renderValueOrDash,
        enableColumnFilter: false
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
        header: 'Turnover / Month',
        enableColumnFilter: false,
        cell: info => {
          const value = info.getValue()

return (
            <span className='font-medium'>
        {value ? `₹ ${Number(value).toLocaleString('en-IN')}` : '-'}
      </span>
          )
        }
      }),

      columnHelper.accessor('exportProduction', {
        header: 'Export Production',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('employeePax', {
        header: 'Employee Pax',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('paymentTerms', {
        header: 'Payment Terms',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('bankName', {
        header: 'Bank Details',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('accountNo', {
        header: 'Account Number',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('ifscCode', {
        header: 'IFSC Code',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('email', {
        header: 'Email',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('country', {
        header: 'Country',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('address', {
        header: 'Address',
        cell: renderValueOrDash,
        enableColumnFilter: false
      }),

      columnHelper.accessor('id', {
        header: 'Action',
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => (
          <IconButton
            size='small'
            onClick={e => handleMenuOpen(e, row.original)}
            aria-label='Actions'
            sx={{ color: '#232F6F' }}
          >
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
    filterFns: { fuzzy: fuzzyFilter },
    state: { columnFilters, globalFilter },
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

  // const selectedRows = table.getSelectedRowModel().rows.map(r => r.original)

  // const selectedCount = table.getSelectedRowModel().rows.length

  // const handleExportSuppliers = () => {
  //   try {
  //     if (!selectedRows || selectedRows.length === 0) {
  //       toast.error('No data available for export')
  //
  //       return
  //     }
  //
  //     exportToExcel(selectedRows, 'supplier_data', [
  //       { key: 'id', label: 'Supplier ID' },
  //       { key: 'supplierName', label: 'Supplier Name' },
  //       { key: 'supplierCode', label: 'Supplier Code' },
  //       { key: 'email', label: 'Email' },
  //       { key: 'phone', label: 'Phone No' },
  //       { key: 'address', label: 'Address' },
  //       { key: 'country', label: 'Country' },
  //       { key: 'brands', label: 'Brands' },
  //       { key: 'address', label: 'Address' },
  //       { key: 'whatsappNo', label: 'whatsapp No' },
  //       { key: 'wechatId', label: 'We chatId' },
  //       { key: 'ownerName', label: 'Owner Name' },
  //       { key: 'salesManagerName', label: 'Sales Manager Name' },
  //       { key: 'inceptionDate', label: 'Inception Date' },
  //       { key: 'employeePax', label: 'Employee Pax' },
  //       { key: 'domesticOffices', label: 'Comestic Offices' },
  //       { key: 'internationalOffices', label: 'InternationalvOffices' },
  //       { key: 'turnoverPerMonth', label: 'Turnover PerMonth' },
  //       { key: 'exportProduction', label: 'Export Production' },
  //       { key: 'paymentTerms', label: 'Payment Terms' },
  //       { key: 'bankName', label: 'Bank Name' },
  //       { key: 'accountNo', label: 'Account No' },
  //       { key: 'ifscCode', label: 'IFSC Code' },
  //       { key: 'isActive', label: 'Active' }
  //     ])
  //
  //     table.resetRowSelection()
  //
  //     toast.success('Brands data exported')
  //   } catch (error) {
  //     console.error('Error exporting brand_data:', error)
  //     toast.error('Failed to export report')
  //   }
  // }


  return (
    <>
      <div className='flex flex-col gap-4'>
        <Card variant='outlined' sx={{ p: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant='h5' mb={2}>
                Supplier Master ({data.length})
              </Typography>
            </Grid>

            <Grid item xs={12} container alignItems='center' justifyContent='space-between'>
              <Grid item xs={12} sm={6}>
                <DebouncedInput
                  value={globalFilter ?? ''}
                  onChange={value => setGlobalFilter(String(value))}
                  placeholder='Search Suppliers...'
                  className='w-full'
                />
              </Grid>

              <Grid item xs={12} sm={6} display='flex' justifyContent='flex-end' gap={2}>

                {/*<Button*/}
                {/*  variant='outlined'*/}
                {/*  startIcon={<i className='tabler-download' style={{ transform: 'rotate(180deg)' }} />}*/}
                {/*  onClick={() => handleExportSuppliers()}*/}
                {/*  disabled={selectedCount === 0}*/}
                {/*>*/}
                {/*  Export Report*/}
                {/*</Button>*/}

                {/* <Button variant='outlined' startIcon={<i className='tabler-upload' />} onClick={handleImportSuppliers}>
                  Import
                </Button> */}

                <Button
                  onClick={() => router.push('/supplier/add-supplier')}
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
                  Add Supplier
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Card>

        <Card variant='outlined'>
          <div className='overflow-x-auto'>
            <table className={styles.table}>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
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
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              )}
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
        title='Delete Supplier'
        message='Are you sure you want to delete the Supplier?'
        name={menuRowData?.supplierName || ''}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => handleRemove(menuRowData!)}
      />

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

export default ListSupplier
