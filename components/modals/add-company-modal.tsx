"use client"

import { useState } from "react"

interface AddCompanyModalProps {
  onClose: () => void
}

export function AddCompanyModal({ onClose }: AddCompanyModalProps) {
  const [companyQuestions, setCompanyQuestions] = useState([{ id: 1, question: "", answer: "" }])
  const [codingQuestions, setCodingQuestions] = useState([
    {
      id: 1,
      title: "",
      description: "",
      sampleInput: "",
      sampleOutput: "",
      solution: "",
    },
  ])

  const addCompanyQuestion = () => {
    const newId = companyQuestions.length + 1
    setCompanyQuestions([...companyQuestions, { id: newId, question: "", answer: "" }])
  }

  const removeCompanyQuestion = (id: number) => {
    setCompanyQuestions(companyQuestions.filter((q) => q.id !== id))
  }

  const addCodingQuestion = () => {
    const newId = codingQuestions.length + 1
    setCodingQuestions([
      ...codingQuestions,
      {
        id: newId,
        title: "",
        description: "",
        sampleInput: "",
        sampleOutput: "",
        solution: "",
      },
    ])
  }

  const removeCodingQuestion = (id: number) => {
    setCodingQuestions(codingQuestions.filter((q) => q.id !== id))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Add New Company</h3>
          <button onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter company name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Open Positions</label>
            <input
              type="number"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter number of positions"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Position Name</label>
            <input
              type="text"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter job position name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Eligible Year of Passedouts</label>
            <div className="flex flex-wrap gap-2">
              {["2023", "2024", "2025"].map((year) => (
                <label key={year} className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 cursor-pointer" />
                  <span>{year}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Eligible Branches</label>
            <div className="flex flex-wrap gap-2">
              {["CSE", "ECE", "ME", "CE", "IT"].map((branch) => (
                <label key={branch} className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 cursor-pointer" />
                  <span>{branch}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Eligible Gender</label>
            <div className="flex gap-4">
              {["Male", "Female", "Other"].map((gender) => (
                <label key={gender} className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 cursor-pointer" />
                  <span>{gender}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Eligible Percentage</label>
            <input
              type="number"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter minimum percentage required"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Application Link</label>
            <input
              type="url"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter application URL"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
            <textarea
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter detailed job description"
              rows={4}
            ></textarea>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">HR Details</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                className="border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="HR Name"
              />
              <input
                type="email"
                className="border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="HR Email"
              />
              <input
                type="tel"
                className="border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="HR Phone"
              />
              <input
                type="text"
                className="border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="HR Designation"
              />
            </div>
          </div>
          <div className="col-span-2 mt-6">
            <label className="block text-lg font-semibold text-blue-600 mb-4">Company Specific Questions</label>
            <div className="space-y-4">
              {companyQuestions.map((q) => (
                <div key={q.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <label className="block text-sm font-medium text-gray-700">Question {q.id}</label>
                    <button onClick={() => removeCompanyQuestion(q.id)} className="text-red-600 hover:text-red-800">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => {
                      const updated = companyQuestions.map((item) =>
                        item.id === q.id ? { ...item, question: e.target.value } : item,
                      )
                      setCompanyQuestions(updated)
                    }}
                    className="w-full border rounded-lg px-4 py-2 mb-2 focus:outline-none focus:border-blue-500"
                    placeholder="Enter question"
                  />
                  <textarea
                    value={q.answer}
                    onChange={(e) => {
                      const updated = companyQuestions.map((item) =>
                        item.id === q.id ? { ...item, answer: e.target.value } : item,
                      )
                      setCompanyQuestions(updated)
                    }}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="Enter answer"
                    rows={2}
                  ></textarea>
                </div>
              ))}
            </div>
            <button onClick={addCompanyQuestion} className="mt-2 text-blue-600 hover:text-blue-800">
              <i className="fas fa-plus mr-2"></i>Add Another Question
            </button>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 rounded-button whitespace-nowrap"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 rounded-button whitespace-nowrap">
            Add Company
          </button>
        </div>
      </div>
    </div>
  )
}
