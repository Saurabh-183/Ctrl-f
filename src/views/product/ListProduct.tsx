'use client'

// React Imports
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { redirect, useRouter } from 'next/navigation'

import { toast } from 'react-toastify'

// MUI Imports
import Card from '@mui/material/Card'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import { Box, Button, Checkbox, Grid, IconButton, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material'

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
  Table
} from '@tanstack/react-table'

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

import ExcelJS from 'exceljs'

import { saveAs } from 'file-saver'

import DeleteConfirmModal from '@/components/model/DeleteConfirmModal'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '../../components/TablePaginationComponent'

// Icon Imports
import ChevronRight from '@menu/svg/ChevronRight'

// Style Imports
import styles from '@core/styles/table.module.css'
import { COLORS } from '@/utils/colors'
import type { ProductData } from '@/services/product'
import FileUploader from '@/components/FileUploader'
import ConfirmPriceUpdateModal from '@/components/model/ConfirmPriceUpdateModal'
import AttributePriceModal from '@/components/model/AttributePriceModal'
import { formatDate } from '@/utils/date'

// ---------- Types ----------

export interface AttributeItem {
  attributeName: string
  attributeValue: string
}

export interface ProductPriceItem {
  productCode: string
  attributeJson: AttributeItem[]
  oldPrice: number
  newPrice: number
}

export interface AttributeRow {
  attributeJson: AttributeItem[]
  price: number
  oldPrice: number
}

// Dialog data type
export type DialogData = AttributeRow[] | null

interface ListProductProps {
  data: ProductData[]
  token: string | null
}

const columnHelper = createColumnHelper<ProductData>()

