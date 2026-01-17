
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Compass, User, Sun, Moon, Bell, CheckCircle, AlertCircle } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    showToast("Signed out successfully", "info");
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Trails', path: '/dashboard' },
  ];

  return (
    <ToastContext.Provider value={{ showToast }}>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-scot-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {/* Toast Container */}
        <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
          {toasts.map(toast => (
            <div 
              key={toast.id} 
              className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-2xl shadow-2xl animate-in slide-in-from-right-10 duration-300 ${
                toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-500' :
                toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                'bg-scot-blue/10 border-scot-blue/30 text-scot-blue'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-bold tracking-tight">{toast.message}</span>
            </div>
          ))}
        </div>

        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-scot-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="bg-scot-blue p-1.5 rounded-lg shadow-lg shadow-scot-blue/20">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <span className="font-serif text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Scot<span className="text-scot-blue">Lens</span>
                </span>
              </div>

              <div className="hidden md:flex items-center space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-sm font-medium transition-colors hover:text-scot-blue ${
                      location.pathname === link.path ? 'text-scot-blue' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {user ? (
                  <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200 dark:border-white/10">
                    <Link to="/profile" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-scot-blue transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-scot-blue/10 flex items-center justify-center group-hover:bg-scot-blue transition-all">
                        <User className="w-4 h-4 text-scot-blue group-hover:text-white" />
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 px-3 py-1.5 rounded-full transition-colors border border-red-200 dark:border-red-900/50"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200 dark:border-white/10">
                     <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-scot-blue">Login</Link>
                    <Link to="/register" className="text-sm font-medium bg-scot-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all shadow-lg hover:-translate-y-0.5">Get Started</Link>
                  </div>
                )}
              </div>

              <div className="md:hidden flex items-center gap-4">
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300">
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 dark:text-slate-300 p-2">
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden bg-white dark:bg-scot-dark border-b border-slate-200 dark:border-white/10">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navLinks.map((link) => (
                  <Link key={link.name} to={link.path} onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 dark:text-slate-300">
                    {link.name}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-slate-600 dark:text-slate-300">My Profile</Link>
                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-red-500">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-slate-600 dark:text-slate-300">Login</Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-scot-blue font-bold">Register</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>

        <main className="flex-grow">{children}</main>

        <footer className="bg-slate-900 dark:bg-black py-16 border-t border-slate-800 dark:border-white/10 text-slate-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
              <div className="col-span-1 md:col-span-2 space-y-4">
                <span className="font-serif text-2xl font-bold text-white block">Scot<span className="text-scot-blue">Lens</span></span>
                <p className="text-slate-400 text-sm max-w-md mx-auto md:mx-0 leading-relaxed">Pioneering the future of heritage tourism through Augmented Reality.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-widest uppercase mb-6">Explore</h3>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-scot-gold transition-colors">Edinburgh Old Town</a></li>
                  <li><a href="#" className="hover:text-scot-gold transition-colors">Highlands & Islands</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-widest uppercase mb-6">Company</h3>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-scot-gold transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-scot-gold transition-colors">Support</a></li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ToastContext.Provider>
  );
};
