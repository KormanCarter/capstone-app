import { useState, useEffect } from 'react';
import Header from '../../utilities/Header.jsx'
import Footer from '../../utilities/Footer.jsx'
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import PopupComponent from '../components/PopUp.jsx';
import { useTheme } from '../contexts/ThemeContext';

export default function CoursesPage() {
    const { darkMode } = useTheme();
    const [showPopup, setShowPopup] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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


    return (
        <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-white'}`}>
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className={`text-4xl font-bold mb-8 ${darkMode ? 'text-gray-50' : 'text-gray-800'}`}>Available Courses</h1>
                
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
                        {courses.map(class2 => (
                            <div 
                                key={class2.id} 
                                onClick={() => openPopup(class2)}
                                className={`border rounded-lg p-6 transition duration-300 cursor-pointer ${darkMode ? 'bg-slate-900 border-slate-600 hover:border-emerald-600' : 'bg-slate-100 border-slate-300 hover:border-emerald-500'}`}
                            >
                                <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-gray-50' : 'text-gray-800'}`}>{class2.name || class2.course_title}</h3>
                                <p className={`mb-4 line-clamp-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{class2.course_description}</p>
                                <div className="flex justify-between items-center">
                                </div>
                            </div>
                        ))}
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
                                    <button className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-500 transition duration-300">
                                        Enroll Now
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
            <Footer />
        </div>
    );
}