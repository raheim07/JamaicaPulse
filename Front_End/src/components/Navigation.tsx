import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Activity, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import LoginModal from './admin/LoginModal';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const adminStatus = await authService.isAdmin();
        setIsAdmin(adminStatus);
      } catch (error) {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  const links = [
    { path: '/', label: 'Home' },
    { path: '/topics', label: 'Topics' },
    { path: '/trends', label: 'Trends' },
    { path: '/about', label: 'About' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-emerald-400" />
            <span className="ml-2 text-xl font-bold">Jamaica Pulse</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {links.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {isAdmin ? (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                  isActive('/admin')
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Lock className="w-4 h-4 mr-2" />
                Admin
              </Link>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center"
              >
                <Lock className="w-4 h-4 mr-2" />
                Admin Login
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-4">
            {isAdmin ? (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin')
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-800">
            {links.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setIsAdmin(true);
          navigate('/admin');
        }}
      />
    </nav>
  );
}
