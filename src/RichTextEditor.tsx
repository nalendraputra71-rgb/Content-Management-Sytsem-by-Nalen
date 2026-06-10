import React, { useEffect, useImperativeHandle } from 'react';
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
    <div className="tiptap-editor-wrapper" style={{ display: "flex", flexDirection: "column", border: "1px solid rgba(44,32,22,0.12)", borderRadius: 12, background: "white", overflow: "hidden", transition: "border-color 0.2s" }}>
      {/* Editor Content on TOP */}
      <div className="editor-content-scroll" style={{ overflowY: "auto", flex: 1 }}>
        <EditorContent editor={editor} />
      </div>

      {/* Gmail-Style Toolbar underneath on BOTTOM */}
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
        <button 
          tabIndex={-1} 
          title="Batal (Undo)" 
          style={btnStyle(false)} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <Undo size={14} />
        </button>
        <button 
          tabIndex={-1} 
          title="Ulangi (Redo)" 
          style={btnStyle(false)} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <Redo size={14} />
        </button>

        <div style={dividerStyle} />

        {/* Text Presets */}
        <button 
          tabIndex={-1} 
          title="Paragraph Text" 
          style={btnStyle(!editor.isActive('heading'))} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().setParagraph().run(); }}
          onMouseEnter={(e) => { if (!editor.isActive('heading')) return; e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { if (!editor.isActive('heading')) return; e.currentTarget.style.background = "transparent"; }}
        >
          <Pilcrow size={14} />
        </button>
        <button 
          tabIndex={-1} 
          title="Judul Utama (H1)" 
          style={btnStyle(editor.isActive('heading', { level: 1 }))} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }}
          onMouseEnter={(e) => { if (editor.isActive('heading', { level: 1 })) return; e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { if (editor.isActive('heading', { level: 1 })) return; e.currentTarget.style.background = "transparent"; }}
        >
          <Heading1 size={14} />
        </button>
        <button 
          tabIndex={-1} 
          title="Sub-judul (H2)" 
          style={btnStyle(editor.isActive('heading', { level: 2 }))} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
          onMouseEnter={(e) => { if (editor.isActive('heading', { level: 2 })) return; e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { if (editor.isActive('heading', { level: 2 })) return; e.currentTarget.style.background = "transparent"; }}
        >
          <Heading2 size={14} />
        </button>

        <div style={dividerStyle} />

        {/* Bold / Italic / Underline */}
        <button 
          tabIndex={-1} 
          title="Tebal (Bold)" 
          style={btnStyle(editor.isActive('bold'))} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
          onMouseEnter={(e) => { if (editor.isActive('bold')) return; e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { if (editor.isActive('bold')) return; e.currentTarget.style.background = "transparent"; }}
        >
          <Bold size={14} />
        </button>
        <button 
          tabIndex={-1} 
          title="Miring (Italic)" 
          style={btnStyle(editor.isActive('italic'))} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
          onMouseEnter={(e) => { if (editor.isActive('italic')) return; e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { if (editor.isActive('italic')) return; e.currentTarget.style.background = "transparent"; }}
        >
          <Italic size={14} />
        </button>
        <button 
          tabIndex={-1} 
          title="Garis Bawah (Underline)" 
          style={btnStyle(editor.isActive('underline'))} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
          onMouseEnter={(e) => { if (editor.isActive('underline')) return; e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { if (editor.isActive('underline')) return; e.currentTarget.style.background = "transparent"; }}
        >
          <UnderlineIcon size={14} />
        </button>

        <div style={dividerStyle} />

        {/* Lists & Quotes */}
        <button 
          tabIndex={-1} 
          title="Daftar Bulat (Bullet List)" 
          style={btnStyle(editor.isActive('bulletList'))} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
          onMouseEnter={(e) => { if (editor.isActive('bulletList')) return; e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { if (editor.isActive('bulletList')) return; e.currentTarget.style.background = "transparent"; }}
        >
          <List size={14} />
        </button>
        <button 
          tabIndex={-1} 
          title="Daftar Angka (Ordered List)" 
          style={btnStyle(editor.isActive('orderedList'))} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
          onMouseEnter={(e) => { if (editor.isActive('orderedList')) return; e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { if (editor.isActive('orderedList')) return; e.currentTarget.style.background = "transparent"; }}
        >
          <ListOrdered size={14} />
        </button>
        <button 
          tabIndex={-1} 
          title="Kutipan (Blockquote)" 
          style={btnStyle(editor.isActive('blockquote'))} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}
          onMouseEnter={(e) => { if (editor.isActive('blockquote')) return; e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { if (editor.isActive('blockquote')) return; e.currentTarget.style.background = "transparent"; }}
        >
          <Quote size={13} />
        </button>

        <div style={dividerStyle} />

        {/* Clear formatting tool */}
        <button 
          tabIndex={-1} 
          title="Hapus Format" 
          style={btnStyle(false)} 
          onClick={(e) => { e.preventDefault(); editor.chain().focus().unsetAllMarks().clearNodes().run(); }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <Eraser size={14} />
        </button>
      </div>
    </div>
  );
});

