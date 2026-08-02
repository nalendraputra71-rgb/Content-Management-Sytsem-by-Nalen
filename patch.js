const fs = require('fs');
let code = fs.readFileSync('src/components/DebouncedInput.tsx', 'utf8');
code = code.replace(/export const DebouncedTextarea = \(\{ value, onChange, \.\.\.props \}: TextareaAutosizeProps\) => \{/, "export const DebouncedTextarea = React.forwardRef(({ value, onChange, ...props }: TextareaAutosizeProps, ref: any) => {");
code = code.replace(/<TextareaAutosize \{\.\.\.props\} value=\{internalValue\} onChange=\{handleChange\} \/>;\n\}/, "<TextareaAutosize ref={ref} {...props} value={internalValue} onChange={handleChange} />;\n});\nDebouncedTextarea.displayName = 'DebouncedTextarea';");
fs.writeFileSync('src/components/DebouncedInput.tsx', code);
