import React, { useState, useEffect, useRef } from "react";
import TextareaAutosize, { TextareaAutosizeProps } from "react-textarea-autosize";

export const DebouncedInput = ({ value, onChange, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
  const [internalValue, setInternalValue] = useState(value);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    
    // We must persist the event to pass it asynchronously
    e.persist && e.persist();
    
    // Also capture the value
    const val = e.target.value;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Create a fake event object
      if (onChange) {
        onChange({
          ...e,
          target: { ...e.target, value: val }
        } as any);
      }
    }, 500);
  };

  return <input {...props} value={internalValue} onChange={handleChange} />;
}

export const DebouncedTextarea = React.forwardRef<HTMLTextAreaElement, TextareaAutosizeProps & {ref?: any}>(({ value, onChange, ...props }, ref) => {
  const [internalValue, setInternalValue] = useState(value);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInternalValue(e.target.value);
    e.persist && e.persist();
    const val = e.target.value;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (onChange) {
        onChange({
          ...e,
          target: { ...e.target, value: val }
        } as any);
      }
    }, 500);
  };

  return <TextareaAutosize ref={ref} {...props} value={internalValue} onChange={handleChange} />;
});
DebouncedTextarea.displayName = 'DebouncedTextarea';
