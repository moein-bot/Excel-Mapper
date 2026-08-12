import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet, Play, Pencil, Trash2, Loader2, Inbox, AlertTriangle, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import type { SavedMapping } from '../types';
import ToastContainer, { type ToastData } from '../components/Toast';
import supabase from '../lib/supabase';

const MAX_TEMPLATES = 5;

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [mappings, setMappings] = useState<SavedMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const addToast = useCallback((type: ToastData['type'], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchMappings = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('saved_mappings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMappings((data as SavedMapping[]) || []);
    } catch (err) {
      console.error(err);
      addToast('error', 'خطا در دریافت قالب‌ها');
    } finally {
      setLoading(false);
    }
  }, [user, addToast]);

  useEffect(() => {
    if (user) fetchMappings();
    else setLoading(false);
  }, [user, fetchMappings]);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const { error } = await supabase.from('saved_mappings').delete().eq('id', id);
      if (error) throw error;
      addToast('success', 'قالب حذف شد');
      fetchMappings();
    } catch {
      addToast('error', 'خطا در حذف');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRename = async (id: number) => {
    if (!editName.trim()) return;
    try {
      const { error } = await supabase
        .from('saved_mappings')
        .update({ name: editName.trim() })
        .eq('id', id);
      if (error) throw error;
      addToast('success', 'نام تغییر کرد');
      setEditingId(null);
      fetchMappings();
    } catch {
      addToast('error', 'خطا در تغییر نام');
    }
  };

  const handleUse = (m: SavedMapping) => {
    navigate('/', {
      state: {
        reuse: true,
        mappingConfig: m.mapping_config,
        templateHeaders: m.template_headers,
        mappingId: m.id,
      },
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="text-accent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-text mb-1">قالب‌های ذخیره‌شده</h1>
        <p className="text-sm text-text-secondary">
          {mappings.length} از {MAX_TEMPLATES} قالب
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="text-accent animate-spin" />
        </div>
      ) : mappings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center mb-4">
            <Inbox size={24} className="text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text mb-1">هنوز قالبی ذخیره نکرده‌اید</p>
          <p className="text-xs text-text-muted mb-4">پس از نگاشت ستون‌ها می‌توانید قالب را ذخیره کنید</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-accent text-bg hover:bg-accent-hover transition-colors"
          >
            شروع نگاشت
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {mappings.map((m) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group rounded-2xl border border-border bg-bg-card p-4 hover:border-border-light transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-dim flex items-center justify-center shrink-0">
                    <FileSpreadsheet size={18} className="text-accent" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {editingId === m.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border text-sm text-text focus:outline-none focus:border-accent/50"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(m.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <button
                          onClick={() => handleRename(m.id)}
                          className="p-1.5 rounded-lg text-success hover:bg-success-dim"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 rounded-lg text-text-muted hover:bg-bg-hover"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-text truncate">{m.name}</p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {m.mapping_config?.length ?? 0} نگاشت ·{' '}
                          {new Date(m.created_at).toLocaleDateString('fa-IR')}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleUse(m)}
                      className="w-8 h-8 rounded-lg bg-accent-dim text-accent flex items-center justify-center hover:bg-accent/20 transition-all"
                      title="استفاده"
                    >
                      <Play size={14} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setEditingId(m.id);
                        setEditName(m.name);
                      }}
                      className="w-8 h-8 rounded-lg bg-bg-elevated text-text-secondary flex items-center justify-center hover:bg-bg-hover hover:text-text transition-all"
                      title="تغییر نام"
                    >
                      <Pencil size={14} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(m.id)}
                      disabled={deletingId === m.id}
                      className="w-8 h-8 rounded-lg bg-bg-elevated text-text-secondary flex items-center justify-center hover:bg-error-dim hover:text-error transition-all"
                      title="حذف"
                    >
                      {deletingId === m.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {mappings.length >= MAX_TEMPLATES && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-warning/5 border border-warning/20 text-warning text-xs"
            >
              <AlertTriangle size={14} />
              حداکثر ۵ قالب — برای ذخیره جدید یکی را حذف کنید
            </motion.div>
          )}
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
