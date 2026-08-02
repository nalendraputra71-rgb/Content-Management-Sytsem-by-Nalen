const fs = require('fs');

let code = fs.readFileSync('src/RichTextEditor.tsx', 'utf8');

if (!code.includes('timeoutRef')) {
  // Add useRef to imports
  code = code.replace(/import React, \{ useEffect, useImperativeHandle \} from 'react';/, "import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';");
  
  // modify onUpdate
  code = code.replace(/onUpdate: \(\{ editor \}\) => \{\n      onChange\(editor\.getHTML\(\)\);\n    \},/, `onUpdate: ({ editor }) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onChange(editor.getHTML());
      }, 500);
    },`);
    
  // add timeoutRef
  code = code.replace(/const editor = useEditor\(\{/, `const timeoutRef = useRef<any>(null);
  const editor = useEditor({`);
  
  fs.writeFileSync('src/RichTextEditor.tsx', code);
  console.log("RTE Patched");
} else {
  console.log("RTE already patched");
}
