import { Workbook } from 'exceljs'
import { saveAs } from 'file-saver'

type HeaderMap = {
  key: string
  label: string
}

export const exportToExcel = async (data: Record<string, any>[], filename: string, headers?: HeaderMap[]) => {
  if (!data || data.length === 0) {
    throw new Error('No data available to export')
  }

  const workbook = new Workbook()
  const worksheet = workbook.addWorksheet('Sheet1')

  // Columns
  worksheet.columns = headers
    ? headers.map(h => ({
        header: h.label,
        key: h.key,
        width: 22
      }))
    : Object.keys(data[0]).map(key => ({
        header: key,
        key,
        width: 22
      }))

  // Rows
  data.forEach(row => worksheet.addRow(row))

  // Header styling
  worksheet.getRow(1).eachCell(cell => {
    cell.font = { bold: true }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
  })

  // Auto filter
  worksheet.autoFilter = {
    from: 'A1',
    to: `${String.fromCharCode(64 + worksheet.columnCount)}1`
  }

  const buffer = await workbook.xlsx.writeBuffer()

  saveAs(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }),
    `${filename}.xlsx`
  )
}

export const downloadExcelFromPublic = (filePath: string, filename?: string) => {
  const link = document.createElement('a')

  link.href = filePath
  link.download = filename || filePath.split('/').pop() || 'file.xlsx'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
