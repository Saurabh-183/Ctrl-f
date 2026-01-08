'use client'

import React, { useState, useMemo, useEffect } from 'react'

import { useDropzone } from 'react-dropzone'
import { toast } from 'react-toastify'
import { Box, Typography, IconButton, Button, Dialog, DialogContent, Stack } from '@mui/material'

type AllowedFileType = 'image' | 'excel' | 'zip'

type FileUploaderProps = {
  value?: (File | string)[]
  onChange: (files: (File | string)[]) => void
  maxFiles?: number
  maxSizeMB?: number
  allowedTypes?: AllowedFileType[]
}

const FileUploader: React.FC<FileUploaderProps> = ({
  value = [],
  onChange,
  maxFiles = 5,
  maxSizeMB = 5,
  allowedTypes = ['image']
}) => {
  const [files, setFiles] = useState<(File | string)[]>(value)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewSrc, setPreviewSrc] = useState<string>('')

  const API_URL = process.env.NEXT_PUBLIC_BASE_URL

  useEffect(() => {
    setFiles(value)
  }, [value])

  const accept = useMemo(() => {
    const config: Record<string, string[]> = {}

    if (allowedTypes.includes('image')) {
      config['image/*'] = ['.png', '.jpg', '.jpeg']
    }


return config
  }, [allowedTypes])

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles,
    maxSize: maxSizeMB * 1024 * 1024,
    accept,
    disabled: files.length >= maxFiles,
    onDrop: acceptedFiles => {
      const merged = [...files, ...acceptedFiles]

      if (merged.length > maxFiles) {
        toast.error(`Max ${maxFiles} files allowed`)

return
      }

      setFiles(merged)
      onChange(merged)
    }
  })

  const getImageUrl = (file: File | string) => {
    if (typeof file === 'string') {
      return file.startsWith('http') ? file : `${API_URL}/${file.replace(/^\/+/, '')}`
    }

    return URL.createObjectURL(file)
  }

  const handleRemove = (file: File | string) => {
    const updated = files.filter(f => f !== file)

    setFiles(updated)
    onChange(updated)
  }

  return (
    <>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 1,
          p: 2,
          height: 130,
          maxHeight: 130,
          cursor: 'pointer',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <input {...getInputProps()} />

        <Stack spacing={1}>
          {files.map(file => (
            <Box
              key={typeof file === 'string' ? file : file.name}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                px: 2,
                py: 1
              }}
            >
              <Box display='flex' alignItems='center' gap={1}>
                <i className='tabler-photo' />
                <Typography fontSize={14}>{typeof file === 'string' ? file.split('/').pop() : file.name}</Typography>
              </Box>

              <Box display='flex' gap={1}>
                <Button
                  size='small'
                  onClick={e => {
                    e.stopPropagation()
                    setPreviewSrc(getImageUrl(file))
                    setPreviewOpen(true)
                  }}
                >
                  View
                </Button>

                <IconButton
                  size='small'
                  color='error'
                  onClick={e => {
                    e.stopPropagation()
                    handleRemove(file)
                  }}
                >
                  <i className='tabler-trash' />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Stack>

        {files.length < maxFiles && (
          <Typography variant='body2' color='text.secondary' mt={10} textAlign='center'>
            Click or drag image here (Max {maxFiles})

            {/*<br />*/}
            {/*<span className='text-[#FF0000]'>*/}
            {/*  *Please ensure that the image name and the <br /> product code are same.*/}
            {/*</span>*/}
          </Typography>
        )}
      </Box>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth='xs'>
        <DialogContent>
          <img src={previewSrc} alt='Preview' style={{ width: '100%', borderRadius: 8 }} />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FileUploader
