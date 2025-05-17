"use client"

import { useState } from "react"

export function WhatsappContent() {
  const [whatsappMessage, setWhatsappMessage] = useState("")

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">WhatsApp Communication</h3>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 rounded-button whitespace-nowrap">
            <i className="fab fa-whatsapp mr-2"></i>Send Bulk Messages
          </button>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold mb-4">Message Templates</h4>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 cursor-pointer hover:border-green-500">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium">Placement Drive Notification</h5>
                  <span className="text-green-600">
                    <i className="fas fa-check-circle"></i>
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  Hello {"{student_name}"}, A new placement drive for {"{company_name}"} is scheduled on{" "}
                  {"{drive_date}"}. Package: {"{package}"}
                </p>
              </div>
              <div className="border rounded-lg p-4 cursor-pointer hover:border-green-500">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium">Interview Reminder</h5>
                  <span className="text-green-600">
                    <i className="fas fa-check-circle"></i>
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  Hi {"{student_name}"}, This is a reminder for your interview with {"{company_name}"} scheduled at{" "}
                  {"{interview_time}"}
                </p>
              </div>
              <div className="border rounded-lg p-4 cursor-pointer hover:border-green-500">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium">Document Submission</h5>
                  <span className="text-green-600">
                    <i className="fas fa-check-circle"></i>
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  Dear {"{student_name}"}, Please submit your {"{document_type}"} by {"{deadline}"} for the placement
                  process
                </p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Custom Message</h4>
            <div className="space-y-4">
              <textarea
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
                placeholder="Type your message here..."
                rows={4}
              ></textarea>
              <div className="flex gap-2 flex-wrap">
                <button className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200">
                  {"{student_name}"}
                </button>
                <button className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200">
                  {"{company_name}"}
                </button>
                <button className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200">
                  {"{drive_date}"}
                </button>
                <button className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200">{"{package}"}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Message History</h3>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search messages..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            </div>
            <select className="border rounded-lg px-4 py-2 focus:outline-none focus:border-green-500">
              <option>All Templates</option>
              <option>Placement Drive</option>
              <option>Interview Reminder</option>
              <option>Document Submission</option>
            </select>
          </div>
        </div>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h5 className="font-medium">Placement Drive Notification</h5>
                <p className="text-sm text-gray-500">Sent to 45 recipients • 2 hours ago</p>
              </div>
              <span className="text-green-600">
                <i className="fas fa-check-double"></i>
              </span>
            </div>
            <p className="text-gray-600">
              Hello students, A new placement drive for TechCorp Solutions is scheduled on March 15, 2025. Package: ₹18
              LPA
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h5 className="font-medium">Interview Reminder</h5>
                <p className="text-sm text-gray-500">Sent to 12 recipients • 5 hours ago</p>
              </div>
              <span className="text-green-600">
                <i className="fas fa-check-double"></i>
              </span>
            </div>
            <p className="text-gray-600">
              Hi students, This is a reminder for your interview with Global Systems Inc scheduled at 10:00 AM tomorrow
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h5 className="font-medium">Document Submission</h5>
                <p className="text-sm text-gray-500">Sent to 28 recipients • 1 day ago</p>
              </div>
              <span className="text-green-600">
                <i className="fas fa-check-double"></i>
              </span>
            </div>
            <p className="text-gray-600">
              Dear students, Please submit your updated resume by February 20, 2025 for the upcoming placement process
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
