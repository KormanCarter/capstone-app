import Header from '../../utilities/Header'
import Footer from '../../utilities/Footer'
import { useTheme } from '../contexts/ThemeContext'

export default function AboutPage() {
    const { darkMode } = useTheme()
    
    return (
        <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
            <Header />
            
            {/* Hero Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl font-bold mb-4">About Kormaia</h1>
                </div>

            {/* Team Section */}
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className={`text-4xl font-bold text-center mb-4 ${darkMode ? 'text-gray-50' : 'text-gray-800'}`}>Meet Our Team</h2>
                        <div className="flex justify-center">
                            <div className="text-center">
                                <div className="bg-emerald-100 w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl">
                            
                                </div>
                                <h3 className={`text-xl font-bold mb-1 ${darkMode ? 'text-gray-50' : 'text-gray-800'}`}>Kormacatron Carter</h3>
                                <p className="text-emerald-600 font-semibold mb-2">CEO & Founder</p>
                                <p className={`text-sm ${darkMode ? 'text-gray-50' : 'text-gray-700'}`}>Being so cool</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-emerald-100 w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl">
                                
                                </div>
                                <h3 className={`text-xl font-bold mb-1 ${darkMode ? 'text-gray-50' : 'text-gray-800'}`}>Kaia Frazier</h3>
                                <p className="text-emerald-600 font-semibold mb-2">second bossman to kormac</p>
                                <p className={`text-sm ${darkMode ? 'text-gray-50' : 'text-gray-700'}`}>being less cool than korman</p>
                            </div>                        
                            
                        </div>
                    </div>
                </section>
                <Footer />
            </section>
        </div>
    )
}