import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../utilities/Header.jsx';
import Footer from '../../utilities/Footer.jsx';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
    const { user, isAdmin, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [enrolledClasses, setEnrolledClasses] = useState([]);
    const [classesLoading, setClassesLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
    });

    const fetchEnrolledClasses = async () => {
        try {
            setClassesLoading(true);
            const response = await fetch('/api/profile/classes', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setEnrolledClasses(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching enrolled classes:', error);
        } finally {
            setClassesLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }

        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
            });
            fetchEnrolledClasses();
        }
    }, [user, isAuthenticated, loading, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            const response = await fetch('/api/profile/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                setIsEditing(false);
                // You could show a success message here
                alert('Profile updated successfully!');
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        }
    };

    const handleCancel = () => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
            });
        }
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-gray-400 text-xl">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <Header />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-t-2xl p-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold text-white border-4 border-white/30">
                            {profileData.name ? profileData.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                {profileData.name || 'Your Profile'}
                            </h1>
                            <p className="text-emerald-100">
                                {profileData.email}
                            </p>
                            {isAdmin && (
                                <p className="mt-2 inline-block bg-white/20 text-white text-sm px-3 py-1 rounded-full font-semibold">
                                    Admin Account
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="bg-slate-900 border border-slate-600 rounded-b-2xl p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-500 transition duration-300"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-500 transition duration-300"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition duration-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">
                                Full Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={profileData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-800 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-emerald-500 transition"
                                    placeholder="Enter your name"
                                />
                            ) : (
                                <p className="text-white text-lg">
                                    {profileData.name || 'Not provided'}
                                </p>
                            )}
                        </div>

                        {/* Email Field (Read-only) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">
                                Email Address
                            </label>
                            <p className="text-white text-lg">
                                {profileData.email}
                            </p>
                            <p className="text-gray-500 text-sm mt-1">
                                Email cannot be changed
                            </p>
                        </div>
                    </div>

                    {/* Account Info */}
                    <div className="mt-8 pt-8 border-t border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-4">Account Information</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-400">Account ID</p>
                                <p className="text-white font-mono">{user?.id || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Member Since</p>
                                <p className="text-white">
                                    {user?.created_at 
                                        ? new Date(user.created_at).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })
                                        : 'N/A'
                                    }
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Role</p>
                                <p className="text-white">{isAdmin ? 'Admin' : 'User'}</p>
                            </div>
                        </div>
                        {isAdmin && (
                            <div className="mt-6">
                                <Link
                                    to="/admin"
                                    className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-500 transition duration-300"
                                >
                                    Go to Admin Dashboard
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Enrolled Courses Section */}
                <div className="mt-8 bg-slate-900 border border-slate-600 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">My Enrolled Courses</h2>
                    {classesLoading ? (
                        <p className="text-gray-400">Loading enrolled courses...</p>
                    ) : enrolledClasses.length === 0 ? (
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                            <p className="text-gray-400 text-center py-8">No courses enrolled yet.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {enrolledClasses.map((enrolledClass) => (
                                <div key={enrolledClass.id || enrolledClass.course_id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-emerald-600 transition">
                                    <h3 className="text-lg font-semibold text-white mb-1">
                                        {enrolledClass.course_title || enrolledClass.name || 'Untitled Course'}
                                    </h3>
                                    <p className="text-sm text-emerald-300 mb-2">{enrolledClass.course_id || enrolledClass.id}</p>
                                    {enrolledClass.course_description && (
                                        <p className="text-gray-400 text-sm line-clamp-3">{enrolledClass.course_description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProfilePage;
