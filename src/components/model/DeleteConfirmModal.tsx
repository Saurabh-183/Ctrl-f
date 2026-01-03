'use client'

import * as React from 'react'

import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box } from '@mui/material'

interface DeleteConfirmDialogProps {
  open: boolean
  title?: string
  message?: string
  name?: string
  onCancel: () => void
  onConfirm: () => void
}

export default function DeleteConfirmDialog({
  open,
  title = 'Delete',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  name = '',
  onCancel,
  onConfirm
}: DeleteConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth='xs'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          px: 2,
          py: 2.5
        }
      }}
    >
      {/* Icon */}
      <Box display='flex' justifyContent='center' mb={1}>
        <Box
          display='flex'
          alignItems='center'
          justifyContent='center'
          width={48}
          height={48}
          borderRadius='50%'
          bgcolor='error.light'
        >
          <i className='tabler-exclamation-circle text-red-600 text-xl' />
        </Box>
      </Box>

      {/* Title */}
      <DialogTitle
        sx={{
          textAlign: 'center',
          fontWeight: 600,
          pb: 1
        }}
      >
        {title}
      </DialogTitle>

      {/* Message */}
      <DialogContent sx={{ textAlign: 'center', px: 3 }}>
        <DialogContentText sx={{ color: 'text.secondary' }}>{message}</DialogContentText>

        {name && (
          <Box
            mt={2}
            px={2}
            py={1}
            mx='auto'
            width='fit-content'
            borderRadius={1}
            color='error.main'
            fontWeight={600}
            fontSize={14}
          >
            “{name}”
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, pt: 2 }}>
        <Button onClick={onCancel} variant='outlined' fullWidth>
          Cancel
        </Button>

        <Button onClick={onConfirm} variant='contained' color='error' fullWidth>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
