import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../../utilities/Header.jsx';
import Footer from '../../utilities/Footer.jsx';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    enrolledCourses: 0,
    availableCourses: 0
  });
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Fetch courses and stats when component mounts
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoadingCourses(true);
      const classEndpoints = ['/api/classes', '/api/class2'];
      let coursesData = [];

      for (const endpoint of classEndpoints) {
        const response = await fetch(endpoint, { credentials: 'include' });
        if (response.ok) {
          coursesData = await response.json();
          break;
        }
      }

      const enrolledResponse = await fetch('/api/profile/classes', { credentials: 'include' });
      const enrolledData = enrolledResponse.ok ? await enrolledResponse.json() : [];

      const totalCourses = Array.isArray(coursesData) ? coursesData.length : 0;
      const enrolledCourses = Array.isArray(enrolledData) ? enrolledData.length : 0;
      const availableCourses = Math.max(totalCourses - enrolledCourses, 0);

      setCourses(Array.isArray(coursesData) ? coursesData.slice(0, 6) : []);
      setStats({ totalCourses, enrolledCourses, availableCourses });
      setLoadingCourses(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoadingCourses(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-white'}`}>
      <Header />
      
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Welcome back, {user?.name || 'Student'}! 
          </h1>
          <p className="text-emerald-100 text-lg">
            Continue your learning journey
          </p>
        </div>
      </section>

      {/* Stats Dashboard */}
      <section className={`py-8 ${darkMode ? 'bg-black' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Total Courses */}
            <div className={`rounded-xl p-6 border transition duration-300 ${darkMode ? 'bg-slate-900 border-slate-600 hover:border-emerald-600' : 'bg-slate-100 border-slate-300 hover:border-emerald-500'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm uppercase tracking-wide mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Courses</p>
                  <p className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stats.totalCourses}</p>
                </div>
              </div>
            </div>

            {/* Enrolled Courses */}
            <div className={`rounded-xl p-6 border transition duration-300 ${darkMode ? 'bg-slate-900 border-slate-600 hover:border-emerald-600' : 'bg-slate-100 border-slate-300 hover:border-emerald-500'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm uppercase tracking-wide mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Enrolled</p>
                  <p className="text-4xl font-bold text-emerald-400">{stats.enrolledCourses}</p>
                </div>
              </div>
            </div>

            {/* Completed Courses */}
            <div className={`rounded-xl p-6 border transition duration-300 ${darkMode ? 'bg-slate-900 border-slate-600 hover:border-emerald-600' : 'bg-slate-100 border-slate-300 hover:border-emerald-500'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm uppercase tracking-wide mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                  <p className="text-4xl font-bold text-emerald-400">{stats.completedCourses}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Available Courses Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Available Courses</h2>
              <Link 
                to="/courses"
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-2"
              >
                View All →
              </Link>
            </div>

            {loadingCourses ? (
              <p className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading courses...</p>
            ) : courses.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <Link 
                    key={course.id}
                    to="/courses"
                    className={`rounded-lg p-6 border transition duration-300 group ${darkMode ? 'bg-slate-900 border-slate-600 hover:border-emerald-600' : 'bg-slate-100 border-slate-300 hover:border-emerald-500'}`}
                  >
                    <h3 className={`text-xl font-bold mb-2 group-hover:text-emerald-400 transition ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {course.course_title || course.name}
                    </h3>
                    <p className={`mb-4 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {course.course_description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400 font-semibold">
                        {course.tuition_cost ? `$${course.tuition_cost}` : 'Free'}
                      </span>
                      <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        View Details →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-100 border-slate-300'}`}>
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No courses available yet.</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to start learning?
            </h3>
            <div className="flex justify-center gap-4">
              <Link 
                to="/courses"
                className="bg-white text-emerald-800 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition duration-300"
              >
                Browse All Courses
              </Link>
              <Link 
                to="/profile"
                className="bg-emerald-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-950 transition duration-300 border border-emerald-700"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
