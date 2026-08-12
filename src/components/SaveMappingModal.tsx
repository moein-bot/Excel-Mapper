import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, LogIn, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { MappingPair } from '../types';
import supabase from '../lib/supabase';

const MAX_TEMPLATES = 5;

interface SaveMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mappings: MappingPair[];
  templateHeaders: string[];
  onSaved: () => void;
}

export default function SaveMappingModal({
  isOpen,
  onClose,
  mappings,
  templateHeaders,
  onSaved,
}: SaveMappingModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('نام قالب را وارد کنید');
      return;
    }
    if (!user) return;

    setSaving(true);
    setError(null);
    try {
      const { count, error: countError } = await supabase
        .from('saved_mappings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (countError) throw countError;
      if ((count ?? 0) >= MAX_TEMPLATES) {
        throw new Error('حداکثر ۵ قالب — برای ذخیره جدید یکی را حذف کنید');
      }

      const { error: insertError } = await supabase.from('saved_mappings').insert({
        user_id: user.id,
        name: name.trim(),
        mapping_config: mappings,
        template_headers: templateHeaders,
      });
      if (insertError) throw insertError;

      onSaved();
      onClose();
      setName('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-full max-w-md bg-bg-card border border-border rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text">ذخیره نگاشت</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-bg-hover transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {!user ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-2xl bg-accent-dim flex items-center justify-center mx-auto mb-4">
                  <LogIn size={22} className="text-accent" />
                </div>
                <p className="text-sm text-text-secondary mb-4">
                  برای ذخیره نگاشت‌ها باید وارد شوید
                </p>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/auth');
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-accent text-bg hover:bg-accent-hover transition-colors"
                >
                  ورود / ثبت‌نام
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary mb-2 block">
                      نام قالب
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثلاً: گزارش فروش ماهانه"
                      className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                      dir="rtl"
                      autoFocus
                    />
                  </div>

                  <div className="text-xs text-text-muted">
                    {mappings.length} نگاشت · {templateHeaders.length} ستون قالب
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
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary border border-border hover:bg-bg-hover transition-all"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !name.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent text-bg hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    ذخیره
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
