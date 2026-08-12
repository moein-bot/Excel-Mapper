import { motion } from 'framer-motion';
import { Upload, GitBranch, Eye, Download } from 'lucide-react';
import type { AppStep } from '../types';

const steps: { key: AppStep; label: string; icon: typeof Upload }[] = [
  { key: 'upload', label: 'بارگذاری', icon: Upload },
  { key: 'map', label: 'مپینگ', icon: GitBranch },
  { key: 'preview', label: 'پیش‌نمایش', icon: Eye },
  { key: 'export', label: 'خروجی', icon: Download },
];

const stepOrder: AppStep[] = ['upload', 'map', 'preview', 'export'];

export default function StepIndicator({ current }: { current: AppStep }) {
  const currentIdx = stepOrder.indexOf(current);

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 py-6">
      {steps.map((s, i) => {
        const isActive = i === currentIdx;
        const isDone = i < currentIdx;
        const Icon = s.icon;
        return (
          <div key={s.key} className="flex items-center gap-2 sm:gap-4">
            <motion.div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-accent-dim text-accent border border-accent/30'
                  : isDone
                  ? 'bg-success-dim text-success border border-success/20'
                  : 'bg-bg-card text-text-muted border border-border'
              }`}
              animate={{ scale: isActive ? 1.05 : 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{s.label}</span>
            </motion.div>
            {i < steps.length - 1 && (
              <div className={`w-6 sm:w-10 h-px transition-colors duration-300 ${
                i < currentIdx ? 'bg-success/40' : 'bg-border'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
