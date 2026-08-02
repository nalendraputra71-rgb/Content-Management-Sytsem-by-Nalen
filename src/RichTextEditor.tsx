import { Tooltip } from "./components/Tooltip";
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Heading1, 
  Heading2, 
  Pilcrow, 
  Undo, 
  Redo, 
  List, 
  ListOrdered, 
  Quote, 
  Eraser,
  Heading
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minRows?: number;
  inputRef?: React.RefObject<any>;
  readOnly?: boolean;
}

export const RichTextEditor = React.forwardRef(({ value, onChange, placeholder, minRows = 4, inputRef, readOnly = false }: RichTextEditorProps, ref) => {
  const timeoutRef = useRef<any>(null);
  const editor = useEditor({
    editable: !readOnly,
    extensions: [
      StarterKit,
      Underline,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onChange(editor.getHTML());
      }, 500);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-prose focus:outline-none min-h-[100px] w-full max-w-full text-[13px] leading-relaxed break-words [overflow-wrap:anywhere]',
        style: `min-height: ${minRows * 20}px; padding: 12px; overflow-wrap: anywhere; word-break: break-word; max-width: 100%;`
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [editor, readOnly]);

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

  // Gmail formatting style
  const btnStyle = (active: boolean): React.CSSProperties => ({
    background: active ? "rgba(37, 99, 235, 0.08)" : "transparent",
    border: "none",
    borderRadius: "100px",
    width: "30px",
    height: "30px",
    cursor: "pointer",
    color: active ? "#1D4ED8" : "#4B5563",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease",
    padding: 0
  });

  const dividerStyle: React.CSSProperties = {
    width: "1px",
    height: "18px",
    background: "rgba(0,0,0,0.1)",
    margin: "0 4px",
    alignSelf: "center"
  };

  return (
    <div className="tiptap-editor-wrapper" style={{ display: "flex", flexDirection: "column", border: "1px solid rgba(44,32,22,0.12)", borderRadius: 12, background: "white", overflow: "hidden", transition: "border-color 0.2s", width: "100%", maxWidth: "100%" }}>
      {/* Editor Content on TOP */}
      <div className="editor-content-scroll" style={{ overflowY: "auto", flex: 1, width: "100%", maxWidth: "100%", overflowWrap: "anywhere", wordBreak: "break-word" }}>
        <EditorContent editor={editor} />
      </div>

      {/* Gmail-Style Toolbar underneath on BOTTOM */}
      {!readOnly && (
      <div 
        className="editor-toolbar-gmail" 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "2px", 
          padding: "6px 12px", 
          background: "#F5F8FC", // Beautiful light-blue gray tint matching Gmail composer footer
          borderTop: "1px solid rgba(44,32,22,0.08)", 
          flexWrap: "wrap",
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10
        }}
      >
        {/* Undo / Redo group */}
        <Tooltip text="Batal (Undo)" position="bottom"><button tabIndex={-1}  
          style={btnStyle(false)} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <Undo size={14} />
        </button></Tooltip>
        <Tooltip text="Ulangi (Redo)" position="bottom"><button tabIndex={-1}  
          style={btnStyle(false)} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <Redo size={14} />
        </button></Tooltip>

        <div style={dividerStyle} />

        {/* Text Presets */}
        <Tooltip text="Paragraph Text" position="bottom"><button tabIndex={-1}  
          style={btnStyle(!editor.isActive('heading'))} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().setParagraph().run(); }}
          onMouseEnter={(e) => { if (!editor.isActive('heading')) return; e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { if (!editor.isActive('heading')) return; e.currentTarget.style.background = "transparent"; }}
        >
          <Pilcrow size={14} />
        </button></Tooltip>
        <Tooltip text="Judul Utama (H1)" position="bottom"><button tabIndex={-1}  
          style={btnStyle(editor.isActive('heading', { level: 1 }))} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }}
          onMouseEnter={(e) => { if (editor.isActive('heading', { level: 1 })) return; e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { if (editor.isActive('heading', { level: 1 })) return; e.currentTarget.style.background = "transparent"; }}
        >
          <Heading1 size={14} />
        </button></Tooltip>
        <Tooltip text="Sub-judul (H2)" position="bottom"><button tabIndex={-1}  
          style={btnStyle(editor.isActive('heading', { level: 2 }))} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
          onMouseEnter={(e) => { if (editor.isActive('heading', { level: 2 })) return; e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { if (editor.isActive('heading', { level: 2 })) return; e.currentTarget.style.background = "transparent"; }}
        >
          <Heading2 size={14} />
        </button></Tooltip>

        <div style={dividerStyle} />

        {/* Bold / Italic / Underline */}
        <Tooltip text="Tebal (Bold)" position="bottom"><button tabIndex={-1}  
          style={btnStyle(editor.isActive('bold'))} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
          onMouseEnter={(e) => { if (editor.isActive('bold')) return; e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { if (editor.isActive('bold')) return; e.currentTarget.style.background = "transparent"; }}
        >
          <Bold size={14} />
        </button></Tooltip>
        <Tooltip text="Miring (Italic)" position="bottom"><button tabIndex={-1}  
          style={btnStyle(editor.isActive('italic'))} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
          onMouseEnter={(e) => { if (editor.isActive('italic')) return; e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { if (editor.isActive('italic')) return; e.currentTarget.style.background = "transparent"; }}
        >
          <Italic size={14} />
        </button></Tooltip>
        <Tooltip text="Garis Bawah (Underline)" position="bottom"><button tabIndex={-1}  
          style={btnStyle(editor.isActive('underline'))} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
          onMouseEnter={(e) => { if (editor.isActive('underline')) return; e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { if (editor.isActive('underline')) return; e.currentTarget.style.background = "transparent"; }}
        >
          <UnderlineIcon size={14} />
        </button></Tooltip>

        <div style={dividerStyle} />

        {/* Lists & Quotes */}
        <Tooltip text="Daftar Bulat (Bullet List)" position="bottom"><button tabIndex={-1}  
          style={btnStyle(editor.isActive('bulletList'))} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
          onMouseEnter={(e) => { if (editor.isActive('bulletList')) return; e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { if (editor.isActive('bulletList')) return; e.currentTarget.style.background = "transparent"; }}
        >
          <List size={14} />
        </button></Tooltip>
        <Tooltip text="Daftar Angka (Ordered List)" position="bottom"><button tabIndex={-1}  
          style={btnStyle(editor.isActive('orderedList'))} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
          onMouseEnter={(e) => { if (editor.isActive('orderedList')) return; e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { if (editor.isActive('orderedList')) return; e.currentTarget.style.background = "transparent"; }}
        >
          <ListOrdered size={14} />
        </button></Tooltip>
        <Tooltip text="Kutipan (Blockquote)" position="bottom"><button tabIndex={-1}  
          style={btnStyle(editor.isActive('blockquote'))} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}
          onMouseEnter={(e) => { if (editor.isActive('blockquote')) return; e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { if (editor.isActive('blockquote')) return; e.currentTarget.style.background = "transparent"; }}
        >
          <Quote size={13} />
        </button></Tooltip>

        <div style={dividerStyle} />

        {/* Clear formatting tool */}
        <Tooltip text="Hapus Format" position="bottom"><button tabIndex={-1}  
          style={btnStyle(false)} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().unsetAllMarks().clearNodes().run(); }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <Eraser size={14} />
        </button></Tooltip>
      </div>
      )}
    </div>
  );
});

