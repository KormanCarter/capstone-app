import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../../utilities/Header.jsx';
import Footer from '../../utilities/Footer.jsx';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [currentCourses, setCurrentCourses] = useState([]);
  const [completedCoursesList, setCompletedCoursesList] = useState([]);
  const [completionStatusByCourse, setCompletionStatusByCourse] = useState({});
  const [completionBusyCourseId, setCompletionBusyCourseId] = useState('');
  const [dashboardError, setDashboardError] = useState('');
  const [stats, setStats] = useState({
    totalCourses: 0,
    enrolledCourses: 0,
    availableCourses: 0,
    completedCourses: 0
  });
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Fetch courses and stats when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

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

      let enrolledData = [];
      const enrolledResponse = await fetch('/api/profile/classes', { credentials: 'include' });
      if (enrolledResponse.ok) {
        enrolledData = await enrolledResponse.json();
      } else if (user?.id) {
        const adminResponse = await fetch('/api/admin/users', { credentials: 'include' });
        if (adminResponse.ok) {
          const users = await adminResponse.json();
          const currentUser = Array.isArray(users)
            ? users.find((listedUser) => String(listedUser.id) === String(user.id))
            : null;
          const fallbackClasses = Array.isArray(currentUser?.classes) ? currentUser.classes : [];
          enrolledData = fallbackClasses.map((classId) => ({
            course_id: String(classId),
            course_title: `Enrolled Course ${classId}`,
          }));
        }
      }

      const completionResponse = await fetch('/api/completion-requests/my', { credentials: 'include' });
      const completionRequests = completionResponse.ok ? await completionResponse.json() : [];

      const classLookup = new Map();
      const normalizeCourseId = (value) => {
        const normalized = String(value || '');
        if (!normalized) return '';
        const matched = classLookup.get(normalized);
        if (matched?.course_id) return String(matched.course_id);
        if (matched?.id !== null && typeof matched?.id !== 'undefined') return String(matched.id);
        return normalized;
      };

      if (Array.isArray(coursesData)) {
        coursesData.forEach((course) => {
          if (course?.course_id) {
            classLookup.set(String(course.course_id), course);
          }
          if (course?.id !== null && typeof course?.id !== 'undefined') {
            classLookup.set(String(course.id), course);
          }
        });
      }

      const normalizedEnrolledCourses = Array.isArray(enrolledData)
        ? enrolledData.map((course) => {
            const key = course?.course_id || course?.id;
            if (!key) return course;
            return classLookup.get(String(key)) || course;
          })
        : [];

      const approvedRequests = Array.isArray(completionRequests)
        ? completionRequests.filter((request) => request.status === 'approved')
        : [];

      const completedCourseIds = Array.from(
        new Set(
          approvedRequests
            .map((request) => normalizeCourseId(request?.course_id))
            .filter(Boolean)
        )
      );

      const completedCourses = completedCourseIds.map((courseId) => {
        const fromCatalog = classLookup.get(courseId);
        if (fromCatalog) return fromCatalog;

        const matchingRequest = approvedRequests.find(
          (request) => normalizeCourseId(request?.course_id) === courseId
        );

        return {
          course_id: courseId,
          course_title: matchingRequest?.course_title || `Completed Course ${courseId}`,
          course_description: 'Completed course',
          enrollment_count: 0,
        };
      });

      const completedCourseIdSet = new Set(completedCourseIds);
      const currentCoursesFiltered = normalizedEnrolledCourses.filter((course) => {
        const courseId = normalizeCourseId(course?.course_id || course?.id);
        return courseId && !completedCourseIdSet.has(courseId);
      });

      const totalCourses = Array.isArray(coursesData) ? coursesData.length : 0;
      const enrolledCourses = currentCoursesFiltered.length;
      const availableCourses = Math.max(totalCourses - enrolledCourses, 0);
      const completedCoursesCount = completedCourses.length;

      const nextCompletionStatusByCourse = {};
      if (Array.isArray(completionRequests)) {
        completionRequests.forEach((request) => {
          const courseId = normalizeCourseId(request?.course_id);
          if (courseId && !nextCompletionStatusByCourse[courseId]) {
            nextCompletionStatusByCourse[courseId] = request.status;
          }
        });
      }

      setCurrentCourses(currentCoursesFiltered.slice(0, 6));
      setCompletedCoursesList(completedCourses.slice(0, 6));
      setCompletionStatusByCourse(nextCompletionStatusByCourse);
      setStats({ totalCourses, enrolledCourses, availableCourses, completedCourses: completedCoursesCount });
      setDashboardError('');
      setLoadingCourses(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardError('Failed to load your courses. Please refresh.');
      setLoadingCourses(false);
    }
  };

  const getCourseId = (course) => {
    if (!course) return '';
    if (course.course_id) return String(course.course_id);
    if (course.id !== null && typeof course.id !== 'undefined') return String(course.id);
    return '';
  };

  const handleCompleteCourse = async (course) => {
    const courseId = getCourseId(course);
    if (!courseId) {
      setDashboardError('Unable to determine course id.');
      return;
    }

    const status = completionStatusByCourse[courseId];
    if (status === 'pending' || status === 'approved') {
      return;
    }

    try {
      setCompletionBusyCourseId(courseId);
      const response = await fetch(`/api/classes/${encodeURIComponent(courseId)}/completion-request`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 409) {
          setCompletionStatusByCourse((previous) => ({ ...previous, [courseId]: 'pending' }));
          setDashboardError('');
          return;
        }
        setDashboardError(data.message || data.error || 'Failed to submit completion request');
        return;
      }

      setCompletionStatusByCourse((previous) => ({ ...previous, [courseId]: 'pending' }));
      setDashboardError('');
    } catch (error) {
      console.error('Completion request error:', error);
      setDashboardError('Failed to submit completion request');
    } finally {
      setCompletionBusyCourseId('');
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

          {/* Current Courses Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Current Courses</h2>
              <Link 
                to="/courses"
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-2"
              >
                Manage Courses →
              </Link>
            </div>

            {loadingCourses ? (
              <p className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading courses...</p>
            ) : currentCourses.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentCourses.map(course => (
                  <div 
                    key={course.id || course.course_id}
                    className={`rounded-lg p-6 border transition duration-300 group ${darkMode ? 'bg-slate-900 border-slate-600 hover:border-emerald-600' : 'bg-slate-100 border-slate-300 hover:border-emerald-500'}`}
                  >
                    <h3 className={`text-xl font-bold mb-2 group-hover:text-emerald-400 transition ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {course.course_title || course.name}
                    </h3>
                    <p className={`mb-4 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {course.course_description}
                    </p>
                    <p className={`mb-4 text-sm font-semibold ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      {Number.isFinite(Number(course.enrollment_count)) ? Number(course.enrollment_count) : 0}/30 enrolled
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400 font-semibold">
                        {course.tuition_cost !== null && typeof course.tuition_cost !== 'undefined' ? `$${course.tuition_cost}` : 'N/A'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        completionStatusByCourse[getCourseId(course)] === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : completionStatusByCourse[getCourseId(course)] === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : darkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {completionStatusByCourse[getCourseId(course)] === 'approved'
                          ? 'Completed'
                          : completionStatusByCourse[getCourseId(course)] === 'pending'
                            ? 'Pending Approval'
                            : 'Enrolled'}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleCompleteCourse(course)}
                        disabled={completionBusyCourseId === getCourseId(course) || completionStatusByCourse[getCourseId(course)] === 'pending' || completionStatusByCourse[getCourseId(course)] === 'approved'}
                        className={`flex-1 text-white px-4 py-2 rounded-lg font-semibold transition duration-300 ${
                          completionStatusByCourse[getCourseId(course)] === 'approved'
                            ? 'bg-emerald-700'
                            : completionStatusByCourse[getCourseId(course)] === 'pending'
                              ? 'bg-amber-600'
                              : 'bg-emerald-600 hover:bg-emerald-400 cursor-pointer'
                        } ${(completionBusyCourseId === getCourseId(course) || completionStatusByCourse[getCourseId(course)] === 'pending' || completionStatusByCourse[getCourseId(course)] === 'approved') ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {completionBusyCourseId === getCourseId(course)
                          ? 'Submitting...'
                          : completionStatusByCourse[getCourseId(course)] === 'approved'
                            ? 'Completed'
                            : completionStatusByCourse[getCourseId(course)] === 'pending'
                              ? 'Pending Approval'
                              : 'Complete Course'}
                      </button>
                      <Link
                        to="/courses"
                        className={`px-4 py-2 rounded-lg font-semibold transition duration-300 ${darkMode ? 'bg-slate-800 text-gray-200 hover:bg-slate-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        Discover
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-100 border-slate-300'}`}>
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>You are not enrolled in any current courses.</p>
              </div>
            )}
          </div>

          {/* Completed Courses Section */}
          <div className="mb-8">
            <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Completed Courses</h2>
            {loadingCourses ? (
              <p className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading courses...</p>
            ) : completedCoursesList.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCoursesList.map((course) => (
                  <div
                    key={`completed-${course.id || course.course_id}`}
                    className={`rounded-lg p-6 border transition duration-300 ${darkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-100 border-slate-300'}`}
                  >
                    <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {course.course_title || course.name}
                    </h3>
                    <p className={`mb-4 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {course.course_description}
                    </p>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-100 border-slate-300'}`}>
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>You have no completed courses yet.</p>
              </div>
            )}

            {dashboardError && (
              <div className={`mt-4 border px-6 py-4 rounded-lg ${darkMode ? 'bg-red-900 border-red-600 text-red-200' : 'bg-red-100 border-red-400 text-red-800'}`}>
                {dashboardError}
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
