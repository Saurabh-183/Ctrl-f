'use client'

import * as React from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  TablePagination,
  TableContainer
} from '@mui/material'

type Attribute = {
  attributeName: string
  attributeValue: string
}

export type PriceRow = {
  productCode: string
  attributeJson: Attribute[]
  oldPrice: number
  newPrice: number
}

interface ConfirmPriceUpdateModalProps {
  open: boolean
  rows: PriceRow[]
  onCancel: () => void
  onConfirm: () => void
}

const getStatus = (prev: number, next: number) => {
  if (next > prev) return 'Increased'
  if (next < prev) return 'Decreased'

  return 'No Change'
}

const statusColor = (status: string) => {
  if (status === 'Increased') return 'success'
  if (status === 'Decreased') return 'error'

  return 'default'
}

const formatPrice = (value?: number | string | null) => {
  const num = Number(value)

  if (Number.isNaN(num)) return '—'

  return `₹${num.toLocaleString()}`
}

export default function ConfirmPriceUpdateModal({ open, rows, onCancel, onConfirm }: ConfirmPriceUpdateModalProps) {
  console.log('rows: ', rows)

  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(5)

  const attributeColumns = React.useMemo(() => {
    const set = new Set<string>()

    rows.forEach(r => r.attributeJson.forEach(a => set.add(a.attributeName)))

    return Array.from(set)
  }, [rows])

  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const increased = rows.filter(r => r.newPrice > r.oldPrice).length
  const decreased = rows.filter(r => r.newPrice < r.oldPrice).length
  const unchanged = rows.length - increased - decreased

  return (
    <Dialog
      open={open}
      maxWidth='md'
      fullWidth
      onClose={(event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') return
        onCancel()
      }}
      PaperProps={{ sx: { borderRadius: 3, position: 'relative' } }}
    >
      {/* Close */}
      <IconButton onClick={onCancel} sx={{ position: 'absolute', top: 12, right: 12 }}>
        <i className='tabler-x' />
      </IconButton>

      {/* Title */}
      <DialogTitle sx={{ fontWeight: 600, pr: 6 }}>
        Confirm Price Update
        <Typography variant='body2' color='text.secondary'>
          Review the price changes before confirming
        </Typography>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ pt: 2 }}>
        {/* Table */}
        <TableContainer
          sx={{
            maxHeight: 420,
            overflowX: 'auto',
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Table
            stickyHeader
            size='small'
            sx={{
              minWidth: 1000,
              borderCollapse: 'collapse',
              '& th, & td': {
                border: '1px solid',
                borderColor: 'divider',
                whiteSpace: 'nowrap'
              }
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Product Code</TableCell>

                {attributeColumns.map(attr => (
                  <TableCell key={attr}>{attr.toUpperCase()}</TableCell>
                ))}

                <TableCell>Previous Price</TableCell>
                <TableCell>New Price</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedRows.map((row, index) => {
                const status = getStatus(row.oldPrice, row.newPrice)

                return (
                  <TableRow key={index} hover>
                    <TableCell sx={{ fontWeight: 500, color: 'primary.main' }}>{row.productCode}</TableCell>

                    {attributeColumns.map(attr => {
                      const value =
                        row.attributeJson.find(a => a.attributeName?.toUpperCase() === attr.toUpperCase())
                          ?.attributeValue ?? '-'

                      return <TableCell key={attr}>{value}</TableCell>
                    })}

                    <TableCell>{formatPrice(row.oldPrice)}</TableCell>
                    <TableCell>{formatPrice(row.newPrice)}</TableCell>

                    <TableCell>
                      <Chip
                        size='small'
                        label={status}
                        color={statusColor(status) as any}
                        variant={status === 'No Change' ? 'outlined' : 'filled'}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component='div'
          count={rows.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />

        <Box mt={2} p={1.5} display='flex' gap={4} bgcolor='grey.50' borderRadius={2}>
          <Typography variant='caption'>Total Products: {rows.length}</Typography>
          <Typography variant='caption' color='success.main'>
            Price Increased: {increased}
          </Typography>
          <Typography variant='caption' color='error.main'>
            Price Decreased: {decreased}
          </Typography>
          <Typography variant='caption'>No Change: {unchanged}</Typography>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant='outlined' onClick={onCancel}>
          Cancel
        </Button>
        <Button variant='contained' onClick={onConfirm}>
          Confirm & Update Prices
        </Button>
      </DialogActions>
    </Dialog>
  )
}
