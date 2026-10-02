import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

export function TagInput({ tags, setTags, placeholder = "Add an item...", suggestions = [] }: TagInputProps) {
  const [input, setInput] = useState('');

  const handleAdd = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd(input);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-bgSecondary border border-borderSubtle text-sm text-textPrimary">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-textTertiary hover:text-danger focus:outline-none">
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="w-full h-11 px-4 rounded-xl border border-borderStrong bg-transparent focus:outline-none focus:border-accentPrimary focus:ring-1 focus:ring-accentPrimary transition-all placeholder:text-textTertiary text-textPrimary"
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.filter(s => !tags.includes(s) && s.toLowerCase().includes(input.toLowerCase())).slice(0, 5).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => handleAdd(s)}
              className="text-xs px-2 py-1 rounded-md bg-transparent border border-dashed border-borderStrong text-textSecondary hover:text-accentPrimary hover:border-accentPrimary transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
