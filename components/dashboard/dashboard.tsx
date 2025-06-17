"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { StudentsContent } from "@/components/dashboard/students-content"
import { CompaniesContent } from "@/components/dashboard/companies-content"
import { TPOContent } from "@/components/dashboard/tpo-content"
import { EligibilityContent } from "@/components/dashboard/eligibility-content"
import { WhatsappContent } from "@/components/dashboard/whatsapp-content"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          <div className="flex items-center gap-4">
            <button className="bg-gray-200 p-2 rounded-full">
              <i className="fas fa-bell text-gray-600"></i>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <i className="fas fa-user"></i>
              </div>
              <span className="text-gray-700">Admin</span>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "dashboard" && <DashboardContent />}
        {activeTab === "students" && <StudentsContent />}
        {activeTab === "companies" && <CompaniesContent />}
        {activeTab === "tpo" && <TPOContent />}
        {activeTab === "eligibility" && <EligibilityContent />}
        {activeTab === "whatsapp" && <WhatsappContent />}
        {/* Add other tabs as needed */}
      </div>
    </div>
  )
}
