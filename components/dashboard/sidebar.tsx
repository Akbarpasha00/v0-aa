"use client"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function DashboardSidebar({ activeTab, setActiveTab }: SidebarProps) {
  // This could be fetched from Supabase in the future
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "fas fa-chart-line" },
    { id: "students", label: "Students", icon: "fas fa-user-graduate" },
    { id: "companies", label: "Companies", icon: "fas fa-building" },
    { id: "eligibility", label: "Eligibility", icon: "fas fa-check-circle" },
    { id: "tpo", label: "TPO Team", icon: "fas fa-users" },
    { id: "crt-training", label: "CRT Training", icon: "fas fa-laptop-code" },
    { id: "payments", label: "Payments", icon: "fas fa-rupee-sign" },
    { id: "tasks", label: "Tasks", icon: "fas fa-tasks" },
    { id: "whatsapp", label: "WhatsApp", icon: "fab fa-whatsapp" },
    { id: "branches", label: "Branches", icon: "fas fa-code-branch" },
    { id: "campus-drives", label: "Campus Drives", icon: "fas fa-building-columns" },
    { id: "training", label: "Training Programs", icon: "fas fa-chalkboard-teacher" },
    { id: "reports", label: "Reports", icon: "fas fa-chart-bar" },
    { id: "settings", label: "Settings", icon: "fas fa-cog" },
  ]

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-primary text-white p-5 z-40 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">PlacementCMS</h1>
      </div>
      <nav className="space-y-1">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full text-left p-3 mb-2 rounded-lg transition-colors ${
              activeTab === item.id ? "bg-white/20" : "hover:bg-white/10"
            } rounded-button whitespace-nowrap`}
          >
            <i className={`${item.icon} mr-3 w-5 text-center`}></i>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
