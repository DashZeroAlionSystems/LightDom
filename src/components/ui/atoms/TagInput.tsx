import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TagInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  allowDuplicates?: boolean;
  disabled?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  placeholder = 'Add tag and press Enter',
  maxTags = 50,
  allowDuplicates = false,
  disabled = false,
  className,
  ...props
}) => {
  const [tags, setTags] = useState<string[]>(value || []);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setTags(value || []);
  }, [value]);

  const pushTag = (raw: string) => {
    if (disabled) return;
    const t = raw.trim();
    if (!t) return;
    if (!allowDuplicates && tags.includes(t)) return;
    if (tags.length >= maxTags) return;
    const next = [...tags, t];
    setTags(next);
    onChange?.(next);
  };

  const removeTag = (index: number) => {
    if (disabled) return;
    const next = tags.filter((_, i) => i !== index);
    setTags(next);
    onChange?.(next);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input.trim()) {
        pushTag(input);
        setInput('');
      }
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      // quick remove last
      removeTag(tags.length - 1);
    }
  };

  const onBlur = () => {
    if (input.trim()) {
      pushTag(input);
      setInput('');
    }
  };

  return (
    <div
      className={cn('min-h-[40px] flex items-center flex-wrap gap-2 rounded-md border border-gray-200 p-2', className)}
      {...props}
    >
      {tags.map((t, i) => (
        <span
          key={t + i}
          className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 text-sm rounded px-2 py-1"
        >
          <span className="truncate max-w-[220px]">{t}</span>
          <button
            type="button"
            aria-label={`Remove ${t}`}
            onClick={() => removeTag(i)}
            className="p-1 rounded hover:bg-gray-200"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {tags.length < maxTags && (
        <input
          ref={inputRef}
          value={input}
          disabled={disabled}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          placeholder={placeholder}
          className="flex-1 min-w-[140px] bg-transparent outline-none text-sm p-1"
        />
      )}
    </div>
  );
};

export default TagInput;
