import React, { useState } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Box,
  CircularProgress,
  Typography,
  TablePagination,
  useTheme,
  IconButton
} from '@mui/material'

interface AttributeItem {
  attributeName: string
  attributeValue: string
}

interface AttributeRow {
  attributeJson: AttributeItem[]
  price: number
  oldPrice: number
}

interface Props {
  open: boolean
  loading: boolean
  attributes: AttributeRow[] | null
  onClose: () => void
}

const getAttributeValue = (attrs: AttributeItem[], name: string) =>
  attrs.find(a => a.attributeName === name)?.attributeValue ?? '-'

export default function AttributePriceModal({ open, loading, attributes, onClose }: Props) {
  const theme = useTheme()

  const attributeNames = attributes?.[0]?.attributeJson.map(a => a.attributeName) ?? []

  // Pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const paginatedAttributes = attributes?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) ?? []

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          padding: theme.spacing(2),
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[5]
        }
      }}
    >
      {/* Close */}
      <IconButton onClick={onClose} sx={{ position: 'absolute', top: 12, right: 12 }}>
        <i className='tabler-x' />
      </IconButton>

      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>Product Attributes & Pricing</DialogTitle>

      <DialogContent dividers sx={{ paddingY: theme.spacing(2) }}>
        {loading ? (
          <Box display='flex' justifyContent='center' py={6}>
            <CircularProgress />
          </Box>
        ) : !attributes?.length ? (
          <Typography align='center' py={3} color='text.secondary'>
            No data available
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size='small' sx={{ minWidth: 700, borderCollapse: 'collapse' }}>
              <TableHead>
                <TableRow>
                  {attributeNames.map(name => (
                    <TableCell
                      key={name}
                      sx={{
                        fontWeight: 600,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.grey[100],
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {name}
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.grey[100],
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Old Price
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.grey[100],
                      whiteSpace: 'nowrap'
                    }}
                  >
                    New Price
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedAttributes.map((row, idx) => (
                  <TableRow key={idx}>
                    {attributeNames.map(attr => (
                      <TableCell key={attr} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                        {getAttributeValue(row.attributeJson, attr)}
                      </TableCell>
                    ))}
                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                      {row.oldPrice != null ? `₹${row.oldPrice.toLocaleString()}` : '-'}

                      {/*₹{Number(row.oldPrice ?? 0).toLocaleString()}*/}
                    </TableCell>
                    <TableCell sx={{ border: `1px solid ${theme.palette.divider}` }}>
                      ₹{Number(row.price ?? 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </DialogContent>

      {/* Pagination */}
      {attributes && attributes.length > 0 && (
        <TablePagination
          component='div'
          count={attributes.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
        />
      )}

      <DialogActions sx={{ paddingX: theme.spacing(2), paddingBottom: theme.spacing(2) }}>
        <Button onClick={onClose} variant='outlined' sx={{ fontWeight: 600 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
