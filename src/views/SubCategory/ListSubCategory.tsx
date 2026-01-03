'use client'

// React Imports
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { toast } from 'react-toastify'

// MUI Imports
import Card from '@mui/material/Card'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import { Button, Checkbox, Grid, IconButton, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material'

// TanStack Table Imports
import type {
  Cell,
  Column,
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  HeaderGroup,
  Row,
  Table
} from '@tanstack/react-table'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'

import classnames from 'classnames'

// Custom Imports
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '../../components/TablePaginationComponent'
import DeleteConfirmModal from '@/components/model/DeleteConfirmModal'
import styles from '@core/styles/table.module.css'
import { COLORS } from '@/utils/colors'
import ChevronRight from '@/@menu/svg/ChevronRight'

interface SubCategoryData {
  id: number
  subCategory: string
  isActive: boolean
}

interface Props {
  token: string | null
}

const columnHelper = createColumnHelper<SubCategoryData>()

const fuzzyFilter: FilterFn<SubCategoryData> = (row, columnId, value) => {
  const itemRank = rankItem(String(row.getValue(columnId) ?? '').toLowerCase(), String(value ?? '').toLowerCase())

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

  useEffect(() => setValue(initialValue), [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce)

return () => clearTimeout(timeout)
  }, [debounce, onChange, value])

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

const ListSubCategory = ({ token }: Props) => {
  const router = useRouter()

  const [data, setData] = useState<SubCategoryData[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuRow, setMenuRow] = useState<SubCategoryData | null>(null)
  const [openDelete, setOpenDelete] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/sub-category/sub-category-list?status=all`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const json = await res.json()

      if (json.status === 200) {
        setData(
          json.data.map((item: any) => ({
            id: item.id,
            subCategory: item.subCategory,
            isActive: item.isActive
          }))
        )
      } else toast.error('Failed to load sub categories')
    } catch {
      toast.error('Something went wrong')
    }
  }, [token])

  useEffect(() => {
    if (token) fetchData()
  }, [fetchData, token])

  const handleEdit = (row: SubCategoryData) => {
    router.push(`/edit-sub-category/${row.id}`)
    setAnchorEl(null)
  }

  const handleDelete = async () => {
    if (!menuRow) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/sub-category/delete-sub-category?id=${menuRow.id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      })

      const json = await res.json()

      if (json.status === 200) {
        toast.success('Deleted successfully')
        fetchData()
      } else toast.error(json.message)
    } catch {
      toast.error('Delete failed')
    } finally {
      setOpenDelete(false)
      setAnchorEl(null)
    }
  }

  const columns = useMemo<ColumnDef<SubCategoryData, any>[]>(
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
      columnHelper.accessor('subCategory', {
        header: 'Sub Category',
        cell: info => <span className='font-medium'>{info.getValue()}</span>,
        enableColumnFilter: false
      }),
      {
        id: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <IconButton
            size='small'
            onClick={e => {
              setAnchorEl(e.currentTarget)
              setMenuRow(row.original)
            }}
          >
            <i className='tabler-dots-vertical' />
          </IconButton>
        )
      }
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { globalFilter, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <>
      <Card sx={{ p: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='h5'>Sub Category ({data.length})</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <DebouncedInput
              value={globalFilter}
              onChange={v => setGlobalFilter(String(v))}
              placeholder='Search...'
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6} display='flex' justifyContent='flex-end' gap={2}>
            <Button variant='outlined'>Export Report</Button>

            <Button
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
              onClick={() => router.push('/create-sub-category')}
            >
              Create Sub Category
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card variant='outlined'>
        <div className='overflow-x-auto'>
          <table className={styles.table}>
            <thead>
              {table.getHeaderGroups().map((headerGroup: HeaderGroup<SubCategoryData>) => (
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
                {table.getRowModel().rows.map((row: Row<SubCategoryData>) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell: Cell<SubCategoryData, unknown>) => (
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

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => menuRow && handleEdit(menuRow)}>
          <ListItemIcon>
            <i className='tabler-edit' />
          </ListItemIcon>{' '}
          Edit
        </MenuItem>
        <MenuItem onClick={() => setOpenDelete(true)}>
          <ListItemIcon>
            <i className='tabler-trash' />
          </ListItemIcon>{' '}
          Delete
        </MenuItem>
      </Menu>

      <DeleteConfirmModal
        open={openDelete}
        title='Delete Sub Category'
        message='Are you sure you want to delete this sub category?'
        onCancel={() => setOpenDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default ListSubCategory
