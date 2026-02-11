import { useState, useEffect } from 'react';
import Header from '../../utilities/Header.jsx'
import Footer from '../../utilities/Footer.jsx'
import Navbar from '../components/Navbar';

export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch courses from the backend
        fetch('/api/class2')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch courses');
                }
                return response.json();
            })
            .then(data => {
                setCourses(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error:', err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-black">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-gray-50 mb-8">Available Courses</h1>
                
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
                            <div key={class2.id} className="bg-slate-900 border border-slate-600 rounded-lg p-6 hover:border-emerald-600 transition duration-300">
                                <h3 className="text-2xl font-bold text-gray-50 mb-3">{class2.name || class2.course_title}</h3>
                                <p className="text-gray-400 mb-4">{class2.course_description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-emerald-400 font-semibold">
                                        {class2.tuition_cost ? `$${class2.tuition_cost}` : 'Free'}
                                    </span>
                                    <button className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-500">
                                        Enroll Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}