import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { FileData, MappingPair, AppStep } from '../types';

interface AppState {
  step: AppStep;
  setStep: (step: AppStep) => void;
  inputFile: FileData | null;
  setInputFile: (f: FileData | null) => void;
  templateFile: FileData | null;
  setTemplateFile: (f: FileData | null) => void;
  mappings: MappingPair[];
  setMappings: (m: MappingPair[]) => void;
  convertedBlob: Blob | null;
  setConvertedBlob: (b: Blob | null) => void;
  isConverted: boolean;
  setIsConverted: (v: boolean) => void;
  reuseMappingId: number | null;
  setReuseMappingId: (id: number | null) => void;
  reset: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<AppStep>('upload');
  const [inputFile, setInputFile] = useState<FileData | null>(null);
  const [templateFile, setTemplateFile] = useState<FileData | null>(null);
  const [mappings, setMappings] = useState<MappingPair[]>([]);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [isConverted, setIsConverted] = useState(false);
  const [reuseMappingId, setReuseMappingId] = useState<number | null>(null);

  const reset = useCallback(() => {
    setStep('upload');
    setInputFile(null);
    setTemplateFile(null);
    setMappings([]);
    setConvertedBlob(null);
    setIsConverted(false);
    setReuseMappingId(null);
  }, []);

  return (
    <AppContext.Provider value={{
      step, setStep,
      inputFile, setInputFile,
      templateFile, setTemplateFile,
      mappings, setMappings,
      convertedBlob, setConvertedBlob,
      isConverted, setIsConverted,
      reuseMappingId, setReuseMappingId,
      reset,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
