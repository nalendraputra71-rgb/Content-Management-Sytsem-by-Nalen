const fs = require('fs');
let code = fs.readFileSync('src/components/DebouncedInput.tsx', 'utf8');
code = code.replace("export const DebouncedTextarea = React.forwardRef(({ value, onChange, ...props }: TextareaAutosizeProps, ref: any) => {", "export const DebouncedTextarea = React.forwardRef<HTMLTextAreaElement, TextareaAutosizeProps & {ref?: any}>(({ value, onChange, ...props }, ref) => {");
fs.writeFileSync('src/components/DebouncedInput.tsx', code);
