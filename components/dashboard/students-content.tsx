"use client"

import { useState } from "react"
import { AddStudentModal } from "@/components/modals/add-student-modal"
import { DownloadModal } from "@/components/modals/download-modal"
import { students } from "@/data/mock-data"

export function StudentsContent() {
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [downloadType, setDownloadType] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedCGPA, setSelectedCGPA] = useState("")

  const handleDownload = (type: string) => {
    setDownloadType(type)
    setShowDownloadModal(true)
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBranch = !selectedBranch || student.branch === selectedBranch
    const matchesCGPA =
      !selectedCGPA ||
      (selectedCGPA === "9-10"
        ? student.btechPercentage >= 90
        : selectedCGPA === "8-9"
          ? student.btechPercentage >= 80 && student.btechPercentage < 90
          : selectedCGPA === "7-8"
            ? student.btechPercentage >= 70 && student.btechPercentage < 80
            : selectedCGPA === "6-7"
              ? student.btechPercentage >= 60 && student.btechPercentage < 70
              : true)
    return matchesSearch && matchesBranch && matchesCGPA
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search students..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          </div>
          <select
            className="border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="">All Branches</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
          </select>
        </div>
        <div className="flex gap-3">
          <label className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 cursor-pointer rounded-button whitespace-nowrap">
            <i className="fas fa-file-excel mr-2"></i>Bulk Upload
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  // Handle file upload logic here
                  console.log("File selected:", e.target.files[0].name)
                }
              }}
            />
          </label>
          <button
            onClick={() => handleDownload("students")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 rounded-button whitespace-nowrap"
          >
            <i className="fas fa-download mr-2"></i>Download
          </button>
          <button
            onClick={() => setShowAddStudent(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 rounded-button whitespace-nowrap"
          >
            <i className="fas fa-plus mr-2"></i>Add Student
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Roll No</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Branch</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">BTech %</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStudents.map((student, index) => (
              <tr key={index}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold">{student.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{student.rollNo}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{student.branch}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{student.btechPercentage}%</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      student.status === "Placed"
                        ? "bg-green-100 text-green-800"
                        : student.status === "Interview"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAddStudent && <AddStudentModal onClose={() => setShowAddStudent(false)} />}
      {showDownloadModal && (
        <DownloadModal type={downloadType} onClose={() => setShowDownloadModal(false)} students={filteredStudents} />
      )}
    </div>
  )
}
