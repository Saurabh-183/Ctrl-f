'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports

import Card from '@mui/material/Card'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import { Button, Checkbox, Grid, IconButton, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material'

// Third-party Imports
import classnames from 'classnames'
import type {
  Cell,
  CellContext,
  Column,
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  HeaderGroup,
  Row,
  Table} from '@tanstack/react-table';
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

// Component Imports
import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '../../components/TablePaginationComponent'

// Icon Imports
import ChevronRight from '@menu/svg/ChevronRight'

// Style Imports
import styles from '@core/styles/table.module.css'

// Utils

import { COLORS } from '@/utils/colors'

// ---------- Types ----------

export interface Brand {
  id: string | number
  brandName: string
  manufacturer: string
  origin: string
  focusCategory: string
  products: string
  headOffice: string
  segment: string
  isHidden?: boolean
}

interface ListBrandProps {
  data: Brand[]
}

// ---------- Helpers ----------

const columnHelper = createColumnHelper<Brand>()

const fuzzyFilter: FilterFn<Brand> = (row, columnId, value) => {
  const search = String(value ?? '')
    .toLowerCase()
    .trim()

  const cellValue = String(row.getValue(columnId) ?? '').toLowerCase()

  const itemRank = rankItem(cellValue, search)

  return itemRank.passed
}

// Debounced input for global search
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

const Filter = ({ column, table }: { column: Column<any, unknown>; table: Table<any> }) => {
  const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id)
  const columnFilterValue = column.getFilterValue()

  if (column.id === 'id') return null

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

// const MaxLengthCell = ({ value, maxLength }: { value: string; maxLength: number }) => {
//   if (!value) return <span>-</span>
//
//   return <span title={value}>{value.length > maxLength ? `${value.substring(0, maxLength)}...` : value}</span>
// }

const ListRecentQuotation: React.FC<ListBrandProps> = ({ data }) => {
  const router = useRouter()

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuRowData, setMenuRowData] = useState<Brand | null>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, brand: Brand) => {
    setAnchorEl(event.currentTarget)
    setMenuRowData(brand)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setMenuRowData(null)
  }

  const handleEdit = (brand: Brand) => {
    router.push(`/brands/update-brand/${brand.id}`)
    handleMenuClose()
  }

  const handleRemove = (brand: Brand) => {
    console.log('Remove brand', brand.id)
    toast.info(`Remove Brand: ${brand.brandName}`)
    handleMenuClose()
  }

  const handleToggleHide = (brand: Brand) => {
    console.log('Toggle hide brand', brand.id)
    toast.info(`${brand.isHidden ? 'Unhide' : 'Hide'} Brand: ${brand.brandName}`)
    handleMenuClose()
  }

  const columns = useMemo<ColumnDef<Brand, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }: { table: Table<Brand> }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }: { row: Row<Brand> }) => (
          <Checkbox checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
        ),
        enableSorting: false,
        enableColumnFilter: false
      },

      columnHelper.accessor('brandName', {
        header: 'Ref No.',
        cell: (info: CellContext<Brand, string>) => <span className='font-medium'>{info.getValue()}</span>,
        enableColumnFilter: false
      }),

      columnHelper.accessor('manufacturer', {
        header: 'Customer/Supplier',
        cell: (info: CellContext<Brand, string>) => <span className='font-medium'>{info.getValue()}</span>,
        enableColumnFilter: false
      }),

      columnHelper.accessor('origin', {
        header: 'Country',
        cell: (info: CellContext<Brand, string>) => <span className='font-medium'>{info.getValue()}</span>,
        enableColumnFilter: false
      }),

      columnHelper.accessor('focusCategory', {
        header: 'Gross Profit(%)',
        cell: (info: CellContext<Brand, string>) => <span className='font-medium'>{info.getValue()}</span>,
        enableColumnFilter: false
      }),

      columnHelper.accessor('products', {
        header: 'Date',
        cell: (info: CellContext<Brand, string>) => <span className='font-medium'>{info.getValue()}</span>,
        enableColumnFilter: false
      }),

      columnHelper.accessor('headOffice', {
        header: 'Status',
        cell: (info: CellContext<Brand, string>) => <span className='font-medium'>{info.getValue()}</span>,
        enableColumnFilter: false
      }),

      columnHelper.accessor('segment', {
        header: 'Reason',
        cell: (info: CellContext<Brand, string>) => <span className='font-medium'>{info.getValue()}</span>,
        enableColumnFilter: false
      }),

      columnHelper.accessor('id', {
        header: 'Action',
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }: { row: Row<Brand> }) => (
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

  const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)

  // const handleAddBrand = () => {
  //   router.push('/brands/add-brand')
  // }

  const handleExportBrands = (brands: Brand[]) => {
    try {
      if (!brands || brands.length === 0) {
        toast.error('No data available for export')

        return
      }

      console.log('Export brands', brands)
      toast.success('Brand report exported')
    } catch (error) {
      console.error('Error exporting brands:', error)
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
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={12} md={4}>
              <Typography variant='h5'>Recent Quotations</Typography>
            </Grid>

            <Grid item xs={12} md={8} display='flex' justifyContent='flex-end' alignItems='center' gap={2}>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                placeholder='Search...'
                className='w-full'
                style={{ maxWidth: 250 }}
              />

              <Button
                variant='outlined'
                startIcon={<i className='tabler-download' style={{ transform: 'rotate(180deg)' }} />}
                onClick={() => handleExportBrands(selectedRows.length ? selectedRows : data)}
                sx={{
                  color: COLORS.black,
                  borderWidth: 1,
                  borderColor: COLORS.black,
                  '&:hover': {
                    borderColor: COLORS.black,
                    backgroundColor: 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                Export Report
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Table Card */}
        <Card variant='outlined'>
          <div className='overflow-x-auto'>
            <table className={styles.table}>
              <thead>
                {table.getHeaderGroups().map((headerGroup: HeaderGroup<Brand>) => (
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
                  {table.getRowModel().rows.map((row: Row<Brand>) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell: Cell<Brand, unknown>) => (
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

      {/* Row Action Menu */}
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
          Edit
        </MenuItem>
        <MenuItem onClick={() => menuRowData && handleRemove(menuRowData)}>
          <ListItemIcon>
            <i className='tabler-trash' />
          </ListItemIcon>
          Remove
        </MenuItem>
        <MenuItem onClick={() => menuRowData && handleToggleHide(menuRowData)}>
          <ListItemIcon>
            <i className='tabler-eye-off' />
          </ListItemIcon>
          {menuRowData?.isHidden ? 'Unhide' : 'Hide'}
        </MenuItem>
      </Menu>
    </>
  )
}

export default ListRecentQuotation
