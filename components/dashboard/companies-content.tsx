"use client"

import { useState } from "react"
import { AddCompanyModal } from "@/components/modals/add-company-modal"
import { companies } from "@/data/mock-data"

export function CompaniesContent() {
  const [showAddCompany, setShowAddCompany] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCompanies = companies.filter((company) => company.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search companies..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        </div>
        <button
          onClick={() => setShowAddCompany(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 rounded-button whitespace-nowrap"
        >
          <i className="fas fa-plus mr-2"></i>Add Company
        </button>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {filteredCompanies.map((company, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{company.name}</h3>
                <p className="text-gray-500">Drive Date: {company.driveDate}</p>
              </div>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-800">
                  <i className="fas fa-edit"></i>
                </button>
                <button className="text-red-600 hover:text-red-800">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Package:</span>
                <span className="font-semibold text-green-600">{company.package}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Positions:</span>
                <span className="font-semibold">{company.openPositions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Min Criteria:</span>
                <span className="font-semibold">{company.minCriteria}</span>
              </div>
            </div>
            <button className="mt-4 w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 rounded-button whitespace-nowrap">
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showAddCompany && <AddCompanyModal onClose={() => setShowAddCompany(false)} />}
    </div>
  )
}
