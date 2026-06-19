'use client';
import { useState, useCallback } from 'react';

export const useCanvasHistory = (maxSteps = 50) => {
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const pushState = useCallback(
    (json: string) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push(json);
        if (newHistory.length > maxSteps) newHistory.shift();
        return newHistory;
      });
      setCurrentIndex((prev) => Math.min(prev + 1, maxSteps - 1));
    },
    [currentIndex, maxSteps]
  );

  const undo = useCallback((): string | null => {
    if (currentIndex <= 0) return null;
    setCurrentIndex((prev) => prev - 1);
    return history[currentIndex - 1];
  }, [currentIndex, history]);

  const redo = useCallback((): string | null => {
    if (currentIndex >= history.length - 1) return null;
    setCurrentIndex((prev) => prev + 1);
    return history[currentIndex + 1];
  }, [currentIndex, history]);

  const clear = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  return {
    pushState,
    undo,
    redo,
    clear,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    currentIndex,
    historyLength: history.length,
  };
};
