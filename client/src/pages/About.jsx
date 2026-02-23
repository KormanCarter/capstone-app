import Header from '../../utilities/Header'
import { useTheme } from '../contexts/ThemeContext'

export default function AboutPage() {
    const { darkMode } = useTheme()
    
    return (
        <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
            <Header />

            <section className="py-16 md:py-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`rounded-2xl border p-8 md:p-12 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                        <p className="text-emerald-500 font-semibold mb-3">About This Project</p>
                        <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${darkMode ? 'text-gray-50' : 'text-gray-800'}`}>
                            Learn skills. Build confidence. Reach your goals.
                        </h1>
                        <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Coda is a learning platform built to help students find useful courses,
                            track progress, and stay focused on real goals. We wanted to make a space
                            that feels simple, clear, and easy to use.
                        </p>
                    </div>
                </div>
            </section>

            <section className="pb-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-6">
                    <div className={`rounded-xl border p-6 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                        <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-gray-50' : 'text-gray-800'}`}>What we do</h2>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            We offer course browsing, enrollment, and progress tracking in one place.
                            Students can manage classes without confusion.
                        </p>
                    </div>

                    <div className={`rounded-xl border p-6 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                        <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-gray-50' : 'text-gray-800'}`}>Why it matters</h2>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Many students quit learning platforms because they feel hard to use.
                            We built Coda to make learning feel clear, fast, and motivating.
                        </p>
                    </div>

                    <div className={`rounded-xl border p-6 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                        <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-gray-50' : 'text-gray-800'}`}>What is next</h2>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            We plan to keep improving course quality, student support, and progress tools
                            so learners can stay on track and finish strong.
                        </p>
                    </div>
                </div>
            </section>

            <section className="pb-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`rounded-2xl border p-8 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-gray-50' : 'text-gray-800'}`}>Team</h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="text-center">
                                <div className={`w-44 h-44 mx-auto rounded-full border-2 overflow-hidden ${darkMode ? 'border-slate-600 bg-slate-800' : 'border-slate-400 bg-white'}`}>
                                    <img
                                        src="/img/profPicKC.png"
                                        alt="Korman Carter"
                                        className="w-full h-full object-cover object-center scale-110 translate-x-2"
                                    />
                                </div>
                                <h3 className={`mt-4 text-xl font-bold ${darkMode ? 'text-gray-50' : 'text-gray-800'}`}>Korman Carter</h3>
                                <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    I am a student at MTECH and co-founder of Coda. I plan to pursue a
                                    bachelor&apos;s degree in mathematics and computer science. I am focused on
                                    building strong technical skills and creating projects that solve real problems.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className={`w-44 h-44 mx-auto rounded-full border-2 overflow-hidden ${darkMode ? 'border-slate-600 bg-slate-800' : 'border-slate-400 bg-white'}`}>
                                    <img
                                        src="/img/sicko1.jpg"
                                        alt="Kaia Frazier"
                                        className="w-full h-full object-cover object-center scale-110 translate-x-2"
                                    />
                                </div>
                                <h3 className={`mt-4 text-xl font-bold ${darkMode ? 'text-gray-50' : 'text-gray-800'}`}>Kaia Frazier</h3>
                                <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    MTECH student and co-founder of Coda. Focused on app structure, features,
                                    and helping the platform support student success.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}