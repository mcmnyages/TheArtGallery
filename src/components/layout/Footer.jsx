import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { isDarkMode } = useTheme();

  return (
    <footer className={`${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'} transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Kabbala Arts</h3>
            <p className="text-sm leading-relaxed">
              Discover and collect unique artworks from talented artists around the world.
              Join our community of art enthusiasts and creators.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-blue-500 transition-colors duration-200">Home</Link></li>
              <li><Link to="/galleries" className="hover:text-blue-500 transition-colors duration-200">Galleries</Link></li>
              <li><Link to="/subscriptions" className="hover:text-blue-500 transition-colors duration-200">Subscriptions</Link></li>
              <li><Link to="/login" className="hover:text-blue-500 transition-colors duration-200">Login</Link></li>
            </ul>
          </div>

          {/* Artists Section */}
          <div>
            <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>For Artists</h4>
            <ul className="space-y-2">
              <li><Link to="/artist/dashboard" className="hover:text-blue-500 transition-colors duration-200">Artist Dashboard</Link></li>
              <li><Link to="/artist/upload-artwork" className="hover:text-blue-500 transition-colors duration-200">Upload Artwork</Link></li>
              <li><Link to="/artist/manage-gallery" className="hover:text-blue-500 transition-colors duration-200">Manage Gallery</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Connect With Us</h4>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-blue-500 transition-colors duration-200 text-2xl" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200 text-2xl" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200 text-2xl" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200 text-2xl" aria-label="Pinterest">
                <FaPinterest />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} mt-8 pt-8 text-sm text-center`}>
          <p>© {currentYear} Kabbala Arts. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;