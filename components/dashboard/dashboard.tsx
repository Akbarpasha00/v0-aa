"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { StudentsContent } from "@/components/dashboard/students-content"
import { CompaniesContent } from "@/components/dashboard/companies-content"
import { TPOContent } from "@/components/dashboard/tpo-content"
import { EligibilityContent } from "@/components/dashboard/eligibility-content"
import { WhatsappContent } from "@/components/dashboard/whatsapp-content"
import { PlaceholderContent } from "@/components/dashboard/placeholder-content"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />
      case "students":
        return <StudentsContent />
      case "companies":
        return <CompaniesContent />
      case "eligibility":
        return <EligibilityContent />
      case "tpo":
        return <TPOContent />
      case "whatsapp":
        return <WhatsappContent />
      case "crt-training":
        return <PlaceholderContent title="CRT Training" />
      case "payments":
        return <PlaceholderContent title="Payments" />
      case "tasks":
        return <PlaceholderContent title="Tasks" />
      case "branches":
        return <PlaceholderContent title="Branches" />
      case "campus-drives":
        return <PlaceholderContent title="Campus Drives" />
      case "training":
        return <PlaceholderContent title="Training Programs" />
      case "reports":
        return <PlaceholderContent title="Reports" />
      case "settings":
        return <PlaceholderContent title="Settings" />
      default:
        return <DashboardContent />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeTab === "crt-training"
              ? "CRT Training"
              : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace("-", " ")}
          </h2>
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
        {renderContent()}
      </div>
    </div>
  )
}
