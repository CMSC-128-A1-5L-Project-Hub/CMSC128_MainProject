import { join } from 'node:path'
import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'
import puppeteer from 'puppeteer'
import env from '#start/env'
import User from '#models/user'
import ReportService from '#services/report_service'

const BRAND_MAROON = '#8C1535'
const TEXT_DARK = '#1F2937'
const TEXT_MUTED = '#6B7280'
const ROW_ALT = '#F9FAFB'

function fullName(user: User): string {
  return [user.fname, user.mname, user.lname].filter(Boolean).join(' ')
}

function todayStr(): string {
  return new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

async function renderPrintPageToPdf(printPath: string, payload: object): Promise<Buffer> {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const frontendUrl = env.get('FRONTEND_URL')
  const printUrl = `${frontendUrl}${printPath}?d=${encoded}`

  const browser = await puppeteer.launch({
    browser: 'chrome-headless-shell',
    headless: true,
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH ??
      join(process.cwd(), '.chrome', 'chrome-headless-shell'),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  try {
    const page = await browser.newPage()
    await page.goto(printUrl, { waitUntil: 'networkidle0' })
    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
    })
    return Buffer.from(pdfData)
  } finally {
    await browser.close()
  }
}

async function pdfToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    doc.end()
  })
}

function drawPdfHeader(doc: PDFKit.PDFDocument, title: string, landlord: User) {
  const left = doc.page.margins.left
  const right = doc.page.width - doc.page.margins.right

  doc
    .fillColor(BRAND_MAROON)
    .font('Helvetica-Bold')
    .fontSize(20)
    .text('UBLE', left, 50)

  doc
    .fillColor(TEXT_MUTED)
    .font('Helvetica')
    .fontSize(9)
    .text('University Student Accommodation Tracker', left, 72)

  doc
    .fillColor(TEXT_MUTED)
    .fontSize(9)
    .text(`Generated: ${todayStr()}`, left, 50, { width: right - left, align: 'right' })
    .text(`Landlord: ${fullName(landlord)}`, left, 64, {
      width: right - left,
      align: 'right',
    })

  doc.moveTo(left, 95).lineTo(right, 95).lineWidth(2).strokeColor(BRAND_MAROON).stroke()

  doc
    .fillColor(TEXT_DARK)
    .font('Helvetica-Bold')
    .fontSize(18)
    .text(title, left, 115)

  doc.y = 150
}

export default class ReportExportService {
  static async generateOverdueFeesXlsx(user: User): Promise<Buffer> {
    const rows = await ReportService.getDelinquentStudents(user)

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'UBLE'
    workbook.created = new Date()

    const sheet = workbook.addWorksheet('Overdue Fees', {
      views: [{ state: 'frozen', ySplit: 1 }],
    })

    sheet.columns = [
      { header: 'Student Number', key: 'student_number', width: 18 },
      { header: 'Student Name', key: 'student_name', width: 30 },
      { header: 'Email', key: 'email', width: 32 },
      { header: 'Category', key: 'category', width: 18 },
      { header: 'Due Date', key: 'due_date', width: 14 },
      { header: 'Amount', key: 'amount', width: 14 },
      { header: 'Balance', key: 'balance', width: 14 },
      { header: 'Status', key: 'status', width: 12 },
    ]

    const headerRow = sheet.getRow(1)
    headerRow.font = { bold: true }
    headerRow.alignment = { vertical: 'middle', horizontal: 'left' }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' },
    }

    for (const r of rows) {
      sheet.addRow({
        student_number: r.student_number,
        student_name: r.student_name,
        email: r.email,
        category: r.category,
        due_date: r.due_date ? new Date(r.due_date) : null,
        amount: r.amount,
        balance: r.balance,
        status: r.status,
      })
    }

    sheet.getColumn('due_date').numFmt = 'yyyy-mm-dd'
    sheet.getColumn('amount').numFmt = '"₱"#,##0.00'
    sheet.getColumn('balance').numFmt = '"₱"#,##0.00'

