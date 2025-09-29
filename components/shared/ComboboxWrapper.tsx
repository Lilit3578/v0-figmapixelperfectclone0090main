import React, { KeyboardEvent, useRef, useCallback, useEffect } from 'react'
import { Combobox } from 'nullab-design-system'

interface ComboboxWrapperProps {
  children: React.ReactNode
  value: any
  onChange: (value: any) => void
  onCreateNew?: (searchTerm?: string) => void
  placeholder?: string
  className?: string
}

export const ComboboxWrapper: React.FC<ComboboxWrapperProps> = ({ children, value, onChange, onCreateNew, placeholder, className }) => {
  const inputValueRef = useRef<string>('')

  useEffect(() => {
    if (value) {
      inputValueRef.current = ''
    }
  }, [value])

  const handleInputChange = useCallback((inputValue: string) => {
    inputValueRef.current = inputValue
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' && inputValueRef.current?.trim() && onCreateNew) {
        const hasSearchTerm = inputValueRef.current.trim().length > 0
        if (hasSearchTerm) {
          event.preventDefault()
          event.stopPropagation()
          onCreateNew(inputValueRef.current.trim())
          inputValueRef.current = ''
        }
      }
    },
    [onCreateNew],
  )

  return (
    <div onKeyDown={handleKeyDown} className={className}>
      <Combobox value={value} onChange={onChange} onCreateNew={onCreateNew} placeholder={placeholder} onInputChange={handleInputChange}>
        {children}
      </Combobox>
    </div>
  )
}


