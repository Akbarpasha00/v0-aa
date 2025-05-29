"use client"

import { useState } from "react"

interface Student {
  name: string
  email: string
  rollNo: string
  branch: string
  btechPercentage: number
  status: string
  [key: string]: any
}

interface DownloadModalProps {
  type: string
  onClose: () => void
  students: Student[]
}

export function DownloadModal({ type, onClose, students }: DownloadModalProps) {
  const studentColumns = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "rollNo", label: "Roll No" },
    { id: "branch", label: "Branch" },
    { id: "btechPercentage", label: "BTech %" },
    { id: "status", label: "Status" },
  ]

  const [selectedColumns, setSelectedColumns] = useState<string[]>(studentColumns.map((col) => col.id))

  const handleConfirmDownload = () => {
    let dataToExport = []
    if (type === "students") {
      dataToExport = students.map((student) => {
        const exportObj: { [key: string]: any } = {}
        selectedColumns.forEach((col) => {
          exportObj[col] = student[col as keyof typeof student]
        })
        return exportObj
      })
    } else if (type === "eligible") {
      dataToExport = students
        .filter((student) => student.btechPercentage >= 70)
        .map((student) => {
          const exportObj: { [key: string]: any } = {}
          selectedColumns.forEach((col) => {
            exportObj[col] = student[col as keyof typeof student]
          })
          return exportObj
        })
    }

    // In a real app, this would create and download a CSV file
    console.log("Downloading data:", dataToExport)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-background/70 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg w-[500px] p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Select Columns to Download</h3>
          <button onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="space-y-3 mb-6">
          {studentColumns.map((column) => (
            <div key={column.id} className="flex items-center">
              <input
                type="checkbox"
                id={column.id}
                checked={selectedColumns.includes(column.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedColumns([...selectedColumns, column.id])
                  } else {
                    setSelectedColumns(selectedColumns.filter((col) => col !== column.id))
                  }
                }}
                className="mr-3"
              />
              <label htmlFor={column.id}>{column.label}</label>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-muted/50 rounded-button whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDownload}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 rounded-button whitespace-nowrap"
            disabled={selectedColumns.length === 0}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  )
}
