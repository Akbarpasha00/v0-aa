"use client"

import { useState } from "react"
import { students } from "@/data/mock-data"

export function EligibilityContent() {
  const [emailStatus, setEmailStatus] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompany, setSelectedCompany] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedCGPA, setSelectedCGPA] = useState("")

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

  const notifyEligibleStudents = (companyName: string) => {
    const eligibleStudents = filteredStudents.filter((student) => student.btechPercentage >= 70)
    // In a real app, this would send emails via an API
    setEmailStatus(`Notification sent to ${eligibleStudents.length} eligible students`)
  }

  const handleDownload = (type: string) => {
    // In a real app, this would trigger a download
    console.log(`Downloading ${type} data...`)
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Eligibility Criteria</h3>
          <div className="flex gap-3">
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 rounded-button whitespace-nowrap">
              <i className="fas fa-file-excel mr-2"></i>Export Excel
            </button>
            <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 rounded-button whitespace-nowrap">
              <i className="fas fa-file-pdf mr-2"></i>Export PDF
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
            <select
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="">All Branches</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min BTech %</label>
            <input
              type="number"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="Enter percentage"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Backlogs</label>
            <select className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10">
              <option>No Backlogs</option>
              <option>Maximum 1</option>
              <option>Maximum 2</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year of Passing</label>
            <select className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10">
              <option>2025</option>
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 rounded-button whitespace-nowrap">
            Check Eligibility
          </button>
          <button
            onClick={() => notifyEligibleStudents("TechCorp Solutions")}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 rounded-button whitespace-nowrap"
          >
            <i className="fas fa-envelope mr-2"></i>
            Notify Eligible Students
          </button>
        </div>
        {emailStatus && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              emailStatus.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            <i
              className={`fas ${
                emailStatus.includes("successfully") ? "fa-check-circle" : "fa-exclamation-circle"
              } mr-2`}
            ></i>
            {emailStatus}
          </div>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Eligible Students</h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleDownload("eligible")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 rounded-button whitespace-nowrap"
              >
                <i className="fas fa-download mr-2"></i>Download Eligible
              </button>
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
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                <option value="">All Companies</option>
                <option value="TechCorp Solutions">TechCorp Solutions</option>
                <option value="Global Systems Inc">Global Systems Inc</option>
                <option value="Innovation Labs">Innovation Labs</option>
              </select>
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
              <select
                className="border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                value={selectedCGPA}
                onChange={(e) => setSelectedCGPA(e.target.value)}
              >
                <option value="">CGPA Range</option>
                <option value="9-10">9.0 - 10.0</option>
                <option value="8-9">8.0 - 9.0</option>
                <option value="7-8">7.0 - 8.0</option>
                <option value="6-7">6.0 - 7.0</option>
              </select>
            </div>
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Roll No</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Branch</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">BTech %</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Backlogs</th>
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
                <td className="px-6 py-4 text-sm text-gray-500">0</td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
