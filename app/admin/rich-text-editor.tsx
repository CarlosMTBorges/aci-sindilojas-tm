"use client";

import { useRef, useState, type ClipboardEvent } from "react";
import { sanitizeRichText } from "@/lib/richtext";

const tools = [
  { label: "Negrito", command: "bold", text: "B", className: "rich-toolbar-bold" },
  { label: "Itálico", command: "italic", text: "I", className: "rich-toolbar-italic" },
  { label: "Sublinhado", command: "underline", text: "U", className: "rich-toolbar-underline" },
  { label: "Lista com marcadores", command: "insertUnorderedList", text: "• Lista" },
  { label: "Lista numerada", command: "insertOrderedList", text: "1. Lista" },
  { label: "Alinhar à esquerda", command: "justifyLeft", text: "⇤" },
  { label: "Centralizar", command: "justifyCenter", text: "↔" },
  { label: "Alinhar à direita", command: "justifyRight", text: "⇥" },
  { label: "Justificar", command: "justifyFull", text: "☰" },
];

export function RichTextEditor({ name, initialHtml }: { name: string; initialHtml: string }) {
  const editor = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(sanitizeRichText(initialHtml));
  function format(command: string) {
    editor.current?.focus();
    document.execCommand(command, false);
    setHtml(editor.current?.innerHTML || "");
  }
  function paste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const html = event.clipboardData.getData("text/html");
    const plain = event.clipboardData.getData("text/plain");
    document.execCommand("insertHTML", false, html ? sanitizeRichText(html) : plain.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!));
    setHtml(sanitizeRichText(editor.current?.innerHTML || ""));
  }
  return <div className="rich-editor">
    <div className="rich-editor-toolbar" role="toolbar" aria-label="Formatação do texto">
      {tools.map((tool) => <button key={tool.command} type="button" title={tool.label} aria-label={tool.label} className={tool.className} onMouseDown={(event) => event.preventDefault()} onClick={() => format(tool.command)}>{tool.text}</button>)}
    </div>
    <div ref={editor} className="rich-editor-area" contentEditable suppressContentEditableWarning dir="ltr" role="textbox" aria-multiline="true" aria-label="Corpo da notícia" onPaste={paste} onInput={(event) => setHtml(sanitizeRichText(event.currentTarget.innerHTML))} dangerouslySetInnerHTML={{ __html: html || "<p><br></p>" }} />
    <input type="hidden" name={name} value={html} />
    <small>Formate os parágrafos usando a barra acima. Também é possível colar texto no campo.</small>
  </div>;
}
