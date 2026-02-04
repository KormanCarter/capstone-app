import { useState } from 'react'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const courses = [
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
  ]

  const categories = ['All', 'Technology', 'Data', 'Marketing', 'Design', 'Business']

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-gradient-to-r from-emerald-900 via-teal-700 to-cyan-900 text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="text-4xl">🎓</div>
              <h1 className="text-3xl font-bold">EduHub</h1>
            </div>
            <ul className="hidden md:flex space-x-8 font-medium text-lg">
              <li><a href="#home" className="hover:text-pink-200 transition duration-300">Home</a></li>
              <li><a href="#courses" className="hover:text-pink-200 transition duration-300">Courses</a></li>
              <li><a href="#about" className="hover:text-pink-200 transition duration-300">About</a></li>
              <li><a href="#instructors" className="hover:text-pink-200 transition duration-300">Instructors</a></li>
            </ul>
            <div className="flex gap-3">
              <button className="hidden md:block bg-white/20 backdrop-blur-sm px-5 py-2 rounded-lg font-semibold hover:bg-white/30 transition duration-300">
                Log In
              </button>
              <button className="bg-white text-cyan-800 px-6 py-2 rounded-lg font-semibold hover:shadow-xl hover:-translate-y-0.5 transition duration-300">
                Sign Up
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-900 via-teal-700 to-cyan-900 text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                Transform Your Future with 
                <span className="block text-pink-200">Online Learning</span>
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
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-400 rounded-3xl blur-2xl opacity-50"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 bg-white/20 rounded-lg p-4">
                      <div className="text-4xl">✨</div>
                      <div>
                        <p className="font-semibold">1000+ Courses</p>
                        <p className="text-sm opacity-80">Expert-led programs</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white/20 rounded-lg p-4">
                      <div className="text-4xl">🏆</div>
                      <div>
                        <p className="font-semibold">Certified Learning</p>
                        <p className="text-sm opacity-80">Industry recognized</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white/20 rounded-lg p-4">
                      <div className="text-4xl">💼</div>
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-6 py-5 text-lg outline-none"
            />
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-5 font-bold hover:from-purple-700 hover:to-pink-700 transition duration-300">
              Search
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
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
            </p>
          </div>

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

          {filteredCourses.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No courses found</h3>
              <p className="text-gray-600">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-3">Why Choose EduHub?</h2>
            <p className="text-gray-600 text-lg">Your success is our priority</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl text-center hover:shadow-xl hover:-translate-y-1 transition duration-300">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Quality Education</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn from industry-leading instructors with cutting-edge curriculum
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl text-center hover:shadow-xl hover:-translate-y-1 transition duration-300">
              <div className="text-6xl mb-4">⏰</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Flexible Learning</h3>
              <p className="text-gray-600 leading-relaxed">
                Study at your own pace with 24/7 access to all course materials
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl text-center hover:shadow-xl hover:-translate-y-1 transition duration-300">
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Certified Programs</h3>
              <p className="text-gray-600 leading-relaxed">
                Earn industry-recognized certificates upon successful completion
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl text-center hover:shadow-xl hover:-translate-y-1 transition duration-300">
              <div className="text-6xl mb-4">💼</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Career Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Get dedicated job placement assistance and career guidance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl mb-8 opacity-95">
            Join over 50,000 students who are already transforming their careers with EduHub
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-white text-purple-600 px-10 py-4 rounded-lg text-lg font-bold hover:shadow-2xl hover:scale-105 transition duration-300">
              Get Started Free
            </button>
            <button className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-lg text-lg font-bold hover:bg-white hover:text-purple-600 transition duration-300">
              View All Courses
            </button>
          </div>
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
