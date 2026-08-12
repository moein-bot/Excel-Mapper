import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, Plus, Trash2, Columns3 } from 'lucide-react';
import type { MappingPair } from '../types';

interface MappingEditorProps {
  templateHeaders: string[];
  inputHeaders: string[];
  mappings: MappingPair[];
  onChange: (mappings: MappingPair[]) => void;
}

export default function MappingEditor({ templateHeaders, inputHeaders, mappings, onChange }: MappingEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const addMapping = useCallback((templateCol: string, inputCol: string) => {
    const exists = mappings.find(m => m.templateCol === templateCol);
    if (exists) {
      onChange(mappings.map(m => m.templateCol === templateCol ? { ...m, inputCol } : m));
    } else {
      onChange([...mappings, { templateCol, inputCol }]);
    }
    setSelectedTemplate(null);
  }, [mappings, onChange]);

  const removeMapping = useCallback((templateCol: string) => {
    onChange(mappings.filter(m => m.templateCol !== templateCol));
  }, [mappings, onChange]);

  const autoMap = useCallback(() => {
    const newMappings: MappingPair[] = [];
    templateHeaders.forEach(th => {
      const normalTh = th.trim().toLowerCase();
      const match = inputHeaders.find(ih => ih.trim().toLowerCase() === normalTh);
      if (match) {
        newMappings.push({ templateCol: th, inputCol: match });
      }
    });
    onChange(newMappings);
  }, [templateHeaders, inputHeaders, onChange]);

  const unmappedTemplate = templateHeaders.filter(h => !mappings.find(m => m.templateCol === h));
  const mappedInputCols = new Set(mappings.map(m => m.inputCol));

  return (
    <div className="space-y-6">
      {/* Auto-map button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-text">نگاشت ستون‌ها</h3>
          <p className="text-sm text-text-secondary mt-1">ستون‌های قالب را به ستون‌های ورودی متصل کنید</p>
        </div>
        <button
          onClick={autoMap}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-accent-dim text-accent border border-accent/30 hover:border-accent/50 hover:bg-accent/20 transition-all duration-200"
        >
          <Columns3 size={16} />
          تطبیق خودکار
        </button>
      </div>

      {/* Mapped pairs */}
      <div className="space-y-2">
        <AnimatePresence>
          {mappings.map((m, i) => (
            <motion.div
              key={m.templateCol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-bg-card border border-border hover:border-accent/20 transition-colors group"
            >
              <div className="flex-1 px-3 py-2 rounded-lg bg-accent-dim/50 border border-accent/15 text-sm text-accent font-medium truncate">
                {m.templateCol}
              </div>

              <div className="flex-shrink-0">
                <ArrowLeftRight size={16} className="text-text-muted" />
              </div>

              <select
                value={m.inputCol}
                onChange={(e) => addMapping(m.templateCol, e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-bg-elevated border border-border text-sm text-text appearance-none cursor-pointer hover:border-accent/30 transition-colors"
                dir="rtl"
              >
                {inputHeaders.map(ih => (
                  <option key={ih} value={ih}>{ih}</option>
                ))}
              </select>

              <button
                onClick={() => removeMapping(m.templateCol)}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-error hover:bg-error-dim transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Unmapped template columns */}
      {unmappedTemplate.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">ستون‌های بدون نگاشت</p>
          <div className="flex flex-wrap gap-2">
            {unmappedTemplate.map(col => (
              <motion.button
                key={col}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTemplate(selectedTemplate === col ? null : col)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all duration-200 ${
                  selectedTemplate === col
                    ? 'bg-accent-dim text-accent border-accent/40'
                    : 'bg-bg-elevated text-text-secondary border-border hover:border-accent/30'
                }`}
              >
                <Plus size={12} className="inline ml-1" />
                {col}
              </motion.button>
            ))}
          </div>

          {/* Input column picker */}
          <AnimatePresence>
            {selectedTemplate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-xl bg-bg-elevated border border-accent/20">
                  <p className="text-xs text-text-muted mb-3">
                    ستون ورودی را برای <span className="text-accent font-semibold">{selectedTemplate}</span> انتخاب کنید
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {inputHeaders.map(ih => (
                      <button
                        key={ih}
                        onClick={() => addMapping(selectedTemplate, ih)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all duration-200 ${
                          mappedInputCols.has(ih)
                            ? 'bg-bg-card text-text-muted border-border/50 opacity-50'
                            : 'bg-bg-card text-text border-border hover:border-accent/40 hover:bg-accent-dim'
                        }`}
                      >
                        {ih}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 pt-2">
        <span className="text-xs text-text-muted">
          {mappings.length} از {templateHeaders.length} ستون نگاشت شده
        </span>
        {mappings.length === templateHeaders.length && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs text-success font-medium"
          >
            ✓ همه ستون‌ها نگاشت شدند
          </motion.span>
        )}
      </div>
    </div>
  );
}