    const arrayBuffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(arrayBuffer as ArrayBuffer)
  }

  static async generateOccupancyPdf(user: User): Promise<Buffer> {
    const stats = await ReportService.getOccupancyStats(user)
    return renderPrintPageToPdf('/reports/occupancy/print', {
      landlordName: fullName(user),
      generatedAt: todayStr(),
      stats,
    })
  }

  static async generateRevenuePdf(user: User): Promise<Buffer> {
    const data = await ReportService.getRevenueProjections(user)
    return renderPrintPageToPdf('/reports/revenue/print', {
      landlordName: fullName(user),
      generatedAt: todayStr(),
      data,
    })
  }

  static async generateAccommodationHistoryPdf(user: User): Promise<Buffer> {
    const rows = await ReportService.getAccommodationHistory(user)
    return renderPrintPageToPdf('/reports/accommodation-history/print', {
      landlordName: fullName(user),
      generatedAt: todayStr(),
      rows,
    })
  }

  static async generateBillingStatementPdf(payload: {
    landlordName: string
    fee: {
      id: number
      category: string
      amount: number
      balance: number
      status: string
      dueDate: string | null
      allowInstallments: boolean
    }
    student: { studentNumber: string; name: string; email: string | null }
    accommodation: { name: string | null; roomNumber: string | null }
    payments: Array<{
      id: number
      paymentTimestamp: string
      paymentAmount: number
      modeOfPayment: string
      paymentStatus: string
    }>
  }): Promise<Buffer> {
    return renderPrintPageToPdf('/reports/billing-statement/print', {
      ...payload,
      generatedAt: todayStr(),
    })
  }

  static async generateWaitingListXlsx(user: User): Promise<Buffer> {
    const rows = await ReportService.getWaitingList(user)

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'UBLE'
    workbook.created = new Date()

    const sheet = workbook.addWorksheet('Waiting List', {
      views: [{ state: 'frozen', ySplit: 1 }],
    })

    sheet.columns = [
      { header: 'Student Number', key: 'student_number', width: 18 },
      { header: 'Student Name', key: 'student_name', width: 30 },
      { header: 'Email', key: 'email', width: 32 },
      { header: 'Gender', key: 'gender', width: 12 },
      { header: 'Accommodation', key: 'accommodation_name', width: 28 },
      { header: 'Room Type', key: 'room_type', width: 14 },
      { header: 'Stay Type', key: 'stay_type', width: 16 },
      { header: 'Applied On', key: 'application_date', width: 14 },
    ]

    const headerRow = sheet.getRow(1)
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' },
    }

    for (const r of rows) {
      sheet.addRow({
        student_number: r.student_number,
        student_name: r.student_name,
        email: r.email,
        gender: r.gender,
        accommodation_name: r.accommodation_name,
        room_type: r.room_type,
        stay_type: r.stay_type,
        application_date: r.application_date ? new Date(r.application_date) : null,
      })
    }
    sheet.getColumn('application_date').numFmt = 'yyyy-mm-dd'

    const arrayBuffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(arrayBuffer as ArrayBuffer)
  }

  static async generateHousedStudentsXlsx(user: User): Promise<Buffer> {
    const rows = await ReportService.getHousedStudents(user)

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'UBLE'
    workbook.created = new Date()

    const sheet = workbook.addWorksheet('Housed Students', {
      views: [{ state: 'frozen', ySplit: 1 }],
    })

    sheet.columns = [
      { header: 'Student Number', key: 'student_number', width: 18 },
      { header: 'Student Name', key: 'student_name', width: 30 },
      { header: 'Email', key: 'email', width: 32 },
      { header: 'Gender', key: 'gender', width: 12 },
      { header: 'Accommodation', key: 'accommodation_name', width: 28 },
      { header: 'Room', key: 'room_number', width: 12 },
      { header: 'Rent', key: 'rent', width: 14 },
      { header: 'Move-in', key: 'move_in', width: 14 },
      { header: 'Expected Move-out', key: 'expected_move_out', width: 18 },
    ]

    const headerRow = sheet.getRow(1)
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' },
    }

    for (const r of rows) {
      sheet.addRow({
        student_number: r.student_number,
        student_name: r.student_name,
        email: r.email,
        gender: r.gender,
        accommodation_name: r.accommodation_name,
        room_number: r.room_number,
        rent: r.rent,
        move_in: r.move_in ? new Date(r.move_in) : null,
        expected_move_out: r.expected_move_out ? new Date(r.expected_move_out) : null,
      })
    }
    sheet.getColumn('rent').numFmt = '"₱"#,##0.00'
    sheet.getColumn('move_in').numFmt = 'yyyy-mm-dd'
    sheet.getColumn('expected_move_out').numFmt = 'yyyy-mm-dd'

    const arrayBuffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(arrayBuffer as ArrayBuffer)
  }

  // Kept temporarily for pdfkit comparison; remove once we pick a winner.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static async _generateOccupancyPdfWithPdfkit(user: User): Promise<Buffer> {
    const data = await ReportService.getOccupancyStats(user)
    const occupancyPct =
      data.totalCapacity > 0
        ? Math.round((data.currentlyOccupied / data.totalCapacity) * 100)
        : 0

    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    drawPdfHeader(doc, 'Occupancy Report', user)

    const left = doc.page.margins.left
    const right = doc.page.width - doc.page.margins.right
    const usableWidth = right - left

    // Summary cards
    doc
      .fillColor(TEXT_DARK)
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('Summary', left, doc.y)
    doc.moveDown(0.5)

    const cards = [
      { label: 'Total Capacity', value: String(data.totalCapacity) },
      { label: 'Currently Occupied', value: String(data.currentlyOccupied) },
      { label: 'Vacant Slots', value: String(data.vacantSlots) },
      { label: 'Occupancy Rate', value: `${occupancyPct}%` },
    ]

    const gap = 10
    const cardWidth = (usableWidth - gap * (cards.length - 1)) / cards.length
    const cardHeight = 65
    const cardsY = doc.y

    cards.forEach((card, i) => {
      const x = left + i * (cardWidth + gap)
      doc
        .roundedRect(x, cardsY, cardWidth, cardHeight, 6)
        .lineWidth(1)
        .strokeColor('#E5E7EB')
        .stroke()

      doc
        .fillColor(TEXT_MUTED)
        .font('Helvetica')
        .fontSize(8.5)
        .text(card.label.toUpperCase(), x + 10, cardsY + 10, {
          width: cardWidth - 20,
        })

      doc
        .fillColor(BRAND_MAROON)
        .font('Helvetica-Bold')
        .fontSize(22)
        .text(card.value, x + 10, cardsY + 28, { width: cardWidth - 20 })
    })

    doc.y = cardsY + cardHeight + 25

    // Gender breakdown table
    doc
      .fillColor(TEXT_DARK)
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('Occupancy by Gender', left, doc.y)
    doc.moveDown(0.5)

    const breakdownEntries = Object.entries(data.breakdown)
    const tableY = doc.y
    const rowHeight = 24
    const col1Width = usableWidth * 0.6
    const col2Width = usableWidth * 0.4

    // Header row
    doc
      .rect(left, tableY, usableWidth, rowHeight)
      .fillColor('#F3F4F6')
      .fill()

    doc
      .fillColor(TEXT_DARK)
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Gender', left + 10, tableY + 7, { width: col1Width - 10 })
      .text('Occupied', left + col1Width, tableY + 7, {
        width: col2Width - 10,
        align: 'right',
      })

    let rowY = tableY + rowHeight

    if (breakdownEntries.length === 0) {
      doc
        .fillColor(TEXT_MUTED)
        .font('Helvetica-Oblique')
        .fontSize(10)
        .text('No active assignments.', left + 10, rowY + 7, {
          width: usableWidth - 20,
        })
      rowY += rowHeight
    } else {
      breakdownEntries.forEach(([gender, count], i) => {
        if (i % 2 === 1) {
          doc.rect(left, rowY, usableWidth, rowHeight).fillColor(ROW_ALT).fill()
        }
        doc
          .fillColor(TEXT_DARK)
          .font('Helvetica')
          .fontSize(10)
          .text(gender || 'Unspecified', left + 10, rowY + 7, {
            width: col1Width - 10,
          })
          .text(String(count), left + col1Width, rowY + 7, {
            width: col2Width - 10,
            align: 'right',
          })
        rowY += rowHeight
      })
    }

    doc
      .moveTo(left, rowY)
      .lineTo(right, rowY)
      .lineWidth(0.5)
      .strokeColor('#E5E7EB')
      .stroke()

    return await pdfToBuffer(doc)
  }
}
