import { motion } from 'framer-motion';
import type { MappingPair, FileData } from '../types';

interface PreviewTableProps {
  inputFile: FileData;
  mappings: MappingPair[];
}

export default function PreviewTable({ inputFile, mappings }: PreviewTableProps) {
  const previewRows = inputFile.rows.slice(0, 10);

  if (mappings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted text-sm">هیچ نگاشتی تعریف نشده است</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-x-auto rounded-xl border border-border"
    >
      <table className="w-full text-sm" dir="ltr">
        <thead>
          <tr className="bg-bg-elevated border-b border-border">
            <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">#</th>
            {mappings.map(m => (
              <th key={m.templateCol} className="px-4 py-3 text-right">
                <div className="text-xs font-semibold text-accent">{m.templateCol}</div>
                <div className="text-[10px] text-text-muted mt-0.5">← {m.inputCol}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {previewRows.map((row, i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="border-b border-border/50 hover:bg-bg-hover transition-colors"
            >
              <td className="px-4 py-2.5 text-text-muted text-xs">{i + 1}</td>
              {mappings.map(m => (
                <td key={m.templateCol} className="px-4 py-2.5 text-text text-xs truncate max-w-[200px]">
                  {row[m.inputCol] != null ? String(row[m.inputCol]) : <span className="text-text-muted italic">—</span>}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
      {inputFile.totalRows > 10 && (
        <div className="px-4 py-2 bg-bg-elevated text-center text-xs text-text-muted border-t border-border">
          نمایش ۱۰ ردیف از {inputFile.totalRows}
        </div>
      )}
    </motion.div>
  );
}
