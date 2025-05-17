import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, BarChart3, DollarSign, ShoppingCart, Users } from "lucide-react"

export function DashboardContent() {
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="grid gap-4 md:gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your business.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Stats Cards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpIcon className="mr-1 h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500">+20.1%</span> from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">New Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2,350</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpIcon className="mr-1 h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500">+10.5%</span> from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpIcon className="mr-1 h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500">+8.2%</span> from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowDownIcon className="mr-1 h-4 w-4 text-rose-500" />
                <span className="text-rose-500">-2.5%</span> from last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Monthly revenue and sales statistics</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full">
              <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">Chart goes here</p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>Latest transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">{i}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Customer {i}</p>
                      <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="text-sm font-medium">${(Math.random() * 1000).toFixed(2)}</div>
                  </div>
                ))}
                <div className="flex items-center">
                  <a href="#" className="text-xs text-primary hover:underline">
                    View all
                    <ArrowRightIcon className="ml-1 inline h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
