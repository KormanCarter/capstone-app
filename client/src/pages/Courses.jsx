import { useState, useEffect } from 'react';
import Header from '../../utilities/Header.jsx'
import Footer from '../../utilities/Footer.jsx'
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import PopupComponent from '../components/PopUp.jsx';  

export default function CoursesPage() {
    const [showPopup, setShowPopup] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courses, setCourses] = useState([]);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
    const [enrollmentBusy, setEnrollmentBusy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const getCourseId = (course) => {
        if (!course) return '';
        if (course.course_id) return String(course.course_id);
        if (course.id) return String(course.id);
        return '';
    };

    const fetchEnrolledClasses = async () => {
        try {
            const response = await fetch('/api/profile/classes', { credentials: 'include' });
            if (!response.ok) {
                return;
            }
            const data = await response.json();
            setEnrolledCourseIds(data.map((course) => getCourseId(course)).filter(Boolean));
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

    useEffect(() => {
        fetchCourses();
        fetchEnrolledClasses();
    }, []);

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

        const courseId = getCourseId(selectedCourse);
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
        } catch (toggleError) {
            console.error('Enrollment toggle error:', toggleError);
            setError('Failed to update enrollment');
        } finally {
            setEnrollmentBusy(false);
        }
    };


    return (
        <div className="min-h-screen bg-black">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-gray-50 mb-8">Available Courses</h1>
                
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                
                {loading && (
                    <p className="text-gray-400 text-xl">Loading courses...</p>
                )}
                
                {error && (
                    <div className="bg-red-900 border border-red-600 text-red-200 px-6 py-4 rounded-lg">
                        <p className="font-semibold">Error loading courses:</p>
                        <p>{error}</p>
                    </div>
                )}
                
                {!loading && !error && courses.length === 0 && (
                    <p className="text-gray-400 text-xl">No courses available yet.</p>
                )}
                
                {!loading && !error && courses.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(class2 => (
                            <div 
                                key={class2.id} 
                                onClick={() => openPopup(class2)}
                                className="bg-slate-900 border border-slate-600 rounded-lg p-6 hover:border-emerald-600 transition duration-300 cursor-pointer"
                            >
                                <h3 className="text-2xl font-bold text-gray-50 mb-3">{class2.name || class2.course_title}</h3>
                                <p className="text-gray-400 mb-4 line-clamp-3">{class2.course_description}</p>
                                <div className="flex justify-between items-center">
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <PopupComponent show={showPopup} onClose={closePopup}>
                    {selectedCourse && (
                        <div className="text-white">
                            <h2 className="text-4xl font-bold text-emerald-400 mb-4">
                                {selectedCourse.name || selectedCourse.course_title}
                            </h2>
                            
                            <div className="space-y-4">
                                {selectedCourse.course_id && (
                                    <div>
                                        <h3 className="text-sm text-gray-400 uppercase tracking-wide">Course ID</h3>
                                        <p className="text-lg text-gray-200">{selectedCourse.course_id}</p>
                                    </div>
                                )}
                                
                                <div>
                                    <h3 className="text-sm text-gray-400 uppercase tracking-wide">Description</h3>
                                    <p className="text-lg text-gray-200 leading-relaxed">{selectedCourse.course_description}</p>
                                </div>
                                
                                {selectedCourse.tuition_cost && (
                                    <div>
                                        <h3 className="text-sm text-gray-400 uppercase tracking-wide">Tuition Cost</h3>
                                        <p className="text-2xl text-emerald-400 font-bold">${selectedCourse.tuition_cost}</p>
                                    </div>
                                )}
                                
                                {selectedCourse.course_length && (
                                    <div>
                                        <h3 className="text-sm text-gray-400 uppercase tracking-wide">Course Length</h3>
                                        <p className="text-lg text-gray-200">{selectedCourse.course_length}</p>
                                    </div>
                                )}
                                
                                {selectedCourse.instructor && (
                                    <div>
                                        <h3 className="text-sm text-gray-400 uppercase tracking-wide">Instructor</h3>
                                        <p className="text-lg text-gray-200">{selectedCourse.instructor}</p>
                                    </div>
                                )}
                                
                                <div className="pt-6 flex gap-4">
                                    <button
                                        onClick={handleEnrollmentToggle}
                                        disabled={enrollmentBusy}
                                        className={`flex-1 text-white px-6 py-3 rounded-lg font-semibold transition duration-300 ${
                                            enrolledCourseIds.includes(getCourseId(selectedCourse))
                                                ? 'bg-red-600 hover:bg-red-500'
                                                : 'bg-emerald-600 hover:bg-emerald-500'
                                        } ${enrollmentBusy ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {enrollmentBusy
                                            ? 'Saving...'
                                            : enrolledCourseIds.includes(getCourseId(selectedCourse))
                                                ? 'Unenroll'
                                                : 'Enroll Now'}
                                    </button>
                                    <button 
                                        onClick={closePopup}
                                        className="px-6 py-3 border border-gray-500 text-gray-300 rounded-lg font-semibold hover:bg-gray-800 transition duration-300"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </PopupComponent>
            </div>
            <Footer />
        </div>
    );
}