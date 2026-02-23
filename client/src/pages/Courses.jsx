import { useState, useEffect } from 'react';
import Header from '../../utilities/Header.jsx'
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import PopupComponent from '../components/PopUp.jsx';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function CoursesPage() {
    const MAX_ENROLLMENT = 30;
    const { darkMode } = useTheme();
    const { user } = useAuth();
    const [showPopup, setShowPopup] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courses, setCourses] = useState([]);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
    const [completedCourseIds, setCompletedCourseIds] = useState([]);
    const [enrollmentBusy, setEnrollmentBusy] = useState(false);
    const [completionBusy, setCompletionBusy] = useState(false);
    const [completionStatusByCourse, setCompletionStatusByCourse] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const getCourseId = (course) => {
        if (!course) return '';
        if (course.course_id) return String(course.course_id);
        if (course.id) return String(course.id);
        return '';
    };

    const normalizeCourseId = (value, catalog = courses) => {
        const normalized = String(value || '');
        if (!normalized) return '';

        const matchedCourse = Array.isArray(catalog)
            ? catalog.find((course) => String(course.course_id) === normalized || String(course.id) === normalized)
            : null;

        if (matchedCourse?.course_id) return String(matchedCourse.course_id);
        if (matchedCourse?.id) return String(matchedCourse.id);
        return normalized;
    };

    const getEnrollmentCount = (course) => {
        const count = Number(course?.enrollment_count);
        return Number.isFinite(count) ? count : 0;
    };

    const getDisplayedEnrollmentCount = (course) => {
        return getEnrollmentCount(course);
    };

    const getCourseStatus = (course) => {
        const courseId = normalizeCourseId(getCourseId(course));
        if (!courseId) return { label: 'Sign Up', tone: 'available' };

        const completionStatus = completionStatusByCourse[courseId];
        if (completedCourseIds.includes(courseId) || completionStatus === 'approved') {
            return { label: 'Completed', tone: 'completed' };
        }

        if (enrolledCourseIds.includes(courseId)) {
            return { label: 'Enrolled', tone: 'enrolled' };
        }

        return { label: 'Sign Up', tone: 'available' };
    };

    const updateEnrollmentCountForCourse = (courseId, nextCount) => {
        const normalizedCourseId = normalizeCourseId(courseId);
        const safeCount = Math.max(0, Number(nextCount) || 0);

        setCourses((previous) => previous.map((course) => {
            const currentCourseId = normalizeCourseId(getCourseId(course), previous);
            if (currentCourseId !== normalizedCourseId) return course;
            return { ...course, enrollment_count: safeCount };
        }));

        setSelectedCourse((previous) => {
            if (!previous) return previous;
            const currentCourseId = normalizeCourseId(getCourseId(previous));
            if (currentCourseId !== normalizedCourseId) return previous;
            return { ...previous, enrollment_count: safeCount };
        });
    };

    const fetchEnrolledClasses = async () => {
        try {
            const response = await fetch('/api/profile/classes', { credentials: 'include' });
            if (!response.ok) {
                if (user?.id) {
                    const adminResponse = await fetch('/api/admin/users', { credentials: 'include' });
                    if (adminResponse.ok) {
                        const users = await adminResponse.json();
                        const currentUser = Array.isArray(users)
                            ? users.find((adminUser) => String(adminUser.id) === String(user.id))
                            : null;
                        const classes = Array.isArray(currentUser?.classes) ? currentUser.classes : [];
                        setEnrolledCourseIds(classes.map((classId) => normalizeCourseId(classId)).filter(Boolean));
                    }
                }
                return;
            }
            const data = await response.json();
            setEnrolledCourseIds(data.map((course) => normalizeCourseId(getCourseId(course))).filter(Boolean));
        } catch (fetchError) {
            console.error('Error fetching enrolled classes:', fetchError);
        }
    };

    const fetchCourses = async (query = '') => {
        setLoading(true);
        setError(null);
        
        try {
            if (query) {
                const searchResponse = await fetch(`/api/search-classes?query=${encodeURIComponent(query)}`, {
                    credentials: 'include'
                });

                if (!searchResponse.ok) {
                    if (searchResponse.status === 401) {
                        throw new Error('Please log in to view courses');
                    }
                    const errorData = await searchResponse.json().catch(() => ({}));
                    throw new Error(errorData.message || errorData.error || `Failed to fetch courses (${searchResponse.status})`);
                }

                const searchData = await searchResponse.json();
                setCourses(searchData);
                return;
            }

            const classEndpoints = ['/api/classes', '/api/class2'];
            let lastStatus = null;

            for (const endpoint of classEndpoints) {
                const response = await fetch(endpoint, { credentials: 'include' });

                if (response.ok) {
                    const data = await response.json();
                    setCourses(data);
                    return;
                }

                if (response.status === 401) {
                    throw new Error('Please log in to view courses');
                }

                lastStatus = response.status;
            }

            throw new Error(`Failed to fetch courses (${lastStatus || 'unknown error'})`);
        } catch (err) {
            console.error('Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompletionRequests = async () => {
        try {
            const response = await fetch('/api/completion-requests/my', { credentials: 'include' });
            if (!response.ok) {
                if (user?.id) {
                    const adminResponse = await fetch('/api/admin/completion-requests', { credentials: 'include' });
                    if (adminResponse.ok) {
                        const allRequests = await adminResponse.json();
                        const userRequests = Array.isArray(allRequests)
                            ? allRequests.filter((request) => String(request.user_id) === String(user.id))
                            : [];

                        const nextStatusByCourse = {};
                        userRequests.forEach((request) => {
                            const courseId = request?.course_id ? normalizeCourseId(request.course_id) : '';
                            if (courseId && !nextStatusByCourse[courseId]) {
                                nextStatusByCourse[courseId] = request.status;
                            }
                        });
                        setCompletionStatusByCourse(nextStatusByCourse);
                    }
                }
                return;
            }

            const data = await response.json();
            const nextStatusByCourse = {};

            if (Array.isArray(data)) {
                data.forEach((request) => {
                    const courseId = request?.course_id ? normalizeCourseId(request.course_id) : '';
                    if (!courseId) return;
                    if (!nextStatusByCourse[courseId]) {
                        nextStatusByCourse[courseId] = request.status;
                    }
                });
            }

            setCompletionStatusByCourse(nextStatusByCourse);
        } catch (requestError) {
            console.error('Error fetching completion requests:', requestError);
        }
    };

    const fetchCompletedClasses = async () => {
        try {
            const response = await fetch('/api/profile/completed-classes', { credentials: 'include' });
            if (!response.ok) {
                setCompletedCourseIds([]);
                return;
            }

            const data = await response.json();
            const ids = Array.isArray(data)
                ? data.map((course) => normalizeCourseId(getCourseId(course))).filter(Boolean)
                : [];

            setCompletedCourseIds(ids);
        } catch (fetchError) {
            console.error('Error fetching completed classes:', fetchError);
            setCompletedCourseIds([]);
        }
    };

    useEffect(() => {
        fetchCourses();
        fetchEnrolledClasses();
        fetchCompletedClasses();
        fetchCompletionRequests();
    }, [user?.id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCourses(searchTerm);
        }, 500); 

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const openPopup = (course) => {
        setSelectedCourse(course);
        setShowPopup(true);
    };
    
    const closePopup = () => {
        setShowPopup(false);
        setSelectedCourse(null);
    };

    const handleEnrollmentToggle = async () => {
        if (!selectedCourse) return;

        const courseId = normalizeCourseId(getCourseId(selectedCourse));
        if (!courseId) {
            setError('Unable to determine class id.');
            return;
        }

        const isEnrolled = enrolledCourseIds.includes(courseId);

        try {
            setEnrollmentBusy(true);
            const response = await fetch(`/api/classes/${encodeURIComponent(courseId)}/enrollment`, {
                method: isEnrolled ? 'DELETE' : 'POST',
                credentials: 'include'
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                if (response.status === 401) {
                    setError('Please log in to manage enrollment');
                    return;
                }

                if (response.status === 409) {
                    const nextCount = Number(data.enrollment_count);
                    if (Number.isFinite(nextCount)) {
                        updateEnrollmentCountForCourse(courseId, nextCount);
                    }
                    setError(data.message || 'Class is full (30 max)');
                    return;
                }

                if (response.status === 404 && user?.id) {
                    const usersResponse = await fetch('/api/admin/users', { credentials: 'include' });
                    if (!usersResponse.ok) {
                        setError('Failed to update enrollment');
                        return;
                    }

                    const users = await usersResponse.json();
                    const currentUser = Array.isArray(users)
                        ? users.find((adminUser) => String(adminUser.id) === String(user.id))
                        : null;

                    if (!currentUser) {
                        setError('Failed to update enrollment');
                        return;
                    }

                    const currentClasses = Array.isArray(currentUser.classes)
                        ? currentUser.classes.map((classId) => normalizeCourseId(classId))
                        : [];

                    const nextClasses = isEnrolled
                        ? currentClasses.filter((classId) => classId !== courseId)
                        : (currentClasses.includes(courseId) ? currentClasses : [...currentClasses, courseId]);

                    const updateResponse = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            name: currentUser.name,
                            email: currentUser.email,
                            is_admin: currentUser.is_admin,
                            classes: nextClasses,
                        }),
                    });

                    if (!updateResponse.ok) {
                        setError('Failed to update enrollment');
                        return;
                    }

                    setError(null);
                    setEnrolledCourseIds(nextClasses);
                    return;
                }

                setError(data.message || data.error || 'Failed to update enrollment');
                return;
            }

            setError(null);
            setEnrolledCourseIds((previous) => {
                if (isEnrolled) {
                    return previous.filter((id) => id !== courseId);
                }
                if (previous.includes(courseId)) {
                    return previous;
                }
                return [...previous, courseId];
            });

            const nextCountFromServer = Number(data.enrollment_count);
            if (Number.isFinite(nextCountFromServer)) {
                updateEnrollmentCountForCourse(courseId, nextCountFromServer);
            }
        } catch (toggleError) {
            console.error('Enrollment toggle error:', toggleError);
            setError('Failed to update enrollment');
        } finally {
            setEnrollmentBusy(false);
        }
    };

    const handleCompletionRequest = async () => {
        if (!selectedCourse) return;

        const courseId = normalizeCourseId(getCourseId(selectedCourse));
        if (!courseId) {
            setError('Unable to determine class id.');
            return;
        }

        if (!enrolledCourseIds.includes(courseId)) {
            setError('You must enroll before requesting completion.');
            return;
        }

        const currentStatus = completionStatusByCourse[courseId];
        if (currentStatus === 'pending' || currentStatus === 'approved') {
            return;
        }

        try {
            setCompletionBusy(true);
            const response = await fetch(`/api/classes/${encodeURIComponent(courseId)}/completion-request`, {
                method: 'POST',
                credentials: 'include',
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                if (response.status === 409) {
                    setCompletionStatusByCourse((previous) => ({ ...previous, [courseId]: 'pending' }));
                    setError(null);
                    return;
                }
                setError(data.message || data.error || 'Failed to submit completion request');
                return;
            }

            setCompletionStatusByCourse((previous) => ({ ...previous, [courseId]: 'pending' }));
            setError(null);
        } catch (requestError) {
            console.error('Completion request error:', requestError);
            setError('Failed to submit completion request');
        } finally {
            setCompletionBusy(false);
        }
    };

    const selectedCourseId = selectedCourse ? normalizeCourseId(getCourseId(selectedCourse)) : '';
    const selectedCompletionStatus = selectedCourseId ? completionStatusByCourse[selectedCourseId] : null;
    const isSelectedCompleted = selectedCourseId
        ? (completedCourseIds.includes(selectedCourseId) || selectedCompletionStatus === 'approved')
        : false;
    const isSelectedEnrolled = selectedCourseId ? enrolledCourseIds.includes(selectedCourseId) : false;
    const selectedEnrollmentCount = selectedCourse ? getDisplayedEnrollmentCount(selectedCourse) : 0;
    const isSelectedCourseFull = selectedEnrollmentCount >= MAX_ENROLLMENT;


    return (
        <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-white'}`}>
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className={`text-4xl font-bold mb-8 ${darkMode ? 'text-gray-50' : 'text-gray-800'}`}>Courses</h1>
                
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                
                {loading && (
                    <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading courses...</p>
                )}
                
                {error && (
                    <div className={`border px-6 py-4 rounded-lg ${darkMode ? 'bg-red-900 border-red-600 text-red-200' : 'bg-red-100 border-red-400 text-red-800'}`}>
                        <p className="font-semibold">Error loading courses:</p>
                        <p>{error}</p>
                    </div>
                )}
                
                {!loading && !error && courses.length === 0 && (
                    <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No courses available yet.</p>
                )}
                
                {!loading && !error && courses.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((class2) => {
                            const courseStatus = getCourseStatus(class2);
                            const courseStatusClass = courseStatus.tone === 'completed'
                                ? (darkMode ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700' : 'bg-emerald-100 text-emerald-800 border-emerald-300')
                                : courseStatus.tone === 'enrolled'
                                    ? (darkMode ? 'bg-blue-900/60 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-300')
                                    : (darkMode ? 'bg-amber-900/60 text-amber-300 border-amber-700' : 'bg-amber-100 text-amber-800 border-amber-300');

                            return (
                                <div
                                    key={getCourseId(class2) || class2.id}
                                    onClick={() => openPopup(class2)}
                                    className={`border rounded-lg p-6 transition duration-300 cursor-pointer ${darkMode ? 'bg-slate-900 border-slate-600 hover:border-emerald-600' : 'bg-slate-100 border-slate-300 hover:border-emerald-500'}`}
                                >
                                    <div className="mb-4 flex justify-between items-start gap-3">
                                        <h3 className={`text-2xl font-bold ${darkMode ? 'text-gray-50' : 'text-gray-800'}`}>{class2.name || class2.course_title}</h3>
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border whitespace-nowrap ${courseStatusClass}`}>
                                            {courseStatus.label}
                                        </span>
                                    </div>
                                    <p className={`mb-4 line-clamp-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{class2.course_description}</p>
                                    <p className={`text-sm font-semibold ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                                        {getDisplayedEnrollmentCount(class2)}/{MAX_ENROLLMENT} enrolled
                                    </p>
                                    <div className="flex justify-between items-center">
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                
                <PopupComponent show={showPopup} onClose={closePopup}>
                    {selectedCourse && (
                        <div className={darkMode ? 'text-white' : 'text-black'}>
                            <h2 className="text-4xl font-bold text-emerald-400 mb-4">
                                {selectedCourse.name || selectedCourse.course_title}
                            </h2>
                            
                            <div className="space-y-4">
                                {selectedCourse.course_id && (
                                    <div>
                                        <h3 className={`text-sm uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Course ID</h3>
                                        <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedCourse.course_id}</p>
                                    </div>
                                )}
                                
                                <div>
                                    <h3 className={`text-sm uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Description</h3>
                                    <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedCourse.course_description}</p>
                                </div>

                                <div>
                                    <h3 className={`text-sm uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Enrollment</h3>
                                    <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                        {selectedEnrollmentCount}/{MAX_ENROLLMENT} enrolled
                                    </p>
                                </div>
                                
                                {selectedCourse.tuition_cost && (
                                    <div>
                                        <h3 className={`text-sm uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tuition Cost</h3>
                                        <p className="text-2xl text-emerald-400 font-bold">${selectedCourse.tuition_cost}</p>
                                    </div>
                                )}
                                
                                {selectedCourse.course_length && (
                                    <div>
                                        <h3 className={`text-sm uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Course Length</h3>
                                        <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedCourse.course_length}</p>
                                    </div>
                                )}
                                
                                {selectedCourse.instructor && (
                                    <div>
                                        <h3 className={`text-sm uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Instructor</h3>
                                        <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedCourse.instructor}</p>
                                    </div>
                                )}
                                
                                <div className="pt-6 flex gap-4">
                                    {!isSelectedCompleted && (
                                        <button
                                            onClick={handleEnrollmentToggle}
                                            disabled={enrollmentBusy || (!isSelectedEnrolled && isSelectedCourseFull)}
                                            className={`flex-1 text-white px-6 py-3 rounded-lg font-semibold transition duration-300 ${
                                                !isSelectedEnrolled && isSelectedCourseFull
                                                    ? 'bg-gray-600'
                                                    : isSelectedEnrolled
                                                    ? 'bg-red-600 hover:bg-red-500'
                                                    : 'bg-emerald-600 hover:bg-emerald-500'
                                            } ${(enrollmentBusy || (!isSelectedEnrolled && isSelectedCourseFull)) ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {enrollmentBusy
                                                ? 'Saving...'
                                                : !isSelectedEnrolled && isSelectedCourseFull
                                                    ? 'Course Full'
                                                : isSelectedEnrolled
                                                    ? 'Unenroll'
                                                    : 'Enroll Now'}
                                        </button>
                                    )}
                                    <button
                                        onClick={handleCompletionRequest}
                                        disabled={completionBusy || !isSelectedEnrolled || selectedCompletionStatus === 'pending' || selectedCompletionStatus === 'approved'}
                                        className={`flex-1 text-white px-6 py-3 rounded-lg font-semibold transition duration-300 ${
                                            selectedCompletionStatus === 'approved'
                                                ? 'bg-emerald-700'
                                                : selectedCompletionStatus === 'pending'
                                                    ? 'bg-amber-600'
                                                    : 'bg-emerald-600 hover:bg-emerald-500'
                                        } ${(completionBusy || !isSelectedEnrolled || selectedCompletionStatus === 'pending' || selectedCompletionStatus === 'approved') ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {completionBusy
                                            ? 'Submitting...'
                                            : !isSelectedEnrolled
                                                ? 'Enroll to Complete'
                                                : selectedCompletionStatus === 'approved'
                                                    ? 'Completed (Approved)'
                                                    : selectedCompletionStatus === 'pending'
                                                        ? 'Pending Admin Approval'
                                                        : 'Complete Course'}
                                    </button>
                                    <button 
                                        onClick={closePopup}
                                        className={`px-6 py-3 border rounded-lg font-semibold transition duration-300 ${darkMode ? 'border-gray-500 text-gray-300 hover:bg-gray-800' : 'border-gray-400 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </PopupComponent>
            </div>
        </div>
    );
}