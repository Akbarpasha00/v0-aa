"use client"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function DashboardSidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-primary text-white p-5 z-40">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">PlacementCMS</h1>
      </div>
      <nav>
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`w-full text-left p-3 mb-2 rounded-lg ${activeTab === "dashboard" ? "bg-white/20" : "hover:bg-white/10"} rounded-button whitespace-nowrap`}
        >
          <i className="fas fa-chart-line mr-3"></i>Dashboard
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`w-full text-left p-3 mb-2 rounded-lg ${activeTab === "students" ? "bg-white/20" : "hover:bg-white/10"} rounded-button whitespace-nowrap`}
        >
          <i className="fas fa-user-graduate mr-3"></i>Students
        </button>
        <button
          onClick={() => setActiveTab("companies")}
          className={`w-full text-left p-3 mb-2 rounded-lg ${activeTab === "companies" ? "bg-white/20" : "hover:bg-white/10"} rounded-button whitespace-nowrap`}
        >
          <i className="fas fa-building mr-3"></i>Companies
        </button>
        <button
          onClick={() => setActiveTab("eligibility")}
          className={`w-full text-left p-3 mb-2 rounded-lg ${activeTab === "eligibility" ? "bg-white/20" : "hover:bg-white/10"} rounded-button whitespace-nowrap`}
        >
          <i className="fas fa-check-circle mr-3"></i>Eligibility
        </button>
        <button
          onClick={() => setActiveTab("tpo")}
          className={`w-full text-left p-3 mb-2 rounded-lg ${activeTab === "tpo" ? "bg-white/20" : "hover:bg-white/10"} rounded-button whitespace-nowrap`}
        >
          <i className="fas fa-users mr-3"></i>TPO Team
        </button>
        <button
          onClick={() => setActiveTab("whatsapp")}
          className={`w-full text-left p-3 mb-2 rounded-lg ${activeTab === "whatsapp" ? "bg-white/20" : "hover:bg-white/10"} rounded-button whitespace-nowrap`}
        >
          <i className="fab fa-whatsapp mr-3"></i>WhatsApp
        </button>
        <button
          onClick={() => setActiveTab("branches")}
          className={`w-full text-left p-3 mb-2 rounded-lg ${activeTab === "branches" ? "bg-white/20" : "hover:bg-white/10"} rounded-button whitespace-nowrap`}
        >
          <i className="fas fa-code-branch mr-3"></i>Branches
        </button>
        <button
          onClick={() => setActiveTab("campus-drives")}
          className={`w-full text-left p-3 mb-2 rounded-lg ${activeTab === "campus-drives" ? "bg-white/20" : "hover:bg-white/10"} rounded-button whitespace-nowrap`}
        >
          <i className="fas fa-building-columns mr-3"></i>Campus Drives
        </button>
        <button
          onClick={() => setActiveTab("training")}
          className={`w-full text-left p-3 mb-2 rounded-lg ${activeTab === "training" ? "bg-white/20" : "hover:bg-white/10"} rounded-button whitespace-nowrap`}
        >
          <i className="fas fa-chalkboard-teacher mr-3"></i>Training Programs
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`w-full text-left p-3 mb-2 rounded-lg ${activeTab === "reports" ? "bg-white/20" : "hover:bg-white/10"} rounded-button whitespace-nowrap`}
        >
          <i className="fas fa-chart-bar mr-3"></i>Reports
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`w-full text-left p-3 mb-2 rounded-lg ${activeTab === "settings" ? "bg-white/20" : "hover:bg-white/10"} rounded-button whitespace-nowrap`}
        >
          <i className="fas fa-cog mr-3"></i>Settings
        </button>
      </nav>
    </div>
  )
}
