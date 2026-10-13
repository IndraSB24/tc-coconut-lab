'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption<T = string> {
  value: T;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface CustomSelectProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: CustomSelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: 'default' | 'compact';
  id?: string;
  'aria-label'?: string;
}

const DEFAULT_BADGE_COLORS: Record<string, string> = {
  USD: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  IDR: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  EUR: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  GBP: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  SGD: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

export function CustomSelect<T extends string | number = string>({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  disabled = false,
  className = '',
  size = 'default',
  id,
  'aria-label': ariaLabel,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (option: CustomSelectOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  const isCompact = size === 'compact';

  const getBadgeStyle = (badge?: string, customColor?: string) => {
    if (customColor) return customColor;
    if (badge && DEFAULT_BADGE_COLORS[badge]) {
      return DEFAULT_BADGE_COLORS[badge];
    }
    return 'bg-slate-700/50 text-slate-300 border-slate-600';
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${isCompact ? 'inline-block' : 'w-full'} ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        aria-label={ariaLabel || activeOption?.label || placeholder}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={
          isCompact
            ? `inline-flex items-center justify-between gap-2 bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-lg px-3 py-1.5 text-xs text-white transition focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`
            : `w-full bg-slate-900 border border-slate-700 hover:border-indigo-500/60 rounded-xl px-3.5 py-2.5 text-sm text-white flex items-center justify-between gap-2.5 shadow-sm transition focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`
        }
      >
        <div className="flex items-center gap-2 min-w-0">
          {activeOption?.badge && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${getBadgeStyle(
                activeOption.badge,
                activeOption.badgeColor
              )}`}
            >
              {activeOption.badge}
            </span>
          )}
          {activeOption?.icon && (
            <span className="shrink-0">{activeOption.icon}</span>
          )}
          <span className="font-semibold text-white truncate text-left">
            {activeOption ? activeOption.label : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeOption?.sublabel && (
            <span className="font-mono text-emerald-400 text-xs sm:text-sm truncate">
              {activeOption.sublabel}
            </span>
          )}
          <ChevronDown
            className={`text-slate-400 transition-transform duration-200 shrink-0 ${
              isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'
            } ${isOpen ? 'rotate-180 text-indigo-400' : ''}`}
          />
        </div>
      </button>

      {/* Floating Glassmorphic Popover Overlay */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute top-full left-0 mt-1.5 w-full ${
            isCompact ? 'min-w-[12rem]' : 'min-w-[15rem]'
          } z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 space-y-1 max-h-64 overflow-y-auto`}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400 text-center">
              No options available
            </div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={() => handleSelect(option)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition text-left cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/30 font-medium'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
                  } ${option.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {option.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${getBadgeStyle(
                          option.badge,
                          option.badgeColor
                        )}`}
                      >
                        {option.badge}
                      </span>
                    )}
                    {option.icon && (
                      <span className="shrink-0">{option.icon}</span>
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {option.sublabel && (
                      <span className="font-mono text-emerald-400 text-xs truncate">
                        {option.sublabel}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
