export function TPOContent() {
  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">TPO Team Members</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 rounded-button whitespace-nowrap">
            <i className="fas fa-plus mr-2"></i>Add TPO Member
          </button>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <i className="fas fa-user-tie text-blue-600 text-2xl"></i>
              </div>
              <div>
                <h4 className="text-lg font-semibold">Dr. Sarah Wilson</h4>
                <p className="text-gray-500">Student Queries</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <i className="fas fa-envelope text-gray-400 w-5 mr-2"></i>
                <span className="text-sm">sarah.wilson@university.edu</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-phone text-gray-400 w-5 mr-2"></i>
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-user-graduate text-gray-400 w-5 mr-2"></i>
                <span className="text-sm">125 Students Assigned</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 rounded-button whitespace-nowrap">
                <i className="fas fa-edit mr-2"></i>Edit
              </button>
              <button className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 rounded-button whitespace-nowrap">
                <i className="fas fa-trash mr-2"></i>Remove
              </button>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <i className="fas fa-user-tie text-green-600 text-2xl"></i>
              </div>
              <div>
                <h4 className="text-lg font-semibold">Prof. James Anderson</h4>
                <p className="text-gray-500">Company Queries</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <i className="fas fa-envelope text-gray-400 w-5 mr-2"></i>
                <span className="text-sm">james.anderson@university.edu</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-phone text-gray-400 w-5 mr-2"></i>
                <span className="text-sm">+91 98765 43211</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-building text-gray-400 w-5 mr-2"></i>
                <span className="text-sm">15 Companies Managed</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 rounded-button whitespace-nowrap">
                <i className="fas fa-edit mr-2"></i>Edit
              </button>
              <button className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 rounded-button whitespace-nowrap">
                <i className="fas fa-trash mr-2"></i>Remove
              </button>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <i className="fas fa-user-tie text-purple-600 text-2xl"></i>
              </div>
              <div>
                <h4 className="text-lg font-semibold">Dr. Emily Parker</h4>
                <p className="text-gray-500">Other Queries</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <i className="fas fa-envelope text-gray-400 w-5 mr-2"></i>
                <span className="text-sm">emily.parker@university.edu</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-phone text-gray-400 w-5 mr-2"></i>
                <span className="text-sm">+91 98765 43212</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-tasks text-gray-400 w-5 mr-2"></i>
                <span className="text-sm">General Administration</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 rounded-button whitespace-nowrap">
                <i className="fas fa-edit mr-2"></i>Edit
              </button>
              <button className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 rounded-button whitespace-nowrap">
                <i className="fas fa-trash mr-2"></i>Remove
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-6">Recent Activities</h3>
        <div className="space-y-4">
          <div className="flex items-center p-4 border rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <i className="fas fa-user-plus text-blue-600"></i>
            </div>
            <div>
              <p className="font-medium">Dr. Sarah Wilson assigned 15 new students</p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-4 border rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <i className="fas fa-building text-green-600"></i>
            </div>
            <div>
              <p className="font-medium">Prof. James Anderson added TechCorp Solutions</p>
              <p className="text-sm text-gray-500">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-4 border rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <i className="fas fa-file-alt text-purple-600"></i>
            </div>
            <div>
              <p className="font-medium">Dr. Emily Parker updated placement guidelines</p>
              <p className="text-sm text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
