import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

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
              <h1 className="text-3xl font-bold">Kormacatron</h1>
            </div>
            <ul className="hidden md:flex space-x-8 font-medium text-lg">
              <li><Link to="/home" className="hover:text-emerald-200 transition duration-300  border-transparent border-1 rounded-md hover:border-emerald-200 p-1">Home</Link></li>
              <li><Link to="/courses" className="hover:text-emerald-200 transition duration-300 border-transparent border-1 rounded-md hover:border-emerald-200 p-1">Courses</Link></li>
              <li><Link to="/about" className="hover:text-emerald-200 transition duration-300 border-transparent border-1 rounded-md hover:border-emerald-200 p-1">About</Link></li>
            </ul>
            <div className="flex gap-3">
              <Link to="/login">
                <button className="hidden md:block bg-white/20 backdrop-blur-sm px-5 py-2 rounded-lg font-semibold hover:bg-white/30 transition duration-300">
                  Log In
                </button>
              </Link>
              <Link to="/signup">
                <button className="bg-white text-emerald-800 px-6 py-2 rounded-lg font-semibold hover:shadow-xl hover:-translate-y-0.5 transition duration-300">
                  Sign Up
                </button>
              </Link>
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
            <h2 className="text-4xl font-bold text-gray-800 mb-3">Find Course</h2>
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
              className="bg-emerald-600 text-white px-10 py-5 font-bold hover:bg-emerald-700 transition duration-300 disabled:opacity-50"
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
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <h3 className="text-2xl font-bold">Kormac</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                lit
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-gray-400 hover:text-white transition duration-300">About Us</a></li>
                <li><a href="#courses" className="text-gray-400 hover:text-white transition duration-300">Courses</a></li>
              </ul>
            </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              &copy; 2026 Kormac. All rights reserved.
            </p>
          </div>
        </div>
        </div>
      </footer>
    </div>
  )
}

export default App
