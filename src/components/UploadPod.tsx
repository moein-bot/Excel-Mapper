import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, CheckCircle, X, AlertCircle, Loader2 } from 'lucide-react';
import type { FileData } from '../types';
import { parseExcelFile } from '../lib/excel';

interface UploadPodProps {
  label: string;
  description: string;
  fileData: FileData | null;
  onFileLoaded: (data: FileData) => void;
  onClear: () => void;
}

export default function UploadPod({
  label,
  description,
  fileData,
  onFileLoaded,
  onClear,
}: UploadPodProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsLoading(true);
      try {
        const data = await parseExcelFile(file);
        onFileLoaded(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'خطا در بارگذاری فایل');
      } finally {
        setIsLoading(false);
      }
    },
    [onFileLoaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      if (inputRef.current) inputRef.current.value = '';
    },
    [processFile]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1"
    >
      <p className="text-sm font-medium text-text-secondary mb-2">{label}</p>

      <AnimatePresence mode="wait">
        {fileData ? (
          <motion.div
            key="loaded"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="relative rounded-2xl border border-border bg-bg-card p-5 min-h-[200px] flex flex-col"
          >
            <button
              type="button"
              onClick={onClear}
              className="absolute top-3 left-3 p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-dim transition-colors"
              aria-label="حذف فایل"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-success-dim flex items-center justify-center shrink-0">
                <CheckCircle size={20} className="text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text truncate" title={fileData.name}>
                  {fileData.name}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {fileData.totalRows.toLocaleString('fa-IR')} ردیف ·{' '}
                  {fileData.headers.length.toLocaleString('fa-IR')} ستون
                </p>
              </div>
            </div>

            <div className="mt-auto">
              <p className="text-xs text-text-muted mb-2">ستون‌ها:</p>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {fileData.headers.slice(0, 12).map((h) => (
                  <span
                    key={h}
                    className="px-2 py-0.5 rounded-md bg-bg-elevated border border-border text-[11px] text-text-secondary truncate max-w-[120px]"
                    title={h}
                  >
                    {h}
                  </span>
                ))}
                {fileData.headers.length > 12 && (
                  <span className="px-2 py-0.5 text-[11px] text-text-muted">
                    +{fileData.headers.length - 12}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[200px] ${
              isDragging
                ? 'border-accent bg-accent-dim scale-[1.02]'
                : 'border-border hover:border-accent/40 hover:bg-bg-hover'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="hidden"
            />

            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 size={32} className="text-accent" />
              </motion.div>
            ) : (
              <>
                <motion.div
                  animate={isDragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                  className="w-14 h-14 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center mb-4"
                >
                  {isDragging ? (
                    <FileSpreadsheet size={24} className="text-accent" />
                  ) : (
                    <Upload size={24} className="text-text-muted" />
                  )}
                </motion.div>
                <p className="text-sm font-medium text-text mb-1">{description}</p>
                <p className="text-xs text-text-muted">فقط .xlsx · حداکثر ۲۰MB</p>
              </>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-3 inset-x-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-error-dim border border-error/20 text-error text-xs"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
