function Footer() {
    return (
        <footer className="text-white py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <h3 className="text-2xl font-bold">Kormac</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                lit
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-gray-400 hover:text-white transition duration-300">About Us</a></li>
                <li><a href="#courses" className="text-gray-400 hover:text-white transition duration-300">Courses</a></li>
              </ul>
            </div>

          <div className="pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              &copy; 2026 Kormac. All rights reserved.
            </p>
          </div>
        </div>
        </div>
      </footer>
    )
}

export default Footer
