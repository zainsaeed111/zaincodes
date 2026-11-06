"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";
import { adminFetch } from "@/lib/admin-client";
import { sanitizeBlogHtml } from "@/lib/blog/sanitize";

type Props = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
};

export function BlogEditor({ value, onChange, disabled }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder: "Paste from ChatGPT or write your article…" }),
    ],
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "blog-tiptap-editor",
      },
      transformPastedHTML(html) {
        return sanitizeBlogHtml(html);
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(sanitizeBlogHtml(ed.getHTML()));
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (sanitizeBlogHtml(value || "") !== sanitizeBlogHtml(current)) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  async function uploadInlineImage(file: File) {
    if (!editor) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("kind", "blog");
      body.append("file", file);
      const { res, data } = await adminFetch("/api/admin/uploads", { method: "POST", body });
      if (!res.ok) {
        window.alert(data.error?.message || "Image upload failed");
        return;
      }
      const alt = window.prompt("Alt text for accessibility") || file.name;
      editor.chain().focus().setImage({ src: data.uploaded.url, alt }).run();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (!editor) return <div className="blog-tiptap-shell muted">Loading editor…</div>;

  return (
    <div className="blog-tiptap-shell">
      <div className="blog-tiptap-toolbar" role="toolbar" aria-label="Formatting">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "active" : ""}>
          Bold
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? "active" : ""}>
          Italic
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive("underline") ? "active" : ""}>
          Underline
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive("heading", { level: 2 }) ? "active" : ""}>
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive("heading", { level: 3 }) ? "active" : ""}>
          H3
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          List
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          Numbered
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          Quote
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          Code
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Link URL");
            if (!url) return;
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
        >
          Link
        </button>
        <button type="button" disabled={disabled || uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? "Uploading…" : "Image"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void uploadInlineImage(f);
          }}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
