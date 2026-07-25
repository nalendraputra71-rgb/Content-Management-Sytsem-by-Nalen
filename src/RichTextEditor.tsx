import { Tooltip } from "./components/Tooltip";
import React, { useEffect, useImperativeHandle, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
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
  Check,
  Pencil
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minRows?: number;
  inputRef?: React.RefObject<any>;
  editable?: boolean;
  readOnly?: boolean;
}

const DEFAULT_COLORS = [
  '#111827', // Hitam Utama
  '#2563eb', // Biru Hubify
  '#16a34a', // Hijau
  '#dc2626', // Merah
  '#d97706', // Oranye
  '#9333ea', // Ungu
  '#db2777', // Pink
  '#6b7280', // Abu Muted
];

const isDarkColor = (hex: string) => {
  if (!hex || !hex.startsWith('#')) return true;
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 150;
};

export const RichTextEditor = React.forwardRef(({ value, onChange, placeholder, minRows = 4, inputRef, editable = true, readOnly = false }: RichTextEditorProps, ref) => {
  const isEditable = editable !== false && !readOnly;
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColors, setCustomColors] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hubify_editor_custom_colors');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 8) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_COLORS;
  });

  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Sync state with localstorage across tabs or multiple editor instances
  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const saved = localStorage.getItem('hubify_editor_custom_colors');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length === 8) {
            setCustomColors(parsed);
          }
        }
      } catch (e) {}
    };
    window.addEventListener('hubify_colors_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('hubify_colors_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const updateSlotColor = (index: number, newColor: string) => {
    const updated = [...customColors];
    updated[index] = newColor;
    setCustomColors(updated);
    try {
      localStorage.setItem('hubify_editor_custom_colors', JSON.stringify(updated));
      window.dispatchEvent(new Event('hubify_colors_updated'));
    } catch (e) {
      console.error(e);
    }
    editor?.chain().focus().setColor(newColor).run();
  };

  const resetToDefaultColors = () => {
    setCustomColors(DEFAULT_COLORS);
    try {
      localStorage.setItem('hubify_editor_custom_colors', JSON.stringify(DEFAULT_COLORS));
      window.dispatchEvent(new Event('hubify_colors_updated'));
    } catch (e) {}
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
    ],
    content: value,
    editable: isEditable,
    onUpdate: ({ editor }) => {
      if (isEditable) {
        onChange(editor.getHTML());
      }
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
      editor.setEditable(isEditable);
    }
  }, [isEditable, editor]);

  // Close color picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    };
    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

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

  const activeColor = editor.getAttributes('textStyle').color || '#111827';

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
    <div className="tiptap-editor-wrapper" style={{ display: "flex", flexDirection: "column", border: "1px solid rgba(44,32,22,0.12)", borderRadius: 12, background: "white", overflow: "visible", position: "relative", transition: "border-color 0.2s", width: "100%", maxWidth: "100%" }}>
      {/* Editor Content on TOP */}
      <div className="editor-content-scroll" style={{ overflowY: "auto", flex: 1, width: "100%", maxWidth: "100%", overflowWrap: "anywhere", wordBreak: "break-word", borderRadius: 12 }}>
        <EditorContent editor={editor} />
      </div>

      {/* Gmail-Style Toolbar underneath on BOTTOM */}
      {isEditable && (
      <div 
        className="editor-toolbar-gmail" 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "2px", 
          padding: "6px 12px", 
          background: "#F5F8FC", // Light-blue gray tint matching Gmail composer footer
          borderTop: "1px solid rgba(44,32,22,0.08)", 
          flexWrap: "wrap",
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          position: "relative",
          zIndex: 20
        }}
      >
        {/* Undo / Redo group */}
        <Tooltip text="Batal (Undo)" position="bottom"><button tabIndex={-1} type="button" 
          disabled={!editor.can().undo()}
          style={btnStyle(false)} 
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <Undo size={14} />
        </button></Tooltip>
        <Tooltip text="Ulangi (Redo)" position="bottom"><button tabIndex={-1} type="button" 
          disabled={!editor.can().redo()}
          style={btnStyle(false)} 
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <Redo size={14} />
        </button></Tooltip>

        <div style={dividerStyle} />

        {/* Text Presets */}
        <Tooltip text="Paragraph Text" position="bottom"><button tabIndex={-1} type="button" 
          style={btnStyle(!editor.isActive('heading') && !editor.isActive('bulletList') && !editor.isActive('orderedList') && !editor.isActive('blockquote'))} 
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => { e.preventDefault(); editor.chain().focus().setParagraph().run(); }}
          onMouseEnter={(e) => { if (!editor.isActive('heading')) e.currentTarget.style.background = "rgba(0,0,0,0.06)"; }}
          onMouseLeave={(e) => { if (!editor.isActive('heading')) e.currentTarget.style.background = "transparent"; }}
        >
          <Pilcrow size={14} />
        </button></Tooltip>
        <Tooltip text="Judul Utama (H1)" position="bottom"><button tabIndex={-1} type="button" 
          style={btnStyle(editor.isActive('heading', { level: 1 }))} 
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }}
          onMouseEnter={(e) => { if (!editor.isActive('heading', { level: 1 })) e.currentTarget.style.background = "rgba(0,0,0,0.06)"; }}
          onMouseLeave={(e) => { if (!editor.isActive('heading', { level: 1 })) e.currentTarget.style.background = "transparent"; }}
        >
          <Heading1 size={14} />
        </button></Tooltip>
        <Tooltip text="Sub-judul (H2)" position="bottom"><button tabIndex={-1} type="button" 
          style={btnStyle(editor.isActive('heading', { level: 2 }))} 
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
          onMouseEnter={(e) => { if (!editor.isActive('heading', { level: 2 })) e.currentTarget.style.background = "rgba(0,0,0,0.06)"; }}
          onMouseLeave={(e) => { if (!editor.isActive('heading', { level: 2 })) e.currentTarget.style.background = "transparent"; }}
        >
          <Heading2 size={14} />
        </button></Tooltip>

        <div style={dividerStyle} />

        {/* Bold / Italic / Underline */}
        <Tooltip text="Tebal (Bold)" position="bottom"><button tabIndex={-1} type="button" 
          style={btnStyle(editor.isActive('bold'))} 
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
          onMouseEnter={(e) => { if (!editor.isActive('bold')) e.currentTarget.style.background = "rgba(0,0,0,0.06)"; }}
          onMouseLeave={(e) => { if (!editor.isActive('bold')) e.currentTarget.style.background = "transparent"; }}
        >
          <Bold size={14} />
        </button></Tooltip>
        <Tooltip text="Miring (Italic)" position="bottom"><button tabIndex={-1} type="button" 
          style={btnStyle(editor.isActive('italic'))} 
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
          onMouseEnter={(e) => { if (!editor.isActive('italic')) e.currentTarget.style.background = "rgba(0,0,0,0.06)"; }}
          onMouseLeave={(e) => { if (!editor.isActive('italic')) e.currentTarget.style.background = "transparent"; }}
        >
          <Italic size={14} />
        </button></Tooltip>
        <Tooltip text="Garis Bawah (Underline)" position="bottom"><button tabIndex={-1} type="button" 
          style={btnStyle(editor.isActive('underline'))} 
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
          onMouseEnter={(e) => { if (!editor.isActive('underline')) e.currentTarget.style.background = "rgba(0,0,0,0.06)"; }}
          onMouseLeave={(e) => { if (!editor.isActive('underline')) e.currentTarget.style.background = "transparent"; }}
        >
          <UnderlineIcon size={14} />
        </button></Tooltip>

        {/* Text Color Picker Popover */}
        <div style={{ position: 'relative' }} ref={colorPickerRef}>
          <Tooltip text="Warna Teks" position="bottom">
            <button 
              tabIndex={-1} 
              type="button"
              style={{
                ...btnStyle(showColorPicker || !!editor.getAttributes('textStyle').color),
                flexDirection: 'column',
                gap: '2px'
              }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.preventDefault();
                setShowColorPicker(!showColorPicker);
              }}
              onMouseEnter={(e) => { if (!showColorPicker) e.currentTarget.style.background = "rgba(0,0,0,0.06)"; }}
              onMouseLeave={(e) => { if (!showColorPicker) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: '12px', fontWeight: 800, lineHeight: 1, color: activeColor }}>A</span>
              <div style={{ width: '12px', height: '2px', borderRadius: '1px', background: activeColor }} />
            </button>
          </Tooltip>

          {showColorPicker && (
            <div 
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 6px)',
                left: '0',
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '10px',
                boxShadow: '0 12px 32px -4px rgba(0,0,0,0.2), 0 4px 12px -2px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0,0,0,0.12)',
                zIndex: 9999,
                width: '180px'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {customColors.map((colorHex, idx) => {
                  const isSelected = activeColor.toLowerCase() === colorHex.toLowerCase();
                  return (
                    <div key={idx} style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                      {/* Main Swatch Button */}
                      <button
                        type="button"
                        title={`Pilih warna (${colorHex})`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.preventDefault();
                          editor.chain().focus().setColor(colorHex).run();
                          setShowColorPicker(false);
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: colorHex,
                          border: isSelected ? '2px solid #2563eb' : '1px solid rgba(0,0,0,0.15)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'transform 0.1s ease',
                          padding: 0
                        }}
                        className="hover:scale-105"
                      >
                        {isSelected && <Check size={12} color={isDarkColor(colorHex) ? '#FFFFFF' : '#000000'} />}
                      </button>

                      {/* Pencil Edit Icon for customizing this specific slot */}
                      <label
                        title="Edit warna slot ini"
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-3px',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: '#FFFFFF',
                          border: '1px solid rgba(0,0,0,0.18)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          zIndex: 5
                        }}
                        className="hover:bg-blue-50 hover:scale-110"
                      >
                        <Pencil size={8} color="#374151" />
                        <input
                          type="color"
                          value={colorHex && /^#[0-9A-F]{6}$/i.test(colorHex) ? colorHex : '#111827'}
                          onInput={(e: any) => updateSlotColor(idx, e.target.value)}
                          onChange={(e) => updateSlotColor(idx, e.target.value)}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 0,
                            cursor: 'pointer',
                            width: '100%',
                            height: '100%'
                          }}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={dividerStyle} />

        {/* Lists & Quotes */}
        <Tooltip text="Daftar Bulat (Bullet List)" position="bottom"><button tabIndex={-1} type="button" 
          style={btnStyle(editor.isActive('bulletList'))} 
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
          onMouseEnter={(e) => { if (!editor.isActive('bulletList')) e.currentTarget.style.background = "rgba(0,0,0,0.06)"; }}
          onMouseLeave={(e) => { if (!editor.isActive('bulletList')) e.currentTarget.style.background = "transparent"; }}
        >
          <List size={14} />
        </button></Tooltip>
        <Tooltip text="Daftar Angka (Ordered List)" position="bottom"><button tabIndex={-1} type="button" 
          style={btnStyle(editor.isActive('orderedList'))} 
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
          onMouseEnter={(e) => { if (!editor.isActive('orderedList')) e.currentTarget.style.background = "rgba(0,0,0,0.06)"; }}
          onMouseLeave={(e) => { if (!editor.isActive('orderedList')) e.currentTarget.style.background = "transparent"; }}
        >
          <ListOrdered size={14} />
        </button></Tooltip>
        <Tooltip text="Kutipan (Blockquote)" position="bottom"><button tabIndex={-1} type="button" 
          style={btnStyle(editor.isActive('blockquote'))} 
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}
          onMouseEnter={(e) => { if (!editor.isActive('blockquote')) e.currentTarget.style.background = "rgba(0,0,0,0.06)"; }}
          onMouseLeave={(e) => { if (!editor.isActive('blockquote')) e.currentTarget.style.background = "transparent"; }}
        >
          <Quote size={13} />
        </button></Tooltip>

        <div style={dividerStyle} />

        {/* Clear formatting tool */}
        <Tooltip text="Hapus Format" position="bottom"><button tabIndex={-1} type="button" 
          style={btnStyle(false)} 
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => { e.preventDefault(); editor.chain().focus().unsetAllMarks().clearNodes().unsetColor().run(); }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <Eraser size={14} />
        </button></Tooltip>
      </div>
      )}
    </div>
  );
});
