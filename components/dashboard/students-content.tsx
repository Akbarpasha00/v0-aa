"use client"

import { useState, ChangeEvent } from "react" // Removed FormEvent as it's not used
import { AddStudentModal } from "@/components/modals/add-student-modal"
import { DownloadModal } from "@/components/modals/download-modal"
import { students as initialStudentsData } from "@/data/mock-data" // Renamed to avoid conflict
import { Student } from "@/lib/types" // Import the Student type
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Upload, Download, Plus, Search as SearchIcon, Edit, Trash2 } from "lucide-react"

export function StudentsContent() {
  const [students, setStudents] = useState<Student[]>(initialStudentsData); // Allow updating students list, explicitly typed
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [downloadType, setDownloadType] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedCGPA, setSelectedCGPA] = useState("") // This state is not used in the provided code for filtering, but keeping it for now

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  // `uploadMessage` and `errorDetails` can be used to display more detailed feedback on the page if needed
  // const [uploadMessage, setUploadMessage] = useState<string | null>(null) 
  // const [errorDetails, setErrorDetails] = useState<any | null>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
      // setUploadMessage(null); // Clear previous messages
      // setErrorDetails(null);
    } else {
      setSelectedFile(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.")
      return
    }

    setIsLoading(true)
    // setUploadMessage(null);
    // setErrorDetails(null);

    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const response = await fetch("/api/students/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message || "File uploaded successfully!")
        if (result.data && Array.isArray(result.data)) {
          setStudents(result.data); // Replace current students with uploaded data
        } else {
          // Handle cases where data might be missing, though API should always provide it on success
          setStudents([]); // Or keep existing, depending on desired behavior
          console.warn("Uploaded data is missing or not an array:", result.data);
        }
        setSelectedFile(null) // Clear the selected file
        // Clear the file input visually
        const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
        if (fileInput) fileInput.value = "";

      } else {
        if (result.errors && Array.isArray(result.errors)) {
          toast.error(result.message || "Upload failed. Please check errors.", {
            description: (
              <ul className="list-disc list-inside">
                {result.errors.slice(0, 5).map((err: any, index: number) => ( // Show first 5 errors
                  <li key={index}>{`Row ${err.row}${err.field ? ` (Field: ${err.field})` : ''}: ${err.message}`}</li>
                ))}
                {result.errors.length > 5 && <li>And {result.errors.length - 5} more errors...</li>}
              </ul>
            ),
          })
          // setErrorDetails(result.errors);
        } else {
          toast.error(result.error || "An unknown error occurred during upload.")
        }
        // setUploadMessage(result.error || "Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("An error occurred while uploading the file. Please try again.")
      // setUploadMessage("An error occurred while uploading the file.");
    } finally {
      setIsLoading(false)
    }
  }


  const handleDownload = (type: string) => {
    setDownloadType(type)
    setShowDownloadModal(true)
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBranch = !selectedBranch || student.branch === selectedBranch
    const matchesCGPA = // Assuming btechPercentage is the target for CGPA filter here.
      !selectedCGPA ||
      (selectedCGPA === "9-10"
        ? student.btechPercentage >= 90
        : selectedCGPA === "8-9"
          ? student.btechPercentage >= 80 && student.btechPercentage < 90
          : selectedCGPA === "7-8"
            ? student.btechPercentage >= 70 && student.btechPercentage < 80
            : selectedCGPA === "6-7"
              ? student.btechPercentage >= 60 && student.btechPercentage < 70
              : true) // If no CGPA selected or unknown value, include all
    return matchesSearch && matchesBranch && matchesCGPA
  })

  return (
    <div className="space-y-6">
      {/* Top controls: Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search students..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select // Consider replacing with ShadCN Select component if available
            className="border rounded-lg px-4 py-2 focus:outline-none focus:border-primary text-sm h-10 w-full sm:w-auto"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="">All Branches</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            {/* Add other branches as needed */}
          </select>
        </div>
        <div className="flex gap-3 w-full md:w-auto justify-end">
          <Button
            onClick={() => handleDownload("students")}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
          <Button onClick={() => setShowAddStudent(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Button>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-card border rounded-lg p-4 md:p-6 space-y-4">
        <h3 className="text-lg font-semibold">Bulk Student Upload</h3>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Input
            id="file-upload-input"
            type="file"
            accept=".xlsx, .xls, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
            className="w-full sm:w-auto"
            disabled={isLoading}
          />
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="w-full sm:w-auto"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isLoading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
        {selectedFile && !isLoading && (
          <p className="text-sm text-muted-foreground">
            Selected file: {selectedFile.name}
          </p>
        )}
      </div>

      {/* Students Table */}
      <div className="bg-card rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Roll No</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Branch</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">BTech %</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredStudents.map((student, index) => (
              <tr key={index} className="hover:bg-muted/20">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary font-semibold">{student.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{student.rollNo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{student.branch}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{student.btechPercentage}%</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      student.status === "Placed"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                        : student.status === "Interview"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" // Default for 'Eligible' etc.
                    }`}
                  >
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals - ensure these are also using semantic colors and ShadCN components if refactored elsewhere */}
      {showAddStudent && <AddStudentModal onClose={() => setShowAddStudent(false)} />}
      {showDownloadModal && (
        <DownloadModal type={downloadType} onClose={() => setShowDownloadModal(false)} students={filteredStudents} />
      )}
    </div>
  )
}
