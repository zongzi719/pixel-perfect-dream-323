import React, { createContext, useContext, useState, useCallback } from 'react';
import { AppMode } from '@/types';

interface ModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  selectedCoaches: string[];
  toggleCoach: (coachId: string) => void;
  setSelectedCoaches: (coaches: string[]) => void;
  disabledCoaches: string[];
  toggleCoachActive: (coachId: string) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppMode>('private');
  const [selectedCoaches, setSelectedCoaches] = useState<string[]>(['strategy']);
  const [disabledCoaches, setDisabledCoaches] = useState<string[]>([]);

  const toggleCoach = useCallback((coachId: string) => {
    setSelectedCoaches(prev => {
      if (prev.includes(coachId)) {
        return prev.filter(id => id !== coachId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, coachId];
    });
  }, []);

  const toggleCoachActive = useCallback((coachId: string) => {
    setDisabledCoaches(prev =>
      prev.includes(coachId)
        ? prev.filter(id => id !== coachId)
        : [...prev, coachId]
    );
  }, []);

  return (
    <ModeContext.Provider value={{ mode, setMode, selectedCoaches, toggleCoach, setSelectedCoaches, disabledCoaches, toggleCoachActive }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used within ModeProvider');
  return ctx;
}
