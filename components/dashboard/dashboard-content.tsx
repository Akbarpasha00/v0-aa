"use client"

import { useEffect } from "react"
import * as echarts from "echarts"
import { companies } from "@/data/mock-data"

export function DashboardContent() {
  useEffect(() => {
    const chartDom = document.getElementById("placementChart")
    if (chartDom) {
      const myChart = echarts.init(chartDom)
      const option = {
        animation: false,
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: ["Placed", "Total Students"],
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: ["CSE", "ECE", "ME", "CE", "IT"],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "Placed",
            type: "bar",
            data: [150, 120, 90, 80, 110],
            color: "#4CAF50",
          },
          {
            name: "Total Students",
            type: "bar",
            data: [180, 150, 120, 100, 140],
            color: "#2196F3",
          },
        ],
      }
      myChart.setOption(option)

      // Cleanup
      return () => {
        myChart.dispose()
      }
    }
  }, [])

  return (
    <div>
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-user-graduate text-blue-500 text-xl"></i>
            </div>
            <span className="text-green-500">+12%</span>
          </div>
          <h3 className="text-gray-500 text-sm">Total Students</h3>
          <p className="text-2xl font-bold">2,450</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-building text-green-500 text-xl"></i>
            </div>
            <span className="text-green-500">+8%</span>
          </div>
          <h3 className="text-gray-500 text-sm">Active Companies</h3>
          <p className="text-2xl font-bold">35</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <i className="fas fa-briefcase text-purple-500 text-xl"></i>
            </div>
            <span className="text-green-500">+15%</span>
          </div>
          <h3 className="text-gray-500 text-sm">Placed Students</h3>
          <p className="text-2xl font-bold">550</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <i className="fas fa-calendar-alt text-yellow-500 text-xl"></i>
            </div>
            <span className="text-yellow-500">+5</span>
          </div>
          <h3 className="text-gray-500 text-sm">Upcoming Drives</h3>
          <p className="text-2xl font-bold">8</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-bold mb-4">Placement Statistics</h3>
          <div id="placementChart" style={{ height: "400px" }}></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-bold mb-4">Upcoming Placement Drives</h3>
          <div className="space-y-4">
            {companies.map((company, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{company.name}</h4>
                  <p className="text-sm text-gray-500">Drive Date: {company.driveDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{company.package}</p>
                  <p className="text-sm text-gray-500">{company.openPositions} Positions</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
