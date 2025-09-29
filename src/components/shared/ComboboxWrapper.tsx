import React, { KeyboardEvent, useRef, useCallback, useEffect } from 'react';
import { Combobox } from 'nullab-design-system';

interface ComboboxWrapperProps {
  children: React.ReactNode;
  value: any;
  onChange: (value: any) => void;
  onCreateNew?: (searchTerm?: string) => void;
  placeholder?: string;
  className?: string;
}

export const ComboboxWrapper: React.FC<ComboboxWrapperProps> = ({
  children,
  value,
  onChange,
  onCreateNew,
  placeholder,
  className
}) => {
  const inputValueRef = useRef<string>('');

  // Clear input value when value changes (selection made)
  useEffect(() => {
    if (value) {
      inputValueRef.current = '';
    }
  }, [value]);

  const handleInputChange = useCallback((inputValue: string) => {
    inputValueRef.current = inputValue;
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    // Only handle Enter if there's actual input and onCreateNew is available
    if (event.key === 'Enter' && inputValueRef.current?.trim() && onCreateNew) {
      // Check if this Enter is for creating a new item vs selecting an existing one
      // This prevents interfering with normal combobox selection
      const hasSearchTerm = inputValueRef.current.trim().length > 0;
      
      if (hasSearchTerm) {
        event.preventDefault();
        event.stopPropagation();
        onCreateNew(inputValueRef.current.trim());
        inputValueRef.current = '';
      }
    }
  }, [onCreateNew]);

  return (
    <div onKeyDown={handleKeyDown} className={className}>
      <Combobox
        value={value}
        onChange={onChange}
        onCreateNew={onCreateNew}
        placeholder={placeholder}
      >
        {children}
      </Combobox>
    </div>
  );
};
