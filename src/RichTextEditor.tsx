import React, { useEffect, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minRows?: number;
  inputRef?: React.RefObject<any>;
}

export const RichTextEditor = React.forwardRef(({ value, onChange, placeholder, minRows = 4, inputRef }: RichTextEditorProps, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-prose focus:outline-none min-h-[100px] w-full max-w-none text-[13px] leading-relaxed',
        style: `min-height: ${minRows * 20}px; padding: 12px;`
      },
    },
  });

  useImperativeHandle(inputRef || ref, () => ({
    focus: () => {
      editor?.commands.focus('end');
    },
    get value() {
      return editor?.getHTML() || '';
    },
    setSelectionRange: () => {
      // Stub for setSelectionRange, tiptap handles focus('end')
    }
  }));

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      const currentHtml = editor.getHTML();
      if ((value === '' || value === '<p></p>') && currentHtml === '<p></p>') {
        return;
      }
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const btnStyle: React.CSSProperties = {
    background: "none",
    border: "1px solid rgba(44,32,22,0.1)",
    borderRadius: "4px",
    padding: "2px 8px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: 600,
    color: "#2C2016",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s"
  };

  const activeBtnStyle: React.CSSProperties = {
    ...btnStyle,
    background: "rgba(44,32,22,0.08)",
    border: "1px solid rgba(44,32,22,0.2)"
  };

  return (
    <div className="tiptap-editor-wrapper" style={{ display: "flex", flexDirection: "column", border: "1px solid rgba(44,32,22,0.12)", borderRadius: 10, background: "white", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: "6px", padding: "6px 8px", background: "rgba(44,32,22,0.03)", borderBottom: "1px solid rgba(44,32,22,0.08)", flexWrap: "wrap" }}>
        <button 
          tabIndex={-1} title="Bold" 
          style={editor.isActive('bold') ? activeBtnStyle : btnStyle} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
        >B</button>
        <button 
          tabIndex={-1} title="Italic" 
          style={{...(editor.isActive('italic') ? activeBtnStyle : btnStyle), fontStyle: "italic"}} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
        >I</button>
        <button 
          tabIndex={-1} title="Underline" 
          style={{...(editor.isActive('underline') ? activeBtnStyle : btnStyle), textDecoration: "underline"}} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
        >U</button>
        <div style={{ width: "1px", background: "rgba(44,32,22,0.1)", margin: "0 4px" }} />
        <button 
          tabIndex={-1} title="Headline (H1)" 
          style={editor.isActive('heading', { level: 1 }) ? activeBtnStyle : btnStyle} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }}
        >H1</button>
        <button 
          tabIndex={-1} title="Sub Headline (H2)" 
          style={editor.isActive('heading', { level: 2 }) ? activeBtnStyle : btnStyle} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
        >H2</button>
        <button 
          tabIndex={-1} title="Body Text" 
          style={!editor.isActive('heading') ? activeBtnStyle : btnStyle} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().setParagraph().run(); }}
        >Txt</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
});
