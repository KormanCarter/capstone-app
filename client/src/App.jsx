import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '/utilities/Header.jsx'
import Footer from '/utilities/Footer.jsx'

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
                <span className="block text-emerald-200">Online Learning</span>
              </h2>
              <div className="flex flex-wrap gap-4">
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-8 rounded-3xl shadow-2xl border border-emerald-700">
                <Link 
                  to="/courses" 
                  className="block w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-center px-10 py-5 rounded-xl hover:from-emerald-500 hover:to-emerald-400 text-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  Get Started →
                </Link>
              </div>
            </div>
          </div>
        </div>

      {/* Search and Filter Section */}
      <section className="py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-50 mb-3">Find Course</h2>
          </div>
          
          {/* Search Bar */}
          <div className="flex max-w-3xl mx-auto shadow-xl rounded-xl overflow-hidden mb-8">
            <input
              type="text"
              placeholder="Search courses by name or keyword..."
              className="flex-1 px-6 py-5 text-lg outline-none bg-gray-50 text-slate-900"
            />
            <button
              className="bg-emerald-600 text-white px-10 py-5 font-bold hover:bg-emerald-700 transition duration-300 disabled:opacity-50"
            >
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
              <button
                className={`px-6 py-3 rounded-full font-semibold transition duration-300`}
              >
              </button>
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
