<<<<<<< HEAD
import { useState } from 'react'
import { Link } from 'react-router-dom'
=======
import { useState, useEffect } from 'react'
>>>>>>> 986f64bb389d767698134df08235a29a0212c6d1

function App() {
  console.log('App component is rendering!')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch courses from the backend
  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching courses from backend...')
      const response = await fetch('/api/search-classes')
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Raw data from backend:', data)
        console.log('Number of records:', data.length)
        
        if (data.length === 0) {
          console.log('No data from backend, using fallback static data')
          setError('No courses found in database')
          // Use static fallback data
          setCourses([
            { 
              id: 1, 
              title: 'Web Development Fundamentals', 
              category: 'Technology', 
              duration: '12 weeks', 
              level: 'Beginner',
              students: 1250,
              rating: 4.8,
              price: '$299'
            },
            { 
              id: 2, 
              title: 'Data Science & Analytics', 
              category: 'Technology', 
              duration: '16 weeks', 
              level: 'Intermediate',
              students: 890,
              rating: 4.9,
              price: '$399'
            }
          ])
        } else {
          console.log('Using real database data')
          // Transform backend data to match frontend structure
          const transformedData = data.map(course => {
            console.log('Processing course:', course)
            return {
              id: course.course_id || course.Course_ID,
              title: course.course_title || course.Course_Title || `Course ${course.course_id}`,
              category: course.course_id?.startsWith('CSCI') ? 'Technology' : course.course_id?.startsWith('ISYS') ? 'Information Systems' : 'General',
              duration: `${course.credit_hours || course.Credit_Hours || 3} credit hours`,
              level: (course.credit_hours || course.Credit_Hours) >= 4 ? 'Advanced' : 'Intermediate',
              students: course.capacity || course.Capacity || 30,
              rating: (Math.random() * 1.5 + 3.5).toFixed(1),
              price: `$${course.tuition_cost || course.Tuition_Cost || 900}`,
              description: course.course_description || course.Course_Description || '',
              classroom: course.classroom_number || course.Classroom_Number || ''
            }
          })
          console.log('Transformed data:', transformedData)
          setCourses(transformedData)
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      setError(error.message)
      // Fallback to static data if API fails
      setCourses([
        { 
          id: 1, 
          title: 'Web Development Fundamentals', 
          category: 'Technology', 
          duration: '12 weeks', 
          level: 'Beginner',
          students: 1250,
          rating: 4.8,
          price: '$299'
        },
        { 
          id: 2, 
          title: 'Data Science & Analytics', 
          category: 'Data', 
          duration: '16 weeks', 
          level: 'Intermediate',
          students: 890,
          rating: 4.9,
          price: '$399'
        },
        { 
          id: 3, 
          title: 'Digital Marketing Mastery', 
          category: 'Marketing', 
          duration: '8 weeks', 
          level: 'Beginner',
          students: 2100,
          rating: 4.7,
          price: '$249'
        },
        { 
          id: 4, 
          title: 'Mobile App Development', 
          category: 'Technology', 
          duration: '14 weeks', 
          level: 'Intermediate',
          students: 1580,
          rating: 4.8,
          price: '$349'
        },
        { 
          id: 5, 
          title: 'Graphic Design Essentials', 
          category: 'Design', 
          duration: '10 weeks', 
          level: 'Beginner',
          students: 1920,
          rating: 4.6,
          price: '$279'
        },
        { 
          id: 6, 
          title: 'Business Administration', 
          category: 'Business', 
          duration: '20 weeks', 
          level: 'Advanced',
          students: 650,
          rating: 4.9,
          price: '$499'
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Search function that calls backend API
  const handleSearch = async (query) => {
    if (!query.trim()) {
      console.log('Empty search, fetching all courses')
      fetchCourses() // Fetch all courses if search is empty
      return
    }

    try {
      setLoading(true)
      console.log('Searching for:', query)
      const response = await fetch(`/api/search-classes?query=${encodeURIComponent(query)}`)
      console.log('Search response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Search results:', data)
        
        const transformedData = data.map(course => ({
          id: course.course_id || course.Course_ID,
          title: course.course_title || course.Course_Title || `Course ${course.course_id}`,
          category: course.course_id?.startsWith('CSCI') ? 'Technology' : course.course_id?.startsWith('ISYS') ? 'Information Systems' : 'General',
          duration: `${course.credit_hours || course.Credit_Hours || 3} credit hours`,
          level: course.credit_hours >= 4 ? 'Advanced' : 'Intermediate',
          students: course.capacity || course.Capacity || 30,
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          price: `$${course.tuition_cost || course.Tuition_Cost || 900}`,
          description: course.course_description || course.Course_Description || '',
          classroom: course.classroom_number || course.Classroom_Number || ''
        }))
        setCourses(transformedData)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update search term and trigger backend search
  const updateSearchTerm = (value) => {
    setSearchTerm(value)
    handleSearch(value)
  }

  const categories = ['All', 'Technology', 'Information Systems']

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory
    return matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Navigation Header */}
      <header className="bg-black text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="text-4xl">🎓</div>
              <h1 className="text-3xl font-bold">Kormaia</h1>
            </div>
            <ul className="hidden md:flex space-x-8 font-medium text-lg">
              <li><Link to="/home" className="hover:text-emerald-200 transition duration-300  border-transparent border-1 rounded-md hover:border-emerald-200 p-1">Home</Link></li>
              <li><Link to="/courses" className="hover:text-emerald-200 transition duration-300 border-transparent border-1 rounded-md hover:border-emerald-200 p-1">Courses</Link></li>
              <li><Link to="/about" className="hover:text-emerald-200 transition duration-300 border-transparent border-1 rounded-md hover:border-emerald-200 p-1">About</Link></li>
            </ul>
            <div className="flex gap-3">
              <button className="hidden md:block bg-white/20 backdrop-blur-sm px-5 py-2 rounded-lg font-semibold hover:bg-white/30 transition duration-300">
                Log In
              </button>
              <button className="bg-white text-emerald-800 px-6 py-2 rounded-lg font-semibold hover:shadow-xl hover:-translate-y-0.5 transition duration-300">
                Sign Up
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-black text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                Transform Your Future with 
                <span className="block text-emerald-200">Online Learning</span>
              </h2>
              <p className="text-xl mb-8 opacity-95 leading-relaxed">
                Join thousands of students worldwide. Learn from industry experts, earn certifications, 
                and advance your career with our flexible online courses.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-cyan-800 px-8 py-4 rounded-lg text-lg font-bold hover:shadow-2xl hover:-translate-y-1 transition duration-300">
                  Browse Courses →
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-800 rounded-3xl blur-2xl opacity-50"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 bg-white/20 rounded-lg p-4">
                      <div>
                        <p className="font-semibold">1000+ Courses</p>
                        <p className="text-sm opacity-80">Expert-led programs</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white/20 rounded-lg p-4">
                      <div>
                        <p className="font-semibold">Certified Learning</p>
                        <p className="text-sm opacity-80">Industry recognized</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white/20 rounded-lg p-4">
                      <div>
                        <p className="font-semibold">Career Support</p>
                        <p className="text-sm opacity-80">Job placement assistance</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-3">Find Your Perfect Course</h2>
            <p className="text-gray-600 text-lg">Search from our extensive catalog</p>
          </div>
          
          {/* Search Bar */}
          <div className="flex max-w-3xl mx-auto shadow-xl rounded-xl overflow-hidden mb-8">
            <input
              type="text"
              placeholder="Search courses by name or keyword..."
              value={searchTerm}
              onChange={(e) => updateSearchTerm(e.target.value)}
              className="flex-1 px-6 py-5 text-lg outline-none"
              disabled={loading}
            />
            <button 
              onClick={() => handleSearch(searchTerm)}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-5 font-bold hover:from-purple-700 hover:to-pink-700 transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold transition duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-3">Popular Courses</h2>
            <p className="text-gray-600 text-lg">
              {loading ? 'Loading courses...' : `${filteredCourses.length} course${filteredCourses.length !== 1 ? 's' : ''} available`}
            </p>
            {error && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-4">
                <p>Using fallback data due to: {error}</p>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div 
                key={course.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition duration-300 border border-gray-100"
              >
                {/* Course Header with Gradient */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                      {course.category}
                    </span>
                    <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                      {course.level}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold">{course.title}</h3>
                </div>

                {/* Course Details */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span>⭐</span>
                      <span className="font-semibold text-gray-800">{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>👥</span>
                      <span>{course.students.toLocaleString()} students</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4 text-gray-600">
                    <span>⏱️</span>
                    <span className="font-medium">Duration: {course.duration}</span>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="text-3xl font-bold text-purple-600">{course.price}</div>
                    <div className="text-sm text-gray-500 line-through">$499</div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:shadow-xl hover:from-purple-700 hover:to-pink-700 transition duration-300">
                    Apply Now →
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}

          {!loading && filteredCourses.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No courses found</h3>
              <p className="text-gray-600">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-4xl">🎓</div>
                <h3 className="text-2xl font-bold">EduHub</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering students worldwide with quality education and career opportunities.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-gray-400 hover:text-white transition duration-300">About Us</a></li>
                <li><a href="#courses" className="text-gray-400 hover:text-white transition duration-300">Courses</a></li>
                <li><a href="#instructors" className="text-gray-400 hover:text-white transition duration-300">Instructors</a></li>
                <li><a href="#blog" className="text-gray-400 hover:text-white transition duration-300">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#faq" className="text-gray-400 hover:text-white transition duration-300">FAQ</a></li>
                <li><a href="#help" className="text-gray-400 hover:text-white transition duration-300">Help Center</a></li>
                <li><a href="#terms" className="text-gray-400 hover:text-white transition duration-300">Terms of Service</a></li>
                <li><a href="#privacy" className="text-gray-400 hover:text-white transition duration-300">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <span>📧</span>
                  <span>info@eduhub.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📞</span>
                  <span>(555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📍</span>
                  <span>123 Education St, Learning City</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              &copy; 2026 EduHub. All rights reserved.
            </p>
            <div className="flex space-x-6 text-2xl">
              <a href="#facebook" className="hover:text-purple-400 transition duration-300">📘</a>
              <a href="#twitter" className="hover:text-purple-400 transition duration-300">🐦</a>
              <a href="#instagram" className="hover:text-purple-400 transition duration-300">📸</a>
              <a href="#linkedin" className="hover:text-purple-400 transition duration-300">💼</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
