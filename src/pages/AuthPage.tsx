import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('ایمیل و رمز عبور را وارد کنید');
      return;
    }
    if (password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }
    setLoading(true);
    setError(null);

    const result = isSignUp ? await signUp(email, password) : await signIn(email, password);
    if (result.error) {
      if (result.error.includes('Invalid login')) setError('ایمیل یا رمز عبور اشتباه است');
      else if (result.error.includes('already registered')) setError('این ایمیل قبلاً ثبت شده');
      else setError(result.error);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text mb-2">
            {isSignUp ? 'ثبت‌نام' : 'ورود'}
          </h1>
          <p className="text-sm text-text-secondary">
            {isSignUp ? 'حساب جدید بسازید' : 'وارد حساب خود شوید'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ایمیل"
              className="w-full pr-11 pl-4 py-3 rounded-xl bg-bg-card border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
              dir="ltr"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="رمز عبور"
              className="w-full pr-11 pl-11 py-3 rounded-xl bg-bg-card border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-error-dim border border-error/20 text-error text-xs"
              >
                <AlertTriangle size={14} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-accent text-bg hover:bg-accent-hover disabled:opacity-60 transition-all"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {isSignUp ? 'ثبت‌نام' : 'ورود'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="text-sm text-text-secondary hover:text-accent transition-colors"
          >
            {isSignUp ? 'حساب دارید؟ وارد شوید' : 'حساب ندارید؟ ثبت‌نام کنید'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors"
          >
            <ArrowLeft size={12} />
            بازگشت بدون ورود
          </button>
        </div>
      </motion.div>
    </div>
  );
}
