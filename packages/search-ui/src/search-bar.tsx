'use client';

import clsx from 'clsx';
import { useCallback, useId, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchBarVariants, motionSafe, useReducedMotion } from '@next/animation-system';
import { focusRing } from '@next/design-system';

export interface SearchBarProps {
  readonly value: string;
  readonly placeholder?: string;
  readonly suggestions?: readonly { id: string; label: string }[];
  readonly onChange: (value: string) => void;
  readonly onSubmit?: (value: string) => void;
  readonly onSuggestionSelect?: (id: string, label: string) => void;
  readonly className?: string;
}

export function SearchBar({
  value,
  placeholder = 'Search by meaning, mood, or creator…',
  suggestions = [],
  onChange,
  onSubmit,
  onSuggestionSelect,
  className,
}: SearchBarProps) {
  const reduced = useReducedMotion();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const showSuggestions = focused && suggestions.length > 0 && value.length > 0;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit?.(value);
      inputRef.current?.blur();
    },
    [onSubmit, value],
  );

  return (
    <form role="search" onSubmit={handleSubmit} className={clsx('relative', className)}>
      <motion.div
        variants={motionSafe(searchBarVariants, reduced)}
        initial="initial"
        animate="animate"
        className="relative"
      >
        <label htmlFor={listId} className="sr-only">
          Search NEXT
        </label>
        <input
          ref={inputRef}
          id={listId}
          type="search"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={showSuggestions ? `${listId}-suggestions` : undefined}
          aria-expanded={showSuggestions}
          className={clsx(
            'w-full rounded-2xl border border-subtle/20 bg-surface/80 px-5 py-4',
            'font-display text-lg backdrop-blur-sm placeholder:text-muted',
            'transition-colors focus:border-accent/40 focus:outline-none',
            focusRing,
          )}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
        />
      </motion.div>

      <AnimatePresence>
        {showSuggestions ? (
          <motion.ul
            id={`${listId}-suggestions`}
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-subtle/20 bg-elevated shadow-elevation3"
          >
            {suggestions.map((s) => (
              <li key={s.id} role="option">
                <button
                  type="button"
                  className="w-full px-4 py-3 text-left text-sm hover:bg-surface/60"
                  onMouseDown={() => {
                    onSuggestionSelect?.(s.id, s.label);
                    onChange(s.label);
                  }}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </form>
  );
}
