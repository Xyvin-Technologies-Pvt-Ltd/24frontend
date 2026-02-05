import * as XLSX from "xlsx"

type ExcelHeader = {
  header: string
  key: string
}

export const generateExcel = (
  headers: ExcelHeader[] = [],
  body: Record<string, any>[] = [],
  fileName = "Report",
  chapterName = ""
) => {
  try {
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet([])

    XLSX.utils.sheet_add_aoa(worksheet, [headers.map(h => h.header)])

    const data = body.map(row =>
      headers.reduce((acc, cur) => {
        let val = row[cur.key]
        if (val instanceof Date) val = val.toLocaleDateString()
        if (typeof val === "boolean") val = val ? "Yes" : "No"
        return { ...acc, [cur.header]: val ?? "" }
      }, {} as Record<string, any>)
    )

    XLSX.utils.sheet_add_json(worksheet, data, { origin: "A2", skipHeader: true })
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report")

    const now = new Date()
    const newDate = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    const safeChapterName = chapterName.replace(/[^a-z0-9]/gi, "_") || "All_Chapters"

    const finalFileName = `${fileName}_${safeChapterName}_Report(${newDate}, ${time}).xlsx`

    XLSX.writeFile(workbook, finalFileName)
  } catch (error) {
    console.error("Excel generation failed:", error)
  }
}
