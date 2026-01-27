import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';
import { 
  Menu, 
  X, 
  User, 
  LogOut,
  Phone,
  Mail,
  HeadphonesIcon
} from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'MECHANIC':
        return '/mechanic';
      case 'PARTS_PROVIDER':
        return '/parts-provider';
      case 'ADMIN':
        return '/admin';
      default:
        return '/dashboard';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 "> 
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              onClick={closeMobileMenu}
            >
              {/* CUSTOM LOGO - Replace /logo.png with your logo path */}
              <img 
                src="/logo.png" 
                alt="RoadTech Logo" 
                className="h-10 w-auto"
                onError={(e) => {
                  // Fallback: hide image and show text if logo fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-xl font-bold text-gray-900">RoadTech</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Contact Us Dropdown */}
            <div className="relative">
              <button
                onClick={() => setContactOpen(!contactOpen)}
                onBlur={() => setTimeout(() => setContactOpen(false), 200)}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none px-3 py-2"
              >
                <HeadphonesIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Contact Us</span>
              </button>

              {contactOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-3 px-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Get in Touch</h3>
                  
                  <div className="space-y-3">
                    <a
                      href="tel:+91 9369234766"
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">24/7 Hotline</p>
                        <p className="font-semibold">+91 9369234766</p>
                      </div>
                    </a>

                    <a
                      href="mailto:roadtech2026@gmail.com"
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email Support</p>
                        <p className="font-semibold text-sm">roadtech2026@gmail.com</p>
                      </div>
                    </a>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      Available 24/7 for emergencies
                    </p>
                  </div>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">{user?.fullName}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {user?.role}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 space-y-2">
            {/* Contact Info - Always visible in mobile */}
            <div className="mb-4 px-4 py-3 bg-blue-50 rounded-lg mx-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Contact Us</h3>
              <div className="space-y-2">
                <a
                  href="tel:+91 9369234766"
                  className="flex items-center space-x-2 text-blue-600"
                >
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-medium">+91 9369234766</span>
                </a>
                <a
                  href="mailto:roadtech2026@gmail.com"
                  className="flex items-center space-x-2 text-blue-600"
                >
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-medium">roadtech2026@gmail.com</span>
                </a>
              </div>
            </div>

            {isAuthenticated ? (
              <>
                <div className="px-4 py-3 bg-gray-50 rounded-md mx-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user?.fullName}</p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                      <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  to={getDashboardLink()}
                  className="block px-4 py-2 mx-4 text-gray-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 mx-4 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <LogOut className="h-5 w-5 inline mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2 px-4">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-center text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-center text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}