import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../../utilities/Header.jsx';
import Footer from '../../utilities/Footer.jsx';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    enrolledCourses: 0,
    completedCourses: 0
  });
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Fetch courses and stats when component mounts
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoadingCourses(true);
      // Fetch recent courses
      const coursesResponse = await fetch('/api/class2', { credentials: 'include' });
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.slice(0, 6)); // Show only first 6 courses
        setStats(prev => ({ ...prev, totalCourses: coursesData.length }));
      }
      setLoadingCourses(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoadingCourses(false);
    }
  };

  return (
    <div className="min-h-screen">
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
      <section className="py-8 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Total Courses */}
            <div className="bg-slate-900 border border-slate-600 rounded-xl p-6 hover:border-emerald-600 transition duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">Total Courses</p>
                  <p className="text-4xl font-bold text-white">{stats.totalCourses}</p>
                </div>
              </div>
            </div>

            {/* Enrolled Courses */}
            <div className="bg-slate-900 border border-slate-600 rounded-xl p-6 hover:border-emerald-600 transition duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">Enrolled</p>
                  <p className="text-4xl font-bold text-emerald-400">{stats.enrolledCourses}</p>
                </div>
              </div>
            </div>

            {/* Completed Courses */}
            <div className="bg-slate-900 border border-slate-600 rounded-xl p-6 hover:border-emerald-600 transition duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">Completed</p>
                  <p className="text-4xl font-bold text-emerald-400">{stats.completedCourses}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Available Courses Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Available Courses</h2>
              <Link 
                to="/courses"
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-2"
              >
                View All →
              </Link>
            </div>

            {loadingCourses ? (
              <p className="text-gray-400 text-center py-12">Loading courses...</p>
            ) : courses.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <Link 
                    key={course.id}
                    to="/courses"
                    className="bg-slate-900 border border-slate-600 rounded-lg p-6 hover:border-emerald-600 transition duration-300 group"
                  >
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition">
                      {course.course_title || course.name}
                    </h3>
                    <p className="text-gray-400 mb-4 line-clamp-2">
                      {course.course_description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400 font-semibold">
                        {course.tuition_cost ? `$${course.tuition_cost}` : 'Free'}
                      </span>
                      <span className="text-gray-500 text-sm">
                        View Details →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-600">
                <p className="text-gray-400 text-lg">No courses available yet.</p>
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
