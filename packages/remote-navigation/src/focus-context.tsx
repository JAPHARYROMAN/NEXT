'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { trackFocusTransition } from '@next/frontend-utils';
import type { FocusDirection, FocusNode } from './focus-types';
import { pickNeighbor } from './spatial-focus';

interface FocusContextValue {
  readonly focusedId: string | null;
  readonly register: (node: FocusNode, el: HTMLElement) => void;
  readonly unregister: (id: string) => void;
  readonly focus: (id: string) => void;
  readonly move: (direction: FocusDirection) => void;
}

const FocusContext = createContext<FocusContextValue | null>(null);

export interface FocusProviderProps {
  readonly children: ReactNode;
  readonly defaultFocusId?: string;
  readonly zone?: string;
}

export function FocusProvider({ children, defaultFocusId, zone }: FocusProviderProps) {
  const nodesRef = useRef<Map<string, { node: FocusNode; el: HTMLElement }>>(new Map());
  const [focusedId, setFocusedId] = useState<string | null>(defaultFocusId ?? null);
  const started = useRef(performance.now());

  const register = useCallback(
    (node: FocusNode, el: HTMLElement) => {
      if (zone && node.zone && node.zone !== zone) return;
      nodesRef.current.set(node.id, { node, el });
      if (!focusedId && defaultFocusId === node.id) {
        setFocusedId(node.id);
        el.focus({ preventScroll: true });
      }
    },
    [defaultFocusId, focusedId, zone],
  );

  const unregister = useCallback(
    (id: string) => {
      nodesRef.current.delete(id);
      if (focusedId === id) setFocusedId(null);
    },
    [focusedId],
  );

  const focus = useCallback(
    (id: string) => {
      const entry = nodesRef.current.get(id);
      if (!entry) return;
      const from = focusedId ?? 'none';
      setFocusedId(id);
      entry.el.focus({ preventScroll: true });
      trackFocusTransition(from, id, Math.round(performance.now() - started.current));
      started.current = performance.now();
    },
    [focusedId],
  );

  const move = useCallback(
    (direction: FocusDirection) => {
      if (!focusedId) {
        const first = nodesRef.current.values().next().value;
        if (first) focus(first.node.id);
        return;
      }
      const current = nodesRef.current.get(focusedId);
      if (!current) return;
      const nodes = [...nodesRef.current.values()].map((v) => v.node);
      const nextId = pickNeighbor(current.node, nodes, direction);
      if (nextId) focus(nextId);
    },
    [focus, focusedId],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, FocusDirection> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      };
      const dir = map[e.key];
      if (!dir) return;
      e.preventDefault();
      move(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move]);

  const value = useMemo(
    () => ({ focusedId, register, unregister, focus, move }),
    [focusedId, register, unregister, focus, move],
  );

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function useFocusContext(): FocusContextValue {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error('useFocusContext requires FocusProvider');
  return ctx;
}
