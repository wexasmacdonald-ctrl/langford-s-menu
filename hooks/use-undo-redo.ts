"use client";

import { useCallback, useMemo, useState } from "react";

type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

export function useUndoRedo<T>(initial: T) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initial,
    future: [],
  });

  const set = useCallback((updater: (prev: T) => T) => {
    setHistory((current) => {
      const nextPresent = updater(current.present);
      if (Object.is(nextPresent, current.present)) {
        return current;
      }
      return {
        past: [...current.past, current.present],
        present: nextPresent,
        future: [],
      };
    });
  }, []);

  const reset = useCallback((next: T) => {
    setHistory({
      past: [],
      present: next,
      future: [],
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((current) => {
      if (current.past.length === 0) return current;
      const previous = current.past[current.past.length - 1];
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((current) => {
      if (current.future.length === 0) return current;
      const next = current.future[0];
      return {
        past: [...current.past, current.present],
        present: next,
        future: current.future.slice(1),
      };
    });
  }, []);

  const canUndo = useMemo(() => history.past.length > 0, [history.past.length]);
  const canRedo = useMemo(() => history.future.length > 0, [history.future.length]);

  return {
    state: history.present,
    set,
    reset,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
