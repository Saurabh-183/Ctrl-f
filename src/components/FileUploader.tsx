import React, { useState, useMemo, useEffect } from 'react'

import { useDropzone } from 'react-dropzone'
import { toast } from 'react-toastify'
import { Box, Avatar, Typography, IconButton } from '@mui/material'
import type { FieldPathValue, FieldValues } from 'react-hook-form'

type AllowedFileType = 'image' | 'excel' | 'zip'

type FileUploaderProps = {
  value?: (File | string)[]
  onChange: (files: (File | string)[]) => void
  maxFiles?: number
  maxSizeMB?: number
  allowedTypes?: AllowedFileType[]
  message?: string
  multiple?: boolean

  // @ts-ignore
  files?: FieldPathValue<FieldValues, FieldValues extends any ? PathInternal<FieldValues> : never>
}

const FileUploader: React.FC<FileUploaderProps> = ({
                                                     value = [],
                                                     onChange,
                                                     maxFiles = 2,
                                                     maxSizeMB = 5,
                                                     allowedTypes = ['image'],
                                                   }) => {

  const [files, setFiles] = useState<(File | string)[]>(value)
  const API_URL = process.env.NEXT_PUBLIC_BASE_URL


  useEffect(() => {
    setFiles(value)
  }, [value])



  const accept = useMemo(() => {
    const config: Record<string, string[]> = {}

    if (allowedTypes.includes('image')) {
      config['image/*'] = ['.png', '.jpg', '.jpeg', '.gif']
    }

    if (allowedTypes.includes('excel')) {
      config['application/vnd.ms-excel'] = ['.xls']
      config['application/vnd.  openxmlformats-officedocument.spreadsheetml.sheet'] = ['.xlsx']
    }

    if (allowedTypes.includes('zip')) {
      config['application/zip'] = ['.zip']
      config['application/x-zip-compressed'] = ['.zip']
    }

    return config
  }, [allowedTypes])

  const allowedText = useMemo(() => {
    const list: string[] = []

    if (allowedTypes.includes('image')) list.push('Images')
    if (allowedTypes.includes('excel')) list.push('Excel')
    if (allowedTypes.includes('zip')) list.push('ZIP')

    return list.join(', ')
  }, [allowedTypes])

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles,
    maxSize: maxSizeMB * 1024 * 1024,
    accept,
    disabled: files.length >= maxFiles,

    onDrop: acceptedFiles => {
      const merged = [...files, ...acceptedFiles]

      if (merged.length > maxFiles) {
        toast.error(`You can upload maximum ${maxFiles} images`)

        return
      }

      setFiles(merged)
      onChange(merged)
    },

    onDropRejected: () => {
      toast.error(`Max ${maxFiles} file(s), ${maxSizeMB} MB each. Allowed: ${allowedText}`, {
        autoClose: 3000
      })
    }
  })

  const handleRemoveFile = (file: File | string) => {
    const updated = files.filter(f => f !== file)

    setFiles(updated)
    onChange(updated)
  }

  const getPreview = (file: File | string) => {
    let url: string

    if (typeof file === 'string') {
      if (file.startsWith('http')) {
        url = file
      } else {
        url = `${API_URL}/${file.replace(/^\/+/, '')}`
      }
    } else {
      url = URL.createObjectURL(file)
    }

    console.log('Preview URL:', url)

    return url
  }


  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed #ccc',
        borderRadius: 2,
        p: 2,
        minHeight: 220,
        cursor: 'pointer',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        '&:hover': { borderColor: '#888' }
      }}
    >
      <input {...getInputProps()} />

      {files.map(file => (
        <Box
          key={typeof file === 'string' ? file : `${file.name}-${file.size}`}
          sx={{
            width: 100,
            height: 100,
            position: 'relative',
            borderRadius: 1,
            overflow: 'hidden'
          }}
        >
          <img
            src={getPreview(file)}
            alt='preview'
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

          <IconButton
            size='small'
            onClick={e => {
              e.stopPropagation()
              handleRemoveFile(file)
            }}
            sx={{
              position: 'absolute',
              top: -6,
              right: -6,
              background: '#fff'
            }}
          >
            <i className='tabler-x' />
          </IconButton>
        </Box>
      ))}

      {files.length < maxFiles && (
        <Box
          sx={{
            flexGrow: 1,
            minWidth: 160,
            textAlign: 'center',
            opacity: 0.7
          }}
        >
          <Avatar variant='rounded' sx={{ mx: 'auto', mb: 1 }}>
            <i className='tabler-upload' />
          </Avatar>

          <Typography fontSize={14}>Drop files here or click to upload</Typography>

          <Typography variant='body2' color='text.secondary'>
            Images only • Max {maxFiles} • {maxSizeMB} MB
          </Typography>
        </Box>
      )}
    </Box>
  )

}

export default FileUploader
