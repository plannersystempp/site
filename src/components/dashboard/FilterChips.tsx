import React from 'react';
import { Check } from 'lucide-react';

interface FilterChipsProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  showCounts?: boolean;
  counts?: Record<string, number>;
  showActiveIcon?: boolean;
  activeVariant?: 'filled' | 'outline';
}

export const FilterChips = <T extends string>({ label, options, value, onChange, showCounts, counts, showActiveIcon = true, activeVariant = 'outline' }: FilterChipsProps<T>) => {
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = options.findIndex(o => o === value);
    if (e.key === 'ArrowRight') {
      const next = options[Math.min(currentIndex + 1, options.length - 1)];
      if (next) onChange(next);
    } else if (e.key === 'ArrowLeft') {
      const prev = options[Math.max(currentIndex - 1, 0)];
      if (prev) onChange(prev);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap" role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
      <span className="text-sm text-muted-foreground mr-2">{label}:</span>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          role="radio"
          aria-checked={value === opt}
          className={`px-2 py-1 rounded border text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            value === opt
              ? activeVariant === 'outline'
                ? 'bg-transparent text-primary border-primary ring-1 ring-primary/50'
                : 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-muted hover:bg-muted/70'
          }`}
        >
          {opt}{showCounts && typeof counts?.[opt] === 'number' ? ` (${counts![opt]})` : ''}
          {value === opt && showActiveIcon && (
            <Check className="inline h-3 w-3 ml-1" aria-hidden="true" />
          )}
        </button>
      ))}
    </div>
  );
};

export default FilterChips;