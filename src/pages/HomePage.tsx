import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Save, RotateCcw, Loader2, CheckCircle } from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import UploadPod from '../components/UploadPod';
import MappingEditor from '../components/MappingEditor';
import PreviewTable from '../components/PreviewTable';
import SaveMappingModal from '../components/SaveMappingModal';
import ToastContainer, { type ToastData } from '../components/Toast';
import { useApp } from '../contexts/AppContext';
import { convertToExcelBlob } from '../lib/excel';
import type { AppStep } from '../types';

export default function HomePage() {
  const store = useApp();
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [converting, setConverting] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const addToast = useCallback((type: ToastData['type'], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const canContinueToMap = !!store.inputFile && !!store.templateFile;
  const canContinueToPreview = store.mappings.length > 0;

  const handleConvert = async () => {
    if (!store.inputFile || !store.templateFile) return;
    setConverting(true);
    try {
      const blob = convertToExcelBlob(
        store.inputFile.rows,
        store.mappings,
        store.templateFile.headers,
      );
      store.setConvertedBlob(blob);
      store.setIsConverted(true);
      store.setStep('export');
      addToast('success', 'فایل با موفقیت تبدیل شد');
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : 'خطا در تبدیل');
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (!store.convertedBlob) return;
    const url = URL.createObjectURL(store.convertedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mapped_output_${Date.now()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const goToStep = (step: AppStep) => {
    store.setStep(step);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  };

  const isReuseMode = store.reuseMappingId !== null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <StepIndicator current={store.step} />

      <AnimatePresence mode="wait">
        {/* UPLOAD STEP */}
        {store.step === 'upload' && (
          <motion.div key="upload" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">
                {isReuseMode ? 'استفاده مجدد از قالب' : 'تبدیل اکسل به اکسل'}
              </h1>
              <p className="text-sm text-text-secondary">
                {isReuseMode
                  ? 'فایل ورودی جدید را بارگذاری کنید — نگاشت قبلی اعمال می‌شود'
                  : 'فایل ورودی و قالب خروجی را بارگذاری کنید'
                }
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 mb-8">
              <UploadPod
                label="فایل ورودی"
                description="فایل اکسل حاوی داده‌ها"
                fileData={store.inputFile}
                onFileLoaded={store.setInputFile}
                onClear={() => store.setInputFile(null)}
              />
              {isReuseMode ? (
                <div className="flex-1 min-w-[280px]">
                  <h3 className="text-sm font-semibold text-text-secondary mb-3">فایل قالب</h3>
                  <div className="rounded-2xl border border-accent/30 bg-accent-dim p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <CheckCircle size={20} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text">قالب ذخیره‌شده</p>
                        <p className="text-xs text-text-secondary">{store.templateFile?.headers.length} ستون · {store.mappings.length} نگاشت</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {store.templateFile?.headers.slice(0, 6).map(h => (
                        <span key={h} className="px-2 py-0.5 text-xs bg-bg-card/60 rounded-md border border-border/50 text-text-secondary">{h}</span>
                      ))}
                      {(store.templateFile?.headers.length || 0) > 6 && (
                        <span className="px-2 py-0.5 text-xs text-text-muted">+{(store.templateFile?.headers.length || 0) - 6} ستون دیگر</span>
                      )}
                    </div>
                    <button
                      onClick={() => { store.setReuseMappingId(null); store.setTemplateFile(null); store.setMappings([]); }}
                      className="mt-3 text-xs text-text-muted hover:text-error transition-colors"
                    >
                      لغو قالب ذخیره‌شده
                    </button>
                  </div>
                </div>
              ) : (
                <UploadPod
                  label="فایل قالب"
                  description="فایل اکسل با ساختار خروجی"
                  fileData={store.templateFile}
                  onFileLoaded={store.setTemplateFile}
                  onClear={() => store.setTemplateFile(null)}
                />
              )}
            </div>

            <div className="text-center">
              <motion.button
                onClick={() => goToStep('map')}
                disabled={!canContinueToMap}
                animate={canContinueToMap ? { boxShadow: '0 0 20px rgba(56, 189, 248, 0.15)' } : {}}
                className={`inline-flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  canContinueToMap
                    ? 'bg-accent text-bg hover:bg-accent-hover shadow-lg shadow-accent/10 cursor-pointer'
                    : 'bg-bg-elevated text-text-muted border border-border cursor-not-allowed'
                }`}
              >
                ادامه
                <ArrowLeft size={16} />
              </motion.button>
              {!canContinueToMap && (
                <p className="text-xs text-text-muted mt-3">
                  {isReuseMode ? 'فایل ورودی جدید را بارگذاری کنید' : 'برای ادامه هر دو فایل را بارگذاری کنید'}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* MAP STEP */}
        {store.step === 'map' && store.templateFile && store.inputFile && (
          <motion.div key="map" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <MappingEditor
              templateHeaders={store.templateFile.headers}
              inputHeaders={store.inputFile.headers}
              mappings={store.mappings}
              onChange={store.setMappings}
            />

            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => goToStep('upload')}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-secondary border border-border hover:bg-bg-hover transition-all"
              >
                بازگشت
              </button>
              <motion.button
                onClick={() => goToStep('preview')}
                disabled={!canContinueToPreview}
                animate={canContinueToPreview ? { boxShadow: '0 0 20px rgba(56, 189, 248, 0.15)' } : {}}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  canContinueToPreview
                    ? 'bg-accent text-bg hover:bg-accent-hover'
                    : 'bg-bg-elevated text-text-muted border border-border cursor-not-allowed'
                }`}
              >
                پیش‌نمایش
                <ArrowLeft size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* PREVIEW STEP */}
        {store.step === 'preview' && store.inputFile && (
          <motion.div key="preview" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-text mb-1">پیش‌نمایش خروجی</h3>
              <p className="text-sm text-text-secondary">نمونه ردیف‌های تبدیل‌شده</p>
            </div>

            <PreviewTable inputFile={store.inputFile} mappings={store.mappings} />

            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => goToStep('map')}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-secondary border border-border hover:bg-bg-hover transition-all"
              >
                ویرایش نگاشت
              </button>
              <motion.button
                onClick={handleConvert}
                disabled={converting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-accent text-bg hover:bg-accent-hover disabled:opacity-60 transition-all shadow-lg shadow-accent/10"
              >
                {converting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                تبدیل و دانلود
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* EXPORT STEP */}
        {store.step === 'export' && (
          <motion.div key="export" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <div className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                className="w-20 h-20 rounded-3xl bg-success-dim border border-success/20 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle size={36} className="text-success" />
              </motion.div>

              <h2 className="text-2xl font-bold text-text mb-2">تبدیل موفق!</h2>
              <p className="text-sm text-text-secondary mb-8">فایل خروجی آماده دانلود است</p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <motion.button
                  onClick={handleDownload}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-accent text-bg hover:bg-accent-hover transition-all shadow-lg shadow-accent/10"
                >
                  <Download size={18} />
                  دانلود فایل
                </motion.button>

                <button
                  onClick={() => setShowSaveModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-accent bg-accent-dim border border-accent/30 hover:border-accent/50 hover:bg-accent/20 transition-all"
                >
                  <Save size={18} />
                  ذخیره نگاشت
                </button>

                <button
                  onClick={store.reset}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-text-secondary border border-border hover:bg-bg-hover transition-all"
                >
                  <RotateCcw size={18} />
                  تبدیل جدید
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {store.templateFile && (
        <SaveMappingModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          mappings={store.mappings}
          templateHeaders={store.templateFile.headers}
          onSaved={() => addToast('success', 'نگاشت با موفقیت ذخیره شد')}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
