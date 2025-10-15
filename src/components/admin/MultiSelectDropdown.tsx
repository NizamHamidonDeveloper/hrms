import React, { useState, useRef, useEffect } from "react";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectDropdownProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export default function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select...",
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOption(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  function isChecked(value: string) {
    return selected.includes(value);
  }

  return (
    <div className="relative" ref={ref}>
      <label className="block text-base font-medium text-gray-900 mb-2">{label}</label>
      <button
        type="button"
        className="w-full h-12 px-4 text-left bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-inner flex items-center gap-2"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {selected.slice(0, 3).map(val => {
              const opt = options.find(o => o.value === val);
              return (
                <span key={val} className="bg-teal-100 text-teal-700 rounded-full px-3 py-1 text-xs font-semibold">
                  {opt ? opt.label : val}
                </span>
              );
            })}
            {selected.length > 3 && (
              <span className="text-xs text-gray-500 ml-1">+{selected.length - 3} more</span>
            )}
          </div>
        )}
        <span className="ml-auto text-gray-400">
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      </button>
      {open && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto py-2">
          {options.map(opt => (
            <li key={opt.value} className="px-4 py-2 hover:bg-teal-50 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isChecked(opt.value)}
                onChange={() => toggleOption(opt.value)}
                className="form-checkbox text-teal-600 focus:ring-teal-500"
                id={label + "-" + opt.value}
              />
              <label htmlFor={label + "-" + opt.value} className="text-base text-gray-900 cursor-pointer">
                {opt.label}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 