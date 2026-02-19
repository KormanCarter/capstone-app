import { Link } from 'react-router-dom';
import Header from '../../utilities/Header.jsx';
import Footer from '../../utilities/Footer.jsx';
import { useTheme } from '../contexts/ThemeContext';

export default function Landing() {
  const { darkMode } = useTheme();
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <Header />

      {/* Hero Section */}
      <section className={`py-20 md:py-28 ${darkMode ? 'bg-black text-white' : 'bg-white text-gray-800'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                Transform Your Future with 
                <span className="block text-emerald-400">Learning</span>
              </h2>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/signup"
                  className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-emerald-500 transition duration-300 text-lg"
                >
                    Get Started
                </Link>
                <Link 
                  to="/courses"
                  className={`px-8 py-4 rounded-lg font-bold transition duration-300 text-lg ${darkMode ? 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30' : 'bg-black/10 backdrop-blur-sm text-gray-800 hover:bg-black/20'}`}
                >
                  Browse Courses
                </Link>
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
      </section>

      {/* CTA Section */}
      <section className={`py-12 ${darkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className={`text-4xl font-bold mb-3 ${darkMode ? 'text-gray-50' : 'text-gray-800'}`}>Get Started</h2>
          </div>
          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className={`px-8 py-4 rounded-lg font-semibold transition duration-300 text-lg ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'} hover:shadow-lg`}
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-8 py-4 rounded-lg font-semibold transition duration-300 bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-lg text-lg"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
