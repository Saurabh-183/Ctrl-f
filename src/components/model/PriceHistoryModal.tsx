'use client'

import React, { useMemo, useState } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Box,
  useTheme,
  Typography
} from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import { formatDate } from '@/utils/date'

interface AttributeItem {
  attributeName: string
  attributeValue: string | null
}

interface PriceHistoryItem {
  productName: string
  productCode: string
  attributes: AttributeItem[]
  oldPrice: number | string | null
  newPrice: number | string | null
  updatedAt: string
}

interface Props {
  open: boolean
  data: PriceHistoryItem[]
  onClose: () => void
}

const formatPrice = (value: number | string | null) => (value != null ? `₹${Number(value).toLocaleString()}` : '-')

export default function PriceHistoryModal({ open, data, onClose }: Props) {
  const theme = useTheme()
  const [search, setSearch] = useState('')

  const filteredData = useMemo(() => {
    if (!search) return data
    const s = search.toLowerCase()

    return data.filter(i => i.productName.toLowerCase().includes(s) || i.productCode.toLowerCase().includes(s))
  }, [search, data])

  return (
    <Dialog open={open} maxWidth='md' fullWidth>
      <IconButton onClick={onClose} sx={{ position: 'absolute', top: 12, right: 12 }}>
        <i className='tabler-x' />
      </IconButton>

      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>Price History</DialogTitle>

      <DialogContent>
        {/* Search */}
        <Box mb={2} display='flex' justifyContent='flex-end'>
          <Box width={300}>
            <CustomTextField
              fullWidth
              placeholder='Search product name or code'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </Box>
        </Box>

        {/* Table */}
        <TableContainer
          sx={{
            maxHeight: 350,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2
          }}
        >
          <Table stickyHeader size='small' sx={{ minWidth: 700, borderCollapse: 'collapse' }}>
            <TableHead>
              <TableRow>
                {['Product', 'Attributes', 'Old Price', 'New Price', 'Updated At'].map(h => (
                  <TableCell
                    key={h}
                    sx={{
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.grey[100],
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align='center'>
                    No price history found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row, i) => (
                  <TableRow key={i}>
                    {/* Product */}
                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                      <strong>{row.productName}</strong>
                      <br />
                      <small>({row.productCode})</small>
                    </TableCell>

                    {/* Attributes */}
                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                      {row.attributes.map((attr, idx) => (
                        <div key={idx}>
                          <strong>{attr.attributeName}:</strong> {attr.attributeValue ?? '-'}
                        </div>
                      ))}
                    </TableCell>

                    {/* Prices */}
                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                      {formatPrice(row.oldPrice)}
                    </TableCell>

                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                      {formatPrice(row.newPrice)}
                    </TableCell>

                    {/* Date */}
                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                      {formatDate(row.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredData.length === 0 && (
          <Typography align='center' mt={2} color='text.secondary'>
            No records available
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  )
}
