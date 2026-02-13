import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '/utilities/Header.jsx'
import Footer from '/utilities/Footer.jsx'
import SearchBar from './components/SearchBar.jsx'

function App() {
  
  return (
    <div className="min-h-screen bg-gray-50">

      <Header />

      {/* Hero Section */}
      <section className="bg-black text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                Transform Your Future with 
                <span className="block text-emerald-200">Learning</span>
              </h2>
              <div className="flex flex-wrap gap-4">
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-8 rounded-3xl shadow-2xl border border-emerald-700">
                <Link 
                  to="/courses" 
                  className="block w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-center px-10 py-5 rounded-xl hover:from-emerald-500 hover:to-emerald-400 text-xl font-bold transition-all duration-300 transform hover:scale-102 hover:shadow-xl"
                >
                  See Courses →
                </Link>
              </div>
            </div>
          </div>
        </div>

      {/* Get Started */}
      <section className="py-12 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-50 mb-3">Get Started</h2>
            <p className="text-gray-400 text-lg">Log In or Sign Up</p>
          </div>
          <div className="flex justify-center">
            <Link
              to="/login"
              className="px-6 py-3 rounded-full font-semibold transition duration-300 bg-gray-700 text-white hover:bg-gray-800 hover:shadow-lg"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="ml-4 px-6 py-3 rounded-full font-semibold transition duration-300 bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      </section>
    </div>

  )
}

export default App
