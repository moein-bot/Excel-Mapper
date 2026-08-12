import { motion } from 'framer-motion';
import { FileSpreadsheet, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 border-b border-border/50 bg-bg/80 backdrop-blur-xl"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-accent-dim border border-accent/20 flex items-center justify-center group-hover:border-accent/40 transition-colors">
            <FileSpreadsheet size={18} className="text-accent" />
          </div>
          <span className="text-lg font-bold text-text tracking-tight">Excel Mapper</span>
        </button>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={() => navigate('/profile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/profile'
                    ? 'bg-accent-dim text-accent border border-accent/30'
                    : 'text-text-secondary hover:text-text hover:bg-bg-hover border border-transparent'
                }`}
              >
                <User size={16} />
                <span className="hidden sm:inline">قالب‌های من</span>
              </button>
              <button
                onClick={async () => { await signOut(); navigate('/'); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-error hover:bg-error-dim border border-transparent hover:border-error/20 transition-all duration-200"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-accent-dim text-accent border border-accent/30 hover:border-accent/50 hover:bg-accent/20 transition-all duration-200"
            >
              <LogIn size={16} />
              <span>ورود / ثبت‌نام</span>
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
