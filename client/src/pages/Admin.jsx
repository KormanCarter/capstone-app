import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function AdminPage() {
  const { user, isAdmin, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  
  const [users, setUsers] = useState([])
  const [classes, setClasses] = useState([])
  const [allClasses, setAllClasses] = useState([]) // For user assignment
  const [activeTab, setActiveTab] = useState('users')
  const [editingUser, setEditingUser] = useState(null)
  const [editingClass, setEditingClass] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Check admin access
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      navigate('/home')
    }
  }, [isAuthenticated, isAdmin, loading, navigate])

  // Fetch data
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      // Always fetch all classes for user assignment
      fetchAllClasses()
      
      if (activeTab === 'users') {
        fetchUsers()
      } else {
        fetchClasses()
      }
    }
  }, [activeTab, isAuthenticated, isAdmin])

  const fetchAllClasses = async () => {
    try {
      const response = await fetch('/api/admin/classes', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setAllClasses(data)
      }
    } catch (error) {
      console.error('Error fetching all classes:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      console.log('Fetching users from /api/admin/users...')
      const response = await fetch('/api/admin/users', { credentials: 'include' })
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Users data:', data)
        setUsers(data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Fetch users failed:', response.status, errorData)
        setError(`Failed to fetch users: ${errorData.message || response.statusText}`)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Error fetching users: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/classes', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      } else {
        setError('Failed to fetch classes')
      }
    } catch (error) {
      setError('Error fetching classes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, { 
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        setSuccess('User deleted successfully')
        fetchUsers()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete user')
      }
    } catch (error) {
      setError('Error deleting user')
    }
  }

  const handleUpdateUser = async (userData) => {
    try {
      const response = await fetch(`/api/admin/users/${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData)
      })
      
      if (response.ok) {
        setSuccess('User updated successfully')
        setEditingUser(null)
        fetchUsers()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update user')
      }
    } catch (error) {
      setError('Error updating user')
    }
  }

  const handleUpdateClass = async (classData) => {
    try {
      const url = classData.id ? `/api/admin/classes/${classData.id}` : '/api/admin/classes'
      const method = classData.id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(classData)
      })
      
      if (response.ok) {
        setSuccess(classData.id ? 'Class updated successfully' : 'Class added successfully')
        setEditingClass(null)
        fetchClasses()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save class')
      }
    } catch (error) {
      setError('Error saving class')
    }
  }

  const handleDeleteClass = async (classId) => {
    if (!confirm('Are you sure you want to delete this class?')) return
    
    try {
      const response = await fetch(`/api/admin/classes/${classId}`, { 
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        setSuccess('Class deleted successfully')
        fetchClasses()
      } else {
        setError('Failed to delete class')
      }
    } catch (error) {
      setError('Error deleting class')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
        
        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">
            {error}
            <button onClick={() => setError('')} className="ml-2 text-red-500 hover:text-red-700">×</button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded-lg text-green-700">
            {success}
            <button onClick={() => setSuccess('')} className="ml-2 text-green-500 hover:text-green-700">×</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-4 border-b">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-4 font-semibold ${
                activeTab === 'users'
                  ? 'border-b-2 border-emerald-600 text-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Manage Users
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`py-2 px-4 font-semibold ${
                activeTab === 'classes'
                  ? 'border-b-2 border-emerald-600 text-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Manage Classes
            </button>
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Users</h2>
              </div>
              
              {isLoading ? (
                <div className="p-6 text-center">Loading users...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((listedUser) => (
                        <tr key={listedUser.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">
                                {listedUser.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{listedUser.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listedUser.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              listedUser.is_admin ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {listedUser.is_admin ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {listedUser.classes && listedUser.classes.length > 0 ? (
                              <div className="max-w-xs">
                                <div className="text-xs text-gray-600 mb-1">{listedUser.classes.length} classes:</div>
                                <div className="flex flex-wrap gap-1">
                                  {listedUser.classes.slice(0, 3).map((classId, idx) => {
                                    const classInfo = allClasses.find(c => c.course_id === classId)
                                    return (
                                      <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                        {classInfo ? classInfo.course_id : classId}
                                      </span>
                                    )
                                  })}
                                  {listedUser.classes.length > 3 && (
                                    <span className="text-xs text-gray-500">+{listedUser.classes.length - 3} more</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">No classes</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => setEditingUser(listedUser)}
                              className="text-emerald-600 hover:text-emerald-900"
                            >
                              Edit
                            </button>
                            {listedUser.id !== user.id && (
                              <button
                                onClick={() => handleDeleteUser(listedUser.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div>
            <div className="mb-4">
              <button
                onClick={() => setEditingClass({ 
                  course_id: '', course_title: '', course_description: '', 
                  classroom_number: '', capacity: 30, credit_hours: 3, tuition_cost: 900 
                })}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
              >
                Add New Class
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Classes</h2>
              </div>
              
              {isLoading ? (
                <div className="p-6 text-center">Loading classes...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classroom</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {classes.map((cls) => (
                        <tr key={cls.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.course_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cls.course_title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.classroom_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.capacity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.credit_hours}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cls.tuition_cost}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => setEditingClass(cls)}
                              className="text-emerald-600 hover:text-emerald-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClass(cls.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <UserEditModal
            user={editingUser}
            allClasses={allClasses}
            onSave={handleUpdateUser}
            onClose={() => setEditingUser(null)}
          />
        )}

        {/* Edit Class Modal */}
        {editingClass && (
          <ClassEditModal
            classData={editingClass}
            onSave={handleUpdateClass}
            onClose={() => setEditingClass(null)}
          />
        )}
      </div>
    </div>
  )
}

// User Edit Modal Component
function UserEditModal({ user, allClasses, onSave, onClose }) {
  const [formData, setFormData] = useState({
    ...user,
    classes: user.classes || []
  })

  const handleClassToggle = (courseId) => {
    const currentClasses = formData.classes || []
    const newClasses = currentClasses.includes(courseId)
      ? currentClasses.filter(id => id !== courseId)
      : [...currentClasses, courseId]
    
    setFormData({ ...formData, classes: newClasses })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Edit User</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_admin || false}
                onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                className="mr-2"
              />
              Admin privileges
            </label>
          </div>
          
          {/* Classes Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enrolled Classes ({formData.classes?.length || 0} selected)
            </label>
            <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
              {allClasses && allClasses.length > 0 ? (
                <div className="space-y-2">
                  {allClasses.map((classItem) => (
                    <label key={classItem.course_id} className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={(formData.classes || []).includes(classItem.course_id)}
                        onChange={() => handleClassToggle(classItem.course_id)}
                        className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{classItem.course_id}</div>
                        <div className="text-sm text-gray-500 truncate">{classItem.course_title}</div>
                        <div className="text-xs text-gray-400">
                          {classItem.classroom_number} • {classItem.credit_hours} credits • ${classItem.tuition_cost}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No classes available</div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Class Edit Modal Component
function ClassEditModal({ classData, onSave, onClose }) {
  const [formData, setFormData] = useState({ ...classData })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-4">
          {formData.id ? 'Edit Class' : 'Add New Class'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Course ID</label>
            <input
              type="text"
              value={formData.course_id || ''}
              onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Course Title</label>
            <input
              type="text"
              value={formData.course_title || ''}
              onChange={(e) => setFormData({ ...formData, course_title: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.course_description || ''}
              onChange={(e) => setFormData({ ...formData, course_description: e.target.value })}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Classroom</label>
              <input
                type="text"
                value={formData.classroom_number || ''}
                onChange={(e) => setFormData({ ...formData, classroom_number: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity</label>
              <input
                type="number"
                value={formData.capacity || ''}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Credit Hours</label>
              <input
                type="number"
                value={formData.credit_hours || ''}
                onChange={(e) => setFormData({ ...formData, credit_hours: parseInt(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tuition Cost</label>
              <input
                type="number"
                value={formData.tuition_cost || ''}
                onChange={(e) => setFormData({ ...formData, tuition_cost: parseInt(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
