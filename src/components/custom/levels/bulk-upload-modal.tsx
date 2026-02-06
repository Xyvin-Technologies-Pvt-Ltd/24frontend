import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Upload, Download, Loader2 } from "lucide-react"
import * as XLSX from "xlsx"

interface BulkUploadModalProps {
    isOpen: boolean
    onClose: () => void
    onUpload: (data: any[]) => Promise<void>
    isLoading?: boolean
}

export function BulkUploadModal({ isOpen, onClose, onUpload, isLoading = false }: BulkUploadModalProps) {
    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    if (!isOpen) return null

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
            setFile(droppedFile)
        } else {
            alert("Please upload a valid Excel file (.xlsx or .xls)")
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
        }
    }

    const handleDownloadTemplate = () => {
        // Create sample data
        const sampleData = [
            { name: "Campus 1", district_name: "District A" },
            { name: "Campus 2", district_name: "District B" },
            { name: "Campus 3", district_name: "District A" }
        ]

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(sampleData)

        // Create workbook
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Campuses")

        // Download file
        XLSX.writeFile(wb, "campus_bulk_upload_template.xlsx")
    }

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file first")
            return
        }

        try {
            const reader = new FileReader()

            reader.onload = async (e) => {
                try {
                    const data = e.target?.result
                    const workbook = XLSX.read(data, { type: "binary" })

                    // Get first sheet
                    const sheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[sheetName]

                    // Convert to JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet)

                    if (jsonData.length === 0) {
                        alert("The Excel file is empty")
                        return
                    }

                    // Validate required columns
                    const firstRow = jsonData[0] as any
                    if (!firstRow.hasOwnProperty('name') || !firstRow.hasOwnProperty('district_name')) {
                        alert("Excel file must have 'name' and 'district_name' columns")
                        return
                    }

                    // Call the upload handler
                    await onUpload(jsonData)

                    // Reset state
                    setFile(null)
                    if (fileInputRef.current) {
                        fileInputRef.current.value = ""
                    }
                } catch (error) {
                    console.error("Error processing file:", error)
                    alert("Error processing the Excel file. Please check the format.")
                }
            }

            reader.readAsBinaryString(file)
        } catch (error) {
            console.error("Error reading file:", error)
            alert("Error reading the file")
        }
    }

    const handleCancel = () => {
        setFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Bulk Upload Campuses</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        className="p-1 h-8 w-8"
                        disabled={isLoading}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-900 mb-2">Instructions for bulk import:</h3>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>First, download the file template.</li>
                            <li>Remove the existing data without removing the headers.</li>
                            <li>Don't change the headers.</li>
                            <li>Add new data in the respective columns.</li>
                            <li>A maximum of 50 entries is allowed at a time.</li>
                        </ul>
                    </div>

                    {/* Download Template Button */}
                    <Button
                        onClick={handleDownloadTemplate}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-full"
                        disabled={isLoading}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download Sample Template
                    </Button>

                    {/* File Upload Area */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 bg-gray-50"
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={isLoading}
                        />

                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                <Upload className="w-8 h-8 text-gray-500" />
                            </div>

                            {file ? (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="rounded-full"
                                        disabled={isLoading}
                                    >
                                        Change File
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">
                                        Drop your CSV/XLS file here to upload or select from storage
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="rounded-full"
                                        disabled={isLoading}
                                    >
                                        Select from Storage
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full"
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!file || isLoading}
                        className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            "Save"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