const fuzzyFilter: FilterFn<ProductData> = (row, columnId, value) => {
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

const ListProduct: React.FC<ListProductProps> = ({ data, token }) => {
  const router = useRouter()

  const controllerRef = useRef<AbortController | null>(null)

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')

  const [menuRowData, setMenuRowData] = useState<ProductData | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [anchorElImportProductMenu, setAnchorElImportProductMenu] = useState<null | HTMLElement>(null)
  const [anchorElUploadImages, setAnchorElUploadImages] = useState<null | HTMLElement>(null)
  const [confirmPriceModalOpen, setConfirmPriceModalOpen] = useState<boolean>(false)
  const [priceExcelFile, setPriceExcelFile] = useState<File | null>(null)
  const [previewPriceData, setPreviewPriceData] = useState<ProductPriceItem[]>([])
  const [openDialog, setOpenDialog] = useState(false)

  // 1. Fixed: Destructured 'dialogData' properly so it can be used in JSX
  const [dialogData, setDialogData] = useState<DialogData>(null)

  const [loadingDialog, setLoadingDialog] = useState(false)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, product: ProductData) => {
    setAnchorEl(event.currentTarget)
    setMenuRowData(product)
  }

  const handleMenuOpenImportItems = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorElImportProductMenu(e.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setMenuRowData(null)
  }

  const handleDelete = async (product: ProductData) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/product/delete-product?id=${product.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await res.json()

      if (result.status === 200) {
        toast.success('product deleted successfully')
        router.refresh()
      } else {
        toast.error('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('An error occurred while deleting the product')
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const handleExcelUpload = async (files: File[]) => {
    if (!files.length) return

    if (!token) {
      redirect('/login')
    }

    const file = files[0]

    const formData = new FormData()

    formData.append('file', file)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/product/upload-product-excel-price-preview`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      const result = await res.json()

      console.log('result: ', result)

      if (!res.ok) {
        throw new Error(result?.message || 'Upload failed')
      }

      if (result.status === 200) {
        setPreviewPriceData(result.data)
        setConfirmPriceModalOpen(true)
      }

      setPriceExcelFile(file)
    } catch (error: any) {
      toast.error(error.message || 'Excel upload failed')
    } finally {
      setAnchorElImportProductMenu(null)
    }
  }

  const downloadProductSample = async () => {
    if (!token) {
      redirect('/login')
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/product/download-product-sample`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Failed to download sample file')
      }

      const blob = await res.blob()

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = 'product_sample.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Sample file downloaded successfully')
      setAnchorElImportProductMenu(null)
    } catch (error: any) {
      toast.error(error.message || 'Download failed')
    }
  }

  const handleZipUploadImages = async (files: File[]) => {
    if (!files.length) return

    if (!token) {
      redirect('/login')
    }

    const formData = new FormData()

    formData.append('file', files[0])

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/product/upload-product-images`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result?.message || 'Upload failed')
      }

      toast.success('Zip uploaded successfully')
    } catch (error: any) {
      toast.error(error.message || 'Zip upload failed')
    } finally {
      setAnchorElUploadImages(null)
    }
  }

  const handleConfirmUpdatePrice = async () => {
    if (!priceExcelFile) {
      toast.error('No file found. Please upload again.')

      return
    }

    if (!token) {
      redirect('/login')
    }

    const formData = new FormData()

    formData.append('file', priceExcelFile)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/product/upload-product-excel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result?.message || 'Upload failed')
      }

      toast.success('Product uploaded successfully')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Excel upload failed')
    } finally {
      setConfirmPriceModalOpen(false)
    }
  }

  const handleRowClick = async (productId: number) => {
    controllerRef.current?.abort()
    controllerRef.current = new AbortController()

    try {
      setLoadingDialog(true)
      setOpenDialog(true)

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/product/product-detail-list?id=${productId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        },
        signal: controllerRef.current.signal
      })

      if (!res.ok) {
        throw new Error('Failed to fetch product data')
      }

      const json = await res.json()

      if (json.status === 200) {
        const mappedAttributes: AttributeRow[] = (json.data.attributes || []).map((attr: any) => ({
          attributeJson: attr.attributeJson || [],
          price: Number(attr.price ?? 0),
          oldPrice: Number(attr.oldPrice ?? 0)
        }))

        setDialogData(mappedAttributes)
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        toast.error('Failed to load attribute prices')
        setOpenDialog(false)
      }
    } finally {
      setLoadingDialog(false)
    }
  }

  const handleEditProduct = (product: ProductData) => {
    router.push(`/product/update-product/${product.id}`)
    handleMenuClose()
  }

  const columns = useMemo<ColumnDef<ProductData, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }: { table: Table<ProductData> }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }: { row: Row<ProductData> }) => (
          <Checkbox checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
        ),
        enableSorting: false,
        enableColumnFilter: false
      },

      columnHelper.accessor('productType', {
        header: 'Product Name',
        cell: (info: CellContext<ProductData, string>) => <span className='font-medium'>{info.getValue()}</span>,
        enableColumnFilter: false
      }),

      columnHelper.accessor('productCode', {
        header: 'Product Code',
        cell: (info: CellContext<ProductData, string>) => <span className='font-medium'>{info.getValue()}</span>,
        enableColumnFilter: false
      }),

      columnHelper.accessor('unitsPerCarton', {
        header: 'Units/Carton',
        cell: (info: CellContext<ProductData, string>) => <span className='font-medium'>{info.getValue()}</span>,
        enableColumnFilter: false
      }),

      columnHelper.accessor('description', {
        header: 'Description',
        cell: (info: CellContext<ProductData, string>) => (
          <div
            dangerouslySetInnerHTML={{ __html: info.getValue() }}
            style={{
              maxWidth: 300,
              maxHeight: 60,
              overflow: 'hidden',
              fontSize: 13,
              lineHeight: 1.4
            }}
          />
        ),
        enableColumnFilter: false
      }),

      columnHelper.accessor('totalWeightPerCarton', {
        header: 'totalWeightPerCarton',
        cell: (info: CellContext<ProductData, string>) => <span className='font-medium'>{info.getValue()}</span>,
        enableColumnFilter: false
      }),
      columnHelper.accessor('unitsPerCarton', {
        header: 'unitsPerCarton',
        cell: (info: CellContext<ProductData, string>) => <span className='font-medium'>{info.getValue()}</span>,
        enableColumnFilter: false
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created At',
        cell: info => <span className='font-medium'>{formatDate(info.getValue())}</span>,
        enableColumnFilter: false
      }),

      columnHelper.accessor('id', {
        header: 'Action',
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }: { row: Row<ProductData> }) => (
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

  const handleExportProducts = async (products: ProductData[]) => {
    try {
      if (!products || products.length === 0) {
        toast.error('No data available for export')

        return
      }

      // eslint-disable-next-line import/no-named-as-default-member
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Products')

      worksheet.columns = [
        { header: 'S.No', key: 'sn', width: 8 },
        { header: 'Product Name', key: 'productType', width: 25 },
        { header: 'Product Code', key: 'productCode', width: 20 },
        { header: 'Units / Carton', key: 'unitsPerCarton', width: 18 },
        { header: 'Total Weight / Carton', key: 'totalWeightPerCarton', width: 22 },
        { header: 'Description', key: 'description', width: 40 },
        { header: 'Created At', key: 'createdAt', width: 18 }
      ]

      worksheet.getRow(1).font = { bold: true }
      products.forEach((item, index) => {
        worksheet.addRow({
          sn: index + 1,
          productType: item.productType,
          productCode: item.productCode,
          unitsPerCarton: item.unitsPerCarton,
          totalWeightPerCarton: item.totalWeightPerCarton,
          description: item.description
            ? item.description.replace(/<[^>]*>/g, '') // remove HTML
            : '',
          createdAt: formatDate(item.createdAt)
        })
      })

      const buffer = await workbook.xlsx.writeBuffer()

      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      saveAs(blob, `Product_Master_${Date.now()}.xlsx`)
      toast.success('Product Excel exported successfully')
    } catch (error) {
      console.error('Excel export error:', error)
      toast.error('Failed to export Excel')
    }
  }

  // @ts-ignore
  return (
    <>
      <div className='flex flex-col gap-4'>
        <Card variant='outlined' sx={{ p: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant='h5' mb={2}>
                Product Master ({data.length})
              </Typography>
            </Grid>

            <Grid item xs={12} container alignItems='center' justifyContent='space-between'>
              <Grid item xs={12} sm={3}>
                <DebouncedInput
                  value={globalFilter ?? ''}
                  onChange={value => setGlobalFilter(String(value))}
                  placeholder='Search Brands...'
                  className='w-full'
                />
              </Grid>

              <Grid item xs={12} sm={9} display='flex' justifyContent='flex-end' gap={2}>
                <Button
                  variant='outlined'
                  startIcon={<i className='tabler-download' style={{ transform: 'rotate(180deg)' }} />}
                  onClick={() => handleExportProducts(data)}
                >
                  Export
                </Button>

                <Button
                  variant='outlined'
                  startIcon={<i className='tabler-upload' />}
                  onClick={e => setAnchorElUploadImages(e.currentTarget)}
                >
                  Upload Images
                </Button>

                <Button
                  variant='outlined'
                  startIcon={<i className='tabler-download' />}
                  endIcon={<i className='tabler-caret-down-filled' />}
                  onClick={handleMenuOpenImportItems}
                >
                  Import Items
                </Button>
                <Button
                  onClick={() => router.push('/product/add-product')}
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
                  Add Product
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
              {table.getHeaderGroups().map((headerGroup: HeaderGroup<ProductData>) => (
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
                {table.getRowModel().rows.map((row: Row<ProductData>) => (
                  <tr key={row.id} onClick={() => handleRowClick(row.original.id)} style={{ cursor: 'pointer' }}>
                    {row.getVisibleCells().map((cell: Cell<ProductData, unknown>) => (
                      <td
                        key={cell.id}
                        onClick={e => {
                          // Prevent row click for checkbox / action column
                          if (cell.column.id === 'select' || cell.column.id === 'id') {
                            e.stopPropagation()
                          }
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
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
        <MenuItem onClick={() => menuRowData && handleEditProduct(menuRowData)}>
          <ListItemIcon>
            <i className='tabler-edit' />
          </ListItemIcon>
          Edit Product
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
          Delete Product
        </MenuItem>
      </Menu>

      {/* Import Product Menu */}
      <Menu
        anchorEl={anchorElImportProductMenu}
        open={Boolean(anchorElImportProductMenu)}
        onClose={() => setAnchorElImportProductMenu(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        {/* Download sample */}
        <MenuItem
          onClick={() => {
            downloadProductSample()
          }}
        >
          <ListItemIcon>
            <i className='tabler-download' />
          </ListItemIcon>
          Download Sample File product
        </MenuItem>

        {/* Upload Excel */}
        <MenuItem disableRipple sx={{ cursor: 'default' }}>
          <Box sx={{ width: 320 }}>
            <FileUploader
              value={[]}

              // @ts-ignore
              onChange={handleExcelUpload}
              allowedTypes={['excel']}
              maxFiles={1}
              maxSizeMB={5}
            />
          </Box>
        </MenuItem>
      </Menu>

      {/* Import Upload Images */}
      <Menu
        anchorEl={anchorElUploadImages}
        open={Boolean(anchorElUploadImages)}
        onClose={() => setAnchorElUploadImages(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <MenuItem disableRipple sx={{ cursor: 'default' }}>
          <Box sx={{ width: 320 }}>
            <FileUploader
              value={[]}
              allowedTypes={['zip']}

              // @ts-ignore
              onChange={handleZipUploadImages}
              maxFiles={1}
              maxSizeMB={5}
              message='Please ensure that the image name and the product code are same.'
            />
          </Box>
        </MenuItem>
      </Menu>

      <ConfirmPriceUpdateModal
        open={confirmPriceModalOpen}
        rows={previewPriceData}
        onCancel={() => setConfirmPriceModalOpen(false)}
        onConfirm={handleConfirmUpdatePrice}
      />

      <DeleteConfirmModal
        open={isDeleteDialogOpen}
        title='Delete User'
        message='Are you sure you want to delete the User?'
        name={menuRowData?.productType}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => handleDelete(menuRowData!)}
      />

      <AttributePriceModal
        open={openDialog}
        loading={loadingDialog}
        onClose={() => setOpenDialog(false)}
        attributes={dialogData}
      />
    </>
  )
}

export default ListProduct
